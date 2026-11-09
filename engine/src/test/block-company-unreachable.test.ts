/**
 * Rule 509.1b / 509.1c: a creature that needs company to block, with no
 * companion who could block beside it, isn't able to block: no requirement
 * reaches it, and there's always a legal declaration.
 */

import { describe, expect, it } from "vitest";

import { blockCompanyViolations, blockingViolations, withinBlockCompany } from "../combat/blocking.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, blockOffer, ref, spawn, table } from "./harness.js";

/** Bob's Craven Hulk, made to block if able. */
const mustBlockHulk = (game: Game): ObjectId => {
  const hulk = spawn(game, "Craven Hulk", B);
  game.debugApplyEffect(B, { kind: "restrict", target: 0, restrictions: ["must-block"], duration: "end-of-turn" }, [ref(hulk)]);
  return hulk;
};

const declared = (game: Game, blocks: readonly { blocker: ObjectId; attacker: ObjectId }[]): string | null =>
  game.canDispatch({ type: "declare-blockers", player: B, blocks });

describe("a must-block creature whose only companion can't join it", () => {
  /** Challenger Troll attacks alone: it can't be blocked by more than one. */
  const trollAlone = () => {
    const { game, a } = table();
    const troll = spawn(game, "Challenger Troll");
    const hulk = mustBlockHulk(game);
    const bear = spawn(game, "Grizzly Bears", B);
    return { game, a, troll, hulk, bear };
  };

  it("doesn't reach it: nobody has to block", () => {
    const { game, a, troll, hulk, bear } = trollAlone();
    const offer = blockOffer(game, a, [troll]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([bear]);
    expect(declared(game, [])).toBeNull();
    expect(declared(game, [{ blocker: bear, attacker: troll }])).toBeNull();
    expect(declared(game, [{ blocker: hulk, attacker: troll }])).not.toBeNull();
  });

  it("the companion may still go on another attacker: then it does reach it", () => {
    const { game, a } = table();
    const troll = spawn(game, "Challenger Troll");
    const other = spawn(game, "Grizzly Bears");
    const hulk = mustBlockHulk(game);
    const bear = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [troll, other]);
    expect(offer.eligible.map((e) => e.blocker)).toContain(hulk);
    expect(declared(game, [])).not.toBeNull();
    expect(
      declared(game, [
        { blocker: hulk, attacker: troll },
        { blocker: bear, attacker: other },
      ]),
    ).toBeNull();
  });

  it("leaves a driver a legal declaration under a Lure on the Troll", () => {
    const { game, a } = table();
    const troll = spawn(game, "Challenger Troll");
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: ["must-be-blocked"], duration: "end-of-turn" }, [ref(troll)]);
    spawn(game, "Craven Hulk", B);
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [troll]);
    const fixed = withinBlockCompany([], offer);
    expect(blockingViolations(fixed, offer)).toEqual([]);
    expect(blockCompanyViolations(fixed, offer)).toEqual([]);
  });

  it("two Lured menace attackers under Caverns of Despair still leave a legal block", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    for (const id of [one, two]) {
      game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: ["must-be-blocked"], duration: "end-of-turn" }, [ref(id)]);
      game.debugApplyEffect(A, { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" }, [ref(id)]);
    }
    spawn(game, "Caverns of Despair", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [one, two]);
    const fixed = withinBlockCompany([], offer);
    expect(blockingViolations(fixed, offer)).toEqual([]);
    expect(fixed).toHaveLength(2);
    expect(declared(game, [...fixed])).toBeNull();
  });

  it("drops two who could only have each other, when they can't block beside each other", () => {
    const { game, a } = table();
    const troll = spawn(game, "Challenger Troll");
    const one = spawn(game, "Craven Hulk", B);
    const two = spawn(game, "Craven Hulk", B);
    const offer = blockOffer(game, a, [troll]);
    expect(offer.eligible.map((e) => e.blocker)).toEqual([]);
    expect(declared(game, [{ blocker: one, attacker: troll }, { blocker: two, attacker: troll }])).not.toBeNull();
  });
});
