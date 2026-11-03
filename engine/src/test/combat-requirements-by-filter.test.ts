/**
 * Requirements a block or attack declaration has to answer as a whole: "must
 * be blocked by exactly one creature if able" (Nacatl War-Pride), "by an
 * Eldrazi" (Slayer's Cleaver), "all [filter] able to block this creature do so"
 * (Talruum Piper, Marble Priest), "all [filter] block that creature this turn
 * if able" as a rule for the turn (Magnetic Web), "each creature blocks this
 * turn if able" over token stacks (Predatory Rampage), and "if [a creature]
 * attacks, this attacks if able" (Viashino Bey, Ekundu Cyclops) — rules 508.1d
 * and 509.1c.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { attackingViolations, withRequiredAttackers } from "../combat/attacking.js";
import { blockingViolations, ifAblePlan, obeyingLure } from "../combat/blocking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  grant,
  lands,
  life,
  named,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

const attackOffer = (game: Game): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  const offer = game.legalActions(A).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error("alice wasn't asked to attack");
  return offer;
};

const declareAttackers = (game: Game, ...attackers: readonly ObjectId[]): void => {
  game.dispatch({
    type: "declare-attackers",
    player: A,
    attackers: attackers.map((attacker) => ({ attacker, defender: B })),
  });
};

const declareBlocks = (game: Game, ...blocks: readonly (readonly [ObjectId, ObjectId])[]): void => {
  game.dispatch({
    type: "declare-blockers",
    player: B,
    blocks: blocks.map(([blocker, attacker]) => ({ blocker, attacker })),
  });
};

describe("must be blocked by exactly one creature if able", () => {
  it("one blocker obeys it, and none or two don't", () => {
    const { game, a } = table();
    const pride = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: ["must-be-blocked-by-exactly-one"] }, [ref(pride)]);
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [pride]);
    expect(offer.mustBeBlockedByExactlyOne).toEqual([pride]);
    expect(blockingViolations([], offer)).toEqual([{ kind: "must-be-blocked-if-able", attacker: pride }]);
    const both = [
      { blocker: first, attacker: pride },
      { blocker: second, attacker: pride },
    ];
    expect(blockingViolations(both, offer)).toEqual([{ kind: "must-be-blocked-if-able", attacker: pride }]);
    expect(blockingViolations([both[0]], offer)).toEqual([]);
    // A driver's two blockers are cut to the plan's one.
    expect(obeyingLure(both, offer)).toHaveLength(1);
    expect(() => declareBlocks(game, [first, pride], [second, pride])).toThrow(/must be blocked/);
    declareBlocks(game, [second, pride]);
    expect(game.state.objects[second].blocking).toBe(pride);
  });

  it("Nacatl War-Pride: a token per creature defending player controls, each wanting a blocker of its own", () => {
    const { game, a } = table();
    const pride = spawn(game, "Nacatl War-Pride", A);
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [pride]);
    const tokens = named(game, "Nacatl War-Pride", A).filter((id) => id !== pride);
    expect(tokens).toHaveLength(2);
    for (const token of tokens) {
      expect(game.state.objects[token].tapped).toBe(true);
      expect(game.state.objects[token].attacking).toBeTruthy();
    }
    expect(offer.mustBeBlockedByExactlyOne).toHaveLength(3);
    expect(ifAblePlan(offer).required).toBe(2);
    // Two blockers on one obey one requirement, and two can be obeyed.
    expect(() => declareBlocks(game, [first, pride], [second, pride])).toThrow(/must be blocked/);
    declareBlocks(game, [first, pride], [second, tokens[0]]);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(named(game, "Nacatl War-Pride", A)).toEqual([pride]);
  });

  it("a stack of blockers wakes, its tokens going one to an attacker", () => {
    const { game, a } = table();
    const pride = spawn(game, "Nacatl War-Pride", A);
    const stack = spawn(game, "Grizzly Bears", B);
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 3;
    const offer = blockOffer(game, a, [pride]);
    expect(offer.eligible).toHaveLength(3);
    // Three creatures make three tokens, and the fourth attacker goes unblocked.
    expect(offer.mustBeBlockedByExactlyOne).toHaveLength(4);
    expect(ifAblePlan(offer).required).toBe(3);
    expect(blockingViolations(obeyingLure([], offer), offer)).toEqual([]);
  });

  it("menace makes it impossible to obey, so it asks nothing", () => {
    const { game, a } = table();
    const pride = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: ["must-be-blocked-by-exactly-one"] }, [ref(pride)]);
    grant(game, pride, "menace");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [pride]);
    expect(ifAblePlan(offer).required).toBe(0);
    expect(blockingViolations([], offer)).toEqual([]);
  });
});

describe("must be blocked by [filter]", () => {
  const armed = (game: Game): ObjectId => {
    const bearer = spawn(game, "Grizzly Bears", A);
    const cleaver = spawn(game, "Slayer's Cleaver", A);
    lands(game, "Wastes", 4);
    activate(game, cleaver, 0, { targets: [ref(bearer)] });
    expect(game.state.objects[cleaver].attachedTo).toBe(bearer);
    return bearer;
  };

  it("Slayer's Cleaver: an Eldrazi has to block it, and only one", () => {
    const { game, a } = table();
    const bearer = armed(game);
    const eldrazi = spawn(game, "Eldrazi Devastator", B);
    const other = spawn(game, "Eldrazi Devastator", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [bearer]);
    expect(offer.mustBeBlockedByOneOf).toEqual({ [bearer]: [eldrazi, other] });
    // A creature that isn't one doesn't obey it, alone.
    expect(blockingViolations([{ blocker: bears, attacker: bearer }], offer)).toHaveLength(1);
    expect(blockingViolations([{ blocker: eldrazi, attacker: bearer }], offer)).toEqual([]);
    expect(
      blockingViolations(
        [
          { blocker: bears, attacker: bearer },
          { blocker: other, attacker: bearer },
        ],
        offer,
      ),
    ).toEqual([]);
    expect(blockingViolations(obeyingLure([], offer), offer)).toEqual([]);
  });

  it("with no Eldrazi able to block it, it asks nothing", () => {
    const { game, a } = table();
    const bearer = armed(game);
    spawn(game, "Eldrazi Devastator", B, { tapped: true });
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [bearer]);
    expect(offer.mustBeBlockedIfAble).toBeUndefined();
    expect(blockingViolations([], offer)).toEqual([]);
  });

  it("Talruum Piper: every flier able blocks it, whatever the rest do", () => {
    const { game, a } = table();
    const piper = spawn(game, "Talruum Piper", A);
    const angel = spawn(game, "Serra Angel", B);
    const elemental = spawn(game, "Air Elemental", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [piper]);
    expect(offer.blockRequirements).toEqual([
      { blocker: angel, attacker: piper },
      { blocker: elemental, attacker: piper },
    ]);
    expect(blockingViolations([{ blocker: angel, attacker: piper }], offer)).toEqual([
      { kind: "block-requirement", blocker: elemental },
    ]);
    expect(
      blockingViolations(
        [
          { blocker: angel, attacker: piper },
          { blocker: elemental, attacker: piper },
          { blocker: bears, attacker: piper },
        ],
        offer,
      ),
    ).toEqual([]);
    expect(blockingViolations(obeyingLure([], offer), offer)).toEqual([]);
  });

  it("Marble Priest: a Wall has to block it, and deals it no combat damage", () => {
    const { game, a } = table();
    const priest = spawn(game, "Marble Priest", A);
    const wall = spawn(game, "Wall of Stone", B);
    const offer = blockOffer(game, a, [priest]);
    expect(offer.blockRequirements).toEqual([{ blocker: wall, attacker: priest }]);
    expect(() => declareBlocks(game)).toThrow(/must block if able/);
    declareBlocks(game, [wall, priest]);
    toStep(game, "postcombat-main");
    expect(game.state.objects[priest].damageMarked ?? 0).toBe(0);
    expect(zone(game, wall)).toBe("battlefield");
  });
});

describe("Magnetic Web", () => {
  const web = (game: Game, ...creatures: readonly ObjectId[]): void => {
    const artifact = spawn(game, "Magnetic Web", A);
    lands(game, "Wastes", creatures.length);
    for (const creature of creatures) {
      activate(game, artifact, 0, { targets: [ref(creature)] });
      game.state.objects[artifact].tapped = false;
      expect(counters(game, creature, "magnet")).toBe(1);
    }
  };

  it("one magnetic attacker brings the others, and neither asks otherwise", () => {
    const { game } = table();
    const first = spawn(game, "Grizzly Bears", A);
    const second = spawn(game, "Hill Giant", A);
    const plain = spawn(game, "Elvish Warrior", A);
    web(game, first, second);
    const offer = attackOffer(game);
    expect(offer.mustAttack).toEqual([]);
    expect(attackingViolations([], offer)).toEqual([]);
    expect(attackingViolations([{ attacker: plain, defender: B }], offer)).toEqual([]);
    expect(attackingViolations([{ attacker: first, defender: B }], offer)).toEqual([
      { kind: "must-attack", attacker: second },
    ]);
    expect(() => declareAttackers(game, first)).toThrow(/must attack if able/);
    declareAttackers(game, first, second);
    expect(game.state.objects[second].attacking).toBeTruthy();
  });

  it("every magnetic creature blocks the magnetic attacker, one given its counter after the trigger too", () => {
    const { game, a, b } = table();
    const attacker = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    const late = spawn(game, "Grizzly Bears", B);
    spawn(game, "Elvish Warrior", B);
    web(game, attacker, theirs);
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    b.declareBlockersFn = () => [];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && (s.turnRestrictions?.length ?? 0) > 0);
    expect(game.state.turnRestrictions?.[0]?.blocks?.object).toBe(attacker);
    // Rule 611.2c: it changes no characteristic, so it isn't locked in.
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "magnet", amount: 1 }, [ref(late)]);
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((o) => o.kind === "declare-blockers");
    if (offer?.kind !== "declare-blockers") throw new Error("no offer");
    expect(offer.blockRequirements).toEqual([
      { blocker: theirs, attacker },
      { blocker: late, attacker },
    ]);
    expect(blockingViolations([{ blocker: theirs, attacker }], offer)).toEqual([{ kind: "block-requirement", blocker: late }]);
  });

  it("the rule ends with the turn", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears", A);
    web(game, attacker);
    a.declareAttackersFn = () => [{ attacker, defender: B }];
    game.advanceUntil((s) => s.turn.number === 2);
    expect(game.state.turnRestrictions).toBeUndefined();
  });
});

describe("if a creature attacks, this attacks if able", () => {
  it("Viashino Bey: its attacking brings every creature you control, and another's doesn't", () => {
    const { game } = table();
    const bey = spawn(game, "Viashino Bey", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    const tapped = spawn(game, "Elvish Warrior", A, { tapped: true });
    const offer = attackOffer(game);
    expect(offer.mustAttack).toEqual([]);
    expect(attackingViolations([{ attacker: bears, defender: B }], offer)).toEqual([]);
    expect(attackingViolations([{ attacker: bey, defender: B }], offer).map((v) => v.attacker).sort()).toEqual(
      [bears, giant].sort(),
    );
    // A driver that names only the Bey has the rest sent; the tapped can't go.
    const sent = withRequiredAttackers([{ attacker: bey, defender: B }], offer).map((d) => d.attacker);
    expect(sent.sort()).toEqual([bey, bears, giant].sort());
    expect(sent).not.toContain(tapped);
    expect(() => declareAttackers(game, bey, bears)).toThrow(/must attack if able/);
    declareAttackers(game, bears);
    expect(game.state.objects[bey].attacking).toBeFalsy();
  });

  it("Ekundu Cyclops: another's attacking brings it, and it may stay home alone", () => {
    const { game } = table();
    const cyclops = spawn(game, "Ekundu Cyclops", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const offer = attackOffer(game);
    expect(offer.attackIf?.map((r) => r.attacker)).toEqual([cyclops]);
    expect(attackingViolations([], offer)).toEqual([]);
    expect(attackingViolations([{ attacker: bears, defender: B }], offer)).toEqual([
      { kind: "must-attack", attacker: cyclops },
    ]);
    expect(attackingViolations([{ attacker: cyclops, defender: B }], offer)).toEqual([]);
    declareAttackers(game, bears, cyclops);
    expect(game.state.objects[cyclops].attacking).toBeTruthy();
  });

  it("the Bey brings the Cyclops, and the Cyclops's being brought needs nothing more", () => {
    const { game } = table();
    const bey = spawn(game, "Viashino Bey", A);
    const cyclops = spawn(game, "Ekundu Cyclops", A);
    const offer = attackOffer(game);
    expect(withRequiredAttackers([{ attacker: bey, defender: B }], offer).map((d) => d.attacker)).toEqual([bey, cyclops]);
    // The Cyclops brings the Bey? No: the Bey only asks when it attacks.
    expect(attackingViolations([{ attacker: cyclops, defender: B }], offer)).toEqual([]);
  });

  it("a limit on how many can attack bends the requirement (rule 508.1d)", () => {
    const { game } = table();
    const bey = spawn(game, "Viashino Bey", A);
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Silent Arbiter", B);
    const offer = attackOffer(game);
    expect(attackingViolations([{ attacker: bey, defender: B }], offer)).toEqual([]);
    expect(withRequiredAttackers([{ attacker: bey, defender: B }], offer).map((d) => d.attacker)).toEqual([bey]);
    declareAttackers(game, bey);
    expect(game.state.objects[bears].attacking).toBeFalsy();
    expect(game.state.objects[bey].attacking).toBeTruthy();
  });
});

describe("each creature blocks this turn if able", () => {
  it("Predatory Rampage: every one of theirs, a token stack's every token and one that enters later", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const stack = spawn(game, "Hill Giant", B);
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 2;
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Predatory Rampage"));
    settle(game);
    const late = spawn(game, "Elvish Warrior", B);
    const offer = blockOffer(game, a, [attacker]);
    // The stack woke: two giants, each answering for itself.
    expect(offer.eligible).toHaveLength(4);
    expect(new Set(offer.blockRequirements?.map((r) => r.blocker)).size).toBe(4);
    expect(offer.blockRequirements?.some((r) => r.blocker === late)).toBe(true);
    expect(blockingViolations([{ blocker: bears, attacker }], offer).map((v) => v.kind)).toEqual([
      "block-requirement",
      "block-requirement",
      "block-requirement",
    ]);
    expect(blockingViolations(obeyingLure([], offer), offer)).toEqual([]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Cowards can't block Warriors", () => {
  it("Boldwyr Intimidator: any Coward, any Warrior, by whichever means they became one", () => {
    const { game, a } = table();
    const intimidator = spawn(game, "Boldwyr Intimidator", A);
    const warrior = spawn(game, "Elvish Warrior", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const coward = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    activate(game, intimidator, 0, { targets: [ref(coward)] });
    expect(subtypes(game, coward)).toEqual(["Coward"]);
    const offer = blockOffer(game, a, [warrior, bears]);
    expect(offer.eligible.find((e) => e.blocker === coward)?.canBlock).toEqual([bears]);
  });
});

describe("can't be blocked by more than one creature, for the turn", () => {
  it("a `restrict` says it as the static does", () => {
    const { game, a } = table();
    const attacker = spawn(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: ["blocked-by-at-most-one"] }, [ref(attacker)]);
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.singleBlockerAttackers).toEqual([attacker]);
    expect(
      blockingViolations(
        [
          { blocker: first, attacker },
          { blocker: second, attacker },
        ],
        offer,
      ),
    ).toEqual([{ kind: "single-blocker", attacker }]);
  });
});
