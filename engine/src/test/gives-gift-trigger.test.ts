/**
 * "Whenever you give a gift" (rule 702.174c — Jolly Gerbils): the
 * `gives-gift` trigger event, announced as `gift-given` where a gift is
 * given. It triggers whenever an instant or sorcery of yours whose gift was
 * promised resolves, and whenever the gift triggered ability of a permanent
 * of yours resolves — not as the gift is promised, and not for a spell that
 * never resolves.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, hand, lands, ref, settle, spawn, table, toHand } from "./harness.js";

describe("gives-gift — Jolly Gerbils", () => {
  it("an instant promised: the gift, then a card for its caster", () => {
    const { game } = table();
    spawn(game, "Jolly Gerbils");
    lands(game, "Plains", 2);
    const truce = toHand(game, "Dawn's Truce");
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    cast(game, truce, { kicked: true });
    expect(hand(game, B).length).toBe(theirs + 1);
    // Dawn's Truce left the hand; the Gerbils drew one.
    expect(hand(game, A).length).toBe(mine);
    expect(game.eventsOfType("gift-given").map((e) => [e.player, e.to])).toEqual([[A, B]]);
  });

  it("not promised: no gift, no card", () => {
    const { game } = table();
    spawn(game, "Jolly Gerbils");
    lands(game, "Plains", 2);
    const truce = toHand(game, "Dawn's Truce");
    const mine = hand(game, A).length;
    cast(game, truce);
    expect(hand(game, A).length).toBe(mine - 1);
    expect(game.eventsOfType("gift-given")).toEqual([]);
  });

  it("a permanent's gift: as its gift trigger resolves, not as it's cast", () => {
    const { game } = table();
    spawn(game, "Jolly Gerbils");
    lands(game, "Forest", 3);
    const shooter = toHand(game, "Scrapshooter");
    const mine = hand(game, A).length;
    cast(game, shooter, { kicked: true, settle: false });
    expect(game.eventsOfType("gift-given")).toEqual([]);
    settle(game);
    expect(game.eventsOfType("gift-given").map((e) => e.source)).toEqual([shooter]);
    expect(hand(game, A).length).toBe(mine);
  });

  it("an opponent's gift isn't yours", () => {
    const { game } = table();
    spawn(game, "Jolly Gerbils", B);
    lands(game, "Plains", 2);
    const truce = toHand(game, "Dawn's Truce");
    const theirs = hand(game, B).length;
    cast(game, truce, { kicked: true });
    // Bob drew the gift alone.
    expect(hand(game, B).length).toBe(theirs + 1);
  });

  it("a promised spell that doesn't resolve gives nothing (702.174j)", () => {
    const { game } = table();
    spawn(game, "Jolly Gerbils");
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears");
    const rally = toHand(game, "Valley Rally");
    const mine = hand(game, A).length;
    cast(game, rally, { kicked: true, targets: [ref(bear)], settle: false });
    // Its only target is gone before it resolves.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bear)]);
    settle(game);
    expect(game.eventsOfType("gift-given")).toEqual([]);
    expect(hand(game, A).length).toBe(mine - 1);
  });
});
