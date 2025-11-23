import { test, expect } from "@playwright/test";

test("user can create and pass a quiz from manual input", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Color").fill("black");
  await page.getByLabel("Brand / logo").fill("TestBrand");
  await page
    .getByLabel("Unique marks")
    .fill("scratch on right side, initials inside strap");
  await page
    .getByLabel("Short description")
    .fill("small black backpack with a broken right strap");

  await page.getByRole("button", { name: "Create Quiz from Manual Input" }).click();

  await expect(page.getByText("Answer a few questions about your item")).toBeVisible();

  const radioGroups = await page.getByRole("radiogroup").all();
  for (const group of radioGroups) {
    const firstOption = group.getByRole("radio").first();
    await firstOption.check();
  }

  await page.getByRole("button", { name: "Submit answers" }).click();

  await expect(page.getByText("✔ The item is yours.")).toBeVisible();
});
