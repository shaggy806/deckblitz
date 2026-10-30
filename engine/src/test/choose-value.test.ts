/**
 * A value chosen as a spell or ability resolves (`choose-value`) — a colour
 * (Persecute, Sudden Demise), a card type (Blood Oath, Fertile
 * Imagination), a number (Void, the `choose-number` decision) or a kind of
 * counter on a target (Ichormoon Gauntlet) — kept for the rest of the
 * resolution; and `reveal-hand`, whose cards a later effect counts.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { decisionCandidates } from "../bot/decisions.js";
import { HeuristicBotController } from "../controller.js";
import { colorToName } from "../land-colors.js";
import {
  A,
  B,
  cast,
  counters,
  enter,
  lands,
  life,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};

describe("choose a colour as it resolves", () => {
  it("is asked as the spell resolves, not as it's cast, and discards that colour (Persecute)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const persecute = toHand(game, "Persecute");
    const bolt = toHand(game, "Lightning Bolt", B);
    const helix = toHand(game, "Lightning Helix", B);
    const bear = toHand(game, "Grizzly Bears", B);
    const forest = toHand(game, "Forest", B);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "R";
    };
    cast(game, persecute, { targets: [ref(B)], settle: false });
    // On the stack, nothing asked yet: the colour waits for resolution.
    expect(game.state.awaiting?.kind).not.toBe("choose-creature-type");
    expect(offered).toEqual([]);
    settle(game);
    expect(offered).toEqual(["W", "U", "B", "R", "G"]);
    // A multicoloured card is "of that color" too.
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, helix)).toBe("graveyard");
    expect(zone(game, bear)).toBe("hand");
    const revealed = game.events.flatMap((e) => (e.type === "cards-revealed" && e.player === B ? e.objects : []));
    expect(revealed).toContain(forest);
  });

  it("damages each creature of the chosen colour, reading the spell's own X (Sudden Demise)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const demise = toHand(game, "Sudden Demise");
    const elves = spawn(game, "Llanowar Elves");
    const bear = spawn(game, "Grizzly Bears", B);
    const goblin = spawn(game, "Raging Goblin", B);
    a.chooseCreatureTypeFn = () => "G";
    cast(game, demise, { x: 2 });
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, goblin)).toBe("battlefield");
  });

  it("is a choice the bots search, and v1 aims it at the opponents' colour", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const demise = toHand(game, "Sudden Demise");
    // Our own deck is red, so "the colour we want" would be red or a
    // colour we lack; the opponent's creatures are green.
    spawn(game, "Raging Goblin");
    spawn(game, "Llanowar Elves", B);
    spawn(game, "Grizzly Bears", B);
    cast(game, demise, { x: 2, settle: false });
    game.advanceUntil((s) => s.awaiting !== null || s.zones.shared.stack.length === 0);
    const offer = game.legalActions(A).find((l) => l.kind === "choose-creature-type");
    expect(offer?.kind === "choose-creature-type" && offer.resolving).toBe(true);
    expect(decisionCandidates(offer!, A)?.length).toBe(5);
    const bot = new HeuristicBotController(A, game.registry);
    const view = { state: game.state, player: A, legalActions: () => game.legalActions(A) };
    expect(bot.chooseCreatureType(view as never, demise, ["W", "U", "B", "R", "G"], [])).toBe("G");
    // As a permanent enters, the same menu is the deck's colour: not green.
    expect(colorToName(game.state, game.registry, A, ["W", "U", "B", "R", "G"])).not.toBe("G");
  });
});

describe("choose a card type as it resolves, counting the revealed hand", () => {
  it("deals 3 damage per revealed card of the chosen type (Blood Oath)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const oath = toHand(game, "Blood Oath");
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Llanowar Elves", B);
    toHand(game, "Lightning Bolt", B);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "creature";
    };
    const before = life(game, B);
    cast(game, oath, { targets: [ref(B)] });
    expect(offered).toEqual([
      "artifact",
      "battle",
      "creature",
      "enchantment",
      "instant",
      "kindred",
      "land",
      "planeswalker",
      "sorcery",
    ]);
    expect(life(game, B)).toBe(before - 6);
  });

  it("creates two Saprolings per revealed card of the chosen type (Fertile Imagination)", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const imagination = toHand(game, "Fertile Imagination");
    toHand(game, "Lightning Bolt", B);
    toHand(game, "Shock", B);
    toHand(game, "Grizzly Bears", B);
    a.chooseCreatureTypeFn = () => "instant";
    cast(game, imagination, { targets: [ref(B)] });
    expect(tokensNamed(game, "Saproling Token", A)).toBe(4);
  });
});

describe("choose a number as it resolves (the choose-number decision)", () => {
  it("destroys and discards at the chosen mana value, reading it as X (Void)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 1);
    const voidCard = toHand(game, "Void");
    const bear = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const stone = spawn(game, "Mind Stone", B);
    const handBear = toHand(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock", B);
    let asked: { min: number; max?: number } | undefined;
    a.chooseNumberFn = (_view, offer) => {
      asked = { min: offer.min, ...(offer.max !== undefined ? { max: offer.max } : {}) };
      return 2;
    };
    cast(game, voidCard, { targets: [ref(B)] });
    expect(asked).toEqual({ min: 0 });
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, handBear)).toBe("graveyard");
    expect(zone(game, shock)).toBe("hand");
    expect(game.events.some((e) => e.type === "number-chosen" && e.number === 2)).toBe(true);
  });

  it("refuses a number below the minimum or not whole", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 1);
    const voidCard = toHand(game, "Void");
    cast(game, voidCard, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-number" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-number");
    expect(game.canDispatch({ type: "choose-number", player: A, number: -1 })).toMatch(/less than 0/);
    expect(game.canDispatch({ type: "choose-number", player: A, number: 1.5 })).toMatch(/whole number/);
    expect(game.canDispatch({ type: "choose-number", player: A, number: 40 })).toBeNull();
    const offer = game.legalActions(A).find((l) => l.kind === "choose-number");
    expect(decisionCandidates(offer!, A)?.map((c) => (c.type === "choose-number" ? c.number : -1))).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
  });
});

describe("choose a counter on a target as it resolves (Ichormoon Gauntlet)", () => {
  it("offers only the kinds on the target, and adds one of the chosen kind", () => {
    const { game, a } = table();
    spawn(game, "Ichormoon Gauntlet");
    lands(game, "Mountain", 1);
    const bear = spawn(game, "Grizzly Bears");
    setCounters(game, bear, "+1/+1", 2);
    setCounters(game, bear, "shield", 1);
    const bolt = toHand(game, "Lightning Bolt");
    pickTargets(a, bear);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return "+1/+1";
    };
    cast(game, bolt, { targets: [ref(B)] });
    expect(offered).toEqual(["+1/+1", "shield"]);
    expect(counters(game, bear)).toBe(3);
    expect(counters(game, bear, "shield")).toBe(1);
  });

  it("asks nothing and does nothing with no counter on the target", () => {
    const { game, a } = table();
    spawn(game, "Ichormoon Gauntlet");
    lands(game, "Mountain", 1);
    const bear = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    pickTargets(a, bear);
    a.chooseCreatureTypeFn = () => {
      throw new Error("asked to choose a counter");
    };
    cast(game, bolt, { targets: [ref(B)] });
    expect(game.state.objects[bear].counters).toEqual({});
  });
});

describe("remove a counter of the player's choice (Medicine Runner)", () => {
  it("removes the counter chosen from the target, or none", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    setCounters(game, bear, "+1/+1", 1);
    setCounters(game, bear, "stun", 1);
    pickTargets(a, bear);
    a.chooseCounterRemovalsFn = () => [{ object: bear, kind: "stun", count: 1 }];
    enter(game, "Medicine Runner");
    expect(counters(game, bear, "stun")).toBe(0);
    expect(counters(game, bear)).toBe(1);
  });
});
