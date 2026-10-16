/**
 * Set walk batch 92, part i (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const GOLEM = "Golem Token (Master's Guide-Mural // Master's Manufactory)";

const faceOf = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const offered = (game: Game, source: ObjectId, index: number, player: PlayerId = A): boolean =>
  game.legalActions(player).some((l) => l.kind === "activate-ability" && l.source === source && l.abilityIndex === index);
const libraryOf = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Clay-Fired Bricks // Cosmium Kiln", () => {
  it("finds a basic Plains and gains 2 life as it enters", () => {
    const { game, a } = table();
    const plains = toLibrary(game, "Plains");
    pickFromZone(a, plains);
    enter(game, "Clay-Fired Bricks");
    expect(zone(game, plains)).toBe("hand");
    expect(life(game, A)).toBe(22);
  });

  it("crafts into Cosmium Kiln: two Gnomes, and creatures you control get +1/+1", () => {
    const { game, a } = table();
    lands(game, "Plains", 7);
    const bricks = spawn(game, "Clay-Fired Bricks");
    const bears = spawn(game, "Grizzly Bears");
    const material = toGraveyard(game, "Ornithopter");
    pickFromZone(a, material);
    activate(game, bricks, 0);
    expect(faceOf(game, bricks)).toBe("Cosmium Kiln");
    expect(zone(game, material)).toBe("exile");
    expect(tokensNamed(game, "Gnome Token", A)).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const gnome = game.battlefield.find((id) => game.state.objects[id].cardName === "Gnome Token")!;
    expect(pt(game, gnome)).toEqual({ power: 2, toughness: 2 });
    // Only creatures you control.
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Kaslem's Stonetree // Kaslem's Strider", () => {
  it("puts a land from the top six onto the battlefield tapped and the rest on the bottom", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const before = libraryOf(game).length;
    pickFromZone(a, forest);
    enter(game, "Kaslem's Stonetree");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    // The other five went to the bottom.
    const library = libraryOf(game);
    expect(library.slice(-5)).toContain(bears);
    expect(library.length).toBe(before - 1);
  });

  it("crafts with a Cave — a Cave land or a Cave card in the graveyard — into a 5/5", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const stonetree = spawn(game, "Kaslem's Stonetree");
    expect(offered(game, stonetree, 0)).toBe(false);
    const caveLand = spawn(game, "Captivating Cave");
    const caveCard = toGraveyard(game, "Captivating Cave");
    const seen = pickFromZone(a, caveCard);
    activate(game, stonetree, 0);
    expect(seen.offered).toEqual(expect.arrayContaining([caveLand, caveCard]));
    expect(faceOf(game, stonetree)).toBe("Kaslem's Strider");
    expect(pt(game, stonetree)).toEqual({ power: 5, toughness: 5 });
    expect(zone(game, caveCard)).toBe("exile");
  });
});

describe("Master's Guide-Mural // Master's Manufactory", () => {
  it("makes a 4/4 white and blue Golem as it enters", () => {
    const { game } = table();
    enter(game, "Master's Guide-Mural");
    expect(tokensNamed(game, GOLEM, A)).toBe(1);
    const golem = game.battlefield.find((id) => game.state.objects[id].cardName === GOLEM)!;
    expect(pt(game, golem)).toEqual({ power: 4, toughness: 4 });
  });

  it("Manufactory makes a Golem only on a turn an artifact entered under your control — itself included", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 3);
    const mural = spawn(game, "Master's Guide-Mural");
    const material = toGraveyard(game, "Ornithopter");
    pickFromZone(a, material);
    activate(game, mural, 0);
    expect(faceOf(game, mural)).toBe("Master's Manufactory");
    // It entered this turn, crafted.
    expect(offered(game, mural, 0)).toBe(true);
    activate(game, mural, 0);
    expect(tokensNamed(game, GOLEM, A)).toBe(1);

    toStep(game, "precombat-main");
    expect(offered(game, mural, 0)).toBe(false);
    // An artifact that entered and has since left still counts (the ruling).
    const thopter = enter(game, "Ornithopter");
    destroy(game, thopter);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(offered(game, mural, 0)).toBe(true);
  });

  it("Manufactory doesn't count an artifact that entered under an opponent's control", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 3);
    const mural = spawn(game, "Master's Guide-Mural");
    pickFromZone(a, toGraveyard(game, "Ornithopter"));
    activate(game, mural, 0);
    toStep(game, "precombat-main");
    enter(game, "Ornithopter", B);
    expect(offered(game, mural, 0)).toBe(false);
  });
});

describe("Tithing Blade // Consuming Sepulcher", () => {
  it("each opponent sacrifices a creature as it enters", () => {
    const { game } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    enter(game, "Tithing Blade");
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("crafts with a creature into Consuming Sepulcher, which drains each opponent at your upkeep", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 5);
    const blade = spawn(game, "Tithing Blade");
    const material = toGraveyard(game, "Grizzly Bears");
    pickFromZone(a, material);
    activate(game, blade, 0);
    expect(faceOf(game, blade)).toBe("Consuming Sepulcher");
    toStep(game, "upkeep");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.turn.step === "draw");
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
  });
});

describe("Visage of Dread // Dread Osseosaur", () => {
  it("has the opponent discard an artifact or creature card you choose", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(a, bears);
    enter(game, "Visage of Dread");
    expect(seen.offered).toEqual([bears]);
    expect(graveyard(game, B)).toContain(bears);
    expect(hand(game, B)).toContain(bolt);
  });

  it("crafts with two creatures into a menacing 5/4 that may mill two as it enters", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const visage = spawn(game, "Visage of Dread");
    const one = toGraveyard(game, "Grizzly Bears");
    expect(offered(game, visage, 0)).toBe(false);
    const two = spawn(game, "Grizzly Bears");
    pickFromZone(a, one, two);
    pickModes(a, 0);
    const before = libraryOf(game).length;
    activate(game, visage, 0);
    expect(faceOf(game, visage)).toBe("Dread Osseosaur");
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(pt(game, visage)).toEqual({ power: 5, toughness: 4 });
    expect(libraryOf(game).length).toBe(before - 2);
  });

  it("Dread Osseosaur can't choose to mill two with fewer than two cards in the library (rule 701.17b, the ruling)", () => {
    // Crafted, so it enters as its back face; `left` cards in the library.
    const craftWith = (left: number): { asked: boolean; library: number } => {
      const { game, a } = table();
      lands(game, "Swamp", 6);
      const visage = spawn(game, "Visage of Dread");
      pickFromZone(a, toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"));
      game.debugApplyEffect(A, { kind: "mill", target: "you", amount: libraryOf(game).length - left });
      let asked = false;
      a.chooseModesFn = () => {
        asked = true;
        return [0];
      };
      activate(game, visage, 0);
      expect(faceOf(game, visage)).toBe("Dread Osseosaur");
      return { asked, library: libraryOf(game).length };
    };
    expect(craftWith(1)).toEqual({ asked: false, library: 1 });
    expect(craftWith(2)).toEqual({ asked: true, library: 0 });
  });

  it("Dread Osseosaur may mill two as it attacks", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const visage = spawn(game, "Visage of Dread");
    pickFromZone(a, toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"));
    pickModes(a);
    const before = libraryOf(game).length;
    activate(game, visage, 0);
    expect(libraryOf(game).length).toBe(before);
    toStep(game, "precombat-main");
    pickModes(a, 0);
    const atAttack = libraryOf(game).length;
    attack(game, a, [visage]);
    expect(libraryOf(game).length).toBe(atAttack - 2);
    expect(life(game, B)).toBe(15);
  });
});
