import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const result = registerUser(name, email, password);
    if (!result) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }

    return NextResponse.json({ success: true, token: result.token, user: result.user });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
