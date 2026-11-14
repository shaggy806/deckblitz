import { describe, expect, it } from "vitest";
import { A, B, C, attack, hand, settle, spawn, table, toStep } from "./harness.js";

// "At the beginning of the monarch's end step" — a `step-begins` trigger with
// `who: "monarch"` (rule 725): it fires on the end step of whoever is the
// monarch as it begins, and "that player" is the active player.

describe("Archivist of Gondor — the monarch's end step", () => {
  it("the monarch draws on their own end step — the monarch's draw and the Archivist's", () => {
    const { game } = table();
    spawn(game, "Archivist of Gondor");
    game.state.monarch = B;
    toStep(game, "postcombat-main", B);
    const before = hand(game, B).length;
    toStep(game, "end", B);
    settle(game);
    expect(hand(game, B).length).toBe(before + 2);
  });

  it("nobody draws on a player's end step who isn't the monarch", () => {
    const { game } = table();
    spawn(game, "Archivist of Gondor");
    game.state.monarch = B;
    toStep(game, "postcombat-main", A);
    const [mine, theirs] = [hand(game, A).length, hand(game, B).length];
    toStep(game, "end", A);
    settle(game);
    expect(hand(game, A).length).toBe(mine);
    expect(hand(game, B).length).toBe(theirs);
  });

  it("with no monarch, it does nothing", () => {
    const { game } = table();
    spawn(game, "Archivist of Gondor");
    toStep(game, "postcombat-main", A);
    const before = hand(game, A).length;
    toStep(game, "end", A);
    settle(game);
    expect(hand(game, A).length).toBe(before);
    expect(game.state.monarch).toBe(null);
  });
});

describe("Archivist of Gondor — your commander's combat damage", () => {
  it("makes you the monarch when your commander deals combat damage to a player, if there's none", () => {
    const { game, a } = table();
    spawn(game, "Archivist of Gondor");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    attack(game, a, [commander]);
    expect(game.state.monarch).toBe(A);
  });

  it("a creature that isn't your commander doesn't", () => {
    const { game, a } = table();
    spawn(game, "Archivist of Gondor");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(game.state.monarch).toBe(null);
  });

  it("doesn't take the crown from a monarch already there", () => {
    // Carol is the monarch; alice's commander hits Bob, who isn't, so the
    // monarch's own combat-damage rule doesn't move the crown either.
    const { game, a } = table({ players: 3 });
    spawn(game, "Archivist of Gondor");
    game.state.monarch = C;
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    attack(game, a, [commander], B);
    expect(game.state.monarch).toBe(C);
  });
});
