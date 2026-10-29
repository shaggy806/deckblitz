/**
 * B251 group C: cards freed by "each player chooses" (rule 101.4) and the held
 * simultaneous discards — the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";

import {
  A,
  B,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pickPermanents,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const spellEffect = (game: Game, name: string): EffectSpec => {
  const effect = registryOf(game).get(name).effect;
  if (effect === null || effect === undefined) throw new Error(`${name} has no effect`);
  return effect;
};
const chapterEffect = (game: Game, name: string, index: number): EffectSpec => {
  const effect = registryOf(game).get(name).chapters?.[index]?.effect;
  if (effect === null || effect === undefined) throw new Error(`${name} has no chapter ${index + 1}`);
  return effect;
};
const goadedBy = (game: Game, id: ObjectId): readonly PlayerId[] => game.state.objects[id].goadedBy ?? [];

describe("B251 group C", () => {
  it("Agitator Ant: each chosen creature gets two counters from its controller and is goaded; an unchosen one isn't", () => {
    const { game, a, b } = table();
    spawn(game, "Agitator Ant", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const elf = spawn(game, "Elvish Visionary", B);
    const offeredToB = pickPermanents(b, giant);
    pickPermanents(a, bears);
    toStep(game, "end");
    settle(game);
    // Bob's choice is among his own creatures (`own`), not Alice's.
    expect([...offeredToB.offered].sort()).toEqual([giant, elf].sort());
    expect([counters(game, bears), counters(game, giant), counters(game, elf)]).toEqual([2, 2, 0]);
    expect(goadedBy(game, giant)).toEqual([A]);
    expect(goadedBy(game, bears)).toEqual([A]);
    expect(goadedBy(game, elf)).toEqual([]);
  });

  it("Agitator Ant: a player who declines has nothing goaded", () => {
    const { game, a, b } = table();
    spawn(game, "Agitator Ant", A);
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(b);
    pickPermanents(a);
    toStep(game, "end");
    settle(game);
    expect(counters(game, giant)).toBe(0);
    expect(goadedBy(game, giant)).toEqual([]);
  });

  it("Dispersal: each opponent may return only a permanent of greatest mana value, then discards", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const offered = pickPermanents(b, giant);
    const handBefore = hand(game, B).length;
    const graveBefore = graveyard(game, B).length;
    game.debugApplyEffect(A, spellEffect(game, "Dispersal"));
    settle(game);
    expect(offered.offered).toEqual([giant]);
    expect([zone(game, giant), zone(game, bears)]).toEqual(["hand", "battlefield"]);
    expect(hand(game, B).length).toBe(handBefore);
    expect(graveyard(game, B).length).toBe(graveBefore + 1);
  });

  it("Riches: each opponent chooses one of their creatures, and you gain control of it", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickPermanents(b, bears);
    game.debugApplyEffect(A, spellEffect(game, "Riches"));
    settle(game);
    expect([controller(game, bears), controller(game, giant)]).toEqual([A, B]);
  });

  it("Innocent Traveler: transforms when no opponent sacrifices, not when one does", () => {
    const { game, b } = table();
    const traveler = spawn(game, "Innocent Traveler", A);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[traveler].face ?? 0).toBe(0);
    pickModes(b);
    spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[traveler].face).toBe(1);
  });

  it("Grave Sifter: each player returns cards of the type they chose, from their own graveyard", () => {
    const { game, a, b } = table();
    const aliceBears = toGraveyard(game, "Grizzly Bears", A);
    const aliceGiant = toGraveyard(game, "Hill Giant", A);
    const bobBears = toGraveyard(game, "Grizzly Bears", B);
    const bobGiant = toGraveyard(game, "Hill Giant", B);
    a.chooseCreatureTypeFn = () => "Bear";
    b.chooseCreatureTypeFn = () => "Giant";
    const offeredToA = pickFromZone(a, aliceBears);
    const offeredToB = pickFromZone(b, bobGiant);
    enter(game, "Grave Sifter", A);
    expect(offeredToA.offered).toEqual([aliceBears]);
    expect(offeredToB.offered).toEqual([bobGiant]);
    expect([zone(game, aliceBears), zone(game, aliceGiant)]).toEqual(["hand", "graveyard"]);
    expect([zone(game, bobBears), zone(game, bobGiant)]).toEqual(["graveyard", "hand"]);
  });

  it("Liliana's Triumph: with a Liliana, each opponent sacrifices and then discards", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, the Last Hope", A);
    game.state.objects[liliana].counters.loyalty = 3;
    const bears = spawn(game, "Grizzly Bears", B);
    toHand(game, "Hill Giant", B);
    const graveBefore = graveyard(game, B).length;
    // Cast, not applied bare: an edict's sacrifices wait for the next priority check.
    lands(game, "Swamp", 2, A);
    const since = game.state.eventLog.length;
    cast(game, toHand(game, "Liliana's Triumph", A));
    expect(zone(game, bears)).toBe("graveyard");
    // The ruling's order: the sacrifices, then the discards.
    const order = game.state.eventLog
      .slice(since)
      .flatMap((e) => (e.type === "cards-discarded" || (e.type === "permanent-left-battlefield" && e.object === bears) ? [e.type] : []));
    expect(order).toEqual(["permanent-left-battlefield", "cards-discarded"]);
    expect(graveyard(game, B).length).toBe(graveBefore + 2);
  });

  it("The Legend of Yangchen I: each player chooses up to one of your opponents' permanents of mana value 3+", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Serra Angel", A);
    const offeredToA = pickPermanents(a, giant);
    pickPermanents(b);
    game.debugApplyEffect(A, chapterEffect(game, "The Legend of Yangchen", 0));
    settle(game);
    expect([...offeredToA.offered].sort()).toEqual([giant, angel].sort());
    expect([zone(game, giant), zone(game, angel), zone(game, bears), zone(game, mine)]).toEqual([
      "exile",
      "battlefield",
      "battlefield",
      "battlefield",
    ]);
  });

  it("The Horus Heresy III: starting with you, each player chooses any creature; all chosen are destroyed", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    const elf = spawn(game, "Elvish Visionary", B);
    pickPermanents(a, giant);
    const offeredToB = pickPermanents(b, bears);
    game.debugApplyEffect(A, chapterEffect(game, "The Horus Heresy", 2));
    settle(game);
    expect(offeredToB.offered).toContain(bears);
    expect([zone(game, bears), zone(game, giant), zone(game, elf)]).toEqual(["graveyard", "graveyard", "battlefield"]);
  });
});
