/**
 * Damage triggers that read how much was dealt: `dealt-damage`'s and
 * `deals-damage`'s `atLeast` ("is dealt 3 or more damage", "deals 6 or more
 * damage to an opponent"), and `dealt-damage`'s `excess` and `batched` ("is
 * dealt excess noncombat damage", rule 120.4a).
 */

import { describe, expect, it } from "vitest";

import { standardDamageAssignment } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, attack, cast, counters, hand, lands, nextTurn, pickTargets, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

/** `amount` noncombat damage to each of `to`, one simultaneous event, from `source`. */
const burn = (game: Game, player: PlayerId, source: ObjectId, to: ObjectId | PlayerId, amount: number): void => {
  game.debugApplyEffect(player, { kind: "damage", amount, target: 0 }, [ref(to)], { source });
  settle(game);
};

const armies = (game: Game, player: PlayerId): ObjectId[] =>
  Object.keys(game.state.objects)
    .map((id) => id as ObjectId)
    .filter((id) => {
      const o = game.state.objects[id];
      return o.zone === "battlefield" && o.controller === player && game.characteristics(id).subtypes.includes("Army");
    });

describe("dealt-damage atLeast (Innocent Bystander)", () => {
  it("fires on 3 or more dealt at once, and never on less", () => {
    const { game } = table();
    const shock = spawn(game, "Grizzly Bears", B);
    const bystander = spawn(game, "Innocent Bystander");
    burn(game, B, shock, bystander, 1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    // It's a 2/1: 1 is lethal, but state-based actions kill it either way.
    const second = spawn(game, "Innocent Bystander");
    burn(game, B, shock, second, 3);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("doesn't add up damage dealt at different times", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears", B);
    const bystander = spawn(game, "Innocent Bystander");
    // Toughness out of the way: it must survive to be hit twice.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 5 }, [ref(bystander)]);
    settle(game);
    burn(game, B, source, bystander, 2);
    burn(game, B, source, bystander, 2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });

  it("adds up what several sources deal at once (all at once, the ruling)", () => {
    const { game, a, b } = table();
    const bystander = spawn(game, "Innocent Bystander", A);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 5 }, [ref(bystander)]);
    settle(game);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    // Double-blocked: 2 and 2 at once (rule 510.2).
    b.declareBlockersFn = () => [
      { blocker: one, attacker: bystander },
      { blocker: two, attacker: bystander },
    ];
    attack(game, a, [bystander]);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("deals-damage atLeast", () => {
  it("Deus of Calamity: 6 or more to an opponent destroys a land that player controls, and 5 doesn't", () => {
    const { game, a } = table();
    const deus = spawn(game, "Deus of Calamity");
    const [mine] = lands(game, "Mountain", 1, A);
    const [theirs] = lands(game, "Mountain", 1, B);
    burn(game, A, deus, B, 5);
    expect(zone(game, theirs!)).toBe("battlefield");
    pickTargets(a, theirs!);
    burn(game, A, deus, B, 6);
    expect(zone(game, theirs!)).toBe("graveyard");
    expect(zone(game, mine!)).toBe("battlefield");
  });

  it("Deus of Calamity: combat damage counts, and it's all one source's at once", () => {
    const { game, a } = table();
    const deus = spawn(game, "Deus of Calamity");
    const [theirs] = lands(game, "Mountain", 1, B);
    pickTargets(a, theirs!);
    attack(game, a, [deus]);
    settle(game);
    expect(zone(game, theirs!)).toBe("graveyard");
  });

  it("Pain Magnification: per source, so 2 + 2 from two sources isn't 3 by a single source", () => {
    const { game } = table();
    spawn(game, "Pain Magnification");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    toHand(game, "Wastes", B);
    toHand(game, "Wastes", B);
    const before = hand(game, B).length;
    burn(game, A, one, B, 2);
    burn(game, A, two, B, 2);
    expect(hand(game, B).length).toBe(before);
    burn(game, A, one, B, 3);
    expect(hand(game, B).length).toBe(before - 1);
    // Not you.
    burn(game, A, one, A, 3);
    expect(hand(game, B).length).toBe(before - 1);
  });

  it("Spinneret and Spiderling: with no recipient named, the event's total", () => {
    const { game } = table({ deck: "Mountain" });
    const spider = spawn(game, "Spinneret and Spiderling");
    const x = spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    burn(game, A, spider, x, 2);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore);
    // Two creatures at once: 2 each, 4 in all.
    game.debugApplyEffect(A, { kind: "damage-all", filter: { name: "Hill Giant" }, amount: 2 }, [], { source: spider });
    settle(game);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore - 1);
  });

  it("Spinneret and Spiderling: two or more Spiders attacking grow it, one alone doesn't", () => {
    const { game, a } = table();
    const spider = spawn(game, "Spinneret and Spiderling");
    const other = spawn(game, "Giant Spider");
    attack(game, a, [spider]);
    expect(counters(game, spider)).toBe(0);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [spider, other]);
    expect(counters(game, spider)).toBe(1);
  });
});

describe("dealt-damage excess", () => {
  it("Fall of Cair Andros: amasses the excess alone, for noncombat damage to an opponent's creature", () => {
    const { game } = table();
    spawn(game, "Fall of Cair Andros");
    const source = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    burn(game, A, source, bears, 5);
    const [army] = armies(game, A);
    expect(army).toBeDefined();
    expect(counters(game, army!)).toBe(3);
  });

  it("Fall of Cair Andros: nothing for exactly lethal, your own creature, or combat damage", () => {
    const { game, a, b } = table();
    spawn(game, "Fall of Cair Andros");
    const source = spawn(game, "Grizzly Bears");
    burn(game, A, source, spawn(game, "Grizzly Bears", B), 2);
    burn(game, A, source, spawn(game, "Grizzly Bears", A), 5);
    expect(armies(game, A)).toHaveLength(0);
    const giant = spawn(game, "Deus of Calamity", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: giant }];
    a.assignCombatDamageFn = (_view, assignment) => standardDamageAssignment(assignment);
    attack(game, a, [giant]);
    settle(game);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(armies(game, A)).toHaveLength(0);
  });

  it("damage already marked counts toward lethal", () => {
    const { game } = table();
    spawn(game, "Fall of Cair Andros");
    const source = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Deus of Calamity", B); // 6/6
    burn(game, A, source, giant, 4);
    expect(armies(game, A)).toHaveLength(0);
    burn(game, A, source, giant, 3);
    const [army] = armies(game, A);
    expect(counters(game, army!)).toBe(1);
  });

  it("sources at once share the event: the trigger fires once, for what they dealt past lethal", () => {
    const { game } = table();
    spawn(game, "Fall of Cair Andros", B);
    // Two Hill Giants deal 2 each to a 2/2 at once: 4 against 2 lethal.
    const target = spawn(game, "Grizzly Bears", A);
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    game.debugApplyEffect(
      B,
      { kind: "each-deals-damage", filter: { name: "Hill Giant" }, amount: 2, to: 0 },
      [ref(target)],
    );
    settle(game);
    const orcs = armies(game, B);
    expect(orcs).toHaveLength(1);
    expect(counters(game, orcs[0]!)).toBe(2);
  });

  it("a creature that survives its excess-free hit doesn't fire on a planeswalker of yours", () => {
    const { game } = table({ deck: "Mountain" });
    const aegar = spawn(game, "Aegar, the Freezing Flame");
    const before = hand(game, A).length;
    // Past a planeswalker's loyalty is excess too (rule 120.4a).
    const walker = spawn(game, "Liliana of the Veil", B);
    burn(game, A, aegar, walker, game.state.objects[walker].counters.loyalty! + 1);
    expect(hand(game, A).length).toBe(before + 1);
    expect(zone(game, walker)).toBe("graveyard");
  });

  it("Fall of Cair Andros: its own 7 damage is what triggers it", () => {
    const { game, a } = table();
    const fall = spawn(game, "Fall of Cair Andros");
    lands(game, "Mountain", 8, A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    activate(game, fall, 0, { targets: [ref(bears)] });
    const [army] = armies(game, A);
    expect(counters(game, army!)).toBe(5);
  });

  it("Magmatic Galleon: one Treasure for one or more creatures dealt excess at once", () => {
    const { game } = table();
    const source = spawn(game, "Grizzly Bears");
    spawn(game, "Magmatic Galleon");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "damage-all", filter: { name: "Grizzly Bears", controlledBy: "opponent" }, amount: 3 }, [], { source });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("Magmatic Galleon: its enters trigger's 5 to a smaller creature makes a Treasure", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5, A);
    const galleon = toHand(game, "Magmatic Galleon");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, galleon);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("Aegar: draws only when a Giant, Wizard or spell you controlled dealt it damage this turn", () => {
    const { game } = table({ deck: "Mountain" });
    const aegar = spawn(game, "Aegar, the Freezing Flame");
    const before = hand(game, A).length;
    const bear = spawn(game, "Grizzly Bears");
    // Excess from a plain Bear, with no Giant, Wizard or spell in its history.
    burn(game, A, bear, spawn(game, "Grizzly Bears", B), 5);
    expect(hand(game, A).length).toBe(before);
    // A Giant (Aegar himself) had hit it first; the Bear then dealt the excess.
    const giant = spawn(game, "Deus of Calamity", B);
    burn(game, A, aegar, giant, 3);
    expect(hand(game, A).length).toBe(before);
    burn(game, A, bear, giant, 4);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Aegar: a spell you controlled counts; an opponent's Giant doesn't", () => {
    const { game, a } = table({ deck: "Mountain" });
    spawn(game, "Aegar, the Freezing Flame");
    lands(game, "Mountain", 2, A);
    const before = hand(game, A).length;
    const bolt = toHand(game, "Lightning Bolt");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, bolt, { targets: [ref(bears)] });
    // Bolt left hand; Aegar drew one back.
    expect(hand(game, A).length).toBe(before + 1);
    const hill = spawn(game, "Hill Giant", B);
    burn(game, B, hill, spawn(game, "Grizzly Bears", B), 5);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
