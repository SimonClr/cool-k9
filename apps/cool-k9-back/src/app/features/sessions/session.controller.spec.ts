import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ExerciseType } from '@models';
import {
  anonymous,
  asAdmin,
  asUser,
  createApiTestApp,
  Profile,
} from '../../../testing/api-test-app';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let app: INestApplication;

  const sessionService = {
    getAllSessions: jest.fn(),
    createSession: jest.fn(),
    updateSession: jest.fn(),
    getSession: jest.fn(),
  };

  const boot = async (profile: Profile) => {
    app = await createApiTestApp({
      controllers: [SessionController],
      providers: [{ provide: SessionService, useValue: sessionService }],
      profile,
    });
    return request(app.getHttpServer());
  };

  const validBody = {
    date: '2026-02-01T09:00:00Z',
    userIds: ['3f1e4a6c-9b2d-4c7e-8a11-5d6f7e8a9b0c'],
    exerciseType: ExerciseType.EDUCATION,
    duration: 60,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    sessionService.getAllSessions.mockResolvedValue({ data: [], total: 0, page: 1, perPage: 20 });
    sessionService.createSession.mockResolvedValue({ id: 's-1' });
    sessionService.updateSession.mockResolvedValue({ id: 's-1' });
    sessionService.getSession.mockResolvedValue({ id: 's-1' });
  });

  afterEach(async () => {
    await app?.close();
  });

  describe('without a token', () => {
    it('refuses the session list', async () => {
      await (await boot(anonymous())).get('/sessions').expect(401);
    });

    it('refuses a single session', async () => {
      await (await boot(anonymous())).get('/sessions/s-1').expect(401);
    });

    it('refuses a session creation', async () => {
      await (await boot(anonymous())).post('/sessions').send(validBody).expect(401);
    });

    it('refuses a session update', async () => {
      await (await boot(anonymous())).patch('/sessions/s-1').send({}).expect(401);
    });

    it('never reaches the service', async () => {
      await (await boot(anonymous())).get('/sessions').expect(401);

      expect(sessionService.getAllSessions).not.toHaveBeenCalled();
    });
  });

  describe('as an authenticated user without the admin role', () => {
    it('refuses the creation of a session', async () => {
      await (await boot(asUser())).post('/sessions').send(validBody).expect(403);
    });

    it('never reaches the service when the creation is refused', async () => {
      await (await boot(asUser())).post('/sessions').send(validBody).expect(403);

      expect(sessionService.createSession).not.toHaveBeenCalled();
    });

    it('allows reading the session list', async () => {
      await (await boot(asUser())).get('/sessions').expect(200);
    });

    // The identity comes from the verified token, never from the request, so the
    // caller cannot read somebody else's sessions by asking.
    it('passes the authenticated identity and role to the service', async () => {
      await (await boot(asUser('user-7'))).get('/sessions').expect(200);

      expect(sessionService.getAllSessions).toHaveBeenCalledWith(
        'user-7',
        'user',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('allows updating a session', async () => {
      await (await boot(asUser())).patch('/sessions/s-1').send({ ownerObservations: 'RAS' }).expect(200);
    });

    it('passes the identity, the role and the identifier when updating', async () => {
      await (await boot(asUser('user-7')))
        .patch('/sessions/s-1')
        .send({ ownerObservations: 'RAS' })
        .expect(200);

      expect(sessionService.updateSession).toHaveBeenCalledWith('user-7', 'user', 's-1', {
        ownerObservations: 'RAS',
      });
    });

    it('reads a single session as itself', async () => {
      await (await boot(asUser('user-7'))).get('/sessions/s-1').expect(200);

      expect(sessionService.getSession).toHaveBeenCalledWith('user-7', 'user', 's-1');
    });
  });

  describe('as an admin', () => {
    it('allows the creation of a session', async () => {
      await (await boot(asAdmin())).post('/sessions').send(validBody).expect(201);
    });

    it('passes the admin role to the service', async () => {
      await (await boot(asAdmin('admin-9'))).get('/sessions').expect(200);

      expect(sessionService.getAllSessions).toHaveBeenCalledWith(
        'admin-9',
        'admin',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('parses the list filters off the query string', async () => {
      await (await boot(asAdmin()))
        .get('/sessions?exerciseTypes=EDUCATION,INITIATION&page=2&perPage=5&userIds=u-1&dogIds=d-1')
        .expect(200);

      expect(sessionService.getAllSessions).toHaveBeenCalledWith(
        'admin-1',
        'admin',
        ['EDUCATION', 'INITIATION'],
        2,
        5,
        ['u-1'],
        ['d-1']
      );
    });
  });

  describe('request body validation', () => {
    it('rejects a body carrying an unknown field', async () => {
      await (await boot(asAdmin()))
        .post('/sessions')
        .send({ ...validBody, unexpectedField: 'x' })
        .expect(400);
    });

    it('names the offending field in the rejection', async () => {
      const response = await (await boot(asAdmin()))
        .post('/sessions')
        .send({ ...validBody, unexpectedField: 'x' })
        .expect(400);

      expect(JSON.stringify(response.body)).toContain('unexpectedField');
    });

    it('never reaches the service when the body is rejected', async () => {
      await (await boot(asAdmin()))
        .post('/sessions')
        .send({ ...validBody, unexpectedField: 'x' })
        .expect(400);

      expect(sessionService.createSession).not.toHaveBeenCalled();
    });

    it('rejects a body missing a required field', async () => {
      const { date, ...withoutDate } = validBody;
      await (await boot(asAdmin())).post('/sessions').send(withoutDate).expect(400);
    });

    it('rejects a value outside the accepted enum', async () => {
      await (await boot(asAdmin()))
        .post('/sessions')
        .send({ ...validBody, exerciseType: 'NOT_A_TYPE' })
        .expect(400);
    });

    it('rejects a duration beyond the accepted bound', async () => {
      await (await boot(asAdmin()))
        .post('/sessions')
        .send({ ...validBody, duration: 10_000 })
        .expect(400);
    });

    it('rejects an identifier that is not a uuid', async () => {
      await (await boot(asAdmin()))
        .post('/sessions')
        .send({ ...validBody, userIds: ['not-a-uuid'] })
        .expect(400);
    });

    it('accepts a body holding only the declared fields', async () => {
      await (await boot(asAdmin())).post('/sessions').send(validBody).expect(201);

      expect(sessionService.createSession).toHaveBeenCalled();
    });
  });
});
