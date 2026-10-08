const { test, expect } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  const response = await page.request.post("http://127.0.0.1:3000/__reset");
  expect(response.status()).toBe(204);
  await page.goto("/");
  await page.getByRole("button", { name: "Clientes" }).click();
});

test("cadastra, edita e remove um cliente", async ({ page }) => {
  const email = "carla.e2e@example.com";

  await page.getByLabel("Nome").fill("Carla E2E");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Cadastrar" }).click();

  let cliente = page.getByRole("row").filter({ hasText: email });
  await expect(cliente).toContainText("Carla E2E");

  await cliente.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nome").fill("Carla Atualizada E2E");
  await page.getByRole("button", { name: "Salvar" }).click();

  cliente = page.getByRole("row").filter({ hasText: email });
  await expect(cliente).toContainText("Carla Atualizada E2E");

  await cliente.getByRole("button", { name: "Remover" }).click();
  await expect(page.getByRole("row").filter({ hasText: email })).toHaveCount(0);
});
