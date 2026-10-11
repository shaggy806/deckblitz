/**
 * The set walk, batch 55, part a (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("Vibranium Strike Gauntlets", () => {
  it("attaches as it enters; the creature gets +3/+0, trample, and draws on combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears");
    const gauntlets = toHand(game, "Vibranium Strike Gauntlets");
    pickTargets(a, bears);
    cast(game, gauntlets);
    expect(game.state.objects[gauntlets].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    const cards = hand(game).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(15);
    expect(hand(game).length).toBe(cards + 1);
  });
});

describe("War Machine, Avenging Arsenal", () => {
  it("gives double strike to attacking modified creatures you control, and not to unmodified ones", () => {
    const { game, a } = table();
    const warMachine = spawn(game, "War Machine, Avenging Arsenal");
    const modified = spawn(game, "Grizzly Bears");
    game.state.objects[modified].counters["+1/+1"] = 1;
    const plain = spawn(game, "Hill Giant");
    const home = spawn(game, "Grizzly Bears");
    game.state.objects[home].counters["+1/+1"] = 1;
    attack(game, a, [warMachine, modified, plain]);
    expect(keywords(game, modified).has("double-strike")).toBe(true);
    expect(keywords(game, plain).has("double-strike")).toBe(false);
    expect(keywords(game, warMachine).has("double-strike")).toBe(false);
    // Not attacking: no double strike, modified or not.
    expect(keywords(game, home).has("double-strike")).toBe(false);
    // 3 + 3×2 (the modified Bears twice) + 3.
    expect(life(game, B)).toBe(20 - 3 - 6 - 3);
  });
});

describe("Crystal, Inhuman Princess", () => {
  it("deals each opponent damage equal to a noncreature spell's colours, none for a colourless one", () => {
    const { game } = table();
    spawn(game, "Crystal, Inhuman Princess");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(A)] });
    // Two colours: 2 damage to bob; Helix's 3 went to alice (and gained 3).
    expect(life(game, B)).toBe(18);
    cast(game, toHand(game, "Sol Ring"));
    expect(life(game, B)).toBe(18);
  });
});

describe("The Vision and Scarlet Witch", () => {
  it("adds {R} and gets a +1/+1 counter whenever you cast a spell", () => {
    const { game } = table();
    const vision = spawn(game, "The Vision and Scarlet Witch");
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    expect(counters(game, vision)).toBe(1);
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(1);
    expect(pool[0].type).toBe("R");
  });
});

describe("Nico Minoru, Runaway", () => {
  it("exiles to a nonland card, casts it free, and the cast from exile deals 2 to each opponent", () => {
    const { game, a } = table();
    const nico = spawn(game, "Nico Minoru, Runaway");
    lands(game, "Mountain", 3);
    toHand(game, "Wastes");
    const cards = hand(game).length;
    const bears = toLibrary(game, "Grizzly Bears");
    const top = toLibrary(game, "Wastes");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bears);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: bears, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, nico, 0);
    // A card was discarded to pay for it.
    expect(hand(game).length).toBe(cards - 1);
    expect(graveyard(game)).toHaveLength(1);
    expect(zone(game, bears)).toBe("battlefield");
    // The land exiled on the way stays exiled.
    expect(zone(game, top)).toBe("exile");
    expect(life(game, B)).toBe(18);
  });

  it("leaves the card in exile when you decline to cast it", () => {
    const { game } = table();
    const nico = spawn(game, "Nico Minoru, Runaway");
    lands(game, "Mountain", 3);
    toHand(game, "Wastes");
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, nico, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });
});

describe("Tri-Sentinel, Act of Vengeance", () => {
  it("deals 3 damage to up to one creature of each opponent", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Hill Giant", B);
    const bobsOther = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    const mine = spawn(game, "Hill Giant");
    const seen = watchTargets(a, (offered) => offered.map((slot) => (slot.includes(bobs) ? bobs : (slot[0] ?? null))));
    enter(game, "Tri-Sentinel, Act of Vengeance");
    expect(seen.offered[0]).not.toContain(carols);
    expect(seen.offered[0]).not.toContain(mine);
    expect(seen.offered[1]).toContain(carols);
    expect(seen.offered[1]).not.toContain(bobs);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("graveyard");
    expect(zone(game, bobsOther)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Ultron the Annihilator", () => {
  it("makes a Robot Villain as it enters", () => {
    const { game } = table();
    enter(game, "Ultron the Annihilator");
    expect(tokensNamed(game, "Robot Villain Token", A)).toBe(1);
  });

  it("drains each opponent for an artifact you own reaching your graveyard, from the battlefield or elsewhere", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Ultron the Annihilator");
    const ring = spawn(game, "Sol Ring");
    destroy(game, ring);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    // An opponent's artifact goes to their graveyard, not yours.
    destroy(game, spawn(game, "Sol Ring", B));
    expect(life(game, B)).toBe(19);
    // A milled artifact card.
    toLibrary(game, "Sol Ring");
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(18);
    // A milled nonartifact card doesn't.
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Vibranium Mining Mech", () => {
  it("makes a tapped Vibranium whose mana can't be spent on a nonartifact spell", () => {
    const { game } = table();
    enter(game, "Vibranium Mining Mech");
    const [vibranium] = game.battlefield.filter((id: ObjectId) => game.state.objects[id].cardName === "Vibranium Token");
    expect(vibranium).toBeDefined();
    expect(game.state.objects[vibranium].tapped).toBe(true);
    expect(keywords(game, vibranium).has("indestructible")).toBe(true);
    toStep(game, "precombat-main");
    expect(game.state.objects[vibranium].tapped).toBe(false);
    const [island] = lands(game, "Island", 1);
    expect(() => cast(game, toHand(game, "Think Twice"))).toThrow();
    game.state.objects[island].tapped = true;
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Photon, Mighty Marvel", () => {
  it("adds that much mana of one chosen colour, kept through the rest of the turn", () => {
    const { game, a } = table();
    const photon = spawn(game, "Photon, Mighty Marvel");
    pickModes(a, 4);
    attack(game, a, [photon]);
    expect(life(game, B)).toBe(18);
    const pool = game.state.players[A].manaPool;
    expect(pool.map((u) => u.type)).toEqual(["G", "G"]);
  });
});

describe("Age of Ultron", () => {
  it("destroys an opponent's nonartifact creature, makes a Robot per opponent, then pumps artifact creatures", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const thopter = spawn(game, "Ornithopter", B);
    const seen = watchTargets(a, (offered) => offered.map((slot) => slot[0] ?? null));
    const saga = enter(game, "Age of Ultron");
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(thopter);
    expect(zone(game, giant)).toBe("graveyard");

    toStep(game, "precombat-main");
    settle(game);
    const robots = game.battlefield.filter((id: ObjectId) => game.state.objects[id].cardName === "Robot Villain Token");
    expect(robots).toHaveLength(1);

    toStep(game, "precombat-main");
    settle(game);
    expect(keywords(game, robots[0]).has("deathtouch")).toBe(true);
    expect(counters(game, robots[0])).toBe(1);
    // Not yours: untouched.
    expect(keywords(game, thopter).has("deathtouch")).toBe(false);
    expect(counters(game, thopter)).toBe(0);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Franklin Richards, Ascendant", () => {
  it("discovers 6 at the beginning of combat only if you've cast a noncreature spell this turn", () => {
    const { game, a } = table();
    spawn(game, "Franklin Richards, Ascendant");
    lands(game, "Wastes", 1);
    const giant = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Wastes");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === giant);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: giant, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    cast(game, toHand(game, "Sol Ring"));
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    // The land went to the bottom.
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(top);
  });

  it("does nothing on a turn with only a creature spell cast", () => {
    const { game } = table();
    spawn(game, "Franklin Richards, Ascendant");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const giant = toLibrary(game, "Hill Giant");
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, giant)).toBe("library");
    expect(game.state.zones.shared.exile).toHaveLength(0);
  });
});

describe("Matt Murdock, Justice Seeker", () => {
  it("pays {1} at the beginning of combat to put a +1/+1 counter on a creature you control, which then has ward {1}", () => {
    const { game, a } = table();
    spawn(game, "Matt Murdock, Justice Seeker");
    const bears = spawn(game, "Grizzly Bears");
    const [plains] = lands(game, "Plains", 1);
    pickModes(a, 0);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(game.state.objects[plains].tapped).toBe(true);
    const ward = game.registry
      .get("Matt Murdock, Justice Seeker")
      .static[0].grantsTriggered?.[0].trigger;
    expect(ward).toMatchObject({ on: "becomes-target", byOpponentOnly: true });
  });

  it("does nothing when you don't pay", () => {
    const { game, a } = table();
    spawn(game, "Matt Murdock, Justice Seeker");
    const bears = spawn(game, "Grizzly Bears");
    const [plains] = lands(game, "Plains", 1);
    pickModes(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(0);
    expect(game.state.objects[plains].tapped).toBe(false);
  });
});

describe("Hawkeye, Trick Shot", () => {
  it("has the entering Hero deal damage equal to your Heroes — its own lifelink applies", () => {
    const { game, a } = table();
    spawn(game, "Hawkeye, Trick Shot");
    pickTargets(a, B);
    enter(game, "Brave Brawler");
    // Two Heroes: Hawkeye and the Brawler, which dealt it (lifelink).
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    expect(graveyard(game, B)).toHaveLength(0);
  });

  it("fires on Hawkeye's own entry", () => {
    const { game, a } = table();
    spawn(game, "Brave Brawler");
    pickTargets(a, B);
    enter(game, "Hawkeye, Trick Shot");
    expect(life(game, B)).toBe(18);
    // Hawkeye dealt it, not the Brawler: no life gained.
    expect(life(game, A)).toBe(20);
  });
});
