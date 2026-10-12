/**
 * The set walk, batch 63, part a (2026-10-12): Lorwyn Eclipsed.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  loyalty,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

type Cast = Extract<Action, { type: "cast-spell" }>;
const free = (card: ObjectId): Cast => ({ type: "cast-spell", player: A, card, targets: [], via: "effect", free: true });

/** `names` on top of alice's library, the first on top. */
const stack = (game: Parameters<typeof toLibrary>[0], names: readonly string[]): ObjectId[] =>
  [...names].reverse().map((name) => toLibrary(game, name)).reverse();

describe("Abigale, Eloquent First-Year", () => {
  it("strips another creature's abilities for good, then its keyword counters give it flying, first strike and lifelink", () => {
    const { game, a } = table();
    const hawk = spawn(game, "Vampire Nighthawk", B);
    const seen = watchTargets(a, () => [hawk]);
    const abigale = enter(game, "Abigale, Eloquent First-Year");
    expect(seen.offered[0]).toContain(hawk);
    expect(seen.offered[0]).not.toContain(abigale);
    const has = (): string[] => [...keywords(game, hawk)].sort();
    expect(has()).toEqual(["first-strike", "flying", "lifelink"]);
    expect(counters(game, hawk, "first-strike")).toBe(1);
    // It doesn't wear off, nor when Abigale leaves.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(abigale)]);
    settle(game);
    nextTurn(game);
    expect(has()).toEqual(["first-strike", "flying", "lifelink"]);
  });
});

describe("Ajani, Outland Chaperone", () => {
  it("−8 looks at as many cards as your life total and puts nonland permanents of mana value 3 or less onto the battlefield", () => {
    const { game, a } = table({ life: 4 });
    const ajani = spawn(game, "Ajani, Outland Chaperone");
    const [bears, signet, bolt, giant, elves] = stack(game, [
      "Grizzly Bears",
      "Arcane Signet",
      "Lightning Bolt",
      "Hill Giant",
      "Llanowar Elves",
    ]);
    const seen = pickFromZone(a, bears, signet);
    loyalty(game, ajani, -8, { atLeast: 8 });
    // Four cards looked at: the Elves, fifth from the top, isn't among them.
    expect([...seen.offered].sort()).toEqual([bears, signet].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, signet)).toBe("battlefield");
    for (const id of [bolt, giant, elves]) expect(zone(game, id)).toBe("library");
  });
});

describe("Bre of Clan Stoutarm", () => {
  it("at your end step, if you gained life, casts the nonland card found free when its mana value fits the life gained", () => {
    const { game, a } = table();
    spawn(game, "Bre of Clan Stoutarm");
    const [island, divination] = stack(game, ["Island", "Divination"]);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 }, []);
    settle(game);
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return free(divination);
    };
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(offered).toBe(true);
    expect(zone(game, island)).toBe("exile");
    expect(zone(game, divination)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
  });

  it("puts a card that costs more than the life gained into your hand, and does nothing without life gained", () => {
    const { game, a } = table();
    spawn(game, "Bre of Clan Stoutarm");
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    const [quiet] = stack(game, ["Divination"]);
    toStep(game, "end");
    settle(game);
    expect(zone(game, quiet)).toBe("library");

    nextTurn(game);
    toStep(game, "precombat-main");
    const [divination] = stack(game, ["Divination"]);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(offered).toBe(false);
    expect(zone(game, divination)).toBe("hand");
  });

  it("gives another creature you control flying and lifelink", () => {
    const { game } = table();
    const bre = spawn(game, "Bre of Clan Stoutarm");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, bre, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Bristlebane Battler", () => {
  it("enters with five -1/-1 counters and sheds one per other creature of yours entering, only while it has one", () => {
    const { game } = table();
    const battler = enter(game, "Bristlebane Battler");
    expect(counters(game, battler, "-1/-1")).toBe(5);
    expect(pt(game, battler)).toEqual({ power: 1, toughness: 1 });
    enter(game, "Grizzly Bears");
    expect(counters(game, battler, "-1/-1")).toBe(4);
    // An opponent's creature doesn't count.
    enter(game, "Grizzly Bears", B);
    expect(counters(game, battler, "-1/-1")).toBe(4);
    game.state.objects[battler].counters["-1/-1"] = 0;
    // No counter: it doesn't trigger at all.
    enter(game, "Grizzly Bears", A, { settle: false });
    expect(game.state.zones.shared.stack.length + game.state.pendingTriggers.length).toBe(0);
    settle(game);
    expect(pt(game, battler)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Boneclub Berserker", () => {
  it("gets +2/+0 for each other Goblin you control", () => {
    const { game } = table();
    const berserker = spawn(game, "Boneclub Berserker");
    expect(pt(game, berserker)).toEqual({ power: 2, toughness: 4 });
    spawn(game, "Raging Goblin");
    spawn(game, "Raging Goblin", B);
    spawn(game, "Grizzly Bears");
    expect(pt(game, berserker)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Darkness Descends", () => {
  it("puts two -1/-1 counters on every creature", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Darkness Descends"));
    expect(counters(game, mine, "-1/-1")).toBe(2);
    expect(counters(game, theirs, "-1/-1")).toBe(2);
  });
});

describe("Eclipsed Boggart", () => {
  it("offers only a Goblin, Swamp or Mountain card from the top four — a changeling is a Goblin card", () => {
    const { game, a } = table();
    const [goblin, giant, swamp, outcast, mountain] = stack(game, [
      "Raging Goblin",
      "Hill Giant",
      "Swamp",
      "Changeling Outcast",
      "Mountain",
    ]);
    const seen = pickFromZone(a, swamp);
    enter(game, "Eclipsed Boggart");
    expect([...seen.offered].sort()).toEqual([goblin, swamp, outcast].sort());
    expect(zone(game, swamp)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    // The other three went under; the Mountain, fifth, is now on top.
    const top = library.indexOf(mountain);
    expect(top === 0 || top === library.length - 1).toBe(true);
    expect(zone(game, giant)).toBe("library");
  });
});
