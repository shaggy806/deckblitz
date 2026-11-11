/**
 * A `cast-now` reading "from your hand, from your graveyard, or from among
 * cards you own in exile" (`from.zones`' `"exile"`, rule 406.3b for a
 * face-down one) — Kaya the Inexorable's emblem — and the rest of her text.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  counters,
  destroy,
  hand,
  loyalty,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Kaya the Inexorable's emblem", () => {
  it("offers legendary cards from the hand, the graveyard and the exiled cards you own, and casts one free", () => {
    const { game, a } = table({ deck: "Forest" });
    const kaya = spawn(game, "Kaya the Inexorable");
    const inHand = toHand(game, "Isamaru, Hound of Konda");
    const inYard = toGraveyard(game, "Isamaru, Hound of Konda");
    const exiled = toExile(game, "Isamaru, Hound of Konda");
    const bears = toExile(game, "Grizzly Bears");
    const theirs = toExile(game, "Isamaru, Hound of Konda", B);
    // Face down: one she may look at, one she may not (rule 406.3b).
    const seen = toExile(game, "Isamaru, Hound of Konda");
    game.state.objects[seen].exiledFaceDown = { lookers: [A] };
    const unseen = toExile(game, "Isamaru, Hound of Konda");
    game.state.objects[unseen].exiledFaceDown = { lookers: [B] };
    loyalty(game, kaya, -7, { atLeast: 7 });
    let offered: readonly ObjectId[] = [];
    a.chooseCastNowFn = (_v, o) => {
      offered = o.cards;
      return { type: "cast-spell", player: A, card: seen, targets: [], via: "effect", free: true };
    };
    toStep(game, "upkeep");
    settle(game);
    // Kaya herself went to the graveyard with no loyalty left: legendary too.
    expect(zone(game, kaya)).toBe("graveyard");
    expect([...offered].sort()).toEqual([kaya, inHand, inYard, exiled, seen].sort());
    expect(offered).not.toContain(bears);
    expect(offered).not.toContain(theirs);
    expect(offered).not.toContain(unseen);
    expect(zone(game, seen)).toBe("battlefield");
    expect(zone(game, exiled)).toBe("exile");
    expect(zone(game, inHand)).toBe("hand");
    expect(zone(game, inYard)).toBe("graveyard");
  });

  it("is a may: declined, nothing is cast", () => {
    const { game } = table({ deck: "Forest" });
    const kaya = spawn(game, "Kaya the Inexorable");
    const exiled = toExile(game, "Isamaru, Hound of Konda");
    loyalty(game, kaya, -7, { atLeast: 7 });
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, exiled)).toBe("exile");
  });
});

describe("Kaya the Inexorable's +1 and −3", () => {
  it("the creature that dies comes back to its owner's hand and its controller makes a Spirit", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya the Inexorable");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, kaya, 1, { targets: [ref(bears)] });
    expect(counters(game, bears, "ghostform")).toBe(1);
    expect(counters(game, kaya, "loyalty")).toBe(6);
    destroy(game, bears);
    expect(hand(game)).toContain(bears);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });

  it("put into exile, it comes back too; −3 exiles a nonland permanent", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya the Inexorable");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    loyalty(game, kaya, 1, { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    expect(hand(game)).toContain(bears);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
    toStep(game, "precombat-main");
    loyalty(game, kaya, -3, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
  });

  it("with no target, only the loyalty goes up; a token can't be the target", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya the Inexorable");
    game.debugApplyEffect(A, { kind: "create-token", token: "Spirit Token", count: 1 }, []);
    const [spirit] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].isToken);
    expect(() => loyalty(game, kaya, 1, { targets: [ref(spirit)] })).toThrow(/target/i);
    loyalty(game, kaya, 1, { targets: [null] });
    expect(counters(game, kaya, "loyalty")).toBe(6);
  });
});
