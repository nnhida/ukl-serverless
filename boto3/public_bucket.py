import boto3
from botocore.exceptions import ClientError
import json

s3_client = boto3.client('s3')

bucket_name = 'your_web_bucket' # change this with your web bucket name

def create_bucket(bucket_name):
    try:
        s3_client.create_bucket(Bucket=bucket_name)

        s3_client.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': False,
                'IgnorePublicAcls': False,
                'BlockPublicPolicy': False,
                'RestrictPublicBuckets': False
            }
        )

        s3_client.put_bucket_website(
            Bucket=bucket_name,
            WebsiteConfiguration={
                'IndexDocument': {'Suffix': 'index.html'}
            }
        )

        policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Sid": "PublicReadGetObject",
                    "Effect": "Allow",
                    "Principal": "*",
                    "Action": ["s3:GetObject"],
                    "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
                }
            ]
        }

        s3_client.put_bucket_policy(
            Bucket=bucket_name,
            Policy=json.dumps(policy)
        )

        print(f"Public bucket '{bucket_name}' is created.")

    except ClientError as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    create_bucket(bucket_name)
