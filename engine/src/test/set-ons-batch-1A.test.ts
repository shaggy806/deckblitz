/**
 * Onslaught (ONS) — group A: cycling triggers, tribal counts, morph cards,
 * Chain of Plasma's chain and Entrails Feaster's graveyard choice.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Krosan Tusker", () => {
  it("cycling it may fetch a basic land before the cycling draw", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toLibrary(game, "Forest");
    const tusker = toHand(game, "Krosan Tusker");
    const before = hand(game).length;
    pickModes(a, 0);
    pickFromZone(a, forest);
    game.dispatch({ type: "cycle", player: A, card: tusker });
    game.advanceUntil(quiet);
    expect(zone(game, tusker)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
    // Tusker out, the Forest and the cycling draw in.
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Dirge of Dread", () => {
  it("cycling it may give target creature fear", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Dirge of Dread") });
    game.advanceUntil(quiet);
    expect(keywords(game, bears).has("fear")).toBe(true);
  });
});

describe("Dream Chisel", () => {
  it("a face-down creature spell costs {2}", () => {
    const { game } = table();
    spawn(game, "Dream Chisel");
    lands(game, "Swamp", 2);
    const knitter = toHand(game, "Boneknitter");
    cast(game, knitter, { via: "face-down" });
    expect(zone(game, knitter)).toBe("battlefield");
    expect(game.state.objects[knitter].faceDown?.kind).toBe("morph");
  });
});

describe("Chain of Plasma", () => {
  it("the damaged player may discard a card to copy it back at the caster", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const bobHand = hand(game, B).length;
    pickModes(b, 0);
    pickTargets(b, A);
    a.chooseModesFn = () => [];
    cast(game, toHand(game, "Chain of Plasma"), { targets: [ref(B)] });
    game.advanceUntil(quiet);
    expect(life(game, B)).toBe(17);
    expect(hand(game, B).length).toBe(bobHand - 1);
    expect(life(game, A)).toBe(17);
  });
});

describe("Entrails Feaster", () => {
  it("exiles a creature card from an opponent's graveyard for a counter", () => {
    const { game, a } = table();
    const feaster = spawn(game, "Entrails Feaster");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, feaster)).toBe(1);
    expect(game.state.objects[feaster].tapped).toBe(false);
  });

  it("is tapped when nothing is exiled", () => {
    const { game, a } = table();
    const feaster = spawn(game, "Entrails Feaster");
    toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(a);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, feaster)).toBe(0);
    expect(game.state.objects[feaster].tapped).toBe(true);
  });
});

describe("Aven Brigadier", () => {
  it("gives +2/+2 to another Bird Soldier and +1/+1 to an opponent's Soldier, not itself", () => {
    const { game } = table();
    const first = spawn(game, "Aven Brigadier");
    spawn(game, "Aven Brigadier");
    const vanguard = spawn(game, "Elite Vanguard", B);
    expect(pt(game, first)).toEqual({ power: 5, toughness: 7 });
    expect(pt(game, vanguard)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Shared Triumph", () => {
  it("pumps every creature of the chosen type, an opponent's too", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Shared Triumph"));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Riptide Entrancer", () => {
  it("sacrificed after combat damage, steals a creature of that player's", () => {
    const { game, a } = table();
    const entrancer = spawn(game, "Riptide Entrancer");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [entrancer]);
    settle(game);
    expect(zone(game, entrancer)).toBe("graveyard");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Voice of the Woods", () => {
  it("taps five Elves, itself included, for a 7/7 trampler", () => {
    const { game } = table();
    const voice = spawn(game, "Voice of the Woods");
    const elves = [1, 2, 3, 4].map(() => spawn(game, "Llanowar Elves"));
    activate(game, voice);
    expect(tokensNamed(game, "7/7 Green Elemental Token with Trample", A)).toBe(1);
    expect([voice, ...elves].every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});

describe("Profane Prayers", () => {
  it("counts every Cleric on the battlefield for the damage and the life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Boneknitter");
    spawn(game, "Blind Zealot", B);
    cast(game, toHand(game, "Profane Prayers"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Feeding Frenzy", () => {
  it("gives -X/-X for every Zombie on the battlefield", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Walking Corpse");
    spawn(game, "Gravedigger", B);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Feeding Frenzy"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Boneknitter", () => {
  it("regenerates only a Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const knitter = spawn(game, "Boneknitter");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, knitter, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, knitter, 0, { targets: [ref(knitter)] });
    expect(graveyard(game).includes(knitter)).toBe(false);
  });
});
