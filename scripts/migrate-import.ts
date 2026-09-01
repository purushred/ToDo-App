#!/usr/bin/env ts-node
/**
 * Migration script to import todos into PostgreSQL database
 * 
 * Usage:
 *   npm run migrate:import < export-data.json
 * 
 * This script reads JSON from stdin and imports it into the PostgreSQL database.
 * Requires DATABASE_URL environment variable to be set.
 */

import * as readline from 'readline'
import { importTodos } from '../src/lib/todoService'
import { Todo } from '../src/types/todo'

async function readStdin(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  })

  let data = ''
  for await (const line of rl) {
    data += line
  }
  return data
}

async function main() {
  try {
    console.error('Reading todos from stdin...')
    const input = await readStdin()
    
    if (!input.trim()) {
      console.error('No input provided')
      process.exit(1)
    }

    const todos: Todo[] = JSON.parse(input)
    console.error(`Importing ${todos.length} todos...`)

    const result = await importTodos(todos)
    
    console.error(`Migration complete:`)
    console.error(`  - Success: ${result.success}`)
    console.error(`  - Failed: ${result.failed}`)
    
    if (result.failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

main()