import { Seo } from '../components/Seo';

export function VideoTutorialPage() {
  return (
    <>
      <Seo
        title="Video Tutorial | Oxy Finds"
        description="Watch the Oxy Finds tutorial to learn how to browse curated finds and shop through Kakobuy."
        path="/video-tutorial"
      />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Oxy Finds
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-frost sm:text-4xl">
            Video Tutorial
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-mist sm:text-base">
            Learn how to browse curated finds and shop through Kakobuy.
          </p>
          <div className="showcase-frame relative mt-8 px-2 sm:px-4">
            <video
              className="aspect-video w-full rounded-xl bg-black"
              controls
              playsInline
              preload="none"
              poster="/tutorial-poster.jpg"
              aria-label="Oxy Finds tutorial video"
            >
              <source src="/1.mp4" type="video/mp4" />
              Your browser does not support HTML video.
            </video>
          </div>
        </div>
      </section>
    </>
  );
}
