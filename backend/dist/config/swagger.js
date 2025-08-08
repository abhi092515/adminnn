"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0', // Specify OpenAPI version
        info: {
            title: 'Main Category & Category API',
            version: '1.0.0',
            description: 'API documentation for Main Categories and Categories, including CRUD operations and relationships.',
            contact: {
                name: 'Your Name', // Replace with your name
                email: 'your.email@example.com', // Replace with your email
            },
        },
        servers: [
            {
                url: 'http://localhost:5001/api', // Your API base URL
                description: 'Development Server',
            },
            // You can add more servers for production, staging, etc.
            // {
            //   url: 'https://your-production-api.com/api',
            //   description: 'Production Server',
            // },
        ],
        // You can define components like security schemes if you implement authentication
        // components: {
        //   securitySchemes: {
        //     bearerAuth: {
        //       type: 'http',
        //       scheme: 'bearer',
        //       bearerFormat: 'JWT',
        //     },
        //   },
        // },
        // security: [
        //   {
        //     bearerAuth: [],
        //   },
        // ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to your API routes and models
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
