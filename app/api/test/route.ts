import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    // 获取数据库实例
    const db = client.db();
    
    // 尝试列出当前数据库中的所有集合名称
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);

    return NextResponse.json({
      status: "Connected!",
      message: "Vercel is successfully talking to MongoDB Atlas",
      databaseName: db.databaseName,
      existingCollections: collectionNames
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({
      status: "Error",
      message: "Failed to connect to MongoDB",
      error: e.message
    }, { status: 500 });
  }
}