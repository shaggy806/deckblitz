/**
 * Batch 343, the lead's own cards past the lanes: Soulquake (return-to-hand-all
 * `alsoGraveyards`), Even the Odds (`castOnlyIf` against each opponent), Rag Man
 * (a random discard among the cards a filter allows) and Giant Turtle.
 */
import { describe, expect, it } from "vitest";
import { blockLimitOf, invalidateComputedCache } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  keywords,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("batch 343 (lead)", () => {
  it("Soulquake returns every creature and every creature card in a graveyard to its owner's hand, and nothing else", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const land = spawn(game, "Forest", B);
    const deadMine = toGraveyard(game, "Llanowar Elves", A);
    const deadTheirs = toGraveyard(game, "Grizzly Bears", B);
    const sorcery = toGraveyard(game, "Lightning Bolt", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Soulquake"));
    for (const id of [mine, deadMine]) expect(hand(game, A)).toContain(id);
    for (const id of [theirs, deadTheirs]) expect(hand(game, B)).toContain(id);
    expect(zone(game, land)).toBe("battlefield");
    expect(graveyard(game, B)).toContain(sorcery);
  });

  it("Even the Odds can be cast only while you control fewer creatures than each opponent", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    const odds = toHand(game, "Even the Odds");
    expect(() => cast(game, odds)).toThrow();
    spawn(game, "Hill Giant", B);
    cast(game, odds);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
  });

  it("Rag Man discards a creature card at random, never another card", () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const { game } = table({ seed });
      const rag = spawn(game, "Rag Man", A);
      lands(game, "Swamp", 3);
      const bolts = [toHand(game, "Lightning Bolt", B), toHand(game, "Lightning Bolt", B), toHand(game, "Forest", B)];
      const bears = toHand(game, "Grizzly Bears", B);
      activate(game, rag, 0, { targets: [ref(B)] });
      expect(graveyard(game, B)).toEqual([bears]);
      for (const id of bolts) expect(zone(game, id)).toBe("hand");
    }
  });

  it("Frenzied Raider gets a counter when a boast ability is activated, not another activated ability", () => {
    const { game, a } = table();
    const raider = spawn(game, "Frenzied Raider");
    const braggart = spawn(game, "Axgard Braggart");
    const pinger = spawn(game, "Prodigal Pyromancer");
    activate(game, pinger, 0, { targets: [ref(B)] });
    expect(counters(game, raider)).toBe(0);
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => [{ attacker: braggart, defender: B }];
    toStep(game, "postcombat-main");
    activate(game, braggart, 0);
    expect(counters(game, raider)).toBe(1);
    expect(counters(game, braggart)).toBe(1);
  });

  it("Swordsworn Cavalier has first strike once another Knight entered under your control this turn, not its own entry or an opponent's", () => {
    const { game } = table();
    const cavalier = enter(game, "Swordsworn Cavalier");
    expect(keywords(game, cavalier).has("first-strike")).toBe(false);
    enter(game, "Knight of the White Orchid", B);
    expect(keywords(game, cavalier).has("first-strike")).toBe(false);
    enter(game, "Knight of the White Orchid");
    expect(keywords(game, cavalier).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, cavalier).has("first-strike")).toBe(false);
  });

  it("Time and Tide phases in what was phased out and phases out what has phasing, at once", () => {
    const { game } = table();
    const breeze = spawn(game, "Breezekeeper", A);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "phase-out", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("phased-out");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Time and Tide"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, breeze)).toBe("phased-out");
    // Cast again: the Breezekeeper comes back, and nothing with phasing is left to go.
    lands(game, "Island", 2);
    cast(game, toHand(game, "Time and Tide"));
    expect(zone(game, breeze)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Justice deals a red spell's damage to its controller, once for all it dealt at a time", () => {
    const { game } = table();
    spawn(game, "Justice", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Pyroclasm"));
    // Two creatures dealt 2 each: one trigger, 4 damage to Pyroclasm's caster.
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(20);
  });

  it("Aboroth pays cumulative upkeep with a -1/-1 counter for each age counter, or is sacrificed", () => {
    const { game, a } = table();
    const aboroth = spawn(game, "Aboroth");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, aboroth, "age")).toBe(1);
    expect(counters(game, aboroth, "-1/-1")).toBe(1);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, aboroth, "age")).toBe(2);
    expect(counters(game, aboroth, "-1/-1")).toBe(3);
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, aboroth)).toBe("graveyard");
  });

  it("Kemba's Legion can block one more creature for each Equipment attached to it", () => {
    const { game } = table();
    const legion = spawn(game, "Kemba's Legion");
    expect(blockLimitOf(game.state, game.registry, legion)).toBe(1);
    for (const name of ["Bonesplitter", "Short Sword"]) {
      const gear = spawn(game, name);
      game.state.objects[gear].attachedTo = legion;
    }
    spawn(game, "Bonesplitter");
    invalidateComputedCache();
    expect(blockLimitOf(game.state, game.registry, legion)).toBe(3);
  });

  it("Dwarven Catapult divides X evenly, rounded down, among the target opponent's creatures, and none if they outnumber X", () => {
    const { game } = table();
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Dwarven Catapult"), { targets: [ref(B)], x: 5 });
    for (const id of theirs) expect(game.state.objects[id].damageMarked).toBe(1);
    expect(game.state.objects[mine].damageMarked).toBe(0);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Dwarven Catapult"), { targets: [ref(B)], x: 2 });
    for (const id of theirs) expect(game.state.objects[id].damageMarked).toBe(0);
  });

  it("Giant Turtle can't attack the turn after it attacked, then can again", () => {
    const { game, a } = table();
    const turtle = spawn(game, "Giant Turtle");
    a.declareAttackersFn = () => [{ attacker: turtle, defender: B }];
    toStep(game, "postcombat-main");
    nextTurn(game);
    nextTurn(game);
    let offered: readonly string[] = [];
    a.declareAttackersFn = (view) => {
      const offer = view.legalActions().find((o) => o.kind === "declare-attackers");
      offered = offer === undefined || offer.kind !== "declare-attackers" ? [] : offer.eligible;
      return [];
    };
    toStep(game, "postcombat-main");
    expect(offered).not.toContain(turtle);
    nextTurn(game);
    nextTurn(game);
    toStep(game, "postcombat-main");
    expect(offered).toContain(turtle);
  });
});
