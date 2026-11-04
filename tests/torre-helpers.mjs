/* Navegação específica do Guitarra Fácil: os outros apps mantêm a barra do Kit. */
export async function irPelaNav(page, nome) {
  const retorno = page.locator('.torre-voltar');
  if (await retorno.isVisible()) await retorno.click();
  await page.locator('.torre-palco').waitFor();
  const destino = { Explorar: 'Explorar o braço', Estúdio: 'Estúdio de criação' }[nome] || nome;
  await page.locator('.torre-palco').getByRole('button', { name: destino, exact: true }).click();
  await page.locator('.torre-voltar').waitFor();
}
export const abrirAjustesPelaNav = page => irPelaNav(page, 'Ajustes');
export async function conferirNavAjustes(page) {
  const erros = [];
  if (await page.locator('.kf-nav').isVisible()) erros.push('barra inferior ainda visível');
  if (await page.locator('.kf-trilho').isVisible()) erros.push('trilho lateral ainda visível');
  if (await page.locator('.torre-palco [data-ir="ajustes"]').count() !== 1) erros.push('Ajustes ausente da torre');
  return { erros };
}
