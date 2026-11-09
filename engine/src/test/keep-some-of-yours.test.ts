/**
 * Each player chooses some of what's theirs and the rest are acted on: by count
 * (Covetous Elegy, Watchers of the Dead), by total power (Moorland Rescuer,
 * Phyrexian Dreadnought) or one apiece under what you chose (Sculpted Sunburst),
 * and "each creature not chosen this way" (Thunderwave). Choices go one at a
 * time from the active player, each knowing those before theirs (rule 101.4).
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import { fitsSoFar, fitsTogether, type ZoneChoiceTogether } from "../zone-choice-together.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  destroy,
  enter,
  lands,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
  ref,
  settle,
  spawn,
  type Table,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";
import { lastRollIn } from "../random-results.js";

const BEARS = "Grizzly Bears"; // 2/2
const DREADMAW = "Colossal Dreadmaw"; // 6/6
const SOLDIER = "Soldier Token"; // 1/1
const DREADNOUGHT = "Phyrexian Dreadnought";
const onField = (game: Game, id: ObjectId): boolean => zone(game, id) === "battlefield";

/** A compacted stack of real tokens: a batch of eight or more. */
function stackOf(game: Game, player: PlayerId, count: number): ObjectId {
  game.debugApplyEffect(player, { kind: "create-token", token: SOLDIER, count });
  const stack = game.state.zones.shared.battlefield.find(
    (id) => game.state.objects[id].cardName === SOLDIER && game.state.objects[id].controller === player,
  );
  if (stack === undefined || (game.state.objects[stack].stackCount ?? 1) !== count) {
    throw new Error(`expected one stack of ${count}`);
  }
  return stack;
}

describe("Covetous Elegy", () => {
  it("each player keeps up to two, the rest go at once, and the Treasures count what's left", () => {
    const { game, a, b, c } = table({ players: 3 });
    const mine = [spawn(game, BEARS, A), spawn(game, BEARS, A), spawn(game, BEARS, A)];
    const bobs = [spawn(game, BEARS, B), spawn(game, BEARS, B), spawn(game, BEARS, B)];
    const carols = [spawn(game, BEARS, C), spawn(game, BEARS, C)];
    lands(game, "Scrubland", 6, A);
    pickPermanents(a, mine[0]);
    pickPermanents(b, bobs[0], bobs[1]);
    // Up to: Carol may keep none, though she has only two.
    pickPermanents(c);
    cast(game, toHand(game, "Covetous Elegy", A));
    settle(game);
    expect(onField(game, mine[0])).toBe(true);
    expect(onField(game, mine[1])).toBe(false);
    expect(onField(game, bobs[1])).toBe(true);
    expect(onField(game, bobs[2])).toBe(false);
    expect(carols.some((id) => onField(game, id))).toBe(false);
    // Two of Bob's, none of Carol's; mine don't count.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(game.state.objects[named(game, "Treasure Token", A)[0]].tapped).toBe(true);
  });
});

describe("Thunderwave", () => {
  /** The first seed whose d20 lands in the row, its board built and cast. */
  function rolling(min: number, max: number, build: (t: Table) => void): Table {
    for (let seed = 1; seed < 400; seed += 1) {
      const t = table({ seed });
      lands(t.game, "Mountain", 4, A);
      build(t);
      cast(t.game, toHand(t.game, "Thunderwave", A));
      settle(t.game);
      const roll = lastRollIn(t.game.state)?.results[0] ?? 0;
      if (roll >= min && roll <= max) return t;
    }
    throw new Error(`no seed rolled ${min}-${max}`);
  }

  it("10-19: spares the one creature chosen, whoever's, and from a stack only that token", () => {
    let mine = "" as ObjectId;
    let theirs = "" as ObjectId;
    const { game } = rolling(10, 19, ({ game: g, a }) => {
      mine = spawn(g, BEARS, A);
      theirs = spawn(g, BEARS, B);
      pickPermanents(a, stackOf(g, A, 8));
    });
    expect(onField(game, mine)).toBe(false);
    expect(onField(game, theirs)).toBe(false);
    expect(tokensNamed(game, SOLDIER, A)).toBe(1);
  });

  it("10-19: an opponent's hexproof creature can be chosen, for it isn't a target", () => {
    let theirs = "" as ObjectId;
    let asked: { offered: readonly ObjectId[] } = { offered: [] };
    const { game } = rolling(10, 19, ({ game: g, a }) => {
      theirs = spawn(g, "Gladecover Scout", B);
      asked = pickPermanents(a, theirs);
    });
    expect(asked.offered).toContain(theirs);
    expect(onField(game, theirs)).toBe(true);
  });

  it("10-19: choosing nothing spares nothing", () => {
    let mine = "" as ObjectId;
    const { game } = rolling(10, 19, ({ game: g, a }) => {
      mine = spawn(g, BEARS, A);
      pickPermanents(a);
    });
    expect(onField(game, mine)).toBe(false);
  });

  it("1-9 hits each creature for 3, nobody asked", () => {
    let mine = "" as ObjectId;
    let big = "" as ObjectId;
    const { game } = rolling(1, 9, ({ game: g }) => {
      mine = spawn(g, BEARS, A);
      big = spawn(g, DREADMAW, B);
    });
    expect(onField(game, mine)).toBe(false);
    expect(onField(game, big)).toBe(true);
  });

  it("20 hits only your opponents' creatures, for 6", () => {
    let mine = "" as ObjectId;
    let big = "" as ObjectId;
    const { game } = rolling(20, 20, ({ game: g }) => {
      mine = spawn(g, BEARS, A);
      big = spawn(g, DREADMAW, B);
    });
    expect(onField(game, mine)).toBe(true);
    expect(onField(game, big)).toBe(false);
  });
});

describe("Sculpted Sunburst", () => {
  const board = (players: 2 | 3 = 3): Table => {
    const t = table({ players });
    lands(t.game, "Plains", 5, A);
    return t;
  };

  it("you choose first, each opponent among what's no stronger, and the rest are exiled", () => {
    const { game, a, b } = board();
    const mine = spawn(game, BEARS, A);
    const mineToo = spawn(game, DREADMAW, A);
    const bobsBear = spawn(game, BEARS, B);
    const bobsOther = spawn(game, BEARS, B);
    const bobsBig = spawn(game, DREADMAW, B);
    const carolsBig = spawn(game, DREADMAW, C);
    pickPermanents(a, mine);
    const bobAsked = pickPermanents(b, bobsBear);
    cast(game, toHand(game, "Sculpted Sunburst", A));
    settle(game);
    // Only what's power 2 or less was Bob's to choose.
    expect([...bobAsked.offered].sort()).toEqual([bobsBear, bobsOther].sort());
    expect(onField(game, mine)).toBe(true);
    expect(onField(game, bobsBear)).toBe(true);
    expect(zone(game, mineToo)).toBe("exile");
    expect(zone(game, bobsOther)).toBe("exile");
    expect(zone(game, bobsBig)).toBe("exile");
    // Carol has nothing that small: she chooses nothing, and loses it.
    expect(zone(game, carolsBig)).toBe("exile");
  });

  it("an equal power may be chosen, and a lone candidate is chosen unasked", () => {
    const { game, a } = board(2);
    const mine = spawn(game, DREADMAW, A);
    const bobs = spawn(game, DREADMAW, B);
    pickPermanents(a, mine);
    cast(game, toHand(game, "Sculpted Sunburst", A));
    settle(game);
    expect(onField(game, mine)).toBe(true);
    expect(onField(game, bobs)).toBe(true);
  });

  it("a negative power is compared as it is: 0 is greater than -1", () => {
    const { game, a, b } = board(2);
    const wall = spawn(game, "Wall of Omens", A);
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 }, [], { source: wall });
    const bobsZero = spawn(game, "Ornithopter", B);
    pickPermanents(a, wall);
    const bobAsked = pickPermanents(b, bobsZero);
    cast(game, toHand(game, "Sculpted Sunburst", A));
    settle(game);
    expect(bobAsked.offered).toEqual([]);
    expect(onField(game, wall)).toBe(true);
    expect(zone(game, bobsZero)).toBe("exile");
  });

  it("with no creature of yours, nothing is exiled and nobody chooses", () => {
    const { game, b } = board(2);
    const bobs = spawn(game, DREADMAW, B);
    const bobsToo = spawn(game, BEARS, B);
    const bobAsked = pickPermanents(b, bobs);
    cast(game, toHand(game, "Sculpted Sunburst", A));
    settle(game);
    expect(bobAsked.offered).toEqual([]);
    expect(onField(game, bobs)).toBe(true);
    expect(onField(game, bobsToo)).toBe(true);
  });
});

describe("Watchers of the Dead", () => {
  it("each opponent keeps two of their graveyard's cards; yours are untouched", () => {
    const { game, a, b } = table({ players: 3 });
    const watchers = spawn(game, "Watchers of the Dead", A);
    const mine = [toGraveyard(game, BEARS, A), toGraveyard(game, BEARS, A), toGraveyard(game, BEARS, A)];
    const bobs = [toGraveyard(game, BEARS, B), toGraveyard(game, DREADMAW, B), toGraveyard(game, BEARS, B)];
    const carols = [toGraveyard(game, BEARS, C), toGraveyard(game, BEARS, C)];
    pickFromZone(b, bobs[0], bobs[1]);
    pickFromZone(a);
    activate(game, watchers, 0);
    settle(game);
    expect(zone(game, watchers)).toBe("exile");
    expect(mine.every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(zone(game, bobs[0])).toBe("graveyard");
    expect(zone(game, bobs[1])).toBe("graveyard");
    expect(zone(game, bobs[2])).toBe("exile");
    // Two or fewer: none to exile.
    expect(carols.every((id) => zone(game, id) === "graveyard")).toBe(true);
  });
});

describe("Moorland Rescuer", () => {
  it("returns other creatures with total power up to the power it last had, then exiles itself", () => {
    const { game, a } = table();
    const rescuer = spawn(game, "Moorland Rescuer", A);
    // Its power as it died, not its printed 4 (the ruling).
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 }, [], { source: rescuer });
    const bear = toGraveyard(game, BEARS, A);
    const bearToo = toGraveyard(game, BEARS, A);
    const bigOne = toGraveyard(game, DREADMAW, A);
    const bobs = toGraveyard(game, BEARS, B);
    const asked = pickFromZone(a, bigOne);
    destroy(game, rescuer);
    settle(game);
    expect(asked.offered).not.toContain(rescuer);
    expect(asked.offered).not.toContain(bobs);
    expect(asked.offered).toContain(bear);
    expect(onField(game, bigOne)).toBe(true);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, bearToo)).toBe("graveyard");
    expect(zone(game, rescuer)).toBe("exile");
  });

  it("offers nothing over the cap, and may return nothing", () => {
    const { game, a } = table();
    const rescuer = spawn(game, "Moorland Rescuer", A);
    const bear = toGraveyard(game, BEARS, A);
    const bigOne = toGraveyard(game, DREADMAW, A);
    const asked = pickFromZone(a);
    destroy(game, rescuer);
    settle(game);
    expect(asked.offered).toEqual([bear]);
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, bigOne)).toBe("graveyard");
    expect(zone(game, rescuer)).toBe("exile");
  });
});

describe("Phyrexian Dreadnought", () => {
  const offered = (game: Game): Extract<LegalAction, { kind: "choose-permanents" }> => {
    const offer = game.legalActions(A).find((o) => o.kind === "choose-permanents");
    if (offer === undefined || offer.kind !== "choose-permanents") throw new Error("not asked");
    return offer;
  };

  it("with 12 power to sacrifice, they go at once and it stays", () => {
    const { game, a } = table();
    const big = [spawn(game, DREADMAW, A), spawn(game, DREADMAW, A)];
    const bear = spawn(game, BEARS, A);
    pickModes(a, 0);
    pickPermanents(a, ...big);
    const dread = enter(game, DREADNOUGHT, A);
    expect(onField(game, dread)).toBe(true);
    expect(big.some((id) => onField(game, id))).toBe(false);
    expect(onField(game, bear)).toBe(true);
    // One event: "whenever one or more" sees both.
    const sacrificed = game.state.eventLog.filter((e) => e.type === "permanent-sacrificed");
    expect(sacrificed).toHaveLength(2);
  });

  it("refuses a set short of 12", () => {
    const { game } = table();
    const big = spawn(game, DREADMAW, A);
    const bear = spawn(game, BEARS, A);
    game.debugApplyEffect(A, {
      kind: "choose-permanents",
      filter: { type: "creature", controlledBy: "you" },
      min: 1,
      upTo: 99,
      together: { totalPowerAtLeast: 12 },
      then: { kind: "sacrifice-target", target: 0 },
      prompt: "Sacrifice",
    });
    expect(offered(game).together?.rule).toBe("total");
    expect(() => game.dispatch({ type: "choose-permanents", player: A, permanents: [big, bear] })).toThrow(/total power/);
  });

  it("declining sacrifices it, and it may be sacrificed to itself: 12 on its own", () => {
    const declined = table();
    pickModes(declined.a);
    const gone = enter(declined.game, DREADNOUGHT, A);
    expect(zone(declined.game, gone)).toBe("graveyard");

    const own = table();
    const bear = spawn(own.game, BEARS, A);
    pickModes(own.a, 0);
    own.a.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => id !== bear);
    const dread = enter(own.game, DREADNOUGHT, A);
    expect(zone(own.game, dread)).toBe("graveyard");
    expect(onField(own.game, bear)).toBe(true);
  });

  it("each token of a stack counts", () => {
    const { game, a } = table();
    const stack = stackOf(game, A, 12);
    pickModes(a, 0);
    let copies: number | undefined;
    a.choosePermanentsFn = () => {
      copies = offered(game).copies?.[stack];
      return Array<ObjectId>(12).fill(stack);
    };
    const dread = enter(game, DREADNOUGHT, A);
    expect(copies).toBe(12);
    expect(tokensNamed(game, SOLDIER, A)).toBe(0);
    expect(onField(game, dread)).toBe(true);
  });

  it("no option short of 12: what can't reach it isn't offered, and it's sacrificed", () => {
    const { game, a } = table();
    const dread = spawn(game, DREADNOUGHT, A);
    // A -1/-1 counter, so nothing here reaches 12.
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "-1/-1", amount: 1 }, [], { source: dread });
    const asked = pickPermanents(a, dread);
    game.debugApplyEffect(
      A,
      {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "creature", controlledBy: "you" }, totalPowerAtLeast: 12, text: "Sacrifice" }],
        otherwise: { kind: "sacrifice-source" },
      },
      [],
      { source: dread },
    );
    settle(game);
    expect(asked.offered).toEqual([]);
    expect(zone(game, dread)).toBe("graveyard");
  });
});

describe("Moorland Rescuer, moved in response", () => {
  /** Dead, its trigger on the stack and nothing resolved. */
  function deadWithTheTriggerWaiting(game: Game, rescuer: ObjectId): void {
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(rescuer)]);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0 && s.priority.holder !== null);
  }

  it("exiled from the graveyard, the cards still return, by the power it last had (the rulings)", () => {
    const { game, a } = table();
    const rescuer = spawn(game, "Moorland Rescuer", A);
    const bear = toGraveyard(game, BEARS, A);
    pickFromZone(a, bear);
    deadWithTheTriggerWaiting(game, rescuer);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(rescuer)]);
    settle(game);
    expect(onField(game, bear)).toBe(true);
    expect(zone(game, rescuer)).toBe("exile");
  });

  it("back in hand, it isn't this card any more, and stays (rule 400.7)", () => {
    const { game, a } = table();
    const rescuer = spawn(game, "Moorland Rescuer", A);
    pickFromZone(a);
    deadWithTheTriggerWaiting(game, rescuer);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(rescuer)]);
    expect(zone(game, rescuer)).toBe("hand");
    settle(game);
    expect(zone(game, rescuer)).toBe("hand");
  });
});

describe("Moorland Rescuer's cap as a set", () => {
  it("two that fit alone but not together are refused", () => {
    const { game, a } = table();
    const rescuer = spawn(game, "Moorland Rescuer", A);
    const bear = toGraveyard(game, BEARS, A);
    const bearToo = toGraveyard(game, BEARS, A);
    const bearThree = toGraveyard(game, BEARS, A);
    let total = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toEqual(expect.arrayContaining([bear, bearToo, bearThree]));
      return [bear, bearToo, bearThree];
    };
    destroy(game, rescuer);
    settle(game);
    // Three asked for, the third over 4: a chooser's pick is cut to what fits.
    for (const id of [bear, bearToo, bearThree]) if (onField(game, id)) total += 2;
    expect(total).toBe(4);
  });
});

describe("a sum as the choice grows", () => {
  const together: ZoneChoiceTogether = {
    rule: "total",
    tags: { x: ["6"], y: ["7"], z: ["-1"] },
    atLeast: 12,
    text: "with total power 12 or greater",
  };

  it("short of the sum it can still grow, but isn't an answer; a cap can be broken", () => {
    expect(fitsSoFar(together, ["x" as ObjectId])).toBe(true);
    expect(fitsTogether(together, ["x" as ObjectId])).toBe(false);
    expect(fitsTogether(together, ["x", "y"] as ObjectId[])).toBe(true);
    // A negative power takes away.
    expect(fitsTogether(together, ["x", "y", "z", "z"] as ObjectId[])).toBe(false);
    const cap = { ...together, atLeast: undefined, atMost: 6, orNone: true };
    expect(fitsSoFar(cap, ["y" as ObjectId])).toBe(false);
  });
});
