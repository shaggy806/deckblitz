/**
 * The set walk, Fate Reforged batch 1, group E: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
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
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Winds of Qal Sisma", () => {
  it("prevents all combat damage without ferocious", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Winds of Qal Sisma"));
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
  });

  it("with ferocious, prevents only combat damage by opponents' creatures", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Winds of Qal Sisma"));
    attack(game, a, [wurm]);
    expect(life(game, B)).toBe(14);
  });

  it("with ferocious, a blocking opponent's creature deals no combat damage", () => {
    const { game, a, b } = table();
    spawn(game, "Craw Wurm");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Winds of Qal Sisma"));
    b.declareBlockersFn = () => [{ blocker: theirs, attacker: mine }];
    attack(game, a, [mine]);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Flamewake Phoenix", () => {
  it("returns from the graveyard at the beginning of combat if you pay {R} and have ferocious", () => {
    const { game, a } = table();
    const phoenix = toGraveyard(game, "Flamewake Phoenix");
    spawn(game, "Craw Wurm");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, phoenix)).toBe("battlefield");
  });

  it("doesn't trigger without a creature with power 4 or greater", () => {
    const { game, a } = table();
    const phoenix = toGraveyard(game, "Flamewake Phoenix");
    spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, phoenix)).toBe("graveyard");
  });
});

describe("Supplant Form", () => {
  it("bounces the creature and gives the caster a token copy of it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Supplant Form"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    const copies = named(game, "Grizzly Bears", A);
    expect(copies.length).toBe(1);
    expect(game.state.objects[copies[0]].isToken).toBe(true);
  });

  it("a copy of a face-down creature is a face-up 2/2 with no name or abilities", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const top = toLibrary(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "manifest", who: "you" }, []);
    settle(game);
    expect(game.state.objects[top].faceDown).toBeDefined();
    const before = new Set(game.battlefield);
    cast(game, toHand(game, "Supplant Form"), { targets: [ref(top)] });
    expect(zone(game, top)).toBe("hand");
    const made = game.battlefield.filter((id) => !before.has(id));
    expect(made.length).toBe(1);
    expect(named(game, "Craw Wurm", A).length).toBe(0);
    expect(pt(game, made[0])).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Shu Yun, the Silent Tempest", () => {
  it("prowess, and paying {R/W}{R/W} gives the target creature double strike", () => {
    const { game, a } = table();
    const shu = spawn(game, "Shu Yun, the Silent Tempest");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(pt(game, shu)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Mastery of the Unseen", () => {
  it("manifests, and gains 1 life per creature when a permanent is turned face up", () => {
    const { game } = table();
    const mastery = spawn(game, "Mastery of the Unseen");
    spawn(game, "Memnite");
    lands(game, "Plains", 4);
    lands(game, "Forest", 2);
    const top = toLibrary(game, "Grizzly Bears");
    activate(game, mastery);
    expect(zone(game, top)).toBe("battlefield");
    expect(game.state.objects[top].faceDown).toBeDefined();
    const before = life(game);
    game.dispatch({ type: "turn-face-up", player: A, permanent: top });
    settle(game);
    expect(life(game)).toBe(before + 2);
  });
});

describe("Abzan Runemark", () => {
  it("+2/+2, and vigilance only while you control a black or green permanent", () => {
    const { game } = table();
    const memnite = spawn(game, "Memnite");
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Abzan Runemark"), { targets: [ref(memnite)] });
    expect(pt(game, memnite)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, memnite).has("vigilance")).toBe(false);
    spawn(game, "Llanowar Elves");
    expect(keywords(game, memnite).has("vigilance")).toBe(true);
  });
});

describe("Aven Surveyor", () => {
  it("the bounce mode returns the target creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    pickTargets(a, bears);
    const surveyor = enter(game, "Aven Surveyor");
    expect(zone(game, bears)).toBe("hand");
    expect(pt(game, surveyor)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Rite of Undoing", () => {
  it("returns a nonland permanent you control and one you don't", () => {
    const { game } = table();
    const memnite = spawn(game, "Memnite");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Rite of Undoing"), { targets: [ref(memnite), ref(bears)] });
    expect(hand(game, A)).toContain(memnite);
    expect(hand(game, B)).toContain(bears);
  });
});

describe("Reach of Shadows", () => {
  it("can't target a colorless creature", () => {
    const { game } = table();
    const memnite = spawn(game, "Memnite", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    const reach = toHand(game, "Reach of Shadows");
    expect(() => cast(game, reach, { targets: [ref(memnite)] })).toThrow();
    cast(game, reach, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Goblin Boom Keg", () => {
  it("is sacrificed at your upkeep and deals 3 damage as it goes to the graveyard", () => {
    const { game, a } = table();
    const keg = spawn(game, "Goblin Boom Keg");
    pickTargets(a, B);
    nextTurn(game);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, keg)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });
});
