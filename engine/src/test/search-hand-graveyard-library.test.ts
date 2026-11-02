/**
 * A search whose zones add the hand and the graveyard (`search-library`'s
 * `zones`, rule 701.23): "your graveyard, hand, **and/or** library" is a choice
 * of zones as it resolves (the `searchZonesAndOr` helper), and only a search
 * with the library in it shuffles. The extract family's other players' zones,
 * with the finds exiled (Quash, Crumble to Dust, The Stone Brain). And Doomsday:
 * "five cards and exile the rest", on top in any order, with no shuffle
 * (`exileRest`, `inAnyOrder`).
 */
import { describe, expect, it } from "vitest";

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

/** The modes `searchZonesAndOr(["graveyard", "hand", "library"], …)` offers. */
const ZONE_MODES = [
  "Search your graveyard, hand, and library",
  "Search your graveyard and hand",
  "Search your graveyard and library",
  "Search your hand and library",
  "Search your graveyard",
  "Search your hand",
  "Search your library",
];

/** Answer the zones' question with this mode and any `may` with yes. */
function searchIn(seat: Seat, mode: string): { asked: (readonly string[])[] } {
  const seen = { asked: [] as (readonly string[])[] };
  seat.chooseModesFn = (_view, _min, _max, texts) => {
    if (texts.length !== ZONE_MODES.length) return [0];
    seen.asked.push(texts);
    return [texts.indexOf(mode)];
  };
  return seen;
}

/** Three Dark Supplicants, ready to pay for the first's ability. */
function supplicants(game: Game): ObjectId {
  const first = spawn(game, "Dark Supplicant");
  spawn(game, "Dark Supplicant");
  spawn(game, "Dark Supplicant");
  return first;
}

describe("your graveyard, hand, and/or library", () => {
  it("offers every set of the zones as it resolves, and finds from all three together", () => {
    const { game, a } = table();
    const source = supplicants(game);
    const inGraveyard = toGraveyard(game, "Scion of Darkness");
    const inHand = toHand(game, "Scion of Darkness");
    const inLibrary = toLibrary(game, "Scion of Darkness");
    const modes = searchIn(a, "Search your graveyard, hand, and library");
    const seen = pickFromZone(a, inHand);
    activate(game, source);
    expect(modes.asked).toEqual([ZONE_MODES]);
    expect(new Set(seen.offered)).toEqual(new Set([inGraveyard, inHand, inLibrary]));
    expect(zone(game, inHand)).toBe("battlefield");
    expect(zone(game, inGraveyard)).toBe("graveyard");
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("a search without the library doesn't shuffle, and doesn't see it", () => {
    const { game, a } = table();
    const source = supplicants(game);
    const inGraveyard = toGraveyard(game, "Scion of Darkness");
    const inHand = toHand(game, "Scion of Darkness");
    const inLibrary = toLibrary(game, "Scion of Darkness");
    searchIn(a, "Search your graveyard and hand");
    const seen = pickFromZone(a, inGraveyard);
    activate(game, source);
    expect(new Set(seen.offered)).toEqual(new Set([inGraveyard, inHand]));
    expect(zone(game, inGraveyard)).toBe("battlefield");
    expect(zone(game, inLibrary)).toBe("library");
    expect(shuffledBy(game)).toEqual([]);
  });

  it("the hand alone is searched, and may find nothing (a hidden zone, rule 701.23b)", () => {
    const { game, a } = table();
    const source = supplicants(game);
    const inGraveyard = toGraveyard(game, "Scion of Darkness");
    const inHand = toHand(game, "Scion of Darkness");
    searchIn(a, "Search your hand");
    let least: number | undefined;
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      least = min;
      offered = eligible;
      return [];
    };
    activate(game, source);
    expect(offered).toEqual([inHand]);
    expect(least).toBe(0);
    expect(zone(game, inHand)).toBe("hand");
    expect(zone(game, inGraveyard)).toBe("graveyard");
    expect(shuffledBy(game)).toEqual([]);
  });

  it("the graveyard alone must find a match there (a public zone)", () => {
    const { game, a } = table();
    const source = supplicants(game);
    const inGraveyard = toGraveyard(game, "Scion of Darkness");
    searchIn(a, "Search your graveyard");
    let least: number | undefined;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      least = min;
      return [...eligible];
    };
    activate(game, source);
    expect(least).toBe(1);
    expect(zone(game, inGraveyard)).toBe("battlefield");
  });

  it("a search that takes in the hand and the library leaves the graveyard's alone", () => {
    const { game, a } = table();
    const source = supplicants(game);
    const inGraveyard = toGraveyard(game, "Scion of Darkness");
    const inHand = toHand(game, "Scion of Darkness");
    const inLibrary = toLibrary(game, "Scion of Darkness");
    searchIn(a, "Search your hand and library");
    const seen = pickFromZone(a, inLibrary);
    activate(game, source);
    expect(new Set(seen.offered)).toEqual(new Set([inHand, inLibrary]));
    expect(zone(game, inLibrary)).toBe("battlefield");
    expect(zone(game, inGraveyard)).toBe("graveyard");
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("Boonweaver Giant attaches the Aura it finds in the hand, without asking a host", () => {
    const { game, a } = table();
    const aura = toHand(game, "Pacifism");
    toLibrary(game, "Pacifism");
    searchIn(a, "Search your hand");
    pickFromZone(a, aura);
    const giant = enter(game, "Boonweaver Giant");
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.objects[aura].attachedTo).toBe(giant);
    expect(shuffledBy(game)).toEqual([]);
  });

  it("an Aura that can't enchant the Giant stays where it was (rule 303.4i)", () => {
    const { game, a } = table();
    const aura = toGraveyard(game, "Wild Growth");
    searchIn(a, "Search your graveyard");
    pickFromZone(a, aura);
    enter(game, "Boonweaver Giant");
    expect(zone(game, aura)).toBe("graveyard");
  });

  it("declining the Giant's search asks no zones and shuffles nothing", () => {
    const { game, a } = table();
    const aura = toHand(game, "Pacifism");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    enter(game, "Boonweaver Giant");
    expect(asked).toBe(1);
    expect(zone(game, aura)).toBe("hand");
    expect(shuffledBy(game)).toEqual([]);
  });

  it("Mishra finds a card with the spell's name, not the spell itself", () => {
    const { game, a } = table();
    spawn(game, "Mishra, Artificer Prodigy");
    lands(game, "Wastes", 1);
    const spell = toHand(game, "Sol Ring");
    const inGraveyard = toGraveyard(game, "Sol Ring");
    const inHand = toHand(game, "Sol Ring");
    const inLibrary = toLibrary(game, "Sol Ring");
    toGraveyard(game, "Mana Vault");
    searchIn(a, "Search your graveyard, hand, and library");
    const seen = pickFromZone(a, inLibrary);
    cast(game, spell);
    expect(new Set(seen.offered)).toEqual(new Set([inGraveyard, inHand, inLibrary]));
    expect(zone(game, inLibrary)).toBe("battlefield");
    expect(shuffledBy(game)).toEqual([A]);
  });
});

describe("another player's graveyard, hand, and library, the finds exiled", () => {
  it("Quash counters the spell and exiles its namesakes: the graveyard's all go, the hidden zones' may stay", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const inGraveyard = toGraveyard(game, "Lightning Bolt");
    const inHand = toHand(game, "Lightning Bolt");
    const inLibrary = toLibrary(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const seen = pickFromZone(a, inHand);
    cast(game, toHand(game, "Quash"), { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(20);
    expect(new Set(seen.offered)).toEqual(new Set([inHand, inLibrary]));
    expect(zone(game, inGraveyard)).toBe("exile");
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, inLibrary)).toBe("library");
    // The countered card itself is in the graveyard by then, a match there.
    expect(zone(game, bolt)).toBe("exile");
    expect(shuffledBy(game)).toEqual([A]);
  });

  it("Quash on a copy of a spell still searches for its name (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    const inLibrary = toLibrary(game, "Lightning Bolt");
    a.chooseTargetsFn = () => [ref(B)];
    cast(game, bolt, { targets: [ref(B)], settle: false });
    const twincast = toHand(game, "Twincast");
    cast(game, twincast, { targets: [ref(bolt)], settle: false });
    game.advanceUntil((s) => {
      const stack = s.zones.shared.stack;
      return !stack.includes(twincast) && stack.length === 2 && s.priority.holder === A;
    });
    const copy = game.state.zones.shared.stack.find((id) => id !== bolt)!;
    const seen = pickFromZone(a, inLibrary);
    cast(game, toHand(game, "Quash"), { targets: [ref(copy)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.priority.holder === A);
    expect(seen.offered).toEqual([inLibrary]);
    expect(zone(game, inLibrary)).toBe("exile");
  });

  it("Crumble to Dust is colourless, and may leave any of them, the graveyard's too", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const land = spawn(game, "Command Tower", B);
    const inGraveyard = toGraveyard(game, "Command Tower", B);
    const inHand = toHand(game, "Command Tower", B);
    const inLibrary = toLibrary(game, "Command Tower", B);
    const seen = pickFromZone(a, inHand);
    cast(game, toHand(game, "Crumble to Dust"), { targets: [ref(land)] });
    expect(new Set(seen.offered)).toEqual(new Set([inGraveyard, inHand, inLibrary]));
    expect(zone(game, land)).toBe("exile");
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, inGraveyard)).toBe("graveyard");
    expect(zone(game, inLibrary)).toBe("library");
    expect(shuffledBy(game)).toEqual([B]);
  });

  it("The Stone Brain exiles up to four of the name, and that player draws for the hand's", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const brain = spawn(game, "The Stone Brain");
    const fromGraveyard = toGraveyard(game, "Grizzly Bears", B);
    const fromHand = toHand(game, "Grizzly Bears", B);
    const fromLibrary = toLibrary(game, "Grizzly Bears", B);
    const other = toHand(game, "Wastes", B);
    a.chooseCardNameFn = () => "Grizzly Bears";
    const seen = pickFromZone(a, fromGraveyard, fromHand, fromLibrary);
    const before = hand(game, B).length;
    activate(game, brain, 0, { targets: [ref(B)] });
    expect(zone(game, brain)).toBe("exile");
    expect(new Set(seen.offered)).toEqual(new Set([fromGraveyard, fromHand, fromLibrary]));
    for (const id of [fromGraveyard, fromHand, fromLibrary]) expect(zone(game, id)).toBe("exile");
    expect(zone(game, other)).toBe("hand");
    // One card left the hand, one was drawn.
    expect(hand(game, B)).toHaveLength(before);
    expect(shuffledBy(game)).toEqual([B]);
  });
});

describe("Doomsday", () => {
  /** A library of named cards on top of the forty Wastes, and its graveyard. */
  function board(game: Game): { top: ObjectId[]; yard: ObjectId[] } {
    lands(game, "Swamp", 3);
    const top = ["Lightning Bolt", "Grizzly Bears", "Llanowar Elves"].map((name) => toLibrary(game, name));
    const yard = ["Sol Ring", "Mana Vault"].map((name) => toGraveyard(game, name));
    return { top, yard };
  }

  it("takes five from both zones, exiles the rest, puts them on top in the order asked, and halves your life", () => {
    const { game, a } = table({ life: 21 });
    const { top, yard } = board(game);
    const five = [yard[0], top[1], yard[1], top[0], top[2]];
    const inHand = toHand(game, "Grizzly Bears");
    const order = [top[2], yard[1], top[1], top[0], yard[0]];
    const asked: { eligible: readonly ObjectId[]; min: number; max: number }[] = [];
    a.chooseFromZoneFn = (_view, eligible, min, max) => {
      asked.push({ eligible, min, max });
      return asked.length === 1 ? five : order;
    };
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    const spell = toHand(game, "Doomsday");
    cast(game, spell);
    expect(asked).toHaveLength(2);
    expect(asked[0].eligible).toHaveLength(libraryBefore + 2);
    expect(asked[0].min).toBe(5);
    expect(asked[0].max).toBe(5);
    expect(new Set(asked[1].eligible)).toEqual(new Set(five));
    expect(game.state.zones.perPlayer[A].library).toEqual(order);
    // Doomsday itself is the only card in the graveyard; the hand is untouched.
    expect(graveyard(game)).toEqual([spell]);
    expect(zone(game, inHand)).toBe("hand");
    expect(game.state.zones.shared.exile).toHaveLength(libraryBefore + 2 - 5);
    expect(shuffledBy(game)).toEqual([]);
    expect(life(game)).toBe(10);
  });

  it("with fewer than five cards there, all of them are found and nothing is exiled (rule 701.23d)", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    // Three cards in the zones, by emptying the library first.
    game.state.zones.perPlayer[A].library.length = 0;
    const cards = [toLibrary(game, "Lightning Bolt"), toGraveyard(game, "Sol Ring"), toGraveyard(game, "Mana Vault")];
    const mins: number[] = [];
    a.chooseFromZoneFn = (_view, eligible, min) => {
      mins.push(min);
      return [...eligible];
    };
    cast(game, toHand(game, "Doomsday"));
    expect(mins[0]).toBe(3);
    expect(new Set(game.state.zones.perPlayer[A].library)).toEqual(new Set(cards));
    expect(game.state.zones.shared.exile).toEqual([]);
    expect(life(game)).toBe(10);
  });

  it("five copies of one card ask no order", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    let asks = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asks += 1;
      return eligible.slice(0, 5);
    };
    cast(game, toHand(game, "Doomsday"));
    expect(asks).toBe(1);
    expect(game.state.zones.perPlayer[A].library).toHaveLength(5);
    expect(named(game, "Doomsday")).toEqual([]);
  });
});
