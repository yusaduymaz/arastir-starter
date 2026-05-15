/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'puppeteer', 'clone-deep', 'pptxgenjs'],
  },
}

export default nextConfig;
