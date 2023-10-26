// describe('The Signin Page', () => {
//   it('api', () => {
//     cy.request({
//       url: 'http://fe.alipay.net:8080/api/v1/users/signin',
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ name: 'root', password: 'dragonfly' }),
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('expire');
//       expect(response.body).to.have.property('token');
//     });
//   });

//   it('clusters', () => {
//     cy.request({
//       url: 'http://fe.alipay.net:8080/api/v1/clusters',
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//     });
//   });
// });
