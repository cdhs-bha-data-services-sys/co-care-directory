# Colorado Care Directory by the Behavioral Health Administration

## Dev Setup

This setups up a dev environment within a container to reduce "it works on my machine" problems and to create a clean, consistent environment (but adds some complexity compared to the non-container setup below). Optionally, it pairs really well with [VSCode's Remote Container extension pack](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack).

### Prerequisites

- [Docker for Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

Run these instructions whenever you change the `Dockerfile` or want to reset your environment.

1. Clone this repo
1. Navigate into its base directory
1. Run:
   - `docker build -t coloradodigitalservice/co-care-directory .`
1. Then, you can jump into the container's command line:
   - `docker run -p 3000:3000 -it -v $PWD:/app --rm coloradodigitalservice/co-care-directory bash`
   - Note: `$PWD` as the full path to the base directory. Change if you need something different.
1. Download dependencies:
   - `npm install`
   - Run whenever your `package.json` changes
1. Start the debug server:
   - `npm start`
1. Access the app at `http://localhost:3000`

## Dev Setup (non-container)

This is a simple, non-containerized setup, but might be impacted by other things installed on your machine (i.e. other devs might experience things differently than you).

### Prerequisites

Install these items first:

- [Node.js](https://nodejs.org/en/download/) at version 16.11.x LTS

### Steps

1. Clone this repo
1. Navigate into its base directory
1. Download dependencies:
   - `npm install`
   - Run whenever your `package.json` changes
1. Start the debug server:
   - `npm start`
1. Access the app at `http://localhost:3000`

## Heroku Review App Environment Setup

1. Create a pipeline
1. Connect to GitHub
1. Enable Review Apps, choosing these options:
   - Automatically create review apps for new PRs

## Heroku App Environment Setup

Good for ondemand environments in Heroku running in debug mode.

To do this, first install and login to [the Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).

1. Create a new app
1. From the app's settings, go to the `Deploy` tab
1. Go to either `Automatic deploys` or `Manual deploys` and choose the branch you'd like deployed and trigger a deployment.
1. The deployment will initially fail because it doesn't understand that it is a container-based app. Issue this command from the Heroku CLI:
   - `heroku stack:set container -a (app name)`
1. Trigger another deployment

## Processing Data

We use a standalone script to transform a CSV export into a cleaned JSON file. To process data, run:

```
npm run processdata
```

This happens automatically as part of `npm run build` and `npm run start`, so you don't typically have to run this unless you're debugging the data transformation itself.

## Using SVGs 
Using SVGs in React apps is super easy. To make them fully component prop/CSS customizable ensure you do these things:
1. Only set width or height (not both) on the main SVG element. This allows you to scale the size of the SVG by setting width/height prop on the component.
1. set "fill" prop on <svg> element to be "currentColor". This allows you to color the SVG with CSS "color" property.
1. DON'T set "fill" prop on any inner elements within the <svg>. This will prohibit you from dynamically setting the color with CSS "color" property. 

## AWS Deployment

### Pre-requisites

Your local environment should have Docker installed. If you haven't built the Docker container yet, build it while at the root of the code base:

```
docker build -t coloradodigitalservice/co-care-directory .
```

If you want to attach domains during the deployment (i.e. specified as an environment variable), then those domains should live inside the target AWS account's Route53 Registered Domains. Otherwise, you can run without domains specified and manually setup your domains to point to a CloudFront generated URL.


### First time

The first time you ever deploy the site to an AWS Account from any computer, run this:

1. Setup a new AWS Account or login to an existing one that you have admin rights on
1. [Create a user](https://us-east-1.console.aws.amazon.com/iamv2/home#/users)
   1. User name: `terraform`
   1. Select AWS credential type:
      - ✅ Access key
   1. Next
   1. Attach existing policies directly
      - ✅ AdministratorAccess (TODO: This grants anything. Remove this and specify only what's needed)
   1. Set permission boundary: Create user without a permissions boundary (TODO Reduce this) 
   1. Next
   1. Next
   1. Create user
   1. Copy the user ID, access key ID, and secret access key
   1. Close

Next, we need to create storage for the Terraform state.

1. Launch a terminal in the dev container from the root of the code base: `docker run -it -v $PWD:/app --rm coloradodigitalservice/co-care-directory bash` (TODO: Remove directory mapping after state is stored centrally)
1. Navigate to: `cd infra/aws/state`
1. Set `export TF_VAR_bucket_name="<S3 bucket name>"` with a [valid name](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) of the S3 bucket where built app files will be stored. This must be unique across all of AWS.
1. (optional) Set `export TF_VAR_domains='["domain1.com","domain2.org"]'` with the domains, with primary domain first
   - If no domains specified, it'll just use a CloudFront generated domain
1. Set `export AWS_ACCESS_KEY_ID="<your AWS user's access key ID>"` 
1. Set `export AWS_SECRET_ACCESS_KEY="<your AWS secret access key>"`  
1. Setup Terraform: `terraform init`
1. Build the infrastructure:  `terraform apply` and then type `yes`
1. Save a backup of the `terraform.state` file
   - This is a state file containing only the S3 storage for the deployment's state file and Dynamo DB table that locks Terraform runs to one user at a time. There is no central backup, so put it somewhere safe even though you'll probably never need it again.
   - If you _do_ lose this state file, you can manually modify/remove the S3 bucket and DynamoDB table both named `${TF_VAR_bucket_name}-terraform-state`


### Manual deployment

You can start here if the First Time instructions have been run on the AWS Account from any computer at anytime before this.

1. Launch a terminal in the dev container from the root of the code base: `docker run -it -v $PWD:/app --rm coloradodigitalservice/co-care-directory bash` (TODO: Remove directory mapping after state is stored centrally)
1. Navigate to: `cd infra/aws/infra`
1. Set `export TF_VAR_bucket_name="<S3 bucket name>"` with a [valid name](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html) of the S3 bucket where built app files will be stored. This must be unique across all of AWS.
1. (optional) Set `export TF_VAR_domains='["domain1.com","domain2.org"]'` with the domains, with primary domain first
   - If no domains specified, it'll just use a CloudFront generated domain
1. Set `export AWS_ACCESS_KEY_ID="<your AWS user's access key ID>"` 
1. Set `export AWS_SECRET_ACCESS_KEY="<your AWS secret access key>"` 
1. Setup Terraform: `terraform init -backend-config="bucket=${TF_VAR_bucket_name}-terraform-state" -backend-config="dynamodb_table=${TF_VAR_bucket_name}-terraform-state"`
1. Build the infrastructure:  `terraform apply` and then type `yes`
1. Navigate back to the base of the repository: `cd ../../..`
1. Build the apps: `npm run build`
1. Deploy the app's files: `aws s3 sync build/. s3://$TF_VAR_bucket_name --delete`
1. Get the URL: `terraform output` and then navigate to one of the URLs in your browser
1. Take down the site: `terraform destroy` (TODO: Remove this when state is stored centrally)