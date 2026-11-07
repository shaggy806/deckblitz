// B270: the cards flagged "Build ASAP" in the library — Liliana of the Dark
// Realms, Dracogenesis, Planar Nexus and Aettir and Priwen.

import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { hasSubtype } from "../subtypes.js";
import {
  A,
  activate,
  B,
  cast,
  lands,
  loyalty,
  pickModes,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toHand,
  zone,
} from "./harness.js";

const offers = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }>[] =>
  game.legalActions(A).filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

describe("Liliana of the Dark Realms", () => {
  it("−3 chooses +X/+X or −X/−X as it resolves, X the Swamps you control", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const liliana = spawn(game, "Liliana of the Dark Realms");
    const bear = spawn(game, "Grizzly Bears", B);
    pickModes(a, 1);
    loyalty(game, liliana, -3, { targets: [ref(bear)] });
    // A 2/2 at −3/−3 dies.
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("the other choice pumps it", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const liliana = spawn(game, "Liliana of the Dark Realms");
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    loyalty(game, liliana, -3, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Dracogenesis", () => {
  it("offers a Dragon spell for nothing, beside its mana cost", () => {
    const { game } = table();
    spawn(game, "Dracogenesis");
    const dragon = toHand(game, "Shivan Dragon");
    expect(offers(game, dragon).some((o) => o.altCost === true)).toBe(true);
    cast(game, dragon, { altCost: true });
    expect(zone(game, dragon)).toBe("battlefield");
  });

  it("doesn't reach a spell that isn't a Dragon", () => {
    const { game } = table();
    spawn(game, "Dracogenesis");
    const bear = toHand(game, "Grizzly Bears");
    expect(offers(game, bear).some((o) => o.altCost === true)).toBe(false);
  });
});

describe("Planar Nexus", () => {
  it("is every nonbasic land type, in every zone, and no basic one", () => {
    const { game } = table();
    const inHand = toHand(game, "Planar Nexus");
    const nexus = spawn(game, "Planar Nexus");
    for (const id of [inHand, nexus]) {
      expect(hasSubtype(subtypes(game, id), "Urza's")).toBe(true);
      expect(hasSubtype(subtypes(game, id), "Desert")).toBe(true);
      expect(hasSubtype(subtypes(game, id), "Gate")).toBe(true);
      expect(hasSubtype(subtypes(game, id), "Forest")).toBe(false);
    }
  });

  it("is a Mine and a Power-Plant to Urza's Tower", () => {
    const { game } = table();
    spawn(game, "Planar Nexus");
    const tower = spawn(game, "Urza's Tower");
    activate(game, tower, 0);
    expect(game.state.players[A].manaPool).toHaveLength(3);
  });
});

describe("Aettir and Priwen", () => {
  it("makes the equipped creature X/X for your life total, following it", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const aettir = spawn(game, "Aettir and Priwen");
    const bear = spawn(game, "Grizzly Bears");
    activate(game, aettir, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 20, toughness: 20 });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(pt(game, bear)).toEqual({ power: 17, toughness: 17 });
  });
});
