import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, hand, lands, pickModes, settle, spawn, table, toHand, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

/**
 * A card in exile gaining a triggered ability that works there (rule 113.6k):
 * `grant-triggered` onto the card a `may` just exiled, a `fromExile` ability
 * riding on its modifiers until it leaves exile, a new object (rule 400.7) —
 * Cosima, God of the Voyage. The Omenkeel is its back face.
 */

/** Alice's next upkeep, Cosima's trigger answered `yes`/no. */
function upkeep(game: Game, a: Parameters<typeof pickModes>[0], exile: boolean): void {
  if (exile) pickModes(a, 0);
  else pickModes(a);
  toStep(game, "upkeep");
  settle(game);
}

describe("Cosima, God of the Voyage", () => {
  it("exiles itself at your upkeep if you like, and gains a landfall ability in exile", () => {
    const { game, a } = table();
    const cosima = spawn(game, "Cosima, God of the Voyage");
    upkeep(game, a, true);
    expect(zone(game, cosima)).toBe("exile");
    // A land enters: a voyage counter, yes; a second, yes again.
    pickModes(a, 0);
    enter(game, "Island");
    settle(game);
    expect(counters(game, cosima, "voyage")).toBe(1);
    enter(game, "Island");
    settle(game);
    expect(counters(game, cosima, "voyage")).toBe(2);
    // The third time, no: back with two +1/+1 counters, and two cards drawn.
    const before = hand(game).length;
    pickModes(a);
    enter(game, "Island");
    settle(game);
    expect(zone(game, cosima)).toBe("battlefield");
    expect(counters(game, cosima, "+1/+1")).toBe(2);
    expect(counters(game, cosima, "voyage")).toBe(0);
    expect(hand(game).length).toBe(before + 2);
  });

  it("stays put when you decline at upkeep, and an opponent's land does nothing", () => {
    const { game, a } = table();
    const cosima = spawn(game, "Cosima, God of the Voyage");
    upkeep(game, a, false);
    expect(zone(game, cosima)).toBe("battlefield");
    pickModes(a, 0);
    upkeep(game, a, true);
    expect(zone(game, cosima)).toBe("exile");
    enter(game, "Island", B);
    settle(game);
    expect(counters(game, cosima, "voyage")).toBe(0);
  });

  it("returns with no counters and draws nothing with no voyage counters", () => {
    const { game, a } = table();
    const cosima = spawn(game, "Cosima, God of the Voyage");
    upkeep(game, a, true);
    const before = hand(game).length;
    pickModes(a);
    enter(game, "Island");
    settle(game);
    expect(zone(game, cosima)).toBe("battlefield");
    expect(counters(game, cosima, "+1/+1")).toBe(0);
    expect(hand(game).length).toBe(before);
  });

  it("gains nothing when exiled some other way", () => {
    const { game, a } = table();
    const cosima: ObjectId = spawn(game, "Cosima, God of the Voyage");
    game.debugMove(cosima, "exile");
    pickModes(a, 0);
    enter(game, "Island");
    settle(game);
    expect(counters(game, cosima, "voyage")).toBe(0);
    expect(zone(game, cosima)).toBe("exile");
  });

  it("does nothing once it has left exile, even back in exile again (the ruling)", () => {
    const { game, a } = table();
    const cosima = spawn(game, "Cosima, God of the Voyage");
    upkeep(game, a, true);
    // The landfall trigger waits on the stack while Cosima leaves exile and
    // comes back: a new object, without the ability.
    pickModes(a, 0);
    toStep(game, "precombat-main");
    const island = game.debugSpawn("Island", A, "hand");
    game.dispatch({ type: "play-land", player: A, card: island });
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.debugMove(cosima, "graveyard");
    game.debugMove(cosima, "exile");
    settle(game);
    expect(counters(game, cosima, "voyage")).toBe(0);
    expect(zone(game, cosima)).toBe("exile");
  });
});

describe("The Omenkeel", () => {
  it("has the damaged player exile that many cards, and you may play the lands among them while they stay exiled", () => {
    const { game, a } = table({ deck: "Forest" });
    lands(game, "Island", 2);
    const keel = toHand(game, "Cosima, God of the Voyage");
    cast(game, keel, { face: 1 });
    expect(nameOf(game.state.objects[keel])).toBe("The Omenkeel");
    game.state.objects[keel].summoningSick = false;
    const crewman = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: keel, abilityIndex: 0, targets: [], tap: [crewman] });
    settle(game);
    a.declareAttackersFn = () => [{ attacker: keel, defender: B }];
    toStep(game, "postcombat-main");
    const exiled = Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === B);
    expect(exiled).toHaveLength(3);
    const plays = game.legalActions(A).filter((l) => l.kind === "play-land" && exiled.some((o) => o.id === l.card));
    expect(plays).toHaveLength(3);
    // Still playable on a later turn of yours.
    toStep(game, "precombat-main");
    const later = game.legalActions(A).filter((l) => l.kind === "play-land" && exiled.some((o) => o.id === l.card));
    expect(later).toHaveLength(3);
  });
});
