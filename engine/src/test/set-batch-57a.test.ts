/**
 * The set walk, batch 57, part a (2026-10-11): Marvel Super Heroes Commander.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

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
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("White Widow, Yelena Belova", () => {
  it("puts a counter on each creature you control with deathtouch that deals combat damage to a player", () => {
    const { game, a } = table();
    const widow = spawn(game, "White Widow, Yelena Belova");
    const rats = spawn(game, "Typhoid Rats");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [widow, rats, bears]);
    expect(counters(game, widow)).toBe(1);
    expect(counters(game, rats)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Midnight Angel Armor", () => {
  it("makes a Soldier and attaches to it: a 4/4 with flying and vigilance", () => {
    const { game } = table();
    enter(game, "Midnight Angel Armor");
    const [soldier] = named(game, "Soldier Token", A);
    expect(soldier).toBeDefined();
    expect(pt(game, soldier)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, soldier).has("flying")).toBe(true);
    expect(keywords(game, soldier).has("vigilance")).toBe(true);
  });
});

describe("The Fantasticar", () => {
  it("may become a creature on a noncreature spell, and on the fourth noncreature spell may become four Constructs", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const car = spawn(game, "The Fantasticar");

    // Declined: it stays a noncreature artifact.
    pickModes(a);
    cast(game, toHand(game, "Sol Ring"));
    expect(types(game, car)).not.toContain("creature");

    pickModes(a, 0);
    cast(game, toHand(game, "Sol Ring"));
    expect(types(game, car)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, car)).toEqual({ power: 4, toughness: 4 });

    // A creature spell isn't counted.
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Sol Ring"));
    expect(zone(game, car)).toBe("battlefield");
    expect(tokensNamed(game, "Construct Token (The Fantasticar)", A)).toBe(0);

    cast(game, toHand(game, "Sol Ring"));
    expect(zone(game, car)).toBe("graveyard");
    expect(tokensNamed(game, "Construct Token (The Fantasticar)", A)).toBe(4);
  });
});

describe("Return of the Mole Man", () => {
  it("makes a Moloid for each permanent card in your graveyard, itself included", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const mole = spawn(game, "Return of the Mole Man");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    activate(game, mole);
    expect(zone(game, mole)).toBe("graveyard");
    expect(tokensNamed(game, "Moloid", A)).toBe(3);
  });

  it("may mill two when a land enters under your control", () => {
    const { game, a } = table();
    spawn(game, "Return of the Mole Man");
    pickModes(a, 0);
    enter(game, "Forest");
    expect(graveyard(game).length).toBe(2);
  });
});

describe("Black Panther, Most Dangerous", () => {
  it("deals the damage he's dealt to any other target", () => {
    const { game, a } = table();
    const panther = spawn(game, "Black Panther, Most Dangerous");
    const shooter = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [B]);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(panther)], { source: shooter });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([A, B, shooter]));
    expect(seen.offered[0]).not.toContain(panther);
    expect(life(game, B)).toBe(18);
  });

  it("power-up: two counters on him, and other creatures you control get +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 7);
    const panther = spawn(game, "Black Panther, Most Dangerous");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, panther);
    expect(counters(game, panther)).toBe(2);
    expect(pt(game, panther)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Captain America, Unbowed", () => {
  it("gives your Soldiers and Heroes indestructible, and nothing else", () => {
    const { game } = table();
    const soldier = spawn(game, "Soldier Token");
    const hero = spawn(game, "Black Panther, Most Dangerous");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Soldier Token", B);
    const cap = enter(game, "Captain America, Unbowed");
    for (const id of [cap, soldier, hero]) expect(keywords(game, id).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
  });
});

describe("Helmut Zemo, Mastermind", () => {
  it("casts an instant or sorcery up to his power from your graveyard, exiles it, and grows", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const zemo = spawn(game, "Helmut Zemo, Mastermind");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const shock = toGraveyard(game, "Shock");
    const big = toGraveyard(game, "Divination");
    const seen = watchTargets(a, () => [bolt]);
    a.chooseCastNowFn = (_v, offer) =>
      offer.casts.length === 0
        ? null
        : { type: "cast-spell", player: A, card: bolt, targets: [{ kind: "player", player: B }], via: "effect" };
    attack(game, a, [zemo]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bolt, shock]));
    expect(seen.offered[0]).not.toContain(big);
    expect(zone(game, bolt)).toBe("exile");
    expect(counters(game, zemo)).toBe(1);
    // Bolt's 3, then Zemo's 3 combat damage.
    expect(life(game, B)).toBe(20 - 3 - 3);
  });

  it("gets no counter when nothing is cast", () => {
    const { game, a } = table();
    const zemo = spawn(game, "Helmut Zemo, Mastermind");
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    attack(game, a, [zemo]);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, zemo)).toBe(0);
  });
});

describe("Asgardian Inspiration", () => {
  it("returns from the graveyard for {2} when a source you control deals noncombat damage to an opponent", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const inspiration = toGraveyard(game, "Asgardian Inspiration");
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(zone(game, inspiration)).toBe("hand");
    expect(life(game, B)).toBe(17);
  });

  it("stays put for combat damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const inspiration = toGraveyard(game, "Asgardian Inspiration");
    pickModes(a, 0);
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    expect(zone(game, inspiration)).toBe("graveyard");
  });

  it("exiles the top card, playable this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const top = toLibrary(game, "Hill Giant");
    cast(game, toHand(game, "Asgardian Inspiration"));
    expect(zone(game, top)).toBe("exile");
  });
});

describe("Namor, Scourge of the Seas", () => {
  it("connives a creature at combat, and other Merfolk with a +1/+1 counter fly", () => {
    const { game, a } = table();
    const namor = spawn(game, "Namor, Scourge of the Seas");
    const merfolk = spawn(game, "Merfolk Token");
    const plain = spawn(game, "Merfolk Token");
    const bears = toHand(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    a.chooseDiscardsFn = () => [bears];
    expect(keywords(game, merfolk).has("flying")).toBe(false);
    pickTargets(a, merfolk);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, merfolk)).toBe(1);
    expect(keywords(game, merfolk).has("flying")).toBe(true);
    expect(keywords(game, plain).has("flying")).toBe(false);
    expect(keywords(game, namor).has("flying")).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(handBefore);
  });
});

describe("Grim Reaper's Scythe and Undead Hand Ninja", () => {
  it("reanimates with a finality counter, which makes a Zombie and drains each opponent", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const scythe = spawn(game, "Grim Reaper's Scythe");
    spawn(game, "Undead Hand Ninja");
    const fodder: ObjectId[] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    a.chooseSacrificesFn = () => fodder;
    a.choosePermanentsFn = () => fodder;
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, scythe, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant, "finality")).toBe(1);
    for (const id of fodder) expect(zone(game, id)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("W'Kabi, Shield of the Nation", () => {
  it("makes a Rhino when you attack with your commander while you control an artifact with mana value 4 or more", () => {
    const { game, a } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    spawn(game, "W'Kabi, Shield of the Nation");
    spawn(game, "Gilded Lotus");
    attack(game, a, [commander]);
    expect(tokensNamed(game, "Rhino Token", A)).toBe(1);
  });

  it("makes nothing without the artifact, or without your commander attacking", () => {
    const { game, a } = table();
    const commander = spawn(game, "Hill Giant");
    game.state.objects[commander].isCommander = true;
    const wkabi = spawn(game, "W'Kabi, Shield of the Nation");
    spawn(game, "Sol Ring");
    attack(game, a, [commander]);
    expect(tokensNamed(game, "Rhino Token", A)).toBe(0);

    const { game: g2, a: a2 } = table();
    spawn(g2, "Gilded Lotus");
    attack(g2, a2, [spawn(g2, "W'Kabi, Shield of the Nation")]);
    expect(tokensNamed(g2, "Rhino Token", A)).toBe(0);
    expect(zone(game, wkabi)).toBe("battlefield");
  });
});
