/**
 * `{ basePowerOf }` (rule 613.4b): an amount reading a creature's base power —
 * what layer 7b and before made it, nothing that only modifies it (Curie,
 * Emergent Intelligence's "draw cards equal to its base power"). And Curie's
 * "Exile another nontoken artifact creature you control" cost
 * (`exilesSacrifice`), whose exiled creature it becomes a copy of; and Arni
 * Brokenbrow's base power set to an amount that may be negative (107.1b).
 */

import { describe, expect, it } from "vitest";

import { A, activate, attack, hand, pt, spawn, table, zone } from "./harness.js";

describe("draw cards equal to its base power", () => {
  it("Curie draws its base power, not its power with counters", () => {
    const { game, a } = table();
    const curie = spawn(game, "Curie, Emergent Intelligence");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [{ kind: "object", object: curie }]);
    expect(pt(game, curie).power).toBe(3);
    const before = hand(game).length;
    attack(game, a, [curie]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Curie exiles a nontoken artifact creature and becomes a copy of it, drawing by the copy's base power", () => {
    const { game, a } = table();
    const curie = spawn(game, "Curie, Emergent Intelligence");
    const wurmcoil = spawn(game, "Wurmcoil Engine");
    spawn(game, "Island");
    spawn(game, "Island");
    activate(game, curie, 0, { sacrifice: wurmcoil });
    expect(zone(game, wurmcoil)).toBe("exile");
    expect(game.state.objects[curie].copyOf).toBe("Wurmcoil Engine");
    expect(pt(game, curie)).toEqual({ power: 6, toughness: 6 });
    const before = hand(game).length;
    attack(game, a, [curie]);
    // The copy's gained trigger: six cards. (Wurmcoil's lifelink too.)
    expect(hand(game).length).toBe(before + 6);
    expect(game.state.players[A].life).toBe(26);
  });

  it("can't exile itself, a token, or a creature that isn't an artifact", () => {
    const { game } = table();
    const curie = spawn(game, "Curie, Emergent Intelligence");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Island");
    spawn(game, "Island");
    game.debugApplyEffect(A, { kind: "create-token", token: "Thopter Token", count: 1 }, []);
    const thopter = game.battlefield.find((id) => game.state.objects[id].cardName === "Thopter Token")!;
    const offers = game
      .legalActions(A)
      .filter((x) => x.kind === "activate-ability" && x.source === curie);
    expect(offers).toHaveLength(0);
    for (const sacrifice of [curie, bears, thopter]) {
      expect(
        game.canDispatch({ type: "activate-ability", player: A, source: curie, abilityIndex: 0, targets: [], sacrifice }),
      ).not.toBeNull();
    }
  });
});

describe("base power set to an amount", () => {
  it("Arni Brokenbrow's boast sets its base power to 1 plus the greatest other power", () => {
    const { game, a } = table();
    const arni = spawn(game, "Arni Brokenbrow");
    spawn(game, "Hill Giant");
    spawn(game, "Mountain");
    attack(game, a, [arni]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [{ kind: "object", object: arni }]);
    a.chooseModesFn = () => [0];
    activate(game, arni, 0);
    // Base 4 (1 + Hill Giant's 3), toughness untouched, the counter on top.
    expect(pt(game, arni)).toEqual({ power: 5, toughness: 4 });
  });

  it("a negative greatest power sets a negative base power (rule 107.1b)", () => {
    const { game, a } = table();
    const arni = spawn(game, "Arni Brokenbrow");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Mountain");
    attack(game, a, [arni]);
    game.debugApplyEffect(
      A,
      { kind: "modify-pt", target: 0, power: -5, toughness: 0, duration: "end-of-turn" },
      [{ kind: "object", object: bears }],
    );
    expect(pt(game, bears).power).toBe(-3);
    a.chooseModesFn = () => [0];
    activate(game, arni, 0);
    expect(pt(game, arni).power).toBe(-2);
  });
});
