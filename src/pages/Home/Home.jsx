import "./Home.scss";
import { Menu } from "../../components/Menu/Menu";

export function Home() {
  return (
    <div className="body">
      <Menu>
        <div className="container-principal">
          <div className="criar-database">
            <i class="fi fi-sr-layer-plus"></i>
          </div>
          <div className="criar-database">
            <i class="fi fi-sr-layer-plus"></i>
          </div>
          <div className="criar-database">
            <i class="fi fi-sr-layer-plus"></i>
            <i class="fi fi-rr-star"></i>
          </div>
        </div>
      </Menu>
    </div>
  );
}
