/**
 * Set walk batch 92, part g (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
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
  zone,
  nextTurn,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
const addCounter = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
const libraryTop = (game: Game, player: PlayerId = A): ObjectId | undefined =>
  game.state.zones.perPlayer[player].library[0];

describe("Brackish Blunder", () => {
  it("bounces a tapped creature and makes a Map for the caster", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Brackish Blunder"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Map Token", A)).toBe(1);
    expect(tokensNamed(game, "Map Token", B)).toBe(0);
  });

  it("makes no Map when the creature was untapped", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Brackish Blunder"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Map Token")).toBe(0);
  });
});

describe("Deepfathom Echo", () => {
  it("explores at the beginning of combat, then may become a copy of another creature until end of turn", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const echo = spawn(game, "Deepfathom Echo");
    const top = toLibrary(game, "Grizzly Bears");
    pickModes(a); // leave the revealed card on top
    const seen = pickPermanents(a, giant);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered).toContain(giant);
    expect(seen.offered).not.toContain(echo);
    expect(libraryTop(game)).toBe(top);
    expect(counters(game, echo)).toBe(1);
    // A 3/3 Hill Giant, keeping its +1/+1 counter.
    expect(pt(game, echo)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[echo].counters["+1/+1"]).toBe(1);
    nextTurn(game);
    expect(pt(game, echo)).toEqual({ power: 5, toughness: 5 });
  });

  it("choosing nothing leaves it itself", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant");
    const echo = spawn(game, "Deepfathom Echo");
    toLibrary(game, "Grizzly Bears");
    pickModes(a);
    pickPermanents(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, echo)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Defossilize", () => {
  it("returns the creature, which explores twice — the same card again if it was left on top", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    pickModes(a); // keep it on top both times
    cast(game, toHand(game, "Defossilize"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(2);
    expect(libraryTop(game)).toBe(giant);
  });

  it("a nonland card binned, then the land under it to hand", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toLibrary(game, "Hill Giant");
    const spell = toHand(game, "Defossilize");
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, spell, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(zone(game, giant)).toBe("graveyard");
    // Defossilize left the hand; the explored Wastes came in.
    expect(hand(game).length).toBe(before);
  });
});

describe("Explorer's Cache", () => {
  it("enters with two counters and moves one onto any creature at sorcery speed", () => {
    const { game } = table();
    const cache = enter(game, "Explorer's Cache");
    expect(counters(game, cache)).toBe(2);
    const theirs = spawn(game, "Grizzly Bears", B);
    activate(game, cache, 0, { targets: [ref(theirs)] });
    expect(counters(game, cache)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
  });

  it("gains a counter when a creature you control with a +1/+1 counter dies, not otherwise", () => {
    const { game } = table();
    const cache = enter(game, "Explorer's Cache");
    const plain = spawn(game, "Grizzly Bears");
    destroy(game, plain);
    expect(counters(game, cache)).toBe(2);
    const theirs = spawn(game, "Grizzly Bears", B);
    addCounter(game, theirs);
    destroy(game, theirs, A);
    expect(counters(game, cache)).toBe(2);
    const mine = spawn(game, "Grizzly Bears");
    addCounter(game, mine);
    destroy(game, mine);
    expect(counters(game, cache)).toBe(3);
  });
});

describe("Astrid Peth", () => {
  it("makes Food on entering and attacking, and explores whenever you sacrifice a Clue or Food", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const astrid = enter(game, "Astrid Peth");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    toLibrary(game, "Hill Giant");
    pickModes(a);
    activate(game, tokensOf(game, "Food Token")[0], 0);
    expect(life(game)).toBe(23);
    expect(counters(game, astrid)).toBe(1);
    makeToken(game, "Clue Token");
    activate(game, tokensOf(game, "Clue Token")[0], 0);
    expect(counters(game, astrid)).toBe(2);
    attack(game, a, [astrid]);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Fanatical Offering", () => {
  it("sacrifices an artifact or creature, draws two and makes a Map", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const astrid = spawn(game, "Astrid Peth");
    const ring = spawn(game, "Sol Ring");
    const spell = toHand(game, "Fanatical Offering");
    const before = hand(game).length;
    cast(game, spell, { sacrifice: ring });
    expect(zone(game, ring)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 2);
    expect(tokensNamed(game, "Map Token", A)).toBe(1);
    // Sol Ring is neither a Clue nor a Food: Astrid Peth doesn't explore.
    expect(counters(game, astrid)).toBe(0);
  });
});

describe("Francisco, Fowl Marauder", () => {
  it("explores once when several Pirates deal damage to a player together", () => {
    const { game, a } = table();
    const francisco = spawn(game, "Francisco, Fowl Marauder");
    const pirates = [spawn(game, "Brazen Freebooter"), spawn(game, "Brazen Freebooter")];
    toLibrary(game, "Hill Giant");
    pickModes(a);
    attack(game, a, pirates);
    expect(life(game, B)).toBe(14);
    expect(counters(game, francisco)).toBe(1);
  });

  it("not for a non-Pirate's damage", () => {
    const { game, a } = table();
    const francisco = spawn(game, "Francisco, Fowl Marauder");
    const bears = spawn(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant");
    pickModes(a);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(counters(game, francisco)).toBe(0);
  });
});

describe("Get Lost", () => {
  it("destroys the permanent and its controller gets two Maps", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Get Lost"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Map Token", B)).toBe(2);
    expect(tokensNamed(game, "Map Token", A)).toBe(0);
  });
});

describe("Nicanzil, Current Conductor", () => {
  it("a land explored: may put a land card from hand onto the battlefield tapped", () => {
    const { game, a } = table();
    const nicanzil = spawn(game, "Nicanzil, Current Conductor");
    const forest = toHand(game, "Forest");
    const seen = pickFromZone(a, forest);
    enter(game, "Cenote Scout"); // reveals a Wastes
    expect(seen.offered).toContain(forest);
    expect(zone(game, forest)).toBe("battlefield");
    expect(isTapped(game, forest)).toBe(true);
    expect(counters(game, nicanzil)).toBe(0);
  });

  it("a nonland card explored: a counter on Nicanzil; an opponent's exploring doesn't count", () => {
    const { game, a, b } = table();
    const nicanzil = spawn(game, "Nicanzil, Current Conductor");
    toLibrary(game, "Hill Giant");
    pickModes(a);
    enter(game, "Cenote Scout");
    expect(counters(game, nicanzil)).toBe(1);
    toLibrary(game, "Hill Giant", B);
    pickModes(b);
    enter(game, "Cenote Scout", B);
    expect(counters(game, nicanzil)).toBe(1);
  });
});

describe("Path of Discovery", () => {
  it("each creature you control that enters explores; an opponent's doesn't", () => {
    const { game, a, b } = table();
    spawn(game, "Path of Discovery");
    toLibrary(game, "Hill Giant");
    pickModes(a);
    const mine = enter(game, "Grizzly Bears");
    expect(counters(game, mine)).toBe(1);
    pickModes(b);
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Restless Anchorage", () => {
  it("enters tapped, becomes a 2/3 flying Bird land, and makes a Map when it attacks", () => {
    const { game, a } = table();
    const anchorage = enter(game, "Restless Anchorage");
    expect(isTapped(game, anchorage)).toBe(true);
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    activate(game, anchorage, 1);
    expect(pt(game, anchorage)).toEqual({ power: 2, toughness: 3 });
    expect(types(game, anchorage)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(keywords(game, anchorage).has("flying")).toBe(true);
    game.state.objects[anchorage].tapped = false;
    attack(game, a, [anchorage]);
    expect(life(game, B)).toBe(18);
    expect(tokensNamed(game, "Map Token", A)).toBe(1);
  });
});
