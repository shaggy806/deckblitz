/**
 * A card put back onto the battlefield face down: a flicker's return, a
 * controller's choice of face up or face down, a return that's turned face up
 * after.
 *
 * Proving cards: Shorecrasher Elemental, Deathmist Raptor, Yarus.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  activate,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  pickFromZone,
  pickModes,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

type T = ReturnType<typeof table>;

const turnUp = (game: T["game"], permanent: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent, morph: true } as Action);
  settle(game);
};

/** A Shorecrasher Elemental put face down by its own ability, the mana to turn
 * it up left over. */
const faceDownElemental = (game: T["game"]): ObjectId => {
  const elemental = spawn(game, "Shorecrasher Elemental");
  lands(game, "Island", 6);
  activate(game, elemental, 0);
  return elemental;
};

describe("flicker's return face down", () => {
  it("Shorecrasher Elemental comes back as a new, face-down 2/2", () => {
    const { game } = table();
    const elemental = spawn(game, "Shorecrasher Elemental");
    lands(game, "Island", 6);
    game.state.objects[elemental].counters["+1/+1"] = 2;
    activate(game, elemental, 0);
    const object = game.state.objects[elemental];
    expect(zone(game, elemental)).toBe("battlefield");
    expect(object.faceDown?.kind).toBe("effect");
    expect(pt(game, elemental)).toEqual({ power: 2, toughness: 2 });
    // A new object: its counters stayed behind (rule 400.7), and it's sick.
    expect(counters(game, elemental)).toBe(0);
    expect(object.controller).toBe(A);
    expect(object.summoningSick).toBe(true);
    // Its abilities are gone while it's face down (rule 708.2a).
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === elemental)).toBe(false);
  });

  it("its megamorph turns it up, with the counter", () => {
    const { game } = table();
    const elemental = faceDownElemental(game);
    turnUp(game, elemental);
    expect(game.state.objects[elemental].faceDown).toBeUndefined();
    expect(counters(game, elemental)).toBe(1);
    expect(pt(game, elemental)).toEqual({ power: 4, toughness: 4 });
  });

  it("its other ability: +1/-1 or -1/+1 as it resolves", () => {
    const { game, a } = table();
    const elemental = spawn(game, "Shorecrasher Elemental");
    lands(game, "Island", 2);
    pickModes(a, 1);
    activate(game, elemental, 1);
    expect(pt(game, elemental)).toEqual({ power: 2, toughness: 4 });
    pickModes(a, 0);
    activate(game, elemental, 1);
    expect(pt(game, elemental)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("face up or face down", () => {
  it("Deathmist Raptor returns face down when asked, turned up later by its megamorph", () => {
    const { game, a } = table();
    const raptor = toGraveyard(game, "Deathmist Raptor");
    const elemental = faceDownElemental(game);
    pickModes(a, 1);
    turnUp(game, elemental);
    expect(zone(game, raptor)).toBe("battlefield");
    expect(game.state.objects[raptor].faceDown?.kind).toBe("effect");
    expect(pt(game, raptor)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, raptor).has("deathtouch")).toBe(false);
    lands(game, "Forest", 5);
    pickModes(a);
    turnUp(game, raptor);
    expect(pt(game, raptor)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, raptor).has("deathtouch")).toBe(true);
  });

  it("Deathmist Raptor returns face up when asked", () => {
    const { game, a } = table();
    const raptor = toGraveyard(game, "Deathmist Raptor");
    const elemental = faceDownElemental(game);
    pickModes(a, 0);
    turnUp(game, elemental);
    expect(game.state.objects[raptor].faceDown).toBeUndefined();
    expect(pt(game, raptor)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, raptor).has("deathtouch")).toBe(true);
  });

  it("declining leaves it in the graveyard, and it only ever triggers from there", () => {
    const { game, a } = table();
    const raptor = toGraveyard(game, "Deathmist Raptor");
    const elemental = faceDownElemental(game);
    pickModes(a);
    turnUp(game, elemental);
    expect(zone(game, raptor)).toBe("graveyard");
  });
});

describe("Yarus, Roar of the Old Gods", () => {
  const manifestFromHand = ({ game, a }: T, name: string): ObjectId => {
    const card = toHand(game, name);
    const scroll = spawn(game, "Scroll of Fate");
    pickFromZone(a, card);
    activate(game, scroll, 0);
    return card;
  };

  it("a face-down creature that dies comes back and is turned face up, with no enters ability", () => {
    const seat = table();
    const { game } = seat;
    spawn(game, "Yarus, Roar of the Old Gods");
    const elf = manifestFromHand(seat, "Elvish Visionary");
    const cards = hand(game).length;
    destroy(game, elf);
    settle(game);
    expect(zone(game, elf)).toBe("battlefield");
    expect(game.state.objects[elf].faceDown).toBeUndefined();
    expect(pt(game, elf)).toEqual({ power: 1, toughness: 1 });
    // It entered face down (rule 708.3): no draw from its enters ability.
    expect(hand(game).length).toBe(cards);
    // Other creatures you control have haste.
    expect(keywords(game, elf).has("haste")).toBe(true);
  });

  it("an instant or sorcery card stays in the graveyard, and a face-up creature doesn't trigger it", () => {
    const seat = table();
    const { game } = seat;
    spawn(game, "Yarus, Roar of the Old Gods");
    const bolt = manifestFromHand(seat, "Lightning Bolt");
    destroy(game, bolt);
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");

    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
  });
});
