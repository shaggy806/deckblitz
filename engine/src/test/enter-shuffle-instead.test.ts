/**
 * "Its owner shuffles it into their library instead" for a permanent about to
 * enter (rules 614.6, 701.24a — `OthersEnterReplacement.shuffleInstead`):
 * Don't Blink's "until end of turn, if one or more creatures would enter from
 * exile or after being cast from exile, their owners shuffle them into their
 * libraries instead", a resolved replacement (611.2c) judged as each creature
 * would exist on the battlefield (614.12).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, lands, nextTurn, ref, settle, spawn, table, toExile, toHand, tokensNamed, zone } from "./harness.js";

const blink = (game: Game): void => {
  lands(game, "Island", 2);
  cast(game, toHand(game, "Don't Blink"));
};

describe("Don't Blink", () => {
  it("a creature flickered afterwards is shuffled into its owner's library", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    blink(game);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    const card = game.state.objects[bears];
    expect(card.zone).toBe("library");
    expect(game.state.zones.perPlayer[A].library).toContain(bears);
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears")).toHaveLength(0);
  });

  it("reaches an opponent's card put onto the battlefield from exile, into its owner's library", () => {
    const { game } = table();
    blink(game);
    const theirs = toExile(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [{ kind: "object", object: theirs }]);
    settle(game);
    expect(zone(game, theirs)).toBe("library");
    expect(game.state.zones.perPlayer[B].library).toContain(theirs);
  });

  it("a creature spell cast from exile is shuffled away as it would resolve", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = toHand(game, "Bonecrusher Giant");
    const stomp = game
      .legalActions(A)
      .find((a): a is Extract<typeof a, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === giant && (a.face ?? 0) !== 0);
    expect(stomp).toBeDefined();
    cast(game, giant, { face: stomp!.face, targets: [ref(B)] });
    expect(zone(game, giant)).toBe("exile");
    blink(game);
    const creature = game
      .legalActions(A)
      .find((a): a is Extract<typeof a, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === giant);
    expect(creature).toBeDefined();
    cast(game, giant, { ...(creature!.via !== undefined ? { via: creature!.via } : {}) });
    expect(zone(game, giant)).toBe("library");
  });

  it("a creature cast from hand, one put there from elsewhere, and tokens enter as usual", () => {
    const { game } = table();
    blink(game);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, spawn(game, "Hill Giant", B))).toBe("battlefield");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("ends with the turn", () => {
    const { game } = table();
    blink(game);
    nextTurn(game);
    nextTurn(game);
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });
});
