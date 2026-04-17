import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { ensureSchema } from '@/lib/init-db';

const EMOJIS = ['🎬', '🌟', '🎭', '🔥', '💎', '🎯', '🚀', '❤️', '👁️', '🏆', '🌙', '⚡'];

export async function GET(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const lists = await sql`
      SELECT l.*, COUNT(li.id)::int as item_count
      FROM lists l
      LEFT JOIN list_items li ON l.id = li.list_id
      WHERE l.user_id = ${user.id}
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `;

    const listsWithItems = await Promise.all(lists.map(async (list) => {
      const items = await sql`
        SELECT m.id, m.title, m.year, m.poster_url, m.type
        FROM list_items li JOIN movies m ON m.id = li.movie_id
        WHERE li.list_id = ${list.id}
        ORDER BY li.added_at DESC LIMIT 4
      `;
      return { ...list, preview_items: items };
    }));

    return NextResponse.json({ lists: listsWithItems });
  } catch (error) {
    console.error('Get lists error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { name, description, emoji } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'List name required' }, { status: 400 });

    const assignedEmoji = emoji || EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    const list = await sql`
      INSERT INTO lists (user_id, name, description, emoji)
      VALUES (${user.id}, ${name.trim()}, ${description || null}, ${assignedEmoji})
      RETURNING *
    `;

    return NextResponse.json({ list: list[0] });
  } catch (error) {
    console.error('Create list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  await ensureSchema();
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = getUserFromToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    if (!listId) return NextResponse.json({ error: 'listId required' }, { status: 400 });

    await sql`DELETE FROM lists WHERE id = ${listId} AND user_id = ${user.id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
