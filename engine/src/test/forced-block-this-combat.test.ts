/**
 * "Whenever a Wolf you control attacks, if Tolsimir attacked this combat,
 * target creature an opponent controls blocks that Wolf this combat if able."
 * — Tolsimir, Midnight's Light: a `restrict` of `must-block` the trigger
 * object until end of combat, under an intervening if (rule 603.4) that reads
 * this combat phase's declaration (`attackedThisCombat`), not "is attacking"
 * nor "attacked this turn". Its enters trigger makes Voja Fenstalker, a
 * legendary 5/5 green and white Wolf with trample. Written from the Oracle
 * text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, cast, enter, keywords, lands, pt, spawn, supertypes, table, toHand, watchTargets } from "./harness.js";

/** Tolsimir's Voja Fenstalker, ready to attack (a test board, not a turn later). */
const voja = (game: Game): ObjectId => {
  const id = game.state.zones.shared.battlefield.find((each) => game.state.objects[each].cardName === "Voja Fenstalker");
  if (id === undefined) throw new Error("no Voja Fenstalker");
  game.state.objects[id].summoningSick = false;
  return id;
};

describe("Tolsimir, Midnight's Light", () => {
  it("enters with Voja Fenstalker, a legendary 5/5 Wolf token with trample", () => {
    const { game } = table();
    enter(game, "Tolsimir, Midnight's Light");
    const wolf = voja(game);
    expect(game.state.objects[wolf].isToken).toBe(true);
    expect(game.state.objects[wolf].controller).toBe(A);
    expect(pt(game, wolf)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, wolf).has("trample")).toBe(true);
    expect(supertypes(game, wolf)).toContain("legendary");
  });

  it("a Wolf attacking beside Tolsimir makes the target block it", () => {
    const { game, a } = table();
    const tolsimir = enter(game, "Tolsimir, Midnight's Light");
    const wolf = voja(game);
    // The only creature an opponent controls: the one target there is.
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [tolsimir, wolf]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: wolf }]);
  });

  it("a Wolf attacking without Tolsimir doesn't trigger it", () => {
    const { game, a } = table();
    enter(game, "Tolsimir, Midnight's Light");
    const wolf = voja(game);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a);
    const offer = blockOffer(game, a, [wolf]);
    expect(seen.asked).toBe(0);
    expect(offer.blockRequirements ?? []).toEqual([]);
  });

  it("Tolsimir attacking in an earlier combat this turn doesn't count", () => {
    const { game, a } = table({ life: 100 });
    lands(game, "Mountain", 4);
    const tolsimir = enter(game, "Tolsimir, Midnight's Light");
    const wolf = voja(game);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    // First combat: Tolsimir alone.
    const first = watchTargets(a, () => [bears]);
    blockOffer(game, a, [tolsimir]);
    expect(first.asked).toBe(0);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    cast(game, toHand(game, "Relentless Assault"));
    // Second combat: the Wolf alone — Tolsimir attacked this turn, not this combat.
    const second = watchTargets(a, () => [bears]);
    const offer = blockOffer(game, a, [wolf]);
    expect(game.state.turn.combatPhases).toBe(2);
    expect(second.asked).toBe(0);
    expect(offer.blockRequirements ?? []).toEqual([]);
  });

  it("any Wolf of yours counts, once each; another creature doesn't", () => {
    const { game, a } = table();
    const tolsimir = enter(game, "Tolsimir, Midnight's Light");
    const wolf = voja(game);
    const timber = spawn(game, "Timber Wolves", A);
    const bear = spawn(game, "Grizzly Bears", A);
    const [x, y] = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    let n = 0;
    const seen = watchTargets(a, () => [n++ === 0 ? x : y]);
    const offer = blockOffer(game, a, [tolsimir, wolf, timber, bear]);
    expect(seen.asked).toBe(2);
    expect([...(offer.blockRequirements ?? [])].map((r) => r.attacker).sort()).toEqual([wolf, timber].sort());
  });
});
