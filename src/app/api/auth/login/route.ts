import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    const result = authenticateUser(email, password);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, token: result.token, user: result.user });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
