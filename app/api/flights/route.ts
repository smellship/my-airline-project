import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  // 1. 从 URL 提取查询参数
  // 示例 URL: /api/flights?orig=NZNE&dest=YSSY&date=2026-05-29
  const { searchParams } = new URL(request.url);
  const orig = searchParams.get('orig');
  const dest = searchParams.get('dest');
  const date = searchParams.get('date');

  try {
    const client = await clientPromise;
    const db = client.db();

    // 2. 构建 MongoDB 查询对象
    const query: any = {};
    
    // 只有当参数存在时才加入查询条件，这样可以支持“只查始发地”等灵活搜索
    if (orig) query.origin = orig;
    if (dest) query.destination = dest;
    if (date) query.departureDate = date;

    // 3. 执行查询
    // 我们按照起飞时间 (departureTime) 从早到晚排序
    const flights = await db.collection('schedules')
      .find(query)
      .sort({ departureTime: 1 })
      .toArray();

    // 4. 返回 JSON 结果
    return NextResponse.json(flights);
  } catch (e: any) {
    console.error("Database query error:", e);
    return NextResponse.json(
      { error: "Failed to fetch flights", details: e.message },
      { status: 500 }
    );
  }
}