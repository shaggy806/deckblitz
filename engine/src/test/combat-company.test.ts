/**
 * Restrictions keyed to the other creatures in combat (rules 508.1c, 509.1b,
 * `combat/company.ts`): "can't attack or block alone" (Mogg Flunkies, Bonded
 * Construct, Craven Hulk), "can't attack unless at least two other creatures
 * attack" (Orcish Conscripts) and "can only attack alone" (Errantry). Each
 * reaches the offers (what can't be in any legal group isn't eligible), the
 * validator (refused), the requirements (508.1d, 509.1c) and the bots' and the
 * fuzzer's fix-ups.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { withinAttackCompany } from "../combat/attacking.js";
import { withinBlockCompany } from "../combat/blocking.js";
import { attackers as attackersDecision } from "../decisions/attackers.js";
import { blockers as blockersDecision } from "../decisions/blockers.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, attack, blockOffer, cast, pt, ref, spawn, table, toHand, toStep } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

/** Alice's attackers offer, at her declare attackers. */
const attackOffer = (game: Game): AttackOffer | undefined => {
  toStep(game, "declare-attackers");
  return game.legalActions(A).find((o): o is AttackOffer => o.kind === "declare-attackers");
};
const atBob = (...ids: readonly ObjectId[]): { attacker: ObjectId; defender: PlayerId }[] =>
  ids.map((attacker) => ({ attacker, defender: B }));
const declare = (game: Game, ...ids: readonly ObjectId[]): void => {
  game.dispatch({ type: "declare-attackers", player: A, attackers: atBob(...ids) });
};
const seatDeclaring = (game: Game): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
};

describe("can't attack alone", () => {
  it("Mogg Flunkies alone isn't offered and isn't asked; a companion makes it eligible", () => {
    const { game } = table();
    const flunkies = spawn(game, "Mogg Flunkies");
    expect(attackOffer(game)).toBeUndefined();
    expect(game.state.awaiting).toBeNull();
    expect(game.state.objects[flunkies].attacking).toBeNull();
  });

  it("alone is refused, with a word for why; beside another it's fine", () => {
    const { game, a } = table();
    const flunkies = spawn(game, "Mogg Flunkies");
    const bear = spawn(game, "Grizzly Bears");
    // Held open, so the refusal comes from the validator.
    a.declareAttackersFn = () => {
      expect(() => declare(game, flunkies)).toThrow(/can't attack alone/);
      return atBob(flunkies, bear);
    };
    toStep(game, "postcombat-main");
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(game.state.players[B].life).toBe(20 - 3 - 2);
  });

  it("the other creature may attack anything: only that there's one counts (the rulings)", () => {
    const { game } = table({ players: 3 });
    const flunkies = spawn(game, "Mogg Flunkies");
    const bear = spawn(game, "Grizzly Bears");
    seatDeclaring(game);
    const players = game.state.turnOrder;
    expect(game.canDispatch({
      type: "declare-attackers",
      player: A,
      attackers: [
        { attacker: flunkies, defender: players[1] },
        { attacker: bear, defender: players[2] },
      ],
    })).toBeNull();
  });

  it("two can attack together, with nothing else (the rulings)", () => {
    const { game, a } = table();
    const one = spawn(game, "Mogg Flunkies");
    const two = spawn(game, "Bonded Construct");
    attack(game, a, [one, two]);
    expect(game.state.players[B].life).toBe(20 - 3 - 2);
  });

  it("the attacker alone stays in combat when its company leaves it (the rulings)", () => {
    const { game, a, b } = table();
    const flunkies = spawn(game, "Mogg Flunkies");
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bear }];
    attack(game, a, [flunkies, bear]);
    // The Bears died to the block; the Flunkies dealt their damage all the same.
    expect(game.state.players[B].life).toBe(20 - 3);
  });

  it("a token stack is that many creatures: two of them go together, one doesn't", () => {
    const { game } = table();
    const stack = spawn(game, "Bonded Construct");
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 3;
    const offer = attackOffer(game);
    expect(offer?.eligible).toEqual([stack]);
    expect(game.canDispatch({
      type: "declare-attackers",
      player: A,
      attackers: [{ attacker: stack, defender: B, count: 1 }],
    })).toMatch(/can't attack alone/);
    expect(game.canDispatch({
      type: "declare-attackers",
      player: A,
      attackers: [{ attacker: stack, defender: B, count: 2 }],
    })).toBeNull();
  });
});

describe("at least two other creatures", () => {
  it("Orcish Conscripts needs two others, and they count however they're restricted themselves", () => {
    const { game } = table();
    const conscripts = spawn(game, "Orcish Conscripts");
    const flunkies = spawn(game, "Mogg Flunkies");
    const bear = spawn(game, "Grizzly Bears");
    const offer = attackOffer(game);
    expect(offer?.eligible).toEqual([conscripts, flunkies, bear]);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(conscripts, bear) })).toMatch(
      /at least 2 other creatures attack/,
    );
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(flunkies, bear) })).toBeNull();
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(conscripts, flunkies, bear) })).toBeNull();
  });

  it("with one other it's left out of the offer, and so is a Flunkies with only it for company", () => {
    const { game } = table();
    const conscripts = spawn(game, "Orcish Conscripts");
    spawn(game, "Mogg Flunkies");
    expect(attackOffer(game)).toBeUndefined();
    expect(game.state.objects[conscripts].attacking).toBeNull();
  });
});

describe("can only attack alone", () => {
  it("Errantry: +3/+0, and it attacks by itself or not at all", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    const aura = toHand(game, "Errantry");
    a.chooseTargetsFn = () => [ref(bear)];
    cast(game, aura, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 5, toughness: 2 });
    const offer = attackOffer(game);
    expect(offer?.eligible).toContain(bear);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(bear, giant) })).toMatch(
      /can only attack alone/,
    );
    // The others may go without it; or it alone.
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(giant) })).toBeNull();
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(bear) })).toBeNull();
  });
});

describe("requirements (508.1d): as many as can be, without breaking a restriction", () => {
  /** A creature that must attack, on top of whatever it is. */
  const mustAttack = (game: Game, id: ObjectId): void => {
    (game.state.playerEffects ??= []).push({
      owner: A,
      expires: "end-of-turn",
      combat: { rules: ["must-attack"], filter: { name: game.state.objects[id].cardName }, side: A },
    });
  };

  it("a lone Flunkies that must attack can't, so it's no requirement", () => {
    const { game } = table();
    const flunkies = spawn(game, "Mogg Flunkies");
    mustAttack(game, flunkies);
    expect(attackOffer(game)).toBeUndefined();
    expect(game.state.turn.step).toBe("declare-attackers");
    expect(game.state.objects[flunkies].attacking).toBeNull();
  });

  it("with another creature able, it must attack and bring that creature (its ruling)", () => {
    const { game } = table();
    const flunkies = spawn(game, "Mogg Flunkies");
    const bear = spawn(game, "Grizzly Bears");
    mustAttack(game, flunkies);
    const offer = attackOffer(game);
    expect(offer?.mustAttack).toEqual([flunkies]);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [] })).toMatch(/must attack/);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(bear) })).toMatch(/must attack/);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(flunkies) })).toMatch(/alone/);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(flunkies, bear) })).toBeNull();
    // And a driver leaving it to the fix-up gets exactly that.
    if (offer === undefined) throw new Error("offered");
    expect(withinAttackCompany(atBob(flunkies), offer).map((d) => d.attacker).sort()).toEqual([flunkies, bear].sort());
  });

  it("another must attack, so the one that can only attack alone won't (Master of Cruelties' ruling)", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    a.chooseTargetsFn = () => [ref(bear)];
    cast(game, toHand(game, "Errantry"), { targets: [ref(bear)] });
    mustAttack(game, giant);
    const offer = attackOffer(game);
    expect(offer?.mustAttack).toEqual([giant]);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(bear) })).toMatch(/must attack/);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(giant) })).toBeNull();
  });

  it("both must attack and only one can: either, but one (each obeys one requirement)", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    a.chooseTargetsFn = () => [ref(bear)];
    cast(game, toHand(game, "Errantry"), { targets: [ref(bear)] });
    mustAttack(game, bear);
    mustAttack(game, giant);
    const offer = attackOffer(game);
    expect(offer?.mustAttack).toEqual([]);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [] })).toMatch(/must attack/);
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(bear) })).toBeNull();
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: atBob(giant) })).toBeNull();
  });
});

describe("what a driver gets", () => {
  it("a bot's lone Flunkies stays home; the pair it chose stays together", () => {
    const { game } = table();
    const flunkies = spawn(game, "Mogg Flunkies");
    const bear = spawn(game, "Grizzly Bears");
    const offer = attackOffer(game);
    if (offer === undefined) throw new Error("offered");
    expect(withinAttackCompany(atBob(flunkies), offer)).toEqual([]);
    expect(withinAttackCompany(atBob(bear), offer)).toEqual(atBob(bear));
    expect(withinAttackCompany(atBob(flunkies, bear), offer)).toEqual(atBob(flunkies, bear));
  });

  it("the fuzzer's random answers are always legal", () => {
    const { game } = table();
    spawn(game, "Mogg Flunkies");
    spawn(game, "Orcish Conscripts");
    spawn(game, "Grizzly Bears");
    const offer = attackOffer(game);
    if (offer === undefined) throw new Error("offered");
    let draw = 0;
    const rng = {
      random: () => [0.1, 0.9, 0.3, 0.7, 0.5][draw++ % 5],
      pickIndex: () => 0,
    };
    for (let i = 0; i < 40; i += 1) {
      const answer = attackersDecision.randomAnswer?.(offer, A, rng as never);
      if (answer === undefined) throw new Error("has a random answer");
      expect(game.canDispatch(answer)).toBeNull();
    }
  });

  it("a seat skipping its windows declares nothing, or leaves it to them when something must attack", () => {
    const { game } = table();
    spawn(game, "Mogg Flunkies");
    spawn(game, "Grizzly Bears");
    const offer = attackOffer(game);
    if (offer === undefined) throw new Error("offered");
    expect(attackersDecision.autoAnswer?.({ kind: "attackers", player: A }, A, [offer])).toEqual({
      type: "declare-attackers",
      player: A,
      attackers: [],
    });
  });
});

describe("can't block alone", () => {
  /** Bob's blockers offer against alice's attackers. */
  const board = (name = "Craven Hulk"): { game: Game; hulk: ObjectId; offer: ReturnType<typeof blockOffer>; bear: ObjectId; one: ObjectId; two: ObjectId } => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const hulk = spawn(game, name, B);
    const bear = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [one, two]);
    return { game, hulk, offer, bear, one, two };
  };

  it("Craven Hulk alone is refused; it can be the only creature on its attacker (its ruling)", () => {
    const { game, hulk, bear, one, two } = board();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: hulk, attacker: one }] })).toMatch(
      /can't block alone/,
    );
    expect(game.canDispatch({
      type: "declare-blockers",
      player: B,
      blocks: [
        { blocker: hulk, attacker: one },
        { blocker: bear, attacker: two },
      ],
    })).toBeNull();
    expect(game.canDispatch({
      type: "declare-blockers",
      player: B,
      blocks: [
        { blocker: hulk, attacker: one },
        { blocker: bear, attacker: one },
      ],
    })).toBeNull();
  });

  it("the other creature can block alone; a Hulk with nothing to join it isn't offered", () => {
    const { game, bear, one } = board();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bear, attacker: one }] })).toBeNull();

    const lone = table();
    const attacker = spawn(lone.game, "Grizzly Bears");
    const hulk = spawn(lone.game, "Craven Hulk", B);
    const offer = blockOffer(lone.game, lone.a, [attacker]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([]);
    expect(lone.game.canDispatch({
      type: "declare-blockers",
      player: B,
      blocks: [{ blocker: hulk, attacker }],
    })).toMatch(/can't block alone/);
  });

  it("two can block together (the rulings), and a stack's tokens are each a creature", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const stack = spawn(game, "Mogg Flunkies", B);
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 2;
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([stack]);
    expect(game.canDispatch({
      type: "declare-blockers",
      player: B,
      blocks: [{ blocker: stack, attacker, count: 1 }],
    })).toMatch(/can't block alone/);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: stack, attacker }] })).toBeNull();
  });

  it("Orcish Conscripts blocks only with two others", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears");
    const conscripts = spawn(game, "Orcish Conscripts", B);
    const one = spawn(game, "Hill Giant", B);
    const two = spawn(game, "Hill Giant", B);
    blockOffer(game, a, [attacker]);
    const blocks = (...ids: ObjectId[]) => ({
      type: "declare-blockers" as const,
      player: B,
      blocks: ids.map((blocker) => ({ blocker, attacker })),
    });
    expect(game.canDispatch(blocks(conscripts, one))).toMatch(/at least 2 other creatures block/);
    expect(game.canDispatch(blocks(conscripts, one, two))).toBeNull();
  });

  it("a Hulk that must block if able brings a companion (its ruling); a bot's lone Hulk stays out", () => {
    const { game, offer, hulk, bear, one } = board();
    expect(withinBlockCompany([{ blocker: hulk, attacker: one }], offer)).toEqual([]);
    const forced = { ...offer, blockRequirements: [{ blocker: hulk }] };
    const fixed = withinBlockCompany([{ blocker: hulk, attacker: one }], forced);
    expect(fixed.map((b) => b.blocker).sort()).toEqual([hulk, bear].sort());
    expect(game.state.awaiting?.kind).toBe("blockers");
  });

  it("the fuzzer's random blocks are always legal", () => {
    const { game, offer } = board("Mogg Flunkies");
    let draw = 0;
    const rng = { random: () => [0.1, 0.9, 0.3, 0.7, 0.5][draw++ % 5], pickIndex: () => 0 };
    for (let i = 0; i < 40; i += 1) {
      const answer = blockersDecision.randomAnswer?.(offer, B, rng as never);
      if (answer === undefined) throw new Error("has a random answer");
      expect(game.canDispatch(answer)).toBeNull();
    }
  });
});
