/**
 * `EnterInstead`: "If this land would enter, sacrifice a Plains instead. If you
 * do, put this land onto the battlefield. If you don't, put it into its
 * owner's graveyard" (Kjeldoran Outpost, Scorched Ruins), "you may discard a
 * land card instead" (Mox Diamond), and the same with no way to fail ("instead
 * sacrifice each other permanent named …" — Sheltered Valley; "As this
 * enchantment enters, sacrifice all lands you control" — Overlaid Terrain).
 * Asked before it moves however it enters (rule 614.12), as much as possible
 * of a number (rule 609.3).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, lands, pickFromZone, pickPermanents, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameEvent } from "../events.js";

const playLand = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "play-land", player: A, card });
  settle(game);
};

/** The events from here on, for what an entry did or didn't announce. */
const watch = (game: Game): (() => readonly GameEvent[]) => {
  const from = game.state.eventLog.length;
  return () => game.state.eventLog.slice(from);
};

describe("sacrifice a [filter] instead (Kjeldoran Outpost)", () => {
  it("with one Plains, it goes without asking and the land enters", () => {
    const { game } = table();
    const [plains] = lands(game, "Plains", 1);
    const outpost = toHand(game, "Kjeldoran Outpost");
    playLand(game, outpost);
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, outpost)).toBe("battlefield");
  });

  it("with several, its controller chooses which", () => {
    const { game, a } = table();
    const [first, second] = lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const seen = pickPermanents(a, second);
    const outpost = toHand(game, "Kjeldoran Outpost");
    playLand(game, outpost);
    expect(seen.offered).toEqual([first, second]);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, outpost)).toBe("battlefield");
  });

  it("with none, it never enters: it's in the graveyard, the land play used, nothing announced", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const outpost = toHand(game, "Kjeldoran Outpost");
    const seen = watch(game);
    playLand(game, outpost);
    expect(zone(game, outpost)).toBe("graveyard");
    expect(seen().some((e) => e.type === "land-played")).toBe(true);
    expect(seen().some((e) => e.type === "permanent-entered-battlefield" && e.object === outpost)).toBe(false);
    expect(game.state.players[A].landsPlayedThisTurn).toBe(1);
  });

  it("applies however it enters, not only played (rule 614.12): put there by an effect, with a sacrifice", () => {
    const { game, a } = table();
    const atlas = spawn(game, "Walking Atlas");
    const [plains] = lands(game, "Plains", 1);
    const outpost = toHand(game, "Kjeldoran Outpost");
    pickFromZone(a, outpost);
    activate(game, atlas, 0);
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, outpost)).toBe("battlefield");
  });

  it("only its own controller's permanents go", () => {
    const { game } = table();
    const theirs = spawn(game, "Plains", B);
    const outpost = toHand(game, "Kjeldoran Outpost");
    playLand(game, outpost);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, outpost)).toBe("graveyard");
  });
});

describe("two untapped lands (Scorched Ruins)", () => {
  it("counts only untapped lands, and chooses among them", () => {
    const { game, a } = table();
    const tapped = spawn(game, "Island", A, { tapped: true });
    const [x, y, z] = lands(game, "Island", 3);
    const seen = pickPermanents(a, x, z);
    const ruins = toHand(game, "Scorched Ruins");
    playLand(game, ruins);
    expect(seen.offered).toEqual([x, y, z]);
    expect(seen.offered).not.toContain(tapped);
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, z)).toBe("graveyard");
    expect(zone(game, y)).toBe("battlefield");
    expect(zone(game, ruins)).toBe("battlefield");
  });

  it("with exactly two they both go; with one it goes and the Ruins don't enter (rule 609.3)", () => {
    const two = table();
    lands(two.game, "Island", 2);
    const ruins = toHand(two.game, "Scorched Ruins");
    playLand(two.game, ruins);
    expect(zone(two.game, ruins)).toBe("battlefield");
    expect(two.game.state.zones.perPlayer[A].graveyard.length).toBe(2);

    const one = table();
    const [only] = lands(one.game, "Island", 1);
    const short = toHand(one.game, "Scorched Ruins");
    playLand(one.game, short);
    expect(zone(one.game, only)).toBe("graveyard");
    expect(zone(one.game, short)).toBe("graveyard");
  });

  it("the sacrifices are one event, before it's there (each sees only what's left)", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const seen = watch(game);
    const ruins = toHand(game, "Scorched Ruins");
    playLand(game, ruins);
    const order = seen().flatMap((e) =>
      e.type === "permanent-sacrificed" ? ["sacrificed"] : e.type === "permanent-entered-battlefield" ? ["entered"] : [],
    );
    expect(order).toEqual(["sacrificed", "sacrificed", "entered"]);
  });
});

describe("you may discard a land card instead (Mox Diamond)", () => {
  it("discarding, it enters, and the land is in the graveyard", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const land = toHand(game, "Island");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, land);
    const mox = toHand(game, "Mox Diamond");
    cast(game, mox);
    expect(seen.offered).toEqual([land]);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, mox)).toBe("battlefield");
  });

  it("declining, it goes to the graveyard and nothing sees it arrive (its ruling)", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const land = toHand(game, "Island");
    pickFromZone(a);
    const mox = toHand(game, "Mox Diamond");
    const seen = watch(game);
    cast(game, mox);
    expect(zone(game, land)).toBe("hand");
    expect(zone(game, mox)).toBe("graveyard");
    expect(seen().some((e) => e.type === "permanent-entered-battlefield" && e.object === mox)).toBe(false);
  });

  it("with no land card in hand, it isn't asked and goes to the graveyard", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    const mox = toHand(game, "Mox Diamond");
    cast(game, mox);
    expect(zone(game, mox)).toBe("graveyard");
  });

  it("returned from a graveyard, it stays there unless a land is discarded (Refurbish)", () => {
    const declining = table({ deck: "Grizzly Bears" });
    lands(declining.game, "Plains", 4);
    const mox = toGraveyard(declining.game, "Mox Diamond");
    toHand(declining.game, "Island");
    pickFromZone(declining.a);
    const first = toHand(declining.game, "Refurbish");
    cast(declining.game, first, { targets: [ref(mox)] });
    expect(zone(declining.game, mox)).toBe("graveyard");

    const paying = table({ deck: "Grizzly Bears" });
    lands(paying.game, "Plains", 4);
    const again = toGraveyard(paying.game, "Mox Diamond");
    const land = toHand(paying.game, "Island");
    pickFromZone(paying.a, land);
    const second = toHand(paying.game, "Refurbish");
    cast(paying.game, second, { targets: [ref(again)] });
    expect(zone(paying.game, again)).toBe("battlefield");
    expect(zone(paying.game, land)).toBe("graveyard");
  });

  it("a Clone copying it has to do the same, as what it's becoming (rule 614.12)", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    lands(game, "Island", 3);
    spawn(game, "Mox Diamond");
    a.chooseCopyFn = (_v, _s, options) => options[0] ?? null;
    pickFromZone(a); // declines to discard
    const steel = toHand(game, "Sculpting Steel");
    toHand(game, "Island");
    cast(game, steel);
    expect(zone(game, steel)).toBe("graveyard");
  });
});

describe("no way to fail: it enters whatever there was", () => {
  it("sacrifices each other one of the name, then enters (Sheltered Valley)", () => {
    const { game } = table();
    const old = spawn(game, "Sheltered Valley");
    const island = spawn(game, "Island");
    const valley = toHand(game, "Sheltered Valley");
    playLand(game, valley);
    expect(zone(game, old)).toBe("graveyard");
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, valley)).toBe("battlefield");
  });

  it("enters with none to sacrifice (Sheltered Valley)", () => {
    const { game } = table();
    const valley = toHand(game, "Sheltered Valley");
    playLand(game, valley);
    expect(zone(game, valley)).toBe("battlefield");
  });

  it("gains 1 life each upkeep only at three or fewer lands (Sheltered Valley)", () => {
    const few = table();
    const valley = toHand(few.game, "Sheltered Valley");
    playLand(few.game, valley);
    const life = few.game.state.players[A].life;
    few.game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(few.game.state.players[A].life).toBe(life + 1);
  });

  it("sacrifices all your lands as it enters, and new lands have its ability (Overlaid Terrain)", () => {
    const { game } = table();
    const mine = lands(game, "Forest", 4);
    const theirs = spawn(game, "Forest", B);
    const terrain = toHand(game, "Overlaid Terrain");
    cast(game, terrain);
    for (const land of mine) expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, terrain)).toBe("battlefield");
    // A new land taps for its own mana or for two of a colour.
    const next = toHand(game, "Forest");
    playLand(game, next);
    const granted = game
      .legalActions(A)
      .filter((o) => o.kind === "activate-ability" && o.source === next && o.manaAbility === true);
    expect(granted.length).toBeGreaterThan(0);
  });
});
