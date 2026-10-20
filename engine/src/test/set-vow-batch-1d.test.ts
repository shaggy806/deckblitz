/**
 * Innistrad: Crimson Vow, group d. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
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
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const face = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);

/** Alice activates one of her Blood tokens: {1}, {T}, discard a card,
 * sacrifice it — draw a card. */
const sacrificeBlood = (game: Game): void => {
  lands(game, "Wastes", 1);
  toHand(game, "Grizzly Bears");
  activate(game, named(game, "Blood Token", A)[0], 0);
};

const makeBlood = (game: Game, count: number): void => {
  game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count }, []);
  settle(game);
};

describe("Blood Fountain", () => {
  it("makes a Blood, then returns up to two creature cards as it's sacrificed", () => {
    const { game } = table();
    const fountain = enter(game, "Blood Fountain");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    activate(game, fountain, 0, { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, fountain)).toBe("graveyard");
  });
});

describe("Pointed Discussion", () => {
  it("draws two, loses 2 life, then makes a Blood", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Pointed Discussion"));
    expect(hand(game)).toHaveLength(before + 2);
    expect(life(game, A)).toBe(18);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Markov Purifier", () => {
  it("having gained life this turn, pays {2} at the end step to draw", () => {
    const { game, a } = table();
    spawn(game, "Markov Purifier");
    lands(game, "Wastes", 2);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    // Lost again: it still triggers (the ruling).
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" }, []);
    pickModes(a, 0);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("no life gained, no trigger", () => {
    const { game, a } = table();
    spawn(game, "Markov Purifier");
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Dormant Grove // Gnarled Grovestrider", () => {
  it("transforms once the creature's toughness reaches 6; the Grovestrider gives vigilance to others", () => {
    const { game, a } = table();
    const grove = spawn(game, "Dormant Grove");
    const wall = spawn(game, "Wall of Omens"); // 0/4
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, wall);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, wall)).toBe(1);
    expect(face(game, grove)).toBe("Dormant Grove");
    pickTargets(a, wall);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, wall)).toEqual({ power: 2, toughness: 6 });
    expect(face(game, grove)).toBe("Gnarled Grovestrider");
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(keywords(game, grove).has("vigilance")).toBe(true);
  });
});

describe("Catapult Fodder // Catapult Captain", () => {
  it("transforms with three creatures each with toughness greater than its power", () => {
    const { game } = table();
    const fodder = spawn(game, "Catapult Fodder");
    spawn(game, "Wall of Omens");
    spawn(game, "Grizzly Bears"); // 2/2 — doesn't count
    toStep(game, "begin-combat");
    settle(game);
    expect(face(game, fodder)).toBe("Catapult Fodder");
    spawn(game, "Wall of Wood");
    toStep(game, "begin-combat");
    settle(game);
    expect(face(game, fodder)).toBe("Catapult Captain");
  });

  it("the Captain makes an opponent lose life equal to the sacrificed creature's toughness", () => {
    const { game } = table();
    const fodder = spawn(game, "Catapult Fodder");
    spawn(game, "Wall of Omens");
    const wall = spawn(game, "Wall of Wood"); // 0/3
    toStep(game, "begin-combat");
    settle(game);
    expect(face(game, fodder)).toBe("Catapult Captain");
    toStep(game, "postcombat-main");
    lands(game, "Swamp", 3);
    game.dispatch({ type: "activate-ability", player: A, source: fodder, abilityIndex: 0, targets: [ref(B)], sacrifice: wall });
    settle(game);
    expect(zone(game, wall)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});

describe("Dominating Vampire", () => {
  it("can take a creature with mana value up to its controller's Vampire count; untaps it and gives it haste", () => {
    const { game, a } = table();
    spawn(game, "Markov Purifier"); // a second Vampire
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true }); // mana value 2
    const corpse = spawn(game, "Walking Corpse", B); // mana value 2
    const giant = spawn(game, "Hill Giant", B); // mana value 4
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Dominating Vampire");
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, corpse]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(game.state.objects[bears].controller).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Volatile Arsonist // Dire-Strain Anarchist", () => {
  it("attacking, deals 1 to up to one creature, one player and one planeswalker", () => {
    const { game, a } = table();
    const arsonist = spawn(game, "Volatile Arsonist");
    const bears = spawn(game, "Grizzly Bears", B);
    const jace = spawn(game, "Jace Beleren", B);
    const loyaltyBefore = counters(game, jace, "loyalty");
    pickTargets(a, bears, B, jace);
    attack(game, a, [arsonist]);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(counters(game, jace, "loyalty")).toBe(loyaltyBefore - 1);
    // 1 from the trigger, 4 in combat.
    expect(life(game, B)).toBe(15);
  });

  it("at night it's the Anarchist, dealing 2 to each; slots may be left empty", () => {
    const { game, a } = table();
    game.state.dayNight = "night";
    const wolf = enter(game, "Volatile Arsonist");
    expect(face(game, wolf)).toBe("Dire-Strain Anarchist");
    const bears = spawn(game, "Grizzly Bears", B);
    // No planeswalker: that slot has no options and is left out.
    pickTargets(a, bears, null);
    attack(game, a, [wolf]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });
});

describe("Toxic Scorpion", () => {
  it("gives another creature you control deathtouch", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [giant]);
    const scorpion = enter(game, "Toxic Scorpion");
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(seen.offered[0]).not.toContain(scorpion);
    expect(keywords(game, giant).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("Disturb Auras", () => {
  it("Twinblade Invocation: cast from the graveyard onto a creature, which gets double strike; exiled when it goes", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const geist = toGraveyard(game, "Twinblade Geist");
    cast(game, geist, { targets: [ref(bears)], via: "disturb", face: 1 });
    expect(zone(game, geist)).toBe("battlefield");
    expect(face(game, geist)).toBe("Twinblade Invocation");
    expect(game.state.objects[geist].attachedTo).toBe(bears);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    toStep(game, "end");
    expect(zone(game, geist)).toBe("exile");
  });

  it("Ancestor's Embrace: lifelink; countered on the stack, it's exiled", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const ancestor = toGraveyard(game, "Kindly Ancestor");
    cast(game, ancestor, { targets: [ref(bears)], via: "disturb", face: 1, settle: false });
    expect(zone(game, ancestor)).toBe("stack");
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(ancestor)]);
    expect(zone(game, ancestor)).toBe("exile");
  });

  it("Ancestor's Embrace resolved gives lifelink", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const ancestor = toGraveyard(game, "Kindly Ancestor");
    cast(game, ancestor, { targets: [ref(bears)], via: "disturb", face: 1 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });

  it("Binding Geist's attack gives -2/-0; Spectral Binding does too, on what it enchants", () => {
    const { game, a } = table();
    const geist = spawn(game, "Binding Geist");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    a.declareAttackersFn = () => [{ attacker: geist, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });

    const t = table();
    lands(t.game, "Island", 2);
    const other = spawn(t.game, "Hill Giant", B);
    const card = toGraveyard(t.game, "Binding Geist");
    cast(t.game, card, { targets: [ref(other)], via: "disturb", face: 1 });
    expect(face(t.game, card)).toBe("Spectral Binding");
    expect(pt(t.game, other)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Flourishing Hunter", () => {
  it("gains life equal to the greatest toughness among other creatures you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Wall of Omens"); // 0/4
    spawn(game, "Wall of Wood", B);
    enter(game, "Flourishing Hunter");
    expect(life(game, A)).toBe(24);
  });

  it("with no other creature, gains nothing (its own 6 doesn't count)", () => {
    const { game } = table();
    enter(game, "Flourishing Hunter");
    expect(life(game, A)).toBe(20);
  });
});

describe("Retrieve", () => {
  it("returns a creature card and a noncreature permanent card, then exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const retrieve = toHand(game, "Retrieve");
    const attempt = (second: ObjectId) =>
      game.canDispatch({ type: "cast-spell", player: A, card: retrieve, targets: [ref(bears), ref(second)] });
    // An instant isn't a permanent card; a creature card isn't a noncreature one.
    expect(attempt(ring)).toBeNull();
    expect(attempt(bolt)).not.toBeNull();
    expect(attempt(toGraveyard(game, "Hill Giant"))).not.toBeNull();
    cast(game, retrieve, { targets: [ref(bears), ref(ring)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, retrieve)).toBe("exile");
  });
});

describe("Heron of Hope", () => {
  it("each Heron adds 1 to each life gain; {1}{W} gives it lifelink", () => {
    const { game } = table();
    const heron = spawn(game, "Heron of Hope");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    expect(life(game, A)).toBe(24);
    spawn(game, "Heron of Hope");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    expect(life(game, A)).toBe(27);
    lands(game, "Plains", 2);
    activate(game, heron, 0);
    expect(keywords(game, heron).has("lifelink")).toBe(true);
  });
});

describe("Blood Hypnotist", () => {
  it("can't block; sacrificing a Blood stops a creature blocking — only once each turn", () => {
    const { game, a } = table();
    const hypnotist = spawn(game, "Blood Hypnotist");
    const bears = spawn(game, "Grizzly Bears", B);
    makeBlood(game, 2);
    const seen = watchTargets(a, () => [bears]);
    sacrificeBlood(game);
    expect(seen.asked).toBe(1);
    sacrificeBlood(game);
    expect(seen.asked).toBe(1);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    const corpse = spawn(game, "Walking Corpse", B);
    const offer = blockOffer(game, a, [hypnotist]);
    expect(game.state.turn.number).toBe(1);
    const blockers = offer.eligible.map((e) => e.blocker);
    expect(blockers).not.toContain(bears);
    expect(blockers).toContain(corpse);
  });
});

describe("Sanguine Statuette", () => {
  it("makes a Blood; a Blood sacrificed may make it a 3/3 Vampire artifact creature with haste", () => {
    const { game, a } = table();
    const statuette = enter(game, "Sanguine Statuette");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    pickModes(a, 0);
    sacrificeBlood(game);
    expect(types(game, statuette)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, statuette)).toContain("Vampire");
    expect(pt(game, statuette)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, statuette).has("haste")).toBe(true);
  });

  it("declined, it stays a noncreature artifact", () => {
    const { game, a } = table();
    const statuette = enter(game, "Sanguine Statuette");
    pickModes(a);
    sacrificeBlood(game);
    expect(types(game, statuette)).not.toContain("creature");
  });
});

describe("Hungry Ridgewolf", () => {
  it("gets +1/+0 and trample only with another Wolf or Werewolf", () => {
    const { game } = table();
    const wolf = spawn(game, "Hungry Ridgewolf");
    expect(pt(game, wolf)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, wolf).has("trample")).toBe(false);
    spawn(game, "Bird Admirer"); // a Human Archer Werewolf
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, wolf).has("trample")).toBe(true);
    spawn(game, "Hungry Ridgewolf");
    expect(pt(game, wolf)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Patchwork Crawler", () => {
  it("exiles a creature card, grows, and gains its activated abilities", () => {
    const { game } = table();
    const crawler = spawn(game, "Patchwork Crawler");
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    const shaman = toGraveyard(game, "Anaba Shaman");
    activate(game, crawler, 0, { targets: [ref(shaman)] });
    expect(zone(game, shaman)).toBe("exile");
    expect(counters(game, crawler)).toBe(1);
    expect(pt(game, crawler)).toEqual({ power: 2, toughness: 3 });
    // Anaba Shaman's "{R}, {T}: This creature deals 1 damage to any target."
    activate(game, crawler, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[crawler].tapped).toBe(true);
  });
});

describe("Ballista Watcher // Ballista Wielder", () => {
  it("the Watcher pings any target", () => {
    const { game } = table();
    const watcher = spawn(game, "Ballista Watcher");
    lands(game, "Mountain", 3);
    activate(game, watcher, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
  });

  it("the Wielder's ping stops the creature it damaged from blocking", () => {
    const { game, a } = table();
    game.state.dayNight = "night";
    const wielder = enter(game, "Ballista Watcher");
    expect(face(game, wielder)).toBe("Ballista Wielder");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    activate(game, wielder, 0, { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(1);
    const offer = blockOffer(game, a, [wielder]);
    const blockers = offer.eligible.map((e) => e.blocker);
    expect(blockers).not.toContain(giant);
    expect(blockers).toContain(bears);
  });
});

describe("Syphon Essence", () => {
  it("counters a creature spell and makes a Blood", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Syphon Essence"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Sawblade Slinger", () => {
  it("fights a Zombie an opponent controls", () => {
    const { game, a } = table();
    const corpse = spawn(game, "Walking Corpse", B);
    spawn(game, "Sol Ring", B); // so both modes are on offer
    pickModes(a, 1);
    pickTargets(a, corpse);
    const slinger = enter(game, "Sawblade Slinger");
    expect(zone(game, corpse)).toBe("graveyard");
    expect(game.state.objects[slinger].damageMarked).toBe(2);
  });

  it("destroys an artifact an opponent controls", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    spawn(game, "Walking Corpse", B);
    pickModes(a, 0);
    pickTargets(a, ring);
    enter(game, "Sawblade Slinger");
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("may choose no mode", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a);
    enter(game, "Sawblade Slinger");
    expect(zone(game, ring)).toBe("battlefield");
    expect(named(game, "Sawblade Slinger", A)).toHaveLength(1);
  });
});
