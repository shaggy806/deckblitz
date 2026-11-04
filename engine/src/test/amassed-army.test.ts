/**
 * "The amassed Army": the Army an amass chose, counters or none (rule 701.47,
 * the rulings) — the `"amassed"` ref and this-way kind. Read at once (Surrounded
 * by Orcs, Widespread Brutality, Goblin Plate Mail) or by a reflexive ability
 * (Foray of Orcs, Grishnákh, Brash Instigator).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

const army = (game: Game): ObjectId => {
  const armies = named(game, "Army Token", A);
  expect(armies).toHaveLength(1);
  return armies[0];
};

describe("Surrounded by Orcs", () => {
  it("no Army: a new one gets three counters, and the target mills three", () => {
    const { game } = table();
    lands(game, "Island", 4);
    cast(game, toHand(game, "Surrounded by Orcs"), { targets: [ref(B)] });
    expect(pt(game, army(game)).power).toBe(3);
    expect(graveyard(game, B)).toHaveLength(3);
  });

  it("an Army already: X is its whole power, not just the counters put", () => {
    const { game } = table();
    lands(game, "Island", 8);
    cast(game, toHand(game, "Surrounded by Orcs"), { targets: [ref(B)] });
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Surrounded by Orcs"), { targets: [ref(B)] });
    expect(counters(game, army(game))).toBe(6);
    expect(graveyard(game, B).length - before).toBe(6);
  });

  it("two Armies: the one chosen is the one read", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const small = spawn(game, "Army Token");
    const big = spawn(game, "Army Token");
    game.state.objects[big].counters["+1/+1"] = 5;
    game.state.objects[small].counters["+1/+1"] = 1;
    const seen = pickPermanents(a, big);
    cast(game, toHand(game, "Surrounded by Orcs"), { targets: [ref(B)] });
    expect(seen.offered).toContain(small);
    expect(counters(game, big)).toBe(8);
    expect(graveyard(game, B)).toHaveLength(8);
  });
});

describe("Widespread Brutality", () => {
  it("the Army deals damage equal to its power to each non-Army creature, and takes none", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const ours = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Widespread Brutality"));
    expect(zone(game, ours)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");
    expect(game.state.objects[big].damageMarked).toBe(2);
    expect(game.state.objects[army(game)].damageMarked).toBe(0);
  });

  it("the Army is the source: with lifelink its controller gains the life", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const held = spawn(game, "Army Token");
    game.state.objects[held].counters["+1/+1"] = 1;
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" }, [ref(held)]);
    cast(game, toHand(game, "Widespread Brutality"));
    // Three damage to each of two Bears.
    expect(life(game)).toBe(26);
  });
});

describe("Goblin Plate Mail", () => {
  it("amasses, then attaches to the amassed Army: +1/+0 and menace", () => {
    const { game } = table();
    const mail = enter(game, "Goblin Plate Mail");
    const goblin = army(game);
    expect(game.state.objects[mail].attachedTo).toBe(goblin);
    expect(pt(game, goblin).power).toBe(2);
    expect(keywords(game, goblin).has("menace")).toBe(true);
  });

  it("two Armies: it goes on the one chosen, and equip moves it for {4}", () => {
    const { game, a } = table();
    const first = spawn(game, "Army Token");
    const second = spawn(game, "Army Token");
    game.state.objects[first].counters["+1/+1"] = 1;
    game.state.objects[second].counters["+1/+1"] = 2;
    pickPermanents(a, first);
    const mail = enter(game, "Goblin Plate Mail");
    expect(game.state.objects[mail].attachedTo).toBe(first);
    lands(game, "Swamp", 4);
    game.dispatch({ type: "activate-ability", player: A, source: mail, abilityIndex: 0, targets: [ref(second)] });
    settle(game);
    expect(game.state.objects[mail].attachedTo).toBe(second);
  });
});

describe("Foray of Orcs", () => {
  it("the reflexive ability goes on the stack apart from the spell, its target chosen then", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    const foray = toHand(game, "Foray of Orcs");
    cast(game, foray);
    expect(seen.asked).toBe(1);
    expect(zone(game, foray)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, army(game)).power).toBe(2);
  });

  it("X is the Army's whole power", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const held = spawn(game, "Army Token");
    game.state.objects[held].counters["+1/+1"] = 3;
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, dreadmaw);
    cast(game, toHand(game, "Foray of Orcs"));
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
  });

  it("read as it resolves: the Army gone in response, as it last was (rule 608.2h)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, dreadmaw);
    cast(game, toHand(game, "Foray of Orcs"), { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && named(game, "Army Token", A).length === 1);
    const goblin = army(game);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(goblin)]);
    settle(game);
    expect(game.state.objects[dreadmaw].damageMarked).toBe(2);
  });

  it("no creature an opponent controls: the ability's removed, the Army stays", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Foray of Orcs"));
    expect(pt(game, army(game)).power).toBe(2);
  });
});

describe("Grishnákh, Brash Instigator", () => {
  it("takes a creature of no more power than the Army: untapped, hasty, until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Llanowar Elves", B);
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Grishnákh, Brash Instigator");
    expect(seen.asked).toBe(1);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
  });

  it("not one stronger than the Army, a legendary one, or your own", () => {
    const { game, a } = table();
    const big = spawn(game, "Colossal Dreadmaw", B);
    const legend = spawn(game, "Isamaru, Hound of Konda", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const ours = spawn(game, "Llanowar Elves");
    const seen = watchTargets(a, (offered) => [offered[0][0] as ObjectId]);
    enter(game, "Grishnákh, Brash Instigator");
    expect([...seen.offered[0]].sort()).toEqual([bears, elves].sort());
    expect(seen.offered[0]).not.toContain(big);
    expect(seen.offered[0]).not.toContain(legend);
    expect(seen.offered[0]).not.toContain(ours);
  });

  it("the bigger the Army, the bigger the reach", () => {
    const { game, a } = table();
    const held = spawn(game, "Army Token");
    game.state.objects[held].counters["+1/+1"] = 4;
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, dreadmaw);
    enter(game, "Grishnákh, Brash Instigator");
    expect(controller(game, dreadmaw)).toBe(A);
  });

  it("the Army shrunk in response: the target is illegal as it resolves, and it stays put", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Grishnákh, Brash Instigator", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && named(game, "Army Token", A).length === 1);
    const goblin = army(game);
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" }, [ref(goblin)]);
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });
});
