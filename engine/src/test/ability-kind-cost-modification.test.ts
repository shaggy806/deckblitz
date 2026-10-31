/**
 * `abilityCostModification` narrowed to one kind of ability (rule 602.2b
 * applies 601.2f's cost changes to activation costs): equip (702.6 — Bureau
 * Headmaster, Bladehold War-Whip, Dwarven Mauler's "that target this
 * creature"), exhaust (702.177 — Boom Scholar), cycling (702.29 —
 * Fluctuator, from the hand), and loyalty (606 — Eidolon of Obstruction's
 * mana tax, Carth the Lion's "additional [+1]" combined into one loyalty
 * cost by 606.5 and read by 606.6).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, counters, lands, loyalty, ref, spawn, table, toHand } from "./harness.js";

const offers = (game: Game, player: PlayerId, source: ObjectId) =>
  game.legalActions(player).flatMap((o) => (o.kind === "activate-ability" && o.source === source ? [o] : []));
const untapped = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => !game.state.objects[id].tapped).length;
const equipOf = (game: Game, gear: ObjectId, creature: ObjectId, player: PlayerId = A): string | null =>
  game.canDispatch({ type: "activate-ability", player, source: gear, abilityIndex: 0, targets: [ref(creature)] });

describe("equip abilities you activate (Bureau Headmaster)", () => {
  it("takes {1} off an equip cost and off an Equipment spell", () => {
    const { game } = table();
    spawn(game, "Bureau Headmaster");
    const hammer = spawn(game, "Loxodon Warhammer");
    const bear = spawn(game, "Grizzly Bears");
    const pool = lands(game, "Wastes", 2);
    activate(game, hammer, 0, { targets: [ref(bear)] });
    expect(game.state.objects[hammer].attachedTo).toBe(bear);
    expect(untapped(game, pool)).toBe(0);

    const splitter = toHand(game, "Bonesplitter");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: splitter, targets: [] })).toBeNull();
  });

  it("leaves other abilities and the opponent's equip abilities alone", () => {
    const { game } = table();
    spawn(game, "Bureau Headmaster");
    const food = spawn(game, "Food Token");
    lands(game, "Wastes", 1);
    expect(offers(game, A, food)).toHaveLength(0);

    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    expect(game.state.turn.number).toBe(2);
    const theirs = spawn(game, "Bonesplitter", B);
    const bear = spawn(game, "Grizzly Bears", B);
    expect(equipOf(game, theirs, bear, B)).toMatch(/cannot pay/);
  });
});

describe("equip abilities of other Equipment (Bladehold War-Whip)", () => {
  it("reduces another Equipment's equip, not its own", () => {
    const { game } = table();
    const whip = spawn(game, "Bladehold War-Whip");
    const splitter = spawn(game, "Bonesplitter");
    const bear = spawn(game, "Grizzly Bears");
    expect(equipOf(game, splitter, bear)).toBeNull();
    activate(game, splitter, 0, { targets: [ref(bear)] });
    expect(game.state.objects[splitter].attachedTo).toBe(bear);

    // Its own {3}{R}{W}: four lands besides the colours aren't enough.
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 2);
    expect(equipOf(game, whip, bear)).not.toBeNull();
    lands(game, "Wastes", 1);
    expect(equipOf(game, whip, bear)).toBeNull();
  });
});

describe("equip abilities that target this creature (Dwarven Mauler)", () => {
  it("pays less only with the Mauler as the target, and offers only it when that's all that's affordable", () => {
    const { game } = table();
    const mauler = spawn(game, "Dwarven Mauler");
    const bear = spawn(game, "Grizzly Bears");
    const hammer = spawn(game, "Loxodon Warhammer");
    const pool = lands(game, "Wastes", 1);
    expect(equipOf(game, hammer, mauler)).toBeNull();
    expect(equipOf(game, hammer, bear)).not.toBeNull();
    const [offer] = offers(game, A, hammer);
    expect(offer?.targetOptions?.[0]).toEqual([ref(mauler)]);

    activate(game, hammer, 0, { targets: [ref(mauler)] });
    expect(game.state.objects[hammer].attachedTo).toBe(mauler);
    expect(untapped(game, pool)).toBe(0);
  });

  it("offers every target while the full price is affordable", () => {
    const { game } = table();
    const mauler = spawn(game, "Dwarven Mauler");
    const bear = spawn(game, "Grizzly Bears");
    const hammer = spawn(game, "Loxodon Warhammer");
    lands(game, "Wastes", 3);
    const [offer] = offers(game, A, hammer);
    expect(offer?.targetOptions?.[0]).toEqual(expect.arrayContaining([ref(mauler), ref(bear)]));
  });

  it("two Maulers: only the targeted one's reduction applies", () => {
    const { game } = table();
    const first = spawn(game, "Dwarven Mauler");
    spawn(game, "Dwarven Mauler");
    const hammer = spawn(game, "Loxodon Warhammer");
    expect(equipOf(game, hammer, first)).not.toBeNull();
    lands(game, "Wastes", 1);
    expect(equipOf(game, hammer, first)).toBeNull();
  });
});

describe("exhaust abilities of other permanents you control (Boom Scholar)", () => {
  it("takes {2} off another permanent's exhaust, not its own", () => {
    const { game } = table();
    const scholar = spawn(game, "Boom Scholar");
    const launcher = spawn(game, "Camera Launcher");
    lands(game, "Wastes", 1);
    expect(offers(game, A, launcher)).toHaveLength(1);
    activate(game, launcher);
    expect(counters(game, launcher)).toBe(1);

    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    expect(offers(game, A, scholar)).toHaveLength(0);
    lands(game, "Wastes", 2);
    activate(game, scholar);
    expect(counters(game, scholar)).toBe(2);
  });
});

describe("cycling abilities you activate (Fluctuator)", () => {
  it("makes Cycling {2} free from the hand, and only the generic part comes off", () => {
    const { game } = table();
    spawn(game, "Fluctuator");
    const angelsong = toHand(game, "Angelsong");
    expect(game.canDispatch({ type: "cycle", player: A, card: angelsong })).toBeNull();
    const cerodon = toHand(game, "Desert Cerodon");
    expect(game.canDispatch({ type: "cycle", player: A, card: cerodon })).not.toBeNull();
    game.dispatch({ type: "cycle", player: A, card: angelsong });
    expect(game.state.objects[angelsong].zone).toBe("graveyard");
  });

  it("doesn't reach the opponent's cycling", () => {
    const { game } = table();
    spawn(game, "Fluctuator", B);
    const angelsong = toHand(game, "Angelsong");
    expect(game.canDispatch({ type: "cycle", player: A, card: angelsong })).not.toBeNull();
  });
});

describe("loyalty abilities of opponents' planeswalkers (Eidolon of Obstruction)", () => {
  it("adds {1} to an opponent's loyalty ability, none to its controller's", () => {
    const { game } = table();
    const mine = spawn(game, "Chandra Nalaar");
    spawn(game, "Eidolon of Obstruction", B);
    const plusOne = game.registry.get("Chandra Nalaar").activated.findIndex((a) => a.loyaltyCost === 1);
    const act = { type: "activate-ability" as const, player: A, source: mine, abilityIndex: plusOne, targets: [ref(B)] };
    expect(game.canDispatch(act)).not.toBeNull();
    lands(game, "Wastes", 1);
    expect(game.canDispatch(act)).toBeNull();
    loyalty(game, mine, 1, { targets: [ref(B)] });
    expect(game.state.objects[mine].counters.loyalty).toBe(7);
    expect(game.state.players[B].life).toBe(19);
  });

  it("leaves its own controller's planeswalkers alone", () => {
    const { game } = table();
    const mine = spawn(game, "Chandra Nalaar");
    spawn(game, "Eidolon of Obstruction");
    loyalty(game, mine, 1, { targets: [ref(B)] });
    expect(game.state.objects[mine].counters.loyalty).toBe(7);
  });
});

describe("an additional [+1] (Carth the Lion, rule 606.5)", () => {
  it("a [+1] puts two loyalty counters on, and the offer says so", () => {
    const { game } = table();
    spawn(game, "Carth the Lion");
    const chandra = spawn(game, "Chandra Nalaar");
    // Six loyalty can't pay the [−8]'s combined [−7] (606.6); seven can.
    expect(offers(game, A, chandra).map((o) => o.loyalty)).toEqual([2, "-x"]);
    game.state.objects[chandra].counters.loyalty = 7;
    expect(offers(game, A, chandra).map((o) => o.loyalty)).toEqual([2, "-x", -7]);
    loyalty(game, chandra, 1, { targets: [ref(B)] });
    expect(game.state.objects[chandra].counters.loyalty).toBe(9);
  });

  it("a [−8] removes seven, so seven loyalty is enough (606.6 reads the combined cost)", () => {
    const { game } = table();
    spawn(game, "Carth the Lion");
    const chandra = spawn(game, "Chandra Nalaar");
    game.state.objects[chandra].counters.loyalty = 7;
    loyalty(game, chandra, -8, { targets: [ref(B)] });
    expect(game.state.players[B].life).toBe(10);
    expect(game.state.objects[chandra].zone).toBe("graveyard");
  });

  it("a [−X] removes X−1, and X can reach one more than the loyalty", () => {
    const { game } = table();
    spawn(game, "Carth the Lion");
    const chandra = spawn(game, "Chandra Nalaar");
    const giant = spawn(game, "Grizzly Bears", B);
    const minusX = offers(game, A, chandra).find((o) => o.loyalty === "-x");
    expect(minusX?.xCost?.maxX).toBe(7);
    loyalty(game, chandra, "-x", { x: 2, targets: [ref(giant)] });
    expect(game.state.objects[giant].zone).toBe("graveyard");
    expect(game.state.objects[chandra].counters.loyalty).toBe(5);
  });

  it("doesn't reach the opponent's planeswalkers", () => {
    const { game } = table();
    spawn(game, "Carth the Lion", B);
    const chandra = spawn(game, "Chandra Nalaar");
    loyalty(game, chandra, 1, { targets: [ref(B)] });
    expect(game.state.objects[chandra].counters.loyalty).toBe(7);
  });
});
