/**
 * A delayed "whenever" bound to a permanent chosen as the ability resolves,
 * lasting past the turn and its source (rule 603.7): Myra the Magnificent's
 * "choose an Attraction you control … For as long as that Attraction is on
 * the battlefield, whenever you visit it, copy the exiled card. You may cast
 * the copy without paying its mana cost" — a `delayed-trigger` watching `{
 * thisWay: "chosen" }` (the choose-permanents' pick), `about: "exiled"`, `until:
 * "while-exiled"`. And her cast trigger: an instant or sorcery from your hand
 * opens an Attraction (rule 701.51).
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
  destroy,
  hand,
  lands,
  life,
  lightUp,
  named,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { ScriptedController } from "../controller.js";

const ALL = [1, 2, 3, 4, 5, 6] as const;

/** `name` on alice's battlefield, lit up on every number (or none). */
function attraction(game: Game, name: string, lights: readonly number[] = ALL): ObjectId {
  const id = spawn(game, name);
  lightUp(game, id, lights);
  return id;
}

/** Alice's next precombat main phase, its roll to visit and what it set off resolved. */
function visitNextTurn(game: Game): void {
  toStep(game, "precombat-main");
  settle(game);
}

/** Alice casts each copy she's offered, aimed at bob. */
function castCopiesAtBob(seat: ScriptedController): void {
  seat.chooseCastNowFn = (_v, offer) => ({
    type: "cast-spell",
    player: A,
    card: (offer.casts[0] as unknown as { card: ObjectId }).card,
    targets: [ref(B)],
    via: "effect",
    free: true,
  });
}

/** Myra exiles the Shock in alice's graveyard (X = 1), choosing `chosen`. */
function exileShock(game: Game, seat: ScriptedController, myra: ObjectId, chosen: ObjectId): { shock: ObjectId; offered: readonly ObjectId[] } {
  const shock = toGraveyard(game, "Shock");
  lands(game, "Island", 1);
  const seen = pickPermanents(seat, chosen);
  activate(game, myra, 0, { x: 1, targets: [ref(shock)] });
  return { shock, offered: seen.offered };
}

describe("Myra the Magnificent", () => {
  it("opens an Attraction for an instant or sorcery cast from your hand, and not for a creature spell", () => {
    const { game } = table({ attractions: ["Information Booth", "Kiddie Coaster"] });
    spawn(game, "Myra the Magnificent");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Information Booth", A)).toHaveLength(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(named(game, "Information Booth", A)).toHaveLength(1);
    expect(zone(game, named(game, "Information Booth", A)[0])).toBe("battlefield");
  });

  it("exiles the card, puts a midway counter on an Attraction without one, and copies the card at each visit", () => {
    const { game, a } = table();
    const myra = spawn(game, "Myra the Magnificent");
    const booth = attraction(game, "Information Booth");
    const coaster = attraction(game, "Kiddie Coaster", []);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "midway", amount: 1 }, [ref(coaster)]);
    const { shock, offered } = exileShock(game, a, myra, booth);
    expect(offered).toEqual([booth]);
    expect(zone(game, shock)).toBe("exile");
    expect(counters(game, booth, "midway")).toBe(1);
    expect(life(game, B)).toBe(20);
    castCopiesAtBob(a);
    const cards = hand(game).length;
    visitNextTurn(game);
    // The booth's own visit drew a card; the copy dealt 2.
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(cards + 2); // the turn's draw and the booth's
    expect(zone(game, shock)).toBe("exile");
    // Turns later, and with Myra gone (its ruling), it still copies.
    destroy(game, myra);
    visitNextTurn(game);
    expect(life(game, B)).toBe(16);
  });

  it("only a visit by you to that Attraction copies it", () => {
    const { game, a } = table();
    const myra = spawn(game, "Myra the Magnificent");
    const booth = attraction(game, "Information Booth", []);
    exileShock(game, a, myra, booth);
    castCopiesAtBob(a);
    // Another Attraction visited, the chosen one not.
    attraction(game, "Kiddie Coaster");
    visitNextTurn(game);
    expect(life(game, B)).toBe(20);
    lightUp(game, booth, ALL);
    visitNextTurn(game);
    expect(life(game, B)).toBe(18);
  });

  it("another player visiting it, once they control it, isn't you visiting it", () => {
    const { game, a } = table();
    const myra = spawn(game, "Myra the Magnificent");
    const booth = attraction(game, "Information Booth");
    exileShock(game, a, myra, booth);
    castCopiesAtBob(a);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(booth)]);
    settle(game);
    expect(game.state.objects[booth].controller).toBe(B);
    // Bob's turn: he rolls to visit his Attractions, the booth among them.
    toStep(game, "precombat-main", B);
    settle(game);
    expect(game.state.eventLog.some((e) => e.type === "attraction-visited" && e.object === booth && e.player === B)).toBe(true);
    expect(life(game, B)).toBe(20);
  });

  it("stops once the exiled card has left exile", () => {
    const { game, a } = table();
    const myra = spawn(game, "Myra the Magnificent");
    const booth = attraction(game, "Information Booth");
    const { shock } = exileShock(game, a, myra, booth);
    castCopiesAtBob(a);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "exile" }, [ref(shock)]);
    settle(game);
    expect(zone(game, shock)).toBe("hand");
    visitNextTurn(game);
    expect(life(game, B)).toBe(20);
  });

  it("stops once that Attraction has left the battlefield — another, or the same card back, isn't it", () => {
    const { game, a } = table();
    const myra = spawn(game, "Myra the Magnificent");
    const booth = attraction(game, "Information Booth");
    exileShock(game, a, myra, booth);
    castCopiesAtBob(a);
    destroy(game, booth);
    expect(zone(game, booth)).not.toBe("battlefield");
    attraction(game, "Information Booth");
    visitNextTurn(game);
    expect(life(game, B)).toBe(20);
  });

  it("with no Attraction to choose, the card is still exiled and nothing watches", () => {
    const { game, a } = table();
    const myra = spawn(game, "Myra the Magnificent");
    const watches = game.state.delayedTriggers.length;
    const shock = toGraveyard(game, "Shock");
    lands(game, "Island", 1);
    activate(game, myra, 0, { x: 1, targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("exile");
    expect(game.state.delayedTriggers.length).toBe(watches);
    castCopiesAtBob(a);
    attraction(game, "Information Booth");
    visitNextTurn(game);
    expect(life(game, B)).toBe(20);
  });

  it("targets only a card whose mana value is X", () => {
    const { game } = table();
    const myra = spawn(game, "Myra the Magnificent");
    attraction(game, "Information Booth");
    const shock = toGraveyard(game, "Shock");
    lands(game, "Island", 2);
    expect(() => activate(game, myra, 0, { x: 2, targets: [ref(shock)] })).toThrow();
  });
});
