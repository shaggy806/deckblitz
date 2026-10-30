import { describe, expect, it } from "vitest";

import { A, B, cast, counters, enter, hand, lands, pickModes, ref, table, toHand, tokensNamed, zone } from "./harness.js";

/** The opening hands: nonland and noncreature, so they never match the
 * filters tested here (and colored, so never "colorless" or "multicolored"). */
const NONLAND = "Lightning Bolt";

describe("discards all matching cards (discard-hand with a filter)", () => {
  it("discards every nonland card, revealing the whole hand, and keeps the lands (Amnesia)", () => {
    const { game } = table({ deck: NONLAND });
    lands(game, "Island", 6);
    const amnesia = toHand(game, "Amnesia");
    const bear = toHand(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const forest = toHand(game, "Forest", B);
    cast(game, amnesia, { targets: [ref(B)] });
    const revealed = game.events.flatMap((e) => (e.type === "cards-revealed" && e.player === B ? e.objects : []));
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
    // The whole hand is revealed, the land too.
    expect(revealed).toContain(forest);
    expect(revealed).toContain(bear);
  });

  it("asks nobody: there's no choice in \"all\" (Trapfinder's Trick)", () => {
    const { game, b } = table({ deck: NONLAND });
    lands(game, "Island", 2);
    const trick = toHand(game, "Trapfinder's Trick");
    const trap = toHand(game, "Arrow Volley Trap", B);
    const bear = toHand(game, "Grizzly Bears", B);
    b.chooseDiscardsFn = () => {
      throw new Error("asked to discard");
    };
    cast(game, trick, { targets: [ref(B)] });
    expect(zone(game, trap)).toBe("graveyard");
    expect(zone(game, bear)).toBe("hand");
  });

  it("reads colorless and multicolored per mode (Shatter Assumptions)", () => {
    const first = table({ deck: NONLAND });
    lands(first.game, "Swamp", 3);
    const shatter = toHand(first.game, "Shatter Assumptions");
    const ornithopter = toHand(first.game, "Ornithopter", B);
    const wastes = toHand(first.game, "Wastes", B);
    const lightning = toHand(first.game, "Lightning Helix", B);
    cast(first.game, shatter, { modes: [0], targets: [ref(B)] });
    expect(zone(first.game, ornithopter)).toBe("graveyard");
    // A colorless land is spared by "nonland"; a multicolored card by "colorless".
    expect(zone(first.game, wastes)).toBe("hand");
    expect(zone(first.game, lightning)).toBe("hand");

    const second = table({ deck: NONLAND });
    lands(second.game, "Swamp", 3);
    const again = toHand(second.game, "Shatter Assumptions");
    const helix = toHand(second.game, "Lightning Helix", B);
    const bolt = toHand(second.game, "Lightning Bolt", B);
    cast(second.game, again, { modes: [1], targets: [ref(B)] });
    expect(zone(second.game, helix)).toBe("graveyard");
    expect(zone(second.game, bolt)).toBe("hand");
  });
});

describe("a filtered discard (discard with a filter)", () => {
  it("keeps Hidden Horror when a creature card is discarded, offering only creature cards", () => {
    const { game, a } = table({ deck: NONLAND });
    toHand(game, "Lightning Bolt");
    const bear = toHand(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    let offered: readonly string[] = [];
    a.chooseDiscardsFn = (cards) => {
      offered = cards.map((c) => c.id);
      return [bear];
    };
    pickModes(a, 0);
    const horror = enter(game, "Hidden Horror");
    expect([...offered].sort()).toEqual([bear, elves].sort());
    expect(zone(game, elves)).toBe("hand");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, horror)).toBe("battlefield");
  });

  it("sacrifices Hidden Horror with no creature card in hand, without asking", () => {
    const { game, a } = table({ deck: NONLAND });
    toHand(game, "Lightning Bolt");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    const before = hand(game).length;
    const horror = enter(game, "Hidden Horror");
    expect(asked).toBe(false);
    expect(zone(game, horror)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("sacrifices Hidden Horror when the discard is declined", () => {
    const { game } = table({ deck: NONLAND });
    const bear = toHand(game, "Grizzly Bears");
    const horror = enter(game, "Hidden Horror");
    expect(zone(game, horror)).toBe("graveyard");
    expect(zone(game, bear)).toBe("hand");
  });

  it("makes a Wolf only for a discarded land card (Pack Guardian)", () => {
    const { game, a } = table({ deck: NONLAND });
    const forest = toHand(game, "Forest");
    const bear = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = (cards) => [cards[0].id];
    pickModes(a, 0);
    enter(game, "Pack Guardian");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, bear)).toBe("hand");
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });
});

describe("any number of matching cards (discard anyNumber with a filter)", () => {
  it("counts and draws for the lands discarded, offering only lands (Nantuko Cultivator)", () => {
    const { game, a } = table({ deck: NONLAND });
    const forest = toHand(game, "Forest");
    const island = toHand(game, "Island");
    const bear = toHand(game, "Grizzly Bears");
    let offered: readonly string[] = [];
    a.chooseDiscardsFn = (cards) => {
      offered = cards.map((c) => c.id);
      return [forest, island];
    };
    const before = hand(game).length;
    const cultivator = enter(game, "Nantuko Cultivator");
    expect([...offered].sort()).toEqual([forest, island].sort());
    expect(zone(game, bear)).toBe("hand");
    expect(counters(game, cultivator)).toBe(2);
    // Two discarded, two drawn.
    expect(hand(game).length).toBe(before);
  });

  it("puts two counters on for each creature card discarded (Mind Maggots)", () => {
    const { game, a } = table({ deck: NONLAND });
    const bear = toHand(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    const forest = toHand(game, "Forest");
    let offered: readonly string[] = [];
    a.chooseDiscardsFn = (cards) => {
      offered = cards.map((c) => c.id);
      return [bear, elves];
    };
    const maggots = enter(game, "Mind Maggots");
    expect(offered).not.toContain(forest);
    expect(zone(game, elves)).toBe("graveyard");
    expect(counters(game, maggots)).toBe(4);
  });
});
