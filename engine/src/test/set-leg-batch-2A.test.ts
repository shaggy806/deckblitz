/**
 * Legends, batch 2 group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Puppet Master", () => {
  it("returns the dead creature, then itself if you pay {U}{U}{U}", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 6);
    cast(game, toHand(game, "Puppet Master"), { targets: [ref(bears)] });
    expect(named(game, "Puppet Master")).toHaveLength(1);
    pickModes(a, 0);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
    const handNames = hand(game).map((id) => game.state.objects[id].cardName);
    expect(handNames).toContain("Puppet Master");
    expect(game.state.players[A].manaPool).toHaveLength(0);
    expect(game.battlefield.filter((id) => game.state.objects[id].tapped)).toHaveLength(6);
  });

  it("stays in the graveyard when you decline to pay", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 6);
    cast(game, toHand(game, "Puppet Master"), { targets: [ref(bears)] });
    pickModes(a);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("hand");
    const handNames = hand(game).map((id) => game.state.objects[id].cardName);
    expect(handNames).not.toContain("Puppet Master");
  });
});

describe("Cocoon", () => {
  it("taps and locks the creature while it has pupa counters, then hatches it with flying", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Cocoon"), { targets: [ref(bears)] });
    const cocoon = named(game, "Cocoon")[0]!;
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, cocoon, "pupa")).toBe(3);
    toStep(game, "precombat-main");
    // Alice's next turn: still tapped through her untap step, one pupa counter gone.
    expect(game.state.turn.number).toBe(3);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, cocoon, "pupa")).toBe(2);
    game.state.objects[cocoon].counters.pupa = 0;
    toStep(game, "precombat-main");
    // No pupa counter: it untapped, and the upkeep trigger couldn't remove one.
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(zone(game, cocoon)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Spiritual Sanctuary", () => {
  it("gains life only for the upkeep player who controls a Plains", () => {
    const { game } = table();
    spawn(game, "Spiritual Sanctuary");
    spawn(game, "Plains", B);
    nextTurn(game); // bob's turn 2
    expect(life(game, B)).toBe(21);
    expect(life(game, A)).toBe(20);
    toStep(game, "precombat-main"); // alice's turn 3: she has no Plains
    expect(life(game, A)).toBe(20);
    spawn(game, "Plains");
    toStep(game, "precombat-main"); // alice's turn 5
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(22);
  });
});

describe("Jovial Evil", () => {
  it("deals twice the number of white creatures the target opponent controls", () => {
    const { game } = table();
    spawn(game, "Savannah Lions", B);
    spawn(game, "White Knight", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Savannah Lions");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Jovial Evil"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Pit Scorpion", () => {
  it("gives the player it damages a poison counter", () => {
    const { game, a } = table();
    const scorpion = spawn(game, "Pit Scorpion");
    attack(game, a, [scorpion]);
    expect(life(game, B)).toBe(19);
    expect(game.state.players[B].counters.poison).toBe(1);
  });
});

describe("Spirit Shackle", () => {
  it("puts a -0/-2 counter on the enchanted creature when it becomes tapped", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Spirit Shackle"), { targets: [ref(giant)] });
    expect(counters(game, giant, "-0/-2")).toBe(0);
    attack(game, a, [giant]);
    expect(counters(game, giant, "-0/-2")).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Enchanted Being", () => {
  it("takes no combat damage from an enchanted attacker", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Holy Strength"), { targets: [ref(giant)] });
    const being = spawn(game, "Enchanted Being", B);
    b.declareBlockersFn = () => [{ blocker: being, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, being)).toBe("battlefield");
    expect(game.state.objects[being].damageMarked).toBe(0);
  });

  it("still takes combat damage from an unenchanted attacker", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const being = spawn(game, "Enchanted Being", B);
    b.declareBlockersFn = () => [{ blocker: being, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, being)).toBe("graveyard");
  });
});

describe("Teleport", () => {
  it("can't be cast in a main phase; in the declare attackers step it makes the creature unblockable", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Island", 3);
    const teleport = toHand(game, "Teleport");
    expect(() => cast(game, teleport, { targets: [ref(giant)] })).toThrow();
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    cast(game, teleport, { targets: [ref(giant)] });
    expect(restrictionsOf(game.state, game.registry, giant).has("cant-be-blocked")).toBe(true);
  });
});

describe("Great Defender", () => {
  it("gives +0/+X where X is the target's mana value", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Great Defender"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 7 });
  });
});

describe("Boris Devilboon", () => {
  it("makes a 1/1 black and red Demon named Minor Demon", () => {
    const { game } = table();
    const boris = spawn(game, "Boris Devilboon");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    activate(game, boris);
    expect(tokensNamed(game, "Minor Demon Token", A)).toBe(1);
    const demon = named(game, "Minor Demon Token")[0]!;
    expect(pt(game, demon)).toEqual({ power: 1, toughness: 1 });
  });
});
