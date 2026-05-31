import path from 'path'
import { fileURLToPath } from 'url'
import { withPayload } from '@payloadcms/next/withPayload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root so Next doesn't infer it from an unrelated lockfile higher up.
  outputFileTracingRoot: path.join(dirname, '../../'),
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
