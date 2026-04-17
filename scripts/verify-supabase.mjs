import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadLocalEnvFile() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) {
    return
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex <= 0) {
      continue
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function fail(message) {
  console.error(`❌ ${message}`)
  process.exit(1)
}

async function main() {
  loadLocalEnvFile()

  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    fail('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
  }

  if (url.includes('your-project') || anonKey.includes('your-anon-key')) {
    fail('Replace placeholder values in .env.local before running verification')
  }

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error: itemsError } = await supabase
    .from('items')
    .select('id', { head: true, count: 'exact' })

  if (itemsError) {
    fail(`items table check failed: ${itemsError.message}`)
  }

  const { error: clicksError } = await supabase
    .from('interest_clicks')
    .select('id', { head: true, count: 'exact' })

  if (clicksError) {
    fail(`interest_clicks table check failed: ${clicksError.message}`)
  }

  const { error: rpcError } = await supabase.rpc('increment_interest', {
    item_id: '00000000-0000-0000-0000-000000000000',
  })

  if (rpcError) {
    fail(`increment_interest function check failed: ${rpcError.message}`)
  }

  console.log('✅ Supabase Wave 1 checks passed (tables + RPC available)')
}

await main()
