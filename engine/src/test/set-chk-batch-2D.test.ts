/**
 * Champions of Kamigawa (CHK; B212), group D. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Night Dealings", () => {
  it("gets a theft counter per point of damage to an opponent, then tutors a card of mana value X", () => {
    const { game, a } = table();
    const dealings = spawn(game, "Night Dealings");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(counters(game, dealings, "theft")).toBe(2);

    lands(game, "Swamp", 4);
    const target = toLibrary(game, "Kami of the Hunt"); // mana value 3: not offered at X=2
    const wanted = toLibrary(game, "Distress"); // mana value 2
    const seen = pickFromZone(a, wanted);
    activate(game, dealings, 0, { x: 2 });
    expect(zone(game, wanted)).toBe("hand");
    expect(seen.offered).not.toContain(target);
    expect(counters(game, dealings, "theft")).toBe(0);
  });
});

describe("Ben-Ben, Akki Hermit", () => {
  it("deals damage to an attacking creature equal to the untapped Mountains you control", () => {
    const { game, a } = table();
    const benben = spawn(game, "Ben-Ben, Akki Hermit");
    lands(game, "Mountain", 3);
    spawn(game, "Mountain", A, { tapped: true });
    const oni = spawn(game, "Painwracker Oni");
    const idle = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: oni, defender: B }];
    toStep(game, "declare-blockers");
    expect(() => activate(game, benben, 0, { targets: [ref(idle)] })).toThrow();
    activate(game, benben, 0, { targets: [ref(oni)] });
    expect(game.state.objects[oni].damageMarked).toBe(3);
  });
});

describe("Bloodthirsty Ogre", () => {
  it("gives -X/-X for its devotion counters, only while you control a Demon", () => {
    const { game } = table();
    const ogre = spawn(game, "Bloodthirsty Ogre");
    const healer = spawn(game, "Kitsune Healer", B);
    game.state.objects[ogre].counters.devotion = 1;
    expect(() => activate(game, ogre, 1, { targets: [ref(healer)] })).toThrow();
    spawn(game, "Painwracker Oni");
    activate(game, ogre, 1, { targets: [ref(healer)] });
    expect(pt(game, healer)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Painwracker Oni", () => {
  it("makes you sacrifice a creature at upkeep without an Ogre, and not with one", () => {
    const { game } = table();
    const oni = spawn(game, "Painwracker Oni");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, oni)).toBe("graveyard");

    const second = table();
    const oni2 = spawn(second.game, "Painwracker Oni");
    const ogre = spawn(second.game, "Bloodthirsty Ogre");
    toStep(second.game, "upkeep");
    settle(second.game);
    expect(zone(second.game, oni2)).toBe("battlefield");
    expect(zone(second.game, ogre)).toBe("battlefield");
  });
});

describe("Vassal's Duty", () => {
  it("sends the next 1 damage to your legendary creature to you instead, once per activation", () => {
    const { game } = table();
    const duty = spawn(game, "Vassal's Duty");
    const benben = spawn(game, "Ben-Ben, Akki Hermit");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    lands(game, "Mountain", 1);
    expect(() => activate(game, duty, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, duty, 0, { targets: [ref(benben)] });
    activate(game, duty, 0, { targets: [ref(benben)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(benben)] });
    expect(zone(game, benben)).toBe("battlefield");
    expect(game.state.objects[benben].damageMarked).toBe(0);
    expect(life(game, A)).toBe(18);
  });
});

describe("Kitsune Healer", () => {
  it("prevents all damage only to a legendary creature", () => {
    const { game } = table();
    const healer = spawn(game, "Kitsune Healer");
    const benben = spawn(game, "Ben-Ben, Akki Hermit", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, healer, 1, { targets: [ref(bears)] })).toThrow();
    activate(game, healer, 1, { targets: [ref(benben)] });
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(benben)] });
    expect(zone(game, benben)).toBe("battlefield");
  });
});

describe("Part the Veil", () => {
  it("returns only your creatures", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Part the Veil"));
    expect(hand(game)).toContain(mine);
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Hisoka's Defiance", () => {
  it("counters a Spirit spell and can't target a non-Spirit, non-Arcane one", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Mountain", 1);
    lands(game, "Island", 2);
    const kami = toHand(game, "Kami of the Hunt");
    cast(game, kami, { settle: false });
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const defiance = toHand(game, "Hisoka's Defiance");
    expect(() => cast(game, defiance, { targets: [ref(shock)], settle: false })).toThrow();
    cast(game, defiance, { targets: [ref(kami)] });
    expect(graveyard(game)).toContain(kami);
    expect(life(game, B)).toBe(18);
  });
});

describe("Kami of the Hunt", () => {
  it("gets +1/+1 when you cast an Arcane spell", () => {
    const { game } = table();
    const kami = spawn(game, "Kami of the Hunt");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Part the Veil"), { settle: false });
    // The cast trigger resolves first, then Part the Veil bounces the Kami.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(pt(game, kami)).toEqual({ power: 3, toughness: 3 });
    settle(game);
    expect(zone(game, kami)).toBe("hand");
  });
});
