/**
 * Set walk batch 232, group D (2026-10-27): Invasion (INV), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Invasion, batch 2 group D", () => {
  it("Pure Reflection replaces the old Reflection with an X/X for the new spell's caster", () => {
    const { game } = table();
    spawn(game, "Pure Reflection");
    lands(game, "Forest", 2);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const first = named(game, "X/X Reflection Token (White)", A);
    expect(first.length).toBe(1);
    expect(pt(game, first[0])).toEqual({ power: 2, toughness: 2 });
    cast(game, toHand(game, "Savannah Lions"));
    const after = named(game, "X/X Reflection Token (White)", A);
    expect(after.length).toBe(1);
    expect(after[0]).not.toBe(first[0]);
    expect(pt(game, after[0])).toEqual({ power: 1, toughness: 1 });
  });

  it("Assault // Battery casts either half", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Assault // Battery"), { face: 1, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    cast(game, toHand(game, "Assault // Battery"), { face: 2 });
    expect(tokensNamed(game, "Elephant Token", A)).toBe(1);
  });

  it("Pain // Suffering: Pain makes a player discard, Suffering destroys a land", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 4);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Pain // Suffering"), { face: 1, targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    const land = spawn(game, "Forest", B);
    cast(game, toHand(game, "Pain // Suffering"), { face: 2, targets: [ref(land)] });
    expect(zone(game, land)).toBe("graveyard");
  });

  it("Lightning Dart deals 4 to a blue creature and 1 to another", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const drake = spawn(game, "Wind Drake", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Lightning Dart"), { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
    cast(game, toHand(game, "Lightning Dart"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });

  it("Hunting Kavu exiles itself and a creature attacking you", () => {
    const { game, b } = table();
    const kavu = spawn(game, "Hunting Kavu");
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && activePlayerOf(s) === B && s.priority.holder === A && s.zones.shared.stack.length === 0,
    );
    activate(game, kavu, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, kavu)).toBe("exile");
  });

  it("Prison Barricade, kicked, has a counter and can attack", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Prison Barricade"), { kicked: true });
    const wall = named(game, "Prison Barricade", A)[0];
    expect(pt(game, wall)).toEqual({ power: 2, toughness: 4 });
    game.state.objects[wall].summoningSick = false;
    a.declareAttackersFn = () => [{ attacker: wall, defender: B }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(life(game, B)).toBe(18);
  });

  it("Prison Barricade, unkicked, enters with no counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Prison Barricade"));
    const wall = named(game, "Prison Barricade", A)[0];
    expect(pt(game, wall)).toEqual({ power: 1, toughness: 3 });
  });

  it("Orim's Touch, kicked, prevents 4 damage", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Orim's Touch"), { targets: [ref(giant)], kicked: true });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("Plague Spores destroys a nonblack creature and a land", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B);
    const land = spawn(game, "Forest", B);
    cast(game, toHand(game, "Plague Spores"), { targets: [ref(giant), ref(land)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
  });

  it("Teferi's Care counters an enchantment spell", () => {
    const { game } = table();
    const care = spawn(game, "Teferi's Care");
    lands(game, "Island", 6);
    const target = spawn(game, "Grizzly Bears", B);
    // Alice holds priority with her own Pacifism on the stack.
    const pacifism = toHand(game, "Pacifism");
    lands(game, "Plains", 1);
    cast(game, pacifism, { targets: [ref(target)], settle: false });
    activate(game, care, 1, { targets: [ref(pacifism)] });
    settle(game);
    expect(graveyard(game, A)).toContain(pacifism);
  });
});
