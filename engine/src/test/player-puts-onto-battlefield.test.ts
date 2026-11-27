/**
 * "Whenever a player puts an Island or blue permanent onto the battlefield,
 * that player sacrifices …" (Nature's Wrath, Tourach's Chant, Thelon's Chant —
 * the `enters-battlefield` trigger's `putBy`, read from `EntryRecord.putBy`):
 * the player who put it there is the one playing it (rule 305.1), else the
 * controller of what is resolving (608.2c; a permanent spell's own, 608.3a),
 * and "that player" is them — not always the one it enters under.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, cast, counters, lands, life, nextTurn, pickModes, ref, settle, spawn, table, toHand, zone } from "./harness.js";

function play(game: Game, name: string, player: PlayerId): ObjectId {
  const card = toHand(game, name, player);
  game.dispatch({ type: "play-land", player, card });
  settle(game);
  return card;
}

describe("Nature's Wrath", () => {
  it("a player who plays an Island sacrifices an Island or blue permanent of their choice", () => {
    const { game, b } = table();
    spawn(game, "Nature's Wrath", A);
    const [old] = lands(game, "Island", 1, B);
    nextTurn(game);
    let offered: readonly ObjectId[] = [];
    b.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [old!];
    };
    const fresh = play(game, "Island", B);
    expect(offered).toContain(fresh);
    expect(zone(game, old!)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
  });

  it("a black permanent spell resolving: its caster sacrifices a Swamp or black permanent", () => {
    const { game, b } = table();
    spawn(game, "Nature's Wrath", A);
    const swamps = lands(game, "Swamp", 2, B);
    nextTurn(game);
    const bats = toHand(game, "Vampire Bats", B);
    let offered: readonly ObjectId[] = [];
    b.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [swamps[0]!];
    };
    cast(game, bats, { player: B });
    expect([...offered].sort()).toEqual([...swamps, bats].sort());
    expect(zone(game, swamps[0]!)).toBe("graveyard");
    expect(zone(game, bats)).toBe("battlefield");
  });

  it("returned under its owner's control by another player's spell: that player is the one who sacrifices", () => {
    const { game, a } = table();
    spawn(game, "Nature's Wrath", A);
    lands(game, "Plains", 2, A);
    const [island] = lands(game, "Island", 1, A);
    const drake = spawn(game, "Wind Drake", B);
    a.chooseSacrificesFn = (_view, eligible) => eligible.slice(0, 1);
    cast(game, toHand(game, "Flicker of Fate", A), { targets: [ref(drake)] });
    const back = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Wind Drake");
    expect(back).toBeDefined();
    expect(game.state.objects[back!].controller).toBe(B);
    expect(zone(game, island!)).toBe("graveyard");
  });

  it("a Forest or green permanent sets off neither ability", () => {
    const { game } = table();
    spawn(game, "Nature's Wrath", A);
    nextTurn(game);
    const forest = play(game, "Forest", B);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("its upkeep: sacrificed unless {G} is paid", () => {
    const { game, a } = table();
    const wrath = spawn(game, "Nature's Wrath", A);
    lands(game, "Forest", 1, A);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, wrath)).toBe("battlefield");
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, wrath)).toBe("graveyard");
  });
});

describe("Tourach's Chant and Thelon's Chant", () => {
  it("a player with no creature who plays a Forest is dealt 3 damage", () => {
    const { game } = table();
    spawn(game, "Tourach's Chant", A);
    nextTurn(game);
    play(game, "Forest", B);
    expect(life(game, B)).toBe(17);
  });

  it("they may put a -1/-1 counter on a creature they control instead", () => {
    const { game, b } = table();
    spawn(game, "Tourach's Chant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(b, 0);
    play(game, "Forest", B);
    expect(life(game, B)).toBe(20);
    expect(counters(game, bears, "-1/-1")).toBe(1);
  });

  it("declining the counter is the damage", () => {
    const { game, b } = table();
    spawn(game, "Thelon's Chant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    pickModes(b);
    play(game, "Swamp", B);
    expect(life(game, B)).toBe(17);
    expect(counters(game, bears, "-1/-1")).toBe(0);
  });

  it("its controller's own Forest counts too", () => {
    const { game } = table();
    spawn(game, "Tourach's Chant", A);
    play(game, "Forest", A);
    expect(life(game, A)).toBe(17);
  });
});
