/** @type {import('next').NextConfig} */
const nextConfig = {
  // Testing on a real phone means opening the dev server over the local
  // network, e.g. http://192.168.1.64:3000. Next's dev server rejects requests
  // whose Host is not localhost unless the origin is listed here, so add your
  // laptop's LAN address. Development only: this has no effect on a build.
  allowedDevOrigins: ["192.168.1.64", "*.local"],
};

export default nextConfig;
