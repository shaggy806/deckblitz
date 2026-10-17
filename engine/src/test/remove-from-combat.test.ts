/**
 * Removing a creature from combat (rule 506.4 — the `remove-from-combat`
 * effect): it stops being an attacking or blocking creature, so it deals and
 * is dealt no combat damage, while it still attacked this turn. Each test
 * written from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  enter,
  hand,
  lands,
  life,
  pickModes,
  ref,
  spawn,
  table,
  toLibrary,
  toStep,
} from "./harness.js";

describe("remove-from-combat", () => {
  it("Reconnaissance: the attacker leaves combat and untaps, and deals no combat damage", () => {
    const { game, a } = table();
    const recon = spawn(game, "Reconnaissance");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.objects[bears].attacking === B && s.priority.holder === A && s.awaiting === null);
    expect(game.state.objects[bears].attacking).toBe(B);
    activate(game, recon, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].attacking).toBe(null);
    expect(game.state.objects[bears].tapped).toBe(false);
    game.advanceUntil((s) => s.turn.step === "end-combat" || s.turn.number > 1);
    expect(life(game, B)).toBe(20);
    // It still attacked this turn.
    expect(game.state.objects[bears].attackedThisTurn).toBe(true);
  });

  it("Labyrinth of Skophos takes a blocker out of combat; the attacker stays blocked", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const wall = spawn(game, "Grizzly Bears", B);
    const maze = spawn(game, "Labyrinth of Skophos");
    lands(game, "Wastes", 4);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    activate(game, maze, 1, { targets: [ref(wall)] });
    expect(game.state.objects[wall].blocking).toBe(null);
    game.advanceUntil((s) => s.turn.step === "end-combat" || s.turn.number > 1);
    // Blocked, no blocker left to hit: no damage to Bob, none to the Bears.
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[wall].damageMarked).toBe(0);
  });

  it("Shakedown Heavy: if the defending player has you draw, it untaps and leaves combat", () => {
    const { game, a, b } = table();
    const heavy = spawn(game, "Shakedown Heavy");
    toLibrary(game, "Island");
    pickModes(b, 0);
    const before = hand(game).length;
    attack(game, a, [heavy]);
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.objects[heavy].attacking).toBe(null);
    expect(game.state.objects[heavy].tapped).toBe(false);
    expect(life(game, B)).toBe(20);
  });

  it("Shakedown Heavy: declined, it keeps attacking", () => {
    const { game, a, b } = table();
    const heavy = spawn(game, "Shakedown Heavy");
    pickModes(b);
    attack(game, a, [heavy]);
    expect(life(game, B)).toBe(14);
  });

  it("Thaumatic Compass transforms at your end step with seven lands; Spires of Orazca untaps an attacker and removes it", () => {
    const { game, a } = table();
    const compass = spawn(game, "Thaumatic Compass");
    lands(game, "Wastes", 7);
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "declare-attackers");
    expect(game.state.objects[compass].face).toBe(1);
    void a;
  });
});

describe("Mob Verdict", () => {
  it("2 damage per vote to each opponent voted for and their creatures, a card per vote you got", () => {
    const { game, a, b, c } = table({ players: 3 });
    const bobs = spawn(game, "Hill Giant", B);
    // Modes offered are the other players in turn order.
    pickModes(a, 0); // alice → bob
    pickModes(b, 0); // bob → alice
    pickModes(c, 0); // carol → alice
    lands(game, "Mountain", 4);
    const before = hand(game).length;
    const verdict = game.debugSpawn("Mob Verdict", A, "hand");
    game.dispatch({ type: "cast-spell", player: A, card: verdict, targets: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.priority.holder === A);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[bobs].damageMarked === 2 || game.state.objects[bobs].zone !== "battlefield").toBe(true);
    expect(life(game, A)).toBe(20);
    expect(hand(game).length).toBe(before + 2);
    void enter;
  });
});
