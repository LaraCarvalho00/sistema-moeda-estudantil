const videoId = "ZJjwCgvnOTg";

export function VideoBackground() {
  const videoUrl =
    `https://www.youtube.com/embed/${videoId}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}` +
    "&playsinline=1&modestbranding=1&rel=0&showinfo=0";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gray-950">
      <iframe
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-screen min-w-[177.78vh] -translate-x-1/2 -translate-y-1/2"
        loading="eager"
        src={videoUrl}
        title="Video de fundo PUC Coin"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        tabIndex={-1}
      />
      <div className="absolute inset-0 bg-gray-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(130,10,209,0.16),transparent_48%)]" />
    </div>
  );
}
