/**
 * "An Equipment that was attached to it" (`CardFilter.wasAttachedTo`): what
 * was attached to the ability's source or its trigger's object, as it is now
 * or — once it has left — as it last existed (rule 608.2h; `LastKnownInfo
 * .attachments`), only the same objects still on the battlefield (rule
 * 400.7). Zack Fair is sacrificed to pay for his ability, so his Equipment
 * has fallen off by the time it resolves (704.5n); Rhuk, Hexgold Nabber
 * takes all of an attacking or dying creature's Equipment, or none.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  activate,
  attack,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  table,
} from "./harness.js";

const equip = (game: Game, equipment: ObjectId, host: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(equipment)]);
  expect(game.state.objects[equipment].attachedTo).toBe(host);
};

const hostOf = (game: Game, id: ObjectId): ObjectId | null => game.state.objects[id].attachedTo;

describe("Zack Fair", () => {
  it("enters with a +1/+1 counter; sacrificed, gives his counters, indestructible and his Equipment", () => {
    const { game, a } = table();
    const zack = enter(game, "Zack Fair");
    expect(counters(game, zack)).toBe(1);
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    equip(game, sword, zack);
    lands(game, "Plains", 1);
    const seen = pickPermanents(a, sword);
    activate(game, zack, 0, { targets: [ref(bear)] });
    expect(game.state.objects[zack].zone).toBe("graveyard");
    expect(seen.offered).toEqual([sword]);
    expect(hostOf(game, sword)).toBe(bear);
    expect(counters(game, bear)).toBe(1);
    expect(keywords(game, bear).has("indestructible")).toBe(true);
  });

  it("attaches one of several: the one chosen, and only Equipment that was attached to him", () => {
    const { game, a } = table();
    const zack = enter(game, "Zack Fair");
    const bear = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Llanowar Elves");
    const sword = spawn(game, "Bonesplitter");
    const morningstar = spawn(game, "Vulshok Morningstar");
    const elsewhere = spawn(game, "Short Sword");
    const loose = spawn(game, "Short Sword");
    equip(game, sword, zack);
    equip(game, morningstar, zack);
    equip(game, elsewhere, other);
    lands(game, "Plains", 1);
    const seen = pickPermanents(a, morningstar);
    activate(game, zack, 0, { targets: [ref(bear)] });
    expect([...seen.offered].sort()).toEqual([sword, morningstar].sort());
    expect(hostOf(game, morningstar)).toBe(bear);
    // The other fell off as he left (704.5n) and stays unattached.
    expect(hostOf(game, sword)).toBeNull();
    expect(hostOf(game, elsewhere)).toBe(other);
    expect(hostOf(game, loose)).toBeNull();
  });

  it("with no Equipment on him, still gives the counters and indestructible", () => {
    const { game, a } = table();
    const zack = enter(game, "Zack Fair");
    const bear = spawn(game, "Grizzly Bears");
    const loose = spawn(game, "Bonesplitter");
    lands(game, "Plains", 1);
    const seen = pickPermanents(a, loose);
    activate(game, zack, 0, { targets: [ref(bear)] });
    expect(seen.offered).toEqual([]);
    expect(hostOf(game, loose)).toBeNull();
    expect(counters(game, bear)).toBe(1);
  });

  it("an Equipment that left and came back since isn't the one that was attached (rule 400.7)", () => {
    const { game, a } = table();
    const zack = enter(game, "Zack Fair");
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    equip(game, sword, zack);
    lands(game, "Plains", 1);
    pickPermanents(a, sword);
    activate(game, zack, 0, { targets: [ref(bear)], settle: false });
    // In response, the sword is flickered: a new object.
    game.debugMove(sword, "exile");
    game.debugMove(sword, "battlefield");
    expect(game.state.zones.shared.stack).toHaveLength(1);
    settle(game);
    expect(hostOf(game, sword)).toBeNull();
    expect(counters(game, bear)).toBe(1);
  });
});

describe("Rhuk, Hexgold Nabber", () => {
  it("may take all Equipment from an equipped creature as it attacks", () => {
    const { game, a } = table();
    const rhuk = spawn(game, "Rhuk, Hexgold Nabber");
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    const morningstar = spawn(game, "Vulshok Morningstar");
    equip(game, sword, bear);
    equip(game, morningstar, bear);
    pickModes(a, 0);
    attack(game, a, [bear]);
    expect(hostOf(game, sword)).toBe(rhuk);
    expect(hostOf(game, morningstar)).toBe(rhuk);
  });

  it("may decline, and leaves them where they are", () => {
    const { game, a } = table();
    spawn(game, "Rhuk, Hexgold Nabber");
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    equip(game, sword, bear);
    pickModes(a);
    attack(game, a, [bear]);
    expect(hostOf(game, sword)).toBe(bear);
  });

  it("takes the Equipment of an equipped creature that dies, as it last existed", () => {
    const { game, a } = table();
    const rhuk = spawn(game, "Rhuk, Hexgold Nabber");
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    equip(game, sword, bear);
    pickModes(a, 0);
    destroy(game, bear);
    expect(game.state.objects[bear].zone).toBe("graveyard");
    expect(hostOf(game, sword)).toBe(rhuk);
  });

  it("doesn't trigger for an unequipped creature, nor for Rhuk himself", () => {
    const { game, a } = table();
    const rhuk = spawn(game, "Rhuk, Hexgold Nabber");
    const bear = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Bonesplitter");
    equip(game, sword, rhuk);
    pickModes(a, 0);
    attack(game, a, [rhuk, bear]);
    expect(hostOf(game, sword)).toBe(rhuk);
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});
