/**
 * The set walk, batch 68, part a (2026-10-12): Foundations, Foundations
 * Jumpstart and Duskmourn. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Activate `source`'s ability `index`, sacrificing `sacrifice` for its cost. */
const activateSacrificing = (
  game: Game,
  source: ObjectId,
  index: number,
  sacrifice: ObjectId,
  targets: readonly ObjectId[] = [],
): void => {
  const action = {
    type: "activate-ability",
    player: A,
    source,
    abilityIndex: index,
    targets: targets.map(ref),
    sacrifice,
  } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
};

const gainLife = (game: Game, amount: number, player: PlayerId = A): void => {
  game.debugApplyEffect(player, { kind: "gain-life", amount }, []);
  settle(game);
};

describe("Ravenous Amulet", () => {
  it("draws and stores a soul counter per creature, then drains each opponent by the counters it was sacrificed with", () => {
    const { game } = table({ players: 3 });
    const amulet = spawn(game, "Ravenous Amulet");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activateSacrificing(game, amulet, 0, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, amulet, "soul")).toBe(1);

    game.state.objects[amulet].counters.soul = 3;
    game.state.objects[amulet].tapped = false;
    lands(game, "Wastes", 4);
    activate(game, amulet, 1);
    expect(zone(game, amulet)).toBe("graveyard");
    expect([life(game, B), life(game, C), life(game, A)]).toEqual([17, 17, 20]);
  });
});

describe("Sylvan Scavenging", () => {
  it("makes a Raccoon only while you control a creature with power 4 or greater", () => {
    const { game, a } = table();
    spawn(game, "Sylvan Scavenging");
    spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Raccoon Token")).toBe(0);

    spawn(game, "Craw Wurm");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Raccoon Token")).toBe(1);
  });

  it("or puts a +1/+1 counter on target creature you control", () => {
    const { game, a } = table();
    spawn(game, "Sylvan Scavenging");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(tokensNamed(game, "Raccoon Token")).toBe(0);
  });
});

describe("Midnight Snack", () => {
  it("has target opponent lose the life you gained this turn", () => {
    const { game } = table();
    const snack = spawn(game, "Midnight Snack");
    gainLife(game, 3);
    gainLife(game, 2);
    lands(game, "Swamp", 3);
    activate(game, snack, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(15);
    expect(zone(game, snack)).toBe("graveyard");
  });
});

describe("Cat Collector", () => {
  it("makes a Cat for the first life gain of each of your turns only", () => {
    const { game } = table();
    enter(game, "Cat Collector");
    expect(tokensNamed(game, "Food Token")).toBe(1);
    gainLife(game, 1);
    gainLife(game, 1);
    expect(tokensNamed(game, "Cat Token (Arahbo, the First Fang)")).toBe(1);

    // Bob's turn: a gain doesn't count.
    nextTurn(game);
    gainLife(game, 3);
    expect(tokensNamed(game, "Cat Token (Arahbo, the First Fang)")).toBe(1);
  });

  it("doesn't trigger if you already gained life this turn before it arrived", () => {
    const { game } = table();
    gainLife(game, 1);
    spawn(game, "Cat Collector");
    gainLife(game, 1);
    expect(tokensNamed(game, "Cat Token (Arahbo, the First Fang)")).toBe(0);
  });
});

describe("Qala, Ajani's Pridemate", () => {
  it("gives other attackers +X/+0 for every counter on Qala", () => {
    const { game, a } = table();
    const qala = spawn(game, "Qala, Ajani's Pridemate");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[qala].counters["+1/+1"] = 2;
    game.state.objects[qala].counters.shield = 1;
    attack(game, a, [qala, bears]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(pt(game, qala)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(10);
  });
});

describe("Urdnan, Dromoka Warrior", () => {
  it("gives an attacker with one +1/+1 counter first strike", () => {
    const { game, a } = table();
    spawn(game, "Urdnan, Dromoka Warrior");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
  });

  it("gives double strike instead to one with two or more", () => {
    const { game, a } = table();
    spawn(game, "Urdnan, Dromoka Warrior");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(life(game, B)).toBe(12);
  });
});

describe("Brigone, Soldier of Meletis", () => {
  it("gets a counter from your spell that targets it, not from one that targets something else", () => {
    const { game } = table();
    const brigone = spawn(game, "Brigone, Soldier of Meletis");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(counters(game, brigone)).toBe(0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(brigone)] });
    expect(counters(game, brigone)).toBe(1);

    const before = hand(game).length;
    activate(game, brigone, 0);
    expect(counters(game, brigone)).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Plagon, Lord of the Beach", () => {
  it("draws for each creature you control with toughness greater than its power, itself included", () => {
    const { game } = table();
    spawn(game, "Wall of Omens");
    spawn(game, "Grizzly Bears");
    spawn(game, "Wall of Omens", B);
    const before = hand(game).length;
    enter(game, "Plagon, Lord of the Beach");
    expect(hand(game).length).toBe(before + 2);
  });

  it("has a creature assign combat damage equal to its toughness without changing its power", () => {
    const { game, a } = table();
    const plagon = spawn(game, "Plagon, Lord of the Beach");
    lands(game, "Plains", 1);
    activate(game, plagon, 0, { targets: [ref(plagon)] });
    expect(pt(game, plagon).power).toBe(0);
    attack(game, a, [plagon]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Sutina, Speaker of the Tajuru", () => {
  it("returning a land sets off a reflexive +1/+1 counter; returning none does nothing", () => {
    const { game, a } = table();
    const sutina = spawn(game, "Sutina, Speaker of the Tajuru");
    const [forest] = lands(game, "Forest", 1);
    pickTargets(a, sutina);
    attack(game, a, [sutina]);
    expect(zone(game, forest)).toBe("hand");
    expect(counters(game, sutina)).toBe(1);

    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 1);
    a.choosePermanentsFn = () => [];
    attack(game, a, [sutina]);
    expect(counters(game, sutina)).toBe(1);
    expect(named(game, "Forest").length).toBe(1);
  });
});

describe("Braulios of Pheres Band", () => {
  it("is as big as your land count, and its attack draws then may put a land onto the battlefield", () => {
    const { game, a } = table();
    const braulios = spawn(game, "Braulios of Pheres Band");
    lands(game, "Wastes", 4);
    spawn(game, "Forest", B);
    expect(pt(game, braulios)).toEqual({ power: 4, toughness: 4 });
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    attack(game, a, [braulios]);
    expect(named(game, "Wastes", A).length).toBe(5);
    expect(pt(game, braulios)).toEqual({ power: 5, toughness: 5 });
    expect(life(game, B)).toBe(15);
  });
});

describe("Ozox, the Clattering King", () => {
  it("can't block; dies into Jumblebones, which returns Ozox to hand when it leaves", () => {
    const { game } = table();
    const ozox = spawn(game, "Ozox, the Clattering King");
    destroy(game, ozox);
    const [bones] = named(game, "Jumblebones");
    expect(bones).toBeDefined();
    expect(pt(game, bones)).toEqual({ power: 2, toughness: 1 });
    const card = graveyard(game).find((id) => game.state.objects[id].cardName === "Ozox, the Clattering King");
    expect(card).toBeDefined();
    destroy(game, bones);
    expect(zone(game, card!)).toBe("hand");
  });

  it("Jumblebones finds nothing with no Ozox in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Ozox, the Clattering King", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Jumblebones", count: 1 }, []);
    settle(game);
    const [bones] = named(game, "Jumblebones");
    destroy(game, bones);
    expect(graveyard(game, B).some((id) => game.state.objects[id].cardName === "Ozox, the Clattering King")).toBe(true);
  });
});

describe("Cynette, Jelly Drover", () => {
  it("makes a Jellyfish when it enters and when it dies, and pumps your fliers", () => {
    const { game } = table();
    const cynette = enter(game, "Cynette, Jelly Drover");
    const [jelly] = named(game, "Jellyfish Token");
    expect(pt(game, jelly)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, cynette)).toEqual({ power: 2, toughness: 2 });
    destroy(game, cynette);
    expect(tokensNamed(game, "Jellyfish Token")).toBe(2);
    expect(pt(game, jelly)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Taeko, the Patient Avalanche", () => {
  it("grows when another creature you control leaves without dying, not when one dies", () => {
    const { game } = table();
    const taeko = spawn(game, "Taeko, the Patient Avalanche");
    const bounced = spawn(game, "Grizzly Bears");
    const killed = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(bounced)]);
    settle(game);
    expect(counters(game, taeko)).toBe(1);
    destroy(game, killed);
    expect(counters(game, taeko)).toBe(1);
  });

  it("enters tapped", () => {
    const { game } = table();
    const entered = enter(game, "Taeko, the Patient Avalanche");
    expect(game.state.objects[entered].tapped).toBe(true);
  });

  it("paying {U/B} as it attacks makes an attacker unblockable", () => {
    const { game, a } = table();
    const taeko = spawn(game, "Taeko, the Patient Avalanche");
    const [swamp] = lands(game, "Swamp", 1);
    game.state.objects[taeko].tapped = false;
    pickModes(a, 0);
    pickTargets(a, taeko);
    attack(game, a, [taeko]);
    expect(game.state.objects[swamp].tapped).toBe(true);
    expect(keywords(game, taeko).has("unblockable")).toBe(true);
  });
});

describe("Splitskin Doll", () => {
  it("discards after the draw unless you control another creature with power 2 or less", () => {
    const { game } = table();
    let before = hand(game).length;
    enter(game, "Splitskin Doll");
    expect(hand(game).length).toBe(before);

    spawn(game, "Grizzly Bears");
    before = hand(game).length;
    enter(game, "Splitskin Doll");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Dissection Tools", () => {
  it("manifests dread and attaches to the manifested creature, which gets +2/+2, deathtouch and lifelink", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    const tools = enter(game, "Dissection Tools");
    const host = game.state.objects[tools].attachedTo;
    expect(host).not.toBeNull();
    expect(game.state.objects[host!].faceDown).toBeDefined();
    expect(pt(game, host!)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, host!).has("deathtouch")).toBe(true);
    expect(keywords(game, host!).has("lifelink")).toBe(true);
  });

  it("equips by sacrificing a creature", () => {
    const { game, a } = table();
    const tools = spawn(game, "Dissection Tools");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Omens");
    activateSacrificing(game, tools, 0, wall, [bears]);
    void a;
    expect(zone(game, wall)).toBe("graveyard");
    expect(game.state.objects[tools].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});
