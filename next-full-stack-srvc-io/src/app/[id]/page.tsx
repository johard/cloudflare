import { getRequestContext } from '@cloudflare/next-on-pages'
import List from '../list';

export const runtime = "edge";

export default async function Item({ params }: { params: { id: string } }) {
  const db = getRequestContext().env.MY_DB
  const stmt = db.prepare("SELECT * FROM Todo WHERE id = " + params.id);
  const all = await stmt.all();
  const results = all.results as { title: string }[];

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <List />
      <div style={{ width: '50%' }}>
        <h2>This is item</h2>
        {results[0].title}
      </div>
    </div>
  );
}
