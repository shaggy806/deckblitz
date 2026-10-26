import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const metalcraft = (game: Parameters<typeof spawn>[0]): void => {
  for (let i = 0; i < 3; i++) spawn(game, "Memnite");
};

describe("Scars of Mirrodin, batch 3 group C", () => {
  it("Sylvok Lifestaff: +1/+0, and 3 life when the equipped creature dies", () => {
    const { game } = table();
    const staff = spawn(game, "Sylvok Lifestaff");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, staff, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    const before = life(game, A);
    destroy(game, bears);
    expect(life(game, A)).toBe(before + 3);
  });

  it("Razor Hippogriff: returns an artifact card and gains its mana value in life", () => {
    const { game, a } = table();
    const tick = toGraveyard(game, "Rust Tick");
    pickTargets(a, tick);
    enter(game, "Razor Hippogriff");
    expect(zone(game, tick)).toBe("hand");
    expect(life(game, A)).toBe(23);
  });

  it("Bleak Coven Vampires: drains 4 only with metalcraft", () => {
    const { game, a } = table();
    pickTargets(a, B);
    enter(game, "Bleak Coven Vampires");
    expect(life(game, B)).toBe(20);
    metalcraft(game);
    enter(game, "Bleak Coven Vampires");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("Painsmith: an artifact spell may give a creature +2/+0 and deathtouch", () => {
    const { game, a } = table();
    spawn(game, "Painsmith");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
  });

  it("Screeching Silcaw: mills four on combat damage with metalcraft", () => {
    const { game, a } = table();
    metalcraft(game);
    const silcaw = spawn(game, "Screeching Silcaw");
    const before = graveyard(game, B).length;
    attack(game, a, [silcaw]);
    expect(graveyard(game, B).length).toBe(before + 4);
  });

  it("Blade-Tribe Berserkers: +3/+3 and haste with metalcraft, nothing without", () => {
    const { game } = table();
    const plain = enter(game, "Blade-Tribe Berserkers");
    expect(pt(game, plain)).toEqual({ power: 3, toughness: 3 });
    metalcraft(game);
    const pumped = enter(game, "Blade-Tribe Berserkers");
    expect(pt(game, pumped)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, pumped).has("haste")).toBe(true);
  });

  it("Lumengrid Drake: bounces a creature only with metalcraft", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Lumengrid Drake");
    expect(zone(game, bears)).toBe("battlefield");
    metalcraft(game);
    enter(game, "Lumengrid Drake");
    expect(zone(game, bears)).toBe("hand");
  });

  it("Rust Tick: the tapped artifact stays tapped while Rust Tick does", () => {
    const { game } = table();
    const tick = spawn(game, "Rust Tick");
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Wastes", 1);
    activate(game, tick, 0, { targets: [ref(thopter)] });
    expect(game.state.objects[thopter].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[thopter].tapped).toBe(true);
  });

  it("Ezuri's Brigade: +4/+4 and trample with metalcraft", () => {
    const { game } = table();
    const brigade = spawn(game, "Ezuri's Brigade");
    expect(pt(game, brigade)).toEqual({ power: 4, toughness: 4 });
    metalcraft(game);
    expect(pt(game, brigade)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, brigade).has("trample")).toBe(true);
  });

  it("Trigon of Thought: enters with three charge counters; one draws a card", () => {
    const { game } = table();
    const trigon = enter(game, "Trigon of Thought");
    expect(counters(game, trigon, "charge")).toBe(3);
    lands(game, "Wastes", 2);
    const before = hand(game, A).length;
    activate(game, trigon, 1);
    expect(hand(game, A).length).toBe(before + 1);
    expect(counters(game, trigon, "charge")).toBe(2);
  });

  it("Necrogen Censer: a charge counter makes a player lose 2 life", () => {
    const { game } = table();
    const censer = enter(game, "Necrogen Censer");
    expect(counters(game, censer, "charge")).toBe(2);
    activate(game, censer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(counters(game, censer, "charge")).toBe(1);
  });
});
