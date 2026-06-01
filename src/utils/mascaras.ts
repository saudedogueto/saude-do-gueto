// ─── Máscaras ──────────────────────────────────────────────────────────

export function mascaraCPF(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  return nums
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascaraTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 10) {
    return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

export function mascaraData(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 8);
  return nums
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d*/, '$1');
}

export function mascaraCEP(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 8);
  return nums.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

// ─── Validações ─────────────────────────────────────────────────────────

export function validarCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(nums)) return false;

  const calcDig = (base: string, peso: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += parseInt(base[i]) * (peso - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const dig1 = calcDig(nums.slice(0, 9), 10);
  if (dig1 !== parseInt(nums[9])) return false;
  const dig2 = calcDig(nums.slice(0, 10), 11);
  if (dig2 !== parseInt(nums[10])) return false;
  return true;
}

export function validarData(data: string): boolean {
  const partes = data.split('/');
  if (partes.length !== 3) return false;
  const [d, m, a] = partes.map(Number);
  if (!d || !m || !a) return false;
  if (m < 1 || m > 12) return false;
  const diasMes = [31, (a % 4 === 0 && (a % 100 !== 0 || a % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (d < 1 || d > diasMes[m - 1]) return false;
  const hoje = new Date();
  if (a > hoje.getFullYear()) return false;
  return true;
}

export function validarTelefone(tel: string): boolean {
  const nums = tel.replace(/\D/g, '');
  return nums.length >= 10 && nums.length <= 11;
}

// ─── Busca CEP (ViaCEP) ────────────────────────────────────────────────

export type EnderecoCEP = {
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  erro?: boolean;
};

export async function buscarCEP(cep: string): Promise<EnderecoCEP | null> {
  const nums = cep.replace(/\D/g, '');
  if (nums.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${nums}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
    };
  } catch {
    return null;
  }
}
