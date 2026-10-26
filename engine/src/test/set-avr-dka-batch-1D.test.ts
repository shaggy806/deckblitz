/**
 * Avacyn Restored and Dark Ascension (B185), group D. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Falkenrath Aristocrat", () => {
  it("gains indestructible, and a +1/+1 counter only for a sacrificed Human", () => {
    const { game } = table();
    const aristocrat = spawn(game, "Falkenrath Aristocrat");
    const bear = spawn(game, "Grizzly Bears");

    game.dispatch({ type: "activate-ability", player: A, source: aristocrat, abilityIndex: 0, targets: [], sacrifice: bear });
    toStep(game, "precombat-main");
    expect(zone(game, bear)).toBe("graveyard");
    expect(counters(game, aristocrat)).toBe(0);
    expect(keywords(game, aristocrat).has("indestructible")).toBe(false); // a new turn: it wore off

    // Spawned now, so its werewolf trigger hasn't turned it into a non-Human.
    const human = spawn(game, "Scorned Villager");

    game.dispatch({ type: "activate-ability", player: A, source: aristocrat, abilityIndex: 0, targets: [], sacrifice: human });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, human)).toBe("graveyard");
    expect(counters(game, aristocrat)).toBe(1);
    expect(keywords(game, aristocrat).has("indestructible")).toBe(true);
  });

  it("sacrificing itself gives nothing", () => {
    const { game } = table();
    const aristocrat = spawn(game, "Falkenrath Aristocrat");
    game.dispatch({ type: "activate-ability", player: A, source: aristocrat, abilityIndex: 0, targets: [], sacrifice: aristocrat });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, aristocrat)).toBe("graveyard");
  });
});

describe("Hunger of the Howlpack", () => {
  it("puts one counter, or three once a creature died this turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const target = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Hunger of the Howlpack"), { targets: [ref(target)] });
    expect(counters(game, target)).toBe(1);

    destroy(game, spawn(game, "Grizzly Bears", B));
    cast(game, toHand(game, "Hunger of the Howlpack"), { targets: [ref(target)] });
    expect(counters(game, target)).toBe(4);
  });
});

describe("Ghoultree", () => {
  it("costs {1} less for each creature card in your graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const tree = toHand(game, "Ghoultree");
    expect(() => cast(game, tree)).toThrow();
    for (let i = 0; i < 4; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest"); // a land card doesn't count
    cast(game, tree);
    expect(zone(game, tree)).toBe("battlefield");
  });
});

describe("Lone Revenant", () => {
  it("puts one of the top four into your hand when it's your only creature", () => {
    const { game, a } = table();
    const revenant = spawn(game, "Lone Revenant");
    const before = hand(game).length;
    attack(game, a, [revenant]);
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't trigger beside another creature", () => {
    const { game, a } = table();
    const revenant = spawn(game, "Lone Revenant");
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [revenant]);
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before);
  });
});

describe("Scroll of Griselbrand", () => {
  it("makes the opponent discard, and lose 3 life only if you control a Demon", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const plain = spawn(game, "Scroll of Griselbrand");
    const bobHand = hand(game, B).length;
    game.dispatch({ type: "activate-ability", player: A, source: plain, abilityIndex: 0, targets: [ref(B)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(hand(game, B).length).toBe(bobHand - 1);
    expect(life(game, B)).toBe(20);

    spawn(game, "Bloodgift Demon");
    const scroll = spawn(game, "Scroll of Griselbrand");
    game.dispatch({ type: "activate-ability", player: A, source: scroll, abilityIndex: 0, targets: [ref(B)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(hand(game, B).length).toBe(bobHand - 2);
    expect(life(game, B)).toBe(17);
  });
});

describe("Triumph of Cruelty", () => {
  it("makes the opponent discard at your upkeep only while you have the greatest power", () => {
    const { game } = table();
    spawn(game, "Triumph of Cruelty");
    spawn(game, "Grizzly Bears");
    const bobHand = hand(game, B).length;
    toStep(game, "draw");
    // Bob drew one in his turn and discarded one at alice's upkeep.
    expect(hand(game, B).length).toBe(bobHand);

    spawn(game, "Bloodgift Demon", B);
    const now = hand(game, B).length;
    toStep(game, "draw");
    // Bob drew in his own turn, but discarded nothing at alice's upkeep.
    expect(hand(game, B).length).toBe(now + 1);
  });
});
