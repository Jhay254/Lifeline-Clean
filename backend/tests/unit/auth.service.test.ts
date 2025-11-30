import { AuthService } from '../../src/services/auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        refreshToken: {
            create: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;
    let prisma: any;

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();
        authService = new AuthService();
        // Access the mocked prisma instance
        prisma = (authService as any).prisma;
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const email = 'test@example.com';
            const password = 'Password123!';
            const name = 'Test User';
            const hashedPassword = 'hashedPassword';
            const userId = 'user-123';
            const token = 'jwt-token';
            const refreshToken = 'refresh-token';

            // Mock bcrypt
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            // Mock Prisma findUnique (user does not exist)
            prisma.user.findUnique.mockResolvedValue(null);

            // Mock Prisma create
            prisma.user.create.mockResolvedValue({
                id: userId,
                email,
                name,
                password: hashedPassword,
            });

            // Mock jwt
            (jwt.sign as jest.Mock)
                .mockReturnValueOnce(token) // Access token
                .mockReturnValueOnce(refreshToken); // Refresh token

            // Mock RefreshToken create
            prisma.refreshToken.create.mockResolvedValue({
                token: refreshToken,
                userId,
            });

            const result = await authService.register(email, password, name);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            });
            expect(result).toEqual({
                user: {
                    id: userId,
                    email,
                    name,
                },
                token,
                refreshToken,
            });
        });

        it('should throw error if user already exists', async () => {
            const email = 'existing@example.com';
            const password = 'Password123!';

            // Mock Prisma findUnique (user exists)
            prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email });

            await expect(authService.register(email, password)).rejects.toThrow('User already exists');
            expect(prisma.user.create).not.toHaveBeenCalled();
        });
    });
});
