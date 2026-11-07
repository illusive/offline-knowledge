import { describe, expect, it } from 'vitest';
import { curatedGuides, parseSearchTerms, type SearchTermEntry } from './searchTerms';

const terms: SearchTermEntry[] = [
  { phrases: ['kan ikke få luft', 'åndenød'], guides: ['frie-luftveje', 'vejrtraekning', 'fremmedlegeme-i-luftvejene', 'allergiske-reaktioner'] },
  { phrases: ['reagerer ikke', 'bevidstløs'], guides: ['bevidsthed', 'vejrtraekning', 'hlr-voksne'] },
  { phrases: ['bløder meget', 'bløder'], guides: ['massive-bloedninger', 'mindre-bloedninger'] },
  { phrases: ['noget i halsen'], guides: ['fremmedlegeme-i-luftvejene'] },
  { phrases: ['ingen elektricitet', 'ingen strøm'], guides: ['stroemmen-er-gaaet', 'lav-mad-uden-stroem'] },
  { phrases: ['røg'], guides: ['kulilte'] },
];

describe('Everyday phrases that find guides (D-071)', () => {
  it('finds the guides for the phrases people use', () => {
    expect(curatedGuides('kan ikke få luft', terms)).toEqual(['frie-luftveje', 'vejrtraekning', 'fremmedlegeme-i-luftvejene', 'allergiske-reaktioner']);
    expect(curatedGuides('Reagerer ikke', terms)).toEqual(['bevidsthed', 'vejrtraekning', 'hlr-voksne']);
    expect(curatedGuides('bløder meget', terms)).toEqual(['massive-bloedninger', 'mindre-bloedninger']);
    expect(curatedGuides('noget i halsen', terms)).toEqual(['fremmedlegeme-i-luftvejene']);
    expect(curatedGuides('ingen elektricitet', terms)).toEqual(['stroemmen-er-gaaet', 'lav-mad-uden-stroem']);
  });

  it('finds a phrase inside a longer query, and while it is typed', () => {
    expect(curatedGuides('jeg kan ikke få luft!', terms)).toContain('frie-luftveje');
    expect(curatedGuides('han bløder', terms)).toContain('massive-bloedninger');
    expect(curatedGuides('kan ikke f', terms)).toContain('frie-luftveje');
    expect(curatedGuides('KAN IKKE FA LUFT', terms)).toContain('frie-luftveje'); // å folds to a, as in the index
  });

  it('gives several guides for an unclear phrase, never just one answer', () => {
    expect(curatedGuides('åndenød', terms).length).toBeGreaterThan(1);
  });

  it('matches whole words only, so a short phrase does not hide in another word', () => {
    expect(curatedGuides('røget laks', terms)).toEqual([]);
    expect(curatedGuides('blødningsforstyrrelse', terms)).toEqual([]);
    expect(curatedGuides('ab', terms)).toEqual([]);
    expect(curatedGuides('hjertestop', terms)).toEqual([]);
  });

  it('reads the list from the pack, and an older pack without it has none', () => {
    expect(parseSearchTerms(JSON.stringify(terms))).toEqual(terms);
    expect(parseSearchTerms(undefined)).toEqual([]);
    expect(parseSearchTerms('not json')).toEqual([]);
    expect(parseSearchTerms(JSON.stringify([{ phrases: ['x'], guides: [1] }, 'bad']))).toEqual([]);
  });
});
