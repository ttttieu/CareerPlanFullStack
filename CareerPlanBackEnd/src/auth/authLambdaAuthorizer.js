// CareerPlanBack/src/auth/authLambdaAuthorizer.js

const admin = require('firebase-admin');
const AWS = require('aws-sdk');

// Khởi tạo Firebase Admin SDK chỉ một lần
let firebaseApp;
let secretsManagerClient;

async function initializeFirebaseAdmin() {
    if (!firebaseApp) {
        if (!secretsManagerClient) {
            secretsManagerClient = new AWS.SecretsManager({ region: process.env.AWS_REGION });
        }

        const secretName = process.env.FIREBASE_ADMIN_SECRET_NAME;
        if (!secretName) {
            throw new Error("FIREBASE_ADMIN_SECRET_NAME environment variable is not set.");
        }

        try {
            // Lấy secret từ Secrets Manager
            const data = await secretsManagerClient.getSecretValue({ SecretId: secretName }).promise();
            const serviceAccount = JSON.parse(data.SecretString);

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin SDK initialized successfully.");
        } catch (error) {
            console.error("Error initializing Firebase Admin SDK:", error);
            throw new Error("Failed to initialize Firebase Admin SDK.");
        }
    }
    return firebaseApp;
}

/**
 * Hàm chính của Lambda Authorizer.
 * Xác minh Firebase ID Token và trả về IAM policy.
 */
exports.handler = async (event) => {
    console.log('Authorizer Event:', JSON.stringify(event, null, 2));

    // Kiểm tra xem token có trong header Authorization không
    // event.authorizationToken có thể là "Bearer <TOKEN>" hoặc chỉ "<TOKEN>"
    const tokenString = event.authorizationToken;
    if (!tokenString) {
        console.error('Authorization token not found.');
        return generatePolicy('user', 'Deny', event.methodArn);
    }

    // Loại bỏ tiền tố "Bearer " nếu có
    const idToken = tokenString.startsWith('Bearer ') ? tokenString.substring(7) : tokenString;

    try {
        await initializeFirebaseAdmin(); // Đảm bảo Firebase được khởi tạo

        // Xác minh Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('Decoded Firebase Token:', decodedToken);

        const userId = decodedToken.uid; // Firebase User ID

        // Trả về một IAM Policy cho phép truy cập
        // Bạn có thể thêm thông tin từ decodedToken vào context nếu cần cho các Lambda khác
        const policy = generatePolicy(userId, 'Allow', event.methodArn);
        policy.context = {
            userId: userId,
            email: decodedToken.email || '',
            // Thêm các thông tin khác từ token nếu cần
        };
        return policy;

    } catch (error) {
        console.error('Firebase ID Token verification failed:', error.message);
        // Trả về Deny policy nếu xác minh thất bại
        return generatePolicy('user', 'Deny', event.methodArn);
    }
};

/**
 * Hàm trợ giúp để tạo IAM policy.
 */
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};