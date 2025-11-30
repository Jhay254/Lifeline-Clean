import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setup() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    console.log('\nRunning Prisma db push...\n');

    try {
        const { stdout, stderr } = await execAsync('npx prisma db push');
        console.log(stdout);
        if (stderr) console.error(stderr);

        console.log('\n✅ Database schema created successfully!\n');

        console.log('Generating Prisma Client...\n');
        const { stdout: genStdout, stderr: genStderr } = await execAsync('npx prisma generate');
        console.log(genStdout);
        if (genStderr) console.error(genStderr);

        console.log('\n✅ Prisma Client generated successfully!\n');
        console.log('✅ Setup complete! You can now run: npm run dev');
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.error(error.stderr);
        process.exit(1);
    }
}

setup();
