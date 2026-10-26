/**
 * Urza's Saga (USG) — group D.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  enter,
  hand,
  lands,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("Crystal Chimes", () => {
  it("returns every enchantment card from your graveyard to your hand, and nothing else", () => {
    const { game } = table();
    const chimes = spawn(game, "Crystal Chimes");
    lands(game, "Wastes", 3);
    const grace = toGraveyard(game, "Absolute Grace");
    const halo = toGraveyard(game, "Brilliant Halo");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, chimes);
    expect(zone(game, grace)).toBe("hand");
    expect(zone(game, halo)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, chimes)).toBe("graveyard");
  });
});

describe("Reprocess", () => {
  it("draws a card for each permanent sacrificed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const bears = spawn(game, "Grizzly Bears");
    const forest = spawn(game, "Forest");
    const thopter = spawn(game, "Ornithopter");
    const reprocess = toHand(game, "Reprocess");
    const before = hand(game).length;
    pickPermanents(a, bears, forest);
    cast(game, reprocess);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Karn, Silver Golem", () => {
  it("makes a noncreature artifact a creature with P/T equal to its mana value", () => {
    const { game } = table();
    const karn = spawn(game, "Karn, Silver Golem");
    lands(game, "Wastes", 1);
    const chimes = spawn(game, "Crystal Chimes");
    activate(game, karn, 0, { targets: [ref(chimes)] });
    expect(types(game, chimes)).toContain("creature");
    expect(pt(game, chimes)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Tainted Aether", () => {
  it("the entering creature's controller chooses a creature or land to sacrifice", () => {
    const { game, b } = table();
    spawn(game, "Tainted Aether");
    const forest = spawn(game, "Forest", B);
    let offered: readonly string[] = [];
    b.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [forest];
    };
    const bears = enter(game, "Grizzly Bears", B);
    expect(offered).toContain(bears);
    expect(offered).toContain(forest);
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Bravado", () => {
  it("counts the other creatures its controller controls — not the enchanted one", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Ornithopter");
    cast(game, toHand(game, "Bravado"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });

  it("on an opponent's creature, counts every creature you control", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Ornithopter");
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Bravado"), { targets: [ref(theirs)] });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Noetic Scales", () => {
  it("returns the active player's creatures with power greater than their hand size", () => {
    const { game } = table();
    spawn(game, "Noetic Scales");
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    game.debugApplyEffect(B, { kind: "discard-hand", who: "you" }, []);
    toHand(game, "Wastes", B);
    expect(hand(game, B).length).toBe(1);
    nextTurn(game, "draw");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Argothian Wurm", () => {
  it("goes on top of its owner's library when another player sacrifices a land", () => {
    const { game, a, b } = table();
    const forest = spawn(game, "Forest", B);
    pickModes(a);
    pickModes(b, 0);
    b.chooseSacrificesFn = () => [forest];
    const wurm = enter(game, "Argothian Wurm");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1] === wurm || library[0] === wurm).toBe(true);
  });

  it("stays when every player declines", () => {
    const { game, a, b } = table();
    const forest = spawn(game, "Forest", B);
    pickModes(a);
    pickModes(b);
    const wurm = enter(game, "Argothian Wurm");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Lilting Refrain", () => {
  it("counters unless its controller pays X, the verse counters it had as it was sacrificed", () => {
    const { game } = table();
    const refrain = spawn(game, "Lilting Refrain");
    game.state.objects[refrain].counters.verse = 2;
    lands(game, "Forest", 3);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    // One Forest left: {1} could be paid, {2} can't.
    activate(game, refrain, 0, { targets: [ref(bears)] });
    expect(zone(game, refrain)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("adds a verse counter in your upkeep if you choose", () => {
    const { game, a } = table();
    const refrain = spawn(game, "Lilting Refrain");
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game, "draw");
    expect(game.state.objects[refrain].counters.verse ?? 0).toBe(1);
  });
});
