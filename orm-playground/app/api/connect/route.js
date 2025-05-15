import { getTableSchema } from "@/lib/db";
import { initORM } from "@/lib/orm";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { connectionUrl } = await request.json();
    
    if (!connectionUrl) {
      return NextResponse.json(
        { error: 'Connection URL is required' },
        { status: 400 }
      );
    }

    // Add SSL configuration to the connection URL
    const sslConnectionUrl = connectionUrl.includes('?') 
      ? `${connectionUrl}&sslmode=disable`
      : `${connectionUrl}?sslmode=disable`;

    const models = await initORM(sslConnectionUrl);
    const tables = Object.keys(models);
    const schemas = {};
    
    for (const table of tables) {
      schemas[table] = await getTableSchema(table);
    }
    
    return NextResponse.json({ tables, schemas });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}