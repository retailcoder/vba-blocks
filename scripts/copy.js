const { join } = require('path');
const { copy } = require('fs-extra');

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await copy(
    join(resolveModule('dugite'), 'git'),
    join(__dirname, '../dist/unpacked/git')
  );

  await copy(
    join(__dirname, '../run-scripts'),
    join(__dirname, '../dist/unpacked/run-scripts')
  );

  await copy(
    join(__dirname, '../addins/build'),
    join(__dirname, '../dist/unpacked/addins'),
    {
      filter(src) {
        return !src.includes('.backup');
      }
    }
  );
}

function resolveModule(name) {
  const [root] = require.resolve(name).split('node_modules', 1);
  return join(root, 'node_modules', name);
}
