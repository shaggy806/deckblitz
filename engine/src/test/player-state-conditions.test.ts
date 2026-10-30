import { describe, expect, it } from "vitest";

import { staticConditionMet } from "../characteristics.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  hand,
  life,
  lands,
  named,
  pickTargets,
  pt,
  ref,
  registryOf,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

type Game = ReturnType<typeof table>["game"];

/** `player`'s hand cut down to `n` cards (the rest to the graveyard). */
function handOf(game: Game, player: PlayerId, n: number): void {
  while (hand(game, player).length > n) game.debugMove(hand(game, player)[0], "graveyard");
}

describe("of-player: a condition read from another player's seat", () => {
  it("reads the active player's hand at each opponent's upkeep (Lavaborn Muse)", () => {
    const { game } = table();
    spawn(game, "Lavaborn Muse");
    handOf(game, B, 2);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("does nothing when that player has three cards (Lavaborn Muse)", () => {
    const { game } = table();
    spawn(game, "Lavaborn Muse");
    handOf(game, B, 3);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(20);
  });

  it("is asked again as it resolves (rule 603.4)", () => {
    const { game } = table();
    spawn(game, "Lavaborn Muse");
    handOf(game, B, 2);
    // A card back in Bob's hand while the trigger waits: three on resolution.
    toStep(game, "upkeep", B);
    expect(game.state.zones.shared.stack.length).toBe(1);
    toHand(game, "Wastes", B);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(20);
  });

  it("reads the defending player as an attack trigger's that player (Septic Rats)", () => {
    const { game, a } = table();
    const rats = spawn(game, "Septic Rats");
    game.state.players[B].counters.poison = 1;
    a.declareAttackersFn = () => [{ attacker: rats, defender: B }];
    toStep(game, "declare-blockers", A);
    expect(pt(game, rats)).toEqual({ power: 3, toughness: 3 });
  });

  it("doesn't trigger against an unpoisoned defender (Septic Rats)", () => {
    const { game, a } = table();
    const rats = spawn(game, "Septic Rats");
    attack(game, a, [rats]);
    // Two infect damage: poison, not +1/+1.
    expect(game.state.players[B].counters.poison).toBe(2);
  });

  it("reads a target player's life (Hidetsugu's Second Rite)", () => {
    const { game, a } = table();
    game.state.players[B].life = 10;
    lands(game, "Mountain", 4);
    pickTargets(a, B);
    cast(game, toHand(game, "Hidetsugu's Second Rite"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(0);
  });

  it("does nothing at any other life total (Hidetsugu's Second Rite)", () => {
    const { game } = table();
    game.state.players[B].life = 11;
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Hidetsugu's Second Rite"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
  });

  it("reads that player's turn stats (Lolth's emblem, Davros)", () => {
    const { game } = table();
    const muse = spawn(game, "Lavaborn Muse");
    game.state.players[B].lifeLostThisTurn = 3;
    const lost = (atLeast: number) =>
      ({
        kind: "of-player",
        player: "that-player",
        condition: { kind: "turn-stat", stat: "life-lost", who: "you", atLeast },
      }) as const;
    const met = (atLeast: number, thatPlayer: PlayerId) =>
      staticConditionMet(game.state, registryOf(game), game.state.objects[muse], lost(atLeast), { thatPlayer });
    expect(met(3, B)).toBe(true);
    expect(met(4, B)).toBe(false);
    expect(met(1, A)).toBe(false);
  });

  it("reads 'if there is no monarch'", () => {
    const { game } = table();
    const muse = spawn(game, "Lavaborn Muse");
    const nobody = { kind: "monarch", who: "nobody" } as const;
    const met = () => staticConditionMet(game.state, registryOf(game), game.state.objects[muse], nobody);
    expect(met()).toBe(true);
    game.state.monarch = B;
    expect(met()).toBe(false);
  });

  it("is false on a static ability, which has no that player", () => {
    const { game } = table();
    const muse = spawn(game, "Lavaborn Muse");
    handOf(game, B, 0);
    const condition = { kind: "of-player", player: "that-player", condition: { kind: "hand-size", atMost: 2 } } as const;
    expect(staticConditionMet(game.state, registryOf(game), game.state.objects[muse], condition)).toBe(false);
    expect(
      staticConditionMet(game.state, registryOf(game), game.state.objects[muse], condition, { thatPlayer: B }),
    ).toBe(true);
  });
});

describe("for-each-player's whoIf: each player who …", () => {
  it("draws only for the players who control a multicolored creature (Depopulate)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Watchwolf", B);
    const handB = hand(game, B).length;
    const handC = hand(game, C).length;
    const handA = hand(game, A).length;
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Depopulate"));
    expect(hand(game, A).length).toBe(handA);
    expect(hand(game, B).length).toBe(handB + 1);
    expect(hand(game, C).length).toBe(handC);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(named(game, "Watchwolf")).toHaveLength(0);
  });

  it("fixes the players tied for the most before anyone sacrifices (Tectonic Hellion)", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 4, A);
    lands(game, "Plains", 4, B);
    lands(game, "Island", 3, C);
    const hellion = spawn(game, "Tectonic Hellion");
    attack(game, a, [hellion]);
    // Alice and Bob were tied with four each and both sacrificed two; Carol's
    // three became the most only after, too late to count.
    expect(named(game, "Mountain", A)).toHaveLength(2);
    expect(named(game, "Plains", B)).toHaveLength(2);
    expect(named(game, "Island", C)).toHaveLength(3);
  });
});

describe("player-compare: one number against other players'", () => {
  it("does each part whose comparison holds (Sunset Revelry)", () => {
    const { game } = table();
    game.state.players[B].life = 25;
    spawn(game, "Grizzly Bears", B);
    handOf(game, A, 0);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Sunset Revelry"));
    expect(life(game, A)).toBe(24);
    expect(tokensNamed(game, "Human Token", A)).toBe(2);
    expect(hand(game, A).length).toBe(1);
  });

  it("does nothing when no opponent has more (Sunset Revelry)", () => {
    const { game } = table();
    handOf(game, B, 0);
    lands(game, "Plains", 2);
    const revelry = toHand(game, "Sunset Revelry");
    const before = hand(game, A).length;
    cast(game, revelry);
    expect(life(game, A)).toBe(20);
    expect(tokensNamed(game, "Human Token", A)).toBe(0);
    expect(hand(game, A).length).toBe(before - 1);
  });

  it("compares the active player against every other player (Rivalry)", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Rivalry");
    lands(game, "Plains", 3, B);
    lands(game, "Island", 2, C);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(18);
    toStep(game, "draw", C);
    expect(life(game, C)).toBe(20);
  });

  it("isn't more on a tie (Rivalry)", () => {
    const { game } = table();
    spawn(game, "Rivalry");
    lands(game, "Plains", 3, A);
    lands(game, "Plains", 3, B);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(20);
  });
});

describe("life against the starting life total", () => {
  it("activates only at 7 or more above starting life (Speaker of the Heavens)", () => {
    const { game } = table();
    const speaker = spawn(game, "Speaker of the Heavens");
    game.state.players[A].life = 26;
    expect(() => activate(game, speaker)).toThrow();
    game.state.players[A].life = 27;
    activate(game, speaker);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
  });

  it("reads Commander's 40 as the starting life (Righteous Valkyrie)", () => {
    const { game } = table({ life: 40 });
    const valkyrie = spawn(game, "Righteous Valkyrie");
    game.state.players[A].life = 46;
    expect(pt(game, valkyrie)).toEqual({ power: 2, toughness: 4 });
    game.state.players[A].life = 47;
    expect(pt(game, valkyrie)).toEqual({ power: 4, toughness: 6 });
  });
});

describe("controls with anyController: permanents on the battlefield", () => {
  it("counts every player's creatures (Planar Collapse)", () => {
    const { game } = table();
    const collapse = spawn(game, "Planar Collapse");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "draw", A);
    toStep(game, "draw", A);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(zone(game, collapse)).toBe("graveyard");
  });

  it("does nothing with three (Planar Collapse)", () => {
    const { game } = table();
    const collapse = spawn(game, "Planar Collapse");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "draw", A);
    toStep(game, "draw", A);
    expect(named(game, "Grizzly Bears")).toHaveLength(3);
    expect(zone(game, collapse)).toBe("battlefield");
  });

  it("can't attack until five Islands are on the battlefield, anyone's (Harbor Serpent)", () => {
    const { game } = table();
    const serpent = spawn(game, "Harbor Serpent");
    lands(game, "Island", 2, A);
    lands(game, "Island", 2, B);
    expect(game.characteristics(serpent).restrictions).toContain("cant-attack");
    lands(game, "Island", 1, B);
    expect(game.characteristics(serpent).restrictions).not.toContain("cant-attack");
  });
});
