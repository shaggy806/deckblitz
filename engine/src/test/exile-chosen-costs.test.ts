/**
 * Costs that exile a chosen object from a named place: a permanent you control
 * (`exilesSacrifice` — Food Chain, City of Shadows, Necrotic Fumes), a card from
 * your hand (`exileFromHand` — Cadaverous Bloom, a mana ability that waits for
 * its answer, rule 605.3b), N cards from one graveyard (`singleGraveyard` — Night
 * Soil), and a spell you control (`exileSpell` — Nivmagus Elemental).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  B,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

type AbilityOffer = Extract<LegalAction, { kind: "activate-ability" }>;
const offersOf = (game: Game, source: ObjectId): AbilityOffer[] =>
  game.legalActions(A).filter((a): a is AbilityOffer => a.kind === "activate-ability" && a.source === source);
const pool = (game: Game) => game.state.players[A].manaPool;

describe("exiling a creature you control (Food Chain)", () => {
  it("adds 1 plus its mana value of one colour, and it isn't sacrificed", () => {
    const { game } = table();
    const chain = spawn(game, "Food Chain", A);
    const giant = spawn(game, "Hill Giant", A);
    const [offer] = offersOf(game, chain).filter((o) => o.manaColors?.[0] === "G");
    expect(offer.sacrifice?.exile).toBe(true);
    expect(offer.sacrifice?.choices).toEqual([giant]);
    game.dispatch({ type: "activate-ability", player: A, source: chain, abilityIndex: 0, targets: [], sacrifice: giant, manaColors: ["G"] });
    expect(zone(game, giant)).toBe("exile");
    expect(graveyard(game, A)).toEqual([]);
    expect(pool(game).length).toBe(5);
    expect(pool(game).every((m) => m.type === "G")).toBe(true);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("spends only on a creature spell", () => {
    const { game } = table();
    const chain = spawn(game, "Food Chain", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const anthem = toHand(game, "Glorious Anthem");
    const other = toHand(game, "Hill Giant");
    game.dispatch({ type: "activate-ability", player: A, source: chain, abilityIndex: 0, targets: [], sacrifice: bears, manaColors: ["W"] });
    expect(pool(game).length).toBe(3);
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === anthem)).toBe(false);
    expect(zone(game, other)).toBe("hand");
  });

  it("offers nothing with no creature, and needs the creature named", () => {
    const { game } = table();
    const chain = spawn(game, "Food Chain", A);
    expect(offersOf(game, chain).every((o) => (o.sacrifice?.choices.length ?? 0) === 0)).toBe(true);
    const bears = spawn(game, "Grizzly Bears", A);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: chain, abilityIndex: 0, targets: [], manaColors: ["G"] })).not.toBeNull();
    expect(game.canDispatch({ type: "activate-ability", player: A, source: chain, abilityIndex: 0, targets: [], sacrifice: bears, manaColors: ["G"] })).toBeNull();
  });

  it("isn't a sacrifice: no 'whenever you sacrifice' sees it", () => {
    const { game } = table();
    const chain = spawn(game, "Food Chain", A);
    const bears = spawn(game, "Grizzly Bears", A);
    game.dispatch({ type: "activate-ability", player: A, source: chain, abilityIndex: 0, targets: [], sacrifice: bears, manaColors: ["G"] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.eventsOfType("permanent-sacrificed")).toEqual([]);
  });
});

describe("exiling a creature as a stack ability's cost (City of Shadows)", () => {
  it("puts a storage counter on and then taps for that many {C}", () => {
    const { game } = table();
    const city = spawn(game, "City of Shadows", A);
    const bears = spawn(game, "Grizzly Bears", A);
    game.dispatch({ type: "activate-ability", player: A, source: city, abilityIndex: 0, targets: [], sacrifice: bears });
    expect(zone(game, bears)).toBe("exile");
    settle(game);
    expect(counters(game, city, "storage")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    activate(game, city, 1);
    expect(pool(game).map((m) => m.type)).toEqual(["C"]);
  });
});

describe("as an additional cost (Necrotic Fumes)", () => {
  it("exiles the creature chosen and then the target", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const fumes = toHand(game, "Necrotic Fumes");
    const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === fumes);
    expect(offer?.kind === "cast-spell" && offer.sacrifice?.exile).toBe(true);
    cast(game, fumes, { targets: [ref(theirs)], sacrifice: mine });
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
  });

  it("can't be cast with no creature to exile", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const theirs = spawn(game, "Hill Giant", B);
    const fumes = toHand(game, "Necrotic Fumes");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: fumes, targets: [ref(theirs)] })).not.toBeNull();
  });
});

describe("exiling a card from your hand (Cadaverous Bloom)", () => {
  it("adds its mana at once with one card to exile, off the stack", () => {
    const { game } = table();
    const bloom = spawn(game, "Cadaverous Bloom", A);
    const only = toHand(game, "Hill Giant");
    game.state.zones.perPlayer[A].hand = [only];
    game.dispatch({ type: "activate-ability", player: A, source: bloom, abilityIndex: 0, targets: [], manaColors: ["B"] });
    expect(zone(game, only)).toBe("exile");
    expect(pool(game).map((m) => m.type)).toEqual(["B", "B"]);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("asks which with a choice, the mana coming with the answer", () => {
    const { game } = table();
    const bloom = spawn(game, "Cadaverous Bloom", A);
    const first = toHand(game, "Hill Giant");
    const second = toHand(game, "Grizzly Bears");
    game.state.zones.perPlayer[A].hand = [first, second];
    game.dispatch({ type: "activate-ability", player: A, source: bloom, abilityIndex: 0, targets: [], manaColors: ["G"] });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(pool(game).length).toBe(0);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [second] });
    expect(zone(game, second)).toBe("exile");
    expect(zone(game, first)).toBe("hand");
    expect(pool(game).map((m) => m.type)).toEqual(["G", "G"]);
    expect(game.state.awaiting).toBeNull();
  });

  it("can't be activated with an empty hand, and isn't tapped for by the auto-payer", () => {
    const { game } = table();
    const bloom = spawn(game, "Cadaverous Bloom", A);
    game.state.zones.perPlayer[A].hand = [];
    expect(hand(game, A)).toEqual([]);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: bloom, abilityIndex: 0, targets: [], manaColors: ["G"] })).not.toBeNull();
    // A spell it could pay for: only by activating it by hand first.
    const bears = toHand(game, "Grizzly Bears");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [] })).not.toBeNull();
  });
});

describe("exiling from a single graveyard (Night Soil)", () => {
  it("takes two creature cards from one graveyard, any player's", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const soil = spawn(game, "Night Soil", A);
    const one = toGraveyard(game, "Grizzly Bears", B);
    const two = toGraveyard(game, "Hill Giant", B);
    activate(game, soil, 0);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    settle(game);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(1);
  });

  it("isn't payable from two graveyards with one each (the ruling), nor with a noncreature", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const soil = spawn(game, "Night Soil", A);
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Lightning Bolt", B);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: soil, abilityIndex: 0, targets: [] })).not.toBeNull();
  });

  it("asks when there's a choice, and refuses a pair across graveyards", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const soil = spawn(game, "Night Soil", A);
    const mine = [toGraveyard(game, "Grizzly Bears", A), toGraveyard(game, "Hill Giant", A)];
    const theirs = [toGraveyard(game, "Grizzly Bears", B), toGraveyard(game, "Hill Giant", B)];
    activate(game, soil, 0, { settle: false });
    const asked = game.state.awaiting;
    expect(asked?.kind).toBe("choose-from-zone");
    expect(asked?.kind === "choose-from-zone" && asked.together?.text).toBe("from a single graveyard");
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [mine[0], theirs[0]] })).not.toBeNull();
    game.dispatch({ type: "choose-from-zone", player: A, chosen: theirs });
    expect(theirs.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(mine.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    settle(game);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(1);
    expect(named(game, "Night Soil", A).length).toBe(1);
  });
});

describe("exiling a spell you control (Nivmagus Elemental)", () => {
  it("exiles the instant, which doesn't resolve, and grows", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const nivmagus = spawn(game, "Nivmagus Elemental", A);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    activate(game, nivmagus, 0);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.players[B].life).toBe(20);
    expect(pt(game, nivmagus)).toEqual({ power: 3, toughness: 4 });
  });

  it("needs a spell of yours on the stack, an instant or sorcery", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const nivmagus = spawn(game, "Nivmagus Elemental", A);
    const can = (): string | null =>
      game.canDispatch({ type: "activate-ability", player: A, source: nivmagus, abilityIndex: 0, targets: [] });
    expect(can()).not.toBeNull();
    cast(game, toHand(game, "Grizzly Bears"), { targets: [], settle: false });
    expect(can()).not.toBeNull();
  });

  it("asks which of two, and only the other resolves", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const nivmagus = spawn(game, "Nivmagus Elemental", A);
    const first = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    cast(game, first, { targets: [ref(B)], settle: false });
    cast(game, second, { targets: [ref(B)], settle: false });
    activate(game, nivmagus, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [first] });
    expect(zone(game, first)).toBe("exile");
    settle(game);
    expect(game.state.players[B].life).toBe(17);
    expect(pt(game, nivmagus).power).toBe(3);
  });

  it("exiles a copy you control, which ceases to exist (the ruling, rule 704.5e)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2);
    const nivmagus = spawn(game, "Nivmagus Elemental", A);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(bolt)], settle: false });
    const copyOnStack = (): ObjectId | undefined =>
      game.state.zones.shared.stack.find((id) => game.state.objects[id]?.isCopy === true);
    game.advanceUntil((s) => copyOnStack() !== undefined && s.priority.holder === A && s.awaiting === null);
    const copy = copyOnStack()!;
    activate(game, nivmagus, 0, { settle: false });
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [copy] });
    expect(game.state.zones.shared.stack).not.toContain(copy);
    expect(game.state.zones.shared.exile).not.toContain(copy);
    settle(game);
    expect(game.state.players[B].life).toBe(17);
    expect(pt(game, nivmagus).power).toBe(3);
  });
});
