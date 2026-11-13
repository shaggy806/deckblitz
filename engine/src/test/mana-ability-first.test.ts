/**
 * A mana ability that does something **before** its mana, as part of it —
 * `add-mana`'s `first` — Empowered Autogenerator: "{T}: Put a charge counter
 * on this artifact. Add X mana of any one color, where X is the number of
 * charge counters on this artifact." X is read after the counter goes on, so
 * the new counter counts (and is doubled under Doubling Season, as an
 * effect's counters are); it's still a mana ability (rules 605.1a, 605.3b),
 * and the auto-payer sizes its mana the same way.
 */
import { describe, expect, it } from "vitest";

import { A, cast, counters, enter, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId } from "../primitives.js";

const AUTOGEN = "Empowered Autogenerator";

const pool = (game: Game): readonly ManaType[] => game.state.players[A].manaPool.map((u) => u.type);
const untap = (game: Game, id: ObjectId): void => {
  game.state.objects[id].tapped = false;
};
/** On the battlefield and untapped (it enters tapped, even spawned). */
const autogen = (game: Game): ObjectId => {
  const id = spawn(game, AUTOGEN);
  untap(game, id);
  return id;
};
const tapFor =(game: Game, id: ObjectId, color: ManaType): void => {
  game.dispatch({ type: "activate-ability", player: A, source: id, abilityIndex: 0, targets: [], manaColors: [color] });
};

describe("Empowered Autogenerator", () => {
  it("enters tapped", () => {
    const { game } = table();
    const gen = enter(game, AUTOGEN);
    expect(game.state.objects[gen].tapped).toBe(true);
  });

  it("puts a charge counter on, then adds that many mana of one colour, without the stack", () => {
    const { game } = table();
    const gen = autogen(game);
    tapFor(game, gen, "G");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(counters(game, gen, "charge")).toBe(1);
    expect(pool(game)).toEqual(["G"]);
    untap(game, gen);
    tapFor(game, gen, "R");
    expect(counters(game, gen, "charge")).toBe(2);
    expect(pool(game)).toEqual(["G", "R", "R"]);
  });

  it("counts the counters Doubling Season doubles", () => {
    const { game } = table();
    spawn(game, "Doubling Season");
    const gen = autogen(game);
    tapFor(game, gen, "U");
    expect(counters(game, gen, "charge")).toBe(2);
    expect(pool(game)).toEqual(["U", "U"]);
  });

  it("adds no mana under Solemnity, with no counter to count", () => {
    const { game } = table();
    spawn(game, "Solemnity");
    const gen = autogen(game);
    tapFor(game, gen, "W");
    expect(counters(game, gen, "charge")).toBe(0);
    expect(pool(game)).toEqual([]);
  });

  it("pays a spell's cost by itself at no counters, counting the one it puts on", () => {
    const { game } = table();
    const gen = autogen(game);
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(zone(game, elves)).toBe("battlefield");
    expect(counters(game, gen, "charge")).toBe(1);
    expect(game.state.objects[gen].tapped).toBe(true);
  });

  it("pays five green with four counters on it, but not with three", () => {
    const { game } = table();
    const gen = autogen(game);
    game.state.objects[gen].counters.charge = 4;
    const big = toHand(game, "Gigantosaurus");
    cast(game, big);
    expect(zone(game, big)).toBe("battlefield");
    expect(counters(game, gen, "charge")).toBe(5);

    const { game: g2 } = table();
    const gen2 = autogen(g2);
    g2.state.objects[gen2].counters.charge = 3;
    expect(() => cast(g2, toHand(g2, "Gigantosaurus"))).toThrow(/cannot pay/);
    expect(counters(g2, gen2, "charge")).toBe(3);
  });

  it("the auto-payer counts Doubling Season's doubled counter: three on it pays five", () => {
    const { game } = table();
    spawn(game, "Doubling Season");
    const gen = autogen(game);
    game.state.objects[gen].counters.charge = 3;
    const big = toHand(game, "Gigantosaurus");
    cast(game, big);
    expect(zone(game, big)).toBe("battlefield");
    expect(counters(game, gen, "charge")).toBe(5);
  });
});

/**
 * A first instruction that asks: Metalworker's "Reveal any number of artifact
 * cards in your hand. Add {C}{C} for each card revealed this way." The reveal
 * is asked as it's activated, the mana added once it's answered, all without
 * the stack (rule 605.3b) and with priority back to whoever activated it.
 */
describe("Metalworker", () => {
  const setup = () => {
    const { game } = table();
    const worker = spawn(game, "Metalworker");
    const ring = toHand(game, "Sol Ring");
    const vault = toHand(game, "Mind Stone");
    const bear = toHand(game, "Grizzly Bears");
    return { game, worker, ring, vault, bear };
  };
  const tap = (game: Game, id: ObjectId): void => {
    game.dispatch({ type: "activate-ability", player: A, source: id, abilityIndex: 0, targets: [] });
  };

  it("asks which artifact cards to reveal, then adds {C}{C} for each, with no stack", () => {
    const { game, worker, ring, vault, bear } = setup();
    tap(game, worker);
    const asked = game.state.awaiting;
    expect(asked?.kind).toBe("choose-from-zone");
    if (asked?.kind !== "choose-from-zone") return;
    expect([...asked.eligible].sort()).toEqual([ring, vault].sort());
    expect(asked.eligible).not.toContain(bear);
    expect(asked.min).toBe(0);
    expect(pool(game)).toEqual([]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [ring, vault] });
    expect(pool(game)).toEqual(["C", "C", "C", "C"]);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, vault)).toBe("hand");
    expect(game.state.awaiting).toBeNull();
  });

  it("reveals only the ones picked, and counts only those", () => {
    const { game, worker, ring } = setup();
    tap(game, worker);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [ring] });
    expect(pool(game)).toEqual(["C", "C"]);
    const revealed = game.state.eventLog.filter((e) => e.type === "cards-revealed");
    expect(revealed.at(-1)).toMatchObject({ objects: [ring] });
  });

  it("may reveal none, for no mana", () => {
    const { game, worker } = setup();
    tap(game, worker);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    expect(pool(game)).toEqual([]);
    expect(game.state.objects[worker].tapped).toBe(true);
  });

  it("with no artifact card in hand, adds nothing and asks nothing", () => {
    const { game } = table();
    const worker = spawn(game, "Metalworker");
    toHand(game, "Grizzly Bears");
    tap(game, worker);
    expect(game.state.awaiting).toBeNull();
    expect(pool(game)).toEqual([]);
  });

  it("the auto-payer leaves it alone: its mana is a choice", () => {
    const { game, vault } = setup();
    // Mind Stone costs {2}: Metalworker could pay it, revealing Sol Ring.
    expect(() => cast(game, vault)).toThrow(/cannot pay/);
  });
});
