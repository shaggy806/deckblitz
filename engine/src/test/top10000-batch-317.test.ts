// Batch 317: the top 5000's next cards by EDHREC rank (3865–4159), each on
// the feature it needed. Metalworker is in mana-ability-first.test.ts, Mystic
// Reflection in enter-as-copy.test.ts.

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { A, B, activate, cast, destroy, lands, nextTurn, pickModes, pickTargets, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

const named = (game: Game, id: ObjectId): string => printedCardName(game.state.objects[id]);
const tokensOf = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && named(game, id) === name);

describe("Vesuvan Duplimancy: a token copy of the spell's one target", () => {
  const setup = () => {
    const { game } = table();
    spawn(game, "Vesuvan Duplimancy");
    lands(game, "Forest", 4);
    return game;
  };

  it("copies the artifact or creature you control the spell targets, before the spell resolves", () => {
    const game = setup();
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] });
    const copies = tokensOf(game, "Grizzly Bears");
    expect(copies).toHaveLength(1);
    // The Growth resolved after the token was made: only the original grew.
    expect(game.characteristics(copies[0]).power).toBe(2);
    expect(game.characteristics(bear).power).toBe(5);
  });

  it("the copy of a legendary creature isn't legendary, so both stay", () => {
    const game = setup();
    const thalia = spawn(game, "Thalia, Guardian of Thraben");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(thalia)] });
    const copies = tokensOf(game, "Thalia, Guardian of Thraben");
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].modifiers.some((m) => m.removeSupertypes?.includes("legendary"))).toBe(true);
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, thalia)).toBe("battlefield");
  });

  it("copies the target as it last existed when it has left before the ability resolves", () => {
    const game = setup();
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)], settle: false });
    destroy(game, bear);
    expect(zone(game, bear)).toBe("graveyard");
    expect(tokensOf(game, "Grizzly Bears")).toHaveLength(1);
  });

  it("still makes the token when the spell is countered in response", () => {
    const game = setup();
    const bear = spawn(game, "Grizzly Bears");
    const growth = toHand(game, "Giant Growth");
    cast(game, growth, { targets: [ref(bear)], settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(growth)]);
    settle(game);
    expect(zone(game, growth)).toBe("graveyard");
    expect(tokensOf(game, "Grizzly Bears")).toHaveLength(1);
    expect(game.characteristics(bear).power).toBe(2);
  });

  it("doesn't trigger for a spell aimed at an opponent's creature", () => {
    const game = setup();
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(tokensOf(game, "Grizzly Bears")).toHaveLength(0);
  });
});

describe("Firion, Wild Rose Warrior: a token copy of an entering Equipment that equips for {2} less", () => {
  const setup = () => {
    const { game } = table();
    const firion = spawn(game, "Firion, Wild Rose Warrior");
    lands(game, "Mountain", 1);
    const splitter = toHand(game, "Bonesplitter");
    cast(game, splitter);
    const [token] = tokensOf(game, "Bonesplitter");
    return { game, firion, splitter, token };
  };

  it("makes a token copy whose equip costs {2} less; the original's costs what it did", () => {
    const { game, firion, splitter, token } = setup();
    expect(token).toBeDefined();
    // No mana left: the token's equip {1} is free, the original's isn't.
    expect(() => activate(game, splitter, 0, { targets: [ref(firion)] })).toThrow(/cannot pay/);
    activate(game, token, 0, { targets: [ref(firion)] });
    expect(game.state.objects[token].attachedTo).toBe(firion);
    expect(game.characteristics(firion).power).toBe(5);
    // "Equipped creatures you control have haste."
    expect(game.characteristics(firion).keywords).toContain("haste");
  });

  it("the token is sacrificed at the beginning of the next upkeep, whoever's", () => {
    const { game, token } = setup();
    nextTurn(game, "upkeep");
    settle(game);
    expect(game.state.objects[token]?.zone).not.toBe("battlefield");
    expect(tokensOf(game, "Bonesplitter")).toHaveLength(0);
  });

  it("an unequipped creature has no haste, and a token Equipment entering makes no copy", () => {
    const { game, firion, token } = setup();
    expect(game.characteristics(firion).keywords).not.toContain("haste");
    expect(game.state.objects[token].isToken).toBe(true);
    expect(tokensOf(game, "Bonesplitter")).toHaveLength(1);
  });
});

describe("Karmic Justice: an opponent's spell or ability destroys your noncreature permanent", () => {
  const setup = () => {
    const t = table();
    const { game, a } = t;
    const justice = spawn(game, "Karmic Justice");
    const ring = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    pickModes(a, 0);
    return { game, a, justice, ring, theirs };
  };

  it("lets you destroy a permanent that opponent controls", () => {
    const { game, ring, theirs } = setup();
    destroy(game, ring, B);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("triggers when it is the one destroyed", () => {
    const { game, justice, theirs } = setup();
    destroy(game, justice, B);
    expect(zone(game, justice)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("is a may: declined, nothing is destroyed", () => {
    const { game, a, ring, theirs } = setup();
    pickModes(a);
    destroy(game, ring, B);
    expect(zone(game, theirs)).toBe("battlefield");
  });

  it("not for a creature, nor for your own effect", () => {
    const { game, ring, theirs } = setup();
    const mine = spawn(game, "Grizzly Bears");
    destroy(game, mine, B);
    expect(zone(game, theirs)).toBe("battlefield");
    destroy(game, ring, A);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Chaos Dragon: each player rolls a d20, and it can't attack the opponents who rolled highest", () => {
  it("leaves out exactly the opponents with the highest result, and their planeswalkers", () => {
    const seen = { restricted: 0, free: 0 };
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      const { game } = table({ players: 4, seed });
      const dragon = spawn(game, "Chaos Dragon");
      const opponents = game.state.turnOrder.filter((p) => p !== A);
      const walkers = new Map(opponents.map((p) => [p, spawn(game, "Jace Beleren", p)] as const));
      toStep(game, "declare-attackers", A);
      const rolls = game.state.eventLog.flatMap((e) => (e.type === "dice-rolled" ? [e] : []));
      // One d20 each, in turn order from the active player.
      expect(rolls.map((r) => r.player)).toEqual(game.state.turnOrder);
      expect(rolls.every((r) => r.sides === 20 && r.results.length === 1)).toBe(true);
      const total = new Map(rolls.map((r) => [r.player, r.results[0] + (r.modifier ?? 0)] as const));
      const highest = Math.max(...total.values());
      const offer = game.legalActions(A).find((a) => a.kind === "declare-attackers");
      const may = offer?.kind === "declare-attackers" ? (offer.defendersFor[dragon] ?? []) : [];
      for (const p of opponents) {
        const barred = total.get(p) === highest;
        expect(may.includes(p)).toBe(!barred);
        expect(may.includes(walkers.get(p)!)).toBe(!barred);
        if (barred) seen.restricted += 1;
        else seen.free += 1;
      }
    }
    // The seeds show both outcomes.
    expect(seen.restricted).toBeGreaterThan(0);
    expect(seen.free).toBeGreaterThan(0);
  });

  it("the restriction ends with the combat", () => {
    const { game } = table({ players: 4, seed: 3 });
    const dragon = spawn(game, "Chaos Dragon");
    toStep(game, "postcombat-main", A);
    expect(game.state.objects[dragon].modifiers.some((m) => (m.restrictions?.length ?? 0) > 0)).toBe(false);
  });
});
