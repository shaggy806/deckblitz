/**
 * "If that spell is countered this way, its controller may …" (Fold into
 * Aether): the counter's `ifCountered`, done by the countered spell's
 * controller (`as-player` `controllerOf: 0`, read from its last known
 * information, rule 608.2h). Written from the Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, controller, lands, pickFromZone, ref, spawn, table, toHand, zone } from "./harness.js";

/** Bob's instant `name` aimed at `target`, left on the stack with Alice to act. */
const bobCasts = (game: Game, name: string, target: ObjectId | typeof A, mana: string): ObjectId => {
  lands(game, mana, 2, B);
  lands(game, "Island", 5);
  // Alice's own instant, so Bob gets priority with something on the stack.
  cast(game, toHand(game, "Opt"), { settle: false });
  game.dispatch({ type: "pass-priority", player: A });
  const spell = toHand(game, name, B);
  cast(game, spell, { player: B, targets: [ref(target)], settle: false });
  game.dispatch({ type: "pass-priority", player: B });
  return spell;
};

describe("Fold into Aether", () => {
  it("counters an opponent's spell, and that player may put a creature card from their hand onto the battlefield", () => {
    const { game, b } = table();
    const bolt = bobCasts(game, "Lightning Bolt", A, "Mountain");
    const bears = toHand(game, "Grizzly Bears", B);
    const mine = toHand(game, "Hill Giant");
    const { offered } = pickFromZone(b, bears);
    cast(game, toHand(game, "Fold into Aether"), { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    // Bob chose from his own hand, never Alice's.
    expect(offered).not.toContain(mine);
    expect(zone(game, mine)).toBe("hand");
  });

  it("countering your own spell puts the creature under you (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    cast(game, toHand(game, "Fold into Aether"), { targets: [ref(opt)] });
    expect(zone(game, opt)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
  });

  it("a spell that can't be countered isn't countered this way: nothing happens (the ruling)", () => {
    const { game, b } = table();
    const victim = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    const decay = bobCasts(game, "Abrupt Decay", victim, "Forest");
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(b, bears);
    cast(game, toHand(game, "Fold into Aether"), { targets: [ref(decay)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
  });
});
