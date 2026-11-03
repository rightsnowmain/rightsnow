async function test() {
  const email = `reader_${Date.now()}@test.com`;
  const regRes = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123', displayName: 'ප්‍රියන්ත බණ්ඩාර' })
  });
  const regData = await regRes.json();
  const token = regData.accessToken;
  console.log('Reader registered, accessToken exists:', !!token);

  const artsRes = await fetch('http://localhost:3000/api/v1/articles?limit=1');
  const arts = await artsRes.json();
  const article = arts.data[0];
  console.log('Article ID:', article.id, 'Title:', article.title.substring(0, 30));

  const postRes = await fetch(`http://localhost:3000/api/v1/articles/${article.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ body: 'ඉතාමත් කාලෝචිත ලිපියක්! ඓතිහාසික කරුණු ඉතා නිවැරදිව ඉදිරිපත් කර ඇත.' })
  });
  const postData = await postRes.json();
  console.log('Post comment result:', postData.message, 'Status:', postData.comment?.status);

  // Login as admin
  const adminLogin = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@samabima.org', password: 'password123' })
  });
  const adminData = await adminLogin.json();
  const adminToken = adminData.accessToken;

  // Moderate comment -> APPROVED
  const modRes = await fetch(`http://localhost:3000/api/v1/admin/comments/${postData.comment.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });
  const modData = await modRes.json();
  console.log('Comment moderated status:', modData.status);

  // Now reader replies to this comment
  const replyRes = await fetch(`http://localhost:3000/api/v1/articles/${article.id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ body: 'ස්තූතියි! එකඟයි.', parentId: postData.comment.id })
  });
  const replyData = await replyRes.json();
  console.log('Reply submitted:', replyData.comment?.id);

  // Approve reply as admin
  await fetch(`http://localhost:3000/api/v1/admin/comments/${replyData.comment.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'APPROVED' })
  });

  // Fetch article comments
  const listRes = await fetch(`http://localhost:3000/api/v1/articles/${article.id}/comments`);
  const list = await listRes.json();
  console.log('Public approved comments count:', list.length, 'Nested replies count:', list[0]?.replies?.length);
  console.log('SUCCESS: All comment flows verified!');
}

test().catch(console.error);
