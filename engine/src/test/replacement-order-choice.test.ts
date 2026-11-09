/**
 * The `replacement-order` decision (rule 616.1): the affected player, or the
 * affected object's controller, chooses which of several replacement or
 * prevention effects applies first — asked only when the order can change
 * what happens, and left to the best order for them by a bot.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { invalidateComputedCache } from "../characteristics.js";
import type { ReplacementOrderOffer, ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, attack, cast, counters, lands, ref, spawn, table, toHand } from "./harness.js";

/** Answers each question with the option whose name is `pick`, noting them. */
function answering(seat: ScriptedController, pick: string): ReplacementOrderOffer[] {
  const asked: ReplacementOrderOffer[] = [];
  seat.chooseReplacementOrderFn = (_view, offer) => {
    asked.push(offer);
    return Math.max(0, offer.options.findIndex((o) => o.name === pick));
  };
  return asked;
}

const bolt = (game: Game, target: PlayerId | ObjectId): void => {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(target)] });
};

/** Alice's Heal: the next 1 damage to `target` is prevented. */
const heal = (game: Game, target: PlayerId | ObjectId): void => {
  lands(game, "Plains", 1);
  cast(game, toHand(game, "Heal"), { targets: [ref(target)] });
};

describe("damage: the affected player chooses the order (616.1)", () => {
  it("the permanent's controller is asked, named by the cards, and can take the worse order", () => {
    const { game, b } = table();
    spawn(game, "Furnace of Rath", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    heal(game, dreadmaw);
    const asked = answering(b, "Furnace of Rath");
    bolt(game, dreadmaw);
    expect(asked).toHaveLength(1);
    expect(asked[0].options.map((o) => o.name).sort()).toEqual(["Furnace of Rath", "Heal"]);
    // 3 doubled, less the shield's 1.
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
    expect(game.state.replacementAnswers).toBeUndefined();
  });

  it("left alone, the answer is the best order for them", () => {
    const { game, b } = table();
    spawn(game, "Furnace of Rath", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    heal(game, dreadmaw);
    const asked: ReplacementOrderOffer[] = [];
    b.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      return offer.best;
    };
    bolt(game, dreadmaw);
    expect(asked).toHaveLength(1);
    expect(asked[0].options[asked[0].best].name).toBe("Heal");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(4);
  });

  it("no question when the order changes nothing that matters", () => {
    const { game, b } = table();
    spawn(game, "Furnace of Rath", A);
    spawn(game, "Furnace of Rath", A);
    const asked = answering(b, "Furnace of Rath");
    bolt(game, B);
    expect(asked).toHaveLength(0);
    expect(game.state.players[B].life).toBe(20 - 12);
  });

  it("combat damage asks before any is dealt, one question for the hits sharing its effects", () => {
    const { game, a, b } = table();
    spawn(game, "Furnace of Rath", A);
    const one = spawn(game, "Grizzly Bears", A, { sick: false });
    const two = spawn(game, "Grizzly Bears", A, { sick: false });
    heal(game, B);
    const asked = answering(b, "Furnace of Rath");
    attack(game, a, [one, two]);
    expect(asked).toHaveLength(1);
    // Furnace first on each: 4 and 4, the shield taking 1 of the first.
    expect(game.state.players[B].life).toBe(20 - 7);
  });
});

const BLACK_BOLT = "Test Black Bolt";
const blackBolt = defineCard({
  name: BLACK_BOLT,
  manaCost: "{0}",
  colors: ["B"],
  types: ["instant"],
  text: "Test Black Bolt deals 3 damage to each creature.",
  effect: { kind: "damage-all", amount: 3, filter: { type: "creature" } },
});
const SHIELDED = "Test Phantom";
const shielded = defineCard({
  name: SHIELDED,
  manaCost: "{0}",
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: "Protection from black\nIf damage would be dealt to this creature, prevent that damage and put a +1/+1 counter on it.",
  static: [
    { affects: { scope: "self" }, protection: { colors: ["B"] }, text: "Protection from black" },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        instead: { prevent: true, then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 }, perEvent: true },
        to: "self",
      },
      text: "If damage would be dealt to this creature, prevent that damage and put a +1/+1 counter on it.",
    },
  ],
});

describe("protection beside a creature's own damage replacement (616.1)", () => {
  it("left alone, protection goes first and the creature's own follow-up doesn't happen", () => {
    const { game } = table();
    game.registry.register(blackBolt);
    game.registry.register(shielded);
    const phantom = spawn(game, SHIELDED, B);
    cast(game, toHand(game, BLACK_BOLT), {});
    expect(counters(game, phantom)).toBe(0);
    expect(game.state.objects[phantom].damageMarked).toBe(0);
  });

  it("its controller can take the replacement first", () => {
    const { game, b } = table();
    game.registry.register(blackBolt);
    game.registry.register(shielded);
    const phantom = spawn(game, SHIELDED, B);
    const asked: ReplacementOrderOffer[] = [];
    b.chooseReplacementOrderFn = (_view, offer) => {
      asked.push(offer);
      return offer.options.findIndex((o) => !o.text.includes("protection"));
    };
    cast(game, toHand(game, BLACK_BOLT), {});
    expect(asked).toHaveLength(1);
    expect(counters(game, phantom)).toBe(1);
  });
});

const doomBlade = (game: Game, target: ObjectId): void => {
  lands(game, "Swamp", 2);
  cast(game, toHand(game, "Doom Blade"), { targets: [ref(target)] });
};

describe("what would save a permanent from being destroyed (616.1)", () => {
  it("regeneration shield or shield counter: its controller chooses", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].regenerationShields = 1;
    game.state.objects[bears].counters.shield = 1;
    const asked = answering(b, "Shield counter");
    doomBlade(game, bears);
    expect(asked).toHaveLength(1);
    expect(counters(game, bears, "shield")).toBe(0);
    expect(game.state.objects[bears].regenerationShields).toBe(1);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });

  it("left alone, the regeneration shield goes first", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].regenerationShields = 1;
    game.state.objects[bears].counters.shield = 1;
    doomBlade(game, bears);
    expect(counters(game, bears, "shield")).toBe(1);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("a lone shield counter asks nothing", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters.shield = 1;
    const asked = answering(b, "Shield counter");
    doomBlade(game, bears);
    expect(asked).toHaveLength(0);
    expect(counters(game, bears, "shield")).toBe(0);
  });

  const withUmbras = (game: Game): { readonly host: ObjectId; readonly boar: ObjectId; readonly hyena: ObjectId } => {
    const host = spawn(game, "Grizzly Bears", B);
    const boar = spawn(game, "Boar Umbra", B);
    const hyena = spawn(game, "Hyena Umbra", B);
    game.state.objects[boar].attachedTo = host;
    game.state.objects[hyena].attachedTo = host;
    invalidateComputedCache();
    return { host, boar, hyena };
  };

  it("two Auras with umbra armor: its controller picks which goes, from a destroy effect", () => {
    const { game, b } = table();
    const { host, boar, hyena } = withUmbras(game);
    const asked = answering(b, "Boar Umbra");
    doomBlade(game, host);
    expect(asked).toHaveLength(1);
    expect(game.state.objects[boar].zone).toBe("graveyard");
    expect(game.state.objects[hyena].zone).toBe("battlefield");
    expect(game.state.objects[host].zone).toBe("battlefield");
  });

  it("and from lethal damage, a state-based action", () => {
    const { game, b } = table();
    const { host, boar, hyena } = withUmbras(game);
    const asked = answering(b, "Hyena Umbra");
    lands(game, "Mountain", 1);
    // 6 is lethal through Boar Umbra's and Hyena Umbra's bonuses.
    game.state.objects[host].damageMarked = 40;
    invalidateComputedCache();
    bolt(game, B);
    expect(asked).toHaveLength(1);
    expect(game.state.objects[hyena].zone).toBe("graveyard");
    expect(game.state.objects[boar].zone).toBe("battlefield");
    expect(game.state.objects[host].zone).toBe("battlefield");
  });

  it("an umbra beside a regeneration shield: the Aura can be the one that goes", () => {
    const { game, b } = table();
    const host = spawn(game, "Grizzly Bears", B);
    const hyena = spawn(game, "Hyena Umbra", B);
    game.state.objects[hyena].attachedTo = host;
    game.state.objects[host].regenerationShields = 1;
    invalidateComputedCache();
    const asked = answering(b, "Hyena Umbra");
    doomBlade(game, host);
    expect(asked).toHaveLength(1);
    expect(game.state.objects[hyena].zone).toBe("graveyard");
    expect(game.state.objects[host].regenerationShields).toBe(1);
  });
});

describe("overlapping damage redirections (616.1)", () => {
  it("the player dealt the damage chooses which redirection takes it", () => {
    const { game, a } = table();
    const first = spawn(game, "Colossal Dreadmaw", A);
    const second = spawn(game, "Hill Giant", A);
    const grace = (host: ObjectId): void => {
      lands(game, "Plains", 2);
      cast(game, toHand(game, "Saving Grace"), { targets: [ref(host)] });
    };
    grace(first);
    grace(second);
    const asked = answering(a, "Saving Grace");
    bolt(game, A);
    expect(asked).toHaveLength(1);
    expect(game.state.players[A].life).toBe(20);
    expect(game.state.objects[first].damageMarked + game.state.objects[second].damageMarked).toBe(3);
  });
});
