/**
 * Planar Chaos, group D: the split cards, Frenetic Sliver's coin flip,
 * Reality Acid's leaves trigger, Serra's Boon's colour gate, Cradle to Grave's
 * "entered this turn" and vanishing — the clause of each most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  enter,
  zone,
} from "./harness.js";

describe("Boom // Bust", () => {
  it("Boom destroys a land you control and a land you don't", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const mine = spawn(game, "Forest");
    const theirs = spawn(game, "Island", B);
    const other = spawn(game, "Island", B);
    cast(game, toHand(game, "Boom // Bust"), { face: 1, targets: [ref(mine), ref(theirs)] });
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("Bust destroys all lands", () => {
    const { game } = table();
    const mountains = lands(game, "Mountain", 6);
    const theirs = spawn(game, "Island", B);
    cast(game, toHand(game, "Boom // Bust"), { face: 2 });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(mountains.every((m) => zone(game, m) === "graveyard")).toBe(true);
  });
});

describe("Dead // Gone", () => {
  it("Gone can't target your own creature, and bounces an opponent's", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Dead // Gone");
    expect(() => cast(game, card, { face: 2, targets: [ref(mine)] })).toThrow();
    cast(game, card, { face: 2, targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("hand");
  });

  it("Dead deals 2 damage to a creature", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Dead // Gone"), { face: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Rough // Tumble", () => {
  it("Rough hits only creatures without flying; Tumble only fliers", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    const card = toHand(game, "Rough // Tumble");
    cast(game, card, { face: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
    const card2 = toHand(game, "Rough // Tumble");
    cast(game, card2, { face: 2 });
    expect(zone(game, drake)).toBe("graveyard");
  });
});

describe("Frenetic Sliver", () => {
  it("activated twice in response, only one coin is flipped; a win returns it at the end step", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game } = table({ seed });
      const sliver = spawn(game, "Frenetic Sliver");
      activate(game, sliver, 0, { settle: false });
      activate(game, sliver, 0, { settle: false });
      settle(game);
      const flips = game.eventsOfType("coin-flipped");
      expect(flips).toHaveLength(1);
      if (flips[0].won) {
        expect(zone(game, sliver)).toBe("exile");
        toStep(game, "end");
        settle(game);
        expect(game.state.objects[sliver]?.zone === "battlefield" || spawnedBack(game)).toBe(true);
      } else {
        expect(zone(game, sliver)).toBe("graveyard");
      }
    }
  });

  it("an opponent's Sliver has the ability too", () => {
    const { game } = table();
    spawn(game, "Frenetic Sliver");
    const theirs = spawn(game, "Frenetic Sliver", B);
    // Bob activates it, holding priority isn't needed: pass to him first.
    game.dispatch({ type: "pass-priority", player: A });
    const why = game.canDispatch({ type: "activate-ability", player: B, source: theirs, abilityIndex: 0, targets: [] });
    expect(why).toBeNull();
  });
});

/** A Frenetic Sliver back on the battlefield as a new object (rule 400.7). */
function spawnedBack(game: ReturnType<typeof table>["game"]): boolean {
  return Object.values(game.state.objects).some(
    (o) => o.cardName === "Frenetic Sliver" && o.zone === "battlefield" && o.controller === A,
  );
}

describe("Reality Acid", () => {
  it("enters with three time counters; when it leaves, the enchanted permanent's controller sacrifices it", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const acid = toHand(game, "Reality Acid");
    cast(game, acid, { targets: [ref(bears)] });
    expect(zone(game, acid)).toBe("battlefield");
    expect(counters(game, acid, "time")).toBe(3);
    destroy(game, acid);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Serra's Boon", () => {
  it("+1/+2 on a white creature, -2/-1 on any other", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const lions = spawn(game, "Savannah Lions");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, lions);
    cast(game, toHand(game, "Serra's Boon"), { targets: [ref(lions)] });
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 3 });
    pickTargets(a, giant);
    cast(game, toHand(game, "Serra's Boon"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Cradle to Grave", () => {
  it("can target only a nonblack creature that entered this turn", () => {
    const { game } = table();
    const old = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Swamp", 2);
    const fresh = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Cradle to Grave");
    expect(() => cast(game, card, { targets: [ref(old)] })).toThrow();
    cast(game, card, { targets: [ref(fresh)] });
    expect(zone(game, fresh)).toBe("graveyard");
    expect(zone(game, old)).toBe("battlefield");
  });
});

describe("Waning Wurm", () => {
  it("enters with two time counters and is sacrificed when the last comes off", () => {
    const { game } = table();
    const wurm = enter(game, "Waning Wurm");
    expect(counters(game, wurm, "time")).toBe(2);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, wurm, "time")).toBe(1);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});
