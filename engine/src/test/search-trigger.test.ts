/**
 * `{ on: "searches-library" }` (rule 701.23): a player searching their own
 * library — Archivist of Oghma, Wan Shi Tong, Librarian, Ob Nixilis, Unshackled.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { PlayerId } from "../primitives.js";

/** `by` casts Rampant Growth, on their turn, finding a land if they can. */
function growth(game: Game, seat: ScriptedController, by: PlayerId = B): void {
  lands(game, "Forest", 2, by);
  game.debugSpawn("Forest", by, "library");
  seat.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
  cast(game, toHand(game, "Rampant Growth", by), { player: by });
}

describe("Archivist of Oghma", () => {
  it("an opponent's search: you gain 1 and draw 1", () => {
    const { game, b } = table();
    spawn(game, "Archivist of Oghma");
    nextTurn(game);
    const before = hand(game, A).length;
    growth(game, b);
    expect(life(game, A)).toBe(21);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("has flash", () => {
    const { game } = table();
    const archivist = spawn(game, "Archivist of Oghma");
    expect(keywords(game, archivist).has("flash")).toBe(true);
  });

  it("not your own search", () => {
    const { game, a } = table();
    spawn(game, "Archivist of Oghma");
    growth(game, a, A);
    expect(life(game, A)).toBe(20);
  });

  it("an opponent searching and finding nothing still searched", () => {
    const { game, b } = table();
    spawn(game, "Archivist of Oghma");
    nextTurn(game);
    lands(game, "Forest", 2, B);
    b.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(life(game, A)).toBe(21);
  });

  it("not an opponent's search of your library, nor yours of theirs (the ruling)", () => {
    const { game, a, b } = table();
    spawn(game, "Archivist of Oghma");
    spawn(game, "Archivist of Oghma", B);
    lands(game, "Island", 5);
    a.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Bribery"), { targets: [ref(B)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);

    nextTurn(game);
    lands(game, "Island", 5, B);
    b.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Bribery", B), { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("your effect making an opponent search their own still counts", () => {
    const { game, b } = table();
    spawn(game, "Archivist of Oghma");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    b.chooseModesFn = () => [0];
    b.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Path to Exile"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, A)).toBe(21);
  });

  it("nothing when they decline to", () => {
    const { game, b } = table();
    spawn(game, "Archivist of Oghma");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    b.chooseModesFn = () => [];
    cast(game, toHand(game, "Path to Exile"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, A)).toBe(20);
  });

  it("nothing when they can't search (Ashiok, Dream Render)", () => {
    const { game, b } = table();
    spawn(game, "Archivist of Oghma");
    spawn(game, "Ashiok, Dream Render");
    nextTurn(game);
    growth(game, b);
    expect(life(game, A)).toBe(20);
  });

  it("each opponent's, in a four-player game: Carol's search triggers Alice's and Bob's", () => {
    const { game, c } = table({ players: 4 });
    spawn(game, "Archivist of Oghma");
    spawn(game, "Archivist of Oghma", B);
    spawn(game, "Archivist of Oghma", C);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    growth(game, c, C);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(21);
    expect(life(game, C)).toBe(20);
  });

  it("goes on the stack after what made the search has resolved: the land's already in", () => {
    const { game, b } = table();
    spawn(game, "Archivist of Oghma");
    nextTurn(game);
    lands(game, "Forest", 2, B);
    const land = game.debugSpawn("Forest", B, "library");
    pickFromZone(b, land);
    cast(game, toHand(game, "Rampant Growth", B), { player: B, settle: false });
    game.advanceUntil((s) => {
      const top = s.objects[s.zones.shared.stack[s.zones.shared.stack.length - 1]];
      return top?.kind === "ability" && s.awaiting === null;
    });
    expect(zone(game, land)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    settle(game);
    expect(life(game, A)).toBe(21);
  });
});

describe("Wan Shi Tong, Librarian", () => {
  it("cast with X: X counters and half X cards, rounded down", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const before = hand(game).length;
    const wan = toHand(game, "Wan Shi Tong, Librarian");
    cast(game, wan, { x: 3 });
    expect(counters(game, wan)).toBe(3);
    expect(hand(game).length).toBe(before + 1);
  });

  it("X 0: none of either", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const before = hand(game).length;
    const wan = toHand(game, "Wan Shi Tong, Librarian");
    cast(game, wan, { x: 0 });
    expect(counters(game, wan)).toBe(0);
    expect(hand(game).length).toBe(before);
  });

  it("entering uncast, X is 0", () => {
    const { game } = table();
    const before = hand(game).length;
    const wan = enter(game, "Wan Shi Tong, Librarian");
    expect(counters(game, wan)).toBe(0);
    expect(hand(game).length).toBe(before);
  });

  it("has flash, flying and vigilance", () => {
    const { game } = table();
    const wan = spawn(game, "Wan Shi Tong, Librarian");
    expect([...keywords(game, wan)]).toEqual(expect.arrayContaining(["flash", "flying", "vigilance"]));
  });

  it("an opponent's search: a counter and a card", () => {
    const { game, b } = table();
    const wan = spawn(game, "Wan Shi Tong, Librarian");
    nextTurn(game);
    const before = hand(game).length;
    growth(game, b);
    expect(counters(game, wan)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Ob Nixilis, Unshackled", () => {
  it("that player sacrifices a creature of their choice and loses 10", () => {
    const { game, b } = table();
    spawn(game, "Ob Nixilis, Unshackled");
    const theirs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    growth(game, b);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(10);
    expect(life(game, A)).toBe(20);
  });

  it("with no creature, still 10 life (the ruling)", () => {
    const { game, b } = table();
    spawn(game, "Ob Nixilis, Unshackled");
    nextTurn(game);
    growth(game, b);
    expect(life(game, B)).toBe(10);
  });

  it("only the one who searched, in a three-player game", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Ob Nixilis, Unshackled");
    const carols = spawn(game, "Grizzly Bears", C);
    nextTurn(game);
    growth(game, b);
    expect(life(game, B)).toBe(10);
    expect(life(game, C)).toBe(20);
    expect(zone(game, carols)).toBe("battlefield");
  });

  it("not your own search", () => {
    const { game, a } = table();
    spawn(game, "Ob Nixilis, Unshackled");
    growth(game, a, A);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("another creature dying adds a counter, whoever's, and he has flying and trample", () => {
    const { game } = table();
    const ob = spawn(game, "Ob Nixilis, Unshackled");
    expect([...keywords(game, ob)]).toEqual(expect.arrayContaining(["flying", "trample"]));
    destroy(game, spawn(game, "Grizzly Bears", B));
    settle(game);
    expect(counters(game, ob)).toBe(1);
    expect(named(game, "Grizzly Bears").length).toBe(0);
  });
});
