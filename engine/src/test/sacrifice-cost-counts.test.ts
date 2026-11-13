/**
 * Sacrifice costs of a chosen count: "Sacrifice X Clues" with the Clues in
 * one token stack or apart (Lonis, Cryptozoologist); "Sacrifice an
 * artifact with mana value X" (Scrap Welder); "Sacrifice up to three
 * permanents", the card types among them read off the paid set (Baba
 * Lysaga, Night Witch — `maxX`, `{ cardTypesAmong }`).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  C,
  activate,
  hand,
  keywords,
  life,
  named,
  pickFromZone,
  quiet,
  ref,
  spawn,
  table,
  toGraveyard,
  toLibrary,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

/** `count` tokens named `name` for alice, made by an effect (so they're
 * tokens, and stack past the threshold). */
function tokens(game: Game, name: string, count: number): void {
  game.debugApplyEffect(A, { kind: "create-token", token: name, count });
}
const clues = (game: Game): number =>
  named(game, "Clue Token", A).reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);

describe("Lonis, Cryptozoologist", () => {
  /** Bob's library, top first: a 2-drop creature, a land, a 3-drop. */
  function bobsLibrary(game: Game): { bears: ObjectId; forest: ObjectId; ogre: ObjectId } {
    const ogre = toLibrary(game, "Gray Ogre", B);
    const forest = toLibrary(game, "Forest", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    return { bears, forest, ogre };
  }

  it("sacrifices X Clues — both, when they're two — and puts a revealed card onto the battlefield under its controller's control", () => {
    const { game, a } = table();
    const lonis = spawn(game, "Lonis, Cryptozoologist");
    tokens(game, "Clue Token", 2);
    expect(clues(game)).toBe(2);
    const { bears } = bobsLibrary(game);
    pickFromZone(a, bears);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: lonis,
      abilityIndex: 0,
      xValue: 2,
      targets: [{ kind: "player", player: B }],
    });
    // Both go as the cost is paid, with nothing to choose.
    expect(clues(game)).toBe(0);
    game.advanceUntil(quiet);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    // A nontoken creature entered under Lonis's controller's control:
    // investigate (B296's "one sacrificed for X = 2" was this new Clue).
    expect(clues(game)).toBe(1);
  });

  it("from a stack of Clue tokens, sacrifices exactly X of them", () => {
    const { game, a } = table();
    const lonis = spawn(game, "Lonis, Cryptozoologist");
    tokens(game, "Clue Token", 1);
    // Twelve Clues in one object, as a compacted stack is.
    const [stack] = named(game, "Clue Token", A);
    game.state.objects[stack].stackCount = 12;
    const { ogre, forest, bears } = bobsLibrary(game);
    a.chooseSacrificesFn = (_view, eligible, count) => Array<ObjectId>(count).fill(eligible[0]);
    pickFromZone(a, ogre);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: lonis,
      abilityIndex: 0,
      xValue: 3,
      targets: [{ kind: "player", player: B }],
    });
    // Which three is asked of the stack's twelve.
    expect(game.state.awaiting?.kind).toBe("sacrifice");
    game.advanceUntil(quiet);
    expect(zone(game, ogre)).toBe("battlefield");
    // Nine left, and Gray Ogre's entry investigates.
    expect(clues(game)).toBe(10);
    // The other two go to the bottom of Bob's library.
    expect(zone(game, forest)).toBe("library");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Scrap Welder", () => {
  it("sacrifices an artifact with mana value X and returns one with mana value less than X, with haste", () => {
    const { game } = table();
    const welder = spawn(game, "Scrap Welder");
    const stone = spawn(game, "Mind Stone");
    const thopter = toGraveyard(game, "Ornithopter");
    activate(game, welder, 0, { x: 2, sacrifice: stone, targets: [ref(thopter)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(keywords(game, thopter).has("haste")).toBe(true);
  });

  it("can't return a card whose mana value is X, nor pay with an artifact of another mana value", () => {
    const { game } = table();
    const welder = spawn(game, "Scrap Welder");
    const stone = spawn(game, "Mind Stone");
    const otherStone = toGraveyard(game, "Mind Stone");
    const thopter = toGraveyard(game, "Ornithopter");
    expect(() => activate(game, welder, 0, { x: 2, sacrifice: stone, targets: [ref(otherStone)] })).toThrow(/target/i);
    expect(() => activate(game, welder, 0, { x: 3, sacrifice: stone, targets: [ref(thopter)] })).toThrow(/sacrific/i);
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Baba Lysaga, Night Witch", () => {
  type Offer = Extract<LegalAction, { kind: "activate-ability" }>;
  const offer = (game: Game, source: ObjectId): Offer | undefined =>
    game.legalActions(A).find((a): a is Offer => a.kind === "activate-ability" && a.source === source);

  /** Activate at `x`, sacrificing `victims`; settled. */
  function sacrificeFor(game: Game, a: ScriptedController, baba: ObjectId, victims: readonly ObjectId[]): void {
    a.chooseSacrificesFn = () => [...victims];
    activate(game, baba, 0, { x: victims.length });
  }

  it("sacrifices up to three — never more, however many it could", () => {
    const { game } = table();
    const baba = spawn(game, "Baba Lysaga, Night Witch");
    for (let i = 0; i < 5; i += 1) spawn(game, "Forest");
    expect(offer(game, baba)?.xCost?.maxX).toBe(3);
    expect(() => activate(game, baba, 0, { x: 4 })).toThrow(/more than 3/);
    expect(zone(game, baba)).toBe("battlefield");
  });

  it("with three card types among them, drains each opponent for 3, gains 3 and draws three", () => {
    const { game, a } = table({ players: 3 });
    const baba = spawn(game, "Baba Lysaga, Night Witch");
    const ring = spawn(game, "Sol Ring");
    const forest = spawn(game, "Forest");
    const anthem = spawn(game, "Glorious Anthem");
    spawn(game, "Grizzly Bears");
    const cards = hand(game).length;
    sacrificeFor(game, a, baba, [ring, forest, anthem]);
    for (const id of [ring, forest, anthem]) expect(zone(game, id)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(23);
    expect(hand(game).length).toBe(cards + 3);
  });

  it("counts an artifact creature as two types, read as it last was — and may sacrifice herself", () => {
    const { game, a } = table();
    const baba = spawn(game, "Baba Lysaga, Night Witch");
    const thopter = spawn(game, "Ornithopter");
    const forest = spawn(game, "Forest");
    sacrificeFor(game, a, baba, [thopter, forest]);
    expect(life(game, B)).toBe(17);
    const { game: other, a: seat } = table();
    const witch = spawn(other, "Baba Lysaga, Night Witch");
    const swamp = spawn(other, "Swamp");
    const ring = spawn(other, "Sol Ring");
    sacrificeFor(other, seat, witch, [witch, swamp, ring]);
    expect(zone(other, witch)).toBe("graveyard");
    expect(life(other, B)).toBe(17);
  });

  it("with fewer than three card types, does nothing", () => {
    const { game, a } = table();
    const baba = spawn(game, "Baba Lysaga, Night Witch");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const forest = spawn(game, "Forest");
    const cards = hand(game).length;
    sacrificeFor(game, a, baba, [bears, elves, forest]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(cards);
  });
});
