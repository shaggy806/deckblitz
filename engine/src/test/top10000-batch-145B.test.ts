/**
 * Batch 145, group B — EDHREC ranks 7949–8197. One test per clause most
 * likely to be wrong: Overwhelming Victory's excess-damage pump, Heroes'
 * Bane's power-many counters, Gelatinous Genesis's X X/X Oozes, Myrsmith's
 * {1} payment, Saheeli Rai's artifact copy with haste exiled at the end step,
 * Thopter Foundry's blue Thopter, Mirror Gallery's legend rule, Treachery's
 * control and untap, Congregation at Dawn's order on top, Conflux's one card
 * per colour, Yisan's verse-counter mana value, Titan Forge's Golem, Goblin
 * Bushwhacker's kicked pump, Juniper Order Ranger's two counters, Master
 * Splicer's Golem lord and Blighted Steppe's live count.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Overwhelming Victory", () => {
  it("pumps each creature you control by the excess damage and gives trample", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const mine = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Overwhelming Victory"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(pt(game, mine)).toEqual({ power: 5, toughness: 2 }); // 5 damage to a 2/2: 3 excess
    expect(keywords(game, mine).has("trample")).toBe(true);
  });
});

describe("Heroes' Bane", () => {
  it("enters with four counters and doubles them for {2}{G}{G}", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bane = enter(game, "Heroes' Bane");
    expect(counters(game, bane)).toBe(4);
    activate(game, bane);
    expect(counters(game, bane)).toBe(8);
    expect(pt(game, bane)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Gelatinous Genesis", () => {
  it("makes X X/X Oozes for {X}{X}{G}", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Gelatinous Genesis"), { x: 2 });
    const oozes = named(game, "Ooze Token (Convert to Slime)", A);
    expect(tokensNamed(game, "Ooze Token (Convert to Slime)", A)).toBe(2);
    expect(pt(game, oozes[0])).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Myrsmith", () => {
  it("makes a Myr when {1} is paid for an artifact spell", () => {
    const { game, a } = table();
    spawn(game, "Myrsmith");
    lands(game, "Wastes", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "Myr Token", A)).toBe(1);
    expect(game.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(1);
  });
});

describe("Saheeli Rai", () => {
  it("−2: copies a creature as an artifact with haste, exiled at the next end step", () => {
    const { game } = table();
    const saheeli = spawn(game, "Saheeli Rai");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, saheeli, -2, { targets: [ref(bears)], atLeast: 3 });
    const copies = named(game, "Grizzly Bears", A).filter((id) => id !== bears);
    expect(copies).toHaveLength(1);
    expect(types(game, copies[0])).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", A)).toEqual([bears]);
  });
});

describe("Thopter Foundry", () => {
  it("sacrifices a nontoken artifact for a blue flying Thopter and 1 life", () => {
    const { game } = table();
    const foundry = spawn(game, "Thopter Foundry");
    const ornithopter = spawn(game, "Ornithopter");
    lands(game, "Wastes", 1);
    game.dispatch({ type: "activate-ability", player: A, source: foundry, abilityIndex: 0, targets: [], sacrifice: ornithopter });
    settle(game);
    expect(zone(game, ornithopter)).toBe("graveyard");
    const thopters = named(game, "Blue Thopter Token", A);
    expect(thopters).toHaveLength(1);
    expect(game.registry.get(game.state.objects[thopters[0]].cardName).colors).toEqual(["U"]);
    expect(keywords(game, thopters[0]).has("flying")).toBe(true);
    expect(life(game)).toBe(21);
  });
});

describe("Mirror Gallery", () => {
  it("keeps two copies of a legendary permanent", () => {
    const { game } = table();
    spawn(game, "Mirror Gallery");
    const first = spawn(game, "Isamaru, Hound of Konda");
    const second = spawn(game, "Isamaru, Hound of Konda");
    settle(game);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
  });
});

describe("Treachery", () => {
  it("takes the creature and untaps the lands paid for it", () => {
    const { game, a } = table();
    const islands = lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickPermanents(a, ...islands);
    cast(game, toHand(game, "Treachery"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(islands.filter((id) => game.state.objects[id].tapped)).toHaveLength(0);
  });
});

describe("Congregation at Dawn", () => {
  it("puts the found creatures on top in the order chosen", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Plains", 1);
    const elves = toLibrary(game, "Llanowar Elves");
    const bears = toLibrary(game, "Grizzly Bears");
    const library = (): readonly ObjectId[] => game.state.zones.perPlayer[A].library;
    const topIndex = library()[0] === bears ? 0 : library().length - 1;
    pickFromZone(a, elves, bears);
    cast(game, toHand(game, "Congregation at Dawn"));
    expect(library()[topIndex]).toBe(elves);
    expect(library()[topIndex === 0 ? 1 : library().length - 2]).toBe(bears);
  });
});

describe("Conflux", () => {
  it("finds one card of each colour", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) spawn(game, land);
    const cards = ["Swords to Plowshares", "Counterspell", "Doom Blade", "Lightning Bolt", "Llanowar Elves"].map((n) =>
      toLibrary(game, n),
    );
    pickFromZone(a, ...cards);
    cast(game, toHand(game, "Conflux"));
    for (const card of cards) expect(zone(game, card)).toBe("hand");
  });
});

describe("Yisan, the Wanderer Bard", () => {
  it("finds a creature with mana value equal to its verse counters, the new one included", () => {
    const { game, a } = table();
    const yisan = spawn(game, "Yisan, the Wanderer Bard");
    lands(game, "Forest", 3);
    const elves = toLibrary(game, "Llanowar Elves");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, elves);
    activate(game, yisan);
    expect(counters(game, yisan, "verse")).toBe(1);
    expect(seen.offered).toEqual([elves]);
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Titan Forge", () => {
  it("turns three charge counters into a 9/9 Golem", () => {
    const { game } = table();
    const forge = spawn(game, "Titan Forge");
    game.state.objects[forge].counters.charge = 3;
    activate(game, forge, 1);
    const golems = named(game, "9/9 Golem Token", A);
    expect(golems).toHaveLength(1);
    expect(pt(game, golems[0])).toEqual({ power: 9, toughness: 9 });
    expect(counters(game, forge, "charge")).toBe(0);
  });
});

describe("Goblin Bushwhacker", () => {
  it("kicked, gives creatures you control +1/+0 and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    cast(game, toHand(game, "Goblin Bushwhacker"), { kicked: true });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });

  it("unkicked, does nothing", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Goblin Bushwhacker"));
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Juniper Order Ranger", () => {
  it("puts a counter on the entering creature and on itself", () => {
    const { game } = table();
    const ranger = spawn(game, "Juniper Order Ranger");
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, ranger)).toBe(1);
  });
});

describe("Master Splicer", () => {
  it("makes a Golem and pumps Golems you control", () => {
    const { game } = table();
    enter(game, "Master Splicer");
    const golems = named(game, "Phyrexian Golem Token", A);
    expect(golems).toHaveLength(1);
    expect(pt(game, golems[0])).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Blighted Steppe", () => {
  it("gains 2 life for each creature you control", () => {
    const { game } = table();
    const steppe = spawn(game, "Blighted Steppe");
    lands(game, "Plains", 4);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    activate(game, steppe, 1);
    expect(life(game)).toBe(26);
    expect(zone(game, steppe)).toBe("graveyard");
  });
});
