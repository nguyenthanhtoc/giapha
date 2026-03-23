/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/giapha', // Thay đổi nếu bạn đổi tên repository
};

export default nextConfig;
