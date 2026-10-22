/**
 * Amonkhet, group N: the aftermath split cards, the cycle/discard payoffs,
 * Gideon, Martial Paragon and the graveyard shuffles — the clause of each
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  tokensNamed,
  toGraveyard,
  toHand,
  toLibrary,
  types,
  zone,
} from "./harness.js";

function cycle(game: Game, card: ObjectId): void {
  const why = game.canDispatch({ type: "cycle", player: A, card });
  if (why !== null) throw new Error(`cycle refused: ${why}`);
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
}

describe("Drake Haven", () => {
  it("cycling a card and paying {1} makes a Drake", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    spawn(game, "Drake Haven");
    pickModes(a, 0);
    cycle(game, toHand(game, "Curator of Mysteries"));
    expect(tokensNamed(game, "Drake Token", A)).toBe(1);
  });
});

describe("Ruthless Sniper", () => {
  it("a discard, paid for, puts a -1/-1 counter on the target creature", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    spawn(game, "Ruthless Sniper");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    cycle(game, toHand(game, "Curator of Mysteries"));
    expect(counters(game, giant, "-1/-1")).toBe(1);
  });
});

describe("Deem Worthy", () => {
  it("cycling it deals 2 damage to the target creature, and still draws", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    const card = toHand(game, "Deem Worthy");
    const before = hand(game).length;
    cycle(game, card);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Shefet Monitor", () => {
  it("cycling it puts a basic land from the library onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    cycle(game, toHand(game, "Shefet Monitor"));
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("declined, it searches nothing", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const forest = toLibrary(game, "Forest");
    cycle(game, toHand(game, "Shefet Monitor"));
    expect(zone(game, forest)).not.toBe("battlefield");
  });
});

describe("Mouth // Feed", () => {
  it("Mouth makes a Hippo; Feed draws one per creature you control with power 3 or greater", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    const card = toHand(game, "Mouth // Feed");
    cast(game, card, { face: 1 });
    expect(tokensNamed(game, "Hippo Token", A)).toBe(1);
    const before = hand(game).length;
    cast(game, card, { face: 2, via: "aftermath" });
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Prepare // Fight", () => {
  it("Prepare untaps and pumps with lifelink; Fight from the graveyard fights", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Prepare // Fight");
    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(24);
  });
});

describe("Reduce // Rubble", () => {
  it("Rubble keeps up to three target lands from untapping in their controller's next untap step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const held = [0, 1, 2].map(() => spawn(game, "Forest", B, { tapped: true }));
    const free = spawn(game, "Forest", B, { tapped: true });
    const card = toGraveyard(game, "Reduce // Rubble");
    cast(game, card, { face: 2, via: "aftermath", targets: held.map(ref) });
    expect(zone(game, card)).toBe("exile");
    nextTurn(game);
    expect(held.map((id) => game.state.objects[id].tapped)).toEqual([true, true, true]);
    expect(game.state.objects[free].tapped).toBe(false);
  });
});

describe("Dusk // Dawn", () => {
  it("Dusk destroys only power 3 or greater; Dawn returns only power 2 or less", () => {
    const { game } = table();
    lands(game, "Plains", 9);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const card = toHand(game, "Dusk // Dawn");
    cast(game, card, { face: 1 });
    expect([zone(game, bears), zone(game, giant)]).toEqual(["battlefield", "graveyard"]);
    const deadBears = toGraveyard(game, "Grizzly Bears");
    const deadGiant = toGraveyard(game, "Hill Giant");
    cast(game, card, { face: 2, via: "aftermath" });
    expect([zone(game, deadBears), zone(game, deadGiant)]).toEqual(["hand", "graveyard"]);
  });
});

describe("Gideon, Martial Paragon", () => {
  it("+2 untaps and pumps every creature you control", () => {
    const { game } = table();
    const gideon = spawn(game, "Gideon, Martial Paragon");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears");
    loyalty(game, gideon, 2);
    expect(game.state.objects[tapped].tapped).toBe(false);
    expect([pt(game, tapped), pt(game, untapped)]).toEqual([
      { power: 3, toughness: 3 },
      { power: 3, toughness: 3 },
    ]);
  });

  it("0 makes him a 5/5 indestructible creature planeswalker, and damage to him is prevented", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const gideon = spawn(game, "Gideon, Martial Paragon");
    loyalty(game, gideon, 0);
    expect(types(game, gideon)).toEqual(expect.arrayContaining(["creature", "planeswalker"]));
    expect(pt(game, gideon)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, gideon).has("indestructible")).toBe(true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(gideon)] });
    expect(counters(game, gideon, "loyalty")).toBe(5);
    expect(game.state.objects[gideon].damageMarked).toBe(0);
  });
});

describe("Compulsory Rest", () => {
  it("grants the enchanted creature a sacrifice-for-2-life ability", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Compulsory Rest"), { targets: [ref(bears)] });
    activate(game, bears, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });
});

describe("Lay Bare the Heart", () => {
  it("offers only nonlegendary, nonland cards", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const legend = toHand(game, "Isamaru, Hound of Konda", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Lay Bare the Heart"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([bears]);
    expect([zone(game, bears), zone(game, legend)]).toEqual(["graveyard", "hand"]);
  });
});

describe("Trial of Zeal", () => {
  it("deals 3 as it enters, and returns to hand when a Cartouche you control enters", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    const trial = toHand(game, "Trial of Zeal");
    cast(game, trial);
    expect(zone(game, trial)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
    pickTargets(a, bears);
    cast(game, toHand(game, "Cartouche of Zeal"), { targets: [ref(bears)] });
    expect(zone(game, trial)).toBe("hand");
  });
});

describe("Blessed Respite / Clear the Mind", () => {
  it("Blessed Respite shuffles the target player's graveyard into their library", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const dead = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    cast(game, toHand(game, "Blessed Respite"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toEqual([]);
    expect(dead.map((id) => zone(game, id))).toEqual(["library", "library"]);
  });

  it("Clear the Mind on yourself leaves only itself in your graveyard, and draws", () => {
    const { game } = table();
    lands(game, "Island", 3);
    toGraveyard(game, "Grizzly Bears");
    const card = toHand(game, "Clear the Mind");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(A)] });
    expect(graveyard(game)).toEqual([card]);
    expect(hand(game).length).toBe(before);
  });
});
