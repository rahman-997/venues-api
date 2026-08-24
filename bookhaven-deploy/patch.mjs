import fs from 'node:fs';

function patchJson(path, mutate) {
  const value = JSON.parse(fs.readFileSync(path, 'utf8'));
  mutate(value);
  fs.writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function replace(path, from, to) {
  let text = fs.readFileSync(path, 'utf8');
  if (text.includes(to)) return;
  if (!text.includes(from)) throw new Error(`Expected source fragment not found in ${path}`);
  text = text.replace(from, to);
  fs.writeFileSync(path, text);
}

patchJson('bookhaven/backend/tsconfig.json', (tsconfig) => {
  tsconfig.compilerOptions.module = 'Node16';
  tsconfig.compilerOptions.moduleResolution = 'Node16';
});

replace(
  'bookhaven/backend/src/modules/auth/auth.middleware.ts',
  "export type AuthRequest = Request & { auth?: { userId: string; role: UserRole } };",
  "export type AuthRequest<P = Record<string, string>> = Request<P> & { auth?: { userId: string; role: UserRole } };",
);

const books = 'bookhaven/backend/src/modules/books/book.controller.ts';
replace(books, 'export async function get(req: Request, res: Response)', 'export async function get(req: Request<{ id: string }>, res: Response)');
replace(books, 'export async function update(req: Request, res: Response)', 'export async function update(req: Request<{ id: string }>, res: Response)');
replace(books, 'export async function remove(req: Request, res: Response)', 'export async function remove(req: Request<{ id: string }>, res: Response)');

const cart = 'bookhaven/backend/src/modules/cart/cart.controller.ts';
replace(cart, 'export async function update(req: AuthRequest, res: Response)', 'export async function update(req: AuthRequest<{ bookId: string }>, res: Response)');
replace(cart, 'export async function remove(req: AuthRequest, res: Response)', 'export async function remove(req: AuthRequest<{ bookId: string }>, res: Response)');

replace(
  'bookhaven/frontend/next.config.ts',
  "const nextConfig: NextConfig = {\n  output: 'standalone',",
  "const nextConfig: NextConfig = {\n  output: 'standalone',\n  turbopack: { root: process.cwd() },",
);

console.log('BookHaven deployment patches applied.');
