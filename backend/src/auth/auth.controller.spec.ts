import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getMe: jest.fn(),
    updateMe: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('calls authService.register with username and password', async () => {
      mockAuthService.register.mockResolvedValue({
        user: { id: '1', username: 'alice', monthlyIncome: null },
        token: 'token',
      });
      await controller.register({
        username: 'alice',
        password: 'Pass1234',
        passwordConfirm: 'Pass1234',
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(
        'alice',
        'Pass1234',
      );
    });
  });

  describe('login', () => {
    it('calls authService.login with username and password', async () => {
      mockAuthService.login.mockResolvedValue({
        user: { id: '1', username: 'alice', monthlyIncome: null },
        token: 'token',
      });
      await controller.login({
        username: 'alice',
        password: 'Pass1234',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith('alice', 'Pass1234');
    });
  });
});
