/**
 * Urza's Destiny, Starter 1999 and Mercadian Masques, group B (batch 227).
 * One focused test per card whose behaviour is more than a stat line or a
 * copy of an already-tested shape, on its riskiest clause.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Disappear", () => {
  it("returns the enchanted creature and itself to their owners' hands", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const aura = toHand(game, "Disappear");
    cast(game, aura, { targets: [ref(bears)] });
    expect(game.state.objects[aura].attachedTo).toBe(bears);
    activate(game, aura, 0);
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
    expect(hand(game, A)).toContain(aura);
  });
});

describe("Metathran Elite", () => {
  it("can't be blocked only while it's enchanted", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const elite = spawn(game, "Metathran Elite");
    expect(keywords(game, elite).has("unblockable")).toBe(false);
    const aura = toHand(game, "Disappear");
    cast(game, aura, { targets: [ref(elite)] });
    expect(keywords(game, elite).has("unblockable")).toBe(true);
  });
});

describe("Ivy Seer", () => {
  it("gives +X/+X for each green card revealed", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const seer = spawn(game, "Ivy Seer");
    const bears = spawn(game, "Grizzly Bears");
    const g1 = toHand(game, "Grizzly Bears");
    const g2 = toHand(game, "Llanowar Elves");
    toHand(game, "Island");
    const seen = pickFromZone(a, g1, g2);
    activate(game, seer, 0, { targets: [ref(bears)] });
    expect(seen.offered).toHaveLength(2);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Battle Squadron", () => {
  it("is as big as the number of creatures you control", () => {
    const { game } = table();
    const squadron = spawn(game, "Battle Squadron");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, squadron)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Credit Voucher", () => {
  it("shuffles the chosen cards away and draws that many", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const voucher = spawn(game, "Credit Voucher");
    const x = toHand(game, "Grizzly Bears");
    const y = toHand(game, "Hill Giant");
    const before = hand(game, A).length;
    pickFromZone(a, x, y);
    activate(game, voucher, 0);
    expect(zone(game, voucher)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before);
    expect(hand(game, A)).not.toContain(x);
    expect(hand(game, A)).not.toContain(y);
  });
});

describe("Silverglade Pathfinder", () => {
  it("discards a card to fetch a basic land tapped", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const pathfinder = spawn(game, "Silverglade Pathfinder");
    const discard = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [discard];
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    activate(game, pathfinder, 0);
    expect(zone(game, discard)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });
});

describe("Rishadan Brigand", () => {
  it("has an opponent who doesn't pay {3} sacrifice a permanent", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b);
    enter(game, "Rishadan Brigand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("leaves an opponent who pays {3} alone", () => {
    const { game, b } = table();
    const forests = lands(game, "Forest", 3, B);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    enter(game, "Rishadan Brigand");
    expect(zone(game, bears)).toBe("battlefield");
    expect(forests.every((f) => game.state.objects[f].tapped)).toBe(true);
  });
});

describe("Warmonger", () => {
  it("can be activated by an opponent, hitting creatures without flying and each player", () => {
    const { game } = table();
    lands(game, "Mountain", 2, B);
    const monger = spawn(game, "Warmonger");
    const elves = spawn(game, "Llanowar Elves");
    const bird = spawn(game, "Birds of Paradise", B);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    activate(game, monger, 0, { player: B });
    settle(game);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bird)).toBe("battlefield");
    expect(game.state.objects[monger].damageMarked).toBe(1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Squallmonger", () => {
  it("hits only creatures with flying, and each player", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const monger = spawn(game, "Squallmonger");
    const elves = spawn(game, "Llanowar Elves");
    const bird = spawn(game, "Birds of Paradise", B);
    activate(game, monger, 0);
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, bird)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Snake Pit", () => {
  it("offers a Snake when an opponent casts a blue spell", () => {
    const { game, a } = table();
    spawn(game, "Snake Pit");
    lands(game, "Island", 1, B);
    const spell = toHand(game, "Opt", B);
    pickModes(a, 0);
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, spell, { player: B });
    const snakes = Object.values(game.state.objects).filter((o) => o.cardName === "Snake Token" && o.zone === "battlefield");
    expect(snakes).toHaveLength(1);
  });
});

describe("Caustic Wasps", () => {
  it("may destroy an artifact of the player it hit", () => {
    const { game, a } = table();
    const wasps = spawn(game, "Caustic Wasps");
    const rock = spawn(game, "Mind Stone", B);
    pickTargets(a, rock);
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: wasps, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(zone(game, rock)).toBe("graveyard");
  });
});
