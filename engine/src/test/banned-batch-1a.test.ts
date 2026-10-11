/**
 * Cards banned in Commander for power, added for casual play (2026-10-11), part a.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const canActivate = (game: Game, source: ObjectId, index: number): boolean =>
  game.legalActions(A).some((x) => x.kind === "activate-ability" && x.source === source && x.abilityIndex === index);
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);
const pool = (game: Game): string[] => game.state.players[A].manaPool.map((unit) => unit.type).sort();

describe("Black Lotus", () => {
  it("is sacrificed for three mana of one colour", () => {
    const { game } = table();
    const lotus = spawn(game, "Black Lotus");
    game.dispatch({ type: "activate-ability", player: A, source: lotus, abilityIndex: 0, manaColors: ["R"] });
    expect(pool(game)).toEqual(["R", "R", "R"]);
    expect(zone(game, lotus)).toBe("graveyard");
  });
});

describe("Jeweled Lotus", () => {
  it("makes mana that casts your commander and nothing else", () => {
    const { game } = table();
    const lotus = spawn(game, "Jeweled Lotus");
    const commander = game.debugSpawn("Ezuri, Renegade Leader", A, "command");
    game.state.objects[commander].isCommander = true;
    const bears = toHand(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: lotus, abilityIndex: 0, manaColors: ["G"] });
    expect(pool(game)).toEqual(["G", "G", "G"]);
    expect(zone(game, lotus)).toBe("graveyard");
    expect(canCast(game, bears)).toBe(false);
    expect(canCast(game, commander)).toBe(true);
  });

  it("doesn't pay for an opponent's commander", () => {
    const { game } = table();
    const lotus = spawn(game, "Jeweled Lotus");
    // Bob's commander, in alice's hand as if she'd taken it: a commander, but not hers.
    const theirs = game.debugSpawn("Ezuri, Renegade Leader", B, "hand");
    game.state.zones.perPlayer[B].hand.splice(game.state.zones.perPlayer[B].hand.indexOf(theirs), 1);
    game.state.zones.perPlayer[A].hand.push(theirs);
    game.state.objects[theirs].isCommander = true;
    game.state.objects[theirs].controller = A;
    game.dispatch({ type: "activate-ability", player: A, source: lotus, abilityIndex: 0, manaColors: ["G"] });
    expect(canCast(game, theirs)).toBe(false);
  });
});

describe("Dockside Extortionist", () => {
  it("makes a Treasure per artifact and enchantment opponents control, an artifact enchantment once", () => {
    const { game } = table();
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Hammer of Purphoros", B); // legendary enchantment artifact: counted once
    spawn(game, "Exploration", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Sol Ring"); // alice's own: not counted
    const dockside = toHand(game, "Dockside Extortionist");
    lands(game, "Mountain", 2);
    game.dispatch({ type: "cast-spell", player: A, card: dockside, targets: [] });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
  });
});

describe("Golos, Tireless Pilgrim", () => {
  it("may fetch any land card tapped as it enters", () => {
    const { game, a } = table();
    const tower = toLibrary(game, "Command Tower");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    pickFromZone(a, tower);
    const golos = toHand(game, "Golos, Tireless Pilgrim");
    lands(game, "Wastes", 5);
    game.dispatch({ type: "cast-spell", player: A, card: golos, targets: [] });
    settle(game);
    expect(zone(game, tower)).toBe("battlefield");
    expect(game.state.objects[tower].tapped).toBe(true);
  });

  it("exiles the top three, playable this turn only without paying, a land as a land play", () => {
    const { game } = table();
    const golos = spawn(game, "Golos, Tireless Pilgrim");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes", "Wastes"]) spawn(game, land);
    const giant = toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    activate(game, golos, 0);
    expect([giant, forest, bears].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    // Every land is tapped for the ability: the Bears are cast for free.
    expect(canCast(game, bears)).toBe(true);
    game.dispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse", free: true });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === forest)).toBe(true);
    toStep(game, "precombat-main");
    // Next turn: the permission is gone, and the cards stay exiled.
    expect(zone(game, giant)).toBe("exile");
    expect(canCast(game, giant)).toBe(false);
  });
});

describe("Griselbrand", () => {
  it("pays 7 life to draw seven, and can't with 6 life", () => {
    const { game } = table();
    const demon = spawn(game, "Griselbrand");
    game.state.players[A].life = 6;
    expect(canActivate(game, demon, 0)).toBe(false);
    game.state.players[A].life = 8;
    const before = hand(game).length;
    activate(game, demon, 0);
    expect(life(game)).toBe(1);
    expect(hand(game).length).toBe(before + 7);
  });
});

describe("Karakas", () => {
  it("returns a legendary creature, and only a legendary one", () => {
    const { game } = table();
    const karakas = spawn(game, "Karakas");
    const legend = spawn(game, "Ezuri, Renegade Leader", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === karakas && x.abilityIndex === 1);
    const options = offer?.kind === "activate-ability" ? offer.targetOptions[0] : [];
    expect(options).toContainEqual(ref(legend));
    expect(options).not.toContainEqual(ref(bears));
    activate(game, karakas, 1, { targets: [ref(legend)] });
    expect(zone(game, legend)).toBe("hand");
    expect(game.state.zones.perPlayer[B].hand).toContain(legend);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Library of Alexandria", () => {
  it("draws only with exactly seven cards in hand", () => {
    const { game } = table();
    const library = spawn(game, "Library of Alexandria");
    // Down to six (the table deals an opening hand and a first draw).
    const mine = game.state.zones.perPlayer[A];
    while (mine.hand.length > 6) {
      const card = mine.hand.pop()!;
      mine.library.push(card);
      game.state.objects[card].zone = "library";
    }
    while (hand(game).length < 6) toHand(game, "Wastes");
    expect(canActivate(game, library, 1)).toBe(false);
    toHand(game, "Wastes");
    expect(hand(game).length).toBe(7);
    expect(canActivate(game, library, 1)).toBe(true);
    // Checked as it's activated, not as it resolves (the ruling): drawn to
    // eight, it still draws.
    activate(game, library, 1, { settle: false });
    toHand(game, "Wastes");
    settle(game);
    expect(hand(game).length).toBe(9);
    const other = spawn(game, "Library of Alexandria");
    expect(canActivate(game, other, 1)).toBe(false);
  });
});

describe("Mana Crypt", () => {
  it("flips at your upkeep and deals you 3 only on a lost flip", () => {
    const outcomes = new Set<number>();
    for (let seed = 1; seed <= 12; seed += 1) {
      const { game } = table({ seed });
      spawn(game, "Mana Crypt");
      toStep(game, "upkeep");
      settle(game);
      outcomes.add(life(game));
      // Not on bob's upkeep.
      expect(life(game, B)).toBe(20);
    }
    expect([...outcomes].sort()).toEqual([17, 20]);
  });
});
