#!/usr/bin/env ts-node
/**
 * Migration script to export existing in-memory todos to PostgreSQL
 * 
 * Usage:
 *   npm run migrate:export > export-data.json
 * 
 * This script reads from the in-memory todoStore and outputs JSON
 * suitable for import into the PostgreSQL database.
 */

import { todoStore } from '../src/lib/todoStore'

console.log(JSON.stringify(todoStore.getAll(), null, 2))