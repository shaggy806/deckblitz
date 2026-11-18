/**
 * The cards a permanent spell's own delve exiled are linked to the permanent
 * it becomes (rule 607.2q): "exiled with it" — Murktide Regent's "enters with a
 * +1/+1 counter on it for each instant and sorcery card exiled with it",
 * Ethereal Forager's "return an instant or sorcery card exiled with this
 * creature". A delve granted it (Teval, Arbiter of Virtue) isn't printed on
 * it, and links nothing.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  attack,
  cast,
  counters,
  hand,
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

describe("Murktide Regent", () => {
  it("enters with a counter for each instant and sorcery card its delve exiled", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const spells = [toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Divination"), toGraveyard(game, "Opt")];
    const others = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
    // An instant already in exile, exiled by nothing of its: not counted.
    const elsewhere = toGraveyard(game, "Counterspell");
    game.debugMove(elsewhere, "exile");
    const murktide = toHand(game, "Murktide Regent");
    cast(game, murktide, { delve: [...spells, ...others] });
    expect(zone(game, murktide)).toBe("battlefield");
    expect([...spells, ...others].every((id) => zone(game, id) === "exile")).toBe(true);
    // Its own delve's exile was on the stack: nothing triggered.
    expect(counters(game, murktide)).toBe(3);
    expect(pt(game, murktide)).toEqual({ power: 6, toughness: 6 });
  });

  it("gets a counter whenever an instant or sorcery card leaves your graveyard", () => {
    const { game } = table();
    const murktide = spawn(game, "Murktide Regent", A);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.debugMove(bears, "exile");
    settle(game);
    expect(counters(game, murktide)).toBe(0);
    game.debugMove(bolt, "exile");
    settle(game);
    expect(counters(game, murktide)).toBe(1);
  });

  it("counts nothing its delve didn't exile as this object: a granted delve links none", () => {
    const { game } = table();
    spawn(game, "Teval, Arbiter of Virtue", A);
    lands(game, "Island", 3);
    const spells = [toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Divination")];
    // Hill Giant, {3}{R}: Teval's delve pays two of its {3}; the Islands can't
    // pay {R}, so a Mountain.
    lands(game, "Mountain", 1);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant, { delve: spells });
    expect(zone(game, giant)).toBe("battlefield");
    expect(spells.every((id) => game.state.objects[id].exiledWith === undefined)).toBe(true);
  });
});

describe("Ethereal Forager", () => {
  it("returns an instant or sorcery card its delve exiled when it attacks", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const divination = toGraveyard(game, "Divination");
    const bears = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant")];
    const forager = toHand(game, "Ethereal Forager");
    cast(game, forager, { delve: [bolt, divination, ...bears] });
    game.state.objects[forager].summoningSick = false;
    pickModes(a, 0);
    const seen = pickFromZone(a, divination);
    attack(game, a, [forager]);
    expect([...seen.offered].sort()).toEqual([bolt, divination].sort());
    expect(zone(game, divination)).toBe("hand");
    expect(hand(game, A)).toContain(divination);
    expect(zone(game, bolt)).toBe("exile");
  });
});
