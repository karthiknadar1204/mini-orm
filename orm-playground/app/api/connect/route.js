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
    const sslConnectionUrl = connectionUrl;  // Use the connection URL as is, respecting the sslmode parameter

    const models = await initORM(sslConnectionUrl);
    console.log("models from /api/connect endpoint", models);
    // models from /api/connect endpoint {
    //   users: Model { tableName: 'users', columns: null },
    //   votes: Model { tableName: 'votes', columns: null },
    //   posts: Model { tableName: 'posts', columns: null },
    //   alembic_version: Model { tableName: 'alembic_version', columns: null }
    // }
    const tables = Object.keys(models);
    console.log("tables from /api/connect endpoint", tables);

    const schemas = {};
    
    for (const table of tables) {
      schemas[table] = await getTableSchema(table);
    }
    console.log("schemas from /api/connect endpoint", schemas);
    // schemas from /api/connect endpoint {
    //   users: [
    //     { column_name: 'id', data_type: 'integer' },
    //     { column_name: 'email', data_type: 'character varying' },
    //     { column_name: 'password', data_type: 'character varying' },
    //     {
    //       column_name: 'created_at',
    //       data_type: 'timestamp with time zone'
    //     }
    //   ],
    //   votes: [
    //     { column_name: 'post_id', data_type: 'integer' },
    //     { column_name: 'user_id', data_type: 'integer' }
    //   ],
    //   posts: [
    //     { column_name: 'id', data_type: 'integer' },
    //     { column_name: 'title', data_type: 'character varying' },
    //     { column_name: 'content', data_type: 'character varying' },
    //     { column_name: 'published', data_type: 'boolean' },
    //     {
    //       column_name: 'created_at',
    //       data_type: 'timestamp with time zone'
    //     },
    //     { column_name: 'owner_id', data_type: 'integer' },
    //     { column_name: 'content_new', data_type: 'character varying' }
    //   ],
    //   alembic_version: [ { column_name: 'version_num', data_type: 'character varying' } ]
    return NextResponse.json({ tables, schemas });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}