/**
 * Kamigawa: Neon Dynasty (with Neon Dynasty Commander and Crimson Vow
 * Commander), group e. One test (or two) per card, on its riskiest clause and
 * the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Myojin of Roaring Blades", () => {
  it("enters with an indestructible counter only if cast from your hand", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const cast1 = toHand(game, "Myojin of Roaring Blades");
    cast(game, cast1);
    expect(counters(game, cast1, "indestructible")).toBe(1);
    expect(keywords(game, cast1).has("indestructible")).toBe(true);

    const put = spawn(game, "Myojin of Roaring Blades", B);
    expect(counters(game, put, "indestructible")).toBe(0);
  });

  it("removes the counter to deal 7 damage to each of up to three targets", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const myojin = toHand(game, "Myojin of Roaring Blades");
    cast(game, myojin);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, myojin, 0, { targets: [ref(B), ref(giant), ref(bears)] });
    expect(counters(game, myojin, "indestructible")).toBe(0);
    expect(life(game, B)).toBe(13);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    // No counter left to remove: the ability can't be activated again.
    expect(() => activate(game, myojin, 0, { targets: [ref(B), null, null] })).toThrow();
  });
});

describe("Moonsnare Specialist", () => {
  it("returns up to one target creature to its owner's hand as it enters", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    enter(game, "Moonsnare Specialist");
    expect(hand(game, B)).toContain(giant);
  });

  it("has ninjutsu {2}{U}", () => {
    const { game } = table();
    const specialist = toHand(game, "Moonsnare Specialist");
    const ability = registryOf(game).get("Moonsnare Specialist").activated[0];
    expect(ability.ninjutsu).toBe(true);
    expect(ability.cost.mana).toBe("{2}{U}");
    expect(zone(game, specialist)).toBe("hand");
  });
});

describe("Anchor to Reality", () => {
  it("sacrifices, puts an Equipment onto the battlefield, and scries 2 when it costs less", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const giant = spawn(game, "Hill Giant"); // mana value 4
    const splitter = toLibrary(game, "Bonesplitter"); // mana value 1
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, splitter);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried = cards.length;
      return [];
    };
    cast(game, toHand(game, "Anchor to Reality"), { sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(seen.offered).toContain(splitter);
    expect(seen.offered.every((id) => game.state.objects[id].cardName !== "Grizzly Bears")).toBe(true);
    expect(zone(game, splitter)).toBe("battlefield");
    expect(scried).toBe(2);
  });

  it("doesn't scry when the find's mana value isn't less than the sacrificed permanent's", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const memnite = spawn(game, "Memnite"); // mana value 0
    const copter = toLibrary(game, "Smuggler's Copter"); // mana value 2
    pickFromZone(a, copter);
    let asked = false;
    a.chooseScryFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Anchor to Reality"), { sacrifice: memnite });
    expect(zone(game, copter)).toBe("battlefield");
    expect(asked).toBe(false);
  });
});

describe("Automated Artificer", () => {
  it("its mana casts an artifact spell but not a creature spell", () => {
    const { game } = table();
    spawn(game, "Automated Artificer");
    spawn(game, "Forest");
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Invoke the Winds", () => {
  it("gains control of target artifact or creature for good and untaps it", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Invoke the Winds"), { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    toStep(game, "precombat-main"); // alice's next turn
    expect(controller(game, giant)).toBe(A);
  });
});

describe("Undercity Scrounger", () => {
  it("makes a Treasure only once a creature has died this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const scrounger = spawn(game, "Undercity Scrounger");
    expect(() => activate(game, scrounger)).toThrow();
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    activate(game, scrounger);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Nezumi Bladeblesser", () => {
  it("has deathtouch with an artifact and menace with an enchantment", () => {
    const { game } = table();
    const rat = spawn(game, "Nezumi Bladeblesser");
    expect(keywords(game, rat).has("deathtouch")).toBe(false);
    expect(keywords(game, rat).has("menace")).toBe(false);
    spawn(game, "Sol Ring");
    expect(keywords(game, rat).has("deathtouch")).toBe(true);
    expect(keywords(game, rat).has("menace")).toBe(false);
    spawn(game, "Glorious Anthem");
    expect(keywords(game, rat).has("menace")).toBe(true);
  });
});

describe("Risona, Asari Commander", () => {
  it("gets an indestructible counter from combat damage to a player, only if it has none", () => {
    const { game, a } = table();
    const risona = spawn(game, "Risona, Asari Commander");
    attack(game, a, [risona]);
    expect(counters(game, risona, "indestructible")).toBe(1);
    toStep(game, "precombat-main");
    attack(game, a, [risona]);
    expect(counters(game, risona, "indestructible")).toBe(1);
  });

  it("loses one indestructible counter per combat damage event dealt to you, however many attackers", () => {
    const { game, b } = table();
    const risona = spawn(game, "Risona, Asari Commander");
    game.state.objects[risona].counters.indestructible = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    attack(game, b, [bears, giant], A);
    expect(life(game, A)).toBe(15);
    expect(counters(game, risona, "indestructible")).toBe(1);
  });
});

describe("The Shattered States Era", () => {
  it("steals and untaps a creature with haste, pumps, then returns as Nameless Conqueror", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    pickTargets(a, giant);
    const saga = enter(game, "The Shattered States Era");
    expect(controller(game, giant)).toBe(A);
    expect(game.state.objects[giant].tapped).toBe(false);
    expect(keywords(game, giant).has("haste")).toBe(true);

    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "precombat-main"); // alice's next turn: chapter II
    settle(game);
    expect(controller(game, giant)).toBe(B);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });

    toStep(game, "precombat-main"); // chapter III
    settle(game);
    // Exiled and returned: the back face up, a 3/3 enchantment creature.
    expect(zone(game, saga)).toBe("battlefield");
    expect(game.state.objects[saga].face).toBe(1);
    expect(game.state.objects[saga].controller).toBe(A);
    expect(types(game, saga)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(pt(game, saga)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[saga].counters.lore ?? 0).toBe(0);
    expect(keywords(game, saga).has("trample")).toBe(true);
    expect(keywords(game, saga).has("haste")).toBe(true);
  });
});

describe("Sky-Blessed Samurai", () => {
  it("costs {1} less for each enchantment you control", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    spawn(game, "Glorious Anthem");
    spawn(game, "Glorious Anthem");
    spawn(game, "Glorious Anthem");
    const samurai = toHand(game, "Sky-Blessed Samurai");
    cast(game, samurai);
    expect(zone(game, samurai)).toBe("battlefield");
  });
});

describe("Unforgiving One", () => {
  it("returns a creature card with mana value up to the number of modified creatures you control", () => {
    const { game, a } = table();
    const one = spawn(game, "Unforgiving One");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[one].counters["+1/+1"] = 1;
    game.state.objects[bears].counters["+1/+1"] = 1;
    const twoDrop = toGraveyard(game, "Grizzly Bears"); // mana value 2
    const fourDrop = toGraveyard(game, "Hill Giant"); // mana value 4
    const zeroDrop = toGraveyard(game, "Memnite"); // mana value 0
    const seen = watchTargets(a, () => [twoDrop]);
    attack(game, a, [one]);
    expect(seen.offered[0]).toContain(twoDrop);
    expect(seen.offered[0]).toContain(zeroDrop);
    expect(seen.offered[0]).not.toContain(fourDrop);
    expect(zone(game, twoDrop)).toBe("battlefield");
  });
});

describe("Kami of Restless Shadows", () => {
  it("returns a Ninja or Rogue creature card to hand", () => {
    const { game, a } = table();
    const ninja = toGraveyard(game, "Ninja of the Deep Hours");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [ninja]);
    enter(game, "Kami of Restless Shadows");
    expect(seen.offered[0]).toContain(ninja);
    expect(seen.offered[0]).not.toContain(bears);
    expect(hand(game)).toContain(ninja);
  });

  it("or puts a creature card from your graveyard on top of your library", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, bears);
    enter(game, "Kami of Restless Shadows");
    expect(library(game)[0]).toBe(bears);
    expect(graveyard(game)).not.toContain(bears);
  });
});

describe("Guardians of Oboro", () => {
  it("lets modified creatures you control attack despite defender", () => {
    const { game } = table();
    const guardians = spawn(game, "Guardians of Oboro");
    const wall = spawn(game, "Wall of Omens");
    const registry = registryOf(game);
    expect(whyCannotAttack(game.state, registry, A, guardians, B)).toMatch(/defender/);
    expect(whyCannotAttack(game.state, registry, A, wall, B)).toMatch(/defender/);
    game.state.objects[wall].counters["+1/+1"] = 1;
    expect(whyCannotAttack(game.state, registry, A, wall, B)).toBeNull();
    expect(whyCannotAttack(game.state, registry, A, guardians, B)).toMatch(/defender/);
  });
});

describe("Bearer of Memory", () => {
  it("puts a +1/+1 counter on target enchantment creature and gives it trample", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bearer = spawn(game, "Bearer of Memory");
    activate(game, bearer, 0, { targets: [ref(bearer)] });
    expect(counters(game, bearer)).toBe(1);
    expect(keywords(game, bearer).has("trample")).toBe(true);
  });

  it("can't target a creature that isn't an enchantment", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const bearer = spawn(game, "Bearer of Memory");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, bearer, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Breath of the Sleepless", () => {
  it("lets you cast a Spirit at instant speed, and a creature cast on an opponent's turn taps a creature", () => {
    const { game, a } = table();
    spawn(game, "Breath of the Sleepless");
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant", B);
    game.advanceUntil((s) => s.priority.holder === A && s.turn.number === 2);
    pickTargets(a, giant);
    const kami = toHand(game, "Kami of False Hope");
    cast(game, kami);
    expect(zone(game, kami)).toBe("battlefield");
    expect(game.state.objects[giant].tapped).toBe(true);
    // A non-Spirit still can't be cast at instant speed.
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
  });

  it("doesn't tap on your own turn", () => {
    const { game, a } = table();
    spawn(game, "Breath of the Sleepless");
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Kami of False Hope"));
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});
