// "Target player adds …" — `add-mana`'s `target` (The Warring Triad, Radiant
// Lotus). An ability with a target isn't a mana ability (rule 605.5a): it goes
// on the stack, its controller chooses the colour as it resolves (608.2d), and
// the player in the slot gets the mana.
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { A, B, activate, graveyard, pickModes, ref, settle, spawn, table, toGraveyard, types, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const poolOf = (game: Game, player: PlayerId): string[] => game.state.players[player].manaPool.map((unit) => unit.type);

describe("The Warring Triad", () => {
  it("isn't a creature with fewer than eight cards in your graveyard, and is one at eight", () => {
    const { game } = table();
    const triad = spawn(game, "The Warring Triad");
    expect(types(game, triad)).not.toContain("creature");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    expect(types(game, triad)).not.toContain("creature");
    toGraveyard(game, "Wastes");
    expect(types(game, triad)).toContain("creature");
    // Another player's graveyard doesn't count.
    const other = table();
    const theirs = spawn(other.game, "The Warring Triad");
    for (let i = 0; i < 8; i += 1) toGraveyard(other.game, "Wastes", B);
    expect(types(other.game, theirs)).not.toContain("creature");
  });

  it("mills a card to pay, uses the stack, and the target player adds the colour its controller chose", () => {
    const { game, a, b } = table();
    const triad = spawn(game, "The Warring Triad");
    const top = game.state.zones.perPlayer[A].library[0];
    let chooser: PlayerId | null = null;
    a.chooseModesFn = () => {
      chooser = A;
      return [3];
    };
    b.chooseModesFn = () => {
      chooser = B;
      return [0];
    };
    activate(game, triad, 0, { targets: [ref(B)], settle: false });
    // Paid: the card is milled, and the ability waits on the stack.
    expect(zone(game, top)).toBe("graveyard");
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(poolOf(game, B)).toEqual([]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(chooser).toBe(A);
    expect(poolOf(game, B)).toEqual(["R"]);
    expect(poolOf(game, A)).toEqual([]);
  });

  it("is never offered as a mana ability, and can target its controller", () => {
    const { game, a } = table();
    const triad = spawn(game, "The Warring Triad");
    const offer = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === triad);
    expect(offer).toBeDefined();
    expect((offer as { manaAbility?: boolean }).manaAbility).not.toBe(true);
    pickModes(a, 4);
    activate(game, triad, 0, { targets: [ref(A)] });
    expect(poolOf(game, A)).toEqual(["G"]);
  });
});

describe("Radiant Lotus", () => {
  const LOTUS = 0;

  it("sacrifices one or more artifacts and the target player adds three of one chosen colour for each", () => {
    const { game, a } = table();
    const lotus = spawn(game, "Radiant Lotus");
    const sol = spawn(game, "Sol Ring");
    const signet = spawn(game, "Arcane Signet");
    pickModes(a, 1);
    game.dispatch({ type: "activate-ability", player: A, source: lotus, abilityIndex: LOTUS, targets: [ref(B)], xValue: 2 } as Action);
    // The two artifacts are chosen as the cost is paid — the Lotus itself may be one.
    const awaiting = game.state.awaiting;
    if (awaiting?.kind !== "sacrifice") throw new Error(`expected a sacrifice, got ${awaiting?.kind}`);
    expect(awaiting.count).toBe(2);
    expect([...awaiting.eligible].sort()).toEqual([lotus, sol, signet].sort());
    game.dispatch({ type: "sacrifice", player: A, permanents: [lotus, sol] });
    expect(graveyard(game)).toEqual(expect.arrayContaining([lotus, sol]));
    expect(game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    expect(poolOf(game, B)).toEqual(["U", "U", "U", "U", "U", "U"]);
    expect(poolOf(game, A)).toEqual([]);
    expect(zone(game, signet)).toBe("battlefield");
  });

  it("can't be activated sacrificing none", () => {
    const { game } = table();
    const lotus = spawn(game, "Radiant Lotus");
    expect(() =>
      game.dispatch({ type: "activate-ability", player: A, source: lotus, abilityIndex: LOTUS, targets: [ref(B)], xValue: 0 } as Action),
    ).toThrow();
    expect(zone(game, lotus)).toBe("battlefield");
  });

  it("adds nothing if its target player has left the game", () => {
    const { game, a } = table({ players: 3 });
    const lotus = spawn(game, "Radiant Lotus");
    pickModes(a, 0);
    game.dispatch({ type: "activate-ability", player: A, source: lotus, abilityIndex: LOTUS, targets: [ref(B)], xValue: 1 } as Action);
    if (game.state.awaiting?.kind === "sacrifice") game.dispatch({ type: "sacrifice", player: A, permanents: [lotus] });
    game.concede(B);
    settle(game);
    expect(poolOf(game, A)).toEqual([]);
  });
});
