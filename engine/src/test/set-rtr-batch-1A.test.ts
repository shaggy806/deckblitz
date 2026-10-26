/**
 * Return to Ravnica (RTR; B179), group A. One test per card whose behaviour is
 * more than a stat line or an already-tested pattern, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Azor's Elocutors", () => {
  it("adds a filibuster counter each upkeep and wins on the fifth", () => {
    const { game } = table();
    const elocutors = spawn(game, "Azor's Elocutors");
    game.state.objects[elocutors].counters.filibuster = 3;
    toStep(game, "draw");
    settle(game);
    expect(counters(game, elocutors, "filibuster")).toBe(4);
    expect(game.state.result.over).toBe(false);
    toStep(game, "draw");
    settle(game);
    expect(game.state.result.winner).toBe(A);
  });

  it("loses one counter per source that deals damage to you", () => {
    const { game, b } = table();
    const elocutors = spawn(game, "Azor's Elocutors");
    game.state.objects[elocutors].counters.filibuster = 4;
    const attackers = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    attack(game, b, attackers, A);
    settle(game);
    expect(counters(game, elocutors, "filibuster")).toBe(2);
  });
});

describe("Grove of the Guardian", () => {
  it("taps two creatures and sacrifices itself for an 8/8 vigilant Elemental", () => {
    const { game } = table();
    const grove = spawn(game, "Grove of the Guardian");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Forest", 4);
    lands(game, "Plains", 1);
    activate(game, grove, 1);
    expect(zone(game, grove)).toBe("graveyard");
    for (const bear of bears) expect(game.state.objects[bear].tapped).toBe(true);
    const [token] = named(game, "Elemental Token 8/8 (Vigilance)", A);
    expect(token).toBeDefined();
    expect(pt(game, token)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, token).has("vigilance")).toBe(true);
  });
});

describe("Lotleth Troll", () => {
  it("discards a creature card for a +1/+1 counter, with no mana", () => {
    const { game } = table();
    const troll = spawn(game, "Lotleth Troll");
    const bears = toHand(game, "Grizzly Bears");
    activate(game, troll, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, troll)).toBe(1);
  });
});

describe("Street Spasm", () => {
  it("overloaded, deals X to each creature without flying you don't control", () => {
    const { game } = table();
    const theirBears = spawn(game, "Grizzly Bears", B);
    const theirFlyer = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Street Spasm"), { x: 2, overload: true });
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(zone(game, theirFlyer)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Destroy the Evidence", () => {
  it("mills the destroyed land's controller down to their next land", () => {
    const { game } = table();
    const land = spawn(game, "Forest", B);
    const top = [toLibrary(game, "Grizzly Bears", B), toLibrary(game, "Hill Giant", B)];
    lands(game, "Swamp", 5);
    const before = graveyard(game, B).length;
    const mineBefore = graveyard(game, A).length;
    cast(game, toHand(game, "Destroy the Evidence"), { targets: [ref(land)] });
    expect(zone(game, land)).toBe("graveyard");
    for (const card of top) expect(zone(game, card)).toBe("graveyard");
    // The land, the two creatures and the Wastes that stopped it.
    expect(graveyard(game, B).length - before).toBe(4);
    // Only the spell itself in its caster's graveyard.
    expect(graveyard(game, A).length - mineBefore).toBe(1);
  });
});

describe("Blistercoil Weird", () => {
  it("gets +1/+1 and untaps when you cast an instant", () => {
    const { game } = table();
    const weird = spawn(game, "Blistercoil Weird", A, { tapped: true });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.objects[weird].tapped).toBe(false);
    expect(pt(game, weird)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Crosstown Courier", () => {
  it("mills the damaged player as many cards as the damage", () => {
    const { game, a } = table();
    const courier = spawn(game, "Crosstown Courier");
    const before = graveyard(game, B).length;
    attack(game, a, [courier]);
    settle(game);
    expect(graveyard(game, B).length - before).toBe(2);
  });
});

describe("Rites of Reaping", () => {
  it("pumps one creature and shrinks another, never the same one twice", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 3);
    lands(game, "Swamp", 3);
    const rites = toHand(game, "Rites of Reaping");
    expect(() => cast(game, rites, { targets: [ref(bears), ref(bears)] })).toThrow();
    cast(game, rites, { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).includes(rites)).toBe(false);
  });
});
