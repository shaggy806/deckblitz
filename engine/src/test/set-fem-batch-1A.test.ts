/**
 * Fallen Empires, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  type BlockOffer,
  activate,
  blockOffer,
  cast,
  controller,
  counters,
  hand,
  lands,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

function activateWith(
  game: Game,
  source: ObjectId,
  extra: { sacrifice?: ObjectId; tap?: readonly ObjectId[]; targets?: ReturnType<typeof ref>[] },
): void {
  const action = {
    type: "activate-ability" as const,
    player: A,
    source,
    abilityIndex: 0,
    targets: extra.targets ?? [],
    ...(extra.sacrifice !== undefined ? { sacrifice: extra.sacrifice } : {}),
    ...(extra.tap !== undefined ? { tap: extra.tap } : {}),
  };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(`activate refused: ${why}`);
  game.dispatch(action);
  settle(game);
}

describe("Hymn to Tourach", () => {
  it("makes the target player discard two cards", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Hymn to Tourach"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Rainbow Vale", () => {
  it("goes to an opponent at the next end step only once it was tapped for mana", () => {
    const { game } = table();
    const vale = spawn(game, "Rainbow Vale");
    const untouched = spawn(game, "Rainbow Vale");
    activate(game, vale, 0);
    expect(controller(game, vale)).toBe(A);
    toStep(game, "end");
    settle(game);
    expect(controller(game, vale)).toBe(B);
    expect(controller(game, untouched)).toBe(A);
  });
});

describe("Goblin Warrens", () => {
  it("sacrifices two Goblins for three Goblin tokens", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const warrens = spawn(game, "Goblin Warrens");
    spawn(game, "Goblin Token");
    spawn(game, "Goblin Token");
    activate(game, warrens, 0);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(3);
  });
});

describe("Thelonite Druid", () => {
  it("can sacrifice itself to make your Forests 2/3 creatures until end of turn", () => {
    const { game } = table();
    const forests = lands(game, "Forest", 3);
    const druid = spawn(game, "Thelonite Druid");
    activateWith(game, druid, { sacrifice: druid });
    expect(zone(game, druid)).toBe("graveyard");
    const animated = forests.filter((id) => types(game, id).includes("creature"));
    expect(animated).toHaveLength(3);
    for (const id of animated) {
      expect(types(game, id)).toContain("land");
      expect(pt(game, id)).toEqual({ power: 2, toughness: 3 });
    }
  });
});

describe("Hand of Justice", () => {
  it("taps three other white creatures to destroy a creature", () => {
    const { game } = table();
    const justice = spawn(game, "Hand of Justice");
    const lions = [spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions"), spawn(game, "Savannah Lions")];
    const bears = spawn(game, "Grizzly Bears", B);
    activateWith(game, justice, { tap: lions, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    for (const id of lions) expect(game.state.objects[id].tapped).toBe(true);
  });

  it("can't be paid with only two other white creatures", () => {
    const { game } = table();
    const justice = spawn(game, "Hand of Justice");
    spawn(game, "Savannah Lions");
    spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, justice, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Ebon Praetor", () => {
  it("gets a -2/-2 counter each upkeep, and sacrificing a Thrull trades it for a +1/+0 counter", () => {
    const { game } = table();
    const praetor = spawn(game, "Ebon Praetor");
    const thrull = spawn(game, "Thrull Token");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, praetor, "-2/-2")).toBe(1);
    expect(pt(game, praetor)).toEqual({ power: 3, toughness: 3 });
    activateWith(game, praetor, { sacrifice: thrull });
    expect(counters(game, praetor, "-2/-2")).toBe(0);
    expect(counters(game, praetor, "+1/+0")).toBe(1);
    expect(pt(game, praetor)).toEqual({ power: 6, toughness: 5 });
  });

  it("can't be activated outside your upkeep", () => {
    const { game } = table();
    const praetor = spawn(game, "Ebon Praetor");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activateWith(game, praetor, { sacrifice: bears })).toThrow();
  });
});

describe("Thrull Champion", () => {
  it("pumps Thrulls, itself included, and steals one", () => {
    const { game } = table();
    const champion = spawn(game, "Thrull Champion");
    const thrull = spawn(game, "Thrull Token", B);
    expect(pt(game, champion)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, thrull)).toEqual({ power: 1, toughness: 2 });
    activate(game, champion, 0, { targets: [ref(thrull)] });
    expect(controller(game, thrull)).toBe(A);
  });
});

describe("Breeding Pit", () => {
  it("makes a 0/1 Thrull at your end step", () => {
    const { game } = table();
    spawn(game, "Breeding Pit");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Thrull Token", A)).toBe(1);
    const [thrull] = named(game, "Thrull Token", A);
    expect(pt(game, thrull)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Orcish Veteran", () => {
  it("can't block a white creature with power 2 or greater, but can block others", () => {
    const { game, a } = table();
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    const veteran = spawn(game, "Orcish Veteran", B);
    const offer = blockOffer(game, a, [lions, bears]);
    expect(canBlock(offer, veteran)).toEqual([bears]);
  });
});
