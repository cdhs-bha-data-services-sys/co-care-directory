# ARGS
# $1: Version tag (i.e. "1.0.0")

# Fail if any command exits with a non-zero exit code
set -e 

# Variables
APP_DIR="/app"
INFRA_DIR="$APP_DIR/infra/aws/infra"

# Checkout the new tag
cd $APP_DIR
git checkout $1

# Initialize Terraform
# docker run -v "$PWD:/app" -w "$INFRA_DIR" -e TF_VAR_bucket_name -e TF_VAR_domains -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY coloradodigitalservice/co-care-directory terraform init -backend-config="bucket=${TF_VAR_bucket_name}-terraform-state" -backend-config="dynamodb_table=${TF_VAR_bucket_name}-terraform-state"
cd $INFRA_DIR
terraform init -backend-config="bucket=${TF_VAR_bucket_name}-terraform-state" -backend-config="dynamodb_table=${TF_VAR_bucket_name}-terraform-state"

# Apply the infrastructure
# docker run -v "$PWD:/app" -w "$INFRA_DIR" -e TF_VAR_bucket_name -e TF_VAR_domains -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY coloradodigitalservice/co-care-directory terraform apply -auto-approve
cd $INFRA_DIR
terraform apply -auto-approve

# Build the application
# docker run -v "$PWD:/app" coloradodigitalservice/co-care-directory bash -c "npm install && npm run build"
cd $APP_DIR
npm install
npm run build

# Deploy the application
# docker run -v "$PWD:/app" -e TF_VAR_bucket_name coloradodigitalservice/co-care-directory aws s3 sync build/. s3://$TF_VAR_bucket_name --delete
cd $APP_DIR
aws s3 sync build/. s3://$TF_VAR_bucket_name --delete
