import { getRequestContext } from '@cloudflare/next-on-pages'
import Link from 'next/link';

export const runtime = "edge";

export default async function List() {
  const db = getRequestContext().env.MY_DB
  const stmt = db.prepare("SELECT * FROM Todo");
  const { results } = await stmt.all();
  return (
    <div style={{ width: '50%'}}>
      <h2>This is list</h2>
      <ul>
        {results.map((result) => (
          <li key={result.id}><Link style={{color: 'blue'}} result={result} href={result.id.toString()}>{result.title}</Link></li>
        ))}
      </ul>
    </div>
  );
}
