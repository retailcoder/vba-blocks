import { Manifest, parseManifest, loadManifest } from '../';
import { isPathDependency } from '../dependency';
import { relative } from '../../utils/path';
import {
  dir as FIXTURES,
  standard,
  invalidManifest
} from '../../../tests/__fixtures__';

const BASE_MANIFEST: {
  package: {
    name: string;
    version: string;
    authors: string[];
    target?: string | object;
  };
} = {
  package: { name: 'package-name', version: '1.0.0', authors: ['Tim Hall'] }
};

test('loads valid package metadata', () => {
  expect(normalize(parseManifest(BASE_MANIFEST, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid package metadata', () => {
  expect(() => parseManifest({}, FIXTURES)).toThrow();
  expect(() => parseManifest({ package: {} }, FIXTURES)).toThrow();
  expect(() =>
    parseManifest({ package: { name: 'package-name' } }, FIXTURES)
  ).toThrow();
  expect(() =>
    parseManifest({ package: { version: '1.0.0' } }, FIXTURES)
  ).toThrow();
  expect(() =>
    parseManifest({ package: { authors: ['Tim Hall'] } }, FIXTURES)
  ).toThrow();
});

test('loads valid sources', () => {
  const value = {
    ...BASE_MANIFEST,
    src: {
      A: 'src/a.bas',
      B: { path: 'src/b.cls' },
      C: { path: 'src/c.frm', optional: true }
    }
  };

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid sources', () => {
  const value = {
    ...BASE_MANIFEST,
    src: {
      missing_path: { optional: true }
    }
  };

  expect(() => parseManifest(value, FIXTURES)).toThrow();
});

test('loads valid dependencies', () => {
  const value = {
    ...BASE_MANIFEST,
    dependencies: {
      a: '^1.0.0',
      b: {
        version: '^2.0.0',
        optional: true,
        features: ['a', 'b'],
        'default-features': false
      },
      c: { path: 'packages/c' },
      d: { git: 'https://github.com/VBA-tools/VBA-Web' },
      e: { git: 'https://github.com/VBA-tools/VBA-Web', branch: 'next' },
      f: { git: 'https://github.com/VBA-tools/VBA-Web', tag: 'v1.0.0' },
      g: { git: 'https://github.com/VBA-tools/VBA-Web', rev: 'a1b2c3d4' }
    }
  };

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid dependencies', () => {
  const value: any = { ...BASE_MANIFEST, dependencies: { a: {} } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();
});

test('load valid references', () => {
  const value = {
    ...BASE_MANIFEST,
    references: {
      a: {
        version: '1.0',
        guid: '{420B2830-E718-11CF-893D-00A0C9054228}',
        optional: true
      }
    }
  };

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('throws for invalid references', () => {
  let value: any = { ...BASE_MANIFEST, references: { a: {} } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, references: { b: { version: '1.0.0' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = { ...BASE_MANIFEST, references: { c: { version: '1.0' } } };
  expect(() => parseManifest(value, FIXTURES)).toThrow();

  value = {
    ...BASE_MANIFEST,
    references: {
      d: { version: '1.0', guid: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
    }
  };
  expect(() => parseManifest(value, FIXTURES)).toThrow();
});

test('loads valid target', () => {
  const value = {
    ...BASE_MANIFEST
  };
  value.package.target = 'xlsm';

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();

  value.package.target = { type: 'xlam', name: 'addin', path: 'targets/xlam' };

  expect(normalize(parseManifest(value, FIXTURES))).toMatchSnapshot();
});

test('loads and parses manifest', async () => {
  const manifest = await loadManifest(standard);
  expect(normalize(manifest, standard)).toMatchSnapshot();
});

test('throws for invalid syntax', async () => {
  expect.assertions(1);

  try {
    await loadManifest(invalidManifest);
  } catch (err) {
    expect(err.message.replace(FIXTURES, 'fixtures')).toMatchSnapshot();
  }
});

function normalize(
  manifest: Manifest,
  relativeTo: string = FIXTURES
): Manifest {
  manifest.dir = normalizePath(manifest.dir, relativeTo);

  for (const src of manifest.src) {
    src.path = normalizePath(src.path, relativeTo);

    if (src.binary) {
      src.binary = normalizePath(src.binary, relativeTo);
    }
  }
  if (manifest.target) {
    manifest.target.path = normalizePath(manifest.target.path, relativeTo);
  }
  for (const dependency of manifest.dependencies) {
    if (isPathDependency(dependency)) {
      dependency.path = normalizePath(dependency.path, relativeTo);
    }
  }

  return manifest;
}

function normalizePath(path: string, relativeTo: string = FIXTURES): string {
  return relative(relativeTo, path);
}
