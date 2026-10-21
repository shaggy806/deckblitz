/**
 * Guilds of Ravnica (GRN; B125), group D. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Guild Summit", () => {
  it("draws one for each Gate tapped as it enters, then one for each Gate entering", () => {
    const { game, a } = table();
    const gates = [spawn(game, "Azorius Guildgate", A, { tapped: false }), spawn(game, "Azorius Guildgate", A, { tapped: false })];
    // A Guildgate enters tapped; untap them for the test.
    for (const g of gates) game.state.objects[g].tapped = false;
    pickPermanents(a, ...gates);
    const before = hand(game).length;
    enter(game, "Guild Summit");
    expect(gates.every((g) => game.state.objects[g].tapped)).toBe(true);
    expect(hand(game).length).toBe(before + 2);
    enter(game, "Azorius Guildgate");
    expect(hand(game).length).toBe(before + 3);
  });
});

describe("Lazav, the Multifarious", () => {
  it("becomes a copy of a creature card with mana value X, still legendary", () => {
    const { game } = table();
    const lazav = spawn(game, "Lazav, the Multifarious");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, lazav, 0, { x: 2, targets: [ref(bears)] });
    expect(pt(game, lazav)).toEqual({ power: 2, toughness: 2 });
    expect(supertypes(game, lazav)).toContain("legendary");
  });
});

describe("Gravitic Punch", () => {
  it("has the creature deal damage equal to its power to the player", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Gravitic Punch"), { targets: [ref(bears), ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Hatchery Spider", () => {
  it("as it's cast, reveals X and offers only a green permanent card with mana value X or less", () => {
    const { game, a } = table();
    for (let i = 0; i < 2; i++) toGraveyard(game, "Grizzly Bears");
    const serra = toLibrary(game, "Serra Angel");
    const elves = toLibrary(game, "Llanowar Elves");
    lands(game, "Forest", 7);
    const seen = pickFromZone(a, elves);
    cast(game, toHand(game, "Hatchery Spider"));
    expect(seen.offered).toContain(elves);
    expect(seen.offered).not.toContain(serra);
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Blood Operative", () => {
  it("returns from the graveyard for 3 life whenever you surveil", () => {
    const { game, a } = table();
    const operative = toGraveyard(game, "Blood Operative");
    pickModes(a, 0);
    enter(game, "Barrier of Bones");
    expect(zone(game, operative)).toBe("hand");
    expect(life(game)).toBe(17);
  });
});

describe("Arclight Phoenix", () => {
  it("returns at the beginning of combat after three instants and sorceries", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, "Arclight Phoenix");
    lands(game, "Island", 3);
    for (let i = 0; i < 3; i++) cast(game, toHand(game, "Opt"));
    toStep(game, "postcombat-main");
    expect(zone(game, phoenix)).toBe("battlefield");
  });

  it("stays put after only two", () => {
    const { game } = table();
    const phoenix = toGraveyard(game, "Arclight Phoenix");
    lands(game, "Island", 2);
    for (let i = 0; i < 2; i++) cast(game, toHand(game, "Opt"));
    toStep(game, "postcombat-main");
    expect(zone(game, phoenix)).toBe("graveyard");
  });
});

describe("Take Heart", () => {
  it("gains 1 life for each attacking creature you control", () => {
    const { game, a } = table();
    const attackers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const target = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Take Heart"), { targets: [ref(target)] });
    expect(life(game)).toBe(22);
    expect(pt(game, target)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Creeping Chill (and Wand of Vertebrae)", () => {
  it("milled, may be exiled to drain each opponent for 3", () => {
    const { game, a } = table();
    const chill = toLibrary(game, "Creeping Chill");
    const wand = spawn(game, "Wand of Vertebrae");
    pickModes(a, 0);
    activate(game, wand, 0);
    expect(zone(game, chill)).toBe("exile");
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(23);
  });
});

describe("Sonic Assault", () => {
  it("taps the creature and deals 2 to its controller", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Volcanic Island", 3);
    cast(game, toHand(game, "Sonic Assault"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, B)).toBe(18);
  });
});

describe("Goblin Locksmith", () => {
  it("stops creatures with defender from blocking", () => {
    const { game, a } = table();
    const locksmith = spawn(game, "Goblin Locksmith");
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [locksmith]);
    const canBlock = (id: string) => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(wall)).not.toContain(locksmith);
    expect(canBlock(bears)).toContain(locksmith);
  });
});

describe("Rampaging Monument", () => {
  it("enters with three counters and grows on a multicolored spell", () => {
    const { game } = table();
    const monument = enter(game, "Rampaging Monument");
    expect(counters(game, monument)).toBe(3);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Volcanic Island", 3);
    cast(game, toHand(game, "Sonic Assault"), { targets: [ref(bears)] });
    expect(counters(game, monument)).toBe(4);
  });
});

describe("Kraul Swarm", () => {
  it("returns from the graveyard by discarding a creature card", () => {
    const { game, a } = table();
    const swarm = toGraveyard(game, "Kraul Swarm");
    const bears = toHand(game, "Grizzly Bears");
    lands(game, "Swamp", 3);
    a.chooseDiscardsFn = () => [bears];
    activate(game, swarm, 0);
    expect(zone(game, swarm)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Charnel Troll", () => {
  it("exiles a creature card at upkeep for a counter", () => {
    const { game, a } = table();
    const troll = spawn(game, "Charnel Troll");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickFromZone(a, bears);
    toStep(game, "draw");
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, troll)).toBe(1);
  });

  it("is sacrificed with no creature card to exile", () => {
    const { game } = table();
    const troll = spawn(game, "Charnel Troll");
    toGraveyard(game, "Lightning Bolt");
    toStep(game, "draw");
    expect(zone(game, troll)).toBe("graveyard");
    expect(graveyard(game)).toContain(troll);
  });
});

describe("Ral's Staticaster", () => {
  it("gets +1/+0 for each card in hand while you control a Ral planeswalker", () => {
    const { game, a } = table();
    const caster = spawn(game, "Ral's Staticaster");
    const ral = spawn(game, "Ral, Storm Conduit");
    game.state.objects[ral].counters.loyalty = 4;
    const held = hand(game).length;
    attack(game, a, [caster]);
    expect(pt(game, caster).power).toBe(3 + held);
  });

  it("gets nothing without one", () => {
    const { game, a } = table();
    const caster = spawn(game, "Ral's Staticaster");
    attack(game, a, [caster]);
    expect(pt(game, caster).power).toBe(3);
  });
});

