/**
 * "If a spell or ability an opponent controls causes you to discard this card,
 * put it onto the battlefield instead of putting it into your graveyard"
 * (`discardedByOpponentEnters` — Obstinate Baloth, Dodecapod): the opponent's
 * spell, whoever chose the card; never your own spell, a cost, or cleanup. It's
 * still a discard. And the triggers on the same cause: "when … causes you to
 * discard this card" returning it from where the discard put it (Quagnoth), and
 * "whenever … causes you to discard a card", once per card (Spiritual Focus).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameObject } from "../state.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const prefer =
  (...ids: readonly ObjectId[]) =>
  (h: readonly GameObject[], n: number): ObjectId[] =>
    [...ids.filter((id) => h.some((o) => o.id === id)), ...h.map((o) => o.id).filter((id) => !ids.includes(id))].slice(0, n);

const mindRot = (game: Game, caster: PlayerId, victim: PlayerId): void => {
  lands(game, "Swamp", 3, caster);
  cast(game, toHand(game, "Mind Rot", caster), { player: caster, targets: [ref(victim)] });
};

describe("put it onto the battlefield instead", () => {
  it("Obstinate Baloth: an opponent's Mind Rot, you choosing; it enters and its trigger fires", () => {
    const { game, a } = table({ deck: "Swamp" });
    const baloth = toHand(game, "Obstinate Baloth");
    const other = toHand(game, "Grizzly Bears");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(baloth, other);
    mindRot(game, B, A);
    expect(zone(game, baloth)).toBe("battlefield");
    expect(game.state.objects[baloth].controller).toBe(A);
    expect(zone(game, other)).toBe("graveyard");
    expect(life(game)).toBe(24);
    expect(graveyard(game)).not.toContain(baloth);
  });

  it("an opponent's Thoughtseize choosing it counts too (the ruling)", () => {
    const { game, b } = table({ deck: "Swamp" });
    const baloth = toHand(game, "Obstinate Baloth");
    toHand(game, "Lightning Bolt");
    nextTurn(game);
    lands(game, "Swamp", 1, B);
    pickFromZone(b, baloth);
    cast(game, toHand(game, "Thoughtseize", B), { player: B, targets: [ref(A)] });
    expect(zone(game, baloth)).toBe("battlefield");
  });

  it("Dodecapod: with two +1/+1 counters", () => {
    const { game, a } = table({ deck: "Swamp" });
    const pod = toHand(game, "Dodecapod");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(pod);
    mindRot(game, B, A);
    expect(zone(game, pod)).toBe("battlefield");
    expect(counters(game, pod)).toBe(2);
    expect(game.state.objects[pod].controller).toBe(A);
  });

  it("at random: an opponent's Hymn to Tourach", () => {
    const { game } = table({ deck: "Swamp" });
    while (hand(game).length > 0) game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    const pod = toHand(game, "Dodecapod");
    nextTurn(game);
    while (hand(game).length > 1) game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(A)]);
    expect(hand(game)).toContain(pod);
    lands(game, "Swamp", 2, B);
    cast(game, toHand(game, "Hymn to Tourach", B), { player: B, targets: [ref(A)] });
    expect(zone(game, pod)).toBe("battlefield");
  });

  it("each discarding their hand to an opponent's Wheel of Fortune, all of it in one go", () => {
    const { game } = table({ players: 3, deck: "Swamp" });
    const pods = [toHand(game, "Dodecapod"), toHand(game, "Dodecapod", C)];
    const own = toHand(game, "Dodecapod", B);
    nextTurn(game);
    lands(game, "Mountain", 3, B);
    cast(game, toHand(game, "Wheel of Fortune", B), { player: B });
    expect(pods.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
    // Its caster's own goes to the graveyard, as cleanup's would.
    expect(zone(game, own)).toBe("graveyard");
  });

  it("a discard held until each player has chosen (rule 101.4) still knows its cause", () => {
    const { game, a } = table({ deck: "Swamp" });
    const baloth = toHand(game, "Obstinate Baloth");
    nextTurn(game);
    lands(game, "Island", 3, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Arc of Fortune", B), { player: B });
    expect(zone(game, baloth)).toBe("battlefield");
  });

  it("not your own spell, or your own ability", () => {
    const { game, a } = table({ deck: "Swamp" });
    const baloths = [toHand(game, "Obstinate Baloth"), toHand(game, "Obstinate Baloth")];
    a.chooseDiscardsFn = prefer(...baloths);
    mindRot(game, A, A);
    expect(baloths.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    expect(life(game)).toBe(20);

    const third = toHand(game, "Dodecapod");
    a.chooseDiscardsFn = prefer(third);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(A)]);
    settle(game);
    expect(zone(game, third)).toBe("graveyard");
  });

  it("cleanup's discard isn't caused by anything", () => {
    const { game, a } = table({ deck: "Swamp" });
    const baloth = toHand(game, "Obstinate Baloth");
    game.state.players[A].maxHandSize = 7;
    while (hand(game).length < 8) toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = prefer(baloth);
    nextTurn(game);
    expect(zone(game, baloth)).toBe("graveyard");
  });

  it("it's still a discard: Bone Miser sees it", () => {
    const { game, a } = table({ deck: "Swamp" });
    spawn(game, "Bone Miser");
    const baloth = toHand(game, "Obstinate Baloth");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(baloth);
    const zombies = (): number => game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Zombie Token").length;
    const before = zombies();
    lands(game, "Swamp", 3, B);
    cast(game, toHand(game, "Mind Rot", B), { player: B, targets: [ref(A)] });
    expect(zone(game, baloth)).toBe("battlefield");
    // A creature card discarded: Bone Miser's Zombie.
    expect(zombies()).toBe(before + 1);
  });

  it("taken over a Leyline of the Void, which would exile it instead of the graveyard", () => {
    const { game, a } = table({ deck: "Swamp" });
    spawn(game, "Leyline of the Void", B);
    const baloth = toHand(game, "Obstinate Baloth");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(baloth);
    mindRot(game, B, A);
    expect(zone(game, baloth)).toBe("battlefield");
  });
});

describe("the same cause, as a trigger", () => {
  it("Quagnoth returns to your hand from the graveyard, on an opponent's spell only", () => {
    const { game, a } = table({ deck: "Swamp" });
    const quagnoth = toHand(game, "Quagnoth");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(quagnoth);
    mindRot(game, B, A);
    expect(zone(game, quagnoth)).toBe("hand");
  });

  it("Quagnoth stays when you caused it", () => {
    const { game, a } = table({ deck: "Swamp" });
    const quagnoth = toHand(game, "Quagnoth");
    toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = prefer(quagnoth);
    mindRot(game, A, A);
    expect(zone(game, quagnoth)).toBe("graveyard");
  });

  it("Quagnoth under a Leyline of the Void: exiled, and returned from there (the ruling)", () => {
    const { game, a } = table({ deck: "Swamp" });
    spawn(game, "Leyline of the Void", B);
    const quagnoth = toHand(game, "Quagnoth");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(quagnoth);
    mindRot(game, B, A);
    expect(zone(game, quagnoth)).toBe("hand");
  });

  it("Quagnoth does nothing once it has left its new zone (the ruling)", () => {
    const { game, a } = table({ deck: "Swamp" });
    const quagnoth = toHand(game, "Quagnoth");
    toHand(game, "Grizzly Bears");
    nextTurn(game);
    a.chooseDiscardsFn = prefer(quagnoth);
    lands(game, "Swamp", 3, B);
    cast(game, toHand(game, "Mind Rot", B), { player: B, targets: [ref(A)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.some((id) => s.objects[id].kind === "ability"));
    expect(zone(game, quagnoth)).toBe("graveyard");
    // In response: exiled from the graveyard.
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(quagnoth)]);
    settle(game);
    expect(zone(game, quagnoth)).toBe("exile");
  });

  it("Spiritual Focus: 2 life and a card you may draw, per card, on an opponent's cause only", () => {
    const { game, a } = table({ deck: "Swamp" });
    spawn(game, "Spiritual Focus");
    const cards = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    nextTurn(game);
    a.chooseDiscardsFn = prefer(...cards);
    pickModes(a, 0);
    const before = hand(game).length;
    mindRot(game, B, A);
    expect(life(game)).toBe(24);
    expect(hand(game).length).toBe(before - 2 + 2);

    const own = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = prefer(own);
    game.debugApplyEffect(A, { kind: "discard", target: 0, amount: 1 }, [ref(A)]);
    settle(game);
    expect(life(game)).toBe(24);
  });
});
