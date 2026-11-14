/**
 * A spell copied by a player other than the one whose effect offers it
 * (rule 707.10): an `each-player-may` whose effect is a `copy-spell` of
 * `"trigger-spell"` — the copy is the asked player's, its new targets theirs
 * to choose (707.10c). Curse of Echoes' "each other player may copy that
 * spell" (`otherThan` the caster, asked from the active player — its
 * rulings) and Parnesse, the Subtle Brush's "whenever you copy a spell, up to
 * one target opponent may also copy that spell", both from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, lands, life, pickModes, pickTargets, settle, spawn, table, toHand, toStep } from "./harness.js";

const curse = (game: Game, on: PlayerId): ObjectId => {
  lands(game, "Island", 5);
  const card = toHand(game, "Curse of Echoes");
  cast(game, card, { targets: [{ kind: "player", player: on }] });
  return card;
};

describe("Curse of Echoes", () => {
  it("each other player may copy the enchanted player's instant, choosing its new targets", () => {
    const { game, a, b, c } = table({ players: 3 });
    curse(game, B);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    // Alice copies it at Bob; Carol declines.
    pickModes(a, 0);
    pickTargets(a, B);
    pickModes(c);
    pickTargets(b, A);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [{ kind: "player", player: A }] });
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
  });

  it("asks nobody about a creature spell, and never the enchanted player", () => {
    const { game, b } = table({ players: 2 });
    curse(game, B);
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 2, B);
    let bobAsked = 0;
    b.chooseModesFn = () => {
      bobAsked += 1;
      return [0];
    };
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(bobAsked).toBe(0);
  });

  it("both other players copying: two copies, each its controller's", () => {
    const { game, a, b, c } = table({ players: 3 });
    curse(game, B);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    pickModes(a, 0);
    pickModes(c, 0);
    pickTargets(a, B);
    pickTargets(c, B);
    pickTargets(b, A);
    const from = game.state.eventLog.length;
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [{ kind: "player", player: A }] });
    // In turn order from the active player, who is the enchanted Bob and so
    // makes none: Carol's copy, then Alice's (which resolves first).
    const copiers = game.state.eventLog
      .slice(from)
      .flatMap((event) => (event.type === "spell-copied" ? [event.controller] : []));
    expect(copiers).toEqual([C, A]);
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(17);
  });
});

describe("Parnesse, the Subtle Brush", () => {
  it("when you copy a spell, the targeted opponent may copy it too", () => {
    const { game, a, b } = table();
    spawn(game, "Parnesse, the Subtle Brush", A);
    spawn(game, "Swarm Intelligence", A);
    lands(game, "Mountain", 1);
    // Alice copies her Bolt (Swarm Intelligence), then targets Bob with
    // Parnesse's trigger; Bob copies it at Alice.
    pickModes(a, 0);
    pickTargets(a, B);
    pickModes(b, 0);
    pickTargets(b, A);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    settle(game);
    // Bob took the original and Alice's copy; Alice took Bob's, which Bob
    // paid 4 life for: his copy targeting Alice is an opponent's spell
    // becoming her target, so Parnesse's first ability asked.
    expect(life(game, B)).toBe(10);
    expect(life(game, A)).toBe(17);
  });

  it("counters an opponent's spell targeting you unless they pay 4 life", () => {
    const { game, b } = table();
    spawn(game, "Parnesse, the Subtle Brush", A);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [{ kind: "player", player: A }] });
    settle(game);
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(17);
  });
});
