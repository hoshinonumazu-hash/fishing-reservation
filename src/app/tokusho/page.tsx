import React from "react";

export default function TokushoPage() {
  return (
    <main className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">特定商取引法に基づく表記</h1>
      <section className="prose prose-sm">
        <table className="table-auto border mb-6">
          <tbody>
            <tr><th>販売業者名 / 運営者名</th><td>星野想（屋号：釣り船予約プラットフォーム運営事務局）</td></tr>
            <tr><th>運営統括責任者</th><td>星野想</td></tr>
            <tr><th>代表責任者</th><td>星野想</td></tr>
            <tr><th>所在地</th><td>〒411-0943 静岡県駿東郡長泉町下長窪39-1</td></tr>
            <tr><th>電話番号</th><td>[メールアドレス（souhoshino@gmail.com）へご連絡いただければ、遅滞なく開示いたします]</td></tr>
            <tr><th>メールアドレス</th><td>souhoshino@gmail.com</td></tr>
            <tr><th>サービス名</th><td>釣り船予約プラットフォーム（仮称）</td></tr>
            <tr><th>商品代金以外の必要料金</th><td>該当なし（※オーナー向けの月額利用料・手数料については別途契約に定める）</td></tr>
            <tr><th>支払方法</th><td>【一般ユーザー】<br />・現地決済（現金）<br />・クレジットカード（将来的に導入予定）<br />【オーナー】<br />（別途契約に定める）</td></tr>
            <tr><th>支払時期</th><td>【一般ユーザー】<br />・現地決済：釣り船利用当日、現地にて<br />・クレジットカード：予約確定時（将来的に導入予定）<br />【オーナー】<br />（別途契約に定める）</td></tr>
            <tr><th>サービス提供時期</th><td>予約した釣り船の利用日時</td></tr>
            <tr><th>キャンセル・返金について</th><td>利用規約 第6条（キャンセルポリシー）に準ずる。<br />・予約日7日前まで: 無料<br />・予約日3日前まで: 料金の50%<br />・予約日前日以降: 料金の100%<br />※悪天候・オーナー都合による中止の場合は全額返金（またはキャンセル料発生なし）</td></tr>
            <tr><th>動作環境</th><td>【推奨ブラウザ】<br />・Google Chrome（最新版）<br />・Safari（最新版）<br />・Firefox（最新版）</td></tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}
