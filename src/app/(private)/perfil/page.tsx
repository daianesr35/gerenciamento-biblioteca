'use client';

import { useState, type ReactNode } from 'react';

import {
  Button,
  Card,
  Input,
  PageHeading,
  Select,
  Textarea,
} from '@/components/ui';

type IconName =
  | 'activity'
  | 'book'
  | 'calendar'
  | 'camera'
  | 'clock'
  | 'devices'
  | 'globe'
  | 'loan'
  | 'lock'
  | 'preferences'
  | 'request'
  | 'trash'
  | 'user';

function ProfileIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    activity: <path d="M4 12h3l2-5 4 10 2-5h5" />,
    book: (
      <path d="M12 6c-2.6-2-5.7-2.5-9-1v14c3.3-1.5 6.4-1 9 1m0-14c2.6-2 5.7-2.5 9-1v14c-3.3-1.5-6.4-1-9 1m0-14v14" />
    ),
    calendar: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="5" />
        <path d="M8 3v4m8-4v4M3 10h18" />
      </>
    ),
    camera: (
      <>
        <path d="M4 8h3l2-3h6l2 3h3v11H4Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    devices: (
      <>
        <rect height="12" rx="1" width="18" x="3" y="4" />
        <path d="M8 20h8m-4-4v4" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" />
      </>
    ),
    loan: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 21c0-5 2-8 6-8s6 3 6 8m6-5c2.3.7 3 2.4 3 5" />
      </>
    ),
    lock: (
      <>
        <rect height="11" rx="2" width="16" x="4" y="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    preferences: (
      <>
        <path d="M4 7h10m4 0h2M4 17h2m4 0h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>
    ),
    request: (
      <>
        <path d="M8 12a4 4 0 1 1 4-4" />
        <path d="M2 21c0-4 2-7 6-7 2 0 3.4.7 4.4 1.7M16 6v6m-3-3h6" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7" />
        <path d="M10 11v6m4-6v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

const accountRows = [
  { icon: 'user', label: 'Tipo de conta', value: 'Proprietária', badge: true },
  { icon: 'calendar', label: 'Membro desde', value: '15 de março de 2024' },
  {
    icon: 'clock',
    label: 'Último acesso',
    value: '25 de maio de 2024 às 16:40',
  },
  { icon: 'book', label: 'Total de livros', value: '128' },
  { icon: 'loan', label: 'Total de empréstimos', value: '30' },
  { icon: 'request', label: 'Total de solicitações', value: '11' },
] as const;

const activities = [
  {
    icon: 'book',
    tone: 'green',
    title: 'Livro cadastrado',
    detail: 'O Senhor dos Anéis',
    date: '25/05/2024',
    time: 'às 14:32',
  },
  {
    icon: 'loan',
    tone: 'orange',
    title: 'Empréstimo registrado',
    detail: 'Para José Silva',
    date: '25/05/2024',
    time: 'às 10:15',
  },
  {
    icon: 'activity',
    tone: 'blue',
    title: 'Devolução registrada',
    detail: '1984',
    date: '24/05/2024',
    time: 'às 09:08',
  },
] as const;

export default function ProfilePage() {
  const [feedback, setFeedback] = useState('');

  return (
    <div className="profile-page">
      <PageHeading
        description="Gerencie suas informações pessoais e preferências da conta."
        title="Perfil"
      />
      <nav aria-label="Seções do perfil" className="profile-tabs">
        <button aria-current="page" className="active" type="button">
          <ProfileIcon name="user" />
          Informações pessoais
        </button>
        <button
          onClick={() =>
            setFeedback('As preferências são apresentadas nesta mesma tela.')
          }
          type="button"
        >
          <ProfileIcon name="preferences" />
          Preferências
        </button>
        <button
          onClick={() =>
            setFeedback(
              'As opções de segurança são apresentadas nesta mesma tela.',
            )
          }
          type="button"
        >
          <ProfileIcon name="lock" />
          Segurança
        </button>
        <button
          onClick={() =>
            setFeedback(
              'O gerenciamento de dispositivos será integrado em etapa futura.',
            )
          }
          type="button"
        >
          <ProfileIcon name="devices" />
          Dispositivos
        </button>
      </nav>

      <div className="profile-layout">
        <div className="profile-main">
          <Card className="profile-card personal-card">
            <h2>Informações pessoais</h2>
            <form
              className="personal-form"
              onReset={() => setFeedback('Alterações descartadas.')}
              onSubmit={(event) => {
                event.preventDefault();
                if (!event.currentTarget.checkValidity()) {
                  event.currentTarget.reportValidity();
                  return;
                }
                setFeedback(
                  'Alterações validadas. A persistência será integrada em etapa futura.',
                );
              }}
            >
              <div className="profile-photo">
                <div
                  aria-label="Avatar de Daiane Ribeiro"
                  className="profile-avatar"
                  role="img"
                >
                  DR
                </div>
                <button
                  aria-label="Selecionar nova foto do perfil"
                  className="camera-button"
                  onClick={() =>
                    setFeedback(
                      'O upload de foto será integrado em etapa futura.',
                    )
                  }
                  type="button"
                >
                  <ProfileIcon name="camera" />
                </button>
                <Button
                  className="change-photo"
                  onClick={() =>
                    setFeedback(
                      'O upload de foto será integrado em etapa futura.',
                    )
                  }
                  type="button"
                >
                  Alterar foto
                </Button>
                <p>
                  PNG, JPG ou WEBP.
                  <br />
                  Máx. 2MB.
                </p>
              </div>
              <div className="profile-fields">
                <Input
                  defaultValue="Daiane Maria dos Santos Ribeiro"
                  label="Nome completo"
                  name="name"
                  required
                />
                <Input
                  defaultValue="daiane.ribeiro@email.com"
                  label="E-mail"
                  name="email"
                  required
                  type="email"
                />
                <div className="profile-field-row">
                  <Input
                    defaultValue="(87) 98877-6655"
                    label="Telefone"
                    name="phone"
                    type="tel"
                  />
                  <Input
                    defaultValue="1995-04-15"
                    label="Data de nascimento"
                    name="birthdate"
                    type="date"
                  />
                </div>
                <Textarea
                  defaultValue="Apaixonada por livros e boa organização."
                  label="Bio (opcional)"
                  name="bio"
                />
                <div className="profile-actions">
                  <Button type="reset">Cancelar</Button>
                  <Button type="submit" variant="primary">
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <Card className="profile-card preferences-card">
            <h2>Preferências pessoais</h2>
            <div className="preferences-grid">
              <div className="profile-select">
                <ProfileIcon name="globe" />
                <Select
                  defaultValue="pt-BR"
                  label="Idioma"
                  name="profile-language"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                </Select>
              </div>
              <div className="profile-select">
                <ProfileIcon name="clock" />
                <Select
                  defaultValue="brasilia"
                  label="Fuso horário"
                  name="profile-timezone"
                >
                  <option value="brasilia">(GMT-03:00) Brasília</option>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="profile-card password-card">
            <h2>Alterar senha</h2>
            <div className="password-grid">
              <Input
                autoComplete="current-password"
                label="Senha atual"
                name="current-password"
                placeholder="Digite sua senha atual"
                type="password"
              />
              <Input
                autoComplete="new-password"
                label="Nova senha"
                name="new-password"
                placeholder="Digite sua nova senha"
                type="password"
              />
              <Input
                autoComplete="new-password"
                label="Confirmar nova senha"
                name="confirm-password"
                placeholder="Confirme sua nova senha"
                type="password"
              />
            </div>
            <div className="password-actions">
              <Button
                onClick={() =>
                  setFeedback(
                    'A alteração de senha será integrada em etapa futura.',
                  )
                }
                type="button"
              >
                Atualizar senha
              </Button>
            </div>
          </Card>
        </div>

        <aside
          className="profile-aside"
          aria-label="Informações complementares da conta"
        >
          <Card className="profile-card account-card">
            <h2>Resumo da conta</h2>
            <dl>
              {accountRows.map((item) => (
                <div key={item.label}>
                  <dt>
                    <ProfileIcon name={item.icon} />
                    {item.label}
                  </dt>
                  <dd className={'badge' in item ? 'account-badge' : undefined}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="profile-card activity-card">
            <h2>Atividade da conta</h2>
            <ul>
              {activities.map((item) => (
                <li key={`${item.title}-${item.date}`}>
                  <span className={`activity-icon ${item.tone}`}>
                    <ProfileIcon name={item.icon} />
                  </span>
                  <span className="activity-copy">
                    <strong>{item.title}</strong>
                    <span>{item.detail}</span>
                  </span>
                  <time
                    dateTime={`${item.date.split('/').reverse().join('-')}T${item.time.slice(3)}`}
                  >
                    {item.date}
                    <br />
                    {item.time}
                  </time>
                </li>
              ))}
            </ul>
            <button
              className="activity-link"
              onClick={() =>
                setFeedback(
                  'O histórico completo será integrado em etapa futura.',
                )
              }
              type="button"
            >
              Ver todas as atividades <span aria-hidden="true">→</span>
            </button>
          </Card>
          <Card className="profile-card danger-card">
            <h2>Excluir conta</h2>
            <p>
              Ao excluir sua conta, todos os seus dados serão removidos
              permanentemente e não poderão ser recuperados.
            </p>
            <Button
              onClick={() =>
                setFeedback(
                  'A exclusão de conta não está disponível nesta etapa.',
                )
              }
              type="button"
              variant="danger"
            >
              <ProfileIcon name="trash" />
              Excluir minha conta
            </Button>
          </Card>
        </aside>
      </div>
      <div
        aria-atomic="true"
        aria-live="polite"
        className="feedback profile-feedback"
        role="status"
      >
        {feedback}
      </div>
    </div>
  );
}
