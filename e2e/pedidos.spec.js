const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const response = await page.request.post("http://127.0.0.1:3000/__reset");
  expect(response.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Pedidos" }).click();
});

test("cria um pedido, altera seu status e remove-o", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Ana Souza" });
  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("3");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("listitem")).toHaveText("3x Coxinha");
  await page.getByRole("button", { name: "Criar pedido" }).click();

  const pedido = page.getByRole("row").filter({ hasText: "3x Coxinha" });
  await expect(pedido).toContainText("Ana Souza");
  await expect(pedido.locator("td").nth(3)).toContainText("15,00");
  await expect(pedido.getByLabel(/^Status do pedido/)).toHaveValue("pendente");

  await pedido.getByLabel(/^Status do pedido/).selectOption("pago");
  await expect(pedido.getByLabel(/^Status do pedido/)).toHaveValue("pago");

  await pedido.getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("row").filter({ hasText: "3x Coxinha" })).toHaveCount(0);
});
