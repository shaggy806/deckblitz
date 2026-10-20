/**
 * Innistrad: Crimson Vow, group e. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
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

const gainLife = (game: Game, amount = 1): void => game.debugApplyEffect(A, { kind: "gain-life", amount }, []);
const transform = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(id)]);
  settle(game);
};
/** Answer the next mode choice with the mode whose text starts with `prefix`, recording what was offered. */
const chooseMode = (seat: ScriptedController, prefix: string): { offered: readonly string[] } => {
  const seen = { offered: [] as readonly string[] };
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    seen.offered = texts;
    return [texts.findIndex((t) => t.startsWith(prefix))];
  };
  return seen;
};
/** Cast `name`'s back face from alice's graveyard with disturb onto `host`. */
const disturbOnto = (game: Game, name: string, host: ObjectId): ObjectId => {
  const card = toGraveyard(game, name);
  cast(game, card, { targets: [ref(host)], via: "disturb", face: 1 });
  return card;
};

describe("Henrika Domnathi // Henrika, Infernal Seer", () => {
  it("chooses a mode that hasn't been chosen each combat, the last transforming her", () => {
    const { game, a } = table();
    const henrika = spawn(game, "Henrika Domnathi");
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = chooseMode(a, "Each player");
    a.chooseSacrificesFn = (_view, eligible) => eligible.slice(0, 1);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered).toHaveLength(3);
    // Henrika is Alice's only creature, so she's sacrificed; Bob's Bears go too.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, henrika)).toBe("graveyard");
  });

  it("draw-and-lose isn't offered again, and transforming her gives the back face's pump", () => {
    const { game, a } = table();
    const henrika = spawn(game, "Henrika Domnathi");
    let seen = chooseMode(a, "You draw");
    const before = hand(game).length;
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered).toHaveLength(3);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    seen = chooseMode(a, "Transform");
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered).toHaveLength(2);
    expect(seen.offered.some((t) => t.startsWith("You draw"))).toBe(false);
    expect(game.state.objects[henrika].face).toBe(1);
    expect(pt(game, henrika)).toEqual({ power: 3, toughness: 4 });

    // {1}{B}{B}: flying, deathtouch and/or lifelink creatures you control get +1/+0.
    toStep(game, "precombat-main");
    lands(game, "Swamp", 3);
    const flier = spawn(game, "Lantern Bearer");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, henrika, 0);
    expect(pt(game, henrika)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, flier)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Packsong Pup", () => {
  it("gets a counter at combat only with another Wolf or Werewolf, and gains life equal to its power as it dies", () => {
    const { game } = table();
    const pup = spawn(game, "Packsong Pup");
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, pup)).toBe(0);
    spawn(game, "Packsong Pup");
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, pup)).toBe(1);
    toStep(game, "postcombat-main");
    destroy(game, pup);
    expect(life(game, A)).toBe(22);
  });
});

describe("Stormchaser Drake", () => {
  it("draws when a spell you control targets it, not when an ability does", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const ripsaw = spawn(game, "Spiked Ripsaw");
    const drake = spawn(game, "Stormchaser Drake");
    const before = hand(game).length;
    // Equip is an ability, not a spell.
    activate(game, ripsaw, 0, { targets: [ref(drake)] });
    expect(hand(game).length).toBe(before);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(drake)] });
    expect(hand(game).length).toBe(before + 1);
    expect(pt(game, drake)).toEqual({ power: 8, toughness: 7 });
  });
});

describe("Runo Stromkirk // Krothuss, Lord of the Deep", () => {
  it("puts up to one creature card from your graveyard on top as it enters", () => {
    const { game, a } = table();
    const wurm = toGraveyard(game, "Craw Wurm");
    pickTargets(a, wurm);
    enter(game, "Runo Stromkirk");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(wurm);
  });

  it("reveals a 6+ mana value creature on top at upkeep to transform; a smaller one can't be revealed", () => {
    const { game, a } = table();
    const runo = spawn(game, "Runo Stromkirk");
    toLibrary(game, "Hill Giant");
    let seen = pickFromZone(a);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toHaveLength(0);
    expect(game.state.objects[runo].face ?? 0).toBe(0);

    toStep(game, "precombat-main");
    const wurm = toLibrary(game, "Craw Wurm");
    seen = pickFromZone(a, wurm);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).toEqual([wurm]);
    expect(game.state.objects[runo].face).toBe(1);
    // The revealed card stays where it was, and is drawn this turn.
    toStep(game, "precombat-main");
    expect(zone(game, wurm)).toBe("hand");
  });

  it("Krothuss makes a tapped attacking copy of another attacker, two of a Kraken", () => {
    const { game, a } = table();
    const runo = spawn(game, "Runo Stromkirk");
    transform(game, runo);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [runo, bears]);
    // Krothuss 3 + Bears 2 + the Bears copy 2.
    expect(life(game, B)).toBe(13);
    const copies = named(game, "Grizzly Bears").filter((id) => game.state.objects[id].isToken);
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].tapped).toBe(true);

    toStep(game, "precombat-main");
    const kraken = spawn(game, "Spawning Kraken");
    pickTargets(a, kraken);
    attack(game, a, [runo, kraken]);
    const krakenCopies = named(game, "Spawning Kraken").filter((id) => game.state.objects[id].isToken);
    expect(krakenCopies).toHaveLength(2);
  });
});

describe("Restless Bloodseeker // Bloodsoaked Reveler", () => {
  it("makes a Blood token at your end step only if you gained life, and transforms by sacrificing two", () => {
    const { game } = table();
    const seeker = spawn(game, "Restless Bloodseeker");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    toStep(game, "precombat-main");
    gainLife(game);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    toStep(game, "precombat-main");
    game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count: 1 }, []);
    activate(game, seeker, 0);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    expect(game.state.objects[seeker].face).toBe(1);

    lands(game, "Swamp", 5);
    activate(game, seeker, 0);
    expect(life(game, B)).toBe(18);
    // 1 gained earlier, 2 now.
    expect(life(game, A)).toBe(23);
  });
});

describe("Mischievous Catgeist // Catlike Curiosity", () => {
  it("disturbed onto a creature, it draws on combat damage and is exiled when the creature dies", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    const curiosity = disturbOnto(game, "Mischievous Catgeist", bears);
    expect(zone(game, curiosity)).toBe("battlefield");
    expect(game.state.objects[curiosity].attachedTo).toBe(bears);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before + 1);
    destroy(game, bears);
    toStep(game, "end");
    expect(zone(game, curiosity)).toBe("exile");
  });

  it("the front face draws on combat damage", () => {
    const { game, a } = table();
    const cat = spawn(game, "Mischievous Catgeist");
    const before = hand(game).length;
    attack(game, a, [cat]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Courier Bat", () => {
  it("returns a creature card only if you gained life this turn", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Courier Bat");
    expect(zone(game, bears)).toBe("graveyard");
    gainLife(game);
    enter(game, "Courier Bat");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Blood Petal Celebrant", () => {
  it("has first strike only while attacking, and leaves a Blood token as it dies", () => {
    const { game, a } = table();
    const celebrant = spawn(game, "Blood Petal Celebrant");
    expect(keywords(game, celebrant).has("first-strike")).toBe(false);
    a.declareAttackersFn = () => [{ attacker: celebrant, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, celebrant).has("first-strike")).toBe(true);
    toStep(game, "postcombat-main");
    destroy(game, celebrant);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Cartographer's Survey", () => {
  it("puts up to two lands from the top seven onto the battlefield tapped, the rest on the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const top = ["Grizzly Bears", "Forest", "Hill Giant", "Island", "Mountain", "Lightning Bolt", "Opt"].map((n) =>
      toLibrary(game, n),
    );
    const [forest, island] = [top[1], top[3]];
    const seen = pickFromZone(a, forest, island);
    cast(game, toHand(game, "Cartographer's Survey"));
    expect(seen.offered).toHaveLength(3);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(zone(game, top[4])).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    // The five left went to the bottom, under the 40 Wastes.
    expect([...library.slice(-5)].sort()).toEqual([top[0], top[2], top[4], top[5], top[6]].sort());
  });
});

describe("Lantern Bearer // Lanterns' Lift", () => {
  it("disturbed, the Aura gives +1/+1 and flying, and is exiled if it would go to a graveyard", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears");
    const lift = disturbOnto(game, "Lantern Bearer", bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    destroy(game, lift);
    expect(zone(game, lift)).toBe("exile");
  });
});

describe("Nurturing Presence", () => {
  it("its own Spirit makes the enchanted creature's granted ability trigger", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Nurturing Presence"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Vilespawn Spider", () => {
  it("mills at upkeep, and makes an Insect per creature card in your graveyard, itself included", () => {
    const { game } = table();
    const spider = spawn(game, "Vilespawn Spider");
    const before = graveyard(game).length;
    toStep(game, "upkeep");
    settle(game);
    expect(graveyard(game).length).toBe(before + 1);
    toStep(game, "precombat-main");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    activate(game, spider, 0);
    expect(zone(game, spider)).toBe("graveyard");
    expect(tokensNamed(game, "Insect Token", A)).toBe(3);
  });
});

describe("Angelic Quartermaster", () => {
  it("puts a counter on each of up to two other creatures, never itself", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears, giant]);
    const angel = enter(game, "Angelic Quartermaster");
    expect(seen.offered[0]).not.toContain(angel);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
    expect(counters(game, angel)).toBe(0);
  });
});

describe("Selhoff Entomber", () => {
  it("discards a creature card to draw, and can't with only noncreature cards", () => {
    const { game } = table();
    const entomber = spawn(game, "Selhoff Entomber");
    toHand(game, "Lightning Bolt");
    expect(() => activate(game, entomber, 0)).toThrow();
    const bears = toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, entomber, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Serpentine Ambush", () => {
  it("makes a creature a blue 5/5 Serpent, losing its other creature types", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Serpentine Ambush"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, bears)).toEqual(["Serpent"]);
    expect([...game.characteristics(bears).colors]).toEqual(["U"]);
  });
});

describe("Chill of the Grave", () => {
  it("costs {1} less with a Zombie; the creature stays tapped through its next untap", () => {
    const { game } = table();
    lands(game, "Island", 2);
    spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Chill of the Grave"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(hand(game).length).toBe(before + 1);
    toStep(game, "precombat-main", B);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Diregraf Scavenger", () => {
  it("drains 2 only when the card it exiles is a creature card", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickTargets(a, bolt);
    enter(game, "Diregraf Scavenger");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Diregraf Scavenger");
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Kessig Wolfrider", () => {
  it("exiles three cards from your graveyard to make a 3/2 red Wolf", () => {
    const { game, a } = table();
    const wolfrider = spawn(game, "Kessig Wolfrider");
    lands(game, "Mountain", 3);
    const cards = ["Grizzly Bears", "Hill Giant", "Opt"].map((n) => toGraveyard(game, n));
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 3);
    activate(game, wolfrider, 0);
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
    const wolf = named(game, "Wolf Token (Kessig Wolfrider)")[0];
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Distracting Geist // Clever Distraction", () => {
  it("taps a creature the defending player controls as it attacks", () => {
    const { game, a } = table();
    const geist = spawn(game, "Distracting Geist");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: geist, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("disturbed, the enchanted creature has the attack trigger, and the Aura is exiled with it", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const giant = spawn(game, "Hill Giant");
    const distraction = disturbOnto(game, "Distracting Geist", giant);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "declare-blockers");
    expect(game.state.objects[bears].tapped).toBe(true);
    toStep(game, "postcombat-main");
    destroy(game, giant);
    toStep(game, "end");
    expect(zone(game, distraction)).toBe("exile");
  });
});

describe("Resistance Squad", () => {
  it("draws only with another Human", () => {
    const { game } = table();
    let before = hand(game).length;
    enter(game, "Resistance Squad");
    expect(hand(game).length).toBe(before);
    spawn(game, "Elite Vanguard");
    before = hand(game).length;
    enter(game, "Resistance Squad");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Drogskol Infantry // Drogskol Armaments", () => {
  it("disturbed, the Aura gives +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const armaments = disturbOnto(game, "Drogskol Infantry", bears);
    expect(game.state.objects[armaments].face).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Rending Flame", () => {
  it("deals 2 to the controller only when the permanent is a Spirit", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rending Flame"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    const spirit = spawn(game, "Lantern Bearer", B);
    cast(game, toHand(game, "Rending Flame"), { targets: [ref(spirit)] });
    expect(zone(game, spirit)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Spiked Ripsaw", () => {
  it("+3/+3; sacrificing a Forest as the creature attacks gives it trample", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const forest = spawn(game, "Forest");
    const ripsaw = spawn(game, "Spiked Ripsaw");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, ripsaw, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    a.chooseModesFn = () => [0];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(zone(game, forest)).toBe("graveyard");
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Heron-Blessed Geist", () => {
  it("from the graveyard makes two Spirits, only while you control an enchantment", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const geist = toGraveyard(game, "Heron-Blessed Geist");
    expect(() => activate(game, geist, 0)).toThrow();
    spawn(game, "Glorious Anthem");
    activate(game, geist, 0);
    expect(zone(game, geist)).toBe("exile");
    expect(tokensNamed(game, "Spirit Token", A)).toBe(2);
  });
});
