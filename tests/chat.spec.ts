import { test, expect } from '@playwright/test';

test('real-time chat between two users', async ({ browser }) => {
  test.setTimeout(60000);

  // Create two separate incognito browser contexts (simulates 2 users)
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  // User A signs up
  console.log('User A signing up...');
  await pageA.goto('http://localhost:8080/signup');
  await pageA.fill('input[type="text"]', 'Alice');
  await pageA.fill('input[type="tel"]', '+1234567890');
  await pageA.fill('input[type="email"]', 'alice@example.com');
  await pageA.fill('input[type="password"]', 'Password123');
  await pageA.click('button:has-text("Create account")');
  await expect(pageA).toHaveURL(/.*chat/, { timeout: 10000 });
  console.log('User A is in chat!');

  // User B signs up
  console.log('User B signing up...');
  await pageB.goto('http://localhost:8080/signup');
  await pageB.fill('input[type="text"]', 'Bob');
  await pageB.fill('input[type="tel"]', '+0987654321');
  await pageB.fill('input[type="email"]', 'bob@example.com');
  await pageB.fill('input[type="password"]', 'Password123');
  await pageB.click('button:has-text("Create account")');
  await expect(pageB).toHaveURL(/.*chat/, { timeout: 10000 });
  console.log('User B is in chat!');

  // User B sends a message to User A
  console.log('User B selects Alice and sends message...');
  await pageB.click('text=Alice', { timeout: 10000 });
  await pageB.fill('input[placeholder="Type a message…"]', 'Hello Alice! This is Bob.');
  await pageB.press('input[placeholder="Type a message…"]', 'Enter');
  // Wait to see B's message in their own view
  await expect(pageB.locator('text=Hello Alice! This is Bob.')).toBeVisible();

  // Switch back to User A, they should see B's message
  console.log('User A receives message...');
  await pageA.click('text=Bob', { timeout: 10000 });
  await expect(pageA.locator('text=Hello Alice! This is Bob.')).toBeVisible({ timeout: 10000 });
  console.log('User A sees the message!');

  // User A replies
  console.log('User A replies...');
  await pageA.fill('input[placeholder="Type a message…"]', 'Hi Bob! Got it instantly.');
  await pageA.press('input[placeholder="Type a message…"]', 'Enter');

  // Switch back to User B, they should see A's reply
  console.log('User B receives reply...');
  await expect(pageB.locator('text=Hi Bob! Got it instantly.')).toBeVisible({ timeout: 10000 });
  console.log('Real-time chat working perfectly!');
});
