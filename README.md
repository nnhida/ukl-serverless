# 📝 Feedback Form with Image Upload (AWS Serverless)

This repository contains the source code for UKL XI TKJ 2 SMK Telkom Malang. The project demonstrates how to build a simple full-stack serverless application using AWS.

## ✨ Features

- Submit feedback with:
  - Name
  - Text
  - Image upload
- Feedback entries are displayed in a table, complete with uploaded image previews
- Serverless and scalable using AWS services:
  - **Lambda** (backend)
  - **API Gateway** (REST endpoints)
  - **S3** (image storage)
  - **DynamoDB** (data storage)

---

## 📦 Tech Stack

| Layer      | Tool/Service       |
|------------|--------------------|
| Frontend   | HTML, JavaScript   |
| Backend    | AWS Lambda (Node.js) |
| Storage    | Amazon S3, DynamoDB |
| API Layer  | Amazon API Gateway |

---

## 🚀 How It Works

### 1. User submits a feedback form
- Inputs: `name`, `feedback`, `image file`
- Image is read as Base64 and sent to API Gateway

### 2. Lambda handles the submission
- Image is uploaded to S3
- Metadata is stored in DynamoDB with generated `id` and `s3key`

### 3. Feedback list is loaded from `/items`
- Lambda retrieves all feedback entries
- Signed URLs are generated for S3 images (valid for 1 week)

---

## 📂 API Endpoints

| Method | Endpoint       | Description                  |
|--------|----------------|------------------------------|
| `GET`  | `/items`       | Fetch all feedback entries   |
| `POST` | `/form`        | Submit new feedback          |
| `OPTIONS` | *any*       | CORS preflight handling      |

---

## 🔐 Security Notes

- All S3 image URLs are **signed** URLs (not public), generated server-side.
- CORS is configured to allow all origins for development (`*`), but should be restricted in production.

---

## 📌 Environment Variables (for Lambda)

Make sure to set the following environment variables in your Lambda function:

- `TABLE_NAME` – your DynamoDB table name
- `BUCKET_NAME` – your S3 bucket name

---

## 🛠️ Deployment Notes

This project assumes:
- Lambda function is connected to API Gateway
- The frontend is hosted (e.g., via S3 static site, Amplify, etc.)
- IAM Role for Lambda has permissions to write to S3 and DynamoDB

---

## License

MIT
