/**
 * A multiplier of only some tokens (`ofTokens`, `token-replacements.ts`):
 * Ojer Taq, Deepest Foundation's "three times that many" creature tokens, and
 * its back face.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, destroy, lands, nextTurn, ref, settle, spawn, table, tokensNamed } from "./harness.js";
import type { Game } from "../game.js";

const make = (game: Game, token: string, count = 1, player = A): void => {
  game.debugApplyEffect(player, { kind: "create-token", token, count });
  settle(game);
};

describe("three times that many creature tokens", () => {
  it("triples creature tokens and leaves the others alone", () => {
    const { game } = table();
    spawn(game, "Ojer Taq, Deepest Foundation");
    make(game, "Goblin Token", 2);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(6);
    make(game, "Treasure Token");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("only its controller's", () => {
    const { game } = table();
    spawn(game, "Ojer Taq, Deepest Foundation", B);
    make(game, "Goblin Token");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
  });

  it("a token copy of a creature, by what the copy would be", () => {
    const { game } = table();
    spawn(game, "Ojer Taq, Deepest Foundation");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(3);
  });

  it("multiplies with a doubler either way", () => {
    const { game } = table();
    spawn(game, "Ojer Taq, Deepest Foundation");
    spawn(game, "Anointed Procession");
    make(game, "Goblin Token");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(6);
    make(game, "Treasure Token");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("applies after what makes a creature token of the event (rule 616.1): Chatterfang's Squirrel", () => {
    const { game } = table();
    spawn(game, "Ojer Taq, Deepest Foundation");
    spawn(game, "Chatterfang, Squirrel General");
    make(game, "Treasure Token");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(3);
  });

  it("two of them are nine times", () => {
    const { game } = table();
    spawn(game, "Mirror Gallery");
    spawn(game, "Ojer Taq, Deepest Foundation");
    spawn(game, "Ojer Taq, Deepest Foundation");
    make(game, "Goblin Token");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(9);
  });
});

describe("Ojer Taq's other faces", () => {
  it("dies, returns tapped and transformed under its owner's control", () => {
    const { game } = table();
    const ojer = spawn(game, "Ojer Taq, Deepest Foundation");
    destroy(game, ojer);
    settle(game);
    expect(game.state.objects[ojer].zone).toBe("battlefield");
    expect(game.state.objects[ojer].face).toBe(1);
    expect(game.state.objects[ojer].tapped).toBe(true);
    make(game, "Goblin Token");
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
  });

  it("Temple of Civilization transforms only after three attackers", () => {
    const { game, a } = table();
    const ojer = spawn(game, "Ojer Taq, Deepest Foundation");
    destroy(game, ojer);
    settle(game);
    game.state.objects[ojer].tapped = false;
    lands(game, "Plains", 3);
    const offer = { type: "activate-ability", player: A, source: ojer, abilityIndex: 1, targets: [] } as const;
    expect(game.canDispatch(offer)).not.toBeNull();
    attack(game, a, [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")]);
    expect(game.canDispatch(offer)).not.toBeNull();
    nextTurn(game);
    nextTurn(game);
    game.state.objects[ojer].tapped = false;
    attack(game, a, [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")]);
    expect(game.canDispatch(offer)).toBeNull();
    activate(game, ojer, 1);
    expect(game.state.objects[ojer].face).toBe(0);
  });
});
