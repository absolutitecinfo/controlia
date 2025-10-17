"use client";

import { Home, MessageSquare, Settings, BarChart3, Plus, Trash2, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConversas } from "@/hooks/use-conversas";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = state === "collapsed";
  const isChatPage = pathname === "/dashboard/colaborador";
  
  // Hook para gerenciar permissões
  const permissions = usePermissions();
  
  // Hook para gerenciar conversas reais
  const { conversas, loading: conversasLoading, deleteConversa } = useConversas();

  // Definir itens do menu baseados nas permissões
  const menuItems = [
    { 
      title: "Dashboard", 
      url: "/dashboard", 
      icon: Home, 
      permission: 'canViewDashboard' 
    },
    { 
      title: "Chats", 
      url: "/dashboard/colaborador", 
      icon: MessageSquare, 
      permission: 'canViewChats' 
    },
    { 
      title: "Agentes IA", 
      url: "/dashboard/admin/agentes-ia", 
      icon: Bot, 
      permission: 'canManageAgents' 
    },
    { 
      title: "Configurações", 
      url: "/dashboard/admin", 
      icon: Settings, 
      permission: 'canManageCompany' 
    },
    { 
      title: "Administração", 
      url: "/dashboard/master", 
      icon: BarChart3, 
      permission: 'canAccessMaster' 
    },
  ].filter(item => permissions[item.permission as keyof typeof permissions]);

  const createNewChat = () => {
    // Esta função será chamada quando o usuário clicar em "Nova Conversa" na página de chat
    // O hook useChat já gerencia isso
    toast.info("Navegue para a página de Chats para iniciar uma nova conversa");
  };

  const handleDeleteChat = async (conversationUuid: string) => {
    try {
      await deleteConversa(conversationUuid);
    } catch (error) {
      console.error('Erro ao excluir conversa:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Agora";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return "Ontem";
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  // Mostrar loading enquanto carrega as permissões
  if (permissions.loading) {
    return (
      <Sidebar collapsible="icon">
        <SidebarContent>
          <div className="p-4">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          <div className="px-4 py-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-hero-gradient">
                ControlIA.io
              </h2>
              {permissions.role && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    permissions.role === 'master' 
                      ? 'bg-purple-100 text-purple-800' 
                      : permissions.role === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {permissions.role === 'master' ? '🔑 Master' : 
                     permissions.role === 'admin' ? '👑 Admin' : 
                     '👤 Colaborador'}
                  </span>
                  {permissions.empresaName && (
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      {permissions.empresaName}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {isCollapsed && (
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-lg bg-hero-gradient" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url as any}
                        className={
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat History - só aparece na tela de Agentes */}
        {isChatPage && (
          <SidebarGroup className="flex-1">
            <div className="flex items-center justify-between px-2 py-1">
              <SidebarGroupLabel>Conversas</SidebarGroupLabel>
              {!isCollapsed && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={createNewChat}
                  className="h-6 w-6 p-0 hover:bg-sidebar-accent/50"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
            <SidebarGroupContent>
              <ScrollArea className="h-[calc(100vh-16rem)] sidebar-scrollbar">
                <div className="space-y-1 px-2">
                  {conversasLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-xs text-muted-foreground">Carregando...</div>
                    </div>
                  ) : conversas.length === 0 ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="text-xs text-muted-foreground text-center">
                        Nenhuma conversa ainda
                      </div>
                    </div>
                  ) : (
                    conversas.map((conversa) => (
                      <div
                        key={conversa.uuid}
                        className="group relative flex items-center gap-2 rounded-md p-2 text-sm hover:bg-sidebar-accent/50 transition-smooth cursor-pointer"
                        onClick={() => {
                          // Navegar para a conversa específica
                          window.location.href = `/dashboard/colaborador?conversation=${conversa.uuid}`;
                        }}
                      >
                        <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{conversa.titulo}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {conversa.agente.nome}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTimestamp(conversa.updated_at)}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChat(conversa.uuid);
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
