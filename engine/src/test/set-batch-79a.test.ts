/**
 * Set walk batch 79, part a (2026-10-15): Avatar: The Last Airbender (TLA), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  controller,
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
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
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

const redInPool = (game: Game): number => game.state.players[A].manaPool.filter((u) => u.type === "R").length;

describe("Azula, On the Hunt", () => {
  it("firebends 2 and, attacking, costs 1 life for a Clue", () => {
    const { game, a } = table();
    const azula = spawn(game, "Azula, On the Hunt");
    spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [azula]);
    expect(redInPool(game)).toBe(2);
    expect(life(game)).toBe(19);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Master Piandao", () => {
  it("looks at four when it attacks and may take an Ally, Equipment or Lesson", () => {
    const { game, a } = table();
    const piandao = spawn(game, "Master Piandao");
    const bears = toLibrary(game, "Grizzly Bears");
    const lesson = toLibrary(game, "Introduction to Prophecy");
    const blade = toLibrary(game, "Bonesplitter");
    const ally = toLibrary(game, "Earth Kingdom Protectors");
    const picked = pickFromZone(a, blade);
    attack(game, a, [piandao]);
    expect(picked.offered).toEqual(expect.arrayContaining([lesson, blade, ally]));
    expect(picked.offered).not.toContain(bears);
    expect(zone(game, blade)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Fire Sages", () => {
  it("firebends 1 and grows for {1}{R}{R}", () => {
    const { game, a } = table();
    const sages = spawn(game, "Fire Sages");
    lands(game, "Mountain", 3);
    activate(game, sages);
    expect(counters(game, sages)).toBe(1);
    spawn(game, "Grizzly Bears", B);
    blockOffer(game, a, [sages]);
    expect(redInPool(game)).toBe(1);
  });
});

describe("Zuko's Conviction", () => {
  it("returns a creature card to the hand, or kicked puts it onto the battlefield tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Zuko's Conviction"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");

    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    cast(game, toHand(game, "Zuko's Conviction"), { targets: [ref(dreadmaw)], kicked: true });
    const back = named(game, "Colossal Dreadmaw", A);
    expect(back).toHaveLength(1);
    expect(game.state.objects[back[0]].tapped).toBe(true);
  });
});

describe("Wartime Protestors", () => {
  it("gives another Ally that enters a +1/+1 counter and haste, and not a non-Ally", () => {
    const { game } = table();
    spawn(game, "Wartime Protestors");
    const ally = game.debugSpawn("Earth Kingdom Protectors", A, "battlefield", { announceEntry: true });
    settle(game);
    expect(counters(game, ally)).toBe(1);
    expect(keywords(game, ally).has("haste")).toBe(true);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Phoenix Fleet Airship", () => {
  it("copies itself at your end step only if you sacrificed a permanent this turn", () => {
    const { game } = table();
    spawn(game, "Phoenix Fleet Airship");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Phoenix Fleet Airship", A)).toHaveLength(1);

    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(bears)]);
    settle(game);
    toStep(game, "end");
    settle(game);
    const airships = named(game, "Phoenix Fleet Airship", A);
    expect(airships).toHaveLength(2);
    expect(airships.some((id) => game.state.objects[id].isToken)).toBe(true);
  });

  it("is an artifact creature with eight or more Airships, not with seven", () => {
    const { game } = table();
    const fleet = Array.from({ length: 7 }, () => spawn(game, "Phoenix Fleet Airship"));
    expect(types(game, fleet[0])).not.toContain("creature");
    fleet.push(spawn(game, "Phoenix Fleet Airship"));
    expect(types(game, fleet[0])).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, fleet[0])).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Earth Kingdom Protectors", () => {
  it("is sacrificed to make another Ally you control indestructible", () => {
    const { game } = table();
    const protectors = spawn(game, "Earth Kingdom Protectors");
    const ally = spawn(game, "Wartime Protestors");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, protectors, 0, { targets: [ref(bears)] })).toThrow();
    expect(() => activate(game, protectors, 0, { targets: [ref(protectors)] })).toThrow();
    activate(game, protectors, 0, { targets: [ref(ally)] });
    expect(zone(game, protectors)).toBe("graveyard");
    destroy(game, ally);
    expect(zone(game, ally)).toBe("battlefield");
  });
});

describe("Curious Farm Animals", () => {
  it("destroys up to one artifact or enchantment, and gains 3 life as it dies", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const animals = spawn(game, "Curious Farm Animals");
    const ring = spawn(game, "Sol Ring", B);
    activate(game, animals, 0, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });

  it("may be activated with no target", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const animals = spawn(game, "Curious Farm Animals");
    activate(game, animals, 0, { targets: [null] });
    expect(zone(game, animals)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });
});

describe("Destined Confrontation", () => {
  it("has each player keep creatures of total power 4 or less and sacrifice the rest", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const bears2 = spawn(game, "Grizzly Bears");
    const dreadmaw = spawn(game, "Colossal Dreadmaw");
    const theirs = spawn(game, "Grizzly Bears", B);
    const theirMaw = spawn(game, "Colossal Dreadmaw", B);
    pickPermanents(a, bears, bears2);
    pickPermanents(b, theirs);
    cast(game, toHand(game, "Destined Confrontation"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, bears2)).toBe("battlefield");
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, theirMaw)).toBe("graveyard");
  });
});

describe("Team Avatar", () => {
  it("pumps a creature attacking alone by the number of creatures you control", () => {
    const { game, a } = table();
    spawn(game, "Team Avatar");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });

  it("is discarded from the hand to deal damage equal to your creature count", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    const team = toHand(game, "Team Avatar");
    activate(game, team, 0, { targets: [ref(dreadmaw)] });
    expect(zone(game, team)).toBe("graveyard");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(3);
  });
});

describe("The Cave of Two Lovers", () => {
  it("makes two Allies, finds a Mountain, then earthbends 3", () => {
    const { game, a } = table();
    const cave = enter(game, "The Cave of Two Lovers");
    expect(tokensNamed(game, "Ally Token", A)).toBe(2);

    const mountain = toLibrary(game, "Mountain");
    pickFromZone(a, mountain);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(cave)]);
    settle(game);
    expect(zone(game, mountain)).toBe("hand");

    const wastes = spawn(game, "Wastes");
    pickTargets(a, wastes);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(cave)]);
    settle(game);
    expect(counters(game, wastes)).toBe(3);
    expect(pt(game, wastes)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, cave)).toBe("graveyard");
  });
});

describe("Guru Pathik", () => {
  it("looks at five for a Lesson, Saga or Shrine as it enters", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const saga = toLibrary(game, "The Cave of Two Lovers");
    const picked = pickFromZone(a, saga);
    enter(game, "Guru Pathik");
    expect(picked.offered).toContain(saga);
    expect(picked.offered).not.toContain(bears);
    expect(zone(game, saga)).toBe("hand");
  });

  it("puts a +1/+1 counter on another creature you control when you cast a Lesson", () => {
    const { game, a } = table();
    const guru = spawn(game, "Guru Pathik");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Introduction to Prophecy"));
    expect(seen.offered[0]).not.toContain(guru);
    expect(counters(game, bears)).toBe(1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Sol Ring"));
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Iroh, Tea Master", () => {
  it("makes a Food, and may give a permanent away for an Ally with a counter per permanent you own they control", () => {
    const { game, a } = table();
    enter(game, "Iroh, Tea Master");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B, bears);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, bears)).toBe(B);
    const allies = game.battlefield.filter((id) => game.state.objects[id].cardName === "Ally Token");
    expect(allies).toHaveLength(1);
    expect(counters(game, allies[0])).toBe(1);
    expect(pt(game, allies[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("gives nothing and makes no token when declined", () => {
    const { game, a } = table();
    spawn(game, "Iroh, Tea Master");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B, bears);
    pickModes(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, bears)).toBe(A);
    expect(tokensNamed(game, "Ally Token")).toBe(0);
  });

  it("makes no token when the permanent has left before it resolves", () => {
    const { game, a } = table();
    spawn(game, "Iroh, Tea Master");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B, bears);
    pickModes(a, 0);
    game.advanceUntil((s) => s.zones.shared.stack.length === 1);
    destroy(game, bears);
    expect(tokensNamed(game, "Ally Token")).toBe(0);
  });
});

describe("Sandbenders' Storm", () => {
  it("destroys a creature with power 4 or greater, or earthbends 3", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Sandbenders' Storm"), { modes: [0], targets: [ref(dreadmaw)] });
    expect(zone(game, dreadmaw)).toBe("graveyard");

    const wastes = spawn(game, "Wastes");
    cast(game, toHand(game, "Sandbenders' Storm"), { modes: [1], targets: [ref(wastes)] });
    expect(counters(game, wastes)).toBe(3);
    expect(types(game, wastes)).toContain("creature");
  });
});

describe("White Lotus Reinforcements", () => {
  it("gives other Allies you control +1/+1", () => {
    const { game } = table();
    const lotus = spawn(game, "White Lotus Reinforcements");
    const ally = spawn(game, "Earth Kingdom Protectors");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Earth Kingdom Protectors", B);
    expect(pt(game, ally)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, lotus)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Raven Eagle", () => {
  it("exiles a card from a graveyard as it enters, and a creature card makes a Clue", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Raven Eagle");
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("makes no Clue for a noncreature card, exiling as it attacks", () => {
    const { game, a } = table();
    const eagle = spawn(game, "Raven Eagle");
    const ring = toGraveyard(game, "Sol Ring", B);
    pickTargets(a, ring);
    attack(game, a, [eagle]);
    expect(zone(game, ring)).toBe("exile");
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });

  it("drains each opponent for 1 on your second card drawn each turn, only", () => {
    const { game } = table();
    spawn(game, "Raven Eagle");
    // Alice drew her first card this turn in her draw step.
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game)).toBe(21);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(19);
  });
});

describe("Professor Zei, Anthropologist", () => {
  it("loots, and is sacrificed to return an instant or sorcery card", () => {
    const { game } = table();
    const zei = spawn(game, "Professor Zei, Anthropologist");
    toHand(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    activate(game, zei, 0);
    expect(graveyard(game)).toHaveLength(1);
    expect(hand(game)).toHaveLength(handBefore);
    expect(() => activate(game, zei, 0)).toThrow();

    game.state.objects[zei].tapped = false;
    lands(game, "Wastes", 1);
    const lesson = toGraveyard(game, "Introduction to Prophecy");
    activate(game, zei, 1, { targets: [ref(lesson)] });
    expect(zone(game, lesson)).toBe("hand");
    expect(zone(game, zei)).toBe("graveyard");
  });
});

describe("Twin Blades", () => {
  it("attaches as it enters and gives double strike this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blades = enter(game, "Twin Blades");
    expect(game.state.objects[blades].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });
});

describe("Allies at Last", () => {
  it("costs {1} less per Ally, and up to two creatures each deal their power", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const one = spawn(game, "Wartime Protestors");
    const two = spawn(game, "Wartime Protestors");
    const big = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Allies at Last"), { targets: [ref(one), ref(two), ref(big)] });
    expect(zone(game, big)).toBe("graveyard");
    expect(game.state.objects[one].damageMarked).toBe(0);
  });

  it("deals one creature's damage with the second slot left empty", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const big = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Allies at Last"), { targets: [ref(bears), null, ref(big)] });
    expect(game.state.objects[big].damageMarked).toBe(2);
  });
});

describe("Jeong Jeong, the Deserter", () => {
  it("exhausts for a counter and a copy of the next Lesson spell, once", () => {
    const { game } = table();
    const jeong = spawn(game, "Jeong Jeong, the Deserter");
    lands(game, "Wastes", 6);
    activate(game, jeong);
    expect(counters(game, jeong)).toBe(1);
    expect(() => activate(game, jeong)).toThrow();
    const lesson = toHand(game, "Introduction to Prophecy");
    const handBefore = hand(game).length;
    cast(game, lesson);
    // The spell and its copy each draw a card.
    expect(hand(game)).toHaveLength(handBefore - 1 + 2);
    expect(graveyard(game)).toContain(lesson);
  });
});

describe("Pillar Launch", () => {
  it("pumps, grants reach and untaps", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Pillar Launch"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

