import { test, expect } from "@playwright/test";

// Force a specific question type through the Settings modal so the flow is deterministic.
async function setQuestionMode(page: import("@playwright/test").Page, label: "Name it" | "Find it") {
  await page.getByRole("button", { name: /Settings/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("radio", { name: label }).click();
  await page.getByRole("button", { name: /SAVE/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
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

  const question = page.getByTestId("question");
  await expect(question).toContainText("Find");
  const name = (await question.textContent())!.replace(/.*Find\s+/, "").replace(/\s+on the map.*/, "").trim();

  await page.locator(`svg path[aria-label="${name}"]`).click();
  await expect(page.getByTestId("score")).toContainText("1 /");
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
