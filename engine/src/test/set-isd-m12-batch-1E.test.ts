/**
 * Innistrad and Magic 2012 (B191), group E. One test per card whose behaviour
 * is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Vampiric Fury", () => {
  it("pumps only the Vampires you control as it resolves", () => {
    const { game } = table();
    const vamp = spawn(game, "Vampire Nighthawk");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Vampire Nighthawk", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Vampiric Fury"));
    expect(pt(game, vamp)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, vamp).has("first-strike")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 3 });
    const late = spawn(game, "Vampire Nighthawk");
    expect(pt(game, late)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, late).has("first-strike")).toBe(false);
  });
});

describe("Hamlet Captain", () => {
  it("attacking, gives other Humans +1/+1 but not itself or non-Humans", () => {
    const { game, a } = table();
    const captain = spawn(game, "Hamlet Captain");
    const human = spawn(game, "Elder Cathar");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [captain]);
    expect(pt(game, human)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, captain)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Elder Cathar", () => {
  it("puts two counters on a Human, one on a non-Human", () => {
    const { game, a } = table();
    const human = spawn(game, "Hamlet Captain");
    const cathar = spawn(game, "Elder Cathar");
    pickTargets(a, human);
    destroy(game, cathar);
    expect(counters(game, human)).toBe(2);

    const bears = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Elder Cathar");
    pickTargets(a, bears);
    destroy(game, second);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Urgent Exorcism", () => {
  it("can target a Spirit or an enchantment, not another creature", () => {
    const { game } = table();
    const spirit = spawn(game, "Accursed Spirit", B);
    const anthem = spawn(game, "Glorious Anthem", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Urgent Exorcism"), { targets: [ref(spirit)] });
    expect(zone(game, spirit)).toBe("graveyard");
    // A non-Spirit creature is no legal target.
    expect(() => cast(game, toHand(game, "Urgent Exorcism"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Urgent Exorcism"), { targets: [ref(anthem)] });
    expect(zone(game, anthem)).toBe("graveyard");
  });
});

describe("Slayer of the Wicked", () => {
  it("may destroy a Zombie as it enters", () => {
    const { game, a } = table();
    const zombie = spawn(game, "Walking Corpse", B);
    pickTargets(a, zombie);
    pickModes(a, 0);
    enter(game, "Slayer of the Wicked");
    expect(zone(game, zombie)).toBe("graveyard");
  });
});

describe("Druidic Satchel", () => {
  it("puts a revealed land onto the battlefield", () => {
    const { game } = table();
    const satchel = spawn(game, "Druidic Satchel");
    lands(game, "Wastes", 2);
    const forest = toLibrary(game, "Forest");
    activate(game, satchel);
    expect(zone(game, forest)).toBe("battlefield");
    expect(controller(game, forest)).toBe(A);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
  });

  it("makes a Saproling for a creature card, leaving it on top", () => {
    const { game } = table();
    const satchel = spawn(game, "Druidic Satchel");
    lands(game, "Wastes", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const before = life(game);
    activate(game, satchel);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(1);
    expect(zone(game, bears)).toBe("library");
    expect(life(game)).toBe(before);
  });

  it("gains 2 life for a noncreature, nonland card", () => {
    const { game } = table();
    const satchel = spawn(game, "Druidic Satchel");
    lands(game, "Wastes", 2);
    toLibrary(game, "Glorious Anthem");
    const before = life(game);
    activate(game, satchel);
    expect(life(game)).toBe(before + 2);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
  });
});

describe("Master Thief", () => {
  it("takes an artifact while you control it, and gives it back when it leaves", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickTargets(a, ring);
    const thief = enter(game, "Master Thief");
    expect(controller(game, ring)).toBe(A);
    destroy(game, thief);
    settle(game);
    expect(controller(game, ring)).toBe(B);
  });
});

describe("Crown of Empires", () => {
  it("only taps the creature without Scepter and Throne of Empires", () => {
    const { game } = table();
    const crown = spawn(game, "Crown of Empires");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    activate(game, crown, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Stormblood Berserker", () => {
  it("enters with two counters only once an opponent was dealt damage this turn", () => {
    const { game } = table();
    const first = enter(game, "Stormblood Berserker");
    expect(counters(game, first)).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, who: "each-opponent" }, []);
    settle(game);
    const second = enter(game, "Stormblood Berserker");
    expect(counters(game, second)).toBe(2);
    expect(pt(game, second)).toEqual({ power: 3, toughness: 3 });
  });
});
