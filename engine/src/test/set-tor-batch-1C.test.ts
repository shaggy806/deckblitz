/**
 * Torment (TOR; B220) — group C: threshold, the Nightmares' two-trigger
 * exile, punishers and "any player may".
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
  lands,
  life,
  pickModes,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const fillGraveyard = (game: Game, n: number): void => {
  for (let i = 0; i < n; i++) toGraveyard(game, "Wastes");
};

describe("Carrion Rats", () => {
  it("assigns no combat damage once a player exiles a card from their graveyard", () => {
    const { game, a, b } = table();
    const rats = spawn(game, "Carrion Rats");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickModes(b, 0);
    attack(game, a, [rats]);
    expect(zone(game, card)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });

  it("deals its damage when nobody exiles", () => {
    const { game, a, b } = table();
    const rats = spawn(game, "Carrion Rats");
    toGraveyard(game, "Grizzly Bears", B);
    pickModes(b);
    attack(game, a, [rats]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Skullscorch", () => {
  it("the target takes 4 damage instead of discarding", () => {
    const { game, b } = table();
    lands(game, "Mountain", 2);
    const before = hand(game, B).length;
    pickModes(b, 1);
    cast(game, toHand(game, "Skullscorch"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(hand(game, B).length).toBe(before);
  });

  it("or discards two cards at random", () => {
    const { game, b } = table();
    lands(game, "Mountain", 2);
    const before = hand(game, B).length;
    pickModes(b, 0);
    cast(game, toHand(game, "Skullscorch"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Rancid Earth", () => {
  it("without threshold only destroys the land", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const forest = spawn(game, "Forest", B);
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Rancid Earth"), { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("with threshold also deals 1 damage to each creature and each player", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    fillGraveyard(game, 7);
    const forest = spawn(game, "Forest", B);
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Rancid Earth"), { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
  });
});

describe("Kamahl's Sledge", () => {
  it("with threshold also deals 4 damage to the creature's controller", () => {
    const { game } = table();
    lands(game, "Mountain", 7);
    fillGraveyard(game, 7);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Kamahl's Sledge"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });
});

describe("Pitchstone Wall", () => {
  it("may be sacrificed to return the discarded card", () => {
    const { game, a } = table();
    const wall = spawn(game, "Pitchstone Wall");
    const compulsion = spawn(game, "Compulsion");
    lands(game, "Island", 2);
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    pickModes(a, 0);
    activate(game, compulsion, 0);
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Faceless Butcher", () => {
  it("exiles another creature until it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const butcher = enter(game, "Faceless Butcher");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, butcher);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
  });
});

describe("Coral Net", () => {
  it("the enchanted creature is sacrificed at its upkeep unless a card is discarded", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const elves = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Coral Net"), { targets: [ref(elves)] });
    expect(game.state.objects[elves].zone).toBe("battlefield");
    pickModes(a);
    toStep(game, "precombat-main");
    expect(zone(game, elves)).toBe("graveyard");
  });
});

describe("Cabal Torturer", () => {
  it("activates the -2/-2 only with threshold", () => {
    const { game } = table();
    const torturer = spawn(game, "Cabal Torturer");
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, torturer, 1, { targets: [ref(bears)] })).toThrow();
    fillGraveyard(game, 7);
    activate(game, torturer, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Organ Grinder", () => {
  it("exiles three cards from your graveyard to make a player lose 3 life", () => {
    const { game } = table();
    const grinder = spawn(game, "Organ Grinder");
    fillGraveyard(game, 3);
    activate(game, grinder, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(graveyard(game).length).toBe(0);
  });
});
