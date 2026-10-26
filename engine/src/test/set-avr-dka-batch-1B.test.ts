/**
 * Avacyn Restored and Dark Ascension (B185), group B. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
  destroy,
} from "./harness.js";

describe("Black Cat", () => {
  it("makes the targeted opponent discard a card when it dies", () => {
    const { game, a } = table();
    const cat = spawn(game, "Black Cat");
    const before = hand(game, B).length;
    pickTargets(a, B);
    destroy(game, cat);
    expect(hand(game, B)).toHaveLength(before - 1);
  });
});

describe("Gather the Townsfolk", () => {
  it("makes two Humans, or five at 5 or less life", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Gather the Townsfolk"));
    expect(tokensNamed(game, "Human Token", A)).toBe(2);
    game.state.players[A].life = 5;
    cast(game, toHand(game, "Gather the Townsfolk"));
    expect(tokensNamed(game, "Human Token", A)).toBe(7);
  });
});

describe("Increasing Ambition", () => {
  it("finds one card from the hand and two by flashback", () => {
    const { game, a } = table();
    const first = toLibrary(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    pickFromZone(a, first);
    cast(game, toHand(game, "Increasing Ambition"));
    expect(zone(game, first)).toBe("hand");

    const x = toLibrary(game, "Grizzly Bears");
    const y = toLibrary(game, "Llanowar Elves");
    const again = toGraveyard(game, "Increasing Ambition");
    lands(game, "Swamp", 8);
    const seen = pickFromZone(a, x, y);
    cast(game, again, { via: "flashback" });
    expect(seen.offered.length).toBeGreaterThan(2);
    expect(zone(game, x)).toBe("hand");
    expect(zone(game, y)).toBe("hand");
    expect(zone(game, again)).toBe("exile");
  });
});

describe("Clinging Mists", () => {
  it("at 5 or less life, also keeps the attackers tapped through their next untap step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    game.state.players[A].life = 5;
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Clinging Mists"));
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(20);
    a.declareAttackersFn = () => [];
    toStep(game, "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(true);
    toStep(game, "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("above 5 life, only prevents the combat damage", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Clinging Mists"));
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(20);
    a.declareAttackersFn = () => [];
    toStep(game, "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Gallows at Willow Hill", () => {
  it("taps three Humans to destroy a creature, whose controller gets a Spirit", () => {
    const { game } = table();
    const gallows = spawn(game, "Gallows at Willow Hill");
    const humans = [spawn(game, "Human Token"), spawn(game, "Human Token"), spawn(game, "Human Token")];
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    activate(game, gallows, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Spirit Token", B)).toBe(1);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    expect(humans.every((h) => game.state.objects[h].tapped)).toBe(true);
  });
});

describe("Gloom Surgeon", () => {
  it("prevents combat damage to itself and exiles that many cards from the top of the library", () => {
    const { game, a, b } = table();
    const surgeon = spawn(game, "Gloom Surgeon");
    const ogre = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: ogre, attacker: surgeon }];
    const library = game.state.zones.perPlayer[A].library.length;
    attack(game, a, [surgeon]);
    expect(zone(game, surgeon)).toBe("battlefield");
    expect(game.state.objects[surgeon].damageMarked).toBe(0);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 3);
  });

  it("doesn't touch noncombat damage", () => {
    const { game } = table();
    const surgeon = spawn(game, "Gloom Surgeon");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(surgeon)] });
    expect(zone(game, surgeon)).toBe("graveyard");
  });
});

describe("Grave Exchange", () => {
  it("returns a creature card and makes the target player sacrifice a creature", () => {
    const { game } = table();
    const card = toGraveyard(game, "Grizzly Bears");
    const theirs = spawn(game, "Llanowar Elves", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Grave Exchange"), { targets: [ref(B), ref(card)] });
    expect(zone(game, card)).toBe("hand");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Holy Justiciar", () => {
  it("taps a creature, and exiles it if it's a Zombie", () => {
    const { game } = table();
    const justiciar = spawn(game, "Holy Justiciar");
    const bears = spawn(game, "Grizzly Bears", B);
    const zombie = spawn(game, "Black Cat", B);
    lands(game, "Plains", 6);
    activate(game, justiciar, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    game.state.objects[justiciar].tapped = false;
    activate(game, justiciar, 0, { targets: [ref(zombie)] });
    expect(zone(game, zombie)).toBe("exile");
  });
});

describe("Homicidal Seclusion", () => {
  it("pumps your only creature, and stops once there are two", () => {
    const { game } = table();
    spawn(game, "Homicidal Seclusion");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    spawn(game, "Llanowar Elves");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Lightning Prowess", () => {
  it("gives haste and a pinging ability", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Prowess"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("haste")).toBe(true);
    activate(game, bears, 0, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(19);
  });
});

describe("Niblis of the Breath", () => {
  it("may untap a creature", () => {
    const { game, a } = table();
    const niblis = spawn(game, "Niblis of the Breath");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Island", 1);
    pickModes(a, 1);
    activate(game, niblis, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Outwit", () => {
  it("counters a spell that targets a player, and can't target one that doesn't", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    const bolt = toHand(game, "Shock");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Outwit"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(20);

    const bears = spawn(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(bears)], settle: false });
    lands(game, "Island", 1);
    expect(() => cast(game, toHand(game, "Outwit"), { targets: [ref(shock)] })).toThrow();
    settle(game);
  });
});

describe("Riot Ringleader", () => {
  it("gives Human creatures you control +1/+0 when it attacks", () => {
    const { game, a } = table();
    const ringleader = spawn(game, "Riot Ringleader");
    const human = spawn(game, "Human Token");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [ringleader]);
    expect(pt(game, ringleader).power).toBe(3);
    expect(pt(game, human).power).toBe(2);
    expect(pt(game, bears).power).toBe(2);
  });
});

describe("Spectral Prison", () => {
  it("is sacrificed when a spell targets the creature, but not an ability", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const prison = toHand(game, "Spectral Prison");
    cast(game, prison, { targets: [ref(bears)] });
    expect(zone(game, prison)).toBe("battlefield");
    const niblis = spawn(game, "Niblis of the Breath");
    lands(game, "Island", 1);
    activate(game, niblis, 0, { targets: [ref(bears)] });
    expect(zone(game, prison)).toBe("battlefield");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(zone(game, prison)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(prison);
  });
});

