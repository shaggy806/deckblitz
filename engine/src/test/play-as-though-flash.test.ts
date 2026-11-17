/**
 * "The next creature card you **play** this turn can be played as though it
 * had flash" (Scout's Warning — `castAsThoughFlash` with `next` and `play`):
 * a creature spell cast at instant speed, and a land creature card (Dryad
 * Arbor) played as though it had flash — any time its owner could cast an
 * instant (rule 702.8a), but only on their own turn (305.3; the ruling). The
 * first creature card played or cast uses it up. A land card that has flash
 * where it is (Teferi, Mage of Zhalfir's grant, rule 113.6) is played the
 * same way.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, hand, lands, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

const play = (game: Game, card: ObjectId, player = A): void => {
  game.dispatch({ type: "play-land", player, card });
};

const canPlay = (game: Game, card: ObjectId, player = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "play-land" && a.card === card);

/** Scout's Warning cast in alice's main phase. */
function warned(game: Game): void {
  lands(game, "Plains", 1);
  toLibrary(game, "Wastes");
  cast(game, toHand(game, "Scout's Warning"));
}

describe("Scout's Warning", () => {
  it("draws a card, and the next creature spell may be cast on an opponent's turn — only the next", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Plains", 1);
    toLibrary(game, "Wastes");
    const bears = toHand(game, "Grizzly Bears");
    const second = toHand(game, "Grizzly Bears");
    toStep(game, "upkeep", B);
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(() => cast(game, bears)).toThrow(/turn|main phase|stack/i);
    const before = hand(game).length;
    cast(game, toHand(game, "Scout's Warning"));
    expect(hand(game).length).toBe(before + 1);
    // Resolved, bob has priority again (rule 117.3b): he passes.
    if (game.state.priority.holder === B) game.dispatch({ type: "pass-priority", player: B });
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    if (game.state.priority.holder === B) game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(() => cast(game, second)).toThrow(/turn|main phase|stack/i);
  });

  it("ends with the turn (rule 514.2)", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    warned(game);
    const bears = toHand(game, "Grizzly Bears");
    toStep(game, "upkeep", B);
    game.dispatch({ type: "pass-priority", player: B });
    expect(() => cast(game, bears)).toThrow(/turn|main phase|stack/i);
  });

  it("a creature cast at instant speed in combat uses it up", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    warned(game);
    const bears = toHand(game, "Grizzly Bears");
    const second = toHand(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(() => cast(game, second)).toThrow(/main phase|stack|turn/i);
  });

  it("casting a creature at a normal time uses it up too (the ruling)", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    warned(game);
    cast(game, toHand(game, "Grizzly Bears"));
    const second = toHand(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    expect(() => cast(game, second)).toThrow(/main phase|stack|turn/i);
  });

  it("Dryad Arbor may be played in combat on your own turn, and that uses it up", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    warned(game);
    const arbor = toHand(game, "Dryad Arbor");
    const bears = toHand(game, "Grizzly Bears");
    toStep(game, "begin-combat");
    expect(canPlay(game, arbor)).toBe(true);
    play(game, arbor);
    expect(zone(game, arbor)).toBe("battlefield");
    expect(() => cast(game, bears)).toThrow(/main phase|stack|turn/i);
  });

  it("without it, Dryad Arbor can't be played in combat (the control)", () => {
    const { game } = table();
    const arbor = toHand(game, "Dryad Arbor");
    toStep(game, "begin-combat");
    expect(canPlay(game, arbor)).toBe(false);
    expect(() => play(game, arbor)).toThrow(/main phase/i);
  });

  it("a noncreature land is still played only at sorcery speed", () => {
    const { game } = table();
    warned(game);
    const forest = toHand(game, "Forest");
    toStep(game, "begin-combat");
    expect(canPlay(game, forest)).toBe(false);
  });
});

describe("a land card with flash (rule 702.8a)", () => {
  it("Teferi, Mage of Zhalfir's Dryad Arbor is played in combat on your turn, never on an opponent's", () => {
    const { game } = table();
    spawn(game, "Teferi, Mage of Zhalfir");
    const arbor = toHand(game, "Dryad Arbor");
    toStep(game, "begin-combat");
    expect(canPlay(game, arbor)).toBe(true);
    toStep(game, "upkeep", B);
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(canPlay(game, arbor)).toBe(false);
    expect(() => play(game, arbor)).toThrow(/own turn/i);
  });
});
