import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Lets the dev server serve JS/HMR assets when the app is reached via
  // this machine's LAN IP (e.g. testing the public feedback form on a
  // real phone) - without this, Next.js silently blocks those
  // cross-origin dev requests, so the page's HTML renders but the React
  // bundle never runs: no visible error, just every JS-driven control
  // (file picker, form submit) staying dead. Dev-only; irrelevant once
  // deployed behind a real domain.
  allowedDevOrigins: ['192.168.18.91'],
};

export default nextConfig;
