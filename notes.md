steps to create excalidraw project:

1. initialized an empty turborepo
2. added http-server , ws-server
3. added package.json in both the places
4. added tsconfigjson in both the places ,, and imported it from @repo/typescript.json-config/base.json

5. added @repo/typescript-config as a dependecies in both ws-server and http-server
6. added a build , dev and start script to both the projects 
7. update the turbo-config in both the projects (optional)
8. initialize a http server , initialize a websocket server
9. write the signup , signin , create-room endpoint 
10. write the middlewares that decode the token and gate the create-room endpoint
11. decode thw token in the websocket server as well . send the token to the websocket server in a query param for now 
12. initialize a new 'db' package where you write the schema of the object
13. import the db package in http layer and start putting things in the DB 
14. add a common package where we add the zod schema and the JWT_SECRET

15. complete HTTP Backend 