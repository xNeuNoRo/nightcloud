import fs from "fs";
import readline from "readline";
import path from "path";

const packagePath = path.resolve(process.cwd(), "package.json");

// Funciones de color
const dim = (text) => `\x1b[2m${text}\x1b[0m`; // Gris oscuro / separadores
const cyan = (text) => `\x1b[36m${text}\x1b[0m`; // Etapas / info
const green = (text) => `\x1b[32m${text}\x1b[0m`; // Éxito
const red = (text) => `\x1b[31m${text}\x1b[0m`; // Error

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  if (!fs.existsSync(packagePath)) {
    console.error(red("❌ No se ha encontrado el archivo package.json."));
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

  console.log(dim("\n───────────────────────────────\n"));
  console.log(cyan("🔹 Configurando el package.json..."));
  console.log(
    dim("TIP: Puedes dejar campos vacios para que permanezcan sin cambios\n"),
  );
  const name = (await ask(cyan(`Nombre del proyecto: `))) || pkg.name;
  const author = (await ask(cyan(`Autor del proyecto: `))) || pkg.author;
  const version = (await ask(cyan(`Version: `))) || pkg.version;
  const description = (await ask(cyan(`Descripcion: `))) || pkg.description;

  pkg.name = name;
  pkg.author = author;
  pkg.version = version;
  pkg.description = description;

  fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");

  console.log(green("\n✅ Se ha actualizado el package.json exitosamente!\n\n"));
}

main();
