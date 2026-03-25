import React from "react";
import "./System.scss";
import { SegundoMenu } from "../../components/SegundoMenu/SegundoMenu";

export function System() {
  return (
    <div className="system-container">
      <SegundoMenu />
      <main className="main-layout">
        <div className="tabs-wrapper">
          <div className="tab active">
            <div className="tab-background">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,40 L0,40 C10,40 10,0 20,0 L80,0 C90,0 90,40 100,40" />
              </svg>
            </div>
            <div className="tab-content">
              <i className="fi fi-rr-table-layout"></i>
              <button className="close-tab">
                <i className="fi fi-rr-x"></i>
              </button>
            </div>
          </div>
          <button className="new-tab">
            <i className="fi fi-rr-plus"></i>
          </button>
        </div>

        <div className="content-area">
          <div className="first-text">

          </div>
          <div className="table-content">

          </div>
        </div>
      </main>
    </div>
  );
}
