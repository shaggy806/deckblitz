/**
 * Recheck list R2, group A (batch B236): each card's clause most likely to be
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
  tokensNamed,
  zone,
} from "./harness.js";
import type { Action } from "../actions.js";

describe("Lilypad Village", () => {
  it("surveils only once a Bird, Frog, Otter or Rat entered under your control this turn", () => {
    const { game } = table();
    const village = spawn(game, "Lilypad Village");
    lands(game, "Island", 1);
    const action = { type: "activate-ability", player: A, source: village, abilityIndex: 2, targets: [] } as Action;
    expect(game.canDispatch(action)).not.toBeNull();
    enter(game, "Grizzly Bears");
    expect(game.canDispatch(action)).not.toBeNull();
    const frog = enter(game, "Frogmite");
    // The ruling: it doesn't matter that it has left since.
    destroy(game, frog);
    expect(zone(game, frog)).toBe("graveyard");
    expect(game.canDispatch(action)).toBeNull();
  });
});

describe("Wolf Strike", () => {
  it("deals damage equal to power by day, with +2/+0 only at night", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const victim = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Wolf Strike"), { targets: [ref(giant), ref(victim)] });
    expect(pt(game, giant).power).toBe(3);
    expect(zone(game, victim)).toBe("graveyard");

    const big = spawn(game, "Grizzly Bears", B);
    game.state.objects[big].counters["+1/+1"] = 2; // 4/4
    game.state.dayNight = "night";
    cast(game, toHand(game, "Wolf Strike"), { targets: [ref(giant), ref(big)] });
    expect(pt(game, giant).power).toBe(5);
    expect(zone(game, big)).toBe("graveyard");
  });
});

describe("Into the Story", () => {
  it("costs {3} less while an opponent has seven cards in their graveyard", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const story = toHand(game, "Into the Story");
    const action = { type: "cast-spell", player: A, card: story, targets: [] } as Action;
    expect(game.canDispatch(action)).not.toBeNull();
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes", B);
    const before = hand(game).length;
    cast(game, story);
    expect(hand(game).length).toBe(before - 1 + 4);
  });
});

describe("Sword of the Paruns", () => {
  it("pumps by the equipped creature's tap state, and taps or untaps it", () => {
    const { game, a } = table();
    const sword = spawn(game, "Sword of the Paruns");
    const bearer = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const tappedOne = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Wastes", 9);
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
    pickTargets(a, bearer);
    activate(game, sword, 1, { targets: [ref(bearer)] });
    expect(pt(game, other)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, tappedOne)).toEqual({ power: 2, toughness: 2 });
    pickModes(a, 0); // tap it
    activate(game, sword, 0);
    expect(game.state.objects[bearer].tapped).toBe(true);
    expect(pt(game, other)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, tappedOne)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, bearer)).toEqual({ power: 4, toughness: 2 });
    pickModes(a, 1); // untap it
    activate(game, sword, 0);
    expect(game.state.objects[bearer].tapped).toBe(false);
    expect(pt(game, bearer)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Mutagen Man, Living Ooze", () => {
  it("makes X Mutagens whose ability then costs {0}", () => {
    const { game, a } = table();
    const man = toHand(game, "Mutagen Man, Living Ooze");
    lands(game, "Forest", 4);
    cast(game, man, { x: 2 });
    expect(tokensNamed(game, "Mutagen Token", A)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    const [mutagen] = named(game, "Mutagen Token", A);
    pickTargets(a, bears);
    activate(game, mutagen, 0, { targets: [ref(bears)] });
    expect(pt(game, bears).power).toBe(3);
  });
});

describe("Saproling Cluster", () => {
  it("an opponent may activate it, discarding and getting the token", () => {
    const { game } = table();
    spawn(game, "Saproling Cluster");
    const bLand = lands(game, "Forest", 1, B);
    void bLand;
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    const cluster = named(game, "Saproling Cluster", A)[0];
    const before = hand(game, B).length;
    activate(game, cluster, 0, { player: B });
    expect(hand(game, B).length).toBe(before - 1);
    expect(tokensNamed(game, "Saproling Token", B)).toBe(1);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
  });
});

describe("Volrath's Dungeon", () => {
  it("makes the target player put a card from hand on top; any player may destroy it on their turn", () => {
    const { game, a, b } = table();
    const dungeon = spawn(game, "Volrath's Dungeon");
    const bolt = toHand(game, "Lightning Bolt", B);
    pickTargets(a, B);
    pickFromZone(b, bolt);
    const before = hand(game, B).length;
    activate(game, dungeon, 1, { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
    const lib = game.state.zones.perPlayer[B].library;
    expect(lib[0]).toBe(bolt); // the top
    expect(zone(game, bolt)).toBe("library");

    const destroyByB = { type: "activate-ability", player: B, source: dungeon, abilityIndex: 0, targets: [] } as Action;
    game.advanceUntil((s) => s.priority.holder === B && s.turn.number === 1);
    expect(game.canDispatch(destroyByB)).not.toBeNull();
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    activate(game, dungeon, 0, { player: B });
    expect(zone(game, dungeon)).toBe("graveyard");
    expect(life(game, B)).toBe(15);
  });
});

describe("Alisaie Leveilleur", () => {
  it("makes the second spell each turn cost {2} less", () => {
    const { game } = table();
    spawn(game, "Alisaie Leveilleur");
    lands(game, "Island", 1);
    const divination = toHand(game, "Divination");
    const action = { type: "cast-spell", player: A, card: divination, targets: [] } as Action;
    expect(game.canDispatch(action)).not.toBeNull();
    cast(game, toHand(game, "Ornithopter"));
    cast(game, divination);
    expect(zone(game, divination)).toBe("graveyard");
  });
});

describe("Hostage Taker", () => {
  it("exiles another creature until it leaves, castable with mana of any type", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Hostage Taker");
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Swamp", 2);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("returns the card when it leaves first", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const taker = enter(game, "Hostage Taker");
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(taker)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
  });
});

describe("Coral Atoll", () => {
  it("returns an untapped Island or is sacrificed", () => {
    const { game, a } = table();
    const island = spawn(game, "Island");
    pickPermanents(a, island);
    const atoll = enter(game, "Coral Atoll");
    expect(zone(game, island)).toBe("hand");
    expect(zone(game, atoll)).toBe("battlefield");
    expect(game.state.objects[atoll].tapped).toBe(true);
    pickPermanents(a);
    const second = enter(game, "Coral Atoll");
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Nightshade Assassin", () => {
  it("gives -X/-X for the black cards revealed, and nothing for none", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const m1 = toHand(game, "Murder");
    const m2 = toHand(game, "Murder");
    pickTargets(a, giant);
    const seen = pickFromZone(a, m1, m2);
    enter(game, "Nightshade Assassin");
    expect(seen.offered).toEqual(expect.arrayContaining([m1, m2]));
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, m1)).toBe("hand");

    const other = spawn(game, "Hill Giant", B);
    pickTargets(a, other);
    pickFromZone(a);
    enter(game, "Nightshade Assassin");
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
    settle(game);
    void graveyard;
  });
});
