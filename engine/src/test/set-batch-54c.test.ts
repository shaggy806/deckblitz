/**
 * The set walk, batch 54, part c (2026-10-11): The Hobbit's last cards and Marvel Super Heroes Commander's first.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  blockOffer,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickTargets,
  pickModes,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Thranduil's Company", () => {
  it("gives an extra land drop only while you control another Elf, and its landfall puts two counters and vigilance on the target", () => {
    const { game, a } = table();
    game.state.rules.maxLandsPerTurn = 1;
    const company = spawn(game, "Thranduil's Company");
    const forests = [toHand(game, "Forest"), toHand(game, "Forest"), toHand(game, "Forest")];
    pickTargets(a, company);
    game.dispatch({ type: "play-land", player: A, card: forests[0] });
    settle(game);
    expect(counters(game, company)).toBe(2);
    expect(keywords(game, company).has("vigilance")).toBe(true);
    // Alone, it is not "another Elf" of its own.
    expect(game.canDispatch({ type: "play-land", player: A, card: forests[1] })).not.toBeNull();
    spawn(game, "Llanowar Elves");
    expect(game.canDispatch({ type: "play-land", player: A, card: forests[1] })).toBeNull();
    game.dispatch({ type: "play-land", player: A, card: forests[1] });
    settle(game);
    expect(counters(game, company)).toBe(4);
    expect(game.canDispatch({ type: "play-land", player: A, card: forests[2] })).not.toBeNull();
  });
});

describe("Elven Raft-Steerer", () => {
  it("taps a creature an opponent controls or untaps one of yours, announced as it triggers", () => {
    const { game, a } = table();
    spawn(game, "Elven Raft-Steerer");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant", A, { tapped: true });
    pickModes(a, 0);
    pickTargets(a, theirs);
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Island") });
    settle(game);
    expect(game.state.objects[theirs].tapped).toBe(true);
    pickModes(a, 1);
    pickTargets(a, mine);
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Island") });
    settle(game);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Beorn, Reluctant Host // Till and Tend", () => {
  it("Till and Tend gives an additional land drop, then Beorn can be cast from exile", () => {
    const { game } = table();
    game.state.rules.maxLandsPerTurn = 1;
    lands(game, "Forest", 7);
    const beorn = toHand(game, "Beorn, Reluctant Host");
    cast(game, beorn, { face: 1 });
    expect(zone(game, beorn)).toBe("exile");
    const first = toHand(game, "Forest");
    const second = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: first });
    expect(game.canDispatch({ type: "play-land", player: A, card: second })).toBeNull();
    cast(game, beorn, { via: "adventure", face: 0 });
    expect(zone(game, beorn)).toBe("battlefield");
    expect(keywords(game, beorn).has("trample")).toBe(true);
  });
});

describe("Bolg's Company", () => {
  it("has haste only beside another Goblin, and sacrifices another Goblin, never itself, for {B}{R}", () => {
    const { game } = table();
    const bolg = spawn(game, "Bolg's Company", A, { sick: true });
    expect(keywords(game, bolg).has("haste")).toBe(false);
    const goblin = spawn(game, "Raging Goblin");
    expect(keywords(game, bolg).has("haste")).toBe(true);
    const own = { type: "activate-ability", player: A, source: bolg, abilityIndex: 0, targets: [], sacrifice: bolg } as const;
    expect(() => game.dispatch(own)).toThrow();
    expect(zone(game, bolg)).toBe("battlefield");
    game.dispatch({ ...own, sacrifice: goblin });
    expect(zone(game, goblin)).toBe("graveyard");
    expect(game.state.players[A].manaPool.map((m) => m.type).sort()).toEqual(["B", "R"]);
    expect(keywords(game, bolg).has("haste")).toBe(false);
  });
});

describe("Fearsome Goblin Pair", () => {
  it("amasses Goblins 4 as it dies", () => {
    const { game } = table();
    const pair = spawn(game, "Fearsome Goblin Pair");
    destroy(game, pair, A);
    const [army] = named(game, "Army Token", A);
    expect(army).toBeDefined();
    expect(counters(game, army)).toBe(4);
    expect(subtypes(game, army)).toEqual(expect.arrayContaining(["Goblin", "Army"]));
    expect(pt(game, army)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Gathering of Darkness", () => {
  it("returns the chosen creature card and amasses Goblins 3, and amasses with no target chosen", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const bear = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Gathering of Darkness"), { targets: [{ kind: "object", object: bear }] });
    expect(zone(game, bear)).toBe("hand");
    const [army] = named(game, "Army Token", A);
    expect(counters(game, army)).toBe(3);
    expect(subtypes(game, army)).toContain("Goblin");
    cast(game, toHand(game, "Gathering of Darkness"), { targets: [null] });
    expect(named(game, "Army Token", A)).toEqual([army]);
    expect(counters(game, army)).toBe(6);
  });
});

describe("Dwarven Shortsword", () => {
  it("makes a 2/2 red Dwarf and attaches itself to it", () => {
    const { game } = table();
    const sword = enter(game, "Dwarven Shortsword");
    const [dwarf] = named(game, "2/2 Red Dwarf Token", A);
    expect(dwarf).toBeDefined();
    expect(game.state.objects[sword].attachedTo).toBe(dwarf);
    expect(pt(game, dwarf)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Puppet Master, String Puller", () => {
  it("goads a creature that then can't block, and makes a Treasure when a goaded creature hits an opponent", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Puppet Master, String Puller");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    const offer = blockOffer(game, a, [mine], B);
    const canBlock = (id: string): readonly string[] => offer.eligible.find((e) => e.blocker === id)?.canBlock ?? [];
    expect(canBlock(theirs)).toEqual([]);
    expect(canBlock(other)).toEqual([mine]);
    expect(game.state.objects[theirs].goadedBy).toContain(A);
    toStep(game, "postcombat-main");
    // An ungoaded creature of yours hitting an opponent makes nothing.
    expect(named(game, "Treasure Token", A)).toHaveLength(0);
    // Bob's goaded Giant has to attack someone other than alice: carol.
    b.declareAttackersFn = () => [{ attacker: theirs, defender: C }];
    toStep(game, "postcombat-main", B);
    expect(game.state.players[C].life).toBe(17);
    expect(named(game, "Treasure Token", A)).toHaveLength(1);
  });
});

describe("Valeria Richards, Precocious", () => {
  it("makes noncreature spells cost {1} less and draws on the first noncreature spell, not the first spell", () => {
    const { game } = table();
    spawn(game, "Valeria Richards, Precocious");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    expect(hand(game).length).toBe(before);
    // Divination costs {1}{U} with only two Islands to pay it.
    lands(game, "Island", 2);
    cast(game, toHand(game, "Divination"));
    expect(hand(game).length).toBe(before + 3);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(hand(game).length).toBe(before + 4);
  });
});
