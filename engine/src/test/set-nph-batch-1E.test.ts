/**
 * New Phyrexia / Commander 2011, group E (batch 194): the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Martyr's Bond", () => {
  it("makes each opponent sacrifice a permanent sharing a type — for another permanent and for itself", () => {
    const { game } = table();
    const bond = spawn(game, "Martyr's Bond", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", B);
    const wastes = spawn(game, "Forsaken Wastes", B);
    destroy(game, bears);
    expect(zone(game, bobBears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, wastes)).toBe("battlefield");
    destroy(game, bond);
    expect(zone(game, wastes)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Acorn Catapult", () => {
  it("gives the Squirrel to the damaged creature's controller, even when the damage kills it", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const catapult = spawn(game, "Acorn Catapult", A);
    const elf = spawn(game, "Llanowar Elves", B);
    activate(game, catapult, 0, { targets: [ref(elf)] });
    expect(zone(game, elf)).toBe("graveyard");
    expect(tokensNamed(game, "Squirrel Token", B)).toBe(1);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(0);
  });

  it("gives it to a targeted player", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const catapult = spawn(game, "Acorn Catapult", A);
    activate(game, catapult, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "Squirrel Token", B)).toBe(1);
  });
});

describe("Reaper of Sheoldred", () => {
  it("gives the damage source's controller a poison counter", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    spawn(game, "Reaper of Sheoldred", B);
    const reaper = game.battlefield.find((id) => game.state.objects[id].cardName === "Reaper of Sheoldred")!;
    cast(game, toHand(game, "Shock"), { targets: [ref(reaper)] });
    expect(game.state.players[A].counters?.poison ?? 0).toBe(1);
    expect(game.state.players[B].counters?.poison ?? 0).toBe(0);
  });
});

describe("Fresh Meat", () => {
  it("counts the creatures put into your graveyard this turn, not an opponent's", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    destroy(game, spawn(game, "Grizzly Bears", A));
    destroy(game, spawn(game, "Grizzly Bears", A));
    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, toHand(game, "Fresh Meat"));
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(2);
  });
});

describe("Arm with Aether", () => {
  it("lets a creature that damages an opponent bounce that player's creature", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", A);
    const bobBears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Arm with Aether"));
    pickTargets(a, bobBears);
    pickModes(a, 0);
    attack(game, a, [bears]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bobBears)).toBe("hand");
  });
});

describe("Viridian Betrayers", () => {
  it("has infect only while an opponent is poisoned", () => {
    const { game } = table();
    const betrayers = spawn(game, "Viridian Betrayers", A);
    expect(keywords(game, betrayers).has("infect")).toBe(false);
    game.debugApplyEffect(A, {
      kind: "add-player-counters",
      counter: "poison",
      amount: 1,
      who: "each-opponent",
    } as EffectSpec);
    settle(game);
    expect(keywords(game, betrayers).has("infect")).toBe(true);
  });
});

describe("Mortis Dogs", () => {
  it("makes the target lose life equal to its power as it last existed", () => {
    const { game, a } = table();
    const dogs = spawn(game, "Mortis Dogs", A);
    game.debugApplyEffect(
      A,
      { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" } as EffectSpec,
      [ref(dogs)],
    );
    pickTargets(a, B);
    destroy(game, dogs);
    expect(life(game, B)).toBe(16);
  });
});
