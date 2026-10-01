const {
  soma,
  subtrai,
  multiplica,
  divide,
  ehPar,
  raiz,
  media,
} = require("./calculadora");

describe("soma", () => {
  test("soma dois numeros positivos", () => {
    expect(soma(1, 3)).toBe(4);
  });
  test("soma dois numeros negativos", () => {
    expect(soma(-5, -7)).toBe(-12);
  });
});
describe("raiz", () => {
  test("raiz de um numero nao exato com precisao", () => {
    expect(raiz(2)).toBeCloseTo(1.414);
  });
  test("Lanca erro pra numero negativo", () => {
    expect(() => raiz(-4)).toThrow(
      "Nao e possivel calcular raiz de numero negativo",
    );
  });
  test("Calcular raiz quadrada de 9", () => {
    expect(() => raiz(9).toBe(9));
  });
});

describe("subtrai", () => {
  test("Numero negativo quando subtracao for negativa", () => {
    expect(subtrai(-1, 6)).toBe(-7);
  });
  test("Resultado correto da subtracao", () => {
    expect(subtrai(5, 1)).toBe(4);
  });
});

describe("multiplica", () => {
  test("Produto correto de dois numeros", () => {
    expect(multiplica(2, 2)).toBe(4);
  });
  test("Retornar 0 quando um dos dois numeros for 0", () => {
    expect(multiplica(2, 0)).toBe(0);
  });
  test("O resultado deve ser maior do que cada um dos fatores individualmente (quando ambos forem maiores que 1)", ()=> {
    expect(multiplica(2, 5)).toBeGreaterThan(5)
  })
});

describe("divide", () => {
  test("Resultado correto da div", () => {
    expect(divide(4, 2)).toBe(2);
  });
  test("Nao e possivel dividir por 0", () => {
    expect(() => divide(12, 0)).toThrow("Nao e possivel dividir por zero");
  });
});

describe("ehPar", () => {
  test("Retornar True para numero par", () => {
    expect(ehPar(4)).toBe(true);
  });
  test("Retornar false pra numero impar", () => {
    expect(ehPar(3)).toBe(false);
  });
});

describe("media", () => {
  test("Media de lista de inteiros", () => {
    expect(media([5, 5, 5, 5, 5])).toBe(5);
  });
  test("Media com numero decimal", () => {
    expect(media([5, 4.3, 1, 7, 6.5])).toBeCloseTo(4.76);
  });
  test("Media com lista vazia", () => {
    expect(() => media([])).toThrow("A lista de numeros nao pode ser vazia");
  });
  test("Media com erro qnd argumento != array", () => {
    expect(() => media(123, 1, 3)).toThrow(
      "A lista de numeros nao pode ser vazia",
    );
  });
});
