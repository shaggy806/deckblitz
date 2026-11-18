/**
 * "Attacks a player each combat if able" (Nahiri, the Unforgiving's +1): a
 * `must-attack` aimed at `{ defender: {} }` — every player, never a
 * planeswalker or battle — so it's obeyed only by attacking a player (rule
 * 508.1d), and binds only while one can be attacked. Her 0 exiles a card from
 * her controller's graveyard with mana value less than her loyalty and makes a
 * hasty token copy, exiled at the next end step.
 */
import { describe, expect, it } from "vitest";

import { defendersForAttacker, mustAttack } from "../combat/eligibility.js";
import { A, B, activate, graveyard, hand, loyalty, nextTurn, ref, spawn, table, toGraveyard, toHand, tokensNamed, toStep, zone } from "./harness.js";

const NAHIRI = "Nahiri, the Unforgiving";

describe("Nahiri, the Unforgiving", () => {
  it("+1: the creature must attack a player, not a planeswalker, until her controller's next turn", () => {
    const { game } = table();
    const nahiri = spawn(game, NAHIRI);
    const bears = spawn(game, "Grizzly Bears", B, { sick: false });
    const walker = spawn(game, "Saheeli Rai", A);
    loyalty(game, nahiri, 1, { targets: [ref(bears)] });
    nextTurn(game); // bob's
    expect(mustAttack(game.state, game.registry, bears)).toBe(true);
    // Alice and Saheeli could both be attacked; only alice obeys it.
    expect(defendersForAttacker(game.state, game.registry, B, bears)).toEqual([A]);
    expect(walker).toBeDefined();
    nextTurn(game); // alice's: it has ended
    expect(mustAttack(game.state, game.registry, bears)).toBe(false);
  });

  it("+1 with no player to attack (only a planeswalker), it doesn't bind", () => {
    const { game } = table();
    const nahiri = spawn(game, NAHIRI);
    const bears = spawn(game, "Grizzly Bears", B, { sick: false });
    loyalty(game, nahiri, 1, { targets: [ref(bears)] });
    nextTurn(game);
    // Alice can't be attacked by it (a Vow-style restriction stands in:
    // "can't attack you" on the creature), so nothing obeys the requirement.
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: [{ kind: "cant-attack", at: "you" }] }, [
      ref(bears),
    ]);
    spawn(game, "Saheeli Rai", A);
    expect(mustAttack(game.state, game.registry, bears)).toBe(false);
  });

  it("the other +1: discard a card, then draw a card", () => {
    const { game } = table();
    const nahiri = spawn(game, NAHIRI);
    toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    const discarded = graveyard(game).length;
    activate(game, nahiri, 1);
    expect(graveyard(game).length).toBe(discarded + 1);
    expect(hand(game).length).toBe(before);
  });

  it("0: a creature card with mana value less than her loyalty becomes a hasty token, exiled at end step", () => {
    const { game } = table();
    const nahiri = spawn(game, NAHIRI); // loyalty 5
    const giant = toGraveyard(game, "Hill Giant"); // mana value 4
    loyalty(game, nahiri, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Hill Giant", A)).toBe(1);
    toStep(game, "cleanup");
    expect(tokensNamed(game, "Hill Giant", A)).toBe(0);
  });

  it("0: an Equipment card can be copied; mana value equal to her loyalty can't be targeted", () => {
    const { game } = table();
    const nahiri = spawn(game, NAHIRI);
    const elemental = toGraveyard(game, "Air Elemental"); // mana value 5
    expect(() => loyalty(game, nahiri, 0, { targets: [ref(elemental)] })).toThrow(/target/i);
    const splitter = toGraveyard(game, "Bonesplitter");
    loyalty(game, nahiri, 0, { targets: [ref(splitter)] });
    expect(zone(game, splitter)).toBe("exile");
    expect(tokensNamed(game, "Bonesplitter", A)).toBe(1);
  });
});
