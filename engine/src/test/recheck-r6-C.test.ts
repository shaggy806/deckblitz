/**
 * Need-keys recheck list R6, group C: The Indomitable, Glacial Chasm,
 * Phyrexian Soulgorger and Stream of Thought — each card's clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  cast,
  counters,
  enter,
  graveyard,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("The Indomitable", () => {
  it("is cast from the graveyard only while you control three or more tapped Pirates and/or Vehicles", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const ship = toGraveyard(game, "The Indomitable");
    const offers = () => game.legalActions(A).filter((l) => l.kind === "cast-spell" && l.card === ship);
    spawn(game, "Aethersphere Harvester", A, { tapped: true });
    spawn(game, "Aethersphere Harvester", A, { tapped: true });
    spawn(game, "Aethersphere Harvester", A);
    expect(offers()).toHaveLength(0);
    spawn(game, "Aethersphere Harvester", A, { tapped: true });
    const offer = offers()[0];
    if (offer?.kind !== "cast-spell") throw new Error("no graveyard cast offered");
    expect(offer.via).toBe("graveyard-permission");
    cast(game, ship, {
      via: offer.via,
      ...(offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
    });
    expect(zone(game, ship)).toBe("battlefield");
  });
});

describe("Glacial Chasm", () => {
  it("sacrifices itself when it's the only land, and prevents all damage to you", () => {
    const { game } = table();
    const chasm = enter(game, "Glacial Chasm");
    expect(zone(game, chasm)).toBe("graveyard");
    spawn(game, "Glacial Chasm");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
  });
});

describe("Phyrexian Soulgorger", () => {
  it("cumulative upkeep sacrifices a creature per age counter", () => {
    const { game, a } = table();
    const gorger = spawn(game, "Phyrexian Soulgorger");
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [bear];
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, gorger, "age")).toBe(1);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, gorger)).toBe("battlefield");
  });
});

describe("Stream of Thought", () => {
  it("chooses the cards to shuffle in as it resolves, the ones just milled among them", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")];
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    let chosen: ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      const milled = eligible.filter((id) => !bears.includes(id));
      expect(milled).toHaveLength(4);
      chosen = [...bears, milled[0], milled[1]];
      return chosen;
    };
    cast(game, toHand(game, "Stream of Thought"), { targets: [ref(A)] });
    expect(graveyard(game, A).filter((id) => chosen.includes(id))).toHaveLength(0);
    expect(graveyard(game, A).filter((id) => game.state.objects[id].cardName === "Wastes")).toHaveLength(2);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore - 4 + 4);
  });
});
