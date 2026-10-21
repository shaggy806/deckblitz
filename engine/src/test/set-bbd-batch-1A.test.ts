/**
 * Battlebond, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
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
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const castable = (game: Game, player: PlayerId, name: string): boolean =>
  game.legalActions(player).some((x) => x.kind === "cast-spell" && x.cardName === name);

describe("Archon of Valor's Reach", () => {
  it("no player can cast spells of the chosen type, its controller included", () => {
    const { game } = table();
    const archon = spawn(game, "Archon of Valor's Reach");
    game.state.objects[archon].chosenOnEnter = "instant";
    lands(game, "Mountain", 4);
    lands(game, "Mountain", 2, B);
    toHand(game, "Lightning Strike");
    toHand(game, "Lightning Strike", B);
    toHand(game, "Grizzly Bears");
    spawn(game, "Forest");
    expect(castable(game, A, "Lightning Strike")).toBe(false);
    expect(castable(game, A, "Grizzly Bears")).toBe(true);
    // Bob, with priority over a spell on the stack, can't cast his either.
    cast(game, hand(game).find((id) => game.state.objects[id].cardName === "Grizzly Bears")!, { settle: false });
    game.advanceUntil((s) => s.priority.holder === B);
    expect(castable(game, B, "Lightning Strike")).toBe(false);
  });

  it("with nothing chosen, nothing is prohibited", () => {
    const { game } = table();
    spawn(game, "Archon of Valor's Reach");
    lands(game, "Mountain", 2);
    toHand(game, "Lightning Strike");
    expect(castable(game, A, "Lightning Strike")).toBe(true);
  });
});

describe("Krav, the Unredeemed", () => {
  it("sacrificing X creatures: target player draws X and gains X, and Krav gets X counters", () => {
    const { game } = table();
    const krav = spawn(game, "Krav, the Unredeemed");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    spawn(game, "Swamp");
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: krav, abilityIndex: 0, xValue: 2, targets: [ref(A)] });
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    game.dispatch({ type: "sacrifice", player: A, permanents: bears });
    game.advanceUntil(quiet);
    for (const b of bears) expect(zone(game, b)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 2);
    expect(life(game)).toBe(22);
    expect(counters(game, krav)).toBe(2);
  });

  it("targeting an opponent, the opponent draws and gains", () => {
    const { game } = table();
    const krav = spawn(game, "Krav, the Unredeemed");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Swamp");
    const theirs = hand(game, B).length;
    game.dispatch({ type: "activate-ability", player: A, source: krav, abilityIndex: 0, xValue: 1, targets: [ref(B)] });
    game.dispatch({ type: "sacrifice", player: A, permanents: [bears] });
    game.advanceUntil(quiet);
    expect(hand(game, B)).toHaveLength(theirs + 1);
    expect(life(game, B)).toBe(21);
    expect(life(game)).toBe(20);
  });
});

describe("Arena Rector", () => {
  it("dying, exiles itself to put a planeswalker from the library onto the battlefield", () => {
    const { game, a } = table();
    const rector = spawn(game, "Arena Rector");
    const walker = toLibrary(game, "Chandra, Flame's Fury");
    pickModes(a, 0);
    pickFromZone(a, walker);
    destroy(game, rector);
    expect(zone(game, rector)).toBe("exile");
    expect(zone(game, walker)).toBe("battlefield");
  });

  it("declining leaves it in the graveyard and searches nothing", () => {
    const { game, a } = table();
    const rector = spawn(game, "Arena Rector");
    const walker = toLibrary(game, "Chandra, Flame's Fury");
    pickModes(a);
    destroy(game, rector);
    expect(zone(game, rector)).toBe("graveyard");
    expect(zone(game, walker)).toBe("library");
  });
});

describe("Jubilant Mascot", () => {
  it("at the beginning of combat, paying {3}{W} supports two other creatures", () => {
    const { game, a } = table();
    const mascot = spawn(game, "Jubilant Mascot");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    pickTargets(a, mine, theirs);
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
    expect(counters(game, mascot)).toBe(0);
  });

  it("not paying puts no counters", () => {
    const { game, a } = table();
    spawn(game, "Jubilant Mascot");
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    pickTargets(a, mine, null);
    pickModes(a);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, mine)).toBe(0);
  });
});

describe("Combo Attack", () => {
  it("two creatures you control each deal damage equal to their power to target creature", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Combo Attack"), { targets: [ref(bears[0]), ref(bears[1]), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    for (const b of bears) expect(zone(game, b)).toBe("battlefield");
  });

  it("the last target may be one of the first two (rule 115.3)", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Combo Attack"), { targets: [ref(bears[0]), ref(bears[1]), ref(bears[0])] });
    expect(zone(game, bears[0])).toBe("graveyard");
    expect(zone(game, bears[1])).toBe("battlefield");
  });
});

describe("Aurora Champion", () => {
  it("taps target creature only if you control another Warrior", () => {
    const { game, a } = table();
    const champion = spawn(game, "Aurora Champion");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    attack(game, a, [champion]);
    expect(game.state.objects[theirs].tapped).toBe(false);
  });

  it("with another Warrior, it taps", () => {
    const { game, a } = table();
    const champion = spawn(game, "Aurora Champion");
    spawn(game, "Decorated Champion");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    attack(game, a, [champion]);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Decorated Champion", () => {
  it("grows when another Warrior enters, not for a non-Warrior", () => {
    const { game } = table();
    const champion = spawn(game, "Decorated Champion");
    enter(game, "Grizzly Bears");
    expect(counters(game, champion)).toBe(0);
    enter(game, "Jungle Wayfinder");
    expect(counters(game, champion)).toBe(1);
  });
});

describe("Jungle Wayfinder", () => {
  it("each player may search for a basic land card into their hand", () => {
    const { game, a, b } = table();
    const forest = toLibrary(game, "Forest");
    const plains = toLibrary(game, "Plains", B);
    pickModes(a, 0);
    pickModes(b, 0);
    pickFromZone(a, forest);
    pickFromZone(b, plains);
    enter(game, "Jungle Wayfinder");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, plains)).toBe("hand");
  });
});

describe("Azra Bladeseeker", () => {
  it("you may discard a card to draw one", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [bears];
    const before = hand(game).length;
    enter(game, "Azra Bladeseeker");
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
  });

  it("declining draws nothing", () => {
    const { game, a } = table();
    pickModes(a);
    const before = hand(game).length;
    enter(game, "Azra Bladeseeker");
    expect(hand(game)).toHaveLength(before);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Saltwater Stalwart", () => {
  it("dealing damage to an opponent, target player draws a card", () => {
    const { game, a } = table();
    const stalwart = spawn(game, "Saltwater Stalwart");
    pickTargets(a, A);
    const before = hand(game).length;
    attack(game, a, [stalwart]);
    expect(life(game, B)).toBe(18);
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Blaring Captain", () => {
  it("attacking, attacking Warriors get +1/+1; others don't", () => {
    const { game, a } = table();
    const captain = spawn(game, "Blaring Captain");
    const warrior = spawn(game, "Decorated Champion");
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Jungle Wayfinder");
    attack(game, a, [captain, warrior, bears]);
    expect(pt(game, captain)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, warrior)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, home)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Sylvia Brightspear and Khorvath Brightflame", () => {
  it("Dragons you control have double strike; Knights you control have flying and haste", () => {
    const { game } = table();
    spawn(game, "Sylvia Brightspear");
    const khorvath = spawn(game, "Khorvath Brightflame");
    const sylvia = game.battlefield.find((id) => game.state.objects[id].cardName === "Sylvia Brightspear")!;
    expect(keywords(game, khorvath).has("double-strike")).toBe(true);
    expect(keywords(game, sylvia).has("flying")).toBe(true);
    expect(keywords(game, sylvia).has("haste")).toBe(true);
    const theirDragon = spawn(game, "Khorvath Brightflame", B);
    expect(keywords(game, theirDragon).has("double-strike")).toBe(false);
  });
});

describe("Ley Weaver", () => {
  it("{T}: untaps two target lands", () => {
    const { game } = table();
    const weaver = spawn(game, "Ley Weaver");
    const land = [spawn(game, "Forest", A, { tapped: true }), spawn(game, "Forest", A, { tapped: true })];
    game.dispatch({ type: "activate-ability", player: A, source: weaver, abilityIndex: 0, targets: land.map(ref) });
    settle(game);
    for (const l of land) expect(game.state.objects[l].tapped).toBe(false);
  });
});
