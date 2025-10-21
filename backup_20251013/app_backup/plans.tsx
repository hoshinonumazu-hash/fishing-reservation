
import dynamic from 'next/dynamic';
const BoatSearch = dynamic(() => import('../components/BoatSearch'), { ssr: false });

export default function Plans() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 32 }}>
      <h1>釣り船ホームページ検索</h1>
      <BoatSearch />
      {/* ...他の内容があればここに... */}
    </div>
  );
}
