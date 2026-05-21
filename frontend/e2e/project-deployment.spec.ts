import { test, expect } from "@playwright/test"
import { execSync } from "child_process"

test.describe("E2E Project Creation & Deployment Flow", () => {
  test.beforeAll(() => {
    console.log("Cleaning up test user database records...")
    try {
      execSync("npx tsx ../backend/utils/cleanup-test-user.ts", {
        stdio: "inherit",
      })
      console.log("Database cleanup completed successfully.")
    } catch (error) {
      console.error("Failed to run database cleanup script:", error)
      throw error
    }
  })

  test("should register, create a project, and verify successful deployment", async ({
    page,
  }) => {
    await page.goto("/sign-up")

    await page.locator("#name").fill("Test User")
    await page.locator("#email").fill("test@gmail.com")
    await page.locator("#password").fill("12345678")

    await page.getByRole("button", { name: "Sign up" }).click()

    await page.waitForURL("**/projects")
    await expect(page).toHaveURL(/.*\/projects/)
    await expect(page.locator("h1")).toContainText("Projects")

    await page
      .getByRole("main")
      .getByRole("button", { name: "New Project" })
      .click()
    await expect(page.getByText("Create a new project")).toBeVisible()

    await page.getByRole("button", { name: "Git URL" }).click()

    await page
      .locator("#manualUrl")
      .fill("https://github.com/Shitanshukumar607/frontend-test")

    await page.getByRole("button", { name: "Continue" }).click()
    await expect(page.getByText("Configure project")).toBeVisible()
    await page.getByRole("button", { name: "Deploy Project" }).click()

    await page.waitForURL("**/projects/frontend-test")
    await expect(page.locator("h1")).toContainText("frontend-test")

    const deploymentsTable = page.locator("table").first()
    await expect(deploymentsTable).toBeVisible()

    console.log("Waiting for build container to finish deployment...")
    await expect(async () => {
      await page.reload()
      const refreshedTable = page.locator("table").first()
      await expect(refreshedTable).toContainText("SUCCESS", { timeout: 1000 })
    }).toPass({
      intervals: [5000],
      timeout: 60000,
    })
    console.log("Deployment completed successfully! 🎉")
  })
})
