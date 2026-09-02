const pageLayoutBaseClass = "mx-auto grid min-w-0 grid-cols-1";

export const pageLayoutClass =
  `${pageLayoutBaseClass} gap-cluster py-cluster pb-page-bottom lg:w-[min(1440px,calc(100%-40px))] lg:gap-section-gap-lg lg:py-page-y lg:pb-page-bottom-lg xl:w-[min(1440px,calc(100%-88px))]`;

export const homePageLayoutClass =
  `${pageLayoutBaseClass} gap-0 py-cluster pb-page-bottom lg:w-[min(1440px,calc(100%-40px))] lg:pb-page-bottom-lg xl:w-[min(1440px,calc(100%-88px))]`;

export const pageShellClass =
  "relative overflow-visible rounded-panel-mobile bg-page px-page-gutter pb-page-gutter lg:rounded-panel lg:px-page-gutter-lg lg:pb-page-gutter-lg";

export const pageContentClass = "pt-cluster-lg lg:px-6 xl:px-10";
