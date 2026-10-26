/**
 * Mirrodin Besieged and Scars of Mirrodin (B199) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Phyrexian Hydra", () => {
  it("prevents damage dealt to it and takes that many -1/-1 counters instead", () => {
    const { game } = table();
    const hydra = spawn(game, "Phyrexian Hydra");
    lands(game, "Mountain", 1, B);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(hydra)]);
    settle(game);
    expect(game.state.objects[hydra].damageMarked).toBe(0);
    expect(counters(game, hydra, "-1/-1")).toBe(3);
    expect(pt(game, hydra)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Sphere of the Suns", () => {
  it("enters tapped with three charge counters", () => {
    const { game } = table();
    const sphere = enter(game, "Sphere of the Suns");
    expect(game.state.objects[sphere].tapped).toBe(true);
    expect(counters(game, sphere, "charge")).toBe(3);
  });
});

describe("Mortarpod", () => {
  it("the Germ is a 0/1 that can sacrifice itself to deal 1 damage", () => {
    const { game } = table();
    enter(game, "Mortarpod");
    const [germ] = named(game, "Phyrexian Germ Token");
    expect(pt(game, germ)).toEqual({ power: 0, toughness: 1 });
    activate(game, germ, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Phyrexian Germ Token")).toBe(0);
  });
});

describe("Steel Sabotage", () => {
  it("returns an artifact to its owner's hand", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Steel Sabotage"), { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Frantic Salvage", () => {
  it("puts the targeted artifact cards on top of the library, then draws one of them", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const ring = toGraveyard(game, "Sol Ring");
    const bears = toGraveyard(game, "Grizzly Bears");
    const before = hand(game).length;
    const salvage = toHand(game, "Frantic Salvage");
    cast(game, salvage, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Vedalken Anatomist", () => {
  it("puts a -1/-1 counter on the creature and may untap it", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const anatomist = spawn(game, "Vedalken Anatomist");
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    pickModes(a, 1);
    activate(game, anatomist, 0, { targets: [ref(giant)] });
    expect(counters(game, giant, "-1/-1")).toBe(1);
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});

describe("Quicksilver Geyser", () => {
  it("returns up to two nonland permanents", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Quicksilver Geyser"), { targets: [ref(bears), ref(ring)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
  });
});

describe("Myr Propagator", () => {
  it("makes a token copy of itself", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const myr = spawn(game, "Myr Propagator");
    activate(game, myr);
    expect(tokensNamed(game, "Myr Propagator")).toBe(1);
  });
});

describe("Liege of the Tangle", () => {
  it("awakens the chosen lands into 8/8 green Elementals while they have the counter", () => {
    const { game, a } = table();
    const liege = spawn(game, "Liege of the Tangle");
    const [forest, other] = lands(game, "Forest", 2);
    pickTargets(a, forest);
    attack(game, a, [liege]);
    expect(life(game, B)).toBe(12);
    expect(counters(game, forest, "awakening")).toBe(1);
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 8, toughness: 8 });
    expect(types(game, other)).not.toContain("creature");
    game.debugApplyEffect(A, { kind: "remove-counter", target: 0, counter: "awakening", amount: 1 }, [ref(forest)]);
    settle(game);
    expect(types(game, forest)).not.toContain("creature");
  });
});

describe("Kuldotha Rebirth", () => {
  it("sacrifices an artifact to make three Goblins", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const ring = spawn(game, "Sol Ring");
    cast(game, toHand(game, "Kuldotha Rebirth"), { sacrifice: ring });
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Goblin Token")).toBe(3);
  });
});

describe("Golem Artisan", () => {
  it("gives an artifact creature the chosen keyword as the ability resolves", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const golem = spawn(game, "Golem Artisan");
    pickModes(a, 1);
    activate(game, golem, 1, { targets: [ref(golem)] });
    expect(keywords(game, golem).has("trample")).toBe(true);
    expect(keywords(game, golem).has("flying")).toBe(false);
  });
});

describe("Relic Putrescence", () => {
  it("gives the enchanted artifact's controller a poison counter when it becomes tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Relic Putrescence"), { targets: [ref(ring)] });
    expect(game.state.objects[named(game, "Relic Putrescence")[0]].attachedTo).toBe(ring);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(ring)]);
    settle(game);
    expect(game.state.players[B].counters.poison ?? 0).toBe(1);
    expect(game.state.players[A].counters.poison ?? 0).toBe(0);
  });
});

describe("Panic Spellbomb", () => {
  it("paying {R} as it goes to the graveyard draws a card", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const bomb = spawn(game, "Panic Spellbomb");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    pickModes(a, 0);
    activate(game, bomb, 0, { targets: [ref(bears)] });
    expect(graveyard(game)).toContain(bomb);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Kuldotha Phoenix", () => {
  it("returns from the graveyard only during your upkeep with metalcraft", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const phoenix = toGraveyard(game, "Kuldotha Phoenix");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    expect(() => activate(game, phoenix)).toThrow();
    toStep(game, "upkeep");
    expect(() => activate(game, phoenix)).toThrow();
    spawn(game, "Sol Ring");
    activate(game, phoenix);
    expect(zone(game, phoenix)).toBe("battlefield");
  });
});

describe("Vault Skyward", () => {
  it("gives flying and untaps", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Vault Skyward"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});
