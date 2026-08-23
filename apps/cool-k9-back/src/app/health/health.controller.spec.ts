import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SupabaseService } from '../supabase/supabase.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let app: INestApplication;

  const boot = async (result: { error: { message: string } | null }) => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: SupabaseService,
          useValue: { admin: { from: () => ({ select: async () => result }) } },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    return request(app.getHttpServer());
  };

  afterEach(async () => {
    await app?.close();
  });

  describe('when the database answers', () => {
    it('reports the service as healthy', async () => {
      const response = await (await boot({ error: null })).get('/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        dependencies: { supabase: 'ok' },
      });
    });

    it('stamps the answer with the time it was produced', async () => {
      const response = await (await boot({ error: null })).get('/health').expect(200);

      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    });
  });

  describe('when the database is unreachable', () => {
    // A monitor reads the status code, so a broken dependency must not answer 200.
    it('answers that the service is unavailable', async () => {
      await (await boot({ error: { message: 'connection refused' } })).get('/health').expect(503);
    });

    it('names the dependency at fault', async () => {
      const response = await (await boot({ error: { message: 'connection refused' } }))
        .get('/health')
        .expect(503);

      expect(response.body).toMatchObject({
        status: 'error',
        dependencies: { supabase: 'unreachable' },
      });
    });

    // The endpoint is public, so the failure must not disclose the connection
    // details behind it.
    it('discloses neither credentials nor the database address', async () => {
      const response = await (await boot({ error: { message: 'postgres://user:pw@host/db' } }))
        .get('/health')
        .expect(503);

      const body = JSON.stringify(response.body);
      expect(body).not.toContain('postgres://');
      expect(body).not.toContain('pw');
    });
  });
});
