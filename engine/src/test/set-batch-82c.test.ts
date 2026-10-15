/**
 * Set walk batch 82, part c (2026-10-15): Final Fantasy (FIN) and Final Fantasy Commander (FIC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const HERO = "Hero Token (Black Mage's Rod)";

/** The job select Hero `equipment` is attached to. */
const heroOf = (game: Game, equipment: ObjectId): ObjectId => {
  const hero = game.state.objects[equipment].attachedTo;
  if (hero === null) throw new Error("not attached");
  expect(game.state.objects[hero].cardName).toBe(HERO);
  return hero;
};

/** Attach `equipment` to `creature` silently. */
const attachTo = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(creature), ref(equipment)]);
  settle(game);
};

const exiled = (game: Game, player = B): number =>
  Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === player).length;

describe("Town Greeter", () => {
  it("mills four, puts a Town card from among them into your hand and gains 2 life", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const town = toLibrary(game, "Capital City");
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    const seen = pickFromZone(a, town);
    enter(game, "Town Greeter");
    expect(zone(game, town)).toBe("hand");
    expect(life(game)).toBe(22);
    // Only land cards from among the milled four are offered.
    expect(seen.offered).toContain(town);
    expect(seen.offered).not.toContain(bolt);
    expect(graveyard(game)).toHaveLength(3);
  });

  it("gains no life for a land that isn't a Town, nor when nothing is taken", () => {
    const { game, a } = table();
    toLibrary(game, "Capital City");
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    enter(game, "Town Greeter");
    expect(zone(game, forest)).toBe("hand");
    expect(life(game)).toBe(20);

    pickFromZone(a);
    enter(game, "Town Greeter");
    expect(life(game)).toBe(20);
  });
});

describe("Weapons Vendor", () => {
  it("draws a card as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Weapons Vendor");
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("at the beginning of combat, pays {1} to attach an Equipment you control to a creature you control", () => {
    const { game, a } = table();
    spawn(game, "Weapons Vendor");
    const bears = spawn(game, "Grizzly Bears");
    const mace = spawn(game, "+2 Mace");
    const [wastes] = lands(game, "Wastes", 1);
    pickModes(a, 0);
    pickTargets(a, mace, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[mace].attachedTo).toBe(bears);
    expect(game.state.objects[wastes].tapped).toBe(true);
  });

  it("doesn't trigger without an Equipment, and attaches nothing when you don't pay", () => {
    const { game, a } = table();
    spawn(game, "Weapons Vendor");
    const bears = spawn(game, "Grizzly Bears");
    const [wastes] = lands(game, "Wastes", 1);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(0);

    const mace = spawn(game, "+2 Mace");
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(1);
    expect(game.state.objects[mace].attachedTo).toBeNull();
    expect(game.state.objects[wastes].tapped).toBe(false);
    void bears;
  });
});

describe("Summoner's Grimoire", () => {
  it("job select: a 1/1 Hero that's a Shaman", () => {
    const { game } = table();
    const grimoire = enter(game, "Summoner's Grimoire");
    const hero = heroOf(game, grimoire);
    expect(subtypes(game, hero)).toContain("Shaman");
    expect(pt(game, hero)).toEqual({ power: 1, toughness: 1 });
  });

  it("an enchantment creature card put from your hand as it attacks enters tapped and attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Summoner's Grimoire"), bears);
    const arasta = toHand(game, "Arasta of the Endless Web");
    pickModes(a, 0);
    const seen = pickFromZone(a, arasta);
    attack(game, a, [bears]);
    expect(zone(game, arasta)).toBe("battlefield");
    expect(game.state.objects[arasta].tapped).toBe(true);
    // It attacked bob alongside the bears: 2 + 3.
    expect(life(game, B)).toBe(15);
    expect(seen.offered).toEqual([arasta]);
  });

  it("any other creature card enters untapped and not attacking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Summoner's Grimoire"), bears);
    const other = toHand(game, "Grizzly Bears");
    toHand(game, "Arasta of the Endless Web");
    toHand(game, "Lightning Bolt");
    pickModes(a, 1);
    const seen = pickFromZone(a, other);
    attack(game, a, [bears]);
    expect(zone(game, other)).toBe("battlefield");
    expect(game.state.objects[other].tapped).toBe(false);
    expect(life(game, B)).toBe(18);
    expect(seen.offered).toEqual([other]);
  });
});

describe("White Mage's Staff", () => {
  it("makes a 2/2 Cleric Hero that gains you 1 life as it attacks", () => {
    const { game, a } = table();
    const staff = enter(game, "White Mage's Staff");
    const hero = heroOf(game, staff);
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, hero)).toContain("Cleric");
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, staff, bears);
    attack(game, a, [bears]);
    expect(life(game)).toBe(21);
    expect(life(game, B)).toBe(17);
  });
});

describe("Ninja's Blades", () => {
  it("job select: a 2/2 Ninja Hero", () => {
    const { game } = table();
    const blades = enter(game, "Ninja's Blades");
    const hero = heroOf(game, blades);
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, hero)).toContain("Ninja");
  });

  it("loots on combat damage, and that player loses life equal to the discarded card's mana value", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Ninja's Blades"), bears);
    const murder = toHand(game, "Murder");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [murder];
    attack(game, a, [bears]);
    expect(zone(game, murder)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
    // 3 combat damage, then Murder's mana value 3.
    expect(life(game, B)).toBe(14);
  });

  it("a land discarded costs them nothing more", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Ninja's Blades"), bears);
    const forest = toHand(game, "Forest");
    a.chooseDiscardsFn = () => [forest];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Sidequest: Catch a Fish // Cooking Campsite", () => {
  it("takes an artifact or creature card off the top at upkeep, makes a Food and transforms", () => {
    const { game, a } = table();
    const sidequest = spawn(game, "Sidequest: Catch a Fish");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(game.state.objects[sidequest].face).toBe(1);
  });

  it("does nothing with a land on top", () => {
    const { game, a } = table();
    const sidequest = spawn(game, "Sidequest: Catch a Fish");
    const seen = pickFromZone(a);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toEqual([]);
    expect(game.state.objects[sidequest].face ?? 0).toBe(0);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("leaves the card on top when you choose not to reveal it", () => {
    const { game, a } = table();
    const sidequest = spawn(game, "Sidequest: Catch a Fish");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("library");
    expect(game.state.objects[sidequest].face ?? 0).toBe(0);
  });

  it("Cooking Campsite taps for {W} and sacrifices an artifact to put a counter on each creature you control", () => {
    const { game, a } = table();
    const sidequest = spawn(game, "Sidequest: Catch a Fish");
    pickFromZone(a, toLibrary(game, "Ornithopter"));
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[sidequest].face).toBe(1);
    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    const food = named(game, "Food Token", A)[0];
    game.dispatch({ type: "activate-ability", player: A, source: sidequest, abilityIndex: 1, targets: [], sacrifice: food });
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
    expect(game.state.objects[sidequest].tapped).toBe(true);
  });
});

describe("Commune with Beavers", () => {
  it("takes an artifact, creature or land card from the top three and bottoms the rest", () => {
    const { game, a } = table();
    toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const opt = toLibrary(game, "Opt");
    lands(game, "Forest", 1);
    let offered: readonly ObjectId[] = [];
    let calls = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      calls += 1;
      if (calls === 1) {
        offered = eligible;
        return [bears];
      }
      return eligible;
    };
    cast(game, toHand(game, "Commune with Beavers"));
    expect(zone(game, bears)).toBe("hand");
    expect(offered).toContain(bears);
    expect(offered).not.toContain(opt);
    const library = game.state.zones.perPlayer[A].library;
    // The other two went to the bottom; a Wastes is on top again.
    expect(library.slice(-2)).toContain(opt);
    expect(game.state.objects[library[0]].cardName).toBe("Wastes");
  });
});

describe("Rook Turret", () => {
  it("may loot when another artifact you control enters, not when it enters itself", () => {
    const { game, a } = table();
    const junk = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [junk];
    pickModes(a, 0);
    enter(game, "Rook Turret");
    expect(graveyard(game)).toHaveLength(0);
    const before = hand(game).length;
    enter(game, "Ornithopter");
    expect(zone(game, junk)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });

  it("declining draws and discards nothing", () => {
    const { game, a } = table();
    spawn(game, "Rook Turret");
    toHand(game, "Lightning Bolt");
    pickModes(a);
    const before = hand(game).length;
    enter(game, "Ornithopter");
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Red Mage's Rapier", () => {
  it("job select: a 1/1 Hero that's a Wizard", () => {
    const { game } = table();
    const hero = heroOf(game, enter(game, "Red Mage's Rapier"));
    expect(subtypes(game, hero)).toContain("Wizard");
    expect(pt(game, hero)).toEqual({ power: 1, toughness: 1 });
  });

  it("the equipped creature gets +2/+0 whenever you cast a noncreature spell", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Red Mage's Rapier"), bears);
    lands(game, "Island", 1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Opt"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    // A creature spell doesn't count.
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Battle Menu", () => {
  it("Attack makes a 2/2 white Knight; Item gains 4 life", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Battle Menu"), { modes: [0] });
    expect(tokensNamed(game, "2/2 White Knight Token", A)).toBe(1);
    cast(game, toHand(game, "Battle Menu"), { modes: [3] });
    expect(life(game)).toBe(24);
  });

  it("Ability gives +0/+4; Magic destroys only a creature with power 4 or greater", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Battle Menu"), { modes: [1], targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 6 });
    const big = spawn(game, "Summon: Fat Chocobo", B);
    const small = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Battle Menu"), { modes: [2], targets: [ref(big)] });
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, small)).toBe("battlefield");
    expect(() => cast(game, toHand(game, "Battle Menu"), { modes: [2], targets: [ref(small)] })).toThrow();
  });
});

describe("Paladin's Arms", () => {
  it("makes a 3/2 Knight Hero with ward {1}", () => {
    const { game } = table();
    const arms = enter(game, "Paladin's Arms");
    const hero = heroOf(game, arms);
    expect(pt(game, hero)).toEqual({ power: 3, toughness: 2 });
    expect(subtypes(game, hero)).toContain("Knight");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    game.dispatch({ type: "cast-spell", player: B, card: toHand(game, "Lightning Bolt", B), targets: [ref(hero)] });
    settle(game);
    // Bob had no mana left for the ward: the Bolt is countered.
    expect(zone(game, hero)).toBe("battlefield");
  });
});

describe("Minwu, White Mage", () => {
  it("puts a +1/+1 counter on each Cleric you control whenever you gain life", () => {
    const { game } = table();
    const minwu = spawn(game, "Minwu, White Mage");
    const matron = spawn(game, "Abbey Matron");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Abbey Matron", B);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    settle(game);
    expect(counters(game, minwu)).toBe(1);
    expect(counters(game, matron)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Swallowed by Leviathan", () => {
  it("surveils 2, then counters the spell unless its controller pays {1} for each card in your graveyard", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 6);
    toGraveyard(game, "Forest");
    const top = toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = (_view, cards) => cards.filter((id) => id === top);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    // Two in the graveyard after the surveil — alice has only three Islands left
    // after Swallowed, but declines.
    pickModes(a);
    cast(game, toHand(game, "Swallowed by Leviathan"), { targets: [ref(bolt)] });
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("the spell resolves when its controller pays", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 6);
    toGraveyard(game, "Forest");
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    pickModes(a, 0);
    cast(game, toHand(game, "Swallowed by Leviathan"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(17);
    // {2}{U} for Swallowed and {1} for the one card in the graveyard.
    const islands = named(game, "Island", A);
    expect(islands.filter((id) => game.state.objects[id].tapped)).toHaveLength(4);
  });
});

describe("Tellah, Great Sage", () => {
  it("makes a Hero for each noncreature spell, and draws two when four or more mana was spent", () => {
    const { game } = table();
    spawn(game, "Tellah, Great Sage");
    lands(game, "Mountain", 6);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Mind Stone"));
    expect(tokensNamed(game, HERO, A)).toBe(1);
    const before = hand(game).length;
    cast(game, toHand(game, "Blaze"), { x: 3, targets: [ref(B)] });
    expect(tokensNamed(game, HERO, A)).toBe(2);
    expect(hand(game)).toHaveLength(before + 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(tokensNamed(game, HERO, A)).toBe(2);
  });

  it("with eight or more mana spent, is sacrificed and deals that much damage to each opponent", () => {
    const { game } = table({ players: 3 });
    const tellah = spawn(game, "Tellah, Great Sage");
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Blaze"), { x: 7, targets: [ref(C)] });
    expect(zone(game, tellah)).toBe("graveyard");
    expect(life(game, B)).toBe(12);
    expect(life(game, C)).toBe(5);
    expect(life(game)).toBe(20);
  });
});

describe("Malboro", () => {
  it("each opponent discards a card, loses 2 life and exiles the top three of their library", () => {
    const { game, b, c } = table({ players: 3 });
    const bobs = toHand(game, "Grizzly Bears", B);
    const carols = toHand(game, "Lightning Bolt", C);
    const hands = [hand(game, B).length, hand(game, C).length];
    b.chooseDiscardsFn = () => [bobs];
    c.chooseDiscardsFn = () => [carols];
    enter(game, "Malboro");
    expect([hand(game, B).length, hand(game, C).length]).toEqual([hands[0] - 1, hands[1] - 1]);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
    expect(exiled(game, B)).toBe(3);
    expect(exiled(game, C)).toBe(3);
    expect(life(game)).toBe(20);
    expect(exiled(game, A)).toBe(0);
  });
});

describe("Omega, Heartless Evolution", () => {
  it("taps up to one nonland permanent per opponent with X stun counters and gains X life", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Command Tower", 2);
    lands(game, "Forest", 3);
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsLand = spawn(game, "Forest", B);
    const carols = spawn(game, "Mind Stone", C);
    const seen = watchTargets(a, () => [bobs, carols]);
    enter(game, "Omega, Heartless Evolution");
    expect(seen.offered[0]).toContain(bobs);
    expect(seen.offered[0]).not.toContain(bobsLand);
    for (const id of [bobs, carols]) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(counters(game, id, "stun")).toBe(2);
    }
    expect(life(game)).toBe(22);
  });

  it("still gains X life with nothing targeted", () => {
    const { game, a } = table();
    lands(game, "Command Tower", 3);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Omega, Heartless Evolution");
    expect(life(game)).toBe(23);
  });
});

describe("Gysahl Greens", () => {
  it("makes a Chocobo Bird, and again by flashback", () => {
    const { game } = table();
    lands(game, "Forest", 9);
    const greens = toHand(game, "Gysahl Greens");
    cast(game, greens);
    expect(tokensNamed(game, "Chocobo Bird Token", A)).toBe(1);
    expect(zone(game, greens)).toBe("graveyard");
    cast(game, greens, { via: "flashback" });
    expect(tokensNamed(game, "Chocobo Bird Token", A)).toBe(2);
    expect(zone(game, greens)).toBe("exile");
  });
});

describe("Ashe, Princess of Dalmasca", () => {
  it("takes an artifact card from the top five as she attacks", () => {
    const { game, a } = table();
    const ashe = spawn(game, "Ashe, Princess of Dalmasca");
    const stone = toLibrary(game, "Mind Stone");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, stone);
    attack(game, a, [ashe]);
    expect(zone(game, stone)).toBe("hand");
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, bears)).toBe("library");
    expect(life(game, B)).toBe(17);
  });
});
