/**
 * `sameNameWith` off the battlefield (rule 201.2a): the target's namesakes
 * in a graveyard (Echoing Return, Rat King, Moratorium Stone), a library (Secret
 * Salvage, Mask of the Mimic), and a revealed hand (`exile-graveyard`'s
 * `fromHand` — Legion's End, Hour of Glory, Thought Distortion). And
 * `sameNameTokensOnly`: the target and same-named tokens (Legions to Ashes).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  hand,
  lands,
  named,
  nextTurn,
  pickFromZone,
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
} from "./harness.js";

type Game = ReturnType<typeof table>["game"];

/** A token of `name`, a real one as far as anything asks. */
function tokenOf(game: Game, name: string, player = A): ObjectId {
  const id = spawn(game, name, player);
  game.state.objects[id].isToken = true;
  return id;
}

const revealedBy = (game: Game): string[] =>
  game.state.eventLog.flatMap((e) => (e.type === "cards-revealed" ? [e.player] : []));

describe("namesakes in a graveyard", () => {
  it("Echoing Return brings back the target and all other cards of its name, only from your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const target = toGraveyard(game, "Grizzly Bears");
    const namesake = toGraveyard(game, "Grizzly Bears");
    const other = toGraveyard(game, "Llanowar Elves");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Echoing Return"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("hand");
    expect(zone(game, namesake)).toBe("hand");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("Echoing Return's target must be a creature card, but a namesake is any card of the name", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const land = toGraveyard(game, "Dryad Arbor");
    const namesake = toGraveyard(game, "Dryad Arbor");
    expect(game.state.objects[land].cardName).toBe("Dryad Arbor");
    cast(game, toHand(game, "Echoing Return"), { targets: [ref(land)] });
    expect(zone(game, namesake)).toBe("hand");
    const sorcery = toGraveyard(game, "Lightning Bolt");
    lands(game, "Swamp", 1);
    expect(() => cast(game, toHand(game, "Echoing Return"), { targets: [ref(sorcery)] })).toThrow();
  });

  it("Rat King returns them tapped, a sacrificed Rat of the name among them", () => {
    const { game } = table();
    const king = spawn(game, "Rat King, Verminister");
    const rats = [spawn(game, "Rat King, Verminister"), spawn(game, "Rat King, Verminister")];
    // Three Rats, one the King itself, and a target of another name.
    const target = toGraveyard(game, "Grizzly Bears");
    const namesake = toGraveyard(game, "Grizzly Bears");
    activate(game, king, 0, { targets: [ref(target)] });
    for (const id of [target, namesake]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(game.state.objects[id].tapped).toBe(true);
    }
    for (const id of [king, ...rats]) expect(zone(game, id)).toBe("graveyard");
  });

  it("Rat King's disappear makes a Rat and grows only after a permanent left your battlefield", () => {
    const { game } = table({ step: "precombat-main" });
    const king = spawn(game, "Rat King, Verminister");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Rat Token", A)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    destroy(game, spawn(game, "Grizzly Bears"));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Rat Token", A)).toBe(1);
    expect(counters(game, king)).toBe(1);
  });

  it("Moratorium Stone exiles the name from every graveyard and the battlefield, but not a hand or library", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    const stone = spawn(game, "Moratorium Stone");
    const target = toGraveyard(game, "Grizzly Bears", B);
    const mine = toGraveyard(game, "Grizzly Bears");
    const permanent = spawn(game, "Grizzly Bears", B);
    const mineOnBoard = spawn(game, "Grizzly Bears");
    const other = toGraveyard(game, "Llanowar Elves", B);
    const inHand = toHand(game, "Grizzly Bears", B);
    activate(game, stone, 1, { targets: [ref(target)] });
    expect(zone(game, stone)).toBe("graveyard");
    for (const id of [target, mine, permanent, mineOnBoard]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, inHand)).toBe("hand");
  });

  it("Moratorium Stone's first ability exiles one card, the second can't target a land", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Swamp", 2);
    const stone = spawn(game, "Moratorium Stone");
    const land = toGraveyard(game, "Forest", B);
    const namesake = toGraveyard(game, "Forest", B);
    expect(() => activate(game, stone, 1, { targets: [ref(land)] })).toThrow();
    activate(game, stone, 0, { targets: [ref(land)] });
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, namesake)).toBe("graveyard");
  });
});

describe("namesakes in a library", () => {
  it("Secret Salvage reads the exiled card's name and takes any number, revealed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const target = toGraveyard(game, "Grizzly Bears");
    const first = toLibrary(game, "Grizzly Bears");
    const second = toLibrary(game, "Grizzly Bears");
    const third = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, first, second);
    cast(game, toHand(game, "Secret Salvage"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("exile");
    expect(new Set(seen.offered)).toEqual(new Set([first, second, third]));
    expect(zone(game, first)).toBe("hand");
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, third)).toBe("library");
    expect(revealedBy(game)).toEqual([A]);
  });

  it("Mask of the Mimic finds a namesake of another player's creature, under your control", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const fodder = spawn(game, "Llanowar Elves");
    const target = spawn(game, "Grizzly Bears", B);
    const find = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Llanowar Elves");
    const seen = pickFromZone(a, find);
    cast(game, toHand(game, "Mask of the Mimic"), { targets: [ref(target)], sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(seen.offered).toEqual([find]);
    expect(zone(game, find)).toBe("battlefield");
    expect(game.state.objects[find].controller).toBe(A);
  });

  it("Mask of the Mimic can't target a token", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const fodder = spawn(game, "Llanowar Elves");
    const token = tokenOf(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Mask of the Mimic"), { targets: [ref(token)], sacrifice: fodder })).toThrow();
  });
});

describe("namesakes in a revealed hand", () => {
  it("Legion's End exiles the target, that player's namesakes, and the name from their hand and graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const target = spawn(game, "Grizzly Bears", B);
    const namesake = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const inHand = toHand(game, "Grizzly Bears", B);
    const inGraveyard = toGraveyard(game, "Grizzly Bears", B);
    const inLibrary = toLibrary(game, "Grizzly Bears", B);
    const other = toHand(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Legion's End"), { targets: [ref(target)] });
    for (const id of [target, namesake, inHand, inGraveyard]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, inLibrary)).toBe("library");
    expect(zone(game, other)).toBe("hand");
    expect(revealedBy(game)).toEqual([B]);
  });

  it("Legion's End can't target mana value 3 or your own creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const big = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    const spell = toHand(game, "Legion's End");
    expect(() => cast(game, spell, { targets: [ref(big)] })).toThrow();
    expect(() => cast(game, spell, { targets: [ref(mine)] })).toThrow();
  });

  it("Legion's End on a token still names what to exile, as the token last existed (rule 608.2h)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const token = tokenOf(game, "Grizzly Bears", B);
    const inHand = toHand(game, "Grizzly Bears", B);
    const other = toHand(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Legion's End"), { targets: [ref(token)] });
    expect(named(game, "Grizzly Bears", B)).toEqual([]);
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, other)).toBe("hand");
  });

  it("Hour of Glory exiles the God's namesakes from its controller's hand, not their graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const god = spawn(game, "Kefnet the Mindful", B);
    const inHand = toHand(game, "Kefnet the Mindful", B);
    const inGraveyard = toGraveyard(game, "Kefnet the Mindful", B);
    const other = toHand(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hour of Glory"), { targets: [ref(god)] });
    expect(zone(game, god)).toBe("exile");
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, inGraveyard)).toBe("graveyard");
    expect(zone(game, other)).toBe("hand");
    expect(revealedBy(game)).toEqual([B]);
  });

  it("Hour of Glory on anything else reveals nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    const inHand = toHand(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hour of Glory"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, inHand)).toBe("hand");
    expect(revealedBy(game)).toEqual([]);
  });

  it("Thought Distortion exiles every match from the hand and graveyard, and only them", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bolt = toHand(game, "Lightning Bolt", B);
    const ring = toGraveyard(game, "Sol Ring", B);
    const bear = toHand(game, "Grizzly Bears", B);
    const land = toGraveyard(game, "Forest", B);
    const inLibrary = toLibrary(game, "Lightning Bolt", B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Thought Distortion"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, inLibrary)).toBe("library");
    expect(hand(game, B)).toHaveLength(before - 1);
    expect(revealedBy(game)).toEqual([B]);
  });
});

describe("the target and same-named tokens", () => {
  it("Legions to Ashes exiles a nontoken target and that player's tokens of its name, sparing the rest", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 2);
    const target = spawn(game, "Rat Colony", B);
    const namesake = spawn(game, "Rat Colony", B);
    const theirToken = tokenOf(game, "Rat Colony", B);
    const myToken = tokenOf(game, "Rat Colony", A);
    const otherToken = tokenOf(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Legions to Ashes"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("exile");
    expect(game.state.objects[theirToken]?.zone).not.toBe("battlefield");
    expect(zone(game, namesake)).toBe("battlefield");
    expect(zone(game, myToken)).toBe("battlefield");
    expect(zone(game, otherToken)).toBe("battlefield");
  });

  it("Legions to Ashes on a token takes that player's other tokens of the name", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 2);
    const target = tokenOf(game, "Grizzly Bears", B);
    tokenOf(game, "Grizzly Bears", B);
    const namesake = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Legions to Ashes"), { targets: [ref(target)] });
    expect(named(game, "Grizzly Bears", B)).toEqual([namesake]);
  });
});
