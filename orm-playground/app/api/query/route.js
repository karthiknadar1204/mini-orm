import { Model } from "@/lib/orm";
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { table, operation, data, id } = await request.json();
    console.log("table", table);
    console.log("operation", operation);
    console.log("data", data);
    console.log("id", id);
    
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
    console.log("model", model);
    let result;

    switch (operation) {
      case 'findAll':
        result = await model.findAll();
        console.log("result", result);
        break;
      case 'findById':
        if (!id) {
          return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
          );
        }
        result = await model.findById(id);
        console.log("result", result);
        break;
      case 'create':
        if (!data) {
          return NextResponse.json(
            { error: 'Data is required' },
            { status: 400 }
          );
        }
        result = await model.create(data);
        console.log("result", result);
        break;
      case 'update':
        if (!id || !data) {
          return NextResponse.json(
            { error: 'ID and data are required' },
            { status: 400 }
          );
        }
        result = await model.update(id, data);
        console.log("result", result);
        break;
      case 'delete':
        if (!id) {
          return NextResponse.json(
            { error: 'ID is required' },
            { status: 400 }
          );
        }
        result = await model.delete(id);
        console.log("result", result);
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