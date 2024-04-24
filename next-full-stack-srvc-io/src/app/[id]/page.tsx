import { getRequestContext } from '@cloudflare/next-on-pages'
import List from '../list';

export const runtime = "edge";

export default async function Item({ params }) {
  const db = getRequestContext().env.MY_DB
  const stmt = db.prepare("SELECT * FROM Todo WHERE id = " + params.id);
  const { results } = await stmt.all();

  return (
    <div style={{ display: 'flex', flexDirection: 'row'}}>
      <List />
      <div style={{ width: '50%'}}>
      <h2>This is item</h2>
        {results[0].title}
      </div>
    </div>
  );
}
