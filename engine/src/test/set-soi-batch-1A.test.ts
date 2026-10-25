/**
 * Shadows over Innistrad, group A — the clause of each card most likely to
 * be wrong, tested from its Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
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
  pickFromZone,
  pickModes,
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
  zone,
} from "./harness.js";
import type { ObjectId } from "../primitives.js";

/** Four card types in alice's graveyard: land, creature, instant, sorcery. */
function delirium(game: Game): void {
  toGraveyard(game, "Wastes");
  toGraveyard(game, "Grizzly Bears");
  toGraveyard(game, "Shock");
  toGraveyard(game, "Divination");
}

function transform(game: Game, id: ObjectId): void {
  game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(id)]);
  settle(game);
}

describe("Sigarda, Heron's Grace", () => {
  it("gives only Humans you control hexproof, and makes a Human Soldier by exiling a graveyard card", () => {
    const { game, a } = table();
    const sigarda = spawn(game, "Sigarda, Heron's Grace");
    const human = spawn(game, "Aetherblade Agent");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Aetherblade Agent", B);
    expect(keywords(game, human).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
    expect(keywords(game, sigarda).has("hexproof")).toBe(false);

    lands(game, "Wastes", 2);
    const card = toGraveyard(game, "Shock");
    pickFromZone(a, card);
    activate(game, sigarda, 0);
    expect(zone(game, card)).toBe("exile");
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(1);
  });
});

describe("Olivia, Mobilized for War", () => {
  it("on a discard, the entering creature gets a counter, haste and becomes a Vampire", () => {
    const { game, a } = table();
    spawn(game, "Olivia, Mobilized for War");
    const card = toHand(game, "Wastes");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [card];
    const bears = enter(game, "Grizzly Bears");
    expect(zone(game, card)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(subtypes(game, bears)).toContain("Vampire");
    expect(subtypes(game, bears)).toContain("Bear");
  });

  it("does nothing to the creature when you don't discard", () => {
    const { game, a } = table();
    spawn(game, "Olivia, Mobilized for War");
    toHand(game, "Wastes");
    const before = hand(game).length;
    pickModes(a);
    const bears = enter(game, "Grizzly Bears");
    expect(hand(game).length).toBe(before);
    expect(counters(game, bears)).toBe(0);
    expect(subtypes(game, bears)).not.toContain("Vampire");
  });
});

describe("Cult of the Waxing Moon", () => {
  it("makes a Wolf when a permanent you control transforms into a non-Human creature, not into a Human", () => {
    const { game } = table();
    spawn(game, "Cult of the Waxing Moon");
    const villager = spawn(game, "Aetherblade Agent");
    transform(game, villager); // into Gitaxian Mindstinger, a Phyrexian
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
    transform(game, villager); // back into the Human
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });
});

describe("Neglected Heirloom", () => {
  it("transforms when the equipped creature transforms, and stays attached", () => {
    const { game } = table();
    const heirloom = spawn(game, "Neglected Heirloom");
    const villager = spawn(game, "Aetherblade Agent");
    lands(game, "Wastes", 1);
    activate(game, heirloom, 0, { targets: [ref(villager)] });
    expect(game.state.objects[heirloom].attachedTo).toBe(villager);
    transform(game, villager);
    expect(game.state.objects[heirloom].face).toBe(1);
    expect(game.state.objects[heirloom].attachedTo).toBe(villager);
    expect(keywords(game, villager).has("first-strike")).toBe(true);
  });
});

describe("Hope Against Hope", () => {
  it("counts every creature you control, and gives first strike only to a Human", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const villager = spawn(game, "Aetherblade Agent");
    spawn(game, "Grizzly Bears", B);
    const base = pt(game, bears);
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Hope Against Hope"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: base.power + 2, toughness: base.toughness + 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    cast(game, toHand(game, "Hope Against Hope"), { targets: [ref(villager)] });
    expect(keywords(game, villager).has("first-strike")).toBe(true);
  });
});

describe("Equestrian Skill", () => {
  it("gives trample only while the enchanted creature is a Human", () => {
    const { game } = table();
    const villager = spawn(game, "Aetherblade Agent");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Equestrian Skill"), { targets: [ref(villager)] });
    expect(keywords(game, villager).has("trample")).toBe(true);
    transform(game, villager); // Gitaxian Mindstinger isn't a Human
    expect(keywords(game, villager).has("trample")).toBe(false);
  });
});

describe("Reaper of Flight Moonsilver", () => {
  it("sacrifices another creature for +2/+1, only with delirium", () => {
    const { game } = table();
    const reaper = spawn(game, "Reaper of Flight Moonsilver");
    const bears = spawn(game, "Grizzly Bears");
    const pump = (sacrifice: ObjectId) =>
      ({ type: "activate-ability", player: A, source: reaper, abilityIndex: 0, targets: [], sacrifice }) as const;
    expect(game.canDispatch(pump(bears))).not.toBeNull();
    delirium(game);
    expect(game.canDispatch(pump(reaper))).not.toBeNull();
    expect(game.canDispatch(pump(bears))).toBeNull();
    game.dispatch(pump(bears));
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, reaper)).toBe("battlefield");
    expect(pt(game, reaper)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Autumnal Gloom", () => {
  it("transforms at your end step only with delirium", () => {
    const { game } = table();
    const gloom = spawn(game, "Autumnal Gloom");
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[gloom].face ?? 0).toBe(0);
    delirium(game);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[gloom].face).toBe(1);
    expect(types(game, gloom)).toContain("creature");
    expect(keywords(game, gloom).has("hexproof")).toBe(true);
  });
});

describe("Paranoid Parish-Blade and Scourge Wolf", () => {
  it("gain their delirium bonuses with four card types in the graveyard", () => {
    const { game } = table();
    const blade = spawn(game, "Paranoid Parish-Blade");
    const wolf = spawn(game, "Scourge Wolf");
    expect(pt(game, blade).power).toBe(3);
    expect(keywords(game, wolf).has("double-strike")).toBe(false);
    delirium(game);
    expect(pt(game, blade).power).toBe(4);
    expect(keywords(game, blade).has("first-strike")).toBe(true);
    expect(keywords(game, wolf).has("double-strike")).toBe(true);
  });
});

describe("Murderer's Axe", () => {
  it("equips by discarding a card", () => {
    const { game, a } = table();
    const axe = spawn(game, "Murderer's Axe");
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Wastes");
    a.chooseDiscardsFn = () => [card];
    activate(game, axe, 0, { targets: [ref(bears)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Shard of Broken Glass", () => {
  it("may mill two whenever the equipped creature attacks", () => {
    const { game, a } = table();
    const shard = spawn(game, "Shard of Broken Glass");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    activate(game, shard, 0, { targets: [ref(bears)] });
    const before = graveyard(game).length;
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(graveyard(game).length).toBe(before + 2);
  });
});

describe("Tenacity", () => {
  it("pumps, gives lifelink and untaps your creatures", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Tenacity"));
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(keywords(game, theirs).has("lifelink")).toBe(false);
  });
});

describe("Malevolent Whispers", () => {
  it("steals, untaps and pumps the creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Malevolent Whispers"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
