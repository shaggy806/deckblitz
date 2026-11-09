/**
 * Rule 616.1 for counters and life gain: where an effect's event can wait and the order changes
 * what happens, the permanent's controller or the player gaining chooses, through the
 * `replacement-order` decision.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { ReplacementOrderOffer, ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, life, ref, settle, spawn, table } from "./harness.js";

const adder = defineCard({
  name: "Test Counter Adder",
  types: ["artifact"],
  text: "",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "",
    },
  ],
});
const shrinker = defineCard({
  name: "Test Counter Shrinker",
  types: ["artifact"],
  text: "",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "",
    },
  ],
});
const healer = defineCard({
  name: "Test Life Gainer",
  types: ["artifact"],
  text: "",
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: "",
    },
  ],
});
const registry = createDefaultRegistry().register(adder).register(shrinker).register(healer);

function answering(seat: ScriptedController, pick: string): ReplacementOrderOffer[] {
  const asked: ReplacementOrderOffer[] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer);
    return Math.max(0, offer.options.findIndex((o) => o.name === pick));
  };
  return asked;
}
const plusOnes = (game: Game, id: ObjectId): number => game.state.objects[id].counters["+1/+1"] ?? 0;
const put = (game: Game, id: ObjectId, card = "Test Counter Adder"): void => {
  activate(game, spawn(game, card, A), 0, { targets: [ref(id)] });
  settle(game);
};
const gain = (game: Game): void => {
  activate(game, spawn(game, "Test Life Gainer", A), 0);
  settle(game);
};

describe("counters: the permanent's controller chooses the order (616.1)", () => {
  it("is asked by the cards, and can take the order that puts fewer", () => {
    const { game, a } = table({ registry });
    spawn(game, "Hardened Scales", A);
    spawn(game, "Doubling Season", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const asked = answering(a, "Doubling Season");
    put(game, bear);
    expect(asked).toHaveLength(1);
    expect(asked[0].options.map((o) => o.name).sort()).toEqual(["Doubling Season", "Hardened Scales"]);
    // 1 doubled, plus 1.
    expect(plusOnes(game, bear)).toBe(3);
    expect(game.state.replacementAnswers).toBeUndefined();
  });

  it("left alone, the answer is the most counters", () => {
    const { game, a } = table({ registry });
    spawn(game, "Hardened Scales", A);
    spawn(game, "Doubling Season", A);
    const bear = spawn(game, "Grizzly Bears", A);
    a.chooseReplacementOrderFn = (_view, offer) => offer.best;
    put(game, bear);
    expect(plusOnes(game, bear)).toBe(4);
  });

  it("the asked one is whoever controls the permanent, not who puts them", () => {
    const { game, a, b } = table({ registry });
    spawn(game, "Hardened Scales", B);
    spawn(game, "Doubling Season", B);
    const bear = spawn(game, "Grizzly Bears", B);
    const mine = answering(a, "Doubling Season");
    const theirs = answering(b, "Hardened Scales");
    put(game, bear);
    expect(mine).toHaveLength(0);
    expect(theirs).toHaveLength(1);
  });

  it("nothing is asked when the order changes nothing", () => {
    const { game, a } = table({ registry });
    spawn(game, "Doubling Season", A);
    spawn(game, "Doubling Season", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const asked = answering(a, "Doubling Season");
    put(game, bear);
    expect(asked).toHaveLength(0);
    expect(plusOnes(game, bear)).toBe(4);
  });

  it("-1/-1: the best order is the fewest", () => {
    const { game, a } = table({ registry });
    spawn(game, "Hardened Scales", A);
    spawn(game, "Doubling Season", A);
    const bear = spawn(game, "Colossal Dreadmaw", A);
    a.chooseReplacementOrderFn = (_view, offer) => offer.best;
    put(game, bear, "Test Counter Shrinker");
    // Hardened Scales only sees +1/+1 counters: one effect applies, no question.
    expect(game.state.objects[bear].counters["-1/-1"]).toBe(2);
  });
});

describe("life gain: the player gaining chooses the order (616.1)", () => {
  it("is asked, and can take the order that loses more", () => {
    const { game, a } = table({ registry });
    spawn(game, "Rhox Faithmender", A);
    spawn(game, "Tainted Remedy", B);
    const asked = answering(a, "Rhox Faithmender");
    gain(game);
    expect(asked).toHaveLength(1);
    expect(life(game, A)).toBe(16);
  });

  it("left alone, the gain becomes a loss before anything grows it", () => {
    const { game, a } = table({ registry });
    spawn(game, "Rhox Faithmender", A);
    spawn(game, "Tainted Remedy", B);
    a.chooseReplacementOrderFn = (_view, offer) => offer.best;
    gain(game);
    expect(life(game, A)).toBe(18);
  });

  it("nothing is asked for one replacement, and it still applies", () => {
    const { game, a } = table({ registry });
    spawn(game, "Rhox Faithmender", A);
    const asked = answering(a, "Rhox Faithmender");
    gain(game);
    expect(asked).toHaveLength(0);
    expect(life(game, A)).toBe(24);
  });
});
