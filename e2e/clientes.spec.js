const { test, expect } = require("@playwright/test");

// Cada teste reinicia os dados da API e abre a tela de Clientes.
test.beforeEach(async ({ page }) => {
  const resposta = await page.request.post("http://127.0.0.1:3000/__reset");
  expect(resposta.status()).toBe(204);

  await page.goto("/");
  await page.getByRole("button", { name: "Clientes" }).click();
  await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();
});

// Confere os clientes iniciais carregados pela API na tabela.
test("C1: lista os clientes iniciais", async ({ page }) => {
  const linhas = page.getByRole("row");

  await expect(linhas).toHaveCount(3); // Cabecalho e os dois clientes do seed.
  await expect(linhas.nth(1)).toContainText("Ana Souza");
  await expect(linhas.nth(2)).toContainText("Bruno Lima");
});

// Cadastra um cliente novo e confirma que a tela mostra o resultado e limpa o formulario.
test("C2: cadastra um cliente novo", async ({ page }) => {
  await page.getByLabel("Nome").fill("Carla Dias");
  await page.getByLabel("Email").fill("carla@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  const cliente = page.getByRole("row").filter({ hasText: "carla@email.com" });
  await expect(cliente).toContainText("Carla Dias");
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});

// Tenta enviar o formulario vazio e valida o erro retornado pela API.
test("C3: mostra erro ao cadastrar sem preencher os campos", async ({ page }) => {
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.locator(".erro")).toHaveText("Nome e email sao obrigatorios");
  await expect(page.getByRole("row")).toHaveCount(3);
});

// O email do seed ja pertence a Ana; a tentativa duplicada deve falhar sem criar linha.
test("C4: impede o cadastro de email duplicado", async ({ page }) => {
  await page.getByLabel("Nome").fill("Teste");
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  await expect(page.locator(".erro")).toHaveText("Email ja cadastrado");
  await expect(page.getByRole("row")).toHaveCount(3);
});

// Abre a edicao de Bruno, confere os valores existentes e salva o novo nome.
test("C5: edita um cliente e salva as alteracoes", async ({ page }) => {
  const cliente = page.getByRole("row").filter({ hasText: "bruno@email.com" });

  await cliente.getByRole("button", { name: "Editar" }).click();
  await expect(page.getByLabel("Nome")).toHaveValue("Bruno Lima");
  await expect(page.getByLabel("Email")).toHaveValue("bruno@email.com");
  await expect(page.getByRole("button", { name: "Salvar" })).toBeVisible();

  await page.getByLabel("Nome").fill("Bruno Lima Silva");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(cliente).toContainText("Bruno Lima Silva");
  await expect(page.getByRole("button", { name: "Cancelar" })).toHaveCount(0);
  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
});

// Cancela a edicao de Ana e garante que nenhuma alteracao foi salva.
test("C6: cancela a edicao sem alterar o cliente", async ({ page }) => {
  const cliente = page.getByRole("row").filter({ hasText: "ana@email.com" });

  await cliente.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nome").fill("Nome que nao deve ser salvo");
  await page.getByRole("button", { name: "Cancelar" }).click();

  await expect(page.getByLabel("Nome")).toHaveValue("");
  await expect(page.getByLabel("Email")).toHaveValue("");
  await expect(cliente).toContainText("Ana Souza");
  await expect(page.getByRole("row")).toHaveCount(3);
});

// Tenta atribuir a Bruno o email que ja pertence a Ana; o email original deve permanecer.
test("C7: impede editar um cliente para usar email de outro", async ({ page }) => {
  const bruno = page.getByRole("row").filter({ hasText: "bruno@email.com" });

  await bruno.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Email").fill("ana@email.com");
  await page.getByRole("button", { name: "Salvar" }).click();

  await expect(page.locator(".erro")).toHaveText("Email ja cadastrado");
  await expect(bruno).toContainText("bruno@email.com");
  await expect(page.getByRole("row")).toHaveCount(3);
});

// Remove Bruno e confirma que resta apenas Ana, alem do cabecalho da tabela.
test("C8: remove um cliente", async ({ page }) => {
  const bruno = page.getByRole("row").filter({ hasText: "bruno@email.com" });

  await bruno.getByRole("button", { name: "Remover" }).click();

  await expect(page.getByRole("row").filter({ hasText: "Bruno Lima" })).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("row").nth(1)).toContainText("Ana Souza");
});

// Desafio: cria Diego, edita o nome, tenta repetir o email e remove o cliente criado.
test("C9: conclui o ciclo de cadastro, edicao, duplicidade e remocao", async ({ page }) => {
  await page.getByLabel("Nome").fill("Diego");
  await page.getByLabel("Email").fill("diego@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();

  let diego = page.getByRole("row").filter({ hasText: "diego@email.com" });
  await expect(diego).toContainText("Diego");
  await diego.getByRole("button", { name: "Editar" }).click();
  await page.getByLabel("Nome").fill("Diego Matos");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(diego).toContainText("Diego Matos");

  await page.getByLabel("Nome").fill("Outro Diego");
  await page.getByLabel("Email").fill("diego@email.com");
  await page.getByRole("button", { name: "Cadastrar" }).click();
  await expect(page.locator(".erro")).toHaveText("Email ja cadastrado");
  await expect(page.getByRole("row")).toHaveCount(4);

  diego = page.getByRole("row").filter({ hasText: "diego@email.com" });
  await diego.getByRole("button", { name: "Remover" }).click();
  await expect(diego).toHaveCount(0);
  await expect(page.getByRole("row")).toHaveCount(3);
});
