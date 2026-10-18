export function formatFCFA(amount: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount)} FCFA`;
}