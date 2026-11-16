/**
 * "You may choose new targets for any number of other spells and/or
 * abilities" (rule 115.7d — Boltbender): `change-targets`' `"each-other"`,
 * every spell and ability on the stack but this one, whoever's, asked about
 * one at a time from the top, each answer kept or changed.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";

import { A, B, C, cast, lands, life, ref, spawn, table, toHand } from "./harness.js";

/** The holder passes until `player` has priority (the stack as it is). */
const passTo = (game: Game, player: PlayerId): void => {
  for (let i = 0; i < 8 && game.state.priority.holder !== player; i += 1) {
    const holder = game.state.priority.holder;
    if (holder === null) break;
    game.dispatch({ type: "pass-priority", player: holder });
  }
};
/** Everyone passes until a decision is up or the stack is `depth` deep. */
const passUntil = (game: Game, depth: number): void => {
  for (let i = 0; i < 24; i += 1) {
    if (game.state.awaiting !== null || game.state.zones.shared.stack.length <= depth) return;
    const holder = game.state.priority.holder;
    if (holder === null) return;
    game.dispatch({ type: "pass-priority", player: holder });
  }
};
const targetsOf = (game: Game, id: ObjectId): readonly (TargetRef | null | undefined)[] => game.state.objects[id].targets ?? [];

/** Alice's Boltbender cast face down, with mana for its disguise cost and a Shock. */
const faceDown = (game: Game): ObjectId => {
  lands(game, "Mountain", 7);
  const bender = toHand(game, "Boltbender");
  cast(game, bender, { via: "face-down" });
  expect(game.state.objects[bender].faceDown).toBeDefined();
  return bender;
};

describe("Boltbender", () => {
  it("turned face up, asks about each other spell and ability on the stack in turn, top first", () => {
    const { game } = table();
    const bender = faceDown(game);
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    // Alice's Shock at Bob, then Bob's Sorcerer pinging Alice on top of it.
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    passTo(game, B);
    game.dispatch({ type: "activate-ability", player: B, source: sorcerer, abilityIndex: 0, targets: [ref(A)] });
    const ping = game.state.zones.shared.stack[game.state.zones.shared.stack.length - 1];
    passTo(game, A);
    game.dispatch({ type: "turn-face-up", player: A, permanent: bender, morph: true });
    expect(game.state.zones.shared.stack).toHaveLength(3);
    passUntil(game, 2);
    // The ping first: Alice sends it at Bob.
    let awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.source).toBe(ping);
    expect(awaiting.player).toBe(A);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(B)] });
    expect(targetsOf(game, ping)).toEqual([ref(B)]);
    // Then the Shock: she keeps it at Bob.
    awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.source).toBe(shock);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(B)] });
    passUntil(game, 0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
  });

  it("asks nothing of a stack with no other targeted spell or ability", () => {
    const { game } = table();
    const bender = faceDown(game);
    game.dispatch({ type: "turn-face-up", player: A, permanent: bender, morph: true });
    passUntil(game, 0);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(game.state.objects[bender].faceDown).toBeUndefined();
  });

  it("reaches an opponent's spell in a 3-player game, and a kept target stays", () => {
    const { game } = table({ players: 3 });
    const bender = faceDown(game);
    const bears = spawn(game, "Grizzly Bears", A);
    passTo(game, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Mountain", 1, B);
    cast(game, bolt, { player: B, targets: [ref(bears)], settle: false });
    passTo(game, A);
    game.dispatch({ type: "turn-face-up", player: A, permanent: bender, morph: true });
    passUntil(game, 1);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-targets");
    if (awaiting?.kind !== "choose-targets") return;
    expect(awaiting.source).toBe(bolt);
    // The bolt at Carol instead.
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(C)] });
    passUntil(game, 0);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(life(game, C)).toBe(17);
  });
});
