/**
 * Future Sight (FUT; B195), group E. One test per card whose behaviour is
 * more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
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
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The card named `name` that `player` owns in exile, if any. */
function inExile(game: Game, name: string, player: PlayerId = A): ObjectId | undefined {
  return game.state.zones.shared.exile.find(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].owner === player,
  );
}

describe("Reality Strobe", () => {
  it("bounces the permanent, then exiles itself suspended with three time counters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Reality Strobe"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    const strobe = inExile(game, "Reality Strobe");
    expect(strobe).toBeDefined();
    expect(counters(game, strobe!, "time")).toBe(3);
  });
});

describe("Festering March", () => {
  it("shrinks only the opponents' creatures and exiles itself with three time counters", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Festering March"));
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(counters(game, inExile(game, "Festering March")!, "time")).toBe(3);
  });
});

describe("Epochrasite", () => {
  it("enters with three counters when not cast from hand, and dies into suspend", () => {
    const { game, a } = table();
    const epo = enter(game, "Epochrasite");
    expect(counters(game, epo)).toBe(3);
    destroy(game, epo);
    const exiled = inExile(game, "Epochrasite");
    expect(exiled).toBeDefined();
    expect(counters(game, exiled!, "time")).toBe(3);
    // Three of its owner's upkeeps later it's cast from exile: not from the
    // hand, so it enters with the counters again, and with haste.
    a.chooseCastNowFn = (_view, offer) =>
      offer.casts.some((c) => c.card === exiled)
        ? { type: "cast-spell", player: A, card: exiled!, targets: [], via: "effect", free: true }
        : null;
    for (let i = 0; i < 6; i++) nextTurn(game);
    const [back] = named(game, "Epochrasite", A);
    expect(back).toBeDefined();
    expect(counters(game, back)).toBe(3);
    expect(game.state.objects[back].hastyUntilItLeaves).toBe(true);
  });

  it("cast from hand, enters with no counters", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Epochrasite"));
    const [epo] = named(game, "Epochrasite", A);
    expect(counters(game, epo)).toBe(0);
    expect(pt(game, epo)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Narcomoeba", () => {
  it("milled from the library, may be put onto the battlefield", () => {
    const { game, a } = table();
    toLibrary(game, "Narcomoeba");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", target: 0, amount: 1 }, [ref(A)]);
    settle(game);
    expect(named(game, "Narcomoeba", A)).toHaveLength(1);
  });

  it("doesn't trigger when it dies from the battlefield", () => {
    const { game, a } = table();
    const narco = spawn(game, "Narcomoeba");
    pickModes(a, 0);
    destroy(game, narco);
    expect(named(game, "Narcomoeba", A)).toHaveLength(0);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Narcomoeba")).toBe(true);
  });
});

describe("Bridge from Below", () => {
  it("in the graveyard, makes a Zombie for your nontoken creature and exiles itself for an opponent's", () => {
    const { game } = table();
    toGraveyard(game, "Bridge from Below");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(inExile(game, "Bridge from Below")).toBeDefined();
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("does nothing on the battlefield", () => {
    const { game } = table();
    spawn(game, "Bridge from Below");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });
});

describe("Barren Glory", () => {
  it("wins at upkeep only with no other permanents and an empty hand", () => {
    const { game } = table();
    spawn(game, "Barren Glory");
    const other = spawn(game, "Wastes");
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    nextTurn(game);
    nextTurn(game, "upkeep");
    expect(game.state.result?.over ?? false).toBe(false);
    destroy(game, other);
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    expect(hand(game)).toHaveLength(0);
    nextTurn(game, "draw");
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });
});

describe("Frenzy Sliver", () => {
  // Two Frenzy Slivers: two instances of frenzy 1 (the cumulative ruling).
  it("gives every Sliver, an opponent's too, +1/+0 per Frenzy Sliver when it attacks unblocked", () => {
    const { game, b } = table();
    spawn(game, "Frenzy Sliver");
    const theirs = spawn(game, "Frenzy Sliver", B);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: theirs, defender: A }];
    toStep(game, "combat-damage", B);
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 1 });
    toStep(game, "postcombat-main", B);
    expect(life(game, A)).toBe(17);
  });
});

describe("Quiet Disrepair", () => {
  it("destroys the enchanted artifact on the chosen mode", () => {
    const { game, a } = table();
    const relic = spawn(game, "Sol Ring", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Quiet Disrepair"), { targets: [ref(relic)] });
    expect(named(game, "Quiet Disrepair", A)).toHaveLength(1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(zone(game, relic)).toBe("graveyard");
  });
});

describe("Aven Augur", () => {
  it("can be sacrificed only during your upkeep, to bounce two creatures", () => {
    const { game } = table();
    const augur = spawn(game, "Aven Augur");
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, augur, 0, { targets: [ref(x), ref(y)] })).toThrow();
    nextTurn(game);
    nextTurn(game, "upkeep");
    activate(game, augur, 0, { targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("hand");
    expect(zone(game, y)).toBe("hand");
  });
});

describe("Goldmeadow Lookout", () => {
  it("makes a 1/1 Kithkin Soldier named Goldmeadow Harrier that taps creatures", () => {
    const { game, a } = table();
    const lookout = spawn(game, "Goldmeadow Lookout");
    lands(game, "Plains", 2);
    toHand(game, "Grizzly Bears");
    const before = hand(game).length;
    a.chooseDiscardsFn = (cards, count) => cards.slice(0, count).map((c) => c.id);
    activate(game, lookout, 0);
    expect(hand(game)).toHaveLength(before - 1);
    const [harrier] = named(game, "Goldmeadow Harrier Token", A);
    expect(harrier).toBeDefined();
    expect(game.state.objects[harrier].isToken).toBe(true);
    expect(pt(game, harrier)).toEqual({ power: 1, toughness: 1 });
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[harrier].summoningSick = false;
    activate(game, harrier, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Death Rattle", () => {
  it("can't target a green creature", () => {
    const { game } = table();
    const elf = spawn(game, "Llanowar Elves", B);
    lands(game, "Swamp", 6);
    expect(() => cast(game, toHand(game, "Death Rattle"), { targets: [ref(elf)] })).toThrow();
  });
});

describe("Cryptic Annelid", () => {
  it("scries 1, then 2, then 3", () => {
    const { game, a } = table();
    const seen: number[] = [];
    a.chooseScryFn = (_view, cards) => {
      seen.push(cards.length);
      return [];
    };
    enter(game, "Cryptic Annelid");
    expect(seen).toEqual([1, 2, 3]);
  });
});
