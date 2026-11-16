/**
 * Hostile Hostel // Creeping Inn: soul counters that transform the land and
 * untap it, and "X is the number of creature cards exiled with this
 * creature" — a count of the cards linked to it (rule 607.2a: its attack
 * trigger's exile, `look-and-choose`'s `"exile"` destination), the one just
 * exiled among them: `{ aggregate: "count", in: "exiled-with-source" }`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, life, lands, nextTurn, pickFromZone, pickModes, pt, spawn, table, toGraveyard, zone } from "./harness.js";

const counters = (game: Game, id: ObjectId): number => game.state.objects[id].counters?.soul ?? 0;

/** Hostile Hostel with two soul counters already, a creature to sacrifice
 * and {1}: one more activation turns it into Creeping Inn. */
function innReady(game: Game): ObjectId {
  const hostel = spawn(game, "Hostile Hostel");
  game.state.objects[hostel].counters.soul = 2;
  lands(game, "Wastes", 1);
  const fodder = spawn(game, "Grizzly Bears");
  activate(game, hostel, 1, { sacrifice: fodder });
  return hostel;
}

describe("Hostile Hostel", () => {
  it("one soul counter an activation, as a sorcery; the third transforms it, untapped", () => {
    const { game } = table({ seed: 1 });
    const hostel = spawn(game, "Hostile Hostel");
    const wastes = lands(game, "Wastes", 1);
    const first = spawn(game, "Grizzly Bears");
    activate(game, hostel, 1, { sacrifice: first });
    expect(zone(game, first)).toBe("graveyard");
    expect(counters(game, hostel)).toBe(1);
    expect(game.state.objects[hostel].face ?? 0).toBe(0);
    expect(game.state.objects[hostel].tapped).toBe(true);
    expect(wastes.every((id) => game.state.objects[id].tapped)).toBe(true);

    nextTurn(game);
    nextTurn(game);
    activate(game, hostel, 1, { sacrifice: spawn(game, "Grizzly Bears") });
    expect(counters(game, hostel)).toBe(2);
    expect(game.state.objects[hostel].face ?? 0).toBe(0);

    nextTurn(game);
    nextTurn(game);
    activate(game, hostel, 1, { sacrifice: spawn(game, "Grizzly Bears") });
    expect(counters(game, hostel)).toBe(0);
    expect(game.state.objects[hostel].face).toBe(1);
    expect(game.state.objects[hostel].tapped).toBe(false);
    expect(pt(game, hostel)).toEqual({ power: 3, toughness: 7 });
  });
});

describe("Creeping Inn", () => {
  it("drains for each creature card exiled with it, the new one included", () => {
    const { game, a } = table({ seed: 1 });
    const inn = innReady(game);
    expect(game.state.objects[inn].face).toBe(1);
    const elves = toGraveyard(game, "Llanowar Elves");
    const ogre = toGraveyard(game, "Gray Ogre");
    toGraveyard(game, "Shock");
    pickModes(a, 0);
    const seen = pickFromZone(a, elves);
    const [mine, theirs] = [life(game, A), life(game, B)];
    attack(game, a, [inn]);
    // Only creature cards: the Bears sacrificed above, the Elves and the Ogre.
    expect(seen.offered).toHaveLength(3);
    expect(seen.offered).not.toContain(undefined);
    expect(zone(game, elves)).toBe("exile");
    expect(life(game, A)).toBe(mine + 1);
    expect(life(game, B)).toBe(theirs - 1 - 3);

    nextTurn(game);
    nextTurn(game);
    pickFromZone(a, ogre);
    const [mine2, theirs2] = [life(game, A), life(game, B)];
    attack(game, a, [inn]);
    expect(life(game, A)).toBe(mine2 + 2);
    expect(life(game, B)).toBe(theirs2 - 2 - 3);
  });

  it("declined, nothing is exiled and nobody's life changes but by combat", () => {
    const { game, a } = table({ seed: 1 });
    const inn = innReady(game);
    const elves = toGraveyard(game, "Llanowar Elves");
    pickModes(a);
    const [mine, theirs] = [life(game, A), life(game, B)];
    attack(game, a, [inn]);
    expect(zone(game, elves)).toBe("graveyard");
    expect(life(game, A)).toBe(mine);
    expect(life(game, B)).toBe(theirs - 3);
  });

  it("cards exiled some other way aren't counted", () => {
    const { game, a } = table({ seed: 1 });
    const inn = innReady(game);
    // A creature card in exile, not exiled with Creeping Inn.
    game.debugSpawn("Gray Ogre", A, "exile");
    const elves = toGraveyard(game, "Llanowar Elves");
    pickModes(a, 0);
    pickFromZone(a, elves);
    const theirs = life(game, B);
    attack(game, a, [inn]);
    expect(life(game, B)).toBe(theirs - 1 - 3);
  });
});
