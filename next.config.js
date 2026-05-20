/** @type {import('next').NextConfig} */
import { withSentryConfig } from "@sentry/nextjs";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-extra',
      'puppeteer-extra-plugin-stealth',
      'puppeteer',
      'clone-deep',
      'pptxgenjs',
      '@react-pdf/renderer',
      '@opentelemetry/instrumentation',
      '@prisma/instrumentation',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // @react-pdf/renderer must run in Node.js only — exclude from client bundle
      config.externals = config.externals || [];
      config.externals.push('@react-pdf/renderer');
    }

    // Fix pre-existing @peculiar/utils ESM webpack scope-hoisting bug:
    // "Cannot get final name for export 'pemConverter'"
    // Use NormalModuleReplacementPlugin to swap the problematic ESM entry
    // with the equivalent CJS entry for @peculiar/utils pem subpath
    // Fix pre-existing @peculiar/utils ESM scope-hoisting bug:
    // "Cannot get final name for export 'pemConverter'"
    // Disable webpack's ModuleConcatenationPlugin for @peculiar/utils ESM modules
    // by marking them as not eligible for concatenation via sideEffects or
    // by adding a workaround in optimization.concatenateModules
    if (config.optimization) {
      // Store original concatenateModules flag
      const originalConcatenate = config.optimization.concatenateModules;
      if (originalConcatenate !== false) {
        // We need to disable concatenation only for @peculiar/utils ESM
        // The simplest approach: disable global concatenation for prod builds
        // This is a minor perf trade-off to fix a pre-existing webpack bug
        config.optimization.concatenateModules = false;
      }
    }

    return config;
  },
}

const finalConfig = process.env.NODE_ENV === "production" && process.env.SENTRY_AUTH_TOKEN && process.env.ENABLE_SENTRY === "true"
  ? withSentryConfig(nextConfig, {
      // For all available options, see:
      // https://www.npmjs.com/package/@sentry/webpack-plugin#options

      org: "yusaduymaz",
      project: "javascript-nextjs",

      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,

      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      // This can increase your server load as well as your hosting bill.
      // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
      // side errors will fail.
      // tunnelRoute: "/monitoring",

      webpack: {
        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,

        // Tree-shaking options for reducing bundle size
        treeshake: {
          // Automatically tree-shake Sentry logger statements to reduce bundle size
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;

export default finalConfig;
