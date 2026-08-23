import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  anonymous,
  asAdmin,
  asUser,
  createApiTestApp,
  Profile,
} from '../../../testing/api-test-app';
import { DogController } from './dog.controller';
import { DogService } from './dog.service';

describe('DogController', () => {
  let app: INestApplication;

  const dogService = {
    getDogs: jest.fn(),
    createDog: jest.fn(),
    updateDog: jest.fn(),
  };

  const boot = async (profile: Profile) => {
    app = await createApiTestApp({
      controllers: [DogController],
      providers: [{ provide: DogService, useValue: dogService }],
      profile,
    });
    return request(app.getHttpServer());
  };

  const validBody = { name: 'Rex', birthDate: '2020-05-01' };

  beforeEach(() => {
    jest.clearAllMocks();
    dogService.getDogs.mockResolvedValue([]);
    dogService.createDog.mockResolvedValue({ id: 'dog-1' });
    dogService.updateDog.mockResolvedValue({ id: 'dog-1' });
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('without a token', () => {
    it('refuses the dog list', async () => {
      await (await boot(anonymous())).get('/dogs').expect(401);
    });

    it('refuses a dog creation', async () => {
      await (await boot(anonymous())).post('/dogs').send(validBody).expect(401);
    });

    it('refuses a dog update', async () => {
      await (await boot(anonymous())).patch('/dogs/dog-1').send({ name: 'Rexy' }).expect(401);
    });

    it('never reaches the service', async () => {
      await (await boot(anonymous())).get('/dogs').expect(401);

      expect(dogService.getDogs).not.toHaveBeenCalled();
    });
  });

  describe('as an authenticated user', () => {
    it('reads its own dogs', async () => {
      await (await boot(asUser('user-7'))).get('/dogs').expect(200);

      expect(dogService.getDogs).toHaveBeenCalledWith('user-7');
    });

    // A regular caller cannot read another account's dogs by naming it in the query.
    it('ignores a userId supplied in the query string', async () => {
      await (await boot(asUser('user-7'))).get('/dogs?userId=someone-else').expect(200);

      expect(dogService.getDogs).toHaveBeenCalledWith('user-7');
    });

    it('creates a dog attached to itself', async () => {
      await (await boot(asUser('user-7'))).post('/dogs').send(validBody).expect(201);

      expect(dogService.createDog).toHaveBeenCalledWith('user-7', expect.objectContaining(validBody));
    });

    it('updates a dog as itself', async () => {
      await (await boot(asUser('user-7'))).patch('/dogs/dog-1').send({ name: 'Rexy' }).expect(200);

      expect(dogService.updateDog).toHaveBeenCalledWith('user-7', 'dog-1', { name: 'Rexy' });
    });
  });

  describe('as an admin', () => {
    it('may read the dogs of a named account', async () => {
      await (await boot(asAdmin())).get('/dogs?userId=user-7').expect(200);

      expect(dogService.getDogs).toHaveBeenCalledWith('user-7');
    });

    it('falls back to its own dogs when no account is named', async () => {
      await (await boot(asAdmin('admin-9'))).get('/dogs').expect(200);

      expect(dogService.getDogs).toHaveBeenCalledWith('admin-9');
    });
  });

  describe('request body validation', () => {
    it('rejects a body carrying an unknown field', async () => {
      await (await boot(asUser()))
        .post('/dogs')
        .send({ ...validBody, unexpectedField: 'x' })
        .expect(400);
    });

    it('never reaches the service when the body is rejected', async () => {
      await (await boot(asUser()))
        .post('/dogs')
        .send({ ...validBody, unexpectedField: 'x' })
        .expect(400);

      expect(dogService.createDog).not.toHaveBeenCalled();
    });

    it('rejects a body missing a required field', async () => {
      await (await boot(asUser())).post('/dogs').send({ name: 'Rex' }).expect(400);
    });

    it('rejects an empty name', async () => {
      await (await boot(asUser())).post('/dogs').send({ ...validBody, name: '' }).expect(400);
    });

    it('rejects a name beyond the accepted length', async () => {
      await (await boot(asUser()))
        .post('/dogs')
        .send({ ...validBody, name: 'x'.repeat(81) })
        .expect(400);
    });

    it('rejects a birth date that is not a date', async () => {
      await (await boot(asUser()))
        .post('/dogs')
        .send({ ...validBody, birthDate: 'not-a-date' })
        .expect(400);
    });

    it('rejects an unknown field on an update too', async () => {
      await (await boot(asUser()))
        .patch('/dogs/dog-1')
        .send({ name: 'Rexy', userId: 'someone-else' })
        .expect(400);
    });
  });
});
