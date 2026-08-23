import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  anonymous,
  asAdmin,
  asUser,
  createApiTestApp,
  Profile,
} from '../../../testing/api-test-app';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let app: INestApplication;

  const userService = {
    getUsers: jest.fn(),
    exportUserData: jest.fn(),
    deleteUserAccount: jest.fn(),
  };

  const boot = async (profile: Profile) => {
    app = await createApiTestApp({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
      profile,
    });
    return request(app.getHttpServer());
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService.getUsers.mockResolvedValue({ data: [], total: 0, page: 1, perPage: 20 });
    userService.exportUserData.mockResolvedValue({ formatVersion: '1.0' });
    userService.deleteUserAccount.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('without a token', () => {
    it('refuses the user list', async () => {
      await (await boot(anonymous())).get('/users').expect(401);
    });

    it('refuses the personal data export', async () => {
      await (await boot(anonymous())).get('/users/me/export').expect(401);
    });

    it('refuses the account deletion', async () => {
      await (await boot(anonymous())).delete('/users/me').expect(401);
    });

    it('never reaches the service', async () => {
      await (await boot(anonymous())).get('/users').expect(401);

      expect(userService.getUsers).not.toHaveBeenCalled();
    });
  });

  describe('as an authenticated user without the admin role', () => {
    it('refuses access to the user list', async () => {
      await (await boot(asUser())).get('/users').expect(403);
    });

    it('never reaches the service when the list is refused', async () => {
      await (await boot(asUser())).get('/users').expect(403);

      expect(userService.getUsers).not.toHaveBeenCalled();
    });

    // The export and the deletion serve the requester's own data, so they stay
    // open to every account: only the user list is reserved to administrators.
    it('may export its own data', async () => {
      await (await boot(asUser())).get('/users/me/export').expect(200);
    });

    it('may delete its own account', async () => {
      await (await boot(asUser())).delete('/users/me').expect(204);
    });
  });

  describe('as an admin', () => {
    it('reads the user list', async () => {
      await (await boot(asAdmin())).get('/users').expect(200);
    });

    it('passes the search and paging parameters to the service', async () => {
      await (await boot(asAdmin())).get('/users?search=ada&page=2&perPage=5').expect(200);

      expect(userService.getUsers).toHaveBeenCalledWith({
        search: 'ada',
        page: 2,
        perPage: 5,
      });
    });
  });

  describe('personal data endpoints', () => {
    // The identifier comes from the verified token and never from the request, so
    // a caller cannot export or erase somebody else's account.
    it('exports the account named by the token', async () => {
      await (await boot(asUser('user-7'))).get('/users/me/export').expect(200);

      expect(userService.exportUserData).toHaveBeenCalledWith('user-7');
    });

    it('ignores an account named in the query when exporting', async () => {
      await (await boot(asUser('user-7'))).get('/users/me/export?userId=someone-else').expect(200);

      expect(userService.exportUserData).toHaveBeenCalledWith('user-7');
    });

    it('erases the account named by the token', async () => {
      await (await boot(asUser('user-7'))).delete('/users/me').expect(204);

      expect(userService.deleteUserAccount).toHaveBeenCalledWith('user-7');
    });

    it('answers a deletion with no content', async () => {
      const response = await (await boot(asUser())).delete('/users/me').expect(204);

      expect(response.body).toEqual({});
    });
  });
});
