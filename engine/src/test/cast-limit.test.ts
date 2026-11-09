/**
 * A limit on how many spells a player casts in a turn (rules 101.2, 601.3):
 * `prohibits.castLimit`, "each player can't cast more than one [filter] spell
 * each turn" (Rule of Law, Deafening Silence, Ethersworn Canonist, Curse of
 * Exhaustion), and `player-effect`'s `castsLeft`, "you can cast only one more
 * spell this turn" (Irencrag Feat).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const canCast = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("each player can't cast more than one spell each turn", () => {
  it("Rule of Law: the second spell of a turn is barred, and the next turn counts afresh", () => {
    const { game } = table();
    spawn(game, "Rule of Law");
    lands(game, "Mountain", 8);
    const first = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    expect(canCast(game, second)).toBe(true);
    cast(game, first, { targets: [ref(B)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(canCast(game, second)).toBe(false);
    expect(() => cast(game, second, { targets: [ref(B)] })).toThrow(/can't cast Lightning Bolt \(Rule of Law\)/);
    // Lands and abilities are neither limited nor counted.
    const land = toHand(game, "Mountain");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === land)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(canCast(game, second)).toBe(true);
  });

  it("Rule of Law binds every player, each by their own count", () => {
    const { game } = table();
    spawn(game, "Rule of Law");
    lands(game, "Mountain", 2);
    lands(game, "Mountain", 2, B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const bobs = toHand(game, "Lightning Bolt", B);
    expect(canCast(game, toHand(game, "Lightning Bolt"))).toBe(false);
    nextTurn(game);
    // Bob hasn't cast one: the limit is each player's own.
    expect(canCast(game, bobs, B)).toBe(true);
  });

  it("Rule of Law looks at the whole turn: a spell cast before it arrived counts, and it counts itself", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 3);
    const bolt = toHand(game, "Lightning Bolt");
    const rule = toHand(game, "Rule of Law");
    const other = toHand(game, "Lightning Bolt");
    cast(game, rule);
    expect(zone(game, rule)).toBe("battlefield");
    // The ruling: you can't cast Rule of Law and then cast another spell.
    expect(canCast(game, bolt)).toBe(false);
    expect(canCast(game, other)).toBe(false);
  });

  it("Rule of Law: a spell that was countered still counted", () => {
    const { game } = table();
    spawn(game, "Rule of Law");
    lands(game, "Mountain", 2);
    lands(game, "Island", 2, B);
    const counter = toHand(game, "Counterspell", B);
    const bolt = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    cast(game, counter, { player: B, targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(canCast(game, second)).toBe(false);
  });

  it("Rule of Law stops a cast an effect offers too: cascade finds a card it can't cast (rule 101.2)", () => {
    const { game } = table({ deck: "Lightning Bolt" });
    spawn(game, "Rule of Law");
    lands(game, "Forest", 2);
    lands(game, "Mountain", 2);
    const elf = toHand(game, "Bloodbraid Elf");
    cast(game, elf, { settle: false });
    const asked: string[] = [];
    game.advanceUntil((s) => {
      if (s.awaiting !== null) asked.push(s.awaiting.kind);
      return s.zones.shared.stack.length === 0 && s.awaiting === null;
    });
    expect(asked).not.toContain("cast-now");
    expect(zone(game, elf)).toBe("battlefield");
    expect(game.state.players[B].life).toBe(20);
    expect(game.eventsOfType("cascade-revealed").length).toBe(1);
  });

  it("Rule of Law gone, the limit is gone with it", () => {
    const { game } = table();
    const rule = spawn(game, "Rule of Law");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const second = toHand(game, "Lightning Bolt");
    expect(canCast(game, second)).toBe(false);
    game.debugMove(rule, "graveyard");
    expect(canCast(game, second)).toBe(true);
  });
});

describe("a limit on some spells", () => {
  it("Deafening Silence: any number of creature spells, one noncreature spell", () => {
    const { game } = table();
    spawn(game, "Deafening Silence");
    lands(game, "Forest", 4);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    const bolt = toHand(game, "Lightning Bolt");
    const secondBolt = toHand(game, "Lightning Bolt");
    expect(canCast(game, bolt)).toBe(true);
    cast(game, bolt, { targets: [ref(B)] });
    expect(canCast(game, secondBolt)).toBe(false);
    // Creature spells aren't limited, after the noncreature spell as before.
    const bears = toHand(game, "Grizzly Bears");
    expect(canCast(game, bears)).toBe(true);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("Deafening Silence reads a spell as it's cast: an Adventure is the instant, and it counts as one", () => {
    const { game } = table();
    spawn(game, "Deafening Silence");
    lands(game, "Mountain", 6);
    const giant = toHand(game, "Bonecrusher Giant");
    const bolt = toHand(game, "Lightning Bolt");
    const offers = () =>
      game
        .legalActions(A)
        .filter((a): a is Extract<typeof a, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === giant);
    expect(offers().some((a) => (a.face ?? 0) !== 0)).toBe(true);
    cast(game, bolt, { targets: [ref(B)] });
    // The Stomp half is a noncreature spell, so it's barred; the creature half isn't.
    const faces = offers();
    expect(faces.length).toBeGreaterThan(0);
    expect(faces.every((a) => (a.face ?? 0) === 0)).toBe(true);
  });

  it("Ethersworn Canonist: artifact spells are free before and after the one nonartifact spell", () => {
    const { game } = table();
    spawn(game, "Ethersworn Canonist");
    lands(game, "Mountain", 4);
    const mox = toHand(game, "Sol Ring");
    cast(game, mox);
    const bolt = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    // An artifact spell didn't use it up.
    expect(canCast(game, bolt)).toBe(true);
    cast(game, bolt, { targets: [ref(B)] });
    expect(canCast(game, second)).toBe(false);
    expect(canCast(game, toHand(game, "Sol Ring"))).toBe(true);
  });

  it("Ethersworn Canonist counts a nonartifact spell cast before it arrived, and it counts itself out", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const canonist = toHand(game, "Ethersworn Canonist");
    // Being an artifact spell itself, it can still be cast.
    cast(game, canonist);
    expect(zone(game, canonist)).toBe("battlefield");
    expect(canCast(game, toHand(game, "Lightning Bolt"))).toBe(false);
    expect(canCast(game, toHand(game, "Sol Ring"))).toBe(true);
  });
});

describe("a limit on the enchanted player", () => {
  it("Curse of Exhaustion binds the player it enchants alone", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Mountain", 4);
    const curse = toHand(game, "Curse of Exhaustion");
    cast(game, curse, { targets: [ref(B)] });
    expect(zone(game, curse)).toBe("battlefield");
    expect(game.state.objects[curse].attachedToPlayer).toBe(B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    // Alice has now cast two, and isn't bound.
    expect(canCast(game, toHand(game, "Lightning Bolt"))).toBe(true);
    nextTurn(game);
    lands(game, "Mountain", 2, B);
    const first = toHand(game, "Lightning Bolt", B);
    const second = toHand(game, "Lightning Bolt", B);
    cast(game, first, { targets: [ref(A)], player: B });
    expect(canCast(game, second, B)).toBe(false);
  });
});

describe("you can cast only one more spell this turn", () => {
  it("Irencrag Feat: seven red and one more spell, whatever came before, and only this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const feat = toHand(game, "Irencrag Feat");
    cast(game, feat);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R").length).toBe(7);
    const one = toHand(game, "Lightning Bolt");
    const two = toHand(game, "Lightning Bolt");
    expect(canCast(game, one)).toBe(true);
    cast(game, one, { targets: [ref(B)] });
    expect(canCast(game, two)).toBe(false);
    // It doesn't stop a land (the ruling).
    const land = toHand(game, "Mountain");
    expect(game.legalActions(A).some((a) => a.kind === "play-land" && a.card === land)).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(canCast(game, two)).toBe(true);
  });

  it("Irencrag Feat binds only its caster", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Irencrag Feat"));
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.emblems.at(-1)?.static?.prohibits).toEqual([{ act: "cast", who: { players: [A] }, limit: 2 }]);
  });

  it("Irencrag Feat permits nothing: Rule of Law still stops the spell it would allow", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Rule of Law");
    cast(game, toHand(game, "Irencrag Feat"));
    expect(canCast(game, toHand(game, "Lightning Bolt"))).toBe(false);
  });
});
