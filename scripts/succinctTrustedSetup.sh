#!/bin/bash -e

_usage() { echo "Usage: $0 [--entropy] [--contributorHandle] [--test] [--awsKey] [--awsSecret]" 1>&2; exit 1; }

# Default value for the command line options
export LC_ALL=c
ENTROPY=$(tr -dc 'A-F0-9' < /dev/urandom | head -c32)  # Shout out to Celo's Plumo!  https://github.com/celo-org/snark-setup/blob/master/phase2-cli/scripts/phase2_chunked.sh#L14
TEST_MODE=false
CONTRIBUTOR_HANDLE=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Parse command line args
while [ "$1" != "" ]; do
    case $1 in
    "--help")
        _usage
        exit 0
        ;;
    "--test") 
        TEST_MODE=true
        shift
        ;;
    "--contributorHandle") 
        CONTRIBUTOR_HANDLE=$2
        shift 2
        ;;
    "--entropy") 
        ENTROPY=$2
        shift 2
        ;;
    "--awsKey")
        AWS_ACCESS_KEY_ID=$2
        shift 2
        ;;
    "--awsSecret")
        AWS_SECRET_ACCESS_KEY=$2
        shift 2
        ;;
    *)
        echo "Invalid comamnd line arg $1"
        exit 1
    esac
done

if [ $TEST_MODE = true ]; then
    S3BUCKET="s3://succinct-telepathy-trusted-setup-test"
else
    S3BUCKET="s3://succinct-trusted-setup"
fi

export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION="us-east-1"

# Get my contribution number
LAST_CONTRIBUTION_CMD="aws s3 ls $S3BUCKET/0 | sed -En 's/ *PRE //p' | sed -En 's/-.*\/$//p' | sort -n | tail -1 | sed -En 's/^0*//p'"
LAST_CONTRIBUTION_NUM=$(eval "$LAST_CONTRIBUTION_CMD")
MY_CONTRIBUTOR_NUM=$((LAST_CONTRIBUTION_NUM + 1))

echo "The S3 bucket being used is: $S3BUCKET"
echo "My contributor number is: $MY_CONTRIBUTOR_NUM"

echo "Running: node build/index.js download --contributorNum $MY_CONTRIBUTOR_NUM --s3bucket $S3BUCKET"
node build/index.js download --contributorNum $MY_CONTRIBUTOR_NUM --s3bucket $S3BUCKET

echo "\n\n\n\n"
sleep 3
echo "Running: node build/index.js contribute --contributorNum $MY_CONTRIBUTOR_NUM --entropy <redacted_entropy_value>"
node build/index.js contribute --contributorNum $MY_CONTRIBUTOR_NUM --entropy $ENTROPY

echo "\n\n\n\n"
sleep 3
echo "Running: node build/index.js upload --contributorNum $MY_CONTRIBUTOR_NUM --contributorHandle $CONTRIBUTOR_HANDLE --s3bucket $S3BUCKET"
node build/index.js upload --contributorNum $MY_CONTRIBUTOR_NUM --contributorHandle $CONTRIBUTOR_HANDLE --s3bucket $S3BUCKET