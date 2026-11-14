/**
 * `activates-ability` from and of a graveyard card — Neerdiv, Devious
 * Diver's "whenever you cast a spell from your graveyard or activate an
 * ability of a card in your graveyard" (`sourceZone: "graveyard"`, read from
 * the `ability-activated` event's `fromZone`: where the card was as it was
 * activated, however its cost moved it), and Afterburner Expert's "whenever
 * you activate an exhaust ability, return this card from your graveyard to
 * the battlefield", a trigger that works only from the graveyard (rule
 * 113.6k).
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const NEERDIV = "Neerdiv, Devious Diver";

describe("Neerdiv, Devious Diver — a card in your graveyard", () => {
  it("activating a graveyard card's ability draws a card and puts a +1/+1 counter on it", () => {
    const { game } = table();
    const neerdiv = spawn(game, NEERDIV);
    lands(game, "Swamp", 3);
    const devotee = toGraveyard(game, "Abzan Devotee");
    const before = hand(game).length;
    activate(game, devotee, 1);
    expect(zone(game, devotee)).toBe("hand");
    // The Devotee itself, and the card Neerdiv drew.
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, neerdiv)).toBe(1);
  });

  it("counts an ability whose cost exiles the card from the graveyard (renew)", () => {
    const { game } = table();
    const neerdiv = spawn(game, NEERDIV);
    lands(game, "Swamp", 1);
    const croc = toGraveyard(game, "Adorned Crocodile");
    const before = hand(game).length;
    activate(game, croc, 0, { targets: [ref(neerdiv)] });
    expect(zone(game, croc)).toBe("exile");
    expect(hand(game).length).toBe(before + 1);
    // One from Neerdiv's trigger, one from renew.
    expect(counters(game, neerdiv)).toBe(2);
  });

  it("casting a spell from your graveyard triggers it", () => {
    const { game } = table();
    const neerdiv = spawn(game, NEERDIV);
    lands(game, "Island", 3);
    const twice = toGraveyard(game, "Think Twice");
    const before = hand(game).length;
    const flashback = game.legalActions(A).find((l) => l.kind === "cast-spell" && l.card === twice);
    if (flashback?.kind !== "cast-spell") throw new Error("no flashback offered");
    cast(game, twice, { via: flashback.via });
    expect(zone(game, twice)).toBe("exile");
    expect(hand(game).length).toBe(before + 2);
    expect(counters(game, neerdiv)).toBe(1);
  });

  it("not an ability of a permanent, nor cycling from a hand", () => {
    const { game } = table();
    const neerdiv = spawn(game, NEERDIV);
    lands(game, "Mountain", 4);
    const specialist = spawn(game, "Prowcatcher Specialist");
    activate(game, specialist, 0);
    expect(counters(game, specialist)).toBe(2);
    lands(game, "Plains", 2);
    const cycler = toHand(game, "Renewed Faith");
    game.dispatch({ type: "cycle", player: A, card: cycler });
    settle(game);
    expect(zone(game, cycler)).toBe("graveyard");
    expect(counters(game, neerdiv)).toBe(0);
  });

  it("not an opponent's activation from their graveyard", () => {
    const { game } = table();
    const neerdiv = spawn(game, NEERDIV);
    lands(game, "Swamp", 3, B);
    const devotee = toGraveyard(game, "Abzan Devotee", B);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, devotee, 1, { player: B });
    expect(zone(game, devotee)).toBe("hand");
    expect(counters(game, neerdiv)).toBe(0);
  });

  it("becoming tapped mills the target player cards equal to its power", () => {
    const { game, a } = table();
    const neerdiv = spawn(game, NEERDIV);
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(neerdiv)]);
    settle(game);
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Afterburner Expert — returns from the graveyard on an exhaust", () => {
  it("activating an exhaust ability returns it from your graveyard", () => {
    const { game } = table();
    const expert = toGraveyard(game, "Afterburner Expert");
    lands(game, "Mountain", 4);
    const specialist = spawn(game, "Prowcatcher Specialist");
    activate(game, specialist, 0);
    expect(zone(game, expert)).toBe("battlefield");
    expect(counters(game, specialist)).toBe(2);
  });

  it("not another ability, and not from the battlefield", () => {
    const { game } = table();
    const buried = toGraveyard(game, "Afterburner Expert");
    lands(game, "Swamp", 3);
    activate(game, toGraveyard(game, "Abzan Devotee"), 1);
    expect(zone(game, buried)).toBe("graveyard");
    const expert = spawn(game, "Afterburner Expert");
    lands(game, "Forest", 4);
    activate(game, expert, 0);
    expect(counters(game, expert)).toBe(2);
    // The one in the graveyard saw the exhaust; the one on the battlefield
    // isn't where its trigger works.
    expect(zone(game, buried)).toBe("battlefield");
  });
});
