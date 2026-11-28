/**
 * A `reveal-until` that also stops at a number of cards (`atMost`): Thought
 * Dissector's "reveals cards from the top of their library until an artifact
 * card or X cards are revealed, whichever comes first".
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, lands, spawn, table, toLibrary, zone } from "./harness.js";

function board(): { game: ReturnType<typeof table>["game"]; dissector: ObjectId; ring: ObjectId; bears: ObjectId; forest: ObjectId } {
  const { game } = table();
  const dissector = spawn(game, "Thought Dissector");
  lands(game, "Wastes", 3);
  // Top to bottom: Grizzly Bears, Forest, Sol Ring.
  const ring = toLibrary(game, "Sol Ring", B);
  const forest = toLibrary(game, "Forest", B);
  const bears = toLibrary(game, "Grizzly Bears", B);
  return { game, dissector, ring, bears, forest };
}

describe("Thought Dissector", () => {
  it("stops at X cards with no artifact: the rest go to that player's graveyard, nothing sacrificed", () => {
    const { game, dissector, ring, bears, forest } = board();
    activate(game, dissector, 0, { targets: [{ kind: "player", player: B }], x: 2 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
    expect(game.state.objects[bears].owner).toBe(B);
    expect(zone(game, ring)).toBe("library");
    expect(zone(game, dissector)).toBe("battlefield");
  });

  it("finds the artifact as the Xth card: it enters under your control and this is sacrificed", () => {
    const { game, dissector, ring, bears, forest } = board();
    activate(game, dissector, 0, { targets: [{ kind: "player", player: B }], x: 3 });
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[ring].controller).toBe(A);
    expect(zone(game, dissector)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("with X of 0 reveals nothing", () => {
    const { game, dissector, ring, bears } = board();
    activate(game, dissector, 0, { targets: [{ kind: "player", player: B }], x: 0 });
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, ring)).toBe("library");
    expect(zone(game, dissector)).toBe("battlefield");
  });
});
