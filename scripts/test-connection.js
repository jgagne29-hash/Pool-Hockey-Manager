const APIFY_TOKEN = process.env.APIFY_TOKEN || '';

async function testConnection() {
  console.log('🔍 Vérification de la connexion à Apify...');
  const res = await fetch(`https://api.apify.com/v2/users/me?token=${APIFY_TOKEN}`);
  if (!res.ok) {
    throw new Error(`Échec de connexion Apify: ${res.statusText}`);
  }
  const user = await res.json();
  console.log(`✅ Connecté en tant que: ${user.data.username} (${user.data.profile?.name || user.data.email})`);
  console.log(`Plan: ${user.data.plan?.id} | Crédits restants: $${user.data.plan?.monthlyUsageCreditsUsd}`);
}

testConnection().catch(console.error);
