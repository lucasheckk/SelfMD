import { useNavigate } from "react-router-dom";
import ElectricBorder from "../../ReactBitsCodes/ElectricBorder/ElectricBorder";
import "./Pricing.scss";

// ─── Dados dos planos ────────────────────────────────────────────────────────
// Centralizar aqui facilita editar preços/features sem tocar no JSX
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: null,
    priceLabel: "Grátis",
    badge: null,
    description: "Para explorar e experimentar o Self MD.",
    features: [
      "1 Database",
      "4 Tabelas por database",
      "6 Colunas por tabela",
      "1.000 Registros",
      "1 Automação",
    ],
    cta: "Use gratuitamente",
    variant: "free",
  },
  {
    id: "plus",
    name: "Plus",
    price: 49.9,
    priceLabel: "R$ 49,90",
    badge: "Economize 16%",
    description: "Perfeito para pequenas empresas.",
    features: [
      "2 Databases",
      "7 Tabelas por database",
      "9 Colunas por tabela",
      "3.000 Registros",
      "2 Automações",
    ],
    cta: "Obter plano Plus",
    variant: "plus",
  },
  {
    id: "ultra",
    name: "Ultra",
    price: 99.9,
    priceLabel: "R$ 99,90",
    badge: null,
    description: "Sem limites. Para quem precisa de todo o poder da Self MD.",
    features: [
      "3 Databases",
      "10 Tabelas por database",
      "12 Colunas por tabela",
      "Registros ilimitados",
      "Todas as automações",
    ],
    cta: "Obter plano Ultra",
    variant: "ultra",
  },
];

// ─── Sub-componente: card de plano ───────────────────────────────────────────
// Separado para o ElectricBorder conseguir envolvê-lo sem acoplamento
function PlanCard({ plan, onSelect }) {
  return (
    <div className={`plan-card plan-card--${plan.variant}`}>
      {plan.badge && <span className="plan-card__badge">{plan.badge}</span>}

      <div className="plan-card__header">
        <h3 className="plan-card__name">{plan.name}</h3>
        <div className="plan-card__price">
          <span className="plan-card__price-value">{plan.priceLabel}</span>
          {plan.price && <span className="plan-card__price-period">/mês</span>}
        </div>
        <p className="plan-card__description">{plan.description}</p>
      </div>

      <ul
        className="plan-card__features"
        aria-label={`Recursos do plano ${plan.name}`}
      >
        {plan.features.map((feature) => (
          <li key={feature} className="plan-card__feature-item">
            <i className="fi fi-sr-check-circle" aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        className={`plan-card__cta plan-card__cta--${plan.variant}`}
        onClick={() => onSelect(plan)}
        aria-label={`${plan.cta} — plano ${plan.name}`}
      >
        {plan.cta}
      </button>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export function Pricing() {
  const navigate = useNavigate();

  const handleSelectPlan = (plan) => {
    if (plan.id === "free") {
      navigate("/database");
    } else {
      alert(
        `Você selecionou o plano ${plan.name}! Integração de pagamento em breve.`,
      );
    }
  };

  return (
    <section className="pricing-page" aria-labelledby="pricing-title">
      {/* Cabeçalho */}
      <header className="pricing-header">
        <p className="pricing-header__eyebrow">Planos & Preços</p>
        <h1 className="pricing-header__title" id="pricing-title">
          Escolha o plano <br />
          <span className="pricing-header__title--accent">certo pra você</span>
        </h1>
      </header>

      {/* Grid de planos */}
      <div className="pricing-grid" role="list">
        {/* Free */}
        <div className="pricing-grid__item" role="listitem">
          <PlanCard plan={PLANS[0]} onSelect={handleSelectPlan} />
        </div>

        {/* Plus — glow via SCSS */}
        <div
          className="pricing-grid__item pricing-grid__item--glow"
          role="listitem"
        >
          <PlanCard plan={PLANS[1]} onSelect={handleSelectPlan} />
        </div>

        <ElectricBorder
          color="#0bcd5f"
          speed={0.8}
          chaos={0.1}
          borderRadius={20}
          className="pricing-electric-wrapper"
        >
          <PlanCard plan={PLANS[2]} onSelect={handleSelectPlan} />

          <div className="pricing-grid__item" role="listitem"></div>
        </ElectricBorder>
      </div>
    </section>
  );
}

export default Pricing;
