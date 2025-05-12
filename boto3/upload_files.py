import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')

bucket_name = 'your_web_bucket' # change this with your web bucket name
html_file_path = '/path/to/index.html' # change this with the path where you saved your html file
js_file_path = '/path/to/script.js' # change this with the path where you saved your javascript file

def upload_file(bucket_name, file_path, object_name, content_type):
    try:
        s3_client.upload_file(
            file_path, 
            bucket_name, 
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        print(f"File {object_name} uploaded to {bucket_name} with content type {content_type}.")
    
    except ClientError as e:
        print(f"Error uploading file {object_name} to bucket {bucket_name}: {e}")

def main():
    upload_file(bucket_name, html_file_path, 'index.html', 'text/html')
    upload_file(bucket_name, js_file_path, 'script.js', 'application/javascript')

if __name__ == '__main__':
    main()
