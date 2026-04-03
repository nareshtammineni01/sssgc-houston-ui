export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="logo-ripple-wrap">
          <span className="ripple-ring" />
          <img
            src="/sss-logo.webp"
            alt="Loading..."
            className="w-14 h-14 rounded-full logo-loader"
          />
        </div>
        <p className="text-sm" style={{ color: '#A89888' }}>Loading...</p>
      </div>
    </div>
  );
}
