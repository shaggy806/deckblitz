/**
 * Battle for Zendikar, group D. One test per clause most likely to be wrong:
 * Gideon, Ally of Zendikar's animation and prevention, Fertile Thicket's
 * basic-land look, Swell of Growth's land drop, rally on itself and another
 * Ally (Kalastria Healer, Chasm Guide), Vile Aggregate's colorless count,
 * ingest, converge (Unified Front, Prism Array), Molten Nursery's colorless
 * cast, Tightening Coils, Silent Skimmer, Murasa Ranger's paid landfall,
 * Adverse Conditions with no targets and Carrier Thrall's Scion.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Gideon, Ally of Zendikar", () => {
  it("+1: becomes a 5/5 indestructible Human Soldier Ally creature, and damage to him is prevented", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Ally of Zendikar");
    loyalty(game, gideon, 1);
    expect(types(game, gideon)).toEqual(expect.arrayContaining(["creature", "planeswalker"]));
    expect(subtypes(game, gideon)).toEqual(expect.arrayContaining(["Human", "Soldier", "Ally", "Gideon"]));
    expect(pt(game, gideon)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, gideon).has("indestructible")).toBe(true);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(gideon)] });
    expect(counters(game, gideon, "loyalty")).toBe(5);
  });

  it("0: makes a Knight Ally", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Ally of Zendikar");
    loyalty(game, gideon, 0);
    expect(tokensNamed(game, "Knight Ally Token", A)).toBe(1);
  });

  it("−4: an emblem pumps your creatures", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Ally of Zendikar");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    loyalty(game, gideon, -4, { atLeast: 4 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Fertile Thicket", () => {
  it("enters tapped; a basic land from the top five goes back on top, the rest to the bottom", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const c5 = toLibrary(game, "Serra Angel");
    const c4 = toLibrary(game, "Forest");
    const c3 = toLibrary(game, "Craw Wurm");
    const c2 = toLibrary(game, "Ornithopter");
    const c1 = toLibrary(game, "Fertile Thicket");
    pickModes(a, 0);
    let offered: readonly ObjectId[] = [];
    // The pick, then the order of the rest on the bottom.
    a.chooseFromZoneFn = (_view, eligible) => {
      if (!eligible.includes(c4)) return [...eligible];
      offered = eligible;
      return [c4];
    };
    const thicket = enter(game, "Fertile Thicket");
    expect(isTapped(game, thicket)).toBe(true);
    expect(offered).toEqual([c4]);
    const lib = library(game);
    expect(lib[0]).toBe(c4);
    expect(lib.slice(-4).sort()).toEqual([c1, c2, c3, c5].sort());
  });
});

describe("Swell of Growth", () => {
  it("pumps the creature and puts a land from your hand onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    cast(game, toHand(game, "Swell of Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, forest)).toBe("battlefield");
  });
});

describe("Kalastria Healer", () => {
  it("drains on its own entry and on another Ally's", () => {
    const { game } = table();
    enter(game, "Kalastria Healer");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    // The second Healer's entry triggers both: its own rally and the first's.
    enter(game, "Kalastria Healer");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Chasm Guide", () => {
  it("gives creatures you control haste when it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Chasm Guide");
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(keywords(game, theirs).has("haste")).toBe(false);
  });
});

describe("Vile Aggregate", () => {
  it("has power equal to the colorless creatures you control, itself included", () => {
    const { game } = table();
    const aggregate = spawn(game, "Vile Aggregate");
    spawn(game, "Culling Drone");
    spawn(game, "Grizzly Bears");
    spawn(game, "Culling Drone", B);
    expect(pt(game, aggregate)).toEqual({ power: 2, toughness: 5 });
  });
});

describe("Ingest (Culling Drone)", () => {
  it("the damaged player exiles the top card of their library", () => {
    const { game, a } = table();
    const drone = spawn(game, "Culling Drone");
    const top = toLibrary(game, "Grizzly Bears", B);
    attack(game, a, [drone]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, top)).toBe("exile");
  });
});

describe("Unified Front", () => {
  it("makes a Kor Ally for each color of mana spent", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Unified Front"));
    expect(tokensNamed(game, "Kor Ally Token", A)).toBe(4);
  });
});

describe("Prism Array", () => {
  it("enters with a crystal counter per color spent; removing one taps a creature", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 2);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const array = toHand(game, "Prism Array");
    cast(game, array);
    expect(counters(game, array, "crystal")).toBe(4);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, array, 0, { targets: [ref(bears)] });
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, array, "crystal")).toBe(3);
  });
});

describe("Molten Nursery", () => {
  it("deals 1 damage when you cast a colorless spell", () => {
    const { game, a } = table();
    spawn(game, "Molten Nursery");
    lands(game, "Forest", 3);
    pickTargets(a, B);
    cast(game, toHand(game, "Call the Scions"));
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(2);
  });
});

describe("Tightening Coils", () => {
  it("gives -6/-0 and takes flying away", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Tightening Coils"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: -2, toughness: 4 });
    expect(keywords(game, angel).has("flying")).toBe(false);
  });
});

describe("Silent Skimmer", () => {
  it("defending player loses 2 life when it attacks", () => {
    const { game, a } = table();
    const skimmer = spawn(game, "Silent Skimmer");
    attack(game, a, [skimmer]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Murasa Ranger", () => {
  it("landfall: paying {3}{G} puts two +1/+1 counters on it", () => {
    const { game, a } = table();
    const ranger = spawn(game, "Murasa Ranger");
    lands(game, "Forest", 4);
    pickModes(a, 0);
    enter(game, "Forest");
    expect(counters(game, ranger)).toBe(2);
  });

  it("declining pays nothing and puts no counters", () => {
    const { game, a } = table();
    const ranger = spawn(game, "Murasa Ranger");
    const forests = lands(game, "Forest", 4);
    pickModes(a);
    enter(game, "Forest");
    expect(counters(game, ranger)).toBe(0);
    expect(forests.every((f) => !isTapped(game, f))).toBe(true);
  });
});

describe("Adverse Conditions", () => {
  it("taps a creature that then skips its untap, and makes a Scion", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Adverse Conditions"), { targets: [ref(bears), null] });
    expect(isTapped(game, bears)).toBe(true);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });

  it("cast with no targets still makes the Scion", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Adverse Conditions"), { targets: [null, null] });
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });
});

describe("Carrier Thrall", () => {
  it("makes a Scion when it dies", () => {
    const { game } = table();
    const thrall = spawn(game, "Carrier Thrall");
    destroy(game, thrall);
    expect(tokensNamed(game, "Eldrazi Scion Token", A)).toBe(1);
  });
});
