import { useState } from "react";
import { Boop } from "@shtbox/boop";
import "./index.css";

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [panelVariant, setPanelVariant] = useState<"sidebar" | "widget">("sidebar");
  const [buttonPlacement, setButtonPlacement] = useState<"inline" | "fixed">("inline");
  const [buttonLabel, setButtonLabel] = useState("Open Boop");
  const [panelWidth, setPanelWidth] = useState(420);
  const [panelMaxHeight, setPanelMaxHeight] = useState(80);
  const [buttonOffsetRight, setButtonOffsetRight] = useState(24);
  const [buttonOffsetBottom, setButtonOffsetBottom] = useState(24);
  const [panelOffsetRight, setPanelOffsetRight] = useState(48);
  const [panelOffsetBottom, setPanelOffsetBottom] = useState(48);
  const [useDefaultStyles, setUseDefaultStyles] = useState(true);
  const [closeOnSubmit, setCloseOnSubmit] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="container">
        <div className="header">
          <h1>Boop Example</h1>
          <p>Test the feedback widget component</p>
          <button className="primary-button" onClick={() => setDarkMode(!darkMode)}>
            Toggle Dark Mode
          </button>
        </div>

        <div className={`example-card ${darkMode ? "dark" : ""}`}>
          <h2>Playground</h2>
          <p>Try sidebar vs widget and button placement</p>
          <div className="playground-grid">
            <label className="field">
              Panel
              <select
                value={panelVariant}
                onChange={(event) =>
                  setPanelVariant(event.target.value as "sidebar" | "widget")
                }
              >
                <option value="sidebar">Sidebar</option>
                <option value="widget">Widget</option>
              </select>
            </label>
            <label className="field">
              Button placement
              <select
                value={buttonPlacement}
                onChange={(event) =>
                  setButtonPlacement(event.target.value as "inline" | "fixed")
                }
              >
                <option value="inline">Inline</option>
                <option value="fixed">Fixed</option>
              </select>
            </label>
            <label className="field">
              Button label
              <input
                type="text"
                value={buttonLabel}
                onChange={(event) => setButtonLabel(event.target.value)}
              />
            </label>
            <label className="field">
              Panel width (px)
              <input
                type="number"
                min={280}
                value={panelWidth}
                onChange={(event) => setPanelWidth(Number(event.target.value))}
              />
            </label>
            <label className="field">
              Panel max height (vh)
              <input
                type="number"
                min={40}
                max={95}
                value={panelMaxHeight}
                onChange={(event) => setPanelMaxHeight(Number(event.target.value))}
              />
            </label>
            <label className="field">
              Button offset right (px)
              <input
                type="number"
                min={0}
                value={buttonOffsetRight}
                onChange={(event) => setButtonOffsetRight(Number(event.target.value))}
              />
            </label>
            <label className="field">
              Button offset bottom (px)
              <input
                type="number"
                min={0}
                value={buttonOffsetBottom}
                onChange={(event) => setButtonOffsetBottom(Number(event.target.value))}
              />
            </label>
            <label className="field">
              Panel offset right (px)
              <input
                type="number"
                min={0}
                value={panelOffsetRight}
                onChange={(event) => setPanelOffsetRight(Number(event.target.value))}
              />
            </label>
            <label className="field">
              Panel offset bottom (px)
              <input
                type="number"
                min={0}
                value={panelOffsetBottom}
                onChange={(event) => setPanelOffsetBottom(Number(event.target.value))}
              />
            </label>
            <label className="field checkbox-field">
              <input
                type="checkbox"
                checked={useDefaultStyles}
                onChange={(event) => setUseDefaultStyles(event.target.checked)}
              />
              Use default styles
            </label>
            <label className="field checkbox-field">
              <input
                type="checkbox"
                checked={closeOnSubmit}
                onChange={(event) => setCloseOnSubmit(event.target.checked)}
              />
              Close on submit
            </label>
          </div>
          <Boop
            options={{
              projectId: "1234567890",
              darkMode,
              mode: panelVariant,
              behavior: { closeOnSubmit },
              style: { useDefaultStyles },
              widgetOptions: {
                button: {
                  placement: buttonPlacement,
                  label: buttonLabel,
                  fixedOffset: {
                    right: buttonOffsetRight,
                    bottom: buttonOffsetBottom
                  }
                },
                panel: {
                  width: panelWidth,
                  maxHeight: `${panelMaxHeight}vh`,
                  fixedOffset: {
                    right: panelOffsetRight,
                    bottom: panelOffsetBottom
                  }
                }
              },
              sidebarOptions: {
                button: {
                  placement: buttonPlacement,
                  label: buttonLabel
                },
                panel: {
                  width: panelWidth
                }
              }
            }}
          />
        </div>

        <div className="examples">
          <div className={`example-card ${darkMode ? "dark" : ""}`}>
            <h2>Inline Button</h2>
            <p>Button placed inline in the page flow</p>
            <Boop
              options={{
                projectId: "1234567890",
                darkMode,
                sidebarOptions: {
                  button: {
                    placement: "inline",
                    label: "Boop Feedback"
                  }
                }
              }}
            />
          </div>

          <div className={`example-card ${darkMode ? "dark" : ""}`}>
            <h2>Fixed Button</h2>
            <p>Button fixed to bottom-right corner</p>
            <Boop
              options={{
                projectId: "1234567890",
                darkMode,
                sidebarOptions: {
                  button: {
                    placement: "fixed",
                    label: "Feedback"
                  }
                }
              }}
            />
          </div>

          <div className={`example-card ${darkMode ? "dark" : ""}`}>
            <h2>Custom Styling</h2>
            <p>With custom class names</p>
            <Boop
              options={{
                projectId: "1234567890",
                darkMode,
                style: {
                  classNames: {
                    button: "custom-feedback-button",
                    panel: "custom-feedback-panel"
                  }
                },
                sidebarOptions: {
                  button: {
                    placement: "inline"
                  }
                }
              }}
            />
          </div>

          <div className={`example-card ${darkMode ? "dark" : ""}`}>
            <h2>Widget Panel</h2>
            <p>Fixed widget panel layout</p>
            <Boop
              options={{
                fieldValues: {
                  email: "test@test.com",
                  name: "Test User"
                },
                projectId: "aj28lhy7sk",
                darkMode,
                mode: "widget",
                includeStackTrace: true,
                widgetOptions: {
                  button: {
                    placement: "inline",
                    label: "Open Widget"
                  },
                  panel: {
                    placement: "fixed",
                    fixedOffset: { right: 48, bottom: 48 }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="footer">
          <p>Built with @shtbox/boop</p>
        </div>
      </div>

      {/* Fixed button example - rendered outside container */}
      <Boop
        options={{
          projectId: "1234567890",
          darkMode,
          sidebarOptions: {
            button: {
              placement: "fixed",
              label: "💬 Feedback"
            }
          }
        }}
      />
    </div>
  );
};

export default App;
