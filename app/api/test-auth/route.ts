import { NextResponse } from 'next/server';
import { requireMaster } from '@/lib/auth/authorization';

export async function GET() {
  try {
    console.log('Test auth endpoint called');
    const result = await requireMaster();
    console.log('Auth result:', result);
    
    return NextResponse.json({
      message: 'Auth successful',
      user: result.user.id,
      role: result.profile.role
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
}
