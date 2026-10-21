import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, cast, hand, life, named, nextTurn, pickFromZone, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// The pitch spells: "you may [pay 1 life and] exile a blue card from your
// hand rather than pay this spell's mana cost" (Force of Will, the MH1
// Forces' "if it's not your turn", Fury of the Horde's two red cards) and the
// Incarnations' "Evoke—Exile a white card from your hand" (Solitude) — an
// alternative cost (rule 118.9) whose exile is chosen once the spell is on
// the stack (601.2h), offered only when it can be paid.

const offers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card);
const altOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  offers(game, card, player).filter((a) => a.kind === "cast-spell" && a.altCost === true);
const evokeOffers = (game: Game, card: ObjectId) =>
  offers(game, card).filter((a) => a.kind === "cast-spell" && a.evoke === true);

describe("pitch costs: exile a card from your hand rather than pay the mana cost", () => {
  it("Force of Will: pay 1 life and exile the blue card you choose, no mana", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears");
    const will = toHand(game, "Force of Will");
    const opt1 = toHand(game, "Opt");
    const opt2 = toHand(game, "Opt");
    // The Bears are cast for free here to have a spell to counter.
    spawn(game, "Forest");
    spawn(game, "Forest");
    cast(game, bears, { settle: false });
    expect(altOffers(game, will)).toHaveLength(1);
    // Only the hand's blue cards, never Force of Will itself.
    const seen = pickFromZone(a, opt2);
    const before = hand(game).length;
    cast(game, will, { targets: [ref(bears)], altCost: true });
    expect(seen.offered.slice().sort()).toEqual([opt1, opt2].sort());
    expect(zone(game, opt2)).toBe("exile");
    expect(zone(game, opt1)).toBe("hand");
    expect(hand(game).length).toBe(before - 2);
    expect(life(game)).toBe(19);
    expect(zone(game, bears)).toBe("graveyard");
    // The pitched card isn't linked to the spell (it's no "exiled with").
    expect(game.state.objects[opt2].exiledWith).toBeUndefined();
  });

  it("isn't offered without another card of the colour to exile", () => {
    const { game } = table();
    const will = toHand(game, "Force of Will");
    toHand(game, "Grizzly Bears");
    const bears = toHand(game, "Grizzly Bears");
    spawn(game, "Forest");
    spawn(game, "Forest");
    cast(game, bears, { settle: false });
    expect(altOffers(game, will)).toHaveLength(0);
    toHand(game, "Opt");
    expect(altOffers(game, will)).toHaveLength(1);
  });

  it("Fury of the Horde needs two red cards besides itself", () => {
    const { game } = table();
    const fury = toHand(game, "Fury of the Horde");
    toHand(game, "Shock");
    expect(altOffers(game, fury)).toHaveLength(0);
    toHand(game, "Shock");
    expect(altOffers(game, fury)).toHaveLength(1);
  });

  it("Force of Vigor: only on an opponent's turn", () => {
    const { game } = table();
    const vigor = toHand(game, "Force of Vigor");
    toHand(game, "Grizzly Bears");
    expect(altOffers(game, vigor)).toHaveLength(0);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    game.advanceUntil((s) => s.priority.holder === A);
    expect(altOffers(game, vigor)).toHaveLength(1);
  });

  it("Force of Rage's two tokens are both sacrificed at your next upkeep", () => {
    const { game } = table();
    const rage = toHand(game, "Force of Rage");
    toHand(game, "Shock");
    nextTurn(game);
    game.advanceUntil((s) => s.priority.holder === A);
    cast(game, rage, { altCost: true });
    expect(named(game, "3/1 Red Elemental Token", A).length).toBeGreaterThan(0);
    nextTurn(game, "draw");
    expect(activePlayerOf(game.state)).toBe(A);
    expect(named(game, "3/1 Red Elemental Token", A)).toHaveLength(0);
  });

  it("Solitude: evoked by exiling a white card, its enters trigger still resolves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const solitude = toHand(game, "Solitude");
    const swords = toHand(game, "Swords to Plowshares");
    expect(evokeOffers(game, solitude)).toHaveLength(1);
    pickFromZone(a, swords);
    cast(game, solitude, { evoke: true, targets: [], settle: false });
    expect(zone(game, swords)).toBe("exile");
    a.chooseTargetsFn = () => [ref(bears)];
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(22);
    // Evoked, it's sacrificed.
    expect(zone(game, solitude)).toBe("graveyard");
  });

  it("an evoke that exiles isn't offered with no other card of its colour", () => {
    const { game } = table();
    const solitude = toHand(game, "Solitude");
    toHand(game, "Opt");
    expect(evokeOffers(game, solitude)).toHaveLength(0);
  });
});
