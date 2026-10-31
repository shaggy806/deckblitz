/**
 * "Cast … as though it had flash" (rule 601.3b) generalised past a static of
 * the controller's: to **every player** (`castAsThoughFlashAnyPlayer` —
 * Vernal Equinox, Quick Sliver, Tidal Barracuda), to **the first matching
 * spell each turn** (`castAsThoughFlashFirstEachTurn` — Radagast of
 * Rhosgobel, The Blue Spirit), **for this turn** (a `player-effect`'s
 * `castAsThoughFlash` — Borne Upon a Wind, Emergence Zone, Winding Canyons,
 * Alchemist's Refuge) and for **the next matching spell** (`next` —
 * Quicken, Progenitor's Icon), which the next such spell cast uses up,
 * whenever it's cast. Suspend reads the same permissions (702.62a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, hand, lands, nextTurn, settle, spawn, table, toHand } from "./harness.js";

/** A refusal for timing alone — sorcery timing (rule 307.1) — not for mana. */
const TIMING = /^can only (cast|suspend) .* (on your own turn|during a main phase|while the stack is empty)$/;

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): string | null =>
  game.canDispatch({ type: "cast-spell", player, card, targets: [] });

/** Alice passes in her upkeep, so Bob holds priority there. */
function bobsPriority(game: Game): void {
  game.dispatch({ type: "pass-priority", player: A });
  expect(game.state.priority.holder).toBe(B);
}

const flashGrants = (game: Game): number =>
  (game.state.playerEffects ?? []).filter((e) => e.castAsThoughFlash !== undefined).length;

describe("any player may cast as though it had flash", () => {
  it("Vernal Equinox: its controller and an opponent may cast creature and enchantment spells any time, not sorceries", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Vernal Equinox", A);
    lands(game, "Forest", 2, A);
    lands(game, "Plains", 3, A);
    lands(game, "Island", 3, A);
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toBeNull();
    expect(canCast(game, toHand(game, "Glorious Anthem", A))).toBeNull();
    expect(canCast(game, toHand(game, "Divination", A))).toMatch(TIMING);
    lands(game, "Forest", 2, B);
    lands(game, "Island", 3, B);
    bobsPriority(game);
    expect(canCast(game, toHand(game, "Grizzly Bears", B), B)).toBeNull();
    expect(canCast(game, toHand(game, "Divination", B), B)).toMatch(TIMING);
  });

  it("without it, the opponent's creature spell waits for a main phase", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Forest", 2, B);
    bobsPriority(game);
    expect(canCast(game, toHand(game, "Grizzly Bears", B), B)).toMatch(TIMING);
  });

  it("Quick Sliver: any player's Sliver spells, nothing else", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Quick Sliver", A);
    lands(game, "Forest", 2, B);
    bobsPriority(game);
    expect(canCast(game, toHand(game, "Muscle Sliver", B), B)).toBeNull();
    expect(canCast(game, toHand(game, "Grizzly Bears", B), B)).toMatch(TIMING);
  });

  it("Tidal Barracuda: everyone has flash, but its controller's opponents still can't cast during its controller's turn", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Tidal Barracuda", A);
    lands(game, "Island", 3, A);
    expect(canCast(game, toHand(game, "Divination", A))).toBeNull();
    lands(game, "Island", 3, B);
    const bobs = toHand(game, "Divination", B);
    bobsPriority(game);
    const why = canCast(game, bobs, B);
    expect(why).not.toBeNull();
    expect(why).not.toMatch(TIMING);
    // Bob's own upkeep: his sorcery may be cast as though it had flash.
    nextTurn(game, "upkeep");
    expect(game.state.priority.holder).toBe(B);
    expect(canCast(game, bobs, B)).toBeNull();
  });
});

describe("the first creature spell each turn", () => {
  it("Radagast: the first creature spell costs {2} less and may be cast any time; the second may not", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Radagast of Rhosgobel", A);
    const forests = lands(game, "Forest", 2, A);
    const bears = toHand(game, "Grizzly Bears", A);
    cast(game, bears);
    expect(game.state.objects[bears].zone).toBe("battlefield");
    // One Forest paid {1}{G} less {2}: the other is still untapped.
    expect(forests.filter((id) => game.state.objects[id].tapped).length).toBe(1);
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toMatch(TIMING);
  });

  it("Radagast: a noncreature spell cast first doesn't use it up", () => {
    const { game } = table({ step: "upkeep" });
    spawn(game, "Radagast of Rhosgobel", A);
    lands(game, "Island", 1, A);
    lands(game, "Forest", 1, A);
    cast(game, toHand(game, "Quicken", A));
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toBeNull();
  });

  it("The Blue Spirit: a creature spell cast earlier this turn, before it arrived, was the first", () => {
    const { game } = table();
    lands(game, "Forest", 4, A);
    lands(game, "Island", 3, A);
    lands(game, "Wastes", 4, A);
    cast(game, toHand(game, "Grizzly Bears", A));
    spawn(game, "The Blue Spirit", A);
    // A spell on the stack keeps sorcery timing out.
    cast(game, toHand(game, "Divination", A), { settle: false });
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toMatch(TIMING);
  });

  it("The Blue Spirit: with no creature spell cast yet, one may be cast while the stack isn't empty", () => {
    const { game } = table();
    lands(game, "Forest", 2, A);
    lands(game, "Island", 3, A);
    lands(game, "Wastes", 4, A);
    spawn(game, "The Blue Spirit", A);
    cast(game, toHand(game, "Divination", A), { settle: false });
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toBeNull();
  });

  it("The Blue Spirit: a nontoken creature entering during combat draws a card; a token doesn't", () => {
    const { game } = table({ step: "begin-combat" });
    spawn(game, "The Blue Spirit", A);
    lands(game, "Forest", 2, A);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Grizzly Bears", A));
    // The Bears came to hand and left it, and a card was drawn.
    expect(hand(game, A).length).toBe(before + 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "1/1 Green Dog Token", count: 1 });
    settle(game);
    expect(hand(game, A).length).toBe(before + 1);
  });
});

describe("a flash permission for this turn", () => {
  it("Borne Upon a Wind: every spell this turn, not only the next — and only its controller's", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Island", 8, A);
    lands(game, "Forest", 2, A);
    cast(game, toHand(game, "Borne Upon a Wind", A));
    cast(game, toHand(game, "Divination", A));
    expect(canCast(game, toHand(game, "Divination", A))).toBeNull();
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toBeNull();
    lands(game, "Island", 3, B);
    bobsPriority(game);
    expect(canCast(game, toHand(game, "Divination", B), B)).toMatch(TIMING);
  });

  it("Borne Upon a Wind: it ends with the turn", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Island", 5, A);
    cast(game, toHand(game, "Borne Upon a Wind", A));
    const divination = toHand(game, "Divination", A);
    expect(canCast(game, divination)).toBeNull();
    nextTurn(game, "upkeep");
    expect(flashGrants(game)).toBe(0);
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(canCast(game, divination)).toMatch(TIMING);
  });

  it("Winding Canyons: creature spells only", () => {
    const { game } = table({ step: "upkeep" });
    const canyons = spawn(game, "Winding Canyons", A);
    lands(game, "Wastes", 2, A);
    lands(game, "Forest", 2, A);
    lands(game, "Island", 3, A);
    activate(game, canyons, 1);
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toBeNull();
    expect(canCast(game, toHand(game, "Divination", A))).toMatch(TIMING);
  });

  it("Emergence Zone: sacrificed, every spell this turn", () => {
    const { game } = table({ step: "upkeep" });
    const zone = spawn(game, "Emergence Zone", A);
    lands(game, "Wastes", 1, A);
    lands(game, "Island", 3, A);
    activate(game, zone, 1);
    expect(game.state.objects[zone].zone).toBe("graveyard");
    expect(canCast(game, toHand(game, "Divination", A))).toBeNull();
  });

  it("Alchemist's Refuge: {G}{U}, {T}: every spell this turn", () => {
    const { game } = table({ step: "upkeep" });
    const refuge = spawn(game, "Alchemist's Refuge", A);
    lands(game, "Forest", 1, A);
    lands(game, "Island", 4, A);
    const divination = toHand(game, "Divination", A);
    expect(canCast(game, divination)).toMatch(TIMING);
    activate(game, refuge, 1);
    expect(canCast(game, divination)).toBeNull();
  });
});

describe("a flash permission for the next spell", () => {
  it("Quicken: the next sorcery may be cast any time; casting it ends the permission", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Island", 7, A);
    lands(game, "Forest", 2, A);
    cast(game, toHand(game, "Quicken", A));
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toMatch(TIMING);
    cast(game, toHand(game, "Divination", A));
    expect(flashGrants(game)).toBe(0);
    expect(canCast(game, toHand(game, "Divination", A))).toMatch(TIMING);
  });

  it("Quicken: a sorcery cast when a sorcery could be cast anyway still uses it up", () => {
    const { game } = table();
    lands(game, "Island", 7, A);
    cast(game, toHand(game, "Quicken", A));
    cast(game, toHand(game, "Divination", A));
    expect(flashGrants(game)).toBe(0);
    cast(game, toHand(game, "Divination", A), { settle: false });
    // With a spell on the stack, a second sorcery has to wait.
    expect(canCast(game, toHand(game, "Divination", A))).toMatch(TIMING);
  });

  it("Quicken: two of them both apply to, and end on, the same sorcery; an instant doesn't spend them", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Island", 8, A);
    cast(game, toHand(game, "Quicken", A));
    cast(game, toHand(game, "Quicken", A));
    expect(flashGrants(game)).toBe(2);
    cast(game, toHand(game, "Divination", A));
    expect(flashGrants(game)).toBe(0);
    expect(canCast(game, toHand(game, "Divination", A))).toMatch(TIMING);
  });

  it("Quicken: until a sorcery is cast, a sorcery with suspend may be suspended any time", () => {
    const { game } = table({ step: "upkeep" });
    lands(game, "Island", 1, A);
    lands(game, "Mountain", 2, A);
    const bolt = toHand(game, "Rift Bolt", A);
    expect(game.canDispatch({ type: "suspend", player: A, card: bolt })).toMatch(TIMING);
    cast(game, toHand(game, "Quicken", A));
    expect(game.canDispatch({ type: "suspend", player: A, card: bolt })).toBeNull();
  });

  it("Progenitor's Icon: the next spell of the chosen type, not another type, and only one", () => {
    const { game } = table({ step: "upkeep" });
    const icon = spawn(game, "Progenitor's Icon", A);
    game.state.objects[icon].chosenCreatureType = "Bear";
    lands(game, "Forest", 4, A);
    lands(game, "Mountain", 4, A);
    activate(game, icon, 1);
    expect(canCast(game, toHand(game, "Hill Giant", A))).toMatch(TIMING);
    cast(game, toHand(game, "Grizzly Bears", A));
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toMatch(TIMING);
  });

  it("Progenitor's Icon: the type is fixed as the ability resolves", () => {
    const { game } = table({ step: "upkeep" });
    const icon = spawn(game, "Progenitor's Icon", A);
    game.state.objects[icon].chosenCreatureType = "Bear";
    lands(game, "Forest", 2, A);
    activate(game, icon, 1);
    game.state.objects[icon].chosenCreatureType = "Giant";
    expect(canCast(game, toHand(game, "Grizzly Bears", A))).toBeNull();
  });

  it("Progenitor's Icon: with no type chosen, the ability does nothing", () => {
    const { game } = table({ step: "upkeep" });
    const icon = spawn(game, "Progenitor's Icon", A);
    activate(game, icon, 1);
    expect(flashGrants(game)).toBe(0);
  });
});
