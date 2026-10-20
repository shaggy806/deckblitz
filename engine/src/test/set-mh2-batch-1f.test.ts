/**
 * Modern Horizons 2, group f: Goblin Traprunner, Arcbound Shikari, Timeless Dragon, Wren's Run
 * Hydra, Paradox Zone, Ezzaroot Channeler, Drey Keeper, Scuttletide, Arcus Acolyte, Prismatic
 * Ending, Barbed Spike, Fiery Encore, Graceful Restoration, Flame Blitz, Tragic Fall, Magus of
 * the Bridge, Tourach's Canticle and Lucid Dreams — the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Goblin Traprunner", () => {
  it("makes one tapped, attacking Goblin per flip won, of three", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game, a } = table({ seed });
      const runner = spawn(game, "Goblin Traprunner");
      a.declareAttackersFn = () => [{ attacker: runner, defender: B }];
      toStep(game, "declare-blockers");
      settle(game);
      const flips = game.eventsOfType("coin-flipped").filter((e) => e.player === A);
      expect(flips).toHaveLength(3);
      const won = flips.filter((e) => e.won).length;
      expect(tokensNamed(game, "Goblin Token", A)).toBe(won);
      for (const goblin of named(game, "Goblin Token", A)) {
        expect(game.state.objects[goblin].tapped).toBe(true);
      }
    }
  });
});

describe("Arcbound Shikari", () => {
  it("enters with two +1/+1 counters and gives each other artifact creature one", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const shikari = enter(game, "Arcbound Shikari");
    expect(counters(game, shikari)).toBe(2);
    expect(counters(game, thopter)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Wren's Run Hydra", () => {
  it("reinforce X from hand: discard it, X counters on the target", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 5);
    const hydra = toHand(game, "Wren's Run Hydra");
    activate(game, hydra, 0, { targets: [ref(bears)], x: 3 });
    expect(zone(game, hydra)).toBe("graveyard");
    expect(counters(game, bears)).toBe(3);
  });
});

describe("Paradox Zone", () => {
  it("doubles its growth counters first, then makes a Fractal with that many +1/+1 counters", () => {
    const { game } = table();
    const zoneCard = enter(game, "Paradox Zone");
    expect(counters(game, zoneCard, "growth")).toBe(1);
    toStep(game, "end");
    settle(game);
    expect(counters(game, zoneCard, "growth")).toBe(2);
    const [fractal] = named(game, "Fractal Token", A);
    expect(counters(game, fractal!)).toBe(2);
    expect(pt(game, fractal!)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Ezzaroot Channeler", () => {
  it("creature spells cost {X} less, X the life gained this turn", () => {
    const { game } = table();
    const channeler = spawn(game, "Ezzaroot Channeler");
    activate(game, channeler, 0);
    expect(life(game)).toBe(22);
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant"); // {3}{R}, now {1}{R}
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("without life gained, no reduction", () => {
    const { game } = table();
    spawn(game, "Ezzaroot Channeler");
    lands(game, "Mountain", 2);
    expect(() => cast(game, toHand(game, "Hill Giant"))).toThrow();
  });
});

describe("Drey Keeper", () => {
  it("two Squirrels; the pump gives only Squirrels +1/+0 and menace", () => {
    const { game } = table();
    const keeper = enter(game, "Drey Keeper");
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
    lands(game, "Swamp", 4);
    activate(game, keeper, 0);
    const [squirrel] = named(game, "Squirrel Token", A);
    expect(pt(game, squirrel!)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, keeper)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Scuttletide", () => {
  it("Crabs get +1/+1 only with delirium", () => {
    const { game } = table();
    spawn(game, "Scuttletide");
    const crab = spawn(game, "Crab Token");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Forest");
    expect(pt(game, crab)).toEqual({ power: 0, toughness: 3 });
    toGraveyard(game, "Sol Ring");
    expect(pt(game, crab)).toEqual({ power: 1, toughness: 4 });
  });
});

describe("Arcus Acolyte", () => {
  it("another creature without a +1/+1 counter has outlast, and loses it once it has one", () => {
    const { game } = table();
    spawn(game, "Arcus Acolyte");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    activate(game, bears, 0);
    expect(counters(game, bears)).toBe(1);
    game.state.objects[bears].tapped = false;
    expect(game.canDispatch({ type: "activate-ability", player: A, source: bears, abilityIndex: 0, targets: [] })).not.toBeNull();
  });
});

describe("Prismatic Ending", () => {
  it("exiles a permanent whose mana value is at most the colors spent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Prismatic Ending"), { targets: [ref(bears)], x: 1 });
    expect(zone(game, bears)).toBe("exile");
  });

  it("checks on resolution: one color spent doesn't exile a two-drop", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Prismatic Ending"), { targets: [ref(bears)], x: 1 });
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Barbed Spike", () => {
  it("makes a Thopter and attaches to it", () => {
    const { game } = table();
    const spike = enter(game, "Barbed Spike");
    const [thopter] = named(game, "Thopter Token", A);
    expect(game.state.objects[spike].attachedTo).toBe(thopter);
    expect(pt(game, thopter!)).toEqual({ power: 2, toughness: 1 });
  });
});

describe("Fiery Encore", () => {
  it("discarding a nonland card deals its mana value to a creature, and draws", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const giant = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [giant];
    a.chooseFromZoneFn = () => [giant];
    pickTargets(a, wurm);
    lands(game, "Mountain", 5);
    const encore = toHand(game, "Fiery Encore");
    const before = hand(game).length;
    cast(game, encore);
    expect(graveyard(game)).toContain(giant);
    expect(hand(game).length).toBe(before - 1 - 1 + 1);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Graceful Restoration", () => {
  it("the second mode returns up to two power-2-or-less creature cards", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const thopter = toGraveyard(game, "Ornithopter");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const spell = toHand(game, "Graceful Restoration");
    expect(() => cast(game, spell, { modes: [1], targets: [ref(giant), ref(bears)] })).toThrow();
    cast(game, spell, { modes: [1], targets: [ref(bears), ref(thopter)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(counters(game, bears)).toBe(0);
  });

  it("the first mode returns any creature card with a +1/+1 counter", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Graceful Restoration"), { modes: [0], targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Flame Blitz", () => {
  it("deals 5 to each planeswalker at your end step", () => {
    const { game } = table();
    spawn(game, "Flame Blitz");
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 6;
    toStep(game, "end");
    settle(game);
    expect(counters(game, walker, "loyalty")).toBe(1);
  });
});

describe("Tragic Fall", () => {
  it("-3/-3 with cards in hand", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Tragic Fall"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });

  it("hellbent: -13/-13 with no other cards in hand", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Tragic Fall"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Magus of the Bridge", () => {
  it("a nontoken creature of yours dying makes a Zombie; a token doesn't", () => {
    const { game } = table();
    spawn(game, "Magus of the Bridge");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    destroy(game, named(game, "Zombie Token", A)[0]!);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("goes by owner: your creature an opponent controls makes a Zombie; theirs exiles the Magus", () => {
    const { game } = table();
    const magus = spawn(game, "Magus of the Bridge");
    const stolen = spawn(game, "Grizzly Bears");
    game.state.objects[stolen].controller = B;
    destroy(game, stolen);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(zone(game, magus)).toBe("battlefield");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(zone(game, magus)).toBe("exile");
  });
});

describe("Tourach's Canticle", () => {
  it("discards the chosen card, then one at random", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = () => [bears];
    lands(game, "Swamp", 4);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Tourach's Canticle"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toContain(bears);
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Lucid Dreams", () => {
  it("draws one card per card type in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Ornithopter"); // artifact creature
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 5);
    const dreams = toHand(game, "Lucid Dreams");
    const before = hand(game).length;
    cast(game, dreams);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});
