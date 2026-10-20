/**
 * Strixhaven: School of Mages, batch 1, group b. No engine change: each test
 * pins the clause of a card most likely to be wired wrong — Ardent
 * Dustspeaker's "if you do", Closing Statement's end-step discount,
 * Mercurial Transformation's resolution-time choice over a noncreature,
 * Lorehold Excavation's "otherwise", and the rest.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  named,
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
  toLibrary,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

const library = (game: ReturnType<typeof table>["game"]) => game.state.zones.perPlayer[A].library;
const exiled = (game: ReturnType<typeof table>["game"]) => game.state.zones.shared.exile;

describe("STX group b — Accomplished Alchemist", () => {
  it("taps for X of one colour, X the life gained this turn, net of nothing lost", () => {
    const { game } = table();
    const alchemist = spawn(game, "Accomplished Alchemist");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3 }, []);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    game.dispatch({ type: "activate-ability", player: A, source: alchemist, abilityIndex: 1, manaColors: ["G"] });
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["G", "G", "G"]);
  });
});

describe("STX group b — Quandrix Apprentice", () => {
  it("magecraft: a land from the top three goes to hand, the rest to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Quandrix Apprentice");
    lands(game, "Mountain", 1);
    toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");
    expect(game.state.objects[library(game)[0]].cardName).toBe("Wastes");
  });
});

describe("STX group b — Body of Research", () => {
  it("the Fractal gets a +1/+1 counter for each card in your library", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Body of Research"));
    const [fractal] = named(game, "Fractal Token");
    expect(counters(game, fractal)).toBe(library(game).length);
    expect(library(game).length).toBeGreaterThan(0);
  });
});

describe("STX group b — Mascot Exhibition", () => {
  it("creates an Inkling, a Spirit and an Elemental", () => {
    const { game } = table();
    lands(game, "Wastes", 7);
    cast(game, toHand(game, "Mascot Exhibition"));
    expect(tokensNamed(game, "Inkling Token", A)).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Red-White)", A)).toBe(1);
    const [elemental] = named(game, "4/4 Blue Red Elemental Token");
    expect(pt(game, elemental)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("STX group b — Dramatic Finale", () => {
  it("one Inkling a turn however many nontoken creatures die, and tokens get +1/+1", () => {
    const { game } = table();
    spawn(game, "Dramatic Finale");
    const first = spawn(game, "Grizzly Bears");
    const second = spawn(game, "Grizzly Bears");
    destroy(game, first);
    destroy(game, second);
    expect(tokensNamed(game, "Inkling Token", A)).toBe(1);
    const [inkling] = named(game, "Inkling Token");
    expect(pt(game, inkling)).toEqual({ power: 3, toughness: 2 });
    // A token dying doesn't trigger it, on a later turn either.
    toStep(game, "precombat-main");
    destroy(game, inkling);
    expect(tokensNamed(game, "Inkling Token", A)).toBe(0);
  });
});

describe("STX group b — Silverquill Command", () => {
  it("returns a 2-drop and makes a player draw and lose 1", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const bobHand = hand(game, B).length;
    cast(game, toHand(game, "Silverquill Command"), { modes: [1, 2], targets: [ref(bears), ref(B)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(hand(game, B).length).toBe(bobHand + 1);
    expect(life(game, B)).toBe(19);
  });
});

describe("STX group b — Mercurial Transformation", () => {
  it("an artifact becomes only a 4/4 blue Octopus creature, chosen on resolution", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 1);
    cast(game, toHand(game, "Mercurial Transformation"), { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(["creature"]);
    expect(subtypes(game, ring)).toEqual(["Octopus"]);
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "precombat-main", B);
    expect(types(game, ring)).toEqual(["artifact"]);
  });
});

describe("STX group b — Lorehold Excavation", () => {
  it("a land milled gains 1 life", () => {
    const { game } = table();
    spawn(game, "Lorehold Excavation");
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(20);
  });

  it("otherwise it deals 1 damage to each opponent", () => {
    const { game } = table();
    spawn(game, "Lorehold Excavation");
    const bears = toLibrary(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
  });

  it("{5}, exile a creature card from your graveyard: a tapped Spirit", () => {
    const { game } = table();
    const excavation = spawn(game, "Lorehold Excavation");
    lands(game, "Wastes", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, excavation, 0);
    expect(zone(game, bears)).toBe("exile");
    const [spirit] = named(game, "Spirit Token (Red-White)");
    expect(game.state.objects[spirit].tapped).toBe(true);
  });
});

describe("STX group b — Closing Statement", () => {
  it("costs {2} less during your end step only", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    const statement = toHand(game, "Closing Statement");
    expect(() => cast(game, statement, { targets: [ref(theirs), ref(mine)] })).toThrow();
    toStep(game, "end");
    cast(game, statement, { targets: [ref(theirs), ref(mine)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(counters(game, mine)).toBe(1);
  });
});

describe("STX group b — Ardent Dustspeaker", () => {
  it("putting an instant on the bottom exiles the top two, playable this turn", () => {
    const { game, a } = table();
    const dustspeaker = spawn(game, "Ardent Dustspeaker");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const [top, second] = library(game);
    pickModes(a, 0);
    pickFromZone(a, bolt);
    attack(game, a, [dustspeaker]);
    expect(library(game).at(-1)).toBe(bolt);
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    expect(game.state.objects[top].impulse).toBeDefined();
  });

  it("with no instant or sorcery in the graveyard, nothing is exiled", () => {
    const { game, a } = table();
    const dustspeaker = spawn(game, "Ardent Dustspeaker");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    const before = exiled(game).length;
    attack(game, a, [dustspeaker]);
    expect(exiled(game).length).toBe(before);
    expect(graveyard(game, A).length).toBe(1);
  });
});

describe("STX group b — Promising Duskmage", () => {
  it("draws only if it died with a +1/+1 counter", () => {
    const { game } = table();
    const plain = spawn(game, "Promising Duskmage");
    const grown = spawn(game, "Promising Duskmage");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(grown)]);
    const before = hand(game, A).length;
    destroy(game, plain);
    expect(hand(game, A).length).toBe(before);
    destroy(game, grown);
    expect(hand(game, A).length).toBe(before + 1);
  });
});
