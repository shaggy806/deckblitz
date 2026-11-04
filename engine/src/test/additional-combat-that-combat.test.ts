/**
 * Additional combat phases placed where the card says, with "at the beginning
 * of that combat", and a creature counting its own attacks this turn.
 *
 * Proving cards: Moraug, Fury of Akoum; World at War.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast,enter, lands, life, nextTurn, pt, settle, spawn, table, toHand, toStep, zone, type Table } from "./harness.js";

const events =(game: Game, type: string): number => game.state.eventLog.filter((e) => e.type === type).length;

/** One attack, in every combat, by the creatures given. */
function alwaysAttack(t: Table, attackers: readonly ObjectId[]): void {
  t.a.declareAttackersFn = () =>
    attackers
      .filter((id) => t.game.state.objects[id].tapped !== true)
      .map((attacker) => ({ attacker, defender: B }));
}

describe("Moraug, Fury of Akoum's count", () => {
  it("each creature gets +1/+0 for each time it has attacked this turn, on its own count", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    const bear = spawn(game, "Grizzly Bears");
    const stayed = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    t.a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    t.b.declareBlockersFn = () => [];
    // The first attack counts as it's declared, so in that combat's damage too.
    game.advanceUntil((s) => s.objects[bear].attacking !== undefined && s.objects[bear].attacking !== null);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, stayed)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(17);
    expect(pt(game, bear).power).toBe(3);
    expect(pt(game, theirs).power).toBe(2);
    // A new turn starts over.
    nextTurn(game);
    expect(pt(game, bear).power).toBe(2);
  });

  it("counts attacks from before Moraug came, and stops when it goes (the rulings)", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    toStep(game, "postcombat-main");
    const moraug = spawn(game, "Moraug, Fury of Akoum");
    expect(pt(game, bear).power).toBe(3);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: moraug }]);
    settle(game);
    expect(pt(game, bear).power).toBe(2);
  });

  it("a creature that enters attacking hasn't attacked (the rulings)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    const attacker = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker, defender: B }];
    game.advanceUntil((s) => s.objects[attacker].attacking !== undefined && s.objects[attacker].attacking !== null);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, attacking: "choose" }, [
      { kind: "object", object: card },
    ]);
    settle(game);
    expect(game.state.objects[card].zone).toBe("battlefield");
    expect(game.state.objects[card].attacking).toBeTruthy();
    expect(pt(game, card).power).toBe(2);
    expect(pt(game, attacker).power).toBe(3);
  });

  it("is lost with a change of zone", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    toStep(game, "postcombat-main");
    expect(game.state.objects[bear].attacksThisTurn).toBe(1);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [{ kind: "object", object: bear }]);
    settle(game);
    expect(game.state.objects[bear].attacksThisTurn).toBeUndefined();
  });
});

describe("Moraug's landfall", () => {
  it("from the precombat main: that combat first, with the untap, then the turn's own without (the rulings)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    const tapped = spawn(game, "Grizzly Bears", A, { tapped: true });
    enter(game, "Mountain");
    expect(game.state.turn.step).toBe("precombat-main");
    // The added phase comes first: at its beginning, a tapped creature untaps.
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.zones.shared.stack.length > 0);
    expect(game.state.turn.combatPhases).toBe(1);
    settle(game);
    expect(game.state.objects[tapped].tapped).toBe(false);
    // Tapped again, the turn's own combat has no untap for it.
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [{ kind: "object", object: tapped }]);
    settle(game);
    expect(game.state.objects[tapped].tapped).toBe(true);
    game.advanceUntil((s) => (s.turn.combatPhases ?? 0) === 2 && s.turn.step === "begin-combat");
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(game.state.objects[tapped].tapped).toBe(true);
    // Then the turn goes on to its second main phase.
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(2);
    expect(events(game, "additional-combat-phase")).toBe(1);
  });

  it("creatures attack in both, and each attack adds a point", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, [bear]);
    enter(game, "Mountain");
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    // The added combat came first, so nothing untapped the bear for the turn's
    // own: it attacked once, for 2 + 1.
    expect(game.state.objects[bear].attacksThisTurn).toBe(1);
    expect(life(game, B)).toBe(17);
    // From the postcombat main, it's untapped first, and attacks for 2 + 2.
    enter(game, "Mountain");
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.objects[bear].attacksThisTurn).toBe(2);
    expect(life(game, B)).toBe(13);
  });

  it("from the postcombat main: no main phase after, and twice is two combats in a row, untapping each time (the rulings)", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, [bear]);
    toStep(game, "postcombat-main");
    expect(game.state.objects[bear].tapped).toBe(true);
    enter(game, "Mountain");
    enter(game, "Mountain");
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(3);
    expect(game.state.turn.mainPhases).toBe(2);
    expect(game.state.objects[bear].attacksThisTurn).toBe(3);
    // 3, then 4, then 5.
    expect(life(game, B)).toBe(8);
  });

  it("not on another player's turn, whoever's land it is", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    toStep(game, "precombat-main", B);
    enter(game, "Mountain");
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(1);
  });

  it("not outside a main phase", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    toStep(game, "begin-combat");
    enter(game, "Mountain");
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.turn.combatPhases).toBe(1);
  });

  it("nor for a land that isn't yours", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    enter(game, "Mountain", B);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.turn.combatPhases).toBe(1);
  });
});

describe("World at War", () => {
  const war = (t: Table): void => {
    lands(t.game, "Mountain", 5);
    cast(t.game, toHand(t.game, "World at War"));
  };

  it("from the first main: combat, second main, then a combat that untaps what attacked, and another main", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    const sat = spawn(game, "Grizzly Bears", A, { tapped: true });
    alwaysAttack(t, [bear]);
    war(t);
    // Not untapped as it resolves, nor by the turn's own combat.
    expect(game.state.turn.combatPhases ?? 0).toBe(0);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.turn.combatPhases).toBe(1);
    expect(game.state.objects[bear].tapped).toBe(true);
    game.advanceUntil((s) => (s.turn.combatPhases ?? 0) === 2 && s.turn.step === "begin-combat" && s.zones.shared.stack.length > 0);
    settle(game);
    expect(game.state.objects[bear].tapped).toBe(false);
    // It never attacked, so it stays tapped.
    expect(game.state.objects[sat].tapped).toBe(true);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.turn.mainPhases).toBe(3);
    expect(game.state.objects[bear].attacksThisTurn).toBe(2);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(3);
  });

  it("rebound casts it in the next upkeep, for a turn with an extra combat", () => {
    const t = table();
    const { game } = t;
    const card = toHand(game, "World at War");
    lands(game, "Mountain", 5);
    cast(game, card);
    expect(zone(game, card)).toBe("exile");
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(2);
    t.a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === card);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    toStep(game, "precombat-main", B);
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(3);
  });

  it("two at once are cumulative: three combats, each marked one untaps", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    alwaysAttack(t, [bear]);
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "World at War"));
    cast(game, toHand(game, "World at War"));
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(3);
    expect(game.state.turn.mainPhases).toBe(4);
    expect(game.state.objects[bear].attacksThisTurn).toBe(3);
  });

  it("resolved after the second main phase, it adds nothing (the rulings)", () => {
    const t = table();
    const { game } = t;
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "World at War"));
    game.advanceUntil((s) => (s.turn.mainPhases ?? 0) === 3);
    cast(game, toHand(game, "World at War"));
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(3);
  });

  it("resolved in the second main phase, its phases follow that one", () => {
    const t = table();
    const { game } = t;
    toStep(game, "postcombat-main");
    war(t);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(3);
  });

  it("beside Moraug's phase made in the second main: straight into both, no main phase between", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    toStep(game, "postcombat-main");
    war(t);
    enter(game, "Mountain");
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.combatPhases).toBe(3);
    expect(game.state.turn.mainPhases).toBe(3);
  });
});

describe("what was there before", () => {
  it("Grim Reaper's Sprint from the precombat main: still the two combats, then the one main phase", () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Grim Reaper's Sprint"), { targets: [{ kind: "object", object: bear }] });
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.turn.combatPhases).toBe(2);
    expect(game.state.turn.mainPhases).toBe(2);
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.turn.mainPhases).toBe(2);
  });

  it("the delayed ability doesn't outlast a turn it never came in", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Moraug, Fury of Akoum");
    enter(game, "Mountain");
    expect(game.state.delayedTriggers).toHaveLength(1);
    game.debugApplyEffect(A, { kind: "end-the-turn" });
    settle(game);
    nextTurn(game);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});
