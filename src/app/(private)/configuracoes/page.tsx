'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';

import { Badge, Button, ButtonLink, PageHeading } from '@/components/ui';

type IconName =
  | 'calendar'
  | 'clock'
  | 'database'
  | 'download'
  | 'info'
  | 'language'
  | 'mail'
  | 'palette'
  | 'shield'
  | 'trash'
  | 'user'
  | 'users';

function SettingsIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    calendar: (
      <>
        <rect height="16" rx="2" width="18" x="3" y="5" />
        <path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    language: (
      <>
        <path d="M7 3h8l4 4v14H7z" />
        <path d="M15 3v5h4M10 11h6M13 10v7M10 17h6" />
      </>
    ),
    mail: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    palette: (
      <>
        <path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.6-1.4-.3-.4-.5-.9-.5-1.4a2 2 0 0 1 2-2H17a5 5 0 0 0 5-5C22 5.7 17.5 2 12 2Z" />
        <circle cx="7.5" cy="12.5" r=".8" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="7.5" r=".8" fill="currentColor" stroke="none" />
        <circle cx="13.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
        <circle cx="17.5" cy="10.5" r=".8" fill="currentColor" stroke="none" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-5 3-8 8-8s8 3 8 8" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3 21c0-5 2-8 6-8s6 3 6 8M15 15c1-.7 2-1 3-1 3 0 5 2 5 6" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function SettingIcon({ name, tone }: { name: IconName; tone: string }) {
  return (
    <span aria-hidden="true" className={`settings-icon ${tone}`}>
      <SettingsIcon name={name} />
    </span>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <span className="settings-toggle-control">
      <button
        aria-checked={checked}
        aria-label={label}
        className={`switch ${checked ? 'on' : ''}`}
        onClick={onChange}
        role="switch"
        type="button"
      />
      <span aria-hidden="true">{checked ? 'Ativado' : 'Desativado'}</span>
    </span>
  );
}

export default function SettingsPage() {
  const [automaticReturn, setAutomaticReturn] = useState(true);
  const [loanReminders, setLoanReminders] = useState(false);
  const [theme, setTheme] = useState('Claro');
  const [color, setColor] = useState('Marrom');
  const [feedback, setFeedback] = useState('');

  function announce(message: string) {
    setFeedback(message);
  }

  return (
    <div className="settings-page">
      <PageHeading
        description="Gerencie suas preferências e personalize sua biblioteca."
        title="Configurações"
      />

      <nav aria-label="Seções de configurações" className="settings-tabs">
        {[
          'Geral',
          'Perfil',
          'Notificações',
          'Privacidade',
          'Segurança',
          'Gerenciamento',
        ].map((item, index) =>
          item === 'Perfil' ? (
            <ButtonLink href="/perfil" key={item}>
              {item}
            </ButtonLink>
          ) : (
            <button
              aria-current={index === 0 ? 'page' : undefined}
              className={index === 0 ? 'active' : ''}
              key={item}
              onClick={() =>
                index > 0 &&
                announce(`${item}: seção representada visualmente nesta etapa.`)
              }
              type="button"
            >
              {item}
            </button>
          ),
        )}
      </nav>

      <div className="settings-layout">
        <div className="settings-main">
          <section
            aria-labelledby="library-preferences"
            className="settings-card"
          >
            <h2 id="library-preferences">1. Preferências da biblioteca</h2>
            <div className="setting-row">
              <SettingIcon name="language" tone="blue" />
              <div className="setting-copy">
                <strong>Idioma do sistema</strong>
                <p>Escolha o idioma da interface.</p>
              </div>
              <label className="settings-select">
                <span className="sr-only">Idioma do sistema</span>
                <select defaultValue="pt-BR">
                  <option value="pt-BR">Português (Brasil)</option>
                </select>
              </label>
            </div>
            <div className="setting-row">
              <SettingIcon name="clock" tone="green" />
              <div className="setting-copy">
                <strong>Fuso horário</strong>
                <p>Define o fuso horário utilizado nas datas do sistema.</p>
              </div>
              <label className="settings-select">
                <span className="sr-only">Fuso horário</span>
                <select defaultValue="brasilia">
                  <option value="brasilia">(GMT-03:00) Brasília</option>
                </select>
              </label>
            </div>
            <div className="setting-row">
              <SettingIcon name="calendar" tone="purple" />
              <div className="setting-copy">
                <strong>Formato de data</strong>
                <p>Escolha como as datas serão exibidas.</p>
              </div>
              <label className="settings-select">
                <span className="sr-only">Formato de data</span>
                <select defaultValue="day-first">
                  <option value="day-first">DD/MM/AAAA</option>
                </select>
              </label>
            </div>
          </section>

          <section aria-labelledby="loan-preferences" className="settings-card">
            <h2 id="loan-preferences">2. Preferências de empréstimo</h2>
            <div className="setting-row">
              <SettingIcon name="calendar" tone="orange" />
              <div className="setting-copy">
                <strong>Registro da data de devolução</strong>
                <p>
                  Defina se a data de devolução será registrada automaticamente
                  quando o livro for devolvido.
                </p>
              </div>
              <Toggle
                checked={automaticReturn}
                label="Registrar data de devolução automaticamente"
                onChange={() => setAutomaticReturn((value) => !value)}
              />
            </div>
            <div className="setting-row">
              <SettingIcon name="clock" tone="blue" />
              <div className="setting-copy">
                <strong>Lembrete de empréstimos</strong>
                <p>Receba lembretes para acompanhar os livros emprestados.</p>
              </div>
              <Toggle
                checked={loanReminders}
                label="Ativar lembretes de empréstimos"
                onChange={() => setLoanReminders((value) => !value)}
              />
            </div>
            <div className="setting-row">
              <SettingIcon name="users" tone="green" />
              <div className="setting-copy">
                <strong>Origem do contato</strong>
                <p>
                  Gerencie as opções de origem de contato disponíveis para
                  identificar as pessoas que recebem empréstimos.
                </p>
              </div>
              <Button
                onClick={() =>
                  announce('Gerenciamento de origens simulado nesta etapa.')
                }
              >
                Gerenciar origens
              </Button>
            </div>
          </section>

          <section aria-labelledby="customization" className="settings-card">
            <h2 id="customization">3. Personalização</h2>
            <div className="setting-row">
              <SettingIcon name="palette" tone="red" />
              <div className="setting-copy">
                <strong>Tema da aplicação</strong>
                <p>Escolha o tema que será usado na interface.</p>
              </div>
              <div
                aria-label="Tema da aplicação"
                className="theme-options"
                role="group"
              >
                {['Claro', 'Escuro', 'Sistema'].map((item) => (
                  <button
                    aria-pressed={theme === item}
                    key={item}
                    onClick={() => setTheme(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-row">
              <SettingIcon name="palette" tone="cyan" />
              <div className="setting-copy">
                <strong>Cor principal</strong>
                <p>Personalize a cor principal da aplicação.</p>
              </div>
              <div
                aria-label="Cor principal"
                className="color-options"
                role="group"
              >
                {[
                  ['Marrom', '#4a2618'],
                  ['Azul', '#2878c7'],
                  ['Verde', '#32945a'],
                  ['Roxo', '#7443b3'],
                  ['Rosa', '#c91f4f'],
                  ['Laranja', '#e86b05'],
                ].map(([name, value]) => (
                  <button
                    aria-label={name}
                    aria-pressed={color === name}
                    key={name}
                    onClick={() => setColor(name)}
                    style={{ '--swatch': value } as CSSProperties}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </section>

          <section aria-labelledby="maintenance" className="settings-card">
            <h2 id="maintenance">4. Manutenção</h2>
            <div className="setting-row">
              <SettingIcon name="database" tone="yellow" />
              <div className="setting-copy">
                <strong>Limpar dados temporários</strong>
                <p>
                  Remove caches e dados temporários para otimizar o sistema.
                </p>
              </div>
              <Button onClick={() => announce('Limpeza simulada nesta etapa.')}>
                Limpar agora
              </Button>
            </div>
            <div className="setting-row">
              <SettingIcon name="trash" tone="red" />
              <div className="setting-copy">
                <strong>Excluir conta</strong>
                <p>
                  Exclua permanentemente sua conta e todos os dados do sistema.
                  Essa ação não pode ser desfeita.
                </p>
              </div>
              <Button
                onClick={() => announce('Exclusão simulada nesta etapa.')}
                variant="danger"
              >
                Excluir conta
              </Button>
            </div>
          </section>
        </div>

        <aside className="settings-aside">
          <section
            aria-labelledby="about-system"
            className="settings-card side-card"
          >
            <div className="side-card-title">
              <SettingIcon name="info" tone="blue" />
              <h2 id="about-system">Sobre o sistema</h2>
            </div>
            <strong>Sistema de Gerenciamento de Biblioteca Pessoal</strong>
            <p className="muted">Versão 1.0.0</p>
            <p>
              Organize, encontre e gerencie todos os livros da sua coleção de
              forma simples e eficiente.
            </p>
            <Button
              onClick={() =>
                announce('Você está usando a versão visual 1.0.0.')
              }
            >
              Ver novidades da versão
            </Button>
          </section>

          <section
            aria-labelledby="account"
            className="settings-card side-card"
          >
            <div className="side-card-title">
              <SettingIcon name="user" tone="green" />
              <h2 id="account">Conta</h2>
            </div>
            <dl className="account-list">
              <div>
                <dt>Nome</dt>
                <dd>Daiane Maria dos Santos Ribeiro</dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>daiane.ribeiro@email.com</dd>
              </div>
              <div>
                <dt>Tipo de conta</dt>
                <dd>
                  <Badge tone="success">Proprietária</Badge>
                </dd>
              </div>
              <div>
                <dt>Membro desde</dt>
                <dd>15 de março de 2024</dd>
              </div>
            </dl>
            <ButtonLink href="/perfil">Editar perfil</ButtonLink>
          </section>

          <section
            aria-labelledby="data-export"
            className="settings-card side-card"
          >
            <div className="side-card-title">
              <SettingIcon name="download" tone="purple" />
              <h2 id="data-export">Exportação de dados</h2>
            </div>
            <p className="muted">
              Faça backup dos seus dados a qualquer momento.
            </p>
            <div className="export-row">
              <div>
                <strong>Exportar biblioteca</strong>
                <span>
                  Exporte todos os livros, autores, categorias, etiquetas e
                  estantes.
                </span>
              </div>
              <Button
                onClick={() => announce('Exportação simulada nesta etapa.')}
              >
                Exportar
              </Button>
            </div>
            <div className="export-row">
              <div>
                <strong>Exportar empréstimos</strong>
                <span>Exporte o histórico de empréstimos realizados.</span>
              </div>
              <Button
                onClick={() => announce('Exportação simulada nesta etapa.')}
              >
                Exportar
              </Button>
            </div>
            <p className="privacy-note">
              <SettingsIcon name="shield" />
              Seus dados são seus. Você pode exportar a qualquer momento para
              manter um backup seguro.
            </p>
          </section>
        </aside>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {feedback}
      </div>
    </div>
  );
}
