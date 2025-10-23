import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/authorization';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { routeToLLM, validateApiKey } from '@/lib/llm/llm-router';
import { trackMessageUsage } from '@/lib/limits/track-usage';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { user, profile } = await requireUser();
    
    // 2. Parse request body
    const body = await req.json();
    const { 
      message, 
      conversationUuid, 
      agenteId,
      isNewConversation = false 
    } = body;

    if (!message || !agenteId) {
      return NextResponse.json(
        { error: 'Mensagem e agente são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 3. Get empresa and validate API key
    const { data: empresa } = await supabase
      .from('empresas')
      .select('chave_api_llm, contexto_ia, status, plano_id')
      .eq('id', profile.empresa_id)
      .single();

    if (!empresa) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    if (empresa.status !== 'ativo') {
      return NextResponse.json(
        { error: 'Empresa suspensa' },
        { status: 403 }
      );
    }

    if (!empresa.chave_api_llm) {
      return NextResponse.json(
        { error: 'Chave API não configurada. Configure no painel administrativo.' },
        { status: 400 }
      );
    }

    // 4. Validate API key
    const keyValidation = validateApiKey(empresa.chave_api_llm);
    if (!keyValidation.valid) {
      return NextResponse.json(
        { error: keyValidation.error },
        { status: 400 }
      );
    }

    // 5. Get agente
    const { data: agente } = await supabase
      .from('agentes_ia')
      .select('*')
      .eq('id', agenteId)
      .eq('empresa_id', profile.empresa_id)
      .eq('is_active', true)
      .single();

    if (!agente) {
      return NextResponse.json(
        { error: 'Agente não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // 6. Check usage limits
    const { data: plano } = await supabase
      .from('planos')
      .select('limite_mensagens_mes')
      .eq('id', empresa.plano_id)
      .single();

    if (plano?.limite_mensagens_mes) {
      const mesAtual = new Date().toISOString().slice(0, 7) + '-01';
      const { data: uso } = await supabase
        .from('uso_recursos')
        .select('mensagens_enviadas')
        .eq('empresa_id', profile.empresa_id)
        .eq('mes_referencia', mesAtual)
        .single();

      if (uso && uso.mensagens_enviadas >= plano.limite_mensagens_mes) {
        return NextResponse.json(
          { error: 'Limite mensal de mensagens atingido. Faça upgrade do seu plano.' },
          { status: 429 }
        );
      }
    }

    // 7. Get or create conversation
    let conversation;
    if (isNewConversation || !conversationUuid) {
      console.log('🆕 Criando nova conversa...');
      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversas')
        .insert({
          user_id: user.id,
          empresa_id: profile.empresa_id,
          agente_id: agenteId,
          titulo: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          mensagens: [],
          status: 'ativa',
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar conversa' },
          { status: 500 }
        );
      }

      console.log('✅ Nova conversa criada:', newConversation);
      conversation = newConversation;
    } else {
      // Get existing conversation
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversas')
        .select('*')
        .eq('conversation_uuid', conversationUuid)
        .eq('user_id', user.id)
        .eq('empresa_id', profile.empresa_id)
        .single();

      if (fetchError || !existingConversation) {
        return NextResponse.json(
          { error: 'Conversa não encontrada' },
          { status: 404 }
        );
      }

      conversation = existingConversation;
    }

    // 8. Prepare messages for LLM
    const messages = [];
    
    // Add system message (empresa context + agente instructions)
    if (empresa.contexto_ia) {
      messages.push({
        role: 'system',
        content: empresa.contexto_ia,
      });
    }
    
    if (agente.instrucoes) {
      messages.push({
        role: 'system',
        content: agente.instrucoes,
      });
    }

    // Add conversation history
    if (conversation.mensagens && conversation.mensagens.length > 0) {
      messages.push(...conversation.mensagens);
    }

    // Add new user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      message_uuid: crypto.randomUUID(),
    };

    messages.push(userMessage);

    // 9. Send to LLM
    const llmResponse = await routeToLLM(empresa.chave_api_llm, messages);

    // 10. Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let assistantContent = '';
        const assistantMessageUuid = crypto.randomUUID();
        
        try {
          // Stream LLM response
          const reader = llmResponse.stream.getReader();
          
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            assistantContent += chunk;
            
            // Send chunk to client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }

          // 11. Save conversation
          const assistantMessage = {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
            message_uuid: assistantMessageUuid,
            llm_request_id: llmResponse.model, // Store model info
          };

          const updatedMessages = [...(conversation.mensagens || []), userMessage, assistantMessage];

          await supabase
            .from('conversas')
            .update({
              mensagens: updatedMessages,
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversation.id);

          // 12. Track usage
          await trackMessageUsage(profile.empresa_id, assistantContent.length);

          // Send completion signal with conversation info
          const completionData = { 
            done: true, 
            conversationUuid: conversation.conversation_uuid,
            isNewConversation: isNewConversation || !conversationUuid
          };
          console.log('📤 Enviando dados de conclusão:', completionData);
          console.log('📤 Conversation UUID:', conversation.conversation_uuid);
          console.log('📤 Is New Conversation:', isNewConversation || !conversationUuid);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Erro no streaming' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
