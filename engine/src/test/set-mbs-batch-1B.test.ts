/**
 * Mirrodin Besieged / Scars of Mirrodin (B199), group B. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Magnetic Mine", () => {
  it("deals 2 to the controller of another artifact that dies, not for itself", () => {
    const { game } = table();
    const mine = spawn(game, "Magnetic Mine");
    const theirs = spawn(game, "Ornithopter", B);
    destroy(game, theirs);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
    destroy(game, mine);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(18);
  });
});

describe("Burn the Impure", () => {
  it("hits the controller only when the creature has infect", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const plague = spawn(game, "Necropede", B);
    cast(game, toHand(game, "Burn the Impure"), { targets: [ref(plague)] });
    expect(life(game, B)).toBe(17);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Burn the Impure"), { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Corpse Cur", () => {
  it("returns a creature card with infect, and can't take one without", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const bear = toGraveyard(game, "Grizzly Bears");
    enter(game, "Corpse Cur");
    expect(zone(game, bear)).toBe("graveyard");
    const necropede = toGraveyard(game, "Necropede");
    enter(game, "Corpse Cur");
    expect(hand(game)).toContain(necropede);
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("Ratchet Bomb", () => {
  it("destroys each nonland permanent with mana value equal to its charge counters", () => {
    const { game } = table();
    const bomb = spawn(game, "Ratchet Bomb");
    const bear = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    const land = spawn(game, "Forest", B);
    activate(game, bomb, 0);
    expect(game.state.objects[bomb].counters.charge).toBe(1);
    const primed = spawn(game, "Ratchet Bomb");
    game.state.objects[primed].counters.charge = 2;
    activate(game, primed, 1);
    expect(zone(game, primed)).toBe("graveyard");
    expect(zone(game, bomb)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
  });
});

describe("Silverskin Armor", () => {
  it("makes the equipped creature a 3/3 artifact", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const armor = spawn(game, "Silverskin Armor");
    const bear = spawn(game, "Grizzly Bears");
    activate(game, armor, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, bear)).toContain("artifact");
    expect(types(game, bear)).toContain("creature");
  });
});

describe("Sunspear Shikari", () => {
  it("has first strike and lifelink only while equipped", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const cat = spawn(game, "Sunspear Shikari");
    expect(keywords(game, cat).has("first-strike")).toBe(false);
    const armor = spawn(game, "Silverskin Armor");
    activate(game, armor, 0, { targets: [ref(cat)] });
    expect(keywords(game, cat).has("first-strike")).toBe(true);
    expect(keywords(game, cat).has("lifelink")).toBe(true);
  });
});

describe("Rally the Forces", () => {
  it("pumps only attacking creatures", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const attacker = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Rally the Forces"));
    expect(pt(game, attacker)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, attacker).has("first-strike")).toBe(true);
    expect(pt(game, home)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, home).has("first-strike")).toBe(false);
  });
});

describe("Lead the Stampede", () => {
  it("puts the chosen creature cards from the top five into hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bear = toLibrary(game, "Grizzly Bears");
    const necropede = toLibrary(game, "Necropede");
    const seen = pickFromZone(a, bear, necropede);
    cast(game, toHand(game, "Lead the Stampede"));
    expect(seen.offered).toHaveLength(2);
    expect(hand(game)).toContain(bear);
    expect(hand(game)).toContain(necropede);
  });
});

describe("Horrifying Revelation", () => {
  it("makes the target player discard a card and mill a card", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const handBefore = hand(game, B).length;
    const graveBefore = graveyard(game, B).length;
    cast(game, toHand(game, "Horrifying Revelation"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(handBefore - 1);
    expect(graveyard(game, B).length).toBe(graveBefore + 2);
  });
});

describe("Untamed Might", () => {
  it("gives +X/+X", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Untamed Might"), { targets: [ref(bear)], x: 3 });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 5 });
  });
});
