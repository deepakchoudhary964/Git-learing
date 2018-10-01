# NomadPlay API
Stack: NodeJS, MongoDB, Mongoose, REDIS, ELastic Search

## Installation:

git clone ​git@bitbucket.org​:ju_hum/dms_auth_server.git

Créez un fichier ".env" contenant les lignes suivantes :

PORT=Port souhaité  
DB=Addresse de la base de données mongo (Ex : mongodb://localhost/dms) MAILER_HOST=Adresse SMTP   
MAILER_PORT=Port SMTP  
MAILER_SECURE=true ou false  
MAILER_USER=USER SMTP  
MAILER_PASS=PASSWORD SMTP  
JWT_SECRET=Clé secrète JWT à générer  
JWT_ALGORITHM=HS256  
GOOGLE_OAUTH2_CLIENT_ID=Google OAUTH2 Client ID (à récupérer sur https://console.developers.google.com) GOOGLE_OAUTH2_SECRET=Google OAUTH2 Secret (à récupérer sur https://console.developers.google.com​)
STRIPE_PUBLIC_KEY=
STRIPE_PRIVATE_KEY=
CHECK_EXPIRY_EMAIL_VERIFY_LINK=
REDIS_PORT=
REDIS_HOST=
REDIS_PASSWORD=

yarn install
node index_no_ssl.js (pour tester sans SSL)
node index.js (avec SSL, pour production)

L’application est ensuite accessible sur le port défini dans le fichier .env

Vous pouvez aussi utiliser ​https://github.com/Unitech/pm2​ pour gérer les process node

## Node et MongoDB - Instructions de démarrage:

_Note: MongoDB doit être démarré em premier_ 

Démarrer MongoDB en service en arrière plan: 

`mongod --dbpath /var/lib/mongodb --fork --logpath /var/log/mongodb.log`

Démarrer l'API en service en arrière plan:

`pm2 start index.js`

En une seule commande, par ordre: 

`mongod --dbpath /var/lib/mongodb --fork --logpath /var/log/mongodb.log && pm2 start index.js`

## Base de Données MongoDB
Nom de la base de données: "dms"  

Tables:  

- User  
- RefreshToken  
- ResetPassword  
- Compositions_en
- Compositions_fr
- Concerts
- Instruments_en
- Instruments_fr

## Exporter la Base de données DMS:
`mongoexport -h mongodb://localhost:27017 -d dms -c User -o ~/.testoutput.json`
