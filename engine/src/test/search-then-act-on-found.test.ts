/**
 * A search whose next instruction is about the card it found: Scion of the
 * Ur-Dragon ("…put it into your graveyard. If you do, Scion becomes a copy of
 * that card until end of turn" — rule 707.2, the card's printed values) and
 * Savage Order ("put it onto the battlefield … It gains indestructible until
 * your next turn", behind a sacrifice of a creature with power 4 or greater —
 * rule 601.2f), and Instrument of the Bards ("If that card is legendary,
 * create a Treasure token").
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf, nameOf } from "../state.js";
import {
  A,
  B,
  activate,
  counters,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  spawn,
  subtypes,
  table,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const copyOf = (game: Game, id: ObjectId): string | null => game.state.objects[id].copyOf;
const scionActions = (game: Game, id: ObjectId): number =>
  game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === id).length;

describe("Scion of the Ur-Dragon", () => {
  it("puts a Dragon permanent card into the graveyard and is a copy of it until end of turn", () => {
    const { game, a } = table();
    const scion = spawn(game, "Scion of the Ur-Dragon");
    lands(game, "Mountain", 4);
    const dragon = toLibrary(game, "Shivan Dragon");
    const swap = toLibrary(game, "Crib Swap");
    toLibrary(game, "Craw Wurm");
    expect(pt(game, scion)).toEqual({ power: 4, toughness: 4 });
    const seen = pickFromZone(a, dragon);
    activate(game, scion, 0);
    // A Dragon *permanent* card: not the Wurm, nor a changeling instant.
    expect(seen.offered).toEqual([dragon]);
    expect(seen.offered).not.toContain(swap);
    expect(zone(game, dragon)).toBe("graveyard");
    expect(copyOf(game, scion)).toBe("Shivan Dragon");
    expect(nameOf(game.state.objects[scion])).toBe("Shivan Dragon");
    expect(pt(game, scion)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, scion)).toEqual(["Dragon"]);
    // It has the Dragon's ability and no longer its own (the ruling): {R}: +1/+0.
    expect(scionActions(game, scion)).toBe(1);
    activate(game, scion, 0);
    expect(pt(game, scion)).toEqual({ power: 6, toughness: 5 });
    expect(zone(game, toLibraryProbe(game))).toBe("library");
    // The card leaving the graveyard changes nothing (the ruling).
    game.debugMove(dragon, "exile");
    expect(copyOf(game, scion)).toBe("Shivan Dragon");
    // Itself again from the cleanup step on.
    nextTurn(game);
    expect(copyOf(game, scion)).toBeNull();
    expect(nameOf(game.state.objects[scion])).toBe("Scion of the Ur-Dragon");
    expect(pt(game, scion)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, scion).has("flying")).toBe(true);
  });

  it("stays itself when it finds nothing", () => {
    const { game, a } = table();
    const scion = spawn(game, "Scion of the Ur-Dragon");
    lands(game, "Mountain", 2);
    toLibrary(game, "Shivan Dragon");
    pickFromZone(a);
    activate(game, scion, 0);
    expect(copyOf(game, scion)).toBeNull();
    expect(pt(game, scion)).toEqual({ power: 4, toughness: 4 });
  });

  it("\"if you do\": a card exiled instead of reaching the graveyard isn't copied", () => {
    const { game, a } = table();
    const scion = spawn(game, "Scion of the Ur-Dragon");
    lands(game, "Mountain", 2);
    spawn(game, "Rest in Peace", B);
    const dragon = toLibrary(game, "Shivan Dragon");
    pickFromZone(a, dragon);
    activate(game, scion, 0);
    expect(zone(game, dragon)).toBe("exile");
    expect(copyOf(game, scion)).toBeNull();
    expect(pt(game, scion)).toEqual({ power: 4, toughness: 4 });
  });

  it("two activations in a row: the one that resolves last is what it is", () => {
    const { game, a } = table();
    const scion = spawn(game, "Scion of the Ur-Dragon");
    lands(game, "Mountain", 4);
    const shivan = toLibrary(game, "Shivan Dragon");
    const tyrant = toLibrary(game, "Hellkite Tyrant");
    // Both on the stack before either resolves; the first find is the Shivan.
    const picks = [shivan, tyrant];
    a.chooseFromZoneFn = () => [picks.shift()!];
    activate(game, scion, 0, { settle: false });
    activate(game, scion, 0);
    expect(zone(game, shivan)).toBe("graveyard");
    expect(zone(game, tyrant)).toBe("graveyard");
    expect(copyOf(game, scion)).toBe("Hellkite Tyrant");
    expect(pt(game, scion)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Instrument of the Bards", () => {
  /** An Instrument with one harmony counter, on alice's next turn, lands for one activation. */
  function setup(): { game: Game; a: ReturnType<typeof table>["a"]; bards: ObjectId } {
    const { game, a } = table();
    const bards = spawn(game, "Instrument of the Bards");
    lands(game, "Forest", 4);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, bards, "harmony")).toBe(1);
    return { game, a, bards };
  }

  it("the upkeep counter is a may", () => {
    const { game, a } = table();
    const bards = spawn(game, "Instrument of the Bards");
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, bards, "harmony")).toBe(0);
  });

  it("finds a creature card of exactly that mana value; a legendary one makes a Treasure", () => {
    const { game, a, bards } = setup();
    const hound = toLibrary(game, "Isamaru, Hound of Konda");
    const lions = toLibrary(game, "Savannah Lions");
    toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, hound);
    activate(game, bards, 0);
    expect([...seen.offered].sort()).toEqual([hound, lions].sort());
    expect(zone(game, hound)).toBe("hand");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("a nonlegendary find, or none, makes no Treasure", () => {
    const { game, a, bards } = setup();
    toLibrary(game, "Isamaru, Hound of Konda");
    const lions = toLibrary(game, "Savannah Lions");
    pickFromZone(a, lions);
    activate(game, bards, 0);
    expect(zone(game, lions)).toBe("hand");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    // Again next turn, with two counters now: nothing of mana value 1 is offered.
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, bards, "harmony")).toBe(2);
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a);
    activate(game, bards, 0);
    expect(seen.offered).toEqual([bears]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

/** Any card still in alice's library (the search shuffled, it didn't empty it). */
function toLibraryProbe(game: Game): ObjectId {
  return game.state.zones.perPlayer[A].library[0];
}
