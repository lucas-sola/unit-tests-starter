const ClienteService = require("../../services/ClienteService");

// Teste unitario: o service e testado em isolamento total.
// O repository e substituido por um mock (jest.fn()), assim testamos so a
// logica do service, sem depender de dados reais.
//
// Abaixo ha 1 teste pronto (listar) como referencia de estilo.
// Os demais estao como test.todo — implemente cada um seguindo o ENUNCIADO-02-CLIENTES.md.

describe("ClienteService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ClienteService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const clientes = [{ id: 1, nome: "Ana Souza", email: "ana@email.com" }];
      mockRepository.findAll.mockReturnValue(clientes);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(clientes);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o cliente encontrado", () => {
      const cliente = { id: 7, nome: "Ana Souza", email: "ana@email.com" };
      mockRepository.findById.mockReturnValue(cliente);

      const resultado = service.buscarPorId(7);

      expect(mockRepository.findById).toHaveBeenCalledWith(7);
      expect(resultado).toEqual(cliente);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(99)).toThrow("Cliente nao encontrado");
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o cliente criado", () => {
      const dados = { nome: "Carlos", email: "carlos@email.com" };
      const clienteCriado = { id: 10, ...dados };
      mockRepository.create.mockReturnValue(clienteCriado);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(clienteCriado);
    });

    test("propaga o erro quando nome ou email estiverem faltando", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Nome e email sao obrigatorios");
      });

      expect(() => service.criar({ nome: "Carlos" })).toThrow("Nome e email sao obrigatorios");
    });

    test("propaga o erro quando o email ja estiver cadastrado", () => {
      mockRepository.create.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.criar({ nome: "Carlos", email: "ana@email.com" })).toThrow("Email ja cadastrado");
    });
  });

  describe("atualizar", () => {
    test("chama repository.findById e repository.update quando o cliente existe", () => {
      const clienteAtual = { id: 1, nome: "Ana Souza", email: "ana@email.com" };
      const dadosNovos = { nome: "Ana Souza Atualizada", email: "ana.nova@email.com" };
      const clienteAtualizado = { ...clienteAtual, ...dadosNovos };
      mockRepository.findById.mockReturnValue(clienteAtual);
      mockRepository.update.mockReturnValue(clienteAtualizado);

      const resultado = service.atualizar(1, dadosNovos);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, dadosNovos);
      expect(resultado).toEqual(clienteAtualizado);
    });

    test("lanca erro 'Cliente nao encontrado' sem chamar repository.update quando o cliente nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.atualizar(99, { email: "novo@email.com" })).toThrow("Cliente nao encontrado");
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo email ja pertence a outro cliente", () => {
      mockRepository.findById.mockReturnValue({ id: 1, nome: "Ana Souza", email: "ana@email.com" });
      mockRepository.update.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.atualizar(1, { email: "bruno@email.com" })).toThrow("Email ja cadastrado");
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o cliente existe", () => {
      mockRepository.delete.mockReturnValue(true);

      service.remover(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna false", () => {
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(99)).toThrow("Cliente nao encontrado");
    });
  });
});
