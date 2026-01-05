import 'dotenv/config';
import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL;
const shadowDatabaseUrlEnv = process.env.SHADOW_DATABASE_URL;
const disableShadowDb = parseBoolean(process.env.PRISMA_DISABLE_SHADOW_DATABASE);

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment');
}

const datasource: { url: string; shadowDatabaseUrl?: string } = {
  url: databaseUrl,
};

if (!disableShadowDb) {
  datasource.shadowDatabaseUrl =
    shadowDatabaseUrlEnv ?? deriveShadowDatabaseUrl(databaseUrl);
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource,
});

function parseBoolean(value?: string) {
  if (!value) {
    return false;
  }
  return ['1', 'true', 'yes'].includes(value.toLowerCase());
}

function deriveShadowDatabaseUrl(primaryUrl: string) {
  try {
    const url = new URL(primaryUrl);

    if (url.protocol.startsWith('file:')) {
      return `${primaryUrl}-shadow`;
    }

    const schema = url.searchParams.get('schema');
    url.searchParams.set('schema', schema ? `${schema}_shadow` : 'shadow');
    return url.toString();
  } catch (error) {
    throw new Error(
      `Failed to derive shadow database URL: ${(error as Error).message}`
    );
  }
}
