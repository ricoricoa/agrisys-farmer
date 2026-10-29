export default function ModuleStatus({ status }) {
  return (
    <>
      {status.loading && <p role="status">Checking API status…</p>}
      {status.error && <p role="alert">API unavailable: {status.error}</p>}
      {status.data && <p role="status">API status: {status.data.status}</p>}
    </>
  );
}
