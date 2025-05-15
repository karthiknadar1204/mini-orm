import { disconnect } from "@/lib/db";
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await disconnect();
    return NextResponse.json({ message: 'Disconnected successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}