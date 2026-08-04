import { test, expect } from "@playwright/test";

// Force a specific question type through the Settings modal so the flow is deterministic.
async function openSettings(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /Settings/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
async function saveSettings(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /SAVE/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
}
async function setQuestionMode(page: import("@playwright/test").Page, label: "Name it" | "Find it") {
  await openSettings(page);
  await page.getByRole("radio", { name: label }).click();
  await saveSettings(page);
}
// Click the state the find-it question asks for (read from data-state-id).
async function answerCurrentFindIt(page: import("@playwright/test").Page) {
  const id = await page.getByTestId("question").getAttribute("data-state-id");
  await page.locator(`svg path[data-id="${id}"]`).click();
  return id;
}
async function setDifficulty(page: import("@playwright/test").Page, level: number) {
  await openSettings(page);
  await page.getByRole("radio", { name: `Difficulty ${level}` }).click();
  await saveSettings(page);
}

test("the map renders all states, labeled for assistive tech in study mode", async ({ page }) => {
  await page.goto("/");
  // In study mode every state is keyboard-reachable and named for assistive tech.
  await page.getByRole("button", { name: /Study/ }).click();
  const paths = page.locator("svg path[aria-label]");
  await expect(paths.first()).toBeVisible();
  await expect.poll(() => paths.count(), { timeout: 6000 }).toBeGreaterThanOrEqual(50);
});

test("name-it: answering advances the quiz and counts the answer", async ({ page }) => {
  await page.goto("/");
  await setQuestionMode(page, "Name it");

  await expect(page.getByTestId("question")).toContainText("highlighted");
  const options = page.getByTestId("option");
  await expect(options).toHaveCount(4);
  await options.first().click();

  // The answer is recorded (1 answered) and, after the reveal, a new question loads.
  await expect(page.getByText("1 answered")).toBeVisible();
  await expect(page.getByTestId("question")).toBeVisible({ timeout: 4000 });
});

test("find-it: clicking the named state on the map scores a correct answer", async ({ page }) => {
  await page.goto("/");
  await setQuestionMode(page, "Find it");
  await expect(page.getByTestId("question")).toContainText("Find");
  await answerCurrentFindIt(page);
  await expect(page.getByTestId("score")).toContainText("1 /");
});

test("timer: when enabled, a question times out and reveals the answer", async ({ page }) => {
  await page.goto("/");
  await setQuestionMode(page, "Find it");
  await openSettings(page);
  await page.getByRole("radio", { name: "Difficulty 5" }).click(); // 3s timer
  await page.getByRole("button", { name: /Timer/ }).click();
  await saveSettings(page);
  // Do not answer; the countdown should expire and reveal "Time's up".
  await expect(page.getByText(/Time's up/).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("1 answered")).toBeVisible();
});

// Note: the victory card, best-score persistence, retry-missed pool, and queue-to-done
// transition are covered deterministically at the reducer level in tests/quizEngine.test.ts
// (playAllCorrect -> done, RESET, missed tracking, retry distractor pool). A full-run e2e
// was intentionally omitted: driving 11 sub-second reveals through tiny SVG click targets
// is flaky, and the reducer tests already prove the completion logic.

test("difficulty setting persists across a reload", async ({ page }) => {
  await page.goto("/");
  await setDifficulty(page, 4);
  await page.reload();
  await openSettings(page);
  await expect(page.getByRole("radio", { name: "Difficulty 4" })).toHaveAttribute("aria-checked", "true");
});

test("study mode: clicking a state opens its details", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Study/ }).click();
  await page.locator('svg path[aria-label="Texas"]').click();
  await expect(page.getByText("Austin")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Texas" })).toBeVisible();
});

test("settings modal closes on Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Settings/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});
