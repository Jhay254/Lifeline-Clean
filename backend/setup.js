require('dotenv').config();
const { execSync } = require('child_process');

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('\nRunning Prisma db push...\n');

try {
    execSync('npx prisma db push', { stdio: 'inherit', env: process.env });
    console.log('\n✅ Database schema created successfully!\n');

    console.log('Generating Prisma Client...\n');
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
    console.log('\n✅ Prisma Client generated successfully!\n');

    console.log('✅ Setup complete! You can now run: npm run dev');
} catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
}
