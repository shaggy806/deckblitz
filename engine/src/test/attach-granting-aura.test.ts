import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  keywords,
  lands,
  nextTurn,
  pickPermanents,
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
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

// An Aura's granted ability that names the Aura (rule 201.5a): the
// `"granter"` reference, here moving the Aura itself with `attach`'s
// `attachment: "granter"` — Shifting Shadow and Nettlevine Blight — and
// taking its counters off and destroying it — Heliod's Punishment. The Aura
// is the one that granted the ability as it triggered, acted on only while
// it's still that permanent (rule 400.7); an Aura left attached to nothing
// goes to the graveyard as a state-based action (rule 704.5m).

function enchant(game: Game, aura: string, host: ObjectId, owner = A): ObjectId {
  const id = spawn(game, aura, owner);
  game.state.objects[id].attachedTo = host;
  return id;
}

/** `who`'s library, top first. */
const library = (game: Game, who = A): readonly ObjectId[] => game.state.zones.perPlayer[who].library;

describe("Shifting Shadow", () => {
  it("grants haste, and at the upkeep destroys the creature and moves onto the creature card revealed", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const shadow = enchant(game, "Shifting Shadow", bears);
    expect(keywords(game, bears).has("haste")).toBe(true);
    const giant = toLibrary(game, "Hill Giant");
    const w1 = toLibrary(game, "Wastes");
    const w2 = toLibrary(game, "Wastes");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[shadow].attachedTo).toBe(giant);
    expect(zone(game, shadow)).toBe("battlefield");
    expect(keywords(game, giant).has("haste")).toBe(true);
    // The other revealed cards went to the bottom.
    expect(library(game).slice(-2)).toEqual(expect.arrayContaining([w1, w2]));
  });

  it("still moves when the creature can't be destroyed (the ruling)", () => {
    const { game } = table();
    const myr = spawn(game, "Darksteel Myr");
    const shadow = enchant(game, "Shifting Shadow", myr);
    const giant = toLibrary(game, "Hill Giant");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, myr)).toBe("battlefield");
    expect(game.state.objects[shadow].attachedTo).toBe(giant);
  });

  it("goes to the graveyard when no creature card is revealed (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const shadow = enchant(game, "Shifting Shadow", bears);
    const before = library(game).length;
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game)).toContain(shadow);
    expect(library(game).length).toBe(before);
  });

  it("isn't attached to the new creature once it has left before the trigger resolves (rule 400.7)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const shadow = enchant(game, "Shifting Shadow", bears);
    const giant = toLibrary(game, "Hill Giant");
    toStep(game, "upkeep");
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.debugMove(shadow, "exile");
    game.debugMove(shadow, "battlefield");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[shadow].attachedTo ?? null).not.toBe(giant);
  });

  it("on an opponent's creature, triggers in their upkeep and reveals from their library", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const shadow = enchant(game, "Shifting Shadow", bears, A);
    const giant = toLibrary(game, "Hill Giant", B);
    toStep(game, "upkeep", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].controller).toBe(B);
    expect(game.state.objects[shadow].attachedTo).toBe(giant);
    expect(game.state.objects[shadow].controller).toBe(A);
  });
});

/** The activated abilities `player` may activate on `source` now, by index. */
const activatable = (game: Game, source: ObjectId, player = A): readonly number[] =>
  game.legalActions(player).flatMap((o) => (o.kind === "activate-ability" && o.source === source ? [o.abilityIndex] : []));

describe("Heliod's Punishment", () => {
  it("enters with four task counters; the creature can't attack, loses its abilities and has the granted one", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    const punishment = toHand(game, "Heliod's Punishment");
    cast(game, punishment, { targets: [ref(sorcerer)] });
    expect(game.state.objects[punishment].attachedTo).toBe(sorcerer);
    expect(counters(game, punishment, "task")).toBe(4);
    // The printed ping (index 0) is gone; the granted ability follows it.
    nextTurn(game);
    expect(activatable(game, sorcerer, B)).toEqual([1]);
    activate(game, sorcerer, 1, { player: B });
    expect(counters(game, punishment, "task")).toBe(3);
    expect(zone(game, punishment)).toBe("battlefield");
  });

  it("is destroyed when the last task counter comes off", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const punishment = enchant(game, "Heliod's Punishment", bears);
    game.state.objects[punishment].counters.task = 2;
    nextTurn(game);
    activate(game, bears, 0, { player: B });
    expect(counters(game, punishment, "task")).toBe(1);
    expect(zone(game, punishment)).toBe("battlefield");
    nextTurn(game);
    nextTurn(game);
    activate(game, bears, 0, { player: B });
    expect(zone(game, punishment)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("under two, the creature has only the ability of the one attached last, which removes its counters alone (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const first = enchant(game, "Heliod's Punishment", bears);
    const second = enchant(game, "Heliod's Punishment", bears);
    game.state.objects[first].counters.task = 4;
    game.state.objects[second].counters.task = 4;
    nextTurn(game);
    const offered = activatable(game, bears, B);
    expect(offered).toHaveLength(1);
    activate(game, bears, offered[0], { player: B });
    expect(counters(game, second, "task")).toBe(3);
    expect(counters(game, first, "task")).toBe(4);
  });

  it("a * the creature defined is 0 once it has lost the ability (the ruling)", () => {
    const { game } = table();
    const goyf = spawn(game, "Tarmogoyf", B);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
    enchant(game, "Heliod's Punishment", goyf);
    expect(pt(game, goyf)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Nettlevine Blight", () => {
  it("at the enchanted permanent's controller's end step, it's sacrificed and they move the Aura to a creature or land they control", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    spawn(game, "Hill Giant", A);
    const blight = enchant(game, "Nettlevine Blight", bears, A);
    const offer = pickPermanents(b, forest);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[blight].attachedTo).toBe(forest);
    expect(offer.offered).toContain(forest);
    expect(game.state.objects[blight].controller).toBe(A);
  });

  it("goes to the graveyard when its controller has no creature or land left", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const blight = enchant(game, "Nettlevine Blight", bears, A);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, blight)).toBe("graveyard");
  });
});
