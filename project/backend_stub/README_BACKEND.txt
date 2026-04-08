Решайка — backend integration stub

Ниже список endpoint'ов, которые должен отдать backend:

1. POST /auth/login
   request:
   {
     "email": "string",
     "password": "string"
   }

   response 200:
   {
     "token": "string",
     "user": {
       "id": "string",
       "name": "string",
       "email": "string",
       "childName": "string"
     }
   }

2. POST /auth/register
3. POST /auth/recover
4. POST /auth/logout
5. GET /user/profile
6. PATCH /user/profile
7. GET /billing/subscription
8. POST /billing/restore

Что уже ожидает frontend:
- Bearer token для авторизованных запросов
- user.name
- user.email
- user.childName
- subscription.status
- subscription.plan
- subscription.source
- subscription.renewalAt

Что можно сделать следующим реальным шагом:
- заменить API_BASE_URL в src/config/env.js
- поднять backend по этим контрактам
- проверить login/register/profile/subscription
- потом подключать настоящую store billing логику
