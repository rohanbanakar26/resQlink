function AppLayout({ children, chromeTop, chromeBottom, floatingAction }) {
  return (
    <div className="app-shell">
      {chromeTop}
      <main className="page-shell">{children}</main>
      {floatingAction}
      {chromeBottom}
    </div>
  );
}

export default AppLayout;
