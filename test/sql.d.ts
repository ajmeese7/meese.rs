// Vite's ?raw suffix, used to load worker/schema.sql into the tests so they run
// against the same schema production does.
declare module "*.sql?raw" {
  const contents: string;
  export default contents;
}
