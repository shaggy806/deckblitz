/**
 * "As an additional cost to cast this spell, sacrifice a creature or sacrifice a modified
 * creature. … If the modified creature was sacrificed, draw a card" (Lethal Throwdown): which
 * branch of a choice of additional costs was paid (rule 601.2b) is kept on the spell
 * (`GameObject.costOptionPaid`) and read by the `self-cost-option-paid` condition — the branch,
 * not what the sacrificed creature happened to be. A copy has it too (rule 707.10).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  hand,
  lands,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const THROWDOWN = "Lethal Throwdown";

describe("Lethal Throwdown", () => {
  it("sacrificing a modified creature for the second cost destroys the target and draws", () => {
    const { game } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    const fodder = spawn(game, "Hill Giant", A);
    game.state.objects[fodder].counters = { "+1/+1": 1 };
    lands(game, "Swamp", 1);
    const spell = toHand(game, THROWDOWN);
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(victim)], costOption: 1, sacrifice: fodder });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, fodder)).toBe("graveyard");
    // The spell left the hand, a card was drawn.
    expect(hand(game).length).toBe(before);
  });

  it("a modified creature sacrificed for the first cost draws nothing", () => {
    const { game } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    const fodder = spawn(game, "Hill Giant", A);
    game.state.objects[fodder].counters = { "+1/+1": 1 };
    lands(game, "Swamp", 1);
    const spell = toHand(game, THROWDOWN);
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(victim)], costOption: 0, sacrifice: fodder });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, fodder)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1);
  });

  it("the second cost takes only a modified creature", () => {
    const { game } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Hill Giant", A);
    lands(game, "Swamp", 1);
    const spell = toHand(game, THROWDOWN);
    expect(() => cast(game, spell, { targets: [ref(victim)], costOption: 1, sacrifice: plain })).toThrow();
    expect(zone(game, plain)).toBe("battlefield");
    const offers = game
      .legalActions(A)
      .filter((x) => x.kind === "cast-spell" && x.card === spell)
      .map((x) => (x.kind === "cast-spell" ? x.costOptionText : undefined));
    expect(offers).toContain("Sacrifice a creature");
    expect(offers).not.toContain("Sacrifice a modified creature");
  });

  it("the paid branch is kept on the spell while it's on the stack", () => {
    const { game } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    const fodder = spawn(game, "Hill Giant", A);
    game.state.objects[fodder].counters = { "+1/+1": 1 };
    lands(game, "Swamp", 1);
    const spell = toHand(game, THROWDOWN);
    cast(game, spell, { targets: [ref(victim)], costOption: 1, sacrifice: fodder, settle: false });
    expect(game.state.objects[spell].costOptionPaid).toBe(1);
  });

  it("a copy has the cost its original paid (rule 707.10), and draws too", () => {
    const { game, a } = table();
    const victim = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Savannah Lions", B);
    const fodder = spawn(game, "Hill Giant", A);
    game.state.objects[fodder].counters = { "+1/+1": 1 };
    lands(game, "Swamp", 1);
    lands(game, "Island", 2);
    const spell = toHand(game, THROWDOWN);
    toHand(game, "Twincast");
    const twincast = hand(game).at(-1)!;
    cast(game, spell, { targets: [ref(victim)], costOption: 1, sacrifice: fodder, settle: false });
    const before = hand(game).length;
    a.chooseModesFn = () => [0];
    a.chooseTargetsFn = () => [ref(other)];
    cast(game, twincast, { targets: [ref(spell)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, other)).toBe("graveyard");
    // Twincast left the hand; the copy and the original each drew.
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});
