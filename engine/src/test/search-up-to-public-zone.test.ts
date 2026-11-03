/**
 * Searches over several of a player's zones, the zones chosen as it resolves
 * (`searchZonesAndOr`), and a search whose count is printed "up to" (`upTo`):
 * a graveyard is public, so "a card" there must be found (rule 701.23b frees
 * only a hidden zone), but "up to five" is the card's own leave to find none.
 * The Five Doctors, Gate to the Afterlife, Last Light of Durin's Day, and
 * Ancient Vendetta among four players.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

type Game = ReturnType<typeof table>["game"];
type Seat = ReturnType<typeof table>["a"];

const shuffledBy = (game: Game): string[] =>
  game.state.eventLog.flatMap((e) => (e.type === "library-shuffled" ? [e.player] : []));

/** Answer the zones' question with `mode`, keeping the texts asked; any other
 * question (a `may`) with yes. */
function searchIn(seat: Seat, mode: string): { asked: (readonly string[])[] } {
  const seen = { asked: [] as (readonly string[])[] };
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    if (!texts.includes(mode)) return [0];
    seen.asked.push(texts);
    return [texts.indexOf(mode)];
  };
  return seen;
}

/** Find nothing, keeping what was offered. */
function findNothing(seat: Seat): { offered: readonly ObjectId[]; least: number | undefined; most: number | undefined } {
  const seen = { offered: [] as readonly ObjectId[], least: undefined as number | undefined, most: undefined as number | undefined };
  seat.chooseFromZoneFn = (_view, eligible, min, max) => {
    seen.offered = eligible;
    seen.least = min;
    seen.most = max;
    return [];
  };
  return seen;
}

describe("The Five Doctors: your library and/or graveyard, up to five", () => {
  function doctors(game: Game): ObjectId {
    lands(game, "Forest", 11);
    return toHand(game, "The Five Doctors");
  }

  it("offers the three sets of zones, and the graveyard alone may find none", () => {
    const { game, a } = table();
    const spell = doctors(game);
    const inGraveyard = toGraveyard(game, "Cult Healer");
    const inLibrary = toLibrary(game, "Doctor Jane Foster");
    const zones = searchIn(a, "Search your graveyard");
    const seen = findNothing(a);
    cast(game, spell);
    expect(zones.asked).toEqual([["Search your library and graveyard", "Search your library", "Search your graveyard"]]);
    expect(seen.offered).toEqual([inGraveyard]);
    expect(seen.least).toBe(0);
    expect(zone(game, inGraveyard)).toBe("graveyard");
    expect(zone(game, inLibrary)).toBe("library");
    expect(shuffledBy(game)).toEqual([]);
  });

  it("the graveyard's finds go to the hand, revealed, with no shuffle", () => {
    const { game, a } = table();
    const spell = doctors(game);
    const inGraveyard = toGraveyard(game, "Cult Healer");
    const other = toGraveyard(game, "Grizzly Bears");
    searchIn(a, "Search your graveyard");
    const seen = pickFromZone(a, inGraveyard);
    cast(game, spell);
    expect(seen.offered).toEqual([inGraveyard]);
    expect(zone(game, inGraveyard)).toBe("hand");
    expect(zone(game, other)).toBe("graveyard");
    expect(shuffledBy(game)).toEqual([]);
    const revealed = game.state.eventLog.some((e) => e.type === "cards-revealed" && e.objects.includes(inGraveyard));
    expect(revealed).toBe(true);
  });

  it("both zones together take at most five, and shuffle", () => {
    const { game, a } = table();
    const spell = doctors(game);
    const fromGraveyard = [toGraveyard(game, "Cult Healer"), toGraveyard(game, "Cult Healer"), toGraveyard(game, "Cult Healer")];
    const fromLibrary = [toLibrary(game, "Cult Healer"), toLibrary(game, "Cult Healer"), toLibrary(game, "Cult Healer")];
    searchIn(a, "Search your library and graveyard");
    let most: number | undefined;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      most = max;
      return eligible.slice(0, max);
    };
    cast(game, spell);
    expect(most).toBe(5);
    const found = [...fromGraveyard, ...fromLibrary].filter((id) => zone(game, id) === "hand");
    expect(found).toHaveLength(5);
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("kicked, the finds enter the battlefield instead", () => {
    const { game, a } = table();
    const spell = doctors(game);
    const inGraveyard = toGraveyard(game, "Cult Healer");
    const inLibrary = toLibrary(game, "Doctor Jane Foster");
    searchIn(a, "Search your library and graveyard");
    pickFromZone(a, inGraveyard, inLibrary);
    cast(game, spell, { kicked: true });
    expect(zone(game, inGraveyard)).toBe("battlefield");
    expect(zone(game, inLibrary)).toBe("battlefield");
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("ten lands can't pay for the kicker", () => {
    const { game } = table();
    lands(game, "Forest", 10);
    const spell = toHand(game, "The Five Doctors");
    expect(() => cast(game, spell, { kicked: true })).toThrow();
  });
});

describe("Gate to the Afterlife", () => {
  function gate(game: Game, creatures = 6): ObjectId {
    lands(game, "Wastes", 2);
    for (let i = 0; i < creatures; i += 1) toGraveyard(game, "Grizzly Bears");
    return spawn(game, "Gate to the Afterlife");
  }

  it("can't be activated with five creature cards in the graveyard, whatever else is there", () => {
    const { game } = table();
    const source = gate(game, 5);
    toGraveyard(game, "Forest");
    expect(() => activate(game, source)).toThrow();
    expect(zone(game, source)).toBe("battlefield");
  });

  it("offers every set of the three zones, and the hand's Gift enters with no shuffle", () => {
    const { game, a } = table();
    const source = gate(game);
    const gift = toHand(game, "God-Pharaoh's Gift");
    const zones = searchIn(a, "Search your hand");
    const seen = pickFromZone(a, gift);
    activate(game, source);
    expect(zones.asked[0]).toHaveLength(7);
    expect(seen.offered).toEqual([gift]);
    expect(zone(game, source)).toBe("graveyard");
    expect(zone(game, gift)).toBe("battlefield");
    expect(shuffledBy(game)).toEqual([]);
  });

  it("a search of the library may fail to find it, and still shuffles", () => {
    const { game, a } = table();
    const source = gate(game);
    const gift = toLibrary(game, "God-Pharaoh's Gift");
    searchIn(a, "Search your graveyard, hand, and library");
    const seen = findNothing(a);
    activate(game, source);
    expect(seen.offered).toEqual([gift]);
    expect(seen.least).toBe(0);
    expect(zone(game, gift)).toBe("library");
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("a nontoken creature dying gains 1 life, then may draw and discard", () => {
    const { game, a } = table();
    spawn(game, "Gate to the Afterlife");
    const bear = spawn(game, "Grizzly Bears");
    const before = life(game);
    const held = toHand(game, "Forest");
    toLibrary(game, "Wastes");
    const inHand = hand(game).length;
    a.chooseModesFn = () => [0];
    a.chooseDiscardsFn = () => [held];
    lands(game, "Swamp", 2);
    const doomBlade = toHand(game, "Doom Blade");
    cast(game, doomBlade, { targets: [ref(bear)] });
    expect(life(game)).toBe(before + 1);
    // The Blade left the hand; a card came in and another went.
    expect(hand(game)).toHaveLength(inHand);
    expect(zone(game, held)).toBe("graveyard");
  });

  it("declining the draw still gains the life", () => {
    const { game, a } = table();
    spawn(game, "Gate to the Afterlife");
    const bear = spawn(game, "Grizzly Bears");
    const before = life(game);
    a.chooseModesFn = () => [];
    lands(game, "Swamp", 2);
    const doomBlade = toHand(game, "Doom Blade");
    const inHand = hand(game).length;
    cast(game, doomBlade, { targets: [ref(bear)] });
    expect(life(game)).toBe(before + 1);
    expect(hand(game)).toHaveLength(inHand - 1);
  });

  it("triggers for a creature dying at the same time as it (the ruling)", () => {
    const { game, a } = table();
    const source = spawn(game, "Gate to the Afterlife");
    spawn(game, "Grizzly Bears");
    const before = life(game);
    a.chooseModesFn = () => [];
    lands(game, "Plains", 6);
    cast(game, toHand(game, "Akroma's Vengeance"));
    expect(zone(game, source)).toBe("graveyard");
    expect(life(game)).toBe(before + 1);
  });
});

describe("Last Light of Durin's Day", () => {
  /** On the battlefield with `n` quest counters. */
  function lastLight(game: Game, n: number): ObjectId {
    const source = spawn(game, "Last Light of Durin's Day");
    game.state.objects[source].counters = { ...game.state.objects[source].counters, quest: n };
    return source;
  }

  it("counts Mountains you control and holds below six", () => {
    const { game, a } = table();
    const source = lastLight(game, 4);
    const asked = searchIn(a, "Search your hand");
    enter(game, "Mountain");
    enter(game, "Mountain", B);
    expect(counters(game, source, "quest")).toBe(5);
    expect(zone(game, source)).toBe("battlefield");
    expect(asked.asked).toEqual([]);
  });

  it("at six it's sacrificed, the hand and/or library asked, and the hand's Dragon enters with no shuffle", () => {
    const { game, a } = table();
    const source = lastLight(game, 5);
    const dragon = toHand(game, "Balefire Dragon");
    const inLibrary = toLibrary(game, "Balefire Dragon");
    const zones = searchIn(a, "Search your hand");
    const seen = pickFromZone(a, dragon);
    enter(game, "Mountain");
    expect(zones.asked).toEqual([["Search your hand and library", "Search your hand", "Search your library"]]);
    expect(seen.offered).toEqual([dragon]);
    expect(zone(game, source)).toBe("graveyard");
    expect(zone(game, dragon)).toBe("battlefield");
    expect(zone(game, inLibrary)).toBe("library");
    expect(shuffledBy(game)).toEqual([]);
  });

  it("both zones are offered together, the library is shuffled, and none need be found", () => {
    const { game, a } = table();
    lastLight(game, 5);
    const dragon = toHand(game, "Balefire Dragon");
    const inLibrary = toLibrary(game, "Balefire Dragon");
    searchIn(a, "Search your hand and library");
    const seen = findNothing(a);
    enter(game, "Mountain");
    expect(new Set(seen.offered)).toEqual(new Set([dragon, inLibrary]));
    expect(seen.least).toBe(0);
    expect(seen.most).toBe(1);
    expect(zone(game, dragon)).toBe("hand");
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("mountaincycles from the hand", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const card = toHand(game, "Last Light of Durin's Day");
    const mountain = toLibrary(game, "Mountain");
    pickFromZone(a, mountain);
    game.dispatch({ type: "cycle", player: A, card });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("hand");
    expect(shuffledBy(game)).toEqual([A]);
  });
});

describe("Ancient Vendetta among four players", () => {
  it("searches only the target's three zones, up to four, and that player shuffles", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Swamp", 4);
    const spell = toHand(game, "Ancient Vendetta");
    const mine = toHand(game, "Grizzly Bears");
    const bobs = toHand(game, "Grizzly Bears", B);
    const dies = toGraveyard(game, "Grizzly Bears", D);
    const others = [
      toGraveyard(game, "Grizzly Bears", C),
      toHand(game, "Grizzly Bears", C),
      toLibrary(game, "Grizzly Bears", C),
      toLibrary(game, "Grizzly Bears", C),
      toLibrary(game, "Grizzly Bears", C),
    ];
    const unnamed = toHand(game, "Forest", C);
    a.chooseCardNameFn = () => "Grizzly Bears";
    let most: number | undefined;
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      most = max;
      offered = eligible;
      return eligible.slice(0, max);
    };
    cast(game, spell, { targets: [ref(C)] });
    expect(new Set(offered)).toEqual(new Set(others));
    expect(most).toBe(4);
    expect(others.filter((id) => zone(game, id) === "exile")).toHaveLength(4);
    expect(zone(game, unnamed)).toBe("hand");
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, bobs)).toBe("hand");
    expect(zone(game, dies)).toBe("graveyard");
    expect(shuffledBy(game)).toEqual([C]);
  });

  it("may leave even the graveyard's, and that player still shuffles", () => {
    const { game, a } = table({ players: 4 });
    lands(game, "Swamp", 4);
    const spell = toHand(game, "Ancient Vendetta");
    const public_ = toGraveyard(game, "Grizzly Bears", C);
    a.chooseCardNameFn = () => "Grizzly Bears";
    const seen = findNothing(a);
    cast(game, spell, { targets: [ref(C)] });
    expect(seen.offered).toEqual([public_]);
    expect(seen.least).toBe(0);
    expect(zone(game, public_)).toBe("graveyard");
    expect(shuffledBy(game)).toEqual([C]);
    expect(graveyard(game, A)).toContain(spell);
    expect(named(game, "Grizzly Bears", C)).toEqual([]);
  });
});
