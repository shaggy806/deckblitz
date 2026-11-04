/**
 * `would-lose-life` (rule 614.1a): Bloodletter of Aclazotz's "if an opponent
 * would lose life during your turn, they lose twice that much life instead".
 * Every loss is one (rule 119), through `Game.changeLife`; the damage dealt
 * stays what it was (the card's ruling).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, enter, grant, lands, life, nextTurn, pickTargets, ref, spawn, table, toHand } from "./harness.js";

const letter = (game: ReturnType<typeof table>["game"]) => spawn(game, "Bloodletter of Aclazotz", A);

describe("Bloodletter of Aclazotz", () => {
  it("doubles what an effect has an opponent lose, and what was lost this way reads the doubled amount", () => {
    const { game } = table();
    letter(game);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Exsanguinate"), { x: 2 });
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("doubles the loss from damage, and lifelink still gains only what was dealt", () => {
    const { game, a } = table();
    letter(game);
    const bears = spawn(game, "Grizzly Bears", A);
    grant(game, bears, "lifelink");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(22);
  });

  it("leaves your own loss alone, and an opponent's on another player's turn", () => {
    const { game } = table();
    letter(game);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Night's Whisper"));
    expect(life(game, A)).toBe(18);
    nextTurn(game); // Bob's
    lands(game, "Swamp", 2, B);
    cast(game, toHand(game, "Night's Whisper", B), { player: B });
    expect(life(game, B)).toBe(18);
  });

  it("doubles a life payment, which they needed only the amount paid to make (rule 119.4)", () => {
    const { game } = table();
    letter(game);
    const confluence = spawn(game, "Mana Confluence", B);
    game.state.players[B].life = 1;
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, confluence, 0, { player: B, settle: false });
    expect(game.state.objects[confluence].tapped).toBe(true);
    expect(life(game, B)).toBe(-1);
  });

  it("two of them double it twice", () => {
    const { game } = table();
    letter(game);
    letter(game);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(8);
  });

  it("doubles the loss a gain became (Tainted Remedy)", () => {
    const { game } = table();
    letter(game);
    spawn(game, "Tainted Remedy", A);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Rest for the Weary"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(12);
  });

  it("doubles what a life total set lower loses (rule 119.5)", () => {
    const { game, a } = table();
    letter(game);
    pickTargets(a, B);
    enter(game, "Magister Sphinx");
    expect(life(game, B)).toBe(0); // 20 to 10 is a loss of 10, doubled
  });

  it("doubles a loss from an exchange of life totals, and the gain stays (rule 701.12c)", () => {
    const { game } = table();
    letter(game);
    game.state.players[A].life = 10;
    game.state.players[B].life = 16; // A gains 6; B would lose 6, and loses 12
    lands(game, "Swamp", 6);
    activate(game, spawn(game, "Soul Conduit", A), 0, { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(4);
  });

  it("a trigger on the loss sees the doubled amount", () => {
    const { game } = table();
    letter(game);
    spawn(game, "Exquisite Blood", A);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(26);
  });

  it("comes before a floor on damage, the order the player losing would take (Angel's Grace)", () => {
    const { game } = table();
    letter(game);
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1, B);
    game.state.players[B].life = 5;
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, toHand(game, "Angel's Grace", B), { player: B });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(1);
  });
});
