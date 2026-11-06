/**
 * "You may play lands and cast spells from the top of your library. If you
 * cast a spell this way, pay life equal to its mana value rather than pay its
 * mana cost" (Bolas's Citadel): a `castFromLibraryTop` permission with
 * `payLifeManaValue` — an alternative cost (rule 118.9), the only way that
 * permission allows, X 0 (107.3b), additional costs still paid (118.9d), and
 * beside another permission (Future Sight) one more way to cast the card.
 * And the Citadel's "{T}, Sacrifice ten nonland permanents", which it may pay
 * with itself (its ruling).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, cast, lands, life, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offers = (game: Game, card: ObjectId, player: PlayerId = A): CastOffer[] =>
  game.legalActions(player).filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);

describe("Bolas's Citadel — spells off the top for life", () => {
  it("casts the top card for life equal to its mana value, and no other way", () => {
    const { game } = table();
    spawn(game, "Bolas's Citadel");
    const forests = lands(game, "Forest", 4);
    const bears = toLibrary(game, "Grizzly Bears");
    const [offer, ...rest] = offers(game, bears);
    expect(rest).toEqual([]);
    expect(offer.via).toBe("library-top");
    expect(offer.altCost).toBe(true);
    expect(offer.altCostText).toBe("pay 2 life");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "library-top" })).toMatch(
      /only by paying life/,
    );
    cast(game, bears, { via: "library-top", altCost: true });
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(18);
    // Lands untouched: nothing but life was paid.
    expect(forests.some((id) => game.state.objects[id].tapped === true)).toBe(false);
  });

  it("needs no mana, only the life", () => {
    const { game } = table();
    spawn(game, "Bolas's Citadel");
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw");
    cast(game, dreadmaw, { via: "library-top", altCost: true });
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(life(game, A)).toBe(14);
  });

  it("not without the life to pay", () => {
    const { game } = table({ life: 5 });
    spawn(game, "Bolas's Citadel");
    const dreadmaw = toLibrary(game, "Colossal Dreadmaw");
    expect(offers(game, dreadmaw)).toEqual([]);
  });

  it("keeps the spell's timing: a creature only in a main phase, an instant in the upkeep", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Bolas's Citadel");
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offers(game, bears)).toEqual([]);
    const bolt = toLibrary(game, "Lightning Bolt");
    expect(offers(game, bolt).map((o) => o.altCostText)).toEqual(["pay 1 life"]);
  });

  it("an X spell is cast with X 0", () => {
    const { game } = table();
    spawn(game, "Bolas's Citadel");
    lands(game, "Mountain", 5);
    const blaze = toLibrary(game, "Blaze");
    const [offer] = offers(game, blaze);
    expect(offer.altCostText).toBe("pay 1 life");
    expect(offer.xCost).toBeUndefined();
    cast(game, blaze, { via: "library-top", altCost: true, targets: [ref(B)] });
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });

  it("pays only the life for a card with an alternative cost of its own (Gush)", () => {
    const { game } = table();
    spawn(game, "Bolas's Citadel");
    const islands = lands(game, "Island", 2);
    const gush = toLibrary(game, "Gush");
    const [offer, ...rest] = offers(game, gush);
    expect(rest).toEqual([]);
    expect(offer.altCostText).toBe("pay 5 life");
    cast(game, gush, { via: "library-top", altCost: true, altCostIndex: offer.altCostIndex });
    expect(life(game, A)).toBe(15);
    expect(islands.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
  });

  it("plays a land off the top with a land play, for nothing", () => {
    const { game } = table();
    spawn(game, "Bolas's Citadel");
    const forest = toLibrary(game, "Forest");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === forest)).toBe(true);
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
  });
});

describe("beside Future Sight: either permission", () => {
  it("offers the mana cost and the life, and pays the one chosen", () => {
    const { game } = table();
    spawn(game, "Bolas's Citadel");
    spawn(game, "Future Sight");
    const forests = lands(game, "Forest", 2);
    const bears = toLibrary(game, "Grizzly Bears");
    const all = offers(game, bears);
    expect(all.map((o) => o.altCost === true)).toEqual([false, true]);
    const life2 = all[1];
    expect(life2.altCostText).toBe("pay 2 life");
    cast(game, bears, { via: "library-top" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    expect(forests.every((id) => game.state.objects[id].tapped === true)).toBe(true);

    const more = toLibrary(game, "Grizzly Bears");
    // No mana left: the life only.
    const [byLife, ...none] = offers(game, more);
    expect(none).toEqual([]);
    cast(game, more, { via: "library-top", altCost: true, altCostIndex: byLife.altCostIndex });
    expect(zone(game, more)).toBe("battlefield");
    expect(life(game, A)).toBe(18);
  });
});

describe("{T}, Sacrifice ten nonland permanents: each opponent loses 10 life", () => {
  it("may sacrifice the Citadel itself, and drains every opponent", () => {
    const { game } = table({ players: 3 });
    const citadel = spawn(game, "Bolas's Citadel");
    // Ten others besides it, so which ten is a choice.
    const [spared, ...others] = Array.from({ length: 10 }, () => spawn(game, "Grizzly Bears"));
    const land = spawn(game, "Forest");
    activate(game, citadel, 0, { settle: false });
    const asked = game.legalActions(A).find((a) => a.kind === "sacrifice");
    expect(asked?.kind === "sacrifice" && asked.count).toBe(10);
    const eligible = asked?.kind === "sacrifice" ? asked.eligible : [];
    expect(eligible).toContain(citadel);
    expect(eligible).not.toContain(land);
    game.dispatch({ type: "sacrifice", player: A, permanents: [citadel, ...others] });
    settle(game);
    expect(zone(game, citadel)).toBe("graveyard");
    expect(zone(game, spared)).toBe("battlefield");
    expect(life(game, B)).toBe(10);
    expect(life(game, C)).toBe(10);
    expect(life(game, A)).toBe(20);
  });

  it("isn't offered with nine", () => {
    const { game } = table();
    const citadel = spawn(game, "Bolas's Citadel");
    for (let i = 0; i < 8; i += 1) spawn(game, "Grizzly Bears");
    expect(game.legalActions(A).some((a) => a.kind === "activate-ability" && a.source === citadel)).toBe(false);
  });
});
