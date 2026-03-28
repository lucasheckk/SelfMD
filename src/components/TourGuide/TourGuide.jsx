import React, { useState, useEffect, useRef, useCallback } from "react";
import "./TourGuide.scss";

// ─── Dados do exemplo — tabela "usuarios" ─────────────────────────────────────
const DEMO_NOME_TABELA = "usuarios";

const DEMO_COLUNAS = [
  {
    nome: "id",
    primaryKey: true,
    tipoDado: "Número",
    config: { naoNulo: true, unico: false, indexado: false, autoIncrem: true },
  },
  {
    nome: "nome",
    primaryKey: false,
    tipoDado: "Texto",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
  {
    nome: "cpf",
    primaryKey: false,
    tipoDado: "Número",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
  {
    nome: "data_nascimento",
    primaryKey: false,
    tipoDado: "Data",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
  {
    nome: "conta_ativada",
    primaryKey: false,
    tipoDado: "Booleano",
    config: {
      naoNulo: false,
      unico: false,
      indexado: false,
      autoIncrem: false,
    },
  },
];

const CONFIG_LABELS = {
  naoNulo: "Não nulo",
  unico: "Único",
  indexado: "Indexado",
  autoIncrem: "Auto-incremento",
};

const TODOS_TIPOS = ["Texto", "Número", "Data", "Booleano", "Lista", "JSON"];

// ─── Passos do tour ───────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    type: "center",
    selector: null,
    placement: "center",
    title: "Bem-vindo ao Sistema! 👋",
    description:
      "Vamos fazer um tour rápido para você conhecer o layout e ver como funciona a criação de uma tabela na prática.",
  },
  {
    type: "demo-step1",
    selector: null,
    placement: "center",
    title: "Passo 1 — Nome da tabela",
    description:
      "Ao criar uma tabela, o primeiro passo é definir o nome. Veja um exemplo com a tabela de usuários:",
  },
  {
    type: "demo-step2",
    selector: null,
    placement: "center",
    title: "Passo 2 — Definir colunas",
    description:
      "No segundo passo você configura as colunas: nome, tipo de dado, se é chave primária e outras opções.",
  },
  {
    type: "spotlight",
    selector: ".tab-layout",
    placement: "bottom",
    title: "Abas de tabelas",
    description:
      "Cada aba representa uma tabela do seu banco de dados. Clique em uma aba para visualizar seus registros.",
  },
  {
    type: "spotlight",
    selector: ".new-tab-btn",
    placement: "bottom",
    title: "Criar nova tabela",
    description:
      'Clique no "+" para abrir o assistente de criação. Você define o nome e as colunas em dois passos simples.',
  },
  {
    type: "spotlight",
    selector: ".table-header",
    placement: "bottom",
    title: "Contagem de registros",
    description:
      "Aqui você vê quantos registros existem na tabela ativa no momento.",
  },
  {
    type: "spotlight",
    selector: ".selection-bar",
    placement: "bottom",
    title: "Barra de seleção",
    description:
      "Ao selecionar linhas, esta barra exibe quantos itens foram marcados e oferece ações em massa — como exclusão.",
  },
  {
    type: "spotlight",
    selector: ".sticky-checkbox",
    placement: "right",
    title: "Seleção de linhas",
    description:
      "Use o checkbox para selecionar linhas individualmente. O botão no cabeçalho seleciona ou desmarca todas.",
  },
  {
    type: "spotlight",
    selector: ".sticky-id",
    placement: "right",
    title: "Coluna ID",
    description:
      "O identificador único de cada registro. Fica fixado à esquerda para sempre estar visível ao rolar.",
  },
  {
    type: "spotlight",
    selector: ".resizable-col",
    placement: "bottom",
    title: "Colunas redimensionáveis",
    description:
      "Arraste o ícone de setas no cabeçalho para ajustar a largura de qualquer coluna conforme precisar.",
  },
  {
    type: "spotlight",
    selector: ".actions-header",
    placement: "left",
    title: "Ações da tabela",
    description:
      "Botões para configurar as colunas visíveis e gerenciar a estrutura da tabela. Fixado à direita.",
  },
  {
    type: "spotlight",
    selector: ".actions-cell",
    placement: "left",
    title: "Ações por registro",
    description:
      "Cada linha tem botões para editar ou excluir aquele registro específico. Sempre visíveis à direita.",
  },
  {
    type: "center",
    selector: null,
    placement: "center",
    title: "Tudo pronto! 🚀",
    description:
      'Você já conhece o layout e sabe como criar uma tabela. Clique no "+" para começar!',
  },
];

// ─── Demo Step 1 — animação de digitação ──────────────────────────────────────
function DemoStep1() {
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [blink, setBlink] = useState(true);
  const target = DEMO_NOME_TABELA;
  const charMax = 15;

  useEffect(() => {
    setTyped("");
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(iv);
        setDone(true);
      }
    }, 100);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="demo-wizard">
      <div className="demo-wizard-header">
        <div className="demo-steps-indicator">
          <span className="demo-step-dot demo-step-done">1</span>
          <span className="demo-step-line" />
          <span className="demo-step-dot">2</span>
        </div>
        <span className="demo-badge">Prévia</span>
      </div>

      <div className="demo-wizard-body">
        <p className="demo-field-label">Nome da tabela</p>

        <div className={`demo-input-field ${done ? "demo-input-done" : ""}`}>
          <span className="demo-typed">{typed}</span>
          <span className={`demo-cursor ${blink ? "demo-cursor-on" : ""}`}>
            |
          </span>
        </div>

        <div className="demo-char-track">
          <div
            className="demo-char-fill"
            style={{
              width: `${Math.min((typed.length / charMax) * 100, 100)}%`,
            }}
          />
        </div>
        <span className="demo-char-hint">
          {typed.length} / {charMax} caracteres
        </span>
      </div>

      <div className="demo-wizard-footer">
        <span className="demo-btn-fake demo-btn-fake--ghost">Cancelar</span>
        <span
          className={`demo-btn-fake demo-btn-fake--primary ${done ? "demo-btn-pulse" : ""}`}
        >
          Próximo →
        </span>
      </div>
    </div>
  );
}

// ─── Demo Step 2 — colunas aparecem em cascata ────────────────────────────────
function DemoStep2() {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    setRevealed(0);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setRevealed(i);
      if (i >= DEMO_COLUNAS.length) clearInterval(iv);
    }, 300);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="demo-wizard demo-wizard--wide">
      <div className="demo-wizard-header">
        <div className="demo-steps-indicator">
          <span className="demo-step-dot demo-step-done">1</span>
          <span className="demo-step-line demo-step-line--done" />
          <span className="demo-step-dot demo-step-done">2</span>
        </div>
        <span className="demo-badge">
          Prévia · tabela: <strong>usuarios</strong>
        </span>
      </div>

      <div className="demo-cols-scroll">
        {/* Cabeçalho da grid */}
        <div className="demo-cols-grid demo-cols-head">
          <span>Nome</span>
          <span className="txt-center">PK</span>
          <span>Tipo de dado</span>
          <span>Configurações</span>
        </div>

        {/* Linhas de colunas */}
        {DEMO_COLUNAS.map((col, idx) => (
          <div
            key={col.nome}
            className={`demo-cols-grid demo-cols-row ${
              idx < revealed ? "demo-cols-row--in" : ""
            }`}
          >
            {/* Nome */}
            <span className="demo-col-name">{col.nome}</span>

            {/* PK */}
            <div className="txt-center">
              <span
                className={`demo-pk-icon ${col.primaryKey ? "demo-pk-icon--on" : ""}`}
              >
                <i
                  className={`fi ${col.primaryKey ? "fi-sr-key" : "fi-rr-key"}`}
                />
              </span>
            </div>

            {/* Tipo — pills, a ativa destacada */}
            <div className="demo-pills-wrap">
              {TODOS_TIPOS.map((t) => (
                <span
                  key={t}
                  className={`demo-pill ${col.tipoDado === t ? "demo-pill--on" : ""}`}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Config */}
            <div className="demo-pills-wrap">
              {Object.entries(col.config).map(([key, val]) => (
                <span
                  key={key}
                  className={`demo-pill ${val ? "demo-pill--on" : ""}`}
                >
                  {CONFIG_LABELS[key]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="demo-wizard-footer">
        <span className="demo-btn-fake demo-btn-fake--ghost">← Voltar</span>
        <span className="demo-btn-fake demo-btn-fake--primary demo-btn-pulse">
          <i className="fi fi-rr-check" /> Criar tabela
        </span>
      </div>
    </div>
  );
}

// ─── TourGuide principal ──────────────────────────────────────────────────────
export function TourGuide({ onFinish }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const current = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;
  const isDemo = current.type === "demo-step1" || current.type === "demo-step2";

  // ── Medir alvo ───────────────────────────────────────────────────────────
  const measureTarget = useCallback((s) => {
    const ts = TOUR_STEPS[s];
    if (ts.type !== "spotlight" || !ts.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(ts.selector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      measureTarget(step);
      setVisible(true);
    }, 130);
    return () => clearTimeout(t);
  }, [step, measureTarget]);

  // ── Posicionar tooltip ───────────────────────────────────────────────────
  useEffect(() => {
    if (!tooltipRef.current) return;
    const tip = tooltipRef.current.getBoundingClientRect();
    const pad = 20;

    if (!rect || current.placement === "center" || isDemo) {
      setTooltipPos({
        top: window.innerHeight / 2 - tip.height / 2,
        left: window.innerWidth / 2 - tip.width / 2,
      });
      return;
    }

    let top = 0,
      left = 0;
    switch (current.placement) {
      case "bottom":
        top = rect.top + rect.height + pad;
        left = rect.left + rect.width / 2 - tip.width / 2;
        break;
      case "top":
        top = rect.top - tip.height - pad;
        left = rect.left + rect.width / 2 - tip.width / 2;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tip.height / 2;
        left = rect.left + rect.width + pad;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tip.height / 2;
        left = rect.left - tip.width - pad;
        break;
      default:
        break;
    }

    top = Math.max(8, Math.min(top, window.innerHeight - tip.height - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tip.width - 8));
    setTooltipPos({ top, left });
  }, [rect, visible, step, current.placement, isDemo]);

  // ── Navegação ────────────────────────────────────────────────────────────
  const goNext = () => {
    if (isLast) {
      onFinish();
      return;
    }
    setStep((s) => s + 1);
  };
  const goPrev = () => {
    if (!isFirst) setStep((s) => s - 1);
  };

  // ── Spotlight SVG ────────────────────────────────────────────────────────
  const R = 10,
    P = 8;
  const buildClip = () => {
    if (!rect) return null;
    const x = rect.left - P,
      y = rect.top - P;
    const w = rect.width + P * 2,
      h = rect.height + P * 2;
    return (
      `M ${x + R} ${y} H ${x + w - R} Q ${x + w} ${y} ${x + w} ${y + R} ` +
      `V ${y + h - R} Q ${x + w} ${y + h} ${x + w - R} ${y + h} ` +
      `H ${x + R} Q ${x} ${y + h} ${x} ${y + h - R} ` +
      `V ${y + R} Q ${x} ${y} ${x + R} ${y} Z`
    );
  };
  const clip = buildClip();
  const arrowClass =
    !isDemo && current.placement !== "center"
      ? `tooltip-arrow tooltip-arrow--${current.placement}`
      : "";

  return (
    <div className="tour-backdrop">
      {/* Overlay */}
      <svg
        className="tour-svg"
        width={window.innerWidth}
        height={window.innerHeight}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {clip && <path d={clip} fill="black" />}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={isDemo ? "rgba(0,0,0,0.84)" : "rgba(0,0,0,0.72)"}
          mask="url(#tour-mask)"
        />
        {clip && (
          <path
            d={clip}
            fill="none"
            stroke="rgba(255,255,255,0.28)"
            strokeWidth="2"
            className="tour-ring"
          />
        )}
      </svg>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={[
          "tour-tooltip",
          visible ? "tour-tooltip--visible" : "",
          arrowClass,
          isDemo ? "tour-tooltip--wide tour-tooltip--demo" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {/* Progresso */}
        <div className="tour-progress">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`tour-progress-dot ${i === step ? "active" : i < step ? "done" : ""}`}
            />
          ))}
        </div>

        {/* Texto */}
        <div className="tour-text-block">
          <h3 className="tour-title">{current.title}</h3>
          <p className="tour-desc">{current.description}</p>
        </div>

        {/* Demos embutidos */}
        {current.type === "demo-step1" && <DemoStep1 key={`demo1-${step}`} />}
        {current.type === "demo-step2" && <DemoStep2 key={`demo2-${step}`} />}

        {/* Rodapé */}
        <div className="tour-footer">
          <button className="tour-btn-cancel" onClick={onFinish}>
            Pular tour
          </button>
          <div className="tour-nav">
            <button
              className="tour-btn-nav tour-btn-prev"
              onClick={goPrev}
              disabled={isFirst}
            >
              <i className="fi fi-rr-arrow-left" /> Voltar
            </button>
            <button className="tour-btn-nav tour-btn-next" onClick={goNext}>
              {isLast ? (
                <>
                  <i className="fi fi-rr-check" /> Começar
                </>
              ) : (
                <>
                  Avançar <i className="fi fi-rr-arrow-right" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
