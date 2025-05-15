import { Model } from "@/lib/orm";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { table, operation, data, id } = await request.json();
    
    if (!table || !operation) {
      return NextResponse.json(
        { error: 'Table and operation are required' },
        { status: 400 }
      );
    }

    if (!global.pool) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 400 }
      );
    }

    const model = new Model(table);
    let result;

    switch (operation) {
      case 'findAll':
        result = await model.findAll();
        break;
      case 'findById':
        if (!id) {
          return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
          );
        }
        result = await model.findById(id);
        break;
      case 'create':
        if (!data) {
          return NextResponse.json(
            { error: 'Data is required' },
            { status: 400 }
          );
        }
        result = await model.create(data);
        break;
      case 'update':
        if (!id || !data) {
          return NextResponse.json(
            { error: 'ID and data are required' },
            { status: 400 }
          );
        }
        result = await model.update(id, data);
        break;
      case 'delete':
        if (!id) {
          return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
          );
        }
        result = await model.delete(id);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}