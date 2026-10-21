/**
 * Modern Horizons, group B. One test per card whose behaviour is more than a
 * stat line or an already-tested pattern.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
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
  tokensNamed,
  zone,
  controller,
} from "./harness.js";

describe("Lesser Masticore", () => {
  it("can't be cast without a card to discard, and discards one as it's cast", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    lands(game, "Wastes", 2);
    const card = toHand(game, "Lesser Masticore");
    expect(() => cast(game, card)).toThrow();
    const fodder = toHand(game, "Hill Giant");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(zone(game, fodder)).toBe("graveyard");
  });
});

describe("Winding Way", () => {
  it("puts every revealed card of the chosen type into hand and the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const island = toLibrary(game, "Island");
    const giant = toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0); // creature
    cast(game, toHand(game, "Winding Way"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Astral Drift", () => {
  it("cycling it exiles a creature until the next end step", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    const drift = toHand(game, "Astral Drift");
    game.dispatch({ type: "cycle", player: A, card: drift });
    settle(game);
    expect(zone(game, giant)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
  });

  it("cycling another card while it's on the battlefield triggers it", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    spawn(game, "Astral Drift");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Boon of the Wish-Giver") });
    settle(game);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Dead of Winter", () => {
  it("gives nonsnow creatures -X/-X for the snow permanents you control, sparing snow creatures", () => {
    const { game } = table();
    lands(game, "Snow-Covered Swamp", 3);
    const rimestag = spawn(game, "Saddled Rimestag", B);
    const giant = spawn(game, "Hill Giant", B);
    const elves = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Dead of Winter"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, rimestag)).toBe("battlefield");
  });
});

describe("Conifer Wurm", () => {
  it("gets +X/+X for each snow permanent you control, itself included", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Snow-Covered Forest", 1);
    const wurm = spawn(game, "Conifer Wurm");
    activate(game, wurm, 0);
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Goatnap", () => {
  it("steals, untaps and hastes the creature, and pumps it only if it's a Goat (changeling counts)", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const outcast = spawn(game, "Changeling Outcast", B, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Goatnap"), { targets: [ref(outcast)] });
    expect(controller(game, outcast)).toBe(A);
    expect(game.state.objects[outcast].tapped).toBe(false);
    expect(keywords(game, outcast).has("haste")).toBe(true);
    expect(pt(game, outcast).power).toBe(4);
    cast(game, toHand(game, "Goatnap"), { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(pt(game, bears).power).toBe(2);
  });
});

describe("Plague Engineer", () => {
  it("shrinks only opponents' creatures of the chosen type", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const theirs = spawn(game, "Grizzly Bears", B);
    const theirGiant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Plague Engineer"));
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirGiant)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Vesperlark", () => {
  it("evoked, it's sacrificed and returns a creature card with power 1 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const memnite = toGraveyard(game, "Memnite");
    toGraveyard(game, "Grizzly Bears");
    pickTargets(a, memnite);
    const lark = toHand(game, "Vesperlark");
    cast(game, lark, { evoke: true });
    expect(zone(game, lark)).toBe("graveyard");
    expect(named(game, "Memnite", A)).toHaveLength(1);
  });
});

describe("First Sliver's Chosen", () => {
  it("gives each Sliver, itself included, an exalted instance", () => {
    const { game, a } = table();
    spawn(game, "First Sliver's Chosen");
    const sliver = spawn(game, "Metallic Sliver");
    spawn(game, "Grizzly Bears");
    attack(game, a, [sliver]);
    expect(pt(game, sliver)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Alpine Guide", () => {
  it("fetches a Mountain tapped as it enters, and sacrifices a Mountain as it leaves", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const fetched = toLibrary(game, "Mountain");
    pickModes(a, 0);
    pickFromZone(a, fetched);
    cast(game, toHand(game, "Alpine Guide"));
    expect(zone(game, fetched)).toBe("battlefield");
    expect(game.state.objects[fetched].tapped).toBe(true);
    expect(named(game, "Mountain", A)).toHaveLength(4);
    destroy(game, named(game, "Alpine Guide")[0]);
    expect(named(game, "Mountain", A)).toHaveLength(3);
  });
});

describe("String of Disappearances", () => {
  it("bounces the creature; its controller may pay {U}{U} to copy it at a new target", () => {
    const { game, b } = table();
    lands(game, "Island", 1);
    lands(game, "Island", 2, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    b.chooseModesFn = () => [0];
    pickTargets(b, giant);
    cast(game, toHand(game, "String of Disappearances"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Excavating Anurid", () => {
  it("may sacrifice a land as it enters to draw a card", () => {
    const { game, a } = table();
    const land = spawn(game, "Forest");
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Excavating Anurid");
    expect(zone(game, land)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Saddled Rimestag", () => {
  it("gets +2/+2 only on a turn another creature entered under your control", () => {
    const { game } = table();
    const rimestag = spawn(game, "Saddled Rimestag");
    expect(pt(game, rimestag)).toEqual({ power: 2, toughness: 2 });
    enter(game, "Grizzly Bears");
    expect(pt(game, rimestag)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(pt(game, rimestag)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Rank Officer", () => {
  it("discards for a Zombie as it enters, and drains each opponent by exiling a creature card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    pickModes(a, 0);
    const card = toHand(game, "Rank Officer");
    const before = hand(game).length;
    cast(game, card);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(hand(game)).toHaveLength(before - 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const officer = spawn(game, "Rank Officer");
    activate(game, officer, 0);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(18);
  });
});

describe("Ore-Scale Guardian", () => {
  it("costs {1} less for each land card in your graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    for (let i = 0; i < 5; i++) toGraveyard(game, "Forest");
    cast(game, toHand(game, "Ore-Scale Guardian"));
    expect(named(game, "Ore-Scale Guardian", A)).toHaveLength(1);
  });
});

describe("Headless Specter", () => {
  it("makes the player discard at random only while you have no cards in hand", () => {
    const withHand = table();
    const s1 = spawn(withHand.game, "Headless Specter");
    const bBefore = hand(withHand.game, B).length;
    attack(withHand.game, withHand.a, [s1]);
    expect(hand(withHand.game, B)).toHaveLength(bBefore);

    const hellbent = table();
    hellbent.game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    const s2 = spawn(hellbent.game, "Headless Specter");
    const before = hand(hellbent.game, B).length;
    const gyBefore = graveyard(hellbent.game, B).length;
    attack(hellbent.game, hellbent.a, [s2]);
    expect(hand(hellbent.game, B)).toHaveLength(before - 1);
    expect(graveyard(hellbent.game, B)).toHaveLength(gyBefore + 1);
  });
});

describe("Zhalfirin Decoy", () => {
  it("taps a creature only on a turn a creature entered under your control", () => {
    const { game } = table();
    const decoy = spawn(game, "Zhalfirin Decoy");
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, decoy, 0, { targets: [ref(giant)] })).toThrow();
    enter(game, "Grizzly Bears");
    activate(game, decoy, 0, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("Geomancer's Gambit", () => {
  it("destroys the land, lets its controller fetch a basic, and draws a card", () => {
    const { game, b } = table();
    lands(game, "Mountain", 3);
    const target = spawn(game, "Forest", B);
    pickModes(b, 0);
    b.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Geomancer's Gambit"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    expect(named(game, "Wastes", B)).toHaveLength(1);
    expect(hand(game)).toHaveLength(before + 1);
  });
});
