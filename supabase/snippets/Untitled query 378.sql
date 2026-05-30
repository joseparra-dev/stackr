BEGIN;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"d7ca8279-773f-48c2-b1fd-2df444748bed","role":"authenticated"}',
  true
);

SELECT * FROM public.assets;

ROLLBACK;