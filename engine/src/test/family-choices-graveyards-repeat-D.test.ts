/**
 * B251 group D — "repeat this process" cards: each test checks the clause most likely to be
 * wrong, usually the repeat's stop condition.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  enter,
  grant,
  graveyard,
  hand,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Cultivator Colossus", () => {
  it("puts lands and draws until declined", () => {
    const { game, a } = table();
    const handBefore = hand(game).length;
    let asked = 0;
    a.chooseFromZoneFn = (_view, eligible) => (asked++ < 2 ? [eligible[0]!] : []);
    const colossus = enter(game, "Cultivator Colossus");
    expect(asked).toBe(3);
    expect(named(game, "Wastes", A)).toHaveLength(2);
    expect(hand(game)).toHaveLength(handBefore);
    expect(pt(game, colossus)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Demonlord Belzenlok", () => {
  it("repeats past a mana value 4 card, stops at a smaller one, and deals 1 per card", () => {
    const { game } = table();
    // From the top: Hill Giant (4), Wastes, Grizzly Bears (2), Hill Giant.
    const lastGiant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const wastes = toLibrary(game, "Wastes");
    const giant = toLibrary(game, "Hill Giant");
    enter(game, "Demonlord Belzenlok");
    expect(hand(game)).toContain(giant);
    expect(hand(game)).toContain(bears);
    expect(hand(game)).not.toContain(lastGiant);
    expect(zone(game, wastes)).toBe("exile");
    expect(life(game)).toBe(18);
  });
});

describe("Exponential Growth", () => {
  it("doubles the power X times, one after another", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Exponential Growth"), { targets: [ref(bears)], x: 3 });
    expect(pt(game, bears)).toEqual({ power: 16, toughness: 2 });
  });
});

describe("Forbidden Ritual", () => {
  it("each pass you sacrifice, they lose 2 unless they pay; you choose whether to go again", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Grizzly Bears");
    const permanentsBefore = game.battlefield.filter((id) => game.state.objects[id].controller === A).length;
    let asked = 0;
    a.chooseModesFn = () => (asked++ < 1 ? [0] : []);
    b.chooseModesFn = () => [];
    cast(game, toHand(game, "Forbidden Ritual"), { targets: [ref(B)] });
    expect(asked).toBe(2);
    expect(life(game, B)).toBe(16);
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === A)).toHaveLength(permanentsBefore - 2);
  });
});

describe("Kindle the Carnage", () => {
  it("each pass is its own damage, by the mana value discarded", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" });
    settle(game);
    toHand(game, "Hill Giant");
    toHand(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const target = spawn(game, "Hill Giant", B);
    grant(game, target, "indestructible");
    let asked = 0;
    a.chooseModesFn = () => (asked++ < 1 ? [0] : []);
    cast(game, toHand(game, "Kindle the Carnage"));
    expect(asked).toBe(2);
    expect(hand(game)).toHaveLength(0);
    expect(game.state.objects[target].damageMarked).toBe(6);
  });
});

describe("Insatiable Frugivore", () => {
  it("a Food each pass, going on while three cards are exiled", () => {
    const { game, a } = table();
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    a.chooseModesFn = () => [0];
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 3);
    enter(game, "Insatiable Frugivore");
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
    expect(graveyard(game)).toHaveLength(1);
  });
});

describe("Oath of Lim-Dûl", () => {
  it("one sacrifice for each 1 life lost, never itself", () => {
    const { game, a } = table();
    const oath = spawn(game, "Oath of Lim-Dûl");
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears");
    a.chooseModesFn = () => [];
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2, who: "you" });
    settle(game);
    expect(zone(game, oath)).toBe("battlefield");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });

  it("or a discard instead, each time", () => {
    const { game, a } = table();
    spawn(game, "Oath of Lim-Dûl");
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    a.chooseModesFn = () => [0];
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" });
    settle(game);
    expect(hand(game)).toHaveLength(before - 3);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});
