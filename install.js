const { execSync } = require('child_process');

console.log('📦 Installation des dépendances...');
console.log('⏳ Cela peut prendre 2-3 minutes...\n');

try {
  execSync('npm install --legacy-peer-deps', {
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('\n✅ Installation terminée !');

  console.log('\n🗄️  Création de la base de données...');
  execSync('npx prisma@6.11.1 db push --accept-data-loss', {
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('\n✅ Base de données créée !');

  console.log('\n🚀 Lancement du serveur de développement...');
  execSync('npm run dev', {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: 'development' }
  });

} catch (error) {
  console.error('\n❌ Erreur:', error.message);
  process.exit(1);
}
