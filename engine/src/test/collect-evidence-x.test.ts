/**
 * Collect evidence X (rule 701.59a: "exile any number of cards from your
 * graveyard with total mana value N or greater"), X chosen as the ability
 * resolves — Incinerator of the Guilty's "you may collect evidence X. When you
 * do, this creature deals X damage to each creature and planeswalker that
 * player controls". X can't be more than the graveyard holds (701.59b), the
 * damage is X rather than the mana value exiled, and collecting evidence 0
 * with nothing exiled is still collecting (the card's ruling). The "when you
 * do" is a reflexive triggered ability (rule 603.12).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, attack, pickFromZone, pickModes, spawn, table, toGraveyard, tokensNamed, zone } from "./harness.js";

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("collect evidence X (Incinerator of the Guilty)", () => {
  it("X is chosen up to the graveyard's total mana value; X damage to that player's creatures and planeswalkers only", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Incinerator of the Guilty");
    const giant = toGraveyard(game, "Hill Giant"); // 4
    const bears = toGraveyard(game, "Grizzly Bears"); // 2
    const theirGiant = spawn(game, "Hill Giant", B); // 3/3
    const theirBears = spawn(game, "Grizzly Bears", B); // 2/2
    const mine = spawn(game, "Grizzly Bears", A);
    pickModes(a, 0);
    let asked: { min: number; max?: number } | undefined;
    a.chooseNumberFn = (_view, offer) => {
      asked = { min: offer.min, ...(offer.max !== undefined ? { max: offer.max } : {}) };
      return 2;
    };
    // X is 2, paid for with the 4-drop: the damage is X, not what was exiled.
    pickFromZone(a, giant);
    attack(game, a, [dragon]);
    expect(asked).toEqual({ min: 0, max: 6 });
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("graveyard");
    expect(zone(game, theirGiant)).toBe("battlefield");
    expect(damageOn(game, theirGiant)).toBe(2);
    expect(zone(game, mine)).toBe("battlefield");
    expect(damageOn(game, mine)).toBe(0);
    expect(damageOn(game, dragon)).toBe(0);
  });

  it("the cards exiled must total X or more, and collecting can't be declined once X is chosen", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Incinerator of the Guilty");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseNumberFn = () => 5;
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone");
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [giant] })).toMatch(/total mana value/);
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [] })).not.toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [giant, bears] })).toBeNull();
  });

  it("the reflexive ability is on the stack with X, and is responded to", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Incinerator of the Guilty");
    const giant = toGraveyard(game, "Hill Giant");
    const theirBears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    a.chooseNumberFn = () => 4;
    pickFromZone(a, giant);
    a.declareAttackersFn = () => [{ attacker: dragon, defender: B }];
    game.advanceUntil((s) => s.objects[giant].zone === "exile" && s.awaiting === null && s.zones.shared.stack.length === 1);
    // The trigger that collected has left the stack; this is the reflexive one, not yet resolved.
    expect(zone(game, theirBears)).toBe("battlefield");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, theirBears)).toBe("graveyard");
  });

  it("declining the may: nothing is asked, exiled or dealt", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Incinerator of the Guilty");
    const giant = toGraveyard(game, "Hill Giant");
    const theirBears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    let asked = false;
    a.chooseNumberFn = () => {
      asked = true;
      return 4;
    };
    attack(game, a, [dragon]);
    expect(asked).toBe(false);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, theirBears)).toBe("battlefield");
  });

  it("collecting evidence 0 from an empty graveyard is still collecting evidence", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Incinerator of the Guilty");
    spawn(game, "Surveillance Monitor");
    const theirBears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    attack(game, a, [dragon]);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    expect(zone(game, theirBears)).toBe("battlefield");
    expect(game.events.some((e) => e.type === "evidence-collected" && e.amount === 0 && e.objects.length === 0)).toBe(true);
  });
});
