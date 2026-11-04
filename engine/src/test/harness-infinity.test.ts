/**
 * Harness and ∞ (rules 701.64, 702.186): the `harness` effect, the `harnessed`
 * designation, and "∞ — [Ability]" as a static that gives the permanent its
 * ability only while it's harnessed — The Soul Stone (a cost that exiles a
 * creature, an upkeep trigger) and The Mind Stone (an end step blink).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  B,
  cast,
  destroy,
  lands,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const harnessSoul = (game: Game, stone: ObjectId, fuel: ObjectId): void => {
  game.dispatch({ type: "activate-ability", player: A, source: stone, abilityIndex: 1, targets: [], sacrifice: fuel });
  settle(game);
};

describe("The Soul Stone", () => {
  it("is indestructible, and the mana ability taps it for {B}", () => {
    const { game } = table();
    const stone = spawn(game, "The Soul Stone");
    activate(game, stone, 0);
    expect(game.state.players[A].manaPool.map((m) => m.type)).toEqual(["B"]);
    destroy(game, stone);
    expect(zone(game, stone)).toBe("battlefield");
  });

  it("does nothing at upkeep until it's harnessed, then returns a creature every upkeep", () => {
    const { game, a } = table();
    const stone = spawn(game, "The Soul Stone");
    const bear = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const fuel = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 7);

    // Not harnessed: her upkeep passes, nothing asked, nothing returned.
    const asked = watchTargets(a);
    nextTurn(game);
    nextTurn(game);
    expect(asked.asked).toBe(0);
    expect(zone(game, bear)).toBe("graveyard");
    expect(game.state.objects[stone].harnessed).toBeUndefined();

    // "{6}{B}, {T}, Exile a creature you control": exiled, not sacrificed.
    harnessSoul(game, stone, fuel);
    expect(zone(game, fuel)).toBe("exile");
    expect(game.state.objects[stone].harnessed).toBe(true);
    expect(game.viewFor(A).objects[stone].harnessed).toBe(true);

    pickTargets(a, bear);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, bear)).toBe("battlefield");

    // Every upkeep from now on, not the once.
    pickTargets(a, giant);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("is only its controller's upkeep", () => {
    const { game, a } = table();
    const stone = spawn(game, "The Soul Stone");
    const bear = toGraveyard(game, "Grizzly Bears");
    const fuel = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 7);
    harnessSoul(game, stone, fuel);
    const asked = watchTargets(a);
    toStep(game, "draw", B);
    expect(asked.asked).toBe(0);
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("stops being harnessed when it leaves the battlefield (701.64b)", () => {
    const { game, a } = table();
    const stone = spawn(game, "The Soul Stone");
    const fuel = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 7);
    harnessSoul(game, stone, fuel);
    expect(game.state.objects[stone].harnessed).toBe(true);

    lands(game, "Island", 2);
    cast(game, toHand(game, "Boomerang"), { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("hand");
    expect(game.state.objects[stone].harnessed).toBeUndefined();

    const bear = toGraveyard(game, "Grizzly Bears");
    const asked = watchTargets(a);
    nextTurn(game);
    nextTurn(game);
    expect(asked.asked).toBe(0);
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("The Mind Stone", () => {
  it("blinks up to one other nonland permanent you control at your end step, once harnessed", () => {
    const { game, a } = table();
    const stone = spawn(game, "The Mind Stone");
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const plains = lands(game, "Plains", 6);

    // Not harnessed: nothing at this end step.
    const before = watchTargets(a);
    toStep(game, "end");
    settle(game);
    expect(before.asked).toBe(0);
    nextTurn(game);
    nextTurn(game);

    activate(game, stone, 1);
    expect(game.state.objects[stone].harnessed).toBe(true);

    const stint = game.state.objects[bear].zoneChangeCount ?? 0;
    const offered = watchTargets(a, () => [bear]);
    toStep(game, "end");
    settle(game);
    expect(offered.offered[0]).toContain(bear);
    expect(offered.offered[0]).not.toContain(stone); // "other"
    expect(offered.offered[0]).not.toContain(theirs); // "you control"
    expect(offered.offered[0]).not.toContain(plains[0]); // "nonland"
    expect(zone(game, bear)).toBe("battlefield");
    expect(game.state.objects[bear].zoneChangeCount ?? 0).toBeGreaterThan(stint);
  });

  it("can blink nothing: up to one", () => {
    const { game, a } = table();
    const stone = spawn(game, "The Mind Stone");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    activate(game, stone, 1);
    const stint = game.state.objects[bear].zoneChangeCount ?? 0;
    const offered = watchTargets(a);
    toStep(game, "end");
    settle(game);
    expect(offered.asked).toBe(1);
    expect(game.state.objects[bear].zoneChangeCount ?? 0).toBe(stint);
  });

  it("harnessing what's already harnessed does nothing (701.64a)", () => {
    const { game } = table();
    const stone = spawn(game, "The Mind Stone");
    lands(game, "Plains", 12);
    activate(game, stone, 1);
    const events = game.state.turn.number;
    expect(game.state.objects[stone].harnessed).toBe(true);
    game.state.objects[stone].tapped = false;
    activate(game, stone, 1);
    expect(game.state.objects[stone].harnessed).toBe(true);
    expect(game.state.turn.number).toBe(events);
  });
});
