create table public.proprietarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  constraint proprietarios_nome_nao_vazio check (btrim(nome) <> ''),
  constraint proprietarios_email_nao_vazio check (btrim(email) <> ''),
  constraint proprietarios_email_unico unique (email)
);

create table public.bibliotecas (
  id uuid primary key default gen_random_uuid(),
  proprietario_id uuid not null,
  identificador_publico uuid not null default gen_random_uuid(),
  constraint bibliotecas_proprietario_unico unique (proprietario_id),
  constraint bibliotecas_identificador_publico_unico unique (identificador_publico),
  constraint bibliotecas_proprietario_fk
    foreign key (proprietario_id)
    references public.proprietarios (id)
    on delete restrict
);
