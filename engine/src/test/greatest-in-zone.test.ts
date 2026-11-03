/**
 * `greatestInZone`: one comparison over everything in an object's zone, ties
 * counted — on the battlefield whoever controls it, in a graveyard that
 * graveyard — as a target filter (Topple), a static's scope (Favor of the
 * Mighty), an effect's filter (Desecrator Hag) and a condition about a target,
 * the triggering object, an Aura's host, or whether an opponent has one
 * (Getaway Glamer, Strength-Testing Hammer, Historian's Wisdom, Might Makes
 * Right).
 */
import { describe, expect, it } from "vitest";
import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  controller,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const GREATEST_POWER = { type: "creature", greatestInZone: { of: "power", among: { type: "creature" } } } as const;

describe("greatestInZone, the filter", () => {
  it("compares across every controller, and ties all match", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A); // 2/2
    const theirs = spawn(game, "Hill Giant", B); // 3/3
    const mine = spawn(game, "Hill Giant", A); // 3/3
    const reads = (id: ObjectId): boolean => matchesFilter(game.state, game.registry, id, GREATEST_POWER, { you: A });
    expect(reads(bears)).toBe(false);
    expect(reads(theirs)).toBe(true);
    expect(reads(mine)).toBe(true);
  });

  it("doesn't count an eliminated player's permanents", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Hill Giant", C);
    const reads = (): boolean => matchesFilter(game.state, game.registry, bears, GREATEST_POWER, { you: A });
    expect(reads()).toBe(false);
    game.state.players[C].hasLost = true;
    expect(reads()).toBe(true);
  });

  it("doesn't match in a hand", () => {
    const { game } = table();
    const card = toHand(game, "Hill Giant", A);
    expect(matchesFilter(game.state, game.registry, card, GREATEST_POWER, { you: A })).toBe(false);
  });
});

describe("Topple", () => {
  it("can target only the greatest, either of a tie, and exiles it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const mine = spawn(game, "Hill Giant", A);
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 3);
    const spell = toHand(game, "Topple");
    expect(() => cast(game, spell, { targets: [ref(bears)] })).toThrow();
    cast(game, spell, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("does nothing if its target is no longer the greatest as it resolves (rule 608.2b)", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    const spell = toHand(game, "Topple");
    cast(game, spell, { targets: [ref(giant)], settle: false });
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 5, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, spell)).toBe("graveyard");
  });
});

describe("Favor of the Mighty", () => {
  it("protects each creature with the greatest mana value, whoever controls it, and moves on", () => {
    const { game } = table();
    spawn(game, "Favor of the Mighty", A);
    const bears = spawn(game, "Grizzly Bears", A); // 2
    const mine = spawn(game, "Hill Giant", A); // 4
    const theirs = spawn(game, "Hill Giant", B); // 4
    lands(game, "Swamp", 6);
    const murder = (id: ObjectId): void => cast(game, toHand(game, "Murder"), { targets: [ref(id)] });

    expect(() => murder(mine)).toThrow();
    expect(() => murder(theirs)).toThrow();
    murder(bears);
    expect(zone(game, bears)).toBe("graveyard");

    // A greater one takes it from them.
    spawn(game, "Colossal Dreadmaw", B); // 6
    murder(theirs);
    expect(zone(game, theirs)).toBe("graveyard");
  });

});

describe("Getaway Glamer", () => {
  it("destroys the target with no greater creature, a tie included", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", A);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Getaway Glamer"), { modes: [1], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("leaves a target something else has greater power than", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", A);
    lands(game, "Plains", 3);
    const spell = toHand(game, "Getaway Glamer");
    cast(game, spell, { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, spell)).toBe("graveyard");
  });

  it("both modes: the exile first, in printed order, and its card comes back at the end step", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Getaway Glamer"), { modes: [0, 1], targets: [ref(giant), ref(bears)] });
    // The giant's gone, so nothing has greater power than the bears.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Hill Giant", A)).toHaveLength(1);
  });

  it("the exile can't target a token", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const [token] = named(game, "Soldier Token", B);
    lands(game, "Plains", 2);
    expect(() => cast(game, toHand(game, "Getaway Glamer"), { modes: [0], targets: [ref(token)] })).toThrow();
  });
});

describe("Might Makes Right", () => {
  const combat = (mine: readonly string[], theirs: readonly string[]) => {
    const t = table();
    spawn(t.game, "Might Makes Right", A);
    for (const name of mine) spawn(t.game, name, A);
    const ids = theirs.map((name) => spawn(t.game, name, B, { tapped: true }));
    return { ...t, ids };
  };

  it("takes the creature when you control each with the greatest power", () => {
    const { game, a, ids } = combat(["Hill Giant"], ["Grizzly Bears"]);
    pickTargets(a, ids[0]);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, ids[0])).toBe(A);
    expect(game.state.objects[ids[0]].tapped).toBe(false);
    expect(keywords(game, ids[0]).has("haste")).toBe(true);
  });

  it("doesn't trigger on a tie with an opponent's creature", () => {
    const { game, ids } = combat(["Hill Giant"], ["Hill Giant"]);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, ids[0])).toBe(B);
  });

  it("doesn't trigger when you have none of the greatest", () => {
    const { game, ids } = combat(["Grizzly Bears"], ["Hill Giant"]);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, ids[0])).toBe(B);
  });
});

describe("Historian's Wisdom", () => {
  const wisdom = (host: string, other: string) => {
    const t = table();
    const id = spawn(t.game, host, A);
    spawn(t.game, other, B);
    lands(t.game, "Forest", 3);
    const spell = toHand(t.game, "Historian's Wisdom");
    const before = hand(t.game, A).length;
    cast(t.game, spell, { targets: [ref(id)] });
    // The spell left the hand, so one card back is no card drawn.
    return { ...t, id, drew: hand(t.game, A).length - (before - 1) };
  };

  it("draws when the host, with its +2/+1, is the greatest", () => {
    const { game, id, drew } = wisdom("Grizzly Bears", "Hill Giant"); // 4/3 against 3/3
    expect(drew).toBe(1);
    expect(pt(game, id)).toEqual({ power: 4, toughness: 3 });
  });

  it("draws nothing when something is greater", () => {
    expect(wisdom("Grizzly Bears", "Colossal Dreadmaw").drew).toBe(0);
  });

  it("draws nothing and gives nothing on a host that isn't a creature", () => {
    const { game, id, drew } = wisdom("Sol Ring", "Grizzly Bears");
    expect(drew).toBe(0);
    expect(pt(game, id).power).toBe(0);
  });
});

describe("Strength-Testing Hammer", () => {
  const swing = (other: string) => {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears", A);
    spawn(t.game, other, B);
    const hammer = spawn(t.game, "Strength-Testing Hammer", A);
    lands(t.game, "Wastes", 3);
    activate(t.game, hammer, 0, { targets: [ref(bears)] });
    const before = hand(t.game, A).length;
    attack(t.game, t.a, [bears]);
    return { ...t, bears, drew: hand(t.game, A).length - before };
  };

  it("adds the roll and draws once it's the greatest of them", () => {
    // The smallest roll makes a 3/2, tied with the Giant at worst.
    const { game, bears, drew } = swing("Hill Giant");
    const { power } = pt(game, bears);
    expect(power).toBeGreaterThanOrEqual(3);
    expect(power).toBeLessThanOrEqual(8);
    expect(drew).toBe(1);
  });

  it("draws nothing when the roll can't reach the greatest", () => {
    expect(swing("Ghalta, Primal Hunger").drew).toBe(0); // at most 8 against 12
  });

  it("reads a creature that has left as it last was, and still adds nothing to it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Colossal Dreadmaw", B); // 6/6
    const hammer = spawn(game, "Strength-Testing Hammer", A);
    lands(game, "Wastes", 3);
    activate(game, hammer, 0, { targets: [ref(bears)] });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    const before = hand(game, A).length;
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, bears);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    // As it last was, a 2/2 against a 6/6.
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Desecrator Hag", () => {
  it("returns the greatest with no decision when it's alone, from your graveyard only", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant", A);
    const bears = toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Colossal Dreadmaw", B);
    enter(game, "Desecrator Hag", A);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("asks among the tied, and only them", () => {
    const { game, a } = table();
    const one = toGraveyard(game, "Hill Giant", A);
    const two = toGraveyard(game, "Hill Giant", A);
    toGraveyard(game, "Grizzly Bears", A);
    const asked = pickFromZone(a, two);
    enter(game, "Desecrator Hag", A);
    expect([...asked.offered].sort()).toEqual([one, two].sort());
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, one)).toBe("graveyard");
  });

  it("does nothing with no creature card there", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    enter(game, "Desecrator Hag", A);
    expect(zone(game, bolt)).toBe("graveyard");
  });
});
