const request = require('supertest');
const app = 'http://localhost:9000'; // Your base URL

describe('Load Test', () => {
  const requestsPerSecond = 5; // Requests to be sent per second
  const duration = 120; // Total test duration in seconds

  it('should perform a load test', async () => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000; // Calculate end time based on duration

    const makeRequests = async () => { // Encapsulate request logic in a function
      const promises = [];
      
      for (let i = 0; i < requestsPerSecond; i++) {
        promises.push(
          request(app)
            .post('/project')
            .send({ gitUrl: 'https://github.com/EvansAbraham/test-project' })
            .then(response => {
              expect(response.status).toBe(200);
              const deployedUrl = response.body.data.url; // Adjust based on your response structure
              return deployedUrl; // Return the URL for logging
            })
            .catch(error => {
              console.error('Request failed:', error.message);
              return null; // Return null in case of an error
            })
        );
      }

      // Wait for all requests in this batch to complete
      const results = await Promise.all(promises);

      // Log all successfully deployed URLs
      results.forEach(deployedUrl => {
        if (deployedUrl) {
          console.log('Deployed URL:', deployedUrl);
        }
      });
    };

    // Main loop to send requests until the duration is reached
    while (Date.now() < endTime) { // Loop until the calculated end time
      await makeRequests(); // Send requests
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before the next batch
    }
  }, 400000); // Increase the timeout to 5 minutes

  // Additional Test Cases

  it('should return 400 for invalid git URL', async () => {
    const response = await request(app)
      .post('/project')
      .send({ gitUrl: 'invalid-url' }); // Invalid URL format
    expect(response.status).toBe(400); // Expect a 400 status code for invalid input
    expect(response.body).toHaveProperty('error'); // Expect an error property in the response
  });

  it('should return 400 for missing git URL', async () => {
    const response = await request(app)
      .post('/project')
      .send({}); // Missing gitUrl
    expect(response.status).toBe(400); // Expect a 400 status code for missing input
    expect(response.body).toHaveProperty('error'); // Expect an error property in the response
  });

  it('should handle high load without crashing', async () => {
    const highLoadRequests = 100; // Test with 100 requests
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

    await Promise.all(promises); // Send all requests at once
  });

  it('should limit responses to 200 status code', async () => {
    const promises = Array.from({ length: 50 }).map(() =>
      request(app)
        .post('/project')
        .send({ gitUrl: 'https://github.com/EvansAbraham/test-project' })
        .then(response => {
          expect(response.status).toBe(200); // Expect all responses to have 200 status code
        })
        .catch(error => {
          console.error('Request failed:', error.message);
        })
    );

    await Promise.all(promises); // Send all requests in parallel
  });

  afterAll(async () => {
    // Clean up resources, close any open connections, etc.
  });
});
