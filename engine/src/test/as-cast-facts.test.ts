import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, B, cast, counters, keywords, lands, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// `CardDefinition.asCast` (rule 601.2i): facts about the board fixed as a
// spell finishes being cast, read as it resolves through the condition
// `as-cast` and the amount `asCast`, whatever has changed since. A copy wasn't
// cast (rule 707.10), so it has none.

describe("facts fixed as a spell is cast", () => {
  /** Alice attacking with a Hill Giant, in the declare attackers step. */
  const attacking = (name = "Hill Giant") => {
    const t = table();
    lands(t.game, "Plains", 1);
    const giant = spawn(t.game, name);
    t.a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    t.game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && s.objects[giant].attackedThisTurn === true && s.priority.holder === A,
    );
    return { ...t, giant };
  };
  const gone = (game: Game, id: ObjectId): void => {
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(id)]);
  };

  it("Steer Clear: 4 with a Mount as it's cast, though the Mount has left by resolution", () => {
    const { game, giant } = attacking();
    const mount = spawn(game, "Caustic Bronco");
    const card = toHand(game, "Steer Clear");
    cast(game, card, { targets: [ref(giant)], settle: false });
    expect(game.state.objects[card].asCastFacts).toEqual([1]);
    gone(game, mount);
    expect(zone(game, mount)).toBe("graveyard");
    expect(zone(game, card)).toBe("stack");
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Steer Clear: 2 without one, though a Mount has arrived by resolution", () => {
    const { game, giant } = attacking();
    const card = toHand(game, "Steer Clear");
    cast(game, card, { targets: [ref(giant)], settle: false });
    expect(game.state.objects[card].asCastFacts).toEqual([0]);
    spawn(game, "Caustic Bronco");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("Faerie Fencing: -X/-X, and -3/-3 more with a Faerie as it's cast", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const faerie = spawn(game, "Faerie Miscreant");
    const giant = spawn(game, "Colossal Dreadmaw", B);
    const card = toHand(game, "Faerie Fencing");
    cast(game, card, { targets: [ref(giant)], x: 1, settle: false });
    gone(game, faerie);
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });

  it("Faerie Fencing without a Faerie: -X/-X alone", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Faerie Fencing"), { targets: [ref(giant)], x: 1 });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 5 });
  });

  it("Lethal Exploit: -2/-2 and -1/-1 per modified creature counted as it's cast", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.state.objects[one].counters["+1/+1"] = 1;
    game.state.objects[two].counters["+1/+1"] = 1;
    // An opponent's modified creature isn't yours.
    game.state.objects[spawn(game, "Grizzly Bears", B)].counters["+1/+1"] = 1;
    const giant = spawn(game, "Colossal Dreadmaw", B);
    const card = toHand(game, "Lethal Exploit");
    cast(game, card, { targets: [ref(giant)], settle: false });
    expect(game.state.objects[card].asCastFacts).toEqual([2]);
    // Neither one leaving nor one arriving changes the count.
    gone(game, one);
    game.state.objects[spawn(game, "Grizzly Bears")].counters["+1/+1"] = 1;
    settle(game);
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });

  it("Flame Discharge: X, or X plus 2 with a modified creature as it's cast", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const first = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Flame Discharge"), { targets: [ref(first)], x: 2 });
    expect(game.state.objects[first].damageMarked).toBe(2);

    game.state.objects[spawn(game, "Grizzly Bears")].counters["+1/+1"] = 1;
    const second = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Flame Discharge"), { targets: [ref(second)], x: 1 });
    expect(game.state.objects[second].damageMarked).toBe(3);
  });

  it("a copy wasn't cast, so it has none of the facts", () => {
    const { game, giant } = attacking("Worldspine Wurm");
    spawn(game, "Caustic Bronco");
    const card = toHand(game, "Steer Clear");
    cast(game, card, { targets: [ref(giant)], settle: false });
    game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(card)]);
    settle(game);
    // The copy's 2 and the original's 4.
    expect(game.state.objects[giant].damageMarked).toBe(6);
  });
});

describe("timing by when it's cast: Siren's Call", () => {
  const onBobsTurn = (game: Game, step: GameState["turn"]["step"]): void => {
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === step && s.priority.holder === A);
  };
  const canCast = (game: Game, card: ObjectId): boolean =>
    game.canDispatch({ type: "cast-spell", player: A, card, targets: [] }) === null;

  it("only on an opponent's turn, before attackers are declared", () => {
    const { game, b } = table();
    lands(game, "Island", 1);
    const card = toHand(game, "Siren's Call");
    expect(canCast(game, card)).toBe(false); // her own turn
    onBobsTurn(game, "upkeep");
    expect(canCast(game, card)).toBe(true);
    onBobsTurn(game, "begin-combat");
    expect(canCast(game, card)).toBe(true);
    b.declareAttackersFn = () => [];
    onBobsTurn(game, "declare-attackers");
    expect(canCast(game, card)).toBe(false);
    onBobsTurn(game, "postcombat-main");
    expect(canCast(game, card)).toBe(false);
  });

  it("must attack; at the end step what didn't dies, tapped or not, Walls and newcomers spared", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const attacker = spawn(game, "Grizzly Bears", B);
    const stayed = spawn(game, "Hill Giant", B);
    const wall = spawn(game, "Wall of Omens", B);
    const hers = spawn(game, "Hill Giant", A);
    const card = toHand(game, "Siren's Call");
    onBobsTurn(game, "upkeep");
    // Tapped as the attack is declared: it can't attack, and dies all the same (the ruling).
    game.state.objects[stayed].tapped = true;
    cast(game, card);
    expect(zone(game, card)).toBe("graveyard");
    // Arrive after it resolved, so not there since the turn began: the
    // requirement reaches one that can attack (rule 611.2c), the destruction neither.
    const newcomer = spawn(game, "Goblin Piker", B, { sick: true });
    const hasty = spawn(game, "Raging Goblin", B, { sick: true });
    game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === B);
    const offer = game.legalActions(B).find((o) => o.kind === "declare-attackers");
    if (offer?.kind !== "declare-attackers") throw new Error("not asked to attack");
    expect([...offer.mustAttack].sort()).toEqual([attacker, hasty].sort());
    // The scripted seat sends what it must.
    game.advanceUntil((s) => s.turn.number === 3);
    expect(game.state.objects[attacker].lastAttack).toBeDefined();
    expect(zone(game, attacker)).toBe("battlefield");
    expect(zone(game, hasty)).toBe("battlefield");
    expect(zone(game, stayed)).toBe("graveyard");
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, newcomer)).toBe("battlefield");
    expect(zone(game, hers)).toBe("battlefield");
  });
});

describe("kicked as it enters", () => {
  it("Voidpouncer kicked: two +1/+1 counters, a trample counter, and haste", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Wastes", 1);
    const card = toHand(game, "Voidpouncer");
    cast(game, card, { kicked: true });
    expect(counters(game, card)).toBe(2);
    expect(counters(game, card, "trample")).toBe(1);
    expect(pt(game, card)).toEqual({ power: 5, toughness: 3 });
    expect(keywords(game, card).has("trample")).toBe(true);
    expect(keywords(game, card).has("haste")).toBe(true);
  });

  it("Voidpouncer unkicked: none of that", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const card = toHand(game, "Voidpouncer");
    cast(game, card);
    expect(counters(game, card)).toBe(0);
    expect(counters(game, card, "trample")).toBe(0);
    expect(keywords(game, card).has("haste")).toBe(false);
  });

  it("Gnarlid Colony kicked: two counters, and its counter-bearers have trample", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[other].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Gnarlid Colony");
    cast(game, card, { kicked: true });
    expect(pt(game, card)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, card).has("trample")).toBe(true);
    expect(keywords(game, other).has("trample")).toBe(true);
    expect(keywords(game, plain).has("trample")).toBe(false);
  });
});
