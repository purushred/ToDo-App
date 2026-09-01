/**
 * Helper to extract JSON data from Next.js NextResponse in tests
 * NextResponse in jsdom doesn't properly support body streaming,
 * so we need to access the internal state
 */
export async function extractResponseData(response: any): Promise<any> {
  // The NextResponse stores the body in _body but it might be a stream
  // In the test environment, json() and text() return undefined
  
  // Try json() first
  try {
    const json = await response.json()
    if (json !== undefined && json !== null) {
      return json
    }
  } catch (e) {
    // Ignore
  }
  
  // Try text()
  try {
    const text = await response.text()
    if (text && text.trim()) {
      return JSON.parse(text)
    }
  } catch (e) {
    // Ignore
  }
  
  // The body isn't being set properly in test env
  // This is a known issue with Next.js API routes in jsdom
  // For now, we'll skip these tests and run them with integration tests
  throw new Error('Unable to extract response body - API route tests should use integration testing')
}