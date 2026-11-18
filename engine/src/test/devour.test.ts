/**
 * Devour N (rule 702.82): as the creature is about to enter, its controller
 * may sacrifice any number of creatures (or of the quality "devour land" /
 * "devour Food" names), and it enters with N +1/+1 counters for each.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  counters,
  lands,
  life,
  named,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("devour", () => {
  it("Mycoloth devours two creatures and enters with four counters; the rest stay", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Llanowar Elves");
    const kept = spawn(game, "Hill Giant");
    let offered: readonly string[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return [one, two];
    };
    lands(game, "Forest", 5);
    const myco = toHand(game, "Mycoloth");
    cast(game, myco);
    expect(offered).toContain(kept);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, kept)).toBe("battlefield");
    expect(counters(game, myco)).toBe(4);
  });

  it("devouring nothing, it enters with no counters", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    a.choosePermanentsFn = () => [];
    lands(game, "Forest", 5);
    const myco = toHand(game, "Mycoloth");
    cast(game, myco);
    expect(counters(game, myco)).toBe(0);
  });

  it("only its controller's creatures are offered", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    let offered: readonly string[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return [];
    };
    spawn(game, "Llanowar Elves");
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Mycoloth"));
    expect(offered).not.toContain(theirs);
  });

  it("each token of a stack is its own creature to devour", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Goblin Token", count: 10 });
    const stack = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].stackCount === 10);
    if (stack === undefined) throw new Error("no stack of ten Goblins");
    a.choosePermanentsFn = () => [stack, stack, stack];
    lands(game, "Forest", 5);
    const myco = toHand(game, "Mycoloth");
    cast(game, myco);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(7);
    expect(counters(game, myco)).toBe(6);
  });

  it("Feasting Hobbit devours Foods only", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 2 });
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered = eligible;
      return [...eligible];
    };
    lands(game, "Forest", 2);
    const hobbit = toHand(game, "Feasting Hobbit");
    cast(game, hobbit);
    expect(offered).not.toContain(bears);
    // The eligible list names a stack once: one Food here. Three per Food.
    expect(counters(game, hobbit) % 3).toBe(0);
    expect(counters(game, hobbit)).toBeGreaterThan(0);
  });

  it("Fell Beast of Mordor drains X as it enters, X its +1/+1 counters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    a.choosePermanentsFn = () => [bears, elves];
    lands(game, "Swamp", 4);
    const beast = toHand(game, "Fell Beast of Mordor");
    cast(game, beast);
    expect(counters(game, beast)).toBe(2);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
    expect(named(game, "Grizzly Bears").every((id) => zone(game, id) === "graveyard")).toBe(true);
  });

  it("Thromok the Insatiable: devour X, X the number devoured — three devoured is nine counters (its ruling)", () => {
    const { game, a } = table();
    const eaten = [spawn(game, "Grizzly Bears"), spawn(game, "Llanowar Elves"), spawn(game, "Hill Giant")];
    a.choosePermanentsFn = () => eaten;
    lands(game, "Mountain", 3);
    lands(game, "Forest", 2);
    const thromok = toHand(game, "Thromok the Insatiable");
    cast(game, thromok);
    expect(eaten.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(zone(game, thromok)).toBe("battlefield");
    expect(counters(game, thromok)).toBe(9);
  });

  it("Thromok devouring two enters with four counters; devouring none, it's a 0/0 and dies", () => {
    const two = table();
    const eaten = [spawn(two.game, "Grizzly Bears"), spawn(two.game, "Llanowar Elves")];
    two.a.choosePermanentsFn = () => eaten;
    lands(two.game, "Mountain", 3);
    lands(two.game, "Forest", 2);
    const thromok = toHand(two.game, "Thromok the Insatiable");
    cast(two.game, thromok);
    expect(counters(two.game, thromok)).toBe(4);

    const none = table();
    spawn(none.game, "Grizzly Bears");
    none.a.choosePermanentsFn = () => [];
    lands(none.game, "Mountain", 3);
    lands(none.game, "Forest", 2);
    const hungry = toHand(none.game, "Thromok the Insatiable");
    cast(none.game, hungry);
    expect(zone(none.game, hungry)).toBe("graveyard");
  });
});
