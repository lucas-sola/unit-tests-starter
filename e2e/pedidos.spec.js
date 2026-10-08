const { test, expect } = require("@playwright/test");

// Cada teste reinicia os dados e abre Pedidos depois de carregar a aplicacao.
test.beforeEach(async ({ page }) => {
  const resposta = await page.request.post("http://127.0.0.1:3000/__reset");
  expect(resposta.status()).toBe(204);

  await page.goto("/");
  await page.getByRole("button", { name: "Pedidos" }).click();
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

  // A tela depende dos tres recursos carregados pela API antes de montar pedidos.
  await expect(page.getByLabel("Cliente")).toContainText("Ana Souza");
  await expect(page.getByLabel("Produto")).toContainText("Coxinha");
});

// Confere os dados iniciais do pedido, incluindo total e status.
test("P1: lista o pedido inicial", async ({ page }) => {
  const pedido = page.getByRole("row").filter({ hasText: "Ana Souza" });

  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();
  await expect(pedido).toContainText("2x Coxinha");
  await expect(pedido).toContainText("R$ 10,00");
  await expect(pedido.getByLabel("Status do pedido 1")).toHaveValue("pendente");
});

// Cria pedido de Bruno com um Pastel e valida os dados salvos e a limpeza do formulario.
test("P2: cria um pedido com um item", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Bruno Lima" });
  await page.getByLabel("Produto").selectOption({ label: "Pastel" });
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByRole("listitem")).toHaveText("1x Pastel");
  await page.getByRole("button", { name: "Criar pedido" }).click();

  const pedido = page.getByRole("row").filter({ hasText: "1x Pastel" });
  await expect(pedido).toContainText("Bruno Lima");
  await expect(pedido).toContainText("R$ 8,00");
  await expect(pedido.getByLabel("Status do pedido 2")).toHaveValue("pendente");
  await expect(page.getByLabel("Cliente")).toHaveValue("");
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

// Adiciona dois itens e confere o total calculado (3 x R$ 5 + 1 x R$ 6 = R$ 21).
test("P3: cria pedido com varios itens e quantidades", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Ana Souza" });

  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("3");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await page.getByLabel("Produto").selectOption({ label: "Empada" });
  await page.getByLabel("Quantidade").fill("1");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await expect(page.getByRole("listitem")).toHaveText(["3x Coxinha", "1x Empada"]);

  await page.getByRole("button", { name: "Criar pedido" }).click();
  const pedido = page.getByRole("row").filter({ hasText: "3x Coxinha, 1x Empada" });

  await expect(pedido).toContainText("R$ 21,00");
  await expect(pedido).toContainText("3x Coxinha, 1x Empada");
});

// Confirma que adicionar um item restaura o campo de quantidade para 1.
test("P4: restaura a quantidade apos adicionar um item", async ({ page }) => {
  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByLabel("Quantidade").fill("5");
  await page.getByRole("button", { name: "Adicionar item" }).click();

  await expect(page.getByLabel("Quantidade")).toHaveValue("1");
  await expect(page.getByRole("listitem")).toHaveText("5x Coxinha");
});

// O envio sem cliente deve exibir a validacao da API sem inserir pedido na tabela.
test("P5: impede criar pedido sem cliente", async ({ page }) => {
  await page.getByLabel("Produto").selectOption({ label: "Coxinha" });
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.locator(".erro")).toHaveText("Cliente e obrigatorio");
  await expect(page.getByRole("row")).toHaveCount(2);
});

// O envio com cliente, mas sem itens, deve exibir a validacao e nao criar pedido.
test("P6: impede criar pedido sem itens", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Ana Souza" });
  await page.getByRole("button", { name: "Criar pedido" }).click();

  await expect(page.locator(".erro")).toHaveText("Pedido deve ter ao menos um item");
  await expect(page.getByRole("row")).toHaveCount(2);
});

// Muda o status do pedido inicial para pago e confirma o valor atualizado na tela.
test("P7: altera o status de um pedido para pago", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");

  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");
});

// Um pedido cancelado nao pode voltar para pago; a mensagem e o status servido ficam visiveis.
test("P8: impede alterar um pedido ja cancelado", async ({ page }) => {
  const status = page.getByLabel("Status do pedido 1");

  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pago");
  await expect(page.locator(".erro")).toHaveText(
    "Pedido cancelado nao pode ser alterado",
  );
  await expect(status).toHaveValue("cancelado");
});

// Remove o pedido inicial e verifica que so resta a linha de cabecalho.
test("P9: remove um pedido", async ({ page }) => {
  const pedido = page.getByRole("row").filter({ hasText: "Ana Souza" });

  await pedido.getByRole("button", { name: "Remover" }).click();

  await expect(page.getByRole("row")).toHaveCount(1);
});

// Desafio: cria, paga, cancela, tenta reabrir e remove um pedido novo.
test("P10: conclui o ciclo de status e remocao de um pedido", async ({ page }) => {
  await page.getByLabel("Cliente").selectOption({ label: "Bruno Lima" });
  await page.getByLabel("Produto").selectOption({ label: "Empada" });
  await page.getByLabel("Quantidade").fill("2");
  await page.getByRole("button", { name: "Adicionar item" }).click();
  await page.getByRole("button", { name: "Criar pedido" }).click();

  const pedido = page.getByRole("row").filter({ hasText: "2x Empada" });
  const status = page.getByLabel("Status do pedido 2");
  await expect(pedido).toContainText("Bruno Lima");
  await expect(pedido).toContainText("R$ 12,00");

  await status.selectOption("pago");
  await expect(status).toHaveValue("pago");
  await status.selectOption("cancelado");
  await expect(status).toHaveValue("cancelado");

  await status.selectOption("pendente");
  await expect(page.locator(".erro")).toHaveText(
    "Pedido cancelado nao pode ser alterado",
  );
  await expect(status).toHaveValue("cancelado");

  await pedido.getByRole("button", { name: "Remover" }).click();
  await expect(pedido).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(2);
});
