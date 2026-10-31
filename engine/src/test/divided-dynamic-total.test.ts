/**
 * A divided amount whose total is an amount expression (rule 601.2d): read
 * when the division is announced — as a spell is cast (Volcanic Wind,
 * Monstrous Onslaught), as an ability is activated (Lukka, Bound to Ruin,
 * 602.2b) or as a trigger is put on the stack (Ureni, the Song Unending;
 * Orca, Siege Demon's last-known power — 603.3d, 608.2h) — capping the
 * targets at one per point and fixed from then on. And a reflexive trigger
 * that divides (Death to Our Enemies — 603.12): its targets and split are
 * announced as it's put on the stack.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import type { TargetRef } from "../target.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");

const obj = (object: ObjectId): TargetRef => ({ kind: "object", object });
const player = (p: PlayerId): TargetRef => ({ kind: "player", player: p });
const quiet = (s: GameState): boolean =>
  s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0;

/** Alice's main phase with `mountains` Mountains and `forests` Forests. */
const setUp = (mountains = 8, forests = 8) => {
  const game = Game.create({
    seed: 1,
    shuffle: false,
    rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
    decks: [
      { player: A, cards: Array<string>(40).fill("Island") },
      { player: B, cards: Array<string>(40).fill("Island") },
    ],
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (const [land, n] of [["Mountain", mountains], ["Forest", forests]] as const) {
    for (let i = 0; i < n; i += 1) game.debugSpawn(land, A, "battlefield");
  }
  return game;
};
const ready = (game: Game, name: string, who: PlayerId = A): ObjectId => {
  const id = game.debugSpawn(name, who, "battlefield");
  game.state.objects[id].summoningSick = false;
  return id;
};
const toHand = (game: Game, name: string): ObjectId => game.debugSpawn(name, A, "hand");
const castOffer = (game: Game, card: ObjectId) =>
  game.legalActions(A).find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);
const castSpell = (game: Game, card: ObjectId, targets: TargetRef[], division?: number[]) =>
  game.dispatch({ type: "cast-spell", player: A, card, targets, ...(division !== undefined ? { division } : {}) });
const toTargets = (game: Game) => game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || quiet(s));

describe("a spell's divided total read as it's cast (Volcanic Wind)", () => {
  const board = () => {
    const game = setUp();
    const mine = ready(game, "Grizzly Bears");
    const bear = ready(game, "Grizzly Bears", B);
    const giant = ready(game, "Hill Giant", B);
    return { game, mine, bear, giant, wind: toHand(game, "Volcanic Wind") };
  };

  it("offers X — the creatures on the battlefield — as the total, capping the targets at X", () => {
    const { game, wind } = board();
    const offer = castOffer(game, wind);
    expect(offer?.divide).toEqual({ total: 3, slot: 0 });
    const group = offer?.targetSpecs[0];
    expect(typeof group === "object" && group.kind === "any-number" ? group.max : undefined).toBe(3);
  });

  it("deals the split as cast, whatever enters before it resolves", () => {
    const { game, bear, giant, wind } = board();
    castSpell(game, wind, [obj(bear), obj(giant)], [1, 2]);
    // More creatures in response don't raise X (rule 601.2d: fixed as cast).
    ready(game, "Grizzly Bears", B);
    ready(game, "Grizzly Bears", B);
    game.advanceUntil(quiet);
    expect(game.state.objects[bear].damageMarked).toBe(1);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("refuses a division that isn't all of X", () => {
    const { game, mine, bear, giant, wind } = board();
    expect(() => castSpell(game, wind, [obj(bear), obj(giant)], [2, 2])).toThrow(/total 3/);
    // A fourth creature makes X 4.
    const extra = ready(game, "Grizzly Bears", B);
    castSpell(game, wind, [obj(mine), obj(bear), obj(giant), obj(extra)], [1, 1, 1, 1]);
    game.advanceUntil(quiet);
    expect([mine, bear, giant, extra].map((id) => game.state.objects[id].damageMarked)).toEqual([1, 1, 1, 1]);
  });
});

describe("a spell's divided aggregate total (Monstrous Onslaught)", () => {
  it("divides the greatest power among its caster's creatures as it was cast", () => {
    const game = setUp();
    const giant = ready(game, "Hill Giant");
    ready(game, "Grizzly Bears");
    const [b1, b2] = [ready(game, "Grizzly Bears", B), ready(game, "Hill Giant", B)];
    const onslaught = toHand(game, "Monstrous Onslaught");
    expect(castOffer(game, onslaught)?.divide).toEqual({ total: 3, slot: 0 });
    castSpell(game, onslaught, [obj(b1), obj(b2)], [2, 1]);
    // A bigger creature in response changes nothing.
    game.state.objects[giant].counters["+1/+1"] = 5;
    game.advanceUntil(quiet);
    expect(game.state.objects[b1].zone).toBe("graveyard");
    expect(game.state.objects[b2].damageMarked).toBe(1);
  });
});

describe("an activated ability's divided total read as it's activated (Lukka, Bound to Ruin)", () => {
  const board = () => {
    const game = setUp();
    const lukka = ready(game, "Lukka, Bound to Ruin");
    game.state.objects[lukka].counters.loyalty = 5;
    const giant = ready(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 1;
    const index = game.registry.get("Lukka, Bound to Ruin").activated.findIndex((a) => a.loyaltyCost === -4);
    return { game, lukka, index };
  };

  it("offers X — its controller's greatest power — and deals the split", () => {
    const { game, lukka, index } = board();
    const [bear, ogre] = [ready(game, "Grizzly Bears", B), ready(game, "Hill Giant", B)];
    const offer = game
      .legalActions(A)
      .find(
        (a): a is Extract<LegalAction, { kind: "activate-ability" }> =>
          a.kind === "activate-ability" && a.source === lukka && a.abilityIndex === index,
      );
    expect(offer?.divide).toEqual({ total: 4, slot: 0 });
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: lukka,
      abilityIndex: index,
      targets: [obj(bear), obj(ogre)],
      division: [1, 3],
    });
    game.advanceUntil(quiet);
    expect(game.state.objects[bear].damageMarked).toBe(1);
    expect(game.state.objects[ogre].zone).toBe("graveyard");
  });

  it("+1 adds {R}{G} for creatures only", () => {
    const { game, lukka } = board();
    const plus = game.registry.get("Lukka, Bound to Ruin").activated.findIndex((a) => a.loyaltyCost === 1);
    game.dispatch({ type: "activate-ability", player: A, source: lukka, abilityIndex: plus, targets: [] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    const pool = game.state.players[A].manaPool;
    expect(pool.map((u) => u.type).sort()).toEqual(["G", "R"]);
    expect(pool.every((u) => u.restriction !== undefined)).toBe(true);
    expect(game.state.objects[lukka].counters.loyalty).toBe(6);
  });

  it("−1 makes a 3/3 Phyrexian Beast with toxic 1", () => {
    const { game, lukka } = board();
    const minus = game.registry.get("Lukka, Bound to Ruin").activated.findIndex((a) => a.loyaltyCost === -1);
    game.dispatch({ type: "activate-ability", player: A, source: lukka, abilityIndex: minus, targets: [] });
    game.advanceUntil(quiet);
    const beast = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Phyrexian Beast Token");
    expect(beast).toBeDefined();
    expect(game.registry.get("Phyrexian Beast Token").toxic).toBe(1);
  });

  it("refuses a split of anything but X", () => {
    const { game, lukka, index } = board();
    const bear = ready(game, "Grizzly Bears", B);
    expect(() =>
      game.dispatch({ type: "activate-ability", player: A, source: lukka, abilityIndex: index, targets: [obj(bear)], division: [5] }),
    ).toThrow(/total 4/);
  });
});

describe("a trigger's divided total read as it's put on the stack", () => {
  it("divides the lands its controller controls (Ureni, the Song Unending)", () => {
    const game = setUp(3, 3);
    const [bear, giant] = [ready(game, "Grizzly Bears", B), ready(game, "Hill Giant", B)];
    game.debugSpawn("Ureni, the Song Unending", A, "battlefield", { announceEntry: true });
    toTargets(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-targets" ? awaiting.divide : undefined).toEqual({ total: 6, slot: 0 });
    game.dispatch({ type: "choose-targets", player: A, targets: [obj(bear), obj(giant)], division: [2, 4] });
    game.advanceUntil(quiet);
    expect(game.state.objects[bear].zone).toBe("graveyard");
    expect(game.state.objects[giant].zone).toBe("graveyard");
  });

  it("caps the targets at the total", () => {
    const game = setUp(1, 0);
    const [bear, giant] = [ready(game, "Grizzly Bears", B), ready(game, "Hill Giant", B)];
    game.debugSpawn("Ureni, the Song Unending", A, "battlefield", { announceEntry: true });
    toTargets(game);
    expect(() =>
      game.dispatch({ type: "choose-targets", player: A, targets: [obj(bear), obj(giant)], division: [1, 1] }),
    ).toThrow();
  });

  it("divides Orca's power as it last existed, and Orca grows as others die", () => {
    const game = setUp();
    const orca = ready(game, "Orca, Siege Demon");
    const fodder = ready(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [obj(fodder)]);
    game.advanceUntil(quiet);
    expect(game.state.objects[orca].counters["+1/+1"]).toBe(1);
    const giant = ready(game, "Hill Giant", B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [obj(orca)]);
    toTargets(game);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-targets" ? awaiting.divide : undefined).toEqual({ total: 6, slot: 0 });
    game.dispatch({ type: "choose-targets", player: A, targets: [obj(giant), player(B)], division: [3, 3] });
    game.advanceUntil(quiet);
    expect(game.state.objects[giant].zone).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
  });
});

describe("a reflexive trigger that divides (Death to Our Enemies)", () => {
  it("makes a tapped Treasure and a plan counter for each noncreature spell", () => {
    const game = setUp();
    const plan = ready(game, "Death to Our Enemies");
    castSpell(game, toHand(game, "Shock"), [player(B)]);
    game.advanceUntil(quiet);
    expect(game.state.objects[plan].counters.plan).toBe(1);
    const treasures = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Treasure Token");
    expect(treasures).toHaveLength(1);
    expect(game.state.objects[treasures[0]].tapped).toBe(true);
  });

  it("on the fourth counter, is sacrificed, then divides 7 among one or two targets chosen then", () => {
    const game = setUp();
    const plan = ready(game, "Death to Our Enemies");
    game.state.objects[plan].counters.plan = 3;
    const giant = ready(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "plan", amount: 1 }, [obj(plan)]);
    toTargets(game);
    expect(game.state.objects[plan].zone).toBe("graveyard");
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind === "choose-targets" ? awaiting.divide : undefined).toEqual({ total: 7, slot: 0 });
    // One or two targets: three is refused, and so is a split that isn't 7.
    expect(() =>
      game.dispatch({ type: "choose-targets", player: A, targets: [obj(giant), player(B), player(A)], division: [3, 3, 1] }),
    ).toThrow();
    expect(() =>
      game.dispatch({ type: "choose-targets", player: A, targets: [obj(giant), player(B)], division: [3, 3] }),
    ).toThrow();
    game.dispatch({ type: "choose-targets", player: A, targets: [obj(giant), player(B)], division: [3, 4] });
    game.advanceUntil(quiet);
    expect(game.state.objects[giant].zone).toBe("graveyard");
    expect(game.state.players[B].life).toBe(16);
  });
});
