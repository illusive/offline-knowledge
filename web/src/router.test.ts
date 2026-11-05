import { describe, expect, it } from 'vitest';
import { hrefs, parseRoute, tabOf, SAVED_SECTIONS, FOOD_TABS } from './router';

describe('routes', () => {
  it('every link the app makes leads back to its page', () => {
    const cases: [string, ReturnType<typeof parseRoute>][] = [
      [hrefs.home, { name: 'home' }],
      [hrefs.storage, { name: 'storage' }],
      [hrefs.firstAid, { name: 'firstAid' }],
      [hrefs.growing, { name: 'growing' }],
      [hrefs.prepare, { name: 'prepare' }],
      [hrefs.guide('hlr-voksne'), { name: 'guide', id: 'hlr-voksne' }],
      [hrefs.saved(), { name: 'saved', section: null }],
      [hrefs.map, { name: 'map' }],
      [hrefs.forraad, { name: 'forraad' }],
      [hrefs.forraadNew(), { name: 'forraadEdit', id: null, category: null, recommendationId: null }],
      [hrefs.forraadNew('food', 'knaekbroed'), { name: 'forraadEdit', id: null, category: 'food', recommendationId: 'knaekbroed' }],
      [hrefs.forraadItem('a b'), { name: 'forraadEdit', id: 'a b', category: null, recommendationId: null }],
      [hrefs.tools, { name: 'tools' }],
      [hrefs.compass, { name: 'compass' }],
      [hrefs.settings, { name: 'settings' }],
    ];
    for (const [href, route] of cases) expect(parseRoute(href), href).toEqual(route);
    for (const section of SAVED_SECTIONS) expect(parseRoute(hrefs.saved(section))).toEqual({ name: 'saved', section });
    for (const tab of FOOD_TABS) expect(parseRoute(hrefs.food('248', tab))).toEqual({ name: 'food', id: '248', tab });
  });

  it('an unknown address opens Home', () => {
    expect(parseRoute('#/nowhere')).toEqual({ name: 'home' });
    expect(parseRoute('')).toEqual({ name: 'home' });
  });

  it('puts each page under its tab; Settings belongs to none (D-046)', () => {
    expect(tabOf({ name: 'guide', id: 'x' })).toBe('home');
    expect(tabOf({ name: 'compass' })).toBe('tools');
    expect(tabOf({ name: 'forraadEdit', id: null, category: null, recommendationId: null })).toBe('forraad');
    expect(tabOf({ name: 'map' })).toBe('map');
    expect(tabOf({ name: 'settings' })).toBeNull();
  });

  it('saved sections follow the category order (D-048)', () => {
    expect([...SAVED_SECTIONS]).toEqual(['first-aid', 'prepare', 'storage', 'growing']);
  });
});
