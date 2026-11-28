/**
 * The top N cards of a graveyard (`CardFilter.topOfGraveyard` as a number):
 * Phyrexian Grimoire's "target opponent chooses one of the top two cards of
 * your graveyard. Exile that card and put the other one into your hand."
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, lands, pickFromZone, spawn, table, toGraveyard, zone } from "./harness.js";

function board(): {
  game: ReturnType<typeof table>["game"];
  b: ReturnType<typeof table>["b"];
  grimoire: ObjectId;
  bottom: ObjectId;
  second: ObjectId;
  top: ObjectId;
} {
  const { game, b } = table();
  const grimoire = spawn(game, "Phyrexian Grimoire");
  lands(game, "Wastes", 4);
  // Bottom to top: the card put into a graveyard last is on top (rule 404.2).
  const bottom = toGraveyard(game, "Grizzly Bears");
  const second = toGraveyard(game, "Forest");
  const top = toGraveyard(game, "Island");
  return { game, b, grimoire, bottom, second, top };
}

describe("Phyrexian Grimoire", () => {
  it("offers the opponent the top two; their pick is exiled, the other goes to your hand", () => {
    const { game, b, grimoire, bottom, second, top } = board();
    const seen = pickFromZone(b, top);
    activate(game, grimoire, 0, { targets: [{ kind: "player", player: B }] });
    expect([...seen.offered].sort()).toEqual([second, top].sort());
    expect(zone(game, top)).toBe("exile");
    expect(zone(game, second)).toBe("hand");
    expect(game.state.objects[second].owner).toBe(A);
    expect(zone(game, bottom)).toBe("graveyard");
  });

  it("picking the second card sends the top one to your hand", () => {
    const { game, b, grimoire, bottom, second, top } = board();
    pickFromZone(b, second);
    activate(game, grimoire, 0, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, second)).toBe("exile");
    expect(zone(game, top)).toBe("hand");
    expect(zone(game, bottom)).toBe("graveyard");
  });

  it("with one card there, exiles it and puts nothing into your hand", () => {
    const { game, b } = table();
    const grimoire = spawn(game, "Phyrexian Grimoire");
    lands(game, "Wastes", 4);
    const only = toGraveyard(game, "Forest");
    pickFromZone(b, only);
    const hand = game.state.zones.perPlayer[A].hand.length;
    activate(game, grimoire, 0, { targets: [{ kind: "player", player: B }] });
    expect(zone(game, only)).toBe("exile");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand);
  });
});
