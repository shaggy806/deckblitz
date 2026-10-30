import { describe, expect, it } from "vitest";
import { Game } from "../game.js";
import { viewFor } from "../view.js";
import { asPlayerId } from "../primitives.js";
import { A, B, cast, hand, lands, pickFromZone, pickModes, table, toExile, toHand, zone } from "./harness.js";
import type { ObjectId } from "../primitives.js";

// Cards outside the game: a player's sideboard (rule 400.11a), brought in by
// a search of outside the game (701.23j) — `search-library`'s `outside` and
// `faceUpExile`. Commander games have none (903.5e).

const outsideOf = (game: Game, player = A): readonly ObjectId[] => game.state.outside?.[player] ?? [];
const outsideNamed = (game: Game, name: string): ObjectId => {
  const id = outsideOf(game).find((o) => game.state.objects[o].cardName === name);
  if (id === undefined) throw new Error(`no ${name} outside the game`);
  return id;
};

describe("a sideboard: cards outside the game (rule 400.11a)", () => {
  it("starts outside the game, seen by its owner alone", () => {
    const { game } = table({ sideboard: ["Demonic Tutor", "Legion Angel"] });
    const ids = outsideOf(game);
    expect(ids.map((id) => game.state.objects[id].zone)).toEqual(["outside", "outside"]);
    // Not in the library, the hand or anywhere else in the game.
    expect(game.state.zones.perPlayer[A].library).not.toContain(ids[0]);
    const mine = viewFor(game.state, game.registry, A);
    expect(mine.zones.sideboard).toEqual(ids);
    expect(mine.objects[ids[0]]?.cardName).toBe("Demonic Tutor");
    const theirs = viewFor(game.state, game.registry, B);
    expect(theirs.zones.sideboard).toEqual([]);
    expect(theirs.players[A].sideboardSize).toBe(2);
    expect(theirs.objects[ids[0]]).toBeUndefined();
  });

  it("isn't brought into a Commander game (rule 903.5e)", () => {
    const game = Game.create({
      seed: 1,
      shuffle: false,
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes"), commanders: ["Legion Angel"], sideboard: ["Demonic Tutor"] },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    expect(outsideOf(game)).toEqual([]);
    expect(Object.values(game.state.objects).some((o) => o.cardName === "Demonic Tutor")).toBe(false);
  });
});

describe("a wish: search outside the game (rule 701.23j)", () => {
  it("Burning Wish offers only the sorceries, reveals the one taken and exiles itself", () => {
    const { game, a } = table({ sideboard: ["Demonic Tutor", "Legion Angel", "Academic Probation"] });
    lands(game, "Mountain", 2);
    const libraryBefore = [...game.state.zones.perPlayer[A].library];
    const tutor = outsideNamed(game, "Demonic Tutor");
    const seen = pickFromZone(a, tutor);
    const wish = toHand(game, "Burning Wish");
    cast(game, wish);
    expect([...seen.offered].sort()).toEqual([tutor, outsideNamed(game, "Academic Probation")].sort());
    expect(zone(game, tutor)).toBe("hand");
    expect(game.state.objects[tutor].owner).toBe(A);
    expect(zone(game, wish)).toBe("exile");
    // The others stay outside the game; the library isn't shuffled.
    expect(outsideOf(game)).toHaveLength(2);
    expect(game.state.zones.perPlayer[A].library).toEqual(libraryBefore);
    expect(
      game.events.some((e) => e.type === "cards-revealed" && e.from === "sideboard" && e.objects.includes(tutor)),
    ).toBe(true);
  });

  it("asks nothing when nothing outside the game fits", () => {
    const { game, a } = table({ sideboard: ["Legion Angel"] });
    lands(game, "Mountain", 2);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    const wish = toHand(game, "Burning Wish");
    cast(game, wish);
    expect(asked).toBe(false);
    expect(zone(game, wish)).toBe("exile");
    expect(outsideOf(game)).toHaveLength(1);
  });

  it("Living Wish takes a creature or a land, not a sorcery", () => {
    const { game, a } = table({ sideboard: ["Legion Angel", "Forest", "Demonic Tutor"] });
    lands(game, "Forest", 2);
    const angel = outsideNamed(game, "Legion Angel");
    const seen = pickFromZone(a, angel);
    cast(game, toHand(game, "Living Wish"));
    expect([...seen.offered].sort()).toEqual([angel, outsideNamed(game, "Forest")].sort());
    expect(zone(game, angel)).toBe("hand");
  });

  it("Coax from the Blind Eternities: an Eldrazi outside the game or face-up in exile, never face down", () => {
    const { game, a } = table({ sideboard: ["Artisan of Kozilek", "Demonic Tutor"] });
    lands(game, "Island", 3);
    const exiled = toExile(game, "Angelic Aberration");
    const faceDown = toExile(game, "Abundant Maw");
    game.state.objects[faceDown].exiledFaceDown = { lookers: [A] };
    const theirs = toExile(game, "Artisan of Kozilek", B);
    const seen = pickFromZone(a, exiled);
    cast(game, toHand(game, "Coax from the Blind Eternities"));
    expect([...seen.offered].sort()).toEqual([exiled, outsideNamed(game, "Artisan of Kozilek")].sort());
    expect(seen.offered).not.toContain(faceDown);
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, exiled)).toBe("hand");
    // An exiled card was public already: nothing is revealed from a library.
    expect(game.events.some((e) => e.type === "cards-revealed" && e.objects.includes(exiled))).toBe(false);
  });

  it("Mastermind's Acquisition's second mode puts any card from outside the game into hand, unrevealed", () => {
    const { game, a } = table({ sideboard: ["Legion Angel", "Forest"] });
    lands(game, "Swamp", 4);
    pickModes(a, 1);
    const forest = outsideNamed(game, "Forest");
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Mastermind's Acquisition"), { modes: [1] });
    expect(seen.offered).toHaveLength(2);
    expect(zone(game, forest)).toBe("hand");
    expect(game.events.some((e) => e.type === "cards-revealed" && e.objects.includes(forest))).toBe(false);
  });

  it("Legion Angel's enters trigger finds another Legion Angel", () => {
    const { game, a } = table({ sideboard: ["Legion Angel", "Demonic Tutor"] });
    lands(game, "Plains", 4);
    const spare = outsideNamed(game, "Legion Angel");
    const seen = pickFromZone(a, spare);
    cast(game, toHand(game, "Legion Angel"));
    expect(seen.offered).toEqual([spare]);
    expect(hand(game)).toContain(spare);
  });
});

describe("learn's Lesson half (rule 701.48a)", () => {
  it("not discarding, the player may reveal a Lesson from outside the game", () => {
    const { game, a } = table({ sideboard: ["Academic Probation", "Demonic Tutor"] });
    lands(game, "Plains", 2);
    // Decline the rummage.
    a.chooseModesFn = () => [];
    const lesson = outsideNamed(game, "Academic Probation");
    const seen = pickFromZone(a, lesson);
    cast(game, toHand(game, "Study Break"), { targets: [null, null] });
    expect(seen.offered).toEqual([lesson]);
    expect(zone(game, lesson)).toBe("hand");
  });

  it("discarding a card, the Lesson half doesn't happen", () => {
    const { game, a } = table({ sideboard: ["Academic Probation"] });
    lands(game, "Plains", 2);
    toHand(game, "Wastes");
    a.chooseModesFn = (_view, _min, max) => (max > 0 ? [0] : []);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    cast(game, toHand(game, "Study Break"), { targets: [null, null] });
    expect(asked).toBe(false);
    expect(outsideOf(game)).toHaveLength(1);
  });

  it("with no sideboard, learn is only the rummage", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const spell = toHand(game, "Study Break");
    cast(game, spell, { targets: [null, null] });
    expect(zone(game, spell)).toBe("graveyard");
    expect(asPlayerId("alice")).toBe(A);
  });
});
