/**
 * "Return any number of Aura cards that were attached to it from your
 * graveyard" (`CardFilter.wasAttachedTo` on a graveyard card): the cards the
 * Auras on a creature that died became in their owner's graveyard, put there
 * with it or after it as a state-based action (rules 400.7f, 704.5m) — read
 * from the creature as it last existed (`LastKnownInfo.attachments`). A
 * return "attached to target creature" offers only the Aura cards that could
 * legally enchant it (rule 303.4i, Cass, Hand of Vengeance's ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  B,
  destroy,
  graveyard,
  pickFromZone,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  watchTargets,
  zone,
} from "./harness.js";

const attach = (game: Game, attachment: ObjectId, host: ObjectId): void => {
  game.debugApplyEffect(game.state.objects[attachment].controller, { kind: "attach", target: 0, attachment: 1 }, [
    ref(host),
    ref(attachment),
  ]);
  expect(game.state.objects[attachment].attachedTo).toBe(host);
};

const hostOf = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo;

describe("Cass, Hand of Vengeance", () => {
  it("returns the Aura cards that were on a creature that died attached to the target, then moves its Equipment", () => {
    const { game, a } = table();
    spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const holy = spawn(game, "Holy Strength");
    const unholy = spawn(game, "Unholy Strength");
    const sword = spawn(game, "Bonesplitter");
    attach(game, holy, bear);
    attach(game, unholy, bear);
    attach(game, sword, bear);
    // An Aura card already in the graveyard was never attached to it.
    const loose = toGraveyard(game, "Holy Strength");
    pickTargets(a, elves);
    const seen = pickFromZone(a, holy, unholy);
    const equipment = pickPermanents(a, sword);
    destroy(game, bear);
    expect([...seen.offered].sort()).toEqual([holy, unholy].sort());
    expect(zone(game, holy)).toBe("battlefield");
    expect(hostOf(game, holy)).toBe(elves);
    expect(hostOf(game, unholy)).toBe(elves);
    expect(equipment.offered).toEqual([sword]);
    expect(hostOf(game, sword)).toBe(elves);
    expect(zone(game, loose)).toBe("graveyard");
    // Llanowar Elves 1/1, +1/+2, +2/+1, Bonesplitter +2/+0.
    expect(pt(game, elves)).toEqual({ power: 6, toughness: 4 });
  });

  it("returns only those chosen, and none when the answer is none", () => {
    const { game, a } = table();
    spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const holy = spawn(game, "Holy Strength");
    const unholy = spawn(game, "Unholy Strength");
    attach(game, holy, bear);
    attach(game, unholy, bear);
    pickTargets(a, elves);
    pickFromZone(a, unholy);
    destroy(game, bear);
    expect(hostOf(game, unholy)).toBe(elves);
    expect(zone(game, holy)).toBe("graveyard");
  });

  it("triggers on Cass herself dying", () => {
    const { game, a } = table();
    const cass = spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    const holy = spawn(game, "Holy Strength");
    attach(game, holy, cass);
    pickTargets(a, bear);
    pickFromZone(a, holy);
    destroy(game, cass);
    expect(zone(game, cass)).toBe("graveyard");
    expect(hostOf(game, holy)).toBe(bear);
  });

  it("doesn't offer an Aura card that can't legally enchant the target (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    const knight = spawn(game, "White Knight");
    const holy = spawn(game, "Holy Strength");
    const unholy = spawn(game, "Unholy Strength");
    attach(game, holy, bear);
    attach(game, unholy, bear);
    pickTargets(a, knight);
    const seen = pickFromZone(a, holy);
    destroy(game, bear);
    // Protection from black: Unholy Strength can't enchant White Knight.
    expect(seen.offered).toEqual([holy]);
    expect(hostOf(game, holy)).toBe(knight);
    expect(zone(game, unholy)).toBe("graveyard");
  });

  it("returns only Aura cards from your graveyard, not an opponent's Aura that was on it", () => {
    const { game, a } = table();
    spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Holy Strength", B);
    attach(game, theirs, bear);
    pickTargets(a, elves);
    const seen = pickFromZone(a, theirs);
    destroy(game, bear);
    expect(seen.offered).toEqual([]);
    expect(graveyard(game, B)).toContain(theirs);
  });

  it("an Aura that went to the graveyard before the creature died wasn't attached to it then", () => {
    const { game, a } = table();
    spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const holy = spawn(game, "Holy Strength");
    const sword = spawn(game, "Bonesplitter");
    attach(game, holy, bear);
    attach(game, sword, bear);
    destroy(game, holy);
    pickTargets(a, elves);
    const seen = pickFromZone(a, holy);
    pickPermanents(a, sword);
    destroy(game, bear);
    expect(seen.offered).toEqual([]);
    expect(zone(game, holy)).toBe("graveyard");
    expect(hostOf(game, sword)).toBe(elves);
  });

  it("doesn't trigger for a creature that was neither enchanted nor equipped", () => {
    const { game, a } = table();
    spawn(game, "Cass, Hand of Vengeance");
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    const seen = watchTargets(a);
    destroy(game, bear);
    expect(seen.asked).toBe(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });
});
