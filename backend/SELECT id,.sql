SELECT id,
       first_name,
       last_name,
       "registrationNumber",
       password,
       role,
       program,
       newsletter
FROM public.users
LIMIT 1000;