/**
 * Urza's Saga (USG; B198), group B. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Imaginary Pet", () => {
  it("returns to hand at your upkeep while you have a card in hand", () => {
    const { game } = table();
    const pet = spawn(game, "Imaginary Pet");
    expect(hand(game, A).length).toBeGreaterThan(0);
    nextTurn(game); // bob's turn: not alice's upkeep
    expect(zone(game, pet)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, pet)).toBe("hand");
  });
});

describe("Viashino Sandswimmer", () => {
  it("leaves the battlefield either way: to hand on a win, to the graveyard on a loss", () => {
    const { game } = table();
    const lizard = spawn(game, "Viashino Sandswimmer");
    lands(game, "Mountain", 1);
    activate(game, lizard);
    expect(["hand", "graveyard"]).toContain(zone(game, lizard));
  });
});

describe("Power Taint", () => {
  it("costs the enchanted enchantment's controller 2 life at their upkeep unless they pay {2}", () => {
    const { game, b } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    const taint = spawn(game, "Power Taint");
    game.state.objects[taint].attachedTo = anthem;
    pickModes(b); // declines to pay
    nextTurn(game); // bob's upkeep
    expect(life(game, B)).toBe(18);
    nextTurn(game); // alice's upkeep: nothing
    expect(life(game, A)).toBe(20);
  });

  it("costs nothing when they pay", () => {
    const { game, b } = table();
    const anthem = spawn(game, "Glorious Anthem", B);
    const taint = spawn(game, "Power Taint");
    game.state.objects[taint].attachedTo = anthem;
    lands(game, "Wastes", 2, B);
    pickModes(b, 0);
    nextTurn(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("Sulfuric Vapors", () => {
  it("adds 1 to a red spell's damage", () => {
    const { game } = table();
    spawn(game, "Sulfuric Vapors", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Endless Wurm", () => {
  it("is kept by sacrificing an enchantment, and sacrificed without one", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Endless Wurm");
    const anthem = spawn(game, "Glorious Anthem");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game); // alice's upkeep
    expect(zone(game, anthem)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game); // no enchantment left
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Spined Fluke", () => {
  it("makes you sacrifice a creature as it enters", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    enter(game, "Spined Fluke");
    expect(named(game, "Grizzly Bears", A).length + named(game, "Spined Fluke", A).length).toBe(1);
  });
});
