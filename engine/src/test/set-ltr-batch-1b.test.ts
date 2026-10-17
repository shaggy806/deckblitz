/**
 * The set walk, The Lord of the Rings: Tales of Middle-earth (LTR/LTC), batch 1, part b
 * (2026-10-17). Written on the shared table in `harness.ts`, each test from the card's Oracle
 * text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Stern Scolding", () => {
  it("counters a creature spell with power or toughness 2 or less, and can't target a 3/3", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant, { settle: false });
    expect(() => cast(game, toHand(game, "Stern Scolding"), { targets: [ref(giant)], settle: false })).toThrow();
    settle(game);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Stern Scolding"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Friendly Rivalry", () => {
  it("takes only another legendary creature you control as its second creature, and both deal damage", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const lions = spawn(game, "Savannah Lions");
    const wall = spawn(game, "Wall of Stone", B);
    expect(() =>
      cast(game, toHand(game, "Friendly Rivalry"), { targets: [ref(bears), ref(wall), ref(lions)], settle: false }),
    ).toThrow();
    expect(() =>
      cast(game, toHand(game, "Friendly Rivalry"), { targets: [ref(isamaru), ref(wall), ref(isamaru)], settle: false }),
    ).toThrow();
    cast(game, toHand(game, "Friendly Rivalry"), { targets: [ref(bears), ref(wall), ref(isamaru)] });
    // 2 + 2 damage to the 0/8 Wall.
    expect(game.state.objects[wall].damageMarked).toBe(4);
  });
});

describe("Old Man Willow", () => {
  it("is as big as your land count, and sacrificing a token on attack gives -2/-2 to an opponent's creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const willow = spawn(game, "Old Man Willow");
    expect(pt(game, willow)).toEqual({ power: 3, toughness: 3 });
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    settle(game);
    const [food] = named(game, "Food Token", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    const offer = pickPermanents(a, food);
    pickTargets(a, bears);
    attack(game, a, [willow]);
    expect(offer.offered).not.toContain(willow);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Shadowfax, Lord of Horses", () => {
  it("gives Horses haste, and puts only a creature card with lesser power onto the battlefield tapped and attacking", () => {
    const { game, a } = table();
    const shadowfax = spawn(game, "Shadowfax, Lord of Horses");
    const tarpan = spawn(game, "Tarpan", A, { sick: true });
    expect(keywords(game, tarpan).has("haste")).toBe(true);
    const giant = toHand(game, "Hill Giant");
    const wurm = toHand(game, "Craw Wurm");
    const ogre = toHand(game, "Gray Ogre");
    const angel = toHand(game, "Serra Angel");
    const seen = pickFromZone(a, giant);
    attack(game, a, [shadowfax]);
    expect(seen.offered).toContain(giant);
    expect(seen.offered).toContain(ogre);
    expect(seen.offered).not.toContain(wurm);
    // Equal power (4) isn't lesser.
    expect(seen.offered).not.toContain(angel);
    // 4 from Shadowfax, 3 from the Hill Giant that entered attacking.
    expect(life(game, B)).toBe(20 - 4 - 3);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Pippin's Bravery", () => {
  it("is +4/+4 if you sacrifice a Food as it resolves, and +2/+2 otherwise", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    settle(game);
    pickModes(a);
    cast(game, toHand(game, "Pippin's Bravery"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    pickModes(a, 0);
    cast(game, toHand(game, "Pippin's Bravery"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });
});

describe("Minas Tirith Garrison", () => {
  it("has power equal to your hand size, and draws one for each Human tapped as it attacks", () => {
    const { game, a } = table();
    const garrison = spawn(game, "Minas Tirith Garrison");
    const cadet = spawn(game, "Eager Cadet");
    const bears = spawn(game, "Grizzly Bears");
    const n = hand(game).length;
    expect(pt(game, garrison).power).toBe(n);
    const offer = pickPermanents(a, cadet);
    a.declareAttackersFn = () => [{ attacker: garrison, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(offer.offered).toContain(cadet);
    expect(offer.offered).not.toContain(bears);
    expect(game.state.objects[cadet].tapped).toBe(true);
    expect(hand(game).length).toBe(n + 1);
    expect(pt(game, garrison).power).toBe(n + 1);
  });
});

describe("Gimli's Fury / Gimli's Axe", () => {
  it("Gimli's Fury gives trample only to a legendary creature", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    cast(game, toHand(game, "Gimli's Fury"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, bears).has("trample")).toBe(false);
    cast(game, toHand(game, "Gimli's Fury"), { targets: [ref(isamaru)] });
    expect(keywords(game, isamaru).has("trample")).toBe(true);
  });

  it("Gimli's Axe grants menace only while the equipped creature is legendary", () => {
    const { game } = table();
    const axe = spawn(game, "Gimli's Axe");
    const bears = spawn(game, "Grizzly Bears");
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    game.debugApplyEffect(A, { kind: "attach", target: 0 }, [ref(bears)], { source: axe });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(false);
    game.debugApplyEffect(A, { kind: "attach", target: 0 }, [ref(isamaru)], { source: axe });
    settle(game);
    expect(keywords(game, isamaru).has("menace")).toBe(true);
  });
});

describe("Goblin Fireleaper", () => {
  it("deals damage equal to the power it died with", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const goblin = spawn(game, "Goblin Fireleaper");
    const lions = spawn(game, "Savannah Lions", B);
    const ogre = spawn(game, "Gray Ogre", B);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [ref(goblin)]);
    settle(game);
    pickTargets(a, ogre);
    destroy(game, goblin);
    // 3 power as it died: the 2/2 Ogre dies, the Lions are untouched.
    expect(zone(game, ogre)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
  });
});

describe("Fog on the Barrow-Downs", () => {
  it("makes the creature a Spirit with no other creature type, and it can't attack", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const cadet = spawn(game, "Eager Cadet");
    cast(game, toHand(game, "Fog on the Barrow-Downs"), { targets: [ref(cadet)] });
    expect(subtypes(game, cadet)).toEqual(["Spirit"]);
    attack(game, a, [cadet]);
    expect(game.state.objects[cadet].tapped).toBe(false);
    expect(life(game, B)).toBe(20);
  });
});

describe("East-Mark Cavalier", () => {
  it("destroys an Orc it deals damage to, but not another creature", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const cavalier = spawn(game, "East-Mark Cavalier");
    const orc = spawn(game, "Orcish Siegemaster", B);
    const wall = spawn(game, "Wall of Stone", B);
    cast(game, toHand(game, "Stew the Coneys"), { targets: [ref(cavalier), ref(wall)] });
    expect(zone(game, wall)).toBe("battlefield");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    cast(game, toHand(game, "Stew the Coneys"), { targets: [ref(cavalier), ref(orc)] });
    expect(zone(game, orc)).toBe("graveyard");
  });
});

describe("Motivated Pony", () => {
  it("pumps attackers +1/+1, and with a Food entered this turn untaps them for +3/+3 in all", () => {
    const { game, a } = table();
    const pony = spawn(game, "Motivated Pony");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [pony, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("with a Food made this turn (even one gone since), the attackers untap and get +3/+3", () => {
    const { game, a } = table();
    const pony = spawn(game, "Motivated Pony");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 }, []);
    settle(game);
    destroy(game, named(game, "Food Token", A)[0]);
    a.declareAttackersFn = () => [pony, bears].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, pony)).toEqual({ power: 6, toughness: 6 });
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Dreadful as the Storm", () => {
  it("sets base power and toughness 5/5 and the Ring tempts you", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    pickPermanents(a, bears);
    cast(game, toHand(game, "Dreadful as the Storm"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(game.state.players[A].ringTemptations).toBe(1);
  });
});

describe("Easterling Vanguard / Dunland Crebain", () => {
  it("amasses Orcs as each dies or enters: an Orc Army with three counters", () => {
    const { game } = table();
    const vanguard = spawn(game, "Easterling Vanguard");
    destroy(game, vanguard);
    const [army] = named(game, "Army Token", A);
    expect(counters(game, army)).toBe(1);
    expect(subtypes(game, army)).toContain("Orc");
    enter(game, "Dunland Crebain");
    expect(counters(game, army)).toBe(3);
  });
});
