import "./Home.scss";
import { Menu } from "../../components/Menu/Menu";

export function Home() {
  return (
    <div className="body">
      <Menu>
        <div className="container-principal">
          <div className="criar-database">
            <i class="fi fi-sr-add"></i>
          </div>
          <div className="criar-database">
            <i class="fi fi-sr-add"></i>
          </div>
          <div className="criar-database plus">
            <i class="fi fi-sr-add"></i>
          </div>
        </div>
      </Menu>
    </div>
  );
}
