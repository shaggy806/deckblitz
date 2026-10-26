/**
 * Morningtide, group E: the clauses most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  keywords,
  zone,
  controller,
} from "./harness.js";

describe("Preeminent Captain", () => {
  it("puts a Soldier from hand onto the battlefield tapped and attacking, but not a non-Soldier", () => {
    const { game, a } = table();
    const captain = spawn(game, "Preeminent Captain");
    const soldier = toHand(game, "Elite Vanguard");
    const bears = toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, soldier);
    attack(game, a, [captain]);
    expect(seen.offered).toContain(soldier);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, soldier)).toBe("battlefield");
    expect(game.state.objects[soldier].tapped).toBe(true);
    // 2 first strike + 2 from the Vanguard.
    expect(game.state.players[B].life).toBe(16);
  });
});

describe("Kinsbaile Borderguard", () => {
  it("enters with a counter per other Kithkin and makes a Soldier per counter of any kind when it dies", () => {
    const { game } = table();
    spawn(game, "Kithkin Healer");
    spawn(game, "Preeminent Captain");
    spawn(game, "Grizzly Bears");
    const guard = enter(game, "Kinsbaile Borderguard");
    expect(counters(game, guard)).toBe(2);
    game.state.objects[guard].counters["-1/-1"] = 1;
    destroy(game, guard);
    expect(tokensNamed(game, "Kithkin Soldier Token", A)).toBe(3);
  });
});

describe("Veteran's Armaments", () => {
  it("may attach to an opponent's Soldier as it enters", () => {
    const { game, a } = table();
    const arm = spawn(game, "Veteran's Armaments");
    pickModes(a, 0);
    const theirs = enter(game, "Elite Vanguard", B);
    expect(game.state.objects[arm].attachedTo).toBe(theirs);
    expect(controller(game, arm)).toBe(A);
  });

  it("the equipped creature gets +1/+1 for each attacking creature when it attacks", () => {
    const { game, a } = table();
    const arm = spawn(game, "Veteran's Armaments");
    pickModes(a, 0);
    const vanguard = enter(game, "Elite Vanguard");
    expect(game.state.objects[arm].attachedTo).toBe(vanguard);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [vanguard, bears]);
    expect(pt(game, vanguard)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Warren Weirding", () => {
  it("a sacrificed Goblin gives its controller two hasty Goblin Rogues", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const piker = spawn(game, "Goblin Piker", B);
    cast(game, toHand(game, "Warren Weirding"), { targets: [ref(B)] });
    expect(zone(game, piker)).toBe("graveyard");
    expect(tokensNamed(game, "Goblin Rogue Token", B)).toBe(2);
    expect(tokensNamed(game, "Goblin Rogue Token", A)).toBe(0);
    const rogue = Object.values(game.state.objects).find(
      (o) => o.cardName === "Goblin Rogue Token" && o.zone === "battlefield",
    );
    expect(keywords(game, rogue!.id).has("haste")).toBe(true);
  });

  it("a non-Goblin makes nothing", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Warren Weirding"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Goblin Rogue Token", B)).toBe(0);
  });
});

describe("Fendeep Summoner", () => {
  it("turns two target Swamps into 3/5 Treefolk Warriors that are still lands", () => {
    const { game, a } = table();
    const summoner = spawn(game, "Fendeep Summoner");
    const [s1, s2, s3] = lands(game, "Swamp", 3);
    pickTargets(a, s1, s2);
    activate(game, summoner, 0, { targets: [ref(s1), ref(s2)] });
    for (const s of [s1, s2]) {
      expect(types(game, s)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(pt(game, s)).toEqual({ power: 3, toughness: 5 });
    }
    expect(types(game, s3)).not.toContain("creature");
  });
});

describe("Meadowboon", () => {
  it("evoked, it puts a counter on each creature the target player controls", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, A);
    const boon = toHand(game, "Meadowboon");
    cast(game, boon, { evoke: true });
    expect(zone(game, boon)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Boldwyr Heavyweights", () => {
  it("each opponent may put a creature from their library onto the battlefield under their control", () => {
    const { game, b } = table();
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickModes(b, 0);
    pickFromZone(b, bears);
    const before = hand(game, A).length;
    enter(game, "Boldwyr Heavyweights");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
    expect(hand(game, A).length).toBe(before);
  });
});
