/**
 * Arabian Nights + Antiquities, group C (B131): the clause most likely to be
 * wrong on each card that is more than a stat line or a copy of a tested
 * pattern.
 */
import { describe, expect, it } from "vitest";
import { A, B, activate, attack, cast, counters, destroy, graveyard, hand, keywords, lands, life, nextTurn, pickTargets, ref, settle, spawn, table, toHand, toStep, watchTargets, zone } from "./harness.js";

describe("Diamond Valley", () => {
  it("gains life equal to the sacrificed creature's toughness, not its power", () => {
    const { game } = table();
    const valley = spawn(game, "Diamond Valley");
    const djinn = spawn(game, "Erhnam Djinn"); // 4/5
    game.dispatch({ type: "activate-ability", player: A, source: valley, abilityIndex: 0, targets: [], sacrifice: djinn });
    settle(game);
    expect(zone(game, djinn)).toBe("graveyard");
    expect(life(game)).toBe(25);
  });
});

describe("Mijae Djinn", () => {
  it("on a lost flip it is removed from combat and deals no damage; on a won flip it connects", () => {
    const outcomes = new Set<boolean>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, a } = table({ seed });
      const djinn = spawn(game, "Mijae Djinn");
      attack(game, a, [djinn]);
      const [flip] = game.eventsOfType("coin-flipped");
      outcomes.add(flip.won);
      expect(life(game, B)).toBe(flip.won ? 14 : 20);
      expect(game.state.objects[djinn].tapped).toBe(true);
    }
    expect(outcomes).toEqual(new Set([true, false]));
  });
});

describe("Khabál Ghoul", () => {
  it("counts every creature that died this turn, under any player's control", () => {
    const { game } = table();
    const ghoul = spawn(game, "Khabál Ghoul");
    destroy(game, spawn(game, "Grizzly Bears", A));
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(counters(game, ghoul)).toBe(2);
  });
});

describe("Erhnam Djinn", () => {
  it("targets only a non-Wall creature an opponent controls, which keeps forestwalk through their turn", () => {
    const { game, a } = table();
    spawn(game, "Erhnam Djinn");
    const mine = spawn(game, "Grizzly Bears", A);
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B); // a second legal target, so the choice is asked
    const seen = watchTargets(a, () => [bears]);
    nextTurn(game); // bob's turn
    toStep(game, "upkeep", A);
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(wall);
    expect(seen.offered[0]).not.toContain(mine);
    expect(keywords(game, bears).has("forestwalk")).toBe(true);
    nextTurn(game); // bob's next turn
    expect(keywords(game, bears).has("forestwalk")).toBe(true);
  });
});

describe("Hurkyl's Recall", () => {
  it("returns the artifacts the target player owns, even one another player controls, and no others", () => {
    const { game, a } = table();
    const bobsRing = spawn(game, "Sol Ring", B);
    const stolen = spawn(game, "Sol Ring", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(stolen)]);
    settle(game);
    expect(game.state.objects[stolen].controller).toBe(A);
    const alicesRing = spawn(game, "Sol Ring", A);
    lands(game, "Island", 2);
    pickTargets(a, B);
    cast(game, toHand(game, "Hurkyl's Recall"), { targets: [ref(B)] });
    expect(hand(game, B)).toContain(bobsRing);
    expect(hand(game, B)).toContain(stolen);
    expect(zone(game, alicesRing)).toBe("battlefield");
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Colossus of Sardia", () => {
  it("stays tapped through the untap step, and untaps for {9} only during its controller's upkeep", () => {
    const { game } = table();
    const colossus = spawn(game, "Colossus of Sardia", A, { tapped: true });
    lands(game, "Wastes", 9);
    expect(() => activate(game, colossus)).toThrow(/refused/);
    nextTurn(game);
    toStep(game, "upkeep", A);
    expect(game.state.objects[colossus].tapped).toBe(true);
    activate(game, colossus);
    expect(game.state.objects[colossus].tapped).toBe(false);
  });
});

describe("Weakstone", () => {
  it("gives every player's attacking creatures -1/-0", () => {
    const { game, a } = table();
    spawn(game, "Weakstone", B);
    const bears = spawn(game, "Grizzly Bears", A);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
  });
});

describe("Argothian Pixies", () => {
  it("is dealt no damage by an artifact creature, but is by another creature", () => {
    const { game } = table();
    const pixies = spawn(game, "Argothian Pixies");
    const colossus = spawn(game, "Colossus of Sardia", B);
    game.debugApplyEffect(A, { kind: "fight", a: 0, b: 1 }, [ref(pixies), ref(colossus)]);
    settle(game);
    // The fight's damage is marked; no priority pass runs state-based actions here.
    expect(game.state.objects[pixies].damageMarked).toBe(0);
    expect(game.state.objects[colossus].damageMarked).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "fight", a: 0, b: 1 }, [ref(pixies), ref(bears)]);
    settle(game);
    expect(game.state.objects[pixies].damageMarked).toBe(2);
  });
});
