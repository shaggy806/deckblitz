/**
 * Morph and disguise costs beyond fixed mana (rules 702.37e, 702.168d): a card
 * revealed from the hand (Watcher of the Roost, Ruthless Ripper), an {X}
 * announced as it's turned up and read by its trigger (Bane of the Living,
 * Warbreak Trumpeter — 702.37f), a reduction read then (Fugitive Codebreaker),
 * and a static's increase on morph costs alone (Exiled Doomsayer — 702.37b).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, hand, lands, life, pickFromZone, pt, ref, settle, spawn, table, tokensNamed, toGraveyard, toHand, zone } from "./harness.js";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

type TurnUp = Extract<LegalAction, { kind: "turn-face-up" }>;

const castFaceDown = (game: Game, card: ObjectId): void => cast(game, card, { via: "face-down" });

const offer = (game: Game, permanent: ObjectId): TurnUp | undefined =>
  game.legalActions(A).find((x): x is TurnUp => x.kind === "turn-face-up" && x.permanent === permanent);

const turnUp = (game: Game, permanent: ObjectId, xValue?: number): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true, ...(xValue !== undefined ? { xValue } : {}) });
  settle(game);
};

/** `name` cast face down for {3} on three lands of its own, already paid for. */
const faceDown = (game: Game, name: string): ObjectId => {
  const taps = lands(game, "Wastes", 3);
  const card = toHand(game, name);
  castFaceDown(game, card);
  for (const land of taps) expect(game.state.objects[land].tapped).toBe(true);
  expect(game.state.objects[card].faceDown).toBeDefined();
  return card;
};

describe("a morph cost that reveals a card from your hand", () => {
  it("is offered only with such a card in hand, and costs no mana (Watcher of the Roost)", () => {
    const { game } = table();
    const watcher = faceDown(game, "Watcher of the Roost");
    expect(offer(game, watcher)).toBeUndefined();
    toHand(game, "Grizzly Bears");
    expect(offer(game, watcher)).toBeUndefined();
    toHand(game, "Savannah Lions");
    expect(offer(game, watcher)?.cost).toBe("Reveal a white card in your hand");
  });

  it("the card stays in hand, and its trigger fires", () => {
    const { game } = table();
    const watcher = faceDown(game, "Watcher of the Roost");
    const lions = toHand(game, "Savannah Lions");
    const before = hand(game).length;
    turnUp(game, watcher);
    expect(game.state.objects[watcher].faceDown).toBeUndefined();
    expect(zone(game, lions)).toBe("hand");
    expect(hand(game).length).toBe(before);
    expect(life(game)).toBe(22);
    expect(pt(game, watcher)).toEqual({ power: 2, toughness: 1 });
  });

  it("asks which when several would do, offering only those", () => {
    const { game, a } = table();
    const watcher = faceDown(game, "Watcher of the Roost");
    const lions = toHand(game, "Savannah Lions");
    const other = toHand(game, "Savannah Lions");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, other);
    turnUp(game, watcher);
    expect([...seen.offered].sort()).toEqual([lions, other].sort());
    expect(game.state.objects[watcher].faceDown).toBeUndefined();
    expect(life(game)).toBe(22);
  });

  it("targets its trigger after the reveal (Ruthless Ripper)", () => {
    const { game, a } = table();
    const ripper = faceDown(game, "Ruthless Ripper");
    toHand(game, "Bog Imp");
    a.chooseTargetsFn = () => [ref(B)];
    turnUp(game, ripper);
    expect(life(game, B)).toBe(18);
  });
});

describe("a morph cost with an {X}", () => {
  it("offers the most X the mana reaches, and the trigger reads the X paid (Bane of the Living)", () => {
    const { game } = table();
    const bane = faceDown(game, "Bane of the Living");
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    expect(offer(game, bane)?.xCost?.maxX).toBe(2);
    expect(offer(game, bane)?.cost).toBe("{X}{B}{B}");
    turnUp(game, bane, 1);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, wurm)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bane)).toEqual({ power: 3, toughness: 2 });
  });

  it("refuses an X past the mana", () => {
    const { game } = table();
    const bane = faceDown(game, "Bane of the Living");
    lands(game, "Swamp", 3);
    expect(game.canDispatch({ type: "turn-face-up", player: A, permanent: bane, morph: true, xValue: 2 })).not.toBeNull();
    expect(game.canDispatch({ type: "turn-face-up", player: A, permanent: bane, morph: true, xValue: 1 })).toBeNull();
  });

  it("X 0 costs only the coloured mana and changes nothing", () => {
    const { game } = table();
    const bane = faceDown(game, "Bane of the Living");
    lands(game, "Swamp", 2);
    expect(offer(game, bane)?.xCost?.maxX).toBe(0);
    const giant = spawn(game, "Hill Giant", B);
    turnUp(game, bane, 0);
    expect(game.state.objects[bane].faceDown).toBeUndefined();
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });

  it("two {X} cost twice the X (Warbreak Trumpeter)", () => {
    const { game } = table();
    const trumpeter = faceDown(game, "Warbreak Trumpeter");
    const mountains = lands(game, "Mountain", 6);
    expect(offer(game, trumpeter)?.xCost?.maxX).toBe(2);
    turnUp(game, trumpeter, 2);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(2);
    expect(mountains.filter((m) => game.state.objects[m].tapped).length).toBe(5);
  });
});

describe("a disguise cost reduced by a live count", () => {
  it("is read as it's turned up, generic mana only (Fugitive Codebreaker)", () => {
    const { game } = table();
    const breaker = faceDown(game, "Fugitive Codebreaker");
    const mountains = lands(game, "Mountain", 3);
    expect(offer(game, breaker)).toBeUndefined();
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    expect(offer(game, breaker)).toBeUndefined();
    toGraveyard(game, "Lightning Bolt");
    expect(offer(game, breaker)?.cost).toBe("{2}{R}");
    const kept = toHand(game, "Grizzly Bears");
    turnUp(game, breaker);
    expect(mountains.every((m) => game.state.objects[m].tapped)).toBe(true);
    expect(game.state.objects[breaker].faceDown).toBeUndefined();
    expect(zone(game, kept)).toBe("graveyard");
    expect(hand(game).length).toBe(3);
  });

  it("never takes off coloured mana", () => {
    const { game } = table();
    const breaker = faceDown(game, "Fugitive Codebreaker");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Lightning Bolt");
    expect(graveyard(game).length).toBe(7);
    expect(offer(game, breaker)).toBeUndefined();
    lands(game, "Mountain", 1);
    expect(offer(game, breaker)?.cost).toBe("{R}");
  });
});

describe("all morph costs cost {2} more", () => {
  it("adds to a morph cost, whoever controls the Doomsayer (Exiled Doomsayer)", () => {
    const { game } = table();
    const bane = faceDown(game, "Bane of the Living");
    spawn(game, "Exiled Doomsayer", B);
    lands(game, "Swamp", 3);
    expect(offer(game, bane)).toBeUndefined();
    lands(game, "Swamp", 1);
    expect(offer(game, bane)?.cost).toBe("{2}{X}{B}{B}");
    expect(offer(game, bane)?.xCost?.maxX).toBe(0);
  });

  it("adds to a reveal cost that had no mana, and a megamorph cost", () => {
    const { game } = table();
    const watcher = faceDown(game, "Watcher of the Roost");
    const protector = faceDown(game, "Den Protector");
    toHand(game, "Savannah Lions");
    spawn(game, "Exiled Doomsayer");
    expect(offer(game, watcher)).toBeUndefined();
    lands(game, "Plains", 2);
    expect(offer(game, watcher)?.cost).toBe("{2}, Reveal a white card in your hand");
    expect(offer(game, protector)).toBeUndefined();
    lands(game, "Forest", 2);
    expect(offer(game, protector)?.cost).toBe("{3}{G}");
  });

  it("leaves a disguise cost alone, and the {3} to cast one face down", () => {
    const { game } = table();
    spawn(game, "Exiled Doomsayer");
    const breaker = faceDown(game, "Fugitive Codebreaker");
    lands(game, "Mountain", 6);
    expect(offer(game, breaker)?.cost).toBe("{5}{R}");
  });

  it("two add up; none from a face-down one", () => {
    const { game } = table();
    const bane = faceDown(game, "Bane of the Living");
    spawn(game, "Exiled Doomsayer");
    const theirs = spawn(game, "Exiled Doomsayer", B);
    lands(game, "Swamp", 6);
    expect(offer(game, bane)?.cost).toBe("{4}{X}{B}{B}");
    expect(offer(game, bane)?.xCost?.maxX).toBe(0);
    game.state.objects[theirs].faceDown = game.state.objects[bane].faceDown;
    expect(offer(game, bane)?.cost).toBe("{2}{X}{B}{B}");
  });
});
