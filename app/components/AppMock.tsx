import type { Dictionary } from "@/dictionaries";

const PACKAGES = [
  { name: "agents", linked: true },
  { name: "bash", linked: true },
  { name: "nvim", linked: false },
  { name: "git", linked: false },
];

export default function AppMock({ text }: { text: Dictionary["mock"] }) {
  return (
    <div className="app-mock" aria-hidden="true">
      <div className="app-mock-bar">
        <span>~/dotfiles → ~</span>
        <span>{text.import}</span>
      </div>
      <div className="app-mock-body">
        <div className="app-mock-side">
          <b>▸ {text.packages}</b>
          <span>{text.git}</span>
          <span>{text.settings}</span>
        </div>
        <table>
          <tbody>
            {PACKAGES.map(({ name, linked }) => (
              <tr key={name}>
                <td>{name}</td>
                <td className={linked ? "linked" : "unlinked"}>{linked ? text.linked : text.notLinked}</td>
                <td className="action">{linked ? text.unlink : text.link}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
