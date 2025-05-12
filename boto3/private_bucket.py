import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')

bucket_name = 'your_private_bucket' # change this with your storing bucket name

def create_bucket(bucket_name):
    try:
        s3_client.create_bucket(Bucket=bucket_name)

        s3_client.put_public_access_block(
            Bucket=bucket_name,
            PublicAccessBlockConfiguration={
                'BlockPublicAcls': True,
                'IgnorePublicAcls': True,
                'BlockPublicPolicy': True,
                'RestrictPublicBuckets': True
            }
        )

        print(f"Private bucket '{bucket_name}' is created.")

    except ClientError as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    create_bucket(bucket_name)
