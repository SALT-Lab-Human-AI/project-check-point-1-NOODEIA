#!/usr/bin/env node
/**
 * AI Chat API Tests
 *
 * Tests Suite 2 from docs/minimalTest/useCase.md:
 * - 2.1: Basic AI response (ACE agent → LangGraph → Gemini)
 * - 2.3: Python subprocess error handling
 *
 * Note: Test 2.2 (ACE memory learning) is covered by unitTests/ace_memory/test_memory_comparison.py
 */

const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, '../../frontend/.env.local') })

let testsPassed = 0
let testsFailed = 0

function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : '❌'
  console.log(`${emoji} ${name}`)
  if (details) console.log(`   ${details}`)
  if (status === 'PASS') testsPassed++
  else testsFailed++
}

function printSection(title) {
  console.log('\n' + '━'.repeat(70))
  console.log(title)
  console.log('━'.repeat(70))
}

// Test 2.1: Basic AI Response (via Python subprocess)
async function testBasicAIResponse() {
  printSection('Test 2.1: Basic AI Response - Python ACE Agent')

  console.log('\n📝 Testing Python ACE agent can be invoked')
  console.log('   This simulates what /api/ai/chat does')

  // Step 1: Check Python is available
  const { spawn } = require('child_process')

  try {
    const pythonCheck = await new Promise((resolve) => {
      const proc = spawn('python3', ['--version'])
      proc.on('close', (code) => resolve(code === 0))
      proc.on('error', () => resolve(false))
    })

    if (pythonCheck) {
      logTest('2.1.1: Python3 available', 'PASS')
    } else {
      logTest('2.1.1: Python3 available', 'FAIL', 'python3 not in PATH')
      return
    }

    // Step 2: Check ACE agent script exists
    const scriptPath = path.join(__dirname, '../../frontend/scripts/run_ace_agent.py')
    if (fs.existsSync(scriptPath)) {
      logTest('2.1.2: ACE agent script exists', 'PASS', scriptPath)
    } else {
      logTest('2.1.2: ACE agent script exists', 'FAIL', 'run_ace_agent.py not found')
      return
    }

    // Step 3: Check GEMINI_API_KEY is set
    if (process.env.GEMINI_API_KEY) {
      logTest('2.1.3: GEMINI_API_KEY configured', 'PASS')
    } else {
      logTest('2.1.3: GEMINI_API_KEY configured', 'FAIL', 'API key missing in .env.local')
      console.log('   ⚠️  AI responses will fail without API key')
      return
    }

    // Step 4: Test ACE agent can import required modules
    console.log('\n   Testing Python imports...')
    const importTest = await new Promise((resolve, reject) => {
      const proc = spawn('python3', ['-c', `
import sys
sys.path.insert(0, '${path.join(__dirname, '../../frontend/scripts')}')
try:
    from langgraph_agent_ace import build_ace_graph
    from ace_components import ACEPipeline
    from langgraph_utile import LLM
    print('IMPORTS_OK')
except ImportError as e:
    print(f'IMPORT_ERROR: {e}')
    sys.exit(1)
`])

      let output = ''
      proc.stdout.on('data', (data) => { output += data.toString() })
      proc.on('close', (code) => {
        if (code === 0 && output.includes('IMPORTS_OK')) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      proc.on('error', () => resolve(false))
    })

    if (importTest) {
      logTest('2.1.4: Python dependencies', 'PASS', 'ACE agent modules importable')
    } else {
      logTest('2.1.4: Python dependencies', 'FAIL', 'Missing langraph/langchain packages')
      console.log('   Run: pip3 install -r frontend/requirements.txt')
      return
    }

    // Step 5: Test ACE agent can execute (simple query)
    console.log('\n   Testing ACE agent execution with simple query...')
    console.log('   (This may take 5-10 seconds)')

    const testMessage = JSON.stringify({
      messages: [
        { role: 'user', content: 'What is 2 + 2?' }
      ]
    })

    const aceResult = await new Promise((resolve, reject) => {
      const proc = spawn('python3', [scriptPath], {
        cwd: path.join(__dirname, '../../frontend/scripts'),
        env: {
          ...process.env,
          GEMINI_API_KEY: process.env.GEMINI_API_KEY,
          GEMINI_MODEL: 'gemini-2.5-flash'
        }
      })

      let stdout = ''
      let stderr = ''
      const timeout = setTimeout(() => {
        proc.kill()
        reject(new Error('Timeout after 60 seconds'))
      }, 60000) // 60 second timeout

      proc.stdout.on('data', (data) => { stdout += data.toString() })
      proc.stderr.on('data', (data) => {
        stderr += data.toString()
        // Show ACE agent logs in real-time
        if (stderr.includes('[ACE Agent]')) {
          process.stdout.write('   ' + data.toString())
        }
      })

      proc.on('close', (code) => {
        clearTimeout(timeout)
        resolve({ code, stdout, stderr })
      })

      proc.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })

      // Send input
      proc.stdin.write(testMessage)
      proc.stdin.end()
    })

    if (aceResult.code === 0) {
      try {
        const response = JSON.parse(aceResult.stdout)
        if (response.answer) {
          logTest('2.1.5: ACE agent execution', 'PASS', `Got response: "${response.answer.substring(0, 50)}..."`)
        } else {
          logTest('2.1.5: ACE agent execution', 'FAIL', 'No answer in response')
        }
      } catch (e) {
        logTest('2.1.5: ACE agent execution', 'FAIL', 'Invalid JSON response')
      }
    } else {
      logTest('2.1.5: ACE agent execution', 'FAIL', `Exit code ${aceResult.code}`)
      console.log('   stderr:', aceResult.stderr.substring(0, 200))
    }

  } catch (error) {
    console.error('\n❌ Test error:', error.message)
    testsFailed++
  }
}

// Test 2.3: Python Subprocess Error Handling
async function testSubprocessErrorHandling() {
  printSection('Test 2.3: Python Subprocess Error Handling')

  console.log('\n📝 Testing error scenarios')

  // Test 1: Invalid JSON input
  console.log('\n   Test: Invalid JSON input')
  const { spawn } = require('child_process')
  const scriptPath = path.join(__dirname, '../../frontend/scripts/run_ace_agent.py')

  try {
    const result = await new Promise((resolve) => {
      const proc = spawn('python3', [scriptPath], {
        cwd: path.join(__dirname, '../../frontend/scripts'),
        env: { ...process.env, GEMINI_API_KEY: process.env.GEMINI_API_KEY }
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => { stdout += data.toString() })
      proc.stderr.on('data', (data) => { stderr += data.toString() })

      proc.on('close', (code) => resolve({ code, stdout, stderr }))

      // Send invalid JSON
      proc.stdin.write('not valid json')
      proc.stdin.end()
    })

    if (result.code !== 0) {
      // Should fail gracefully with structured error
      try {
        const errorResponse = JSON.parse(result.stderr || result.stdout)
        if (errorResponse.error) {
          logTest('2.3.1: Invalid input handling', 'PASS', 'Structured error returned')
        } else {
          logTest('2.3.1: Invalid input handling', 'PASS', 'Error detected')
        }
      } catch {
        logTest('2.3.1: Invalid input handling', 'PASS', 'Process exited with error code')
      }
    } else {
      logTest('2.3.1: Invalid input handling', 'FAIL', 'Should have failed on invalid JSON')
    }

  } catch (error) {
    logTest('2.3.1: Invalid input handling', 'PASS', 'Error caught as expected')
  }

  // Test 2: Check Python dependencies
  console.log('\n   Test: Required Python packages')
  const requiredPackages = ['langgraph', 'langchain', 'langchain-google-genai']

  for (const pkg of requiredPackages) {
    const checkPkg = await new Promise((resolve) => {
      const proc = spawn('python3', ['-c', `import ${pkg.replace('-', '_')}; print('OK')`])
      proc.on('close', (code) => resolve(code === 0))
      proc.on('error', () => resolve(false))
    })

    if (checkPkg) {
      logTest(`2.3.${pkg}: Package ${pkg}`, 'PASS')
    } else {
      logTest(`2.3.${pkg}: Package ${pkg}`, 'FAIL', 'Not installed')
    }
  }
}

// Main execution
async function runAllTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗')
  console.log('║                    AI CHAT API TESTS                             ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log(`\nTest Suite 2: AI Chat Completion`)
  console.log(`Source: docs/minimalTest/useCase.md`)
  console.log(`\n⏱️  Note: Basic AI response test may take 5-30 seconds`)

  await testBasicAIResponse()
  await testSubprocessErrorHandling()

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════════╗')
  console.log('║                        TEST SUMMARY                              ║')
  console.log('╚══════════════════════════════════════════════════════════════════╝')
  console.log(`\nTests Passed: ${testsPassed}`)
  console.log(`Tests Failed: ${testsFailed}`)
  console.log(`Total Tests: ${testsPassed + testsFailed}`)

  if (testsFailed === 0) {
    console.log('\n🎉 ALL AI CHAT TESTS PASSED!\n')
    process.exit(0)
  } else {
    console.log(`\n⚠️  ${testsFailed} TEST(S) FAILED\n`)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(err => {
    console.error('\n❌ Fatal error:', err)
    process.exit(1)
  })
}

module.exports = { runAllTests }
