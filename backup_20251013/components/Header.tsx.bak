"use client";

"use client";

import Link from 'next/link';

import { useState } from 'react';import Link from 'next/link';

import dynamic from 'next/dynamic';import { useState } from 'react';

const BoatSearch = dynamic(() => import('./BoatSearch'), { ssr: false });import dynamic from 'next/dynamic';

const BoatSearch = dynamic(() => import('./BoatSearch'), { ssr: false });

export default function Header() {

  const [showSearch, setShowSearch] = useState(false);export default function Header() {

  return (  const [showSearch, setShowSearch] = useState(false);

    <header className="bg-blue-700 text-white py-4 mb-8" style={{ position: 'relative' }}>  return (

      <nav className="container mx-auto flex justify-between items-center px-4">    <header className="bg-blue-700 text-white py-4 mb-8" style={{ position: 'relative' }}>

        <div className="text-xl font-bold">      <nav className="container mx-auto flex justify-between items-center px-4">

          <Link href="/">釣り船サイト</Link>        <div className="text-xl font-bold">

        </div>          <Link href="/">釣り船サイト</Link>

        <div className="space-x-4 flex items-center">        </div>

          <Link href="/" className="hover:underline">釣り船一覧</Link>        <div className="space-x-4 flex items-center">

          <Link href="/add-plan" className="hover:underline">釣り船追加</Link>          <Link href="/" className="hover:underline">釣り船一覧</Link>

          <button          <Link href="/add-plan" className="hover:underline">釣り船追加</Link>

            aria-label="釣り船名検索"          <button

            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 12, fontSize: 22, color: 'white' }}            aria-label="釣り船名検索"

            onClick={() => setShowSearch(true)}            style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 12, fontSize: 22, color: 'white' }}

          >            onClick={() => setShowSearch(true)}

            <span role="img" aria-label="検索">🔍</span>          >

          </button>            <span role="img" aria-label="検索">🔍</span>

        </div>          </button>

      </nav>        </div>

      {showSearch && (      </nav>

        <div      {showSearch && (

          style={{        <div

            position: 'fixed',          style={{

            top: 0,            position: 'fixed',

            left: 0,            top: 0,

            width: '100vw',            left: 0,

            height: '100vh',            width: '100vw',

            background: 'rgba(0,0,0,0.3)',            height: '100vh',

            zIndex: 1000,            background: 'rgba(0,0,0,0.3)',

            display: 'flex',            zIndex: 1000,

            alignItems: 'flex-start',            display: 'flex',

            justifyContent: 'flex-end',            alignItems: 'flex-start',

          }}            justifyContent: 'flex-end',

          onClick={() => setShowSearch(false)}          }}

        >          onClick={() => setShowSearch(false)}

          <div        >

            style={{          <div

              background: 'white',            style={{

              borderRadius: 8,              background: 'white',

              margin: 32,              borderRadius: 8,

              padding: 24,              margin: 32,

              minWidth: 280,              padding: 24,

              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',              minWidth: 280,

              position: 'relative',              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',

            }}              position: 'relative',

            onClick={e => e.stopPropagation()}            }}

          >            onClick={e => e.stopPropagation()}

            <button          >

              aria-label="閉じる"            <button

              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}              aria-label="閉じる"

              onClick={() => setShowSearch(false)}              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}

            >×</button>              onClick={() => setShowSearch(false)}

            <BoatSearch />            >×</button>

          </div>            <BoatSearch />

        </div>          </div>

      )}        </div>

    </header>      )}

  );    </header>

}  );
}
