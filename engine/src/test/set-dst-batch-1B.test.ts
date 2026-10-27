// Darksteel (DST), batch B214 group B: the cards whose behaviour is more
// than a stat line.

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  lands,
  life,

  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** The seat casts up to `times` of whatever's offered, free, aimed at
 * `targets`; declines after. */
function castCopies(seat: ScriptedController, times: number, targets: readonly TargetRef[] = []): { cast: ObjectId[] } {
  const seen = { cast: [] as ObjectId[] };
  seat.chooseCastNowFn = (_view, offer) => {
    if (seen.cast.length >= times || offer.casts.length === 0) return null;
    const way = offer.casts[0];
    seen.cast.push(way.card);
    return {
      type: "cast-spell",
      player: seat.playerId,
      card: way.card,
      targets,
      via: way.via,
      ...(offer.free ? { free: true } : {}),
    };
  };
  return seen;
}

describe("Arcbound Fiend", () => {
  it("enters with three counters and, at upkeep, may move a +1/+1 counter from target creature onto itself", () => {
    const { game, a } = table();
    const fiend = enter(game, "Arcbound Fiend");
    expect(counters(game, fiend)).toBe(3);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 2;
    pickTargets(a, bears);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, fiend)).toBe(4);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Drooling Ogre", () => {
  it("goes to whoever casts an artifact spell", () => {
    const { game } = table();
    const ogre = spawn(game, "Drooling Ogre", B);
    cast(game, toHand(game, "Ornithopter"));
    expect(controller(game, ogre)).toBe(A);
  });
});

describe("Vex", () => {
  it("counters the spell, and that spell's controller may draw", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 3, B);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    const before = hand(game, A).length;
    const bobBefore = hand(game, B).length;
    pickModes(a, 0);
    cast(game, toHand(game, "Vex", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 1);
    expect(hand(game, B).length).toBe(bobBefore);
  });
});

describe("Spellbinder", () => {
  it("imprints an instant and casts a copy of it when the equipped creature deals combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const bolt = toHand(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    const binder = enter(game, "Spellbinder");
    expect(zone(game, bolt)).toBe("exile");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, binder, 0, { targets: [ref(bears)] });
    const seen = castCopies(a, 1, [ref(B)]);
    attack(game, a, [bears]);
    expect(seen.cast).toHaveLength(1);
    expect(life(game, B)).toBe(20 - 2 - 3);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("Fangren Firstborn", () => {
  it("puts a +1/+1 counter on each attacking creature", () => {
    const { game, a } = table();
    const fangren = spawn(game, "Fangren Firstborn");
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    attack(game, a, [fangren, bears]);
    expect(counters(game, fangren)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, home)).toBe(0);
  });
});

describe("Burden of Greed", () => {
  it("counts the tapped artifacts the target player controls", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Ornithopter", B, { tapped: true });
    spawn(game, "Ornithopter", B, { tapped: true });
    spawn(game, "Ornithopter", B);
    spawn(game, "Ornithopter", A, { tapped: true });
    cast(game, toHand(game, "Burden of Greed"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Hunger of the Nim", () => {
  it("gives +1/+0 for each artifact you control", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Hunger of the Nim"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Reap and Sow", () => {
  it("entwined: destroys the target land and puts a land from the library onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const theirs = spawn(game, "Island", B);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    cast(game, toHand(game, "Reap and Sow"), { kicked: true, modes: [0, 1], targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
  });
});

describe("Soulscour", () => {
  it("destroys every nonartifact permanent and leaves artifacts", () => {
    const { game } = table();
    const forests = lands(game, "Plains", 10);
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    cast(game, toHand(game, "Soulscour"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forests[0])).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
  });
});

describe("Dross Golem", () => {
  it("costs {1} less for each Swamp you control", () => {
    const { game } = table();
    // Two Swamps leave {3} to pay with two lands; three leave {2}.
    lands(game, "Swamp", 2);
    const golem = toHand(game, "Dross Golem");
    expect(() => cast(game, golem)).toThrow();
    spawn(game, "Swamp");
    cast(game, golem);
    expect(zone(game, golem)).toBe("battlefield");
  });
});
