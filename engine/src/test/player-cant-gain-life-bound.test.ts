/**
 * "Can't gain life" for one named player (rule 119.7): the `gain-life`
 * prohibition a resolved effect binds, "for the rest of the game" (Screaming
 * Nemesis, Stigma Lasher), and a resolved "gains no life instead" kept on one
 * player (Flames of the Blood Hand).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  destroy,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  spawn,
  table,
  toHand,
} from "./harness.js";

/** `player` gains 3 life from Healing Salve, cast by alice. */
const salve = (game: Game, player: PlayerId): void => {
  lands(game, "Plains", 1);
  cast(game, toHand(game, "Healing Salve"), { targets: [ref(player)], modes: [0] });
};

const ready = (game: Game, name: string, player: PlayerId = A): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id].summoningSick = false;
  return id;
};

/** Alice shocks `id`. */
const shock = (game: Game, id: ObjectId): void => {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Shock"), { targets: [ref(id)] });
};

describe("Stigma Lasher: that player can't gain life for the rest of the game", () => {
  it("binds the player it hit, nobody else, and outlives it", () => {
    const { game, a } = table({ players: 3 });
    const lasher = ready(game, "Stigma Lasher");
    attack(game, a, [lasher], B);
    expect(life(game, B)).toBe(18);
    salve(game, B);
    expect(life(game, B)).toBe(18);
    salve(game, C);
    expect(life(game, C)).toBe(23);
    salve(game, A);
    expect(life(game, A)).toBe(23);

    destroy(game, lasher);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    salve(game, B);
    expect(life(game, B)).toBe(18);
  });

  it("no exchange that would raise that player's life total (rule 119.7)", () => {
    const { game, a } = table();
    const lasher = ready(game, "Stigma Lasher");
    attack(game, a, [lasher], B);
    game.debugApplyEffect(A, { kind: "exchange-life-totals", second: { target: 0 } }, [ref(B)], { source: lasher });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });
});

describe("Screaming Nemesis: if a player is dealt damage this way", () => {
  it("that player can't gain life for the rest of the game", () => {
    const { game, a } = table();
    const nemesis = spawn(game, "Screaming Nemesis");
    pickTargets(a, B);
    shock(game, nemesis);
    expect(life(game, B)).toBe(18);
    salve(game, B);
    expect(life(game, B)).toBe(18);
  });

  it("a creature dealt damage this way binds nobody", () => {
    const { game, a } = table();
    const nemesis = spawn(game, "Screaming Nemesis");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    shock(game, nemesis);
    salve(game, B);
    expect(life(game, B)).toBe(23);
    expect(game.state.emblems.filter((e) => e.static?.prohibits !== undefined)).toEqual([]);
  });

  it("prevented damage isn't dealt: nobody is bound (rule 615.1)", () => {
    const { game, a } = table();
    const nemesis = spawn(game, "Screaming Nemesis");
    game.debugApplyEffect(
      B,
      { kind: "replacement-effect", replacement: { event: "would-deal-damage", instead: { prevent: true } }, duration: "end-of-turn", players: "you" },
      [],
      { source: spawn(game, "Island", B) },
    );
    pickTargets(a, B);
    shock(game, nemesis);
    expect(life(game, B)).toBe(20);
    salve(game, B);
    expect(life(game, B)).toBe(23);
  });
});

describe("Flames of the Blood Hand: gains no life instead, this turn", () => {
  it("on the player targeted, and it's gone next turn; the damage can't be prevented", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flames of the Blood Hand"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    salve(game, B);
    expect(life(game, B)).toBe(16);
    salve(game, C);
    expect(life(game, C)).toBe(23);
    nextTurn(game);
    lands(game, "Plains", 1, B);
    cast(game, toHand(game, "Healing Salve", B), { player: B, targets: [ref(B)], modes: [0] });
    expect(life(game, B)).toBe(19);
  });

  it("on a planeswalker's controller", () => {
    const { game } = table();
    const walker = spawn(game, "Jace Beleren", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flames of the Blood Hand"), { targets: [ref(walker)] });
    salve(game, B);
    expect(life(game, B)).toBe(20);
    salve(game, A);
    expect(life(game, A)).toBe(23);
  });

  it("is a replacement, not a can't: an exchange still happens (rule 119.7)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const source = spawn(game, "Island");
    game.state.players[A].life = 30;
    cast(game, toHand(game, "Flames of the Blood Hand"), { targets: [ref(B)] });
    game.debugApplyEffect(A, { kind: "exchange-life-totals", second: { target: 0 } }, [ref(B)], { source });
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(16);
  });
});
