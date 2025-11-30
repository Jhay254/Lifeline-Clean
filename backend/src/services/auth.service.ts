import { PrismaClient, User, RefreshToken } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = 7; // 7 days

interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    /**
     * Register a new user
     */
    async register(email: string, password: string, name?: string): Promise<{ user: User; tokens: Tokens }> {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const tokens = await this.generateTokens(user.id);
        return { user, tokens };
    }

    /**
     * Login user
     */
    async login(email: string, password: string): Promise<{ user: User; tokens: Tokens }> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const tokens = await this.generateTokens(user.id);
        return { user, tokens };
    }

    /**
     * Refresh access token
     */
    async refreshToken(token: string): Promise<Tokens> {
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!storedToken || storedToken.revoked) {
            throw new Error('Invalid refresh token');
        }

        if (new Date() > storedToken.expiresAt) {
            // Revoke expired token
            await prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { revoked: true },
            });
            throw new Error('Refresh token expired');
        }

        // Revoke the used refresh token (Rotation)
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });

        // Generate new tokens
        return this.generateTokens(storedToken.userId);
    }

    /**
     * Logout (revoke refresh token)
     */
    async logout(token: string): Promise<void> {
        await prisma.refreshToken.update({
            where: { token },
            data: { revoked: true },
        });
    }

    /**
     * Generate Access and Refresh tokens
     */
    private async generateTokens(userId: string): Promise<Tokens> {
        // Generate Access Token
        const accessToken = jwt.sign({ userId }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // Generate Refresh Token
        const refreshToken = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });

        return { accessToken, refreshToken };
    }
}
