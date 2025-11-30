import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function runTests() {
    console.log('🚀 Starting Manual Integration Tests...');

    const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'Password123!',
        name: 'Test User'
    };

    try {
        // 1. Test Register
        console.log('\n1. Testing Registration...');
        const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log('✅ Registration successful:', registerRes.data.user.email);

        const token = registerRes.data.tokens.accessToken;
        const refreshToken = registerRes.data.tokens.refreshToken;

        // 2. Test Login
        console.log('\n2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('✅ Login successful. Token received.');

        // 3. Test Protected Route (Me)
        console.log('\n3. Testing Protected Route (/auth/me)...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Protected route accessed:', meRes.data.user.email);

        // 4. Test Token Refresh
        console.log('\n4. Testing Token Refresh...');
        const refreshRes = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken
        });
        console.log('✅ Token refresh successful. New token received.');

        console.log('\n🎉 All Manual Tests Passed!');

    } catch (error: any) {
        console.error('\n❌ Test Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runTests();
