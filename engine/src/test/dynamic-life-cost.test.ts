/**
 * An ability's life cost read as it's paid (rule 118.4; `AbilityCost.payLife`
 * as an `AbilityLifeCost`): half your life rounded up (Lurking Evil, Murderous
 * Betrayal), X (Krumar Initiate), and so much for each counter on it (Tornado).
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  counters,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  tokensNamed,
  zone,
} from "./harness.js";
import { abilityLifeCost } from "../abilities.js";

describe("pay half your life, rounded up", () => {
  it("Lurking Evil: 21 life pays 11, and it becomes a 4/4 flying creature that's no enchantment", () => {
    const { game } = table({ life: 21 });
    const evil = spawn(game, "Lurking Evil");
    activate(game, evil);
    expect(life(game, A)).toBe(10);
    expect(pt(game, evil)).toEqual({ power: 4, toughness: 4 });
    // Next time, half of what's left.
    activate(game, evil);
    expect(life(game, A)).toBe(5);
  });

  it("at zero or less life it costs nothing (its ruling)", () => {
    const { game } = table();
    const cost = { mana: null, tap: false, payLife: "half-rounded-up" } as const;
    const at = (n: number) => {
      game.state.players[A].life = n;
      return abilityLifeCost(game.state, A, cost);
    };
    expect(at(0)).toBe(0);
    expect(at(-3)).toBe(0);
    expect(at(1)).toBe(1);
    expect(at(7)).toBe(4);
  });

  it("Murderous Betrayal: {B}{B} and half your life destroys a nonblack creature", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const betrayal = spawn(game, "Murderous Betrayal");
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, betrayal, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(10);
  });
});

describe("pay X life (Krumar Initiate)", () => {
  it("X is capped by the life there is, and pays it", () => {
    const { game, a } = table({ life: 3 });
    lands(game, "Swamp", 6);
    const initiate = spawn(game, "Krumar Initiate");
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === initiate) as { xCost?: { maxX: number } } | undefined;
    expect(offer?.xCost?.maxX).toBe(3);
    pickModes(a, 0);
    activate(game, initiate, 0, { x: 2 });
    expect(life(game, A)).toBe(1);
    expect(counters(game, initiate, "+1/+1")).toBe(2);
    expect(pt(game, initiate)).toEqual({ power: 4, toughness: 4 });
  });

  it("makes an X/X Spirit the other way", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const initiate = spawn(game, "Krumar Initiate");
    pickModes(a, 1);
    activate(game, initiate, 0, { x: 3 });
    expect(life(game, A)).toBe(17);
    expect(tokensNamed(game, "Spirit Token (Abzan Monument)")).toBe(1);
    const spirit = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Spirit Token (Abzan Monument)",
    );
    expect(pt(game, spirit as never)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("pay N life for each … (Tornado)", () => {
  it("Tornado's first activation costs no life, its next 3, then 6", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    const tornado = spawn(game, "Tornado");
    const one = spawn(game, "Grizzly Bears", B);
    activate(game, tornado, 0, { targets: [ref(one)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(counters(game, tornado, "velocity")).toBe(1);
    // Only once each turn.
    const two = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, tornado, 0, { targets: [ref(two)] })).toThrow();
  });

  it("Tornado with two velocity counters costs 6 life, the cost read as it's paid", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const tornado = spawn(game, "Tornado");
    game.state.objects[tornado].counters.velocity = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, tornado, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(14);
    expect(counters(game, tornado, "velocity")).toBe(3);
  });

  it("can't pay more life than you have", () => {
    const { game } = table({ life: 5 });
    lands(game, "Forest", 3);
    const tornado = spawn(game, "Tornado");
    game.state.objects[tornado].counters.velocity = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, tornado, 0, { targets: [ref(bears)] })).toThrow(/life/);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
