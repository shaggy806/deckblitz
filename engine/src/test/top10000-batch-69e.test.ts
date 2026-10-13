/**
 * Batch 69, part e (2026-10-12): the cards moving counters (rule 122.5) and
 * putting a departed permanent's counters on another (rule 122.8) unblocked.
 * The effects themselves are `move-counters.test.ts`'s. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
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
  hand,
  keywords,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  types,
  subtypes,
  zone,
} from "./harness.js";

const setCounters = (game: Game, id: ObjectId, kinds: Record<string, number>): void => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, ...kinds };
};

/** Answer each modes question with the first mode whose text has the next
 * of `wants` ("no" answers a `may`'s question with none). */
function pickModeTexts(seat: ScriptedController, ...wants: readonly string[]): { asked: string[][] } {
  const seen = { asked: [] as string[][] };
  const queue = [...wants];
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    seen.asked.push([...texts]);
    const want = queue.shift();
    const i = want === undefined ? -1 : texts.findIndex((t) => t.includes(want));
    return i < 0 ? [] : [i];
  };
  return seen;
}

describe("Tidus, Yuna's Guardian", () => {
  it("may move a counter between two of your creatures at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Tidus, Yuna's Guardian");
    const from = spawn(game, "Grizzly Bears");
    const to = spawn(game, "Grizzly Bears");
    setCounters(game, from, { "+1/+1": 1, flying: 1 });
    pickTargets(a, from, to);
    const asked = pickModeTexts(a, "Move", "flying");
    toStep(game, "begin-combat");
    settle(game);
    expect(asked.asked[1]).toEqual(["Move a +1/+1 counter", "Move a flying counter"]);
    expect(counters(game, to, "flying")).toBe(1);
    expect(counters(game, from, "flying")).toBe(0);
  });

  it("Cheer: may draw and proliferate when creatures with counters connect", () => {
    const { game, a } = table();
    const tidus = spawn(game, "Tidus, Yuna's Guardian");
    const bears = spawn(game, "Grizzly Bears");
    setCounters(game, bears, { "+1/+1": 1 });
    // The same creature both targets: no move is possible (rule 122.5), so
    // the combat "may" isn't asked at all. Yes to the cheer.
    pickTargets(a, bears, bears);
    const asked = pickModeTexts(a, "Draw");
    a.chooseProliferateFn = (_view, eligible) => eligible.filter((t) => t.kind === "object" && t.object === bears);
    const before = hand(game).length;
    attack(game, a, [bears, tidus]);
    settle(game);
    expect(asked.asked).toEqual([["Draw a card and proliferate?"]]);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, bears)).toBe(2);
  });

  it("Cheer doesn't trigger without a creature with counters dealing the damage", () => {
    const { game, a } = table();
    const tidus = spawn(game, "Tidus, Yuna's Guardian");
    pickModes(a, 0);
    const before = hand(game).length;
    attack(game, a, [tidus]);
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Graft (Llanowar Reborn, Plaxcaster Frogling)", () => {
  it("Llanowar Reborn enters tapped with a +1/+1 counter, and may move it onto a creature that enters", () => {
    const { game, a } = table();
    const reborn = enter(game, "Llanowar Reborn");
    expect(game.state.objects[reborn].tapped).toBe(true);
    expect(counters(game, reborn)).toBe(1);
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, reborn)).toBe(0);
    // With none left, the intervening if stops it (rule 603.4).
    const asked = pickModeTexts(a);
    enter(game, "Grizzly Bears");
    expect(asked.asked).toEqual([]);
  });

  it("Plaxcaster Frogling enters with three, grafts onto another creature, and grants shroud to one with a +1/+1 counter", () => {
    const { game, a } = table();
    const frog = enter(game, "Plaxcaster Frogling");
    expect(pt(game, frog)).toEqual({ power: 3, toughness: 3 });
    // Any other creature entering — an opponent's too; declined here.
    pickModes(a);
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
    pickModes(a, 0);
    const mine = enter(game, "Grizzly Bears");
    expect(counters(game, mine)).toBe(1);
    expect(counters(game, frog)).toBe(2);
    lands(game, "Forest", 4);
    // Not a creature without a +1/+1 counter.
    const offer = game.legalActions(A).find((x) => x.kind === "activate-ability" && x.source === frog);
    const options = offer?.kind === "activate-ability" ? (offer.targetOptions?.[0] ?? []) : [];
    expect(options).toContainEqual(ref(mine));
    expect(options).not.toContainEqual(ref(theirs));
    activate(game, frog, 0, { targets: [ref(mine)] });
    expect(keywords(game, mine).has("shroud")).toBe(true);
  });
});

describe("Costume Closet", () => {
  it("enters with two counters and moves one onto your creature at sorcery speed", () => {
    const { game } = table();
    const closet = enter(game, "Costume Closet");
    expect(counters(game, closet)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, closet, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, closet)).toBe(1);
  });

  it("gets a counter when a modified creature you control leaves, not an unmodified one", () => {
    const { game } = table();
    const closet = enter(game, "Costume Closet");
    const plain = spawn(game, "Grizzly Bears");
    const modified = spawn(game, "Grizzly Bears");
    setCounters(game, modified, { "+1/+1": 1 });
    destroy(game, plain);
    expect(counters(game, closet)).toBe(2);
    destroy(game, modified);
    expect(counters(game, closet)).toBe(3);
  });
});

describe("Essence Channeler", () => {
  it("has flying and vigilance once you've lost life this turn", () => {
    const { game } = table();
    const channeler = spawn(game, "Essence Channeler");
    expect(keywords(game, channeler).has("flying")).toBe(false);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1 }, []);
    expect(keywords(game, channeler).has("flying")).toBe(true);
    expect(keywords(game, channeler).has("vigilance")).toBe(true);
  });

  it("grows when you gain life, and puts every counter it died with on your creature", () => {
    const { game, a } = table();
    const channeler = spawn(game, "Essence Channeler");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    settle(game);
    expect(counters(game, channeler)).toBe(1);
    setCounters(game, channeler, { flying: 1 });
    pickTargets(a, bears);
    destroy(game, channeler);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, bears, "flying")).toBe(1);
  });
});

describe("Reluctant Role Model", () => {
  it("Survival: puts the counter of your choice on it if it's tapped as your second main phase begins", () => {
    const { game, a } = table();
    const model = spawn(game, "Reluctant Role Model");
    pickModeTexts(a, "lifelink");
    attack(game, a, [model]);
    settle(game);
    expect(counters(game, model, "lifelink")).toBe(1);
  });

  it("puts a dying creature's counters on up to one target creature", () => {
    const { game, a } = table();
    spawn(game, "Reluctant Role Model");
    const dying = spawn(game, "Grizzly Bears");
    const target = spawn(game, "Grizzly Bears", B);
    setCounters(game, dying, { "+1/+1": 2 });
    pickTargets(a, target);
    destroy(game, dying);
    expect(counters(game, target)).toBe(2);
  });

  it("sees itself die too", () => {
    const { game, a } = table();
    const model = spawn(game, "Reluctant Role Model");
    const target = spawn(game, "Grizzly Bears");
    setCounters(game, model, { flying: 1 });
    pickTargets(a, target);
    destroy(game, model);
    expect(counters(game, target, "flying")).toBe(1);
  });
});

describe("Iron Apprentice", () => {
  it("enters with a +1/+1 counter and passes it on as it dies", () => {
    const { game, a } = table();
    const apprentice = enter(game, "Iron Apprentice");
    expect(pt(game, apprentice)).toEqual({ power: 1, toughness: 1 });
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    destroy(game, apprentice);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Donatello, Mutant Mechanic", () => {
  it("makes a noncreature artifact a 0/0 Robot with three counters", () => {
    const { game } = table();
    const donatello = spawn(game, "Donatello, Mutant Mechanic");
    const rock = spawn(game, "Mind Stone");
    activate(game, donatello, 0, { targets: [ref(rock)] });
    expect(types(game, rock)).toContain("creature");
    expect(subtypes(game, rock)).toContain("Robot");
    expect(pt(game, rock)).toEqual({ power: 3, toughness: 3 });
  });

  it("puts a departed artifact's counters on up to one artifact or creature you control", () => {
    const { game, a } = table();
    spawn(game, "Donatello, Mutant Mechanic");
    const rock = spawn(game, "Mind Stone");
    const bears = spawn(game, "Grizzly Bears");
    setCounters(game, rock, { charge: 2 });
    pickTargets(a, bears);
    destroy(game, rock);
    expect(counters(game, bears, "charge")).toBe(2);
  });
});

describe("Broodguard Elite", () => {
  it("enters with X counters, warped too, and puts its counters on your creature as it leaves", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Broodguard Elite"), { via: "warp", x: 2 });
    const elite = game.battlefield.find((id) => game.state.objects[id].cardName === "Broodguard Elite");
    expect(elite).toBeDefined();
    expect(counters(game, elite!)).toBe(2);
    pickTargets(a, bears);
    destroy(game, elite!);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Host of the Hereafter", () => {
  it("enters with two counters, and passes its own on as it dies", () => {
    const { game, a } = table();
    const host = enter(game, "Host of the Hereafter");
    expect(counters(game, host)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    destroy(game, host);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Resourceful Defense", () => {
  it("puts a departed permanent's counters on a target permanent you control", () => {
    const { game, a } = table();
    spawn(game, "Resourceful Defense");
    const rock = spawn(game, "Mind Stone");
    const bears = spawn(game, "Grizzly Bears");
    setCounters(game, rock, { charge: 1 });
    pickTargets(a, bears);
    destroy(game, rock);
    expect(counters(game, bears, "charge")).toBe(1);
    expect(zone(game, rock)).toBe("graveyard");
  });
});

describe("Forgotten Ancient", () => {
  it("may grow whenever a player casts a spell", () => {
    const { game, a, b } = table();
    const ancient = spawn(game, "Forgotten Ancient");
    pickModes(a, 0);
    void b;
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, ancient)).toBe(1);
  });
});
