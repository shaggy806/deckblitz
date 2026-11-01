/**
 * What a resolution moved "this way" into a hand, and the cards it exiled
 * moved on to their owners' hands:
 *
 * - the `"put-into-hand"` this-way kind — a search's find, a look's pick, a
 *   milled card taken back, a return, never a draw
 *   (`GameObject.handArrivalSeq`): Adventure Awaits' and Courier of
 *   Comestibles' "if you didn't put a card into your hand this way", Cache
 *   Grab's "returned a Squirrel card to your hand this way";
 * - the `move-exiled-this-way` effect to `"hand"`: Worlds Within Worlds'
 *   "then put all cards exiled this way into their owners' hands";
 * - a mandatory pick from the cards milled this way: Zoological Study's
 *   "return a creature card milled this way to your hand".
 */

import { describe, expect, it } from "vitest";

import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const run = (game: Game, effect: EffectSpec, targets: readonly ObjectId[] = []): void => {
  game.debugApplyEffect(A, effect, targets.map(ref), {});
  settle(game);
};

/** "…If you didn't put a card into your hand this way, you gain 4 life." */
const noneThisWay = (first: EffectSpec): EffectSpec => ({
  kind: "sequence",
  effects: [
    first,
    {
      kind: "conditional",
      condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
      then: { kind: "gain-life", amount: 4 },
    },
  ],
});

describe("put into a hand this way", () => {
  it("Adventure Awaits: a creature taken from the top five draws nothing more", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    pickFromZone(a, bears);
    const spell = toHand(game, "Adventure Awaits");
    const before = hand(game).length;
    cast(game, spell);
    expect(zone(game, bears)).toBe("hand");
    // The spell left the hand and the Bears came in: no draw.
    expect(hand(game).length).toBe(before);
  });

  it("…and taking nothing draws a card — the next one after the five went to the bottom", () => {
    const { game } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const spell = toHand(game, "Adventure Awaits");
    const before = hand(game).length;
    cast(game, spell);
    expect(zone(game, bears)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.slice(-5)).toContain(bears);
    expect(hand(game).length).toBe(before);
    expect(game.state.objects[hand(game)[hand(game).length - 1]].cardName).toBe("Wastes");
  });

  it("…and with no creature among them it draws too", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const spell = toHand(game, "Adventure Awaits");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before);
  });

  it("a card drawn isn't put into a hand this way", () => {
    const { game } = table();
    const before = life(game);
    run(game, noneThisWay({ kind: "draw", amount: 1 }));
    expect(life(game)).toBe(before + 4);
  });

  it("a card taken from a graveyard is, and so is a permanent returned", () => {
    const { game, a } = table();
    const dead = toGraveyard(game, "Grizzly Bears");
    pickFromZone(a, dead);
    const before = life(game);
    run(game, noneThisWay({ kind: "look-and-choose", zone: "graveyard", min: 0, max: 1, destination: "hand", leftover: "stay" }));
    expect(zone(game, dead)).toBe("hand");
    expect(life(game)).toBe(before);
    const elves = spawn(game, "Llanowar Elves");
    run(game, noneThisWay({ kind: "return-to-hand", target: 0 }), [elves]);
    expect(zone(game, elves)).toBe("hand");
    expect(life(game)).toBe(before);
  });

  it("a card already in the hand isn't: one chosen and revealed there stays", () => {
    const { game, a } = table();
    const bears = toHand(game, "Grizzly Bears");
    // A debug spawn announces nothing; in play the cast, the priority passes
    // and so on always come between a card's arrival and a later resolution.
    run(game, { kind: "draw", amount: 1 });
    pickFromZone(a, bears);
    const before = life(game);
    run(game, noneThisWay({ kind: "look-and-choose", zone: "hand", min: 0, max: 1, destination: "reveal", leftover: "stay" }));
    expect(zone(game, bears)).toBe("hand");
    expect(life(game)).toBe(before + 4);
  });

  it("counts the cards: 'you lose 3 life for each card you put into your hand this way'", () => {
    const { game, a } = table();
    const top = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Forest"), toLibrary(game, "Island")];
    pickFromZone(a, top[0], top[2]);
    const before = life(game);
    run(game, {
      kind: "sequence",
      effects: [
        { kind: "look-and-choose", zone: "library", count: 5, min: 0, max: 5, destination: "hand", leftover: "graveyard" },
        { kind: "lose-life", amount: { product: [3, { thisWay: "put-into-hand" }] } },
      ],
    });
    expect(zone(game, top[0])).toBe("hand");
    expect(zone(game, top[2])).toBe("hand");
    expect(zone(game, top[1])).toBe("graveyard");
    expect(life(game)).toBe(before - 6);
  });

  it("Courier of Comestibles: a Food card found makes no token", () => {
    const { game, a } = table();
    const bagel = toLibrary(game, "Bagel and Schmear");
    pickModes(a, 0);
    const offered = pickFromZone(a, bagel);
    enter(game, "Courier of Comestibles");
    expect(offered.offered).toEqual([bagel]);
    expect(zone(game, bagel)).toBe("hand");
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("…declining the search makes one", () => {
    const { game, a } = table();
    const bagel = toLibrary(game, "Bagel and Schmear");
    pickModes(a);
    enter(game, "Courier of Comestibles");
    expect(zone(game, bagel)).toBe("library");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("…and so does a search that finds nothing", () => {
    const { game, a } = table();
    pickModes(a, 0);
    enter(game, "Courier of Comestibles");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Cache Grab", () => {
  const setUp = (top: string) => {
    const t = table();
    const card = toLibrary(t.game, top);
    lands(t.game, "Forest", 2);
    return { ...t, card };
  };

  it("a Squirrel card taken back makes a Food", () => {
    const { game, a, card } = setUp("Bakersbane Duo");
    pickFromZone(a, card);
    cast(game, toHand(game, "Cache Grab"));
    expect(zone(game, card)).toBe("hand");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("…another permanent card taken back doesn't", () => {
    const { game, a, card } = setUp("Grizzly Bears");
    pickFromZone(a, card);
    cast(game, toHand(game, "Cache Grab"));
    expect(zone(game, card)).toBe("hand");
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("…nor a Squirrel card milled and left there", () => {
    const { game, card } = setUp("Bakersbane Duo");
    cast(game, toHand(game, "Cache Grab"));
    expect(graveyard(game)).toContain(card);
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("…but controlling a Squirrel does", () => {
    const { game } = setUp("Grizzly Bears");
    spawn(game, "Bakersbane Duo");
    cast(game, toHand(game, "Cache Grab"));
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });
});

describe("Zoological Study and Monster Manual", () => {
  it("returns a creature card milled this way — one must be taken when there is one", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const elves = toLibrary(game, "Llanowar Elves");
    lands(game, "Forest", 3);
    let offered: readonly ObjectId[] = [];
    let least = -1;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      offered = eligible;
      least = min;
      return [elves];
    };
    const card = toHand(game, "Monster Manual");
    cast(game, card, { face: 1 });
    expect([...offered].sort()).toEqual([bears, elves].sort());
    expect(least).toBe(1);
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    // Gone on an adventure.
    expect(zone(game, card)).toBe("exile");
  });

  it("…and with none milled, nothing", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const card = toHand(game, "Monster Manual");
    const before = hand(game).length;
    cast(game, card, { face: 1 });
    expect(graveyard(game).length).toBe(5);
    expect(hand(game).length).toBe(before - 1);
  });

  it("Monster Manual puts a creature card from your hand onto the battlefield", () => {
    const { game, a } = table();
    const manual = spawn(game, "Monster Manual");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    pickFromZone(a, bears);
    activate(game, manual, 0);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("move-exiled-this-way to a hand: Worlds Within Worlds", () => {
  it("the creatures go to their owners' hands, and the ones chosen from hands enter together", () => {
    const { game, a, b } = table();
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Llanowar Elves", B);
    const fromHandA = toHand(game, "Craw Wurm", A);
    const fromHandB = toHand(game, "Hill Giant", B);
    lands(game, "Forest", 4);
    lands(game, "Island", 3);
    pickModes(a, 0);
    pickModes(b, 0);
    pickFromZone(a, fromHandA);
    const seenByB: string[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      // Alice chose first; her card waits hidden in her hand (rule 101.4).
      seenByB.push(zone(game, fromHandA));
      return eligible.filter((id) => id === fromHandB);
    };
    const www = toHand(game, "Worlds Within Worlds");
    cast(game, www);
    expect(seenByB).toEqual(["hand"]);
    expect(zone(game, fromHandA)).toBe("battlefield");
    expect(zone(game, fromHandB)).toBe("battlefield");
    expect(game.state.objects[fromHandB].controller).toBe(B);
    expect(hand(game, A)).toContain(mine);
    expect(hand(game, B)).toContain(theirs);
    // "Exile Worlds Within Worlds."
    expect(zone(game, www)).toBe("exile");
  });

  it("a token exiled this way is gone, and a card exiled before stays in exile", () => {
    const { game } = table();
    const earlier = game.debugSpawn("Grizzly Bears", A, "exile");
    run(game, { kind: "create-token", token: "Food Token", count: 1 });
    const bears = spawn(game, "Grizzly Bears");
    run(game, {
      kind: "sequence",
      effects: [
        { kind: "exile-all", filter: { typesAnyOf: ["artifact", "creature"] } },
        { kind: "move-exiled-this-way", to: "hand" },
      ],
    });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, earlier)).toBe("exile");
    expect(tokensNamed(game, "Food Token", A)).toBe(0);
  });

  it("filter: only the matching cards move", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const goose = spawn(game, "Gilded Goose");
    run(game, {
      kind: "sequence",
      effects: [
        { kind: "exile-all", filter: { type: "creature" } },
        { kind: "move-exiled-this-way", to: "hand", filter: { subtype: "Bird" } },
      ],
    });
    expect(zone(game, goose)).toBe("hand");
    expect(zone(game, bears)).toBe("exile");
  });
});
