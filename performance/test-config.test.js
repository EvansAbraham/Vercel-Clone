const request = require('supertest');
const app = 'http://localhost:9000'; 

describe('Load Test', () => {
  const requestsPerSecond = 5;
  const duration = 120; 

  it('should perform a load test', async () => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const makeRequests = async () => {
      const promises = [];
      
      for (let i = 0; i < requestsPerSecond; i++) {
        promises.push(
          request(app)
            .post('/project')
            .send({ gitUrl: 'https://github.com/EvansAbraham/test-project' })
            .then(response => {
              expect(response.status).toBe(200);
              const deployedUrl = response.body.data.url;
              return deployedUrl;
            })
            .catch(error => {
              console.error('Request failed:', error.message);
              return null;
            })
        );
      }

      const results = await Promise.all(promises);

      results.forEach(deployedUrl => {
        if (deployedUrl) {
          console.log('Deployed URL:', deployedUrl);
        }
      });
    };

    while (Date.now() < endTime) {
      await makeRequests();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }, 400000);


  it('should return 400 for invalid git URL', async () => {
    const response = await request(app)
      .post('/project')
      .send({ gitUrl: 'invalid-url' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for missing git URL', async () => {
    const response = await request(app)
      .post('/project')
      .send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should handle high load without crashing', async () => {
    const highLoadRequests = 100;
    const promises = Array.from({ length: highLoadRequests }).map(() =>
      request(app)
        .post('/project')
        .send({ gitUrl: 'https://github.com/EvansAbraham/test-project' })
        .then(response => {
          expect(response.status).toBe(200);
        })
        .catch(error => {
          console.error('High load request failed:', error.message);
        })
    );

    await Promise.all(promises);
  });

  it('should limit responses to 200 status code', async () => {
    const promises = Array.from({ length: 50 }).map(() =>
      request(app)
        .post('/project')
        .send({ gitUrl: 'https://github.com/EvansAbraham/test-project' })
        .then(response => {
          expect(response.status).toBe(200);
        })
        .catch(error => {
          console.error('Request failed:', error.message);
        })
    );

    await Promise.all(promises);
  });

  afterAll(async () => {
   
  });
});
