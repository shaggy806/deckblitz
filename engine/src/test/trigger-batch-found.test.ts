/**
 * A card chosen from among the cards a "one or more cards leave your
 * graveyard" trigger fired on, each found where it went (rule 400.7e: an
 * ability that triggers on an object moving can find the new object in the
 * zone it moved to, if that zone is public) — the `look-and-choose`
 * `zone: "trigger-batch"`, its filter read on each card as it was in the
 * graveyard. Spirit of Resilience's "you may have this creature become a copy
 * of an artifact or creature card from among those cards until end of turn".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";

import { A, B, counters, pickFromZone, pt, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const name = (game: Game, id: ObjectId): string => nameOf(game.state.objects[id]);

/** Alice's Spirit of Resilience and graveyard of a creature, an artifact and an instant. */
function setUp() {
  const t = table();
  const spirit = spawn(t.game, "Spirit of Resilience");
  const bears = toGraveyard(t.game, "Grizzly Bears");
  const ring = toGraveyard(t.game, "Sol Ring");
  const bolt = toGraveyard(t.game, "Lightning Bolt");
  return { ...t, spirit, bears, ring, bolt };
}

describe("Spirit of Resilience", () => {
  it("a graveyard exiled at once: one counter, then a copy of the chosen creature card until end of turn", () => {
    const { game, a, spirit, bears, ring } = setUp();
    const seen = pickFromZone(a, bears);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: 0 }, [ref(A)]);
    settle(game);
    // Only the artifact and creature cards are offered, from exile.
    expect([...seen.offered].sort()).toEqual([bears, ring].sort());
    expect(counters(game, spirit)).toBe(1);
    expect(name(game, spirit)).toBe("Grizzly Bears");
    expect(pt(game, spirit)).toEqual({ power: 3, toughness: 3 });
    // It became the copy; nothing entered (rule 707.4) — what the log says.
    expect(game.state.eventLog.filter((e) => e.type === "permanent-copied")).toEqual([
      expect.objectContaining({ object: spirit, copyOf: "Grizzly Bears", became: true }),
    ]);
    // The chosen card stays in exile.
    expect(zone(game, bears)).toBe("exile");
    // Until end of turn: itself again, its counter kept.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(name(game, spirit)).toBe("Spirit of Resilience");
    expect(pt(game, spirit)).toEqual({ power: 3, toughness: 3 });
  });

  it("may copy nothing", () => {
    const { game, a, spirit } = setUp();
    pickFromZone(a);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: 0 }, [ref(A)]);
    settle(game);
    expect(counters(game, spirit)).toBe(1);
    expect(name(game, spirit)).toBe("Spirit of Resilience");
  });

  it("a card returned to the battlefield is found there, and copied as the card it is", () => {
    const { game, a, spirit, ring } = setUp();
    const seen = pickFromZone(a, ring);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(ring)]);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
    expect(seen.offered).toEqual([ring]);
    expect(name(game, spirit)).toBe("Sol Ring");
    // A copy of an artifact card: no longer a creature.
    expect(game.state.objects[spirit].counters["+1/+1"]).toBe(1);
  });

  it("can't find cards that went to a hidden zone: shuffled into the library, nothing is asked", () => {
    const { game, a, spirit } = setUp();
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    game.debugApplyEffect(A, { kind: "shuffle-graveyard-into-library", target: "you" }, []);
    settle(game);
    expect(counters(game, spirit)).toBe(1);
    expect(asked).toBe(0);
    expect(name(game, spirit)).toBe("Spirit of Resilience");
  });

  it("nor a card that has moved on since: exiled, then gone back to a graveyard before it resolves", () => {
    const { game, a, spirit, bears } = setUp();
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    // The trigger waits on the stack; the card leaves exile for a graveyard.
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(counters(game, spirit)).toBe(1);
    expect(asked).toBe(0);
  });
});
