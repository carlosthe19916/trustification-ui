export AUTH_REQUIRED=true && \
export OIDC_SERVER_URL=https://sso.staging.trustification.dev/realms/chicken && \
export OIDC_SCOPE="openid email id.username api.trusted_content" && \
export TRUSTIFICATION_HUB_URL=https://api.staging.trustification.dev && \
export ANALYTICS_ENABLED=true && \
export ANALYTICS_WRITE_KEY=dFxsyACJVl09ytvbLwgRymcJleoLkmBm

npm install
cd client/ && npm install @carlosthe19916-latest/react-table-batteries --save --legacy-peer-deps
cd .. && npm run start:dev
close ide
open ide
npm run start:dev
