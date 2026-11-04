/**
 * `leaves-battlefield`'s `batched`: "whenever one or more … leave the
 * battlefield", once per simultaneous event, each read as it last existed and
 * seen by a permanent leaving in that event too (rule 603.10a). Dour Port-Mage,
 * Nefarious Imp.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, cast, destroy, hand, lands, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const bears = (game: Game, n: number, player = A): ObjectId[] => Array.from({ length: n }, () => spawn(game, "Grizzly Bears", player));

const exileOne = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(id)]);
  settle(game);
};

describe("Dour Port-Mage", () => {
  it("draws once for two creatures leaving together", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    const two = bears(game, 2);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "return-to-hand-all", filter: { subtype: "Bear" } }, []);
    settle(game);
    expect(zone(game, two[0])).toBe("hand");
    // Both Bears back, and one card drawn.
    expect(hand(game).length).toBe(before + 3);
  });

  it("twice for two leaving apart", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    const two = bears(game, 2);
    const before = hand(game).length;
    for (const id of two) exileOne(game, id);
    expect(hand(game).length).toBe(before + 2);
  });

  it("not for one that dies, or for one of an opponent's", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    const [mine] = bears(game, 1);
    const [theirs] = bears(game, 1, B);
    const before = hand(game).length;
    destroy(game, mine);
    settle(game);
    exileOne(game, theirs);
    expect(hand(game).length).toBe(before);
  });

  it("not for itself alone", () => {
    const { game } = table();
    const mage = spawn(game, "Dour Port-Mage");
    const before = hand(game).length;
    exileOne(game, mage);
    expect(hand(game).length).toBe(before);
  });

  it("a creature that left with it: it still triggers (its ruling)", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    bears(game, 1);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "exile-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("one that dies beside one that doesn't: it draws for the one", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    const stays = bears(game, 2);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "destroy", target: 1 }] }, [
      ref(stays[0]),
      ref(stays[1]),
    ]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("tokens leaving count, a stack of them still one draw", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    game.debugApplyEffect(A, { kind: "create-token", token: "Merfolk Token", count: 3 }, []);
    settle(game);
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "exile-all", filter: { subtype: "Merfolk" } }, []);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("commanders asked about a move to a hand are part of the event: one draw, after the answers (rule 903.9b)", () => {
    const { game } = table();
    spawn(game, "Dour Port-Mage");
    const [plain, one, two] = bears(game, 3);
    game.state.objects[one].isCommander = true;
    game.state.objects[two].isCommander = true;
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "return-to-hand-all", filter: { subtype: "Bear" } }, []);
    settle(game);
    expect(zone(game, plain)).toBe("hand");
    expect(game.eventsOfType("commander-zone-decision")).toHaveLength(2);
    const handed = [one, two].filter((id) => zone(game, id) === "hand").length;
    expect(hand(game).length).toBe(before + 1 + handed + 1);
  });

  it("a lone commander returned draws once its owner has answered", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const mage = spawn(game, "Dour Port-Mage");
    const [commander] = bears(game, 1);
    game.state.objects[commander].isCommander = true;
    const before = hand(game).length;
    activate(game, mage, 0, { targets: [ref(commander)] });
    const handed = zone(game, commander) === "hand" ? 1 : 0;
    expect(hand(game).length).toBe(before + handed + 1);
  });

  it("its activated ability returns another creature, and that draws", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const mage = spawn(game, "Dour Port-Mage");
    const [one] = bears(game, 1);
    const before = hand(game).length;
    activate(game, mage, 0, { targets: [ref(one)] });
    expect(zone(game, one)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Nefarious Imp", () => {
  const scries = (game: Game): number => game.eventsOfType("scried").length;

  it("scries once for permanents of any type leaving together, itself among them", () => {
    const { game } = table();
    spawn(game, "Nefarious Imp");
    spawn(game, "Forest");
    bears(game, 1);
    game.debugApplyEffect(A, { kind: "exile-all", filter: { typesAnyOf: ["creature", "land"] } }, []);
    settle(game);
    expect(scries(game)).toBe(1);
  });

  it("a wrath is one event, and a lone death another", () => {
    const { game, a } = table();
    spawn(game, "Nefarious Imp");
    bears(game, 2);
    lands(game, "Plains", 4);
    pickTargets(a);
    cast(game, toHand(game, "Wrath of God"));
    expect(scries(game)).toBe(1);
    spawn(game, "Nefarious Imp");
    const [one] = bears(game, 1);
    destroy(game, one);
    settle(game);
    expect(scries(game)).toBe(2);
  });
});
