/**
 * Set walk batch 78, part d (2026-10-15): Lorwyn Eclipsed (ECL), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

describe("Explosive Prodigy", () => {
  it("deals X damage to a creature an opponent controls, X the colors among your permanents", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    // Only red (the Prodigy itself): 1 damage, the Bears live.
    enter(game, "Explosive Prodigy");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].damageMarked).toBe(1);
  });

  it("counts every color among your permanents, read as it resolves", () => {
    const { game } = table();
    const theirs = spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    // Red, green and white: 3 damage kills the 3/3 Giant.
    enter(game, "Explosive Prodigy");
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Retched Wretch", () => {
  it("dying with a -1/-1 counter, it returns without its abilities, and stays dead the next time", () => {
    const { game } = table();
    const wretch = spawn(game, "Retched Wretch");
    game.state.objects[wretch].counters["-1/-1"] = 1;
    destroy(game, wretch);
    const back = named(game, "Retched Wretch", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "-1/-1")).toBe(0);
    expect(pt(game, back[0])).toEqual({ power: 4, toughness: 2 });
    // It has lost the ability: a second death with a counter on it doesn't return it.
    game.state.objects[back[0]].counters["-1/-1"] = 1;
    destroy(game, back[0]);
    expect(named(game, "Retched Wretch")).toHaveLength(0);
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Retched Wretch")).toBe(true);
  });

  it("without a -1/-1 counter it stays in the graveyard", () => {
    const { game } = table();
    const wretch = spawn(game, "Retched Wretch");
    game.state.objects[wretch].counters["+1/+1"] = 1;
    destroy(game, wretch);
    expect(named(game, "Retched Wretch")).toHaveLength(0);
  });

  it("returns under its owner's control", () => {
    const { game } = table();
    const wretch = spawn(game, "Retched Wretch", B);
    game.state.objects[wretch].controller = A;
    game.state.objects[wretch].counters["-1/-1"] = 1;
    destroy(game, wretch);
    expect(named(game, "Retched Wretch", B)).toHaveLength(1);
    expect(named(game, "Retched Wretch", A)).toHaveLength(0);
  });
});

describe("Mistmeadow Council", () => {
  it("costs {1} less while you control a Kithkin, and draws a card as it enters", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const council = toHand(game, "Mistmeadow Council");
    expect(() => cast(game, council)).toThrow();
    makeToken(game, "Kithkin Token");
    const before = hand(game, A).length;
    cast(game, council);
    expect(named(game, "Mistmeadow Council", A)).toHaveLength(1);
    // The Council left the hand and a card was drawn.
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Noggle Robber", () => {
  it("creates a Treasure as it enters and another as it dies", () => {
    const { game } = table();
    const robber = enter(game, "Noggle Robber");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    destroy(game, robber);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });
});

describe("Boggart Prankster", () => {
  it("whenever you attack, an attacking Goblin you control gets +1/+0", () => {
    const { game, a } = table();
    spawn(game, "Boggart Prankster");
    const brute = spawn(game, "Boggart Brute");
    const bears = spawn(game, "Grizzly Bears");
    // The Prankster stays home; the Brute is the only attacking Goblin.
    attack(game, a, [brute, bears]);
    expect(pt(game, brute)).toEqual({ power: 4, toughness: 2 });
    expect(life(game, B)).toBe(20 - 4 - 2);
  });

  it("does nothing when no attacking Goblin is there to target", () => {
    const { game, a } = table();
    const prankster = spawn(game, "Boggart Prankster");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, prankster)).toEqual({ power: 1, toughness: 3 });
    expect(life(game, B)).toBe(18);
  });
});

describe("Luminollusk", () => {
  it("has deathtouch and gains life for each color among your permanents", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions", B);
    const snail = enter(game, "Luminollusk");
    expect(keywords(game, snail).has("deathtouch")).toBe(true);
    // Green and red — the opponent's white doesn't count, nor a second green.
    expect(life(game, A)).toBe(22);
  });
});

describe("Encumbered Reejerey", () => {
  it("enters with three -1/-1 counters and sheds one each time it becomes tapped", () => {
    const { game, a } = table();
    const reejerey = enter(game, "Encumbered Reejerey");
    expect(counters(game, reejerey, "-1/-1")).toBe(3);
    expect(pt(game, reejerey)).toEqual({ power: 2, toughness: 1 });
    // Attacking taps it: the counter comes off before damage.
    attack(game, a, [reejerey]);
    expect(counters(game, reejerey, "-1/-1")).toBe(2);
    expect(life(game, B)).toBe(17);
  });

  it("with no -1/-1 counter it doesn't trigger", () => {
    const { game } = table();
    const reejerey = spawn(game, "Encumbered Reejerey");
    delete game.state.objects[reejerey].counters["-1/-1"];
    const waiting = (): number => game.state.pendingTriggers.length + game.state.zones.shared.stack.length;
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(reejerey)]);
    expect(waiting()).toBe(0);
    settle(game);
    // With a counter on it, an opponent's tap effect triggers it.
    game.state.objects[reejerey].tapped = false;
    game.state.objects[reejerey].counters["-1/-1"] = 1;
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(reejerey)]);
    expect(waiting()).toBe(1);
    settle(game);
    expect(counters(game, reejerey, "-1/-1")).toBe(0);
  });
});

describe("Reluctant Dounguard", () => {
  it("sheds a -1/-1 counter for each other creature of yours entering, until it has none", () => {
    const { game } = table();
    const guard = enter(game, "Reluctant Dounguard");
    expect(counters(game, guard, "-1/-1")).toBe(2);
    enter(game, "Grizzly Bears", B);
    expect(counters(game, guard, "-1/-1")).toBe(2);
    enter(game, "Grizzly Bears");
    expect(counters(game, guard, "-1/-1")).toBe(1);
    enter(game, "Grizzly Bears");
    enter(game, "Grizzly Bears");
    expect(counters(game, guard, "-1/-1")).toBe(0);
    expect(pt(game, guard)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Glister Bairn", () => {
  it("at the beginning of your combat, another creature you control gets +X/+X", () => {
    const { game, a } = table();
    const bairn = spawn(game, "Glister Bairn");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    // Blue, green (the Bairn) and red: X = 3.
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bairn)).toEqual({ power: 1, toughness: 4 });
  });

  it("can't target itself", () => {
    const { game } = table();
    const bairn = spawn(game, "Glister Bairn");
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bairn)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Appeal to Eirdu", () => {
  it("gives one or two target creatures +2/+1", () => {
    const { game } = table();
    lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Appeal to Eirdu"), { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 4 });
    const lions = spawn(game, "Savannah Lions");
    cast(game, toHand(game, "Appeal to Eirdu"), { targets: [ref(lions), null] });
    expect(pt(game, lions)).toEqual({ power: 4, toughness: 2 });
  });

  it("has convoke", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const helpers = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    cast(game, toHand(game, "Appeal to Eirdu"), {
      targets: [ref(helpers[0]), null],
      convoke: helpers.map((creature) => ({ creature })),
    });
    expect(helpers.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(pt(game, helpers[0])).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Wanderwine Distracter", () => {
  it("whenever it becomes tapped, a creature an opponent controls gets -3/-0", () => {
    const { game, a } = table();
    const distracter = spawn(game, "Wanderwine Distracter");
    const mine = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Hill Giant", B);
    attack(game, a, [distracter]);
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Kithkeeper", () => {
  it("makes a Kithkin for each color among your permanents", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Coral Merfolk");
    enter(game, "Kithkeeper");
    // White, green, blue.
    expect(tokensNamed(game, "Kithkin Token", A)).toBe(3);
  });

  it("taps three untapped creatures — itself and new ones included — for +3/+0 and flying", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    const keeper = enter(game, "Kithkeeper");
    expect(tokensNamed(game, "Kithkin Token", A)).toBe(2);
    activate(game, keeper);
    expect(pt(game, keeper)).toEqual({ power: 6, toughness: 3 });
    expect(keywords(game, keeper).has("flying")).toBe(true);
    const tapped = game.battlefield.filter((id) => game.state.objects[id].controller === A && game.state.objects[id].tapped);
    expect(tapped.length).toBeGreaterThanOrEqual(1);
  });

  it("can't be activated with only two creatures", () => {
    const { game } = table();
    const keeper = spawn(game, "Kithkeeper");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, keeper)).toThrow();
  });
});

describe("Tributary Vaulter", () => {
  it("has flying, and whenever it becomes tapped another Merfolk you control gets +2/+0", () => {
    const { game, a } = table();
    const vaulter = spawn(game, "Tributary Vaulter");
    const merfolk = spawn(game, "Coral Merfolk");
    expect(keywords(game, vaulter).has("flying")).toBe(true);
    attack(game, a, [vaulter]);
    expect(pt(game, merfolk)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, vaulter)).toEqual({ power: 1, toughness: 3 });
  });

  it("doesn't pump itself or an opponent's Merfolk", () => {
    const { game, a } = table();
    const vaulter = spawn(game, "Tributary Vaulter");
    const theirs = spawn(game, "Coral Merfolk", B);
    attack(game, a, [vaulter]);
    expect(pt(game, vaulter)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Kulrath Mystic", () => {
  it("a spell with mana value 4 or greater gives it +2/+0 and vigilance; a smaller one doesn't", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 4);
    const mystic = spawn(game, "Kulrath Mystic");
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pt(game, mystic)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, mystic).has("vigilance")).toBe(false);
    cast(game, toHand(game, "Hill Giant"));
    expect(pt(game, mystic)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mystic).has("vigilance")).toBe(true);
  });
});

describe("Pummeler for Hire", () => {
  it("gains life equal to the greatest power among Giants you control", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    game.state.objects[giant].counters["+1/+1"] = 3;
    spawn(game, "Craw Wurm");
    const theirs = spawn(game, "Hill Giant", B);
    game.state.objects[theirs].counters["+1/+1"] = 10;
    const pummeler = enter(game, "Pummeler for Hire");
    // The 6/6 Hill Giant: not the 6/4 Wurm (no Giant) nor bob's 13/13 Giant.
    expect(life(game, A)).toBe(26);
    expect(keywords(game, pummeler).has("reach")).toBe(true);
    expect(keywords(game, pummeler).has("vigilance")).toBe(true);
  });

  it("counts itself", () => {
    const { game } = table();
    enter(game, "Pummeler for Hire");
    expect(life(game, A)).toBe(24);
  });
});
