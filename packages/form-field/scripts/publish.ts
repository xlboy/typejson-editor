import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { PackageJson } from 'type-fest';

const pkgPath = path.join(process.cwd(), 'package.json');
const rawPackageJson = fs.readFileSync(pkgPath, 'utf-8');

const parsedPackageJson = JSON.parse(rawPackageJson) as PackageJson;

delete parsedPackageJson.scripts;
delete parsedPackageJson.devDependencies;
if (parsedPackageJson.dependencies && Object.values(parsedPackageJson.dependencies).length === 0) {
  delete parsedPackageJson.dependencies;
}

fs.writeJsonSync(pkgPath, parsedPackageJson, { spaces: 2 });

try {
  const useYalc = process.argv.includes('--yalc');
  if (useYalc) {
    await execa('yalc', ['publish'], { stdio: 'inherit' });
  } else {
    await execa('npm', ['publish'], { stdio: 'inherit' });
  }
} catch (error) {
  console.error(error);
} finally {
  await fs.writeFile(pkgPath, rawPackageJson, 'utf-8');
}
