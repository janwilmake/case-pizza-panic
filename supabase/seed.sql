-- Demo data for today. Times are relative to now() so the "stuck > 30m" signal
-- is visible immediately: the received and oven orders below are intentionally old.
insert into orders
  (customer_name, customer_phone, items, note, address, status, created_at, status_updated_at, received_by, oven_by, delivery_by)
values
  ('Marlies de Vries', '0612345678',
   '[{"name":"Margherita","quantity":1,"price":9.5},{"name":"Hawaii","quantity":1,"price":11}]'::jsonb,
   'Extra pineapple please', 'Kerkstraat 12, Amsterdam',
   'received', now() - interval '45 minutes', now() - interval '45 minutes',
   'Sofia', null, null),

  ('Ahmed Yilmaz', '0698765432',
   '[{"name":"Pepperoni","quantity":2,"price":12.5}]'::jsonb,
   null, 'Damrak 81, Amsterdam',
   'oven', now() - interval '50 minutes', now() - interval '40 minutes',
   'Sofia', 'Marco', null),

  ('Lotte Jansen', null,
   '[{"name":"Quattro Formaggi","quantity":1,"price":13}]'::jsonb,
   'Ring the bell twice', 'Prinsengracht 263, Amsterdam',
   'oven', now() - interval '15 minutes', now() - interval '8 minutes',
   'Sofia', 'Marco', null),

  ('Tom Bakker', '0611223344',
   '[{"name":"Diavola","quantity":1,"price":12},{"name":"Cola","quantity":2,"price":2.5}]'::jsonb,
   null, 'Overtoom 5, Amsterdam',
   'transit', now() - interval '35 minutes', now() - interval '5 minutes',
   'Sofia', 'Marco', 'Giulia'),

  ('Emma Visser', '0655667788',
   '[{"name":"Margherita","quantity":3,"price":9.5}]'::jsonb,
   'Office order, 2nd floor', 'Herengracht 100, Amsterdam',
   'delivered', now() - interval '90 minutes', now() - interval '20 minutes',
   'Sofia', 'Marco', 'Giulia'),

  ('Daan Smit', '0644556677',
   '[{"name":"Calzone","quantity":1,"price":12.5}]'::jsonb,
   'Left it in too long...', 'Vijzelstraat 20, Amsterdam',
   'burned', now() - interval '60 minutes', now() - interval '30 minutes',
   'Sofia', 'Marco', null);
