# projet-api

This project is a full-stack web application, likely an API, built using Node.js and Express. It features user authentication, session management, file uploads, and uses SQLite as a database. The API is documented using Swagger/OpenAPI, and the codebase itself is documented with JSDoc.

## Features

-   **API Development**: Built with Express.js for robust API endpoints.
-   **Database**: Uses SQLite3 for data persistence.
-   **User Authentication**: Implements secure user authentication with `bcrypt` for password hashing and `express-session` for session management.
-   **CORS Enabled**: Configured with `cors` for handling cross-origin requests.
-   **File Uploads**: Supports file uploads using `multer`.
-   **Templating**: Utilizes `express-handlebars` and `handlebars` for server-side rendering, if applicable.
-   **API Documentation**: Automatically generated API documentation using `swagger-jsdoc` and `swagger-ui-express`.
-   **Code Documentation**: In-code documentation generated with `jsdoc`.
-   **Unique ID Generation**: Uses `uuid` for generating unique identifiers.

## Technologies Used

-   **Backend**: Node.js, Express.js
-   **Database**: SQLite3
-   **Authentication**: bcrypt, express-session
-   **Templating**: Express-Handlebars, Handlebars
-   **File Uploads**: Multer
-   **API Documentation**: Swagger-JSDoc, Swagger-UI-Express
-   **Code Documentation**: JSDoc
-   **Utilities**: CORS, UUID

## Installation

To set up the project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Eevolxy/projet-api.git
    cd projet-api
    ```

2.  **Install dependencies**:
    Navigate to the project root directory and install all necessary Node.js packages:
    ```bash
    npm install
    ```

## Usage

To run the server, execute the following command from the project root directory:

```bash
node server/index.js
```

Or, if your `package.json` has a start script defined (it doesn't currently, but you could add one):

```bash
npm start
```

## API Documentation

Once the server is running, you can access the interactive API documentation (Swagger UI) at:

`http://localhost:<PORT>/api-docs` (replace `<PORT>` with the actual port your server is running on, e.g., 3000)

You can also view the generated JSDoc documentation by opening the `docs/index.html` file in your browser.

## Project Structure

-   `.git/`: Git version control directory.
-   `.idea/`: IDE (e.g., WebStorm/IntelliJ) configuration files.
-   `client/`: Contains client-side application files (if any).
-   `docs/`: Generated JSDoc documentation.
-   `node_modules/`: Node.js dependencies.
-   `server/`: Contains the server-side application logic.
    -   `index.js`: Main entry point for the server.
    -   Other server-related files (e.g., routes, controllers, models, middleware).
-   `.gitignore`: Specifies intentionally untracked files to ignore.
-   `jsdoc.json`: Configuration file for JSDoc.
-   `package.json`: Project metadata and dependencies.
-   `package-lock.json`: Records the exact dependency tree.

## License

This project is licensed under the ISC License. See the `LICENSE` file (if present) for details or refer to the `package.json`.

## Authors

Eevolxy
Fox-Programs
