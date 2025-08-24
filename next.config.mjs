/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:path",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
