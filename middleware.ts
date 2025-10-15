import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/pricing',
    '/api/stripe/webhook'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith('/api/stripe/webhook')
  );

  // If trying to access protected route without Supabase configured, redirect to login
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If authenticated and trying to access login/register
  if (user && (request.nextUrl.pathname === '/auth/login' || request.nextUrl.pathname === '/auth/register')) {
    // Get user profile to redirect correctly
    const { data: profile } = await supabase
      .from('perfis')
      .select(`
        role, 
        status, 
        empresa_id,
        empresas!inner(status)
      `)
      .eq('id', user.id)
      .single();

    if (profile?.status !== 'ativo') {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/auth/login?error=account_suspended', request.url));
    }

    // Temporariamente comentado para testar
    // if (profile?.empresas?.status !== 'ativo') {
    //   await supabase.auth.signOut();
    //   return NextResponse.redirect(new URL('/auth/login?error=company_suspended', request.url));
    // }

    // Redirect based on role
    if (profile?.role === 'master') {
      return NextResponse.redirect(new URL('/dashboard/master', request.url));
    } else if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard/colaborador', request.url));
    }
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from('perfis')
      .select(`
        role, 
        status, 
        empresa_id,
        empresas!inner(status)
      `)
      .eq('id', user.id)
      .single();

    // Check if user is active
    if (profile?.status !== 'ativo') {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/auth/login?error=account_suspended', request.url));
    }

    // Check if company is active - temporariamente comentado para testar
    // if (profile?.empresas?.status !== 'ativo') {
    //   await supabase.auth.signOut();
    //   return NextResponse.redirect(new URL('/auth/login?error=company_suspended', request.url));
    // }

    // Master-only routes
    if (request.nextUrl.pathname.startsWith('/dashboard/master') && profile?.role !== 'master') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Admin-only routes (admin or master)
    if (request.nextUrl.pathname.startsWith('/dashboard/admin') && !['admin', 'master'].includes(profile?.role || '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // API route protection
    if (request.nextUrl.pathname.startsWith('/api/admin/')) {
      if (profile?.role !== 'master') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    if (request.nextUrl.pathname.startsWith('/api/agentes/')) {
      if (!['admin', 'master'].includes(profile?.role || '')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
