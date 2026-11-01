/**
 * A graveyard's order (rules 404.1-404.3): the top of the pile is the list's end, what reads
 * it (`top-of-graveyard`, a `fromTop` cost) takes no choice, cards that arrive together are
 * arranged by their owner while something in the game reads the order, and Fossil Find
 * rearranges the pile.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("top-of-graveyard", () => {
  it("takes the last card that arrived, not one the player picks (Soldevi Digger)", () => {
    const { game } = table();
    const digger = spawn(game, "Soldevi Digger");
    lands(game, "Wastes", 2);
    toGraveyard(game, "Grizzly Bears");
    const top = toGraveyard(game, "Savannah Lions");
    activate(game, digger);
    expect(zone(game, top)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.at(-1)).toBe(top);
    expect(graveyard(game)).toHaveLength(1);
  });

  it("does nothing with an empty graveyard", () => {
    const { game } = table();
    const digger = spawn(game, "Soldevi Digger");
    lands(game, "Wastes", 2);
    activate(game, digger);
    expect(graveyard(game)).toHaveLength(0);
  });

  it("reads the top card itself for an 'if it is' (Guiding Spirit)", () => {
    const { game } = table();
    const spirit = spawn(game, "Guiding Spirit", A, { sick: false });
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    activate(game, spirit, 0, { targets: [ref(B)] });
    // A creature card lies under it, but the top card is an instant.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    game.state.objects[spirit].tapped = false;
    const lions = toGraveyard(game, "Savannah Lions", B);
    activate(game, spirit, 0, { targets: [ref(B)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(library[0]).toBe(lions);
  });

  it("reaches the bottom card too (Phyrexian Furnace)", () => {
    const { game } = table();
    const furnace = spawn(game, "Phyrexian Furnace", A, { sick: false });
    const bottom = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Lightning Bolt", B);
    activate(game, furnace, 0, { targets: [ref(B)] });
    expect(zone(game, bottom)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(1);
  });

  it("returns the top creature card, past a noncreature on top of it, hasty till the end step (Corpse Dance)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    toGraveyard(game, "Savannah Lions");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    cast(game, toHand(game, "Corpse Dance"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Savannah Lions")).toHaveLength(1);
  });

  it("doesn't exile the creature from the graveyard it has gone back to (rule 400.7)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Corpse Dance"));
    destroy(game, bears);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("buys Corpse Dance back with its kicker", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    toGraveyard(game, "Grizzly Bears");
    const dance = toHand(game, "Corpse Dance");
    cast(game, dance, { kicked: true });
    expect(hand(game)).toContain(dance);
  });
});

describe("an exile cost from the top", () => {
  it("exiles the top card with no choice, and can't be paid with none (Alms)", () => {
    const { game } = table();
    const alms = spawn(game, "Alms");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    expect(() => activate(game, alms, 0, { targets: [ref(bears)] })).toThrow(/too few/);
    toGraveyard(game, "Savannah Lions");
    const top = toGraveyard(game, "Lightning Bolt");
    activate(game, alms, 0, { targets: [ref(bears)] });
    expect(game.state.awaiting).toBeNull();
    expect(zone(game, top)).toBe("exile");
  });

  it("exiles the first creature card down the pile (Necratog)", () => {
    const { game } = table();
    const atog = spawn(game, "Necratog");
    toGraveyard(game, "Savannah Lions");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    activate(game, atog);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(pt(game, atog)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("cards reaching a graveyard together (rule 404.3)", () => {
  const twoDie = (t: ReturnType<typeof table>) => {
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    lands(game, "Plains", 4);
    return { bears, lions, game };
  };

  it("asks the owner, in a game with a reader, and the first picked goes on top", () => {
    const t = table();
    const { game, bears, lions } = twoDie(t);
    spawn(game, "Soldevi Digger");
    const offered: (readonly string[])[] = [];
    t.a.chooseFromZoneFn = (_view, eligible) => {
      offered.push(eligible);
      return [lions, bears];
    };
    cast(game, toHand(game, "Wrath of God"));
    expect(offered).toEqual([[bears, lions]]);
    const pile = graveyard(game);
    // The Wrath lands after: it finished resolving after the creatures died.
    expect(pile.slice(0, 2)).toEqual([bears, lions]);
    expect(game.state.objects[pile.at(-1)!].cardName).toBe("Wrath of God");
  });

  it("can put the other one on top", () => {
    const t = table();
    const { game, bears, lions } = twoDie(t);
    spawn(game, "Soldevi Digger");
    t.a.chooseFromZoneFn = () => [bears, lions];
    cast(game, toHand(game, "Wrath of God"));
    expect(graveyard(game).slice(0, 2)).toEqual([lions, bears]);
  });

  it("asks nobody in a game where nothing reads the order", () => {
    const t = table();
    const { game, bears, lions } = twoDie(t);
    let asked = 0;
    t.a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible;
    };
    cast(game, toHand(game, "Wrath of God"));
    expect(asked).toBe(0);
    expect(graveyard(game).slice(0, 2)).toEqual([bears, lions]);
  });

  it("counts a reader in any zone, a library included", () => {
    const t = table();
    const { game } = twoDie(t);
    toLibrary(game, "Soldevi Digger", B);
    let asked = 0;
    t.a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible;
    };
    cast(game, toHand(game, "Wrath of God"));
    expect(asked).toBe(1);
  });

  it("asks each owner about their own, and not about one card or two copies", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Soldevi Digger");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const bobBears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 4);
    let asked = 0;
    t.a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible;
    };
    t.b.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible;
    };
    cast(game, toHand(game, "Wrath of God"));
    expect(asked).toBe(0);
    expect(zone(game, bobBears)).toBe("graveyard");
  });

  it("leaves a card that has left the graveyard since out of the question", () => {
    const t = table();
    const { game } = t;
    const digger = spawn(game, "Soldevi Digger");
    lands(game, "Wastes", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const stintOf = (id: string) => game.state.objects[id as typeof bears].zoneChangeCount ?? 0;
    game.state.pendingGraveyardOrders = [
      {
        player: A,
        cards: [
          { object: bears, stint: stintOf(bears) },
          { object: lions, stint: stintOf(lions) },
          // An earlier stint: this one has been somewhere else since (rule 400.7).
          { object: bolt, stint: stintOf(bolt) - 1 },
        ],
      },
    ];
    let offered: readonly string[] = [];
    t.a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible;
    };
    activate(game, digger);
    expect(offered).toEqual([bears, lions]);
  });

  it("isn't asked of a lone card dying", () => {
    const t = table();
    const { game, bears } = twoDie(t);
    spawn(game, "Soldevi Digger");
    let asked = 0;
    t.a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible;
    };
    destroy(game, bears);
    settle(game);
    expect(asked).toBe(0);
  });
});

describe("Fossil Find", () => {
  it("returns a card, then arranges the rest, and lands on top of them", () => {
    const t = table();
    const { game } = t;
    spawn(game, "Soldevi Digger");
    lands(game, "Mountain", 1);
    const cards = [
      toGraveyard(game, "Grizzly Bears"),
      toGraveyard(game, "Savannah Lions"),
      toGraveyard(game, "Lightning Bolt"),
    ];
    let asked: readonly string[] = [];
    t.a.chooseFromZoneFn = (_view, eligible) => {
      asked = eligible;
      return eligible;
    };
    const find = toHand(game, "Fossil Find");
    cast(game, find);
    expect(asked).toHaveLength(2);
    const pile = graveyard(game);
    expect(pile.at(-1)).toBe(find);
    expect(pile.slice(0, 2)).toEqual([...asked].reverse());
    expect(hand(game).some((id) => cards.includes(id))).toBe(true);
  });

  it("asks nothing where nothing reads the order", () => {
    const t = table();
    const { game } = t;
    lands(game, "Forest", 1);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Savannah Lions");
    toGraveyard(game, "Lightning Bolt");
    let asked = 0;
    t.a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return eligible;
    };
    cast(game, toHand(game, "Fossil Find"));
    expect(asked).toBe(0);
  });
});
