FROM nginx

# Bring the main configuration file
COPY ./default.conf /etc/nginx/conf.d/default.conf

# Bring assets
COPY ./devices /opt/assets/devices

# Bring the dist folder (Front end)
COPY ./dist /opt/app/

