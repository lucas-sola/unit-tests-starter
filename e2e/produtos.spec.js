const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const response = await page.request.post("http://127.0.0.1:3000/__reset");
  expect(response.status()).toBe(204);
  await page.goto("/");
});

test("cadastra e remove um produto", async ({ page }) => {
  const nome = "Produto E2E";

  await page.getByLabel("Nome").fill(nome);
  await page.getByLabel("Preco").fill("12.50");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  const produto = page.getByRole("row").filter({ hasText: nome });
  await expect(produto).toContainText("12,50");

  await produto.getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("row").filter({ hasText: nome })).toHaveCount(0);
});
