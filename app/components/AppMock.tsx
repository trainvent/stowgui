import { ChevronRight, CircleCheck, CircleDashed, Ellipsis, Minus, Square, X } from "lucide-react";

// The app's own UI is English-only, so the mock shows its real labels in every locale.
const APP = {
  name: "StowGUI",
  nav: ["Packages", "Candidates", "Settings"],
  folder: "~/dotfiles",
  changeFolder: "Change folder",
  columns: { package: "Package", status: "Status" },
  linked: "Linked",
  notLinked: "Not linked",
  link: "Link",
  unlink: "Unlink",
};

const PACKAGES = [
  { name: "agents", linked: true },
  { name: "bash", linked: true },
  { name: "git", linked: true },
  { name: "nvim", linked: true },
  { name: "shell", linked: false },
  { name: "tmux", linked: false },
];

const ICON_SIZE = 14;

function FileAddIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 3H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-9" />
      <path d="M8 13h7M8 17h5M19 2v6M16 5h6" />
    </svg>
  );
}

function FolderAddIcon() {
  return (
    <svg viewBox="0 0 24 24" width={ICON_SIZE} height={ICON_SIZE} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 7h-0.9a2 2 0 0 1-1.69-.9L9.6 4.9A2 2 0 0 0 7.93 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M19 2v6M16 5h6" />
    </svg>
  );
}

export default function AppMock() {
  const [current, ...otherNav] = APP.nav;
  return (
    <div className="app-mock" aria-hidden="true">
      <div className="app-mock-titlebar">
        <span className="app-mock-title">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimisation */}
          <img src="/icon.png" alt="" width={18} height={18} />
          {APP.name}
        </span>
        <span className="app-mock-controls">
          <Minus size={ICON_SIZE} />
          <Square size={ICON_SIZE - 3} />
          <X size={ICON_SIZE} />
        </span>
      </div>
      <div className="app-mock-body">
        <nav className="app-mock-side">
          <b>{current}</b>
          {otherNav.map((item) => <span key={item}>{item}</span>)}
        </nav>
        <div className="app-mock-main">
          <div className="app-mock-head">
            <div>
              <div className="app-mock-heading">{current}</div>
              <div className="app-mock-path">{APP.folder}</div>
            </div>
            <div className="app-mock-tools">
              <span className="app-mock-button">{APP.changeFolder}</span>
              <span className="app-mock-button icon"><FileAddIcon /></span>
              <span className="app-mock-button icon"><FolderAddIcon /></span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th><span className="app-mock-check" /></th>
                <th />
                <th>{APP.columns.package}</th>
                <th>{APP.columns.status}</th>
                <th colSpan={2} />
              </tr>
            </thead>
            <tbody>
              {PACKAGES.map(({ name, linked }) => (
                <tr key={name}>
                  <td><span className="app-mock-check" /></td>
                  <td className="app-mock-dim"><ChevronRight size={ICON_SIZE} /></td>
                  <td>{name}</td>
                  <td>
                    <span className="app-mock-status">
                      {linked ? <CircleCheck size={ICON_SIZE} /> : <CircleDashed size={ICON_SIZE} />}
                      {linked ? APP.linked : APP.notLinked}
                    </span>
                  </td>
                  <td className="app-mock-action"><span className="app-mock-button">{linked ? APP.unlink : APP.link}</span></td>
                  <td className="app-mock-dim"><Ellipsis size={ICON_SIZE} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
