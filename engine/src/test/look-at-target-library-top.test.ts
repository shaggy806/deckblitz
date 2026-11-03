/**
 * "Look at the top card of target player's library": a private look (rule
 * 401.2), with what the looker may then do. `look-at-library-top` alone
 * (Rootwater Mystic), or `look-and-choose` with `from` (a target slot or the
 * trigger's player) for "you may put that card…" (Lurking Informant, Coral
 * Fighters, Precognition), `destination: "stay"` and a `then` for a payment
 * (Wand of Denial).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, attack, graveyard, life, ref, settle, spawn, table, toLibrary, zone } from "./harness.js";

type Game = ReturnType<typeof table>["game"];

const libraryOf = (game: Game, player = B): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Rootwater Mystic", () => {
  it("shows the top card to its controller alone, and it stays there", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Rootwater Mystic");
    const lands = [spawn(game, "Island"), spawn(game, "Island")];
    expect(lands).toHaveLength(2);
    const bear = toLibrary(game, "Grizzly Bears", B);
    let shown: readonly ObjectId[] = [];
    let prompt: string | undefined;
    let aliceSeesIt = false;
    let bobSeesIt = true;
    a.chooseFromZoneFn = () => {
      const awaiting = game.state.awaiting;
      if (awaiting?.kind === "choose-from-zone") {
        shown = awaiting.ids;
        prompt = awaiting.prompt;
      }
      aliceSeesIt = game.viewFor(A).objects[bear]?.cardName === "Grizzly Bears";
      bobSeesIt = game.viewFor(B).objects[bear]?.cardName === "Grizzly Bears";
      return [];
    };
    activate(game, mystic, 0, { targets: [ref(B)] });
    expect(shown).toEqual([bear]);
    expect(aliceSeesIt).toBe(true);
    expect(prompt).toBe("Looking at the top card of that player's library");
    // Bob's own library's top is hidden from Bob too (rule 401.2).
    expect(bobSeesIt).toBe(false);
    expect(libraryOf(game)[0]).toBe(bear);
  });

  it("calls your own library yours", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Rootwater Mystic");
    spawn(game, "Island");
    spawn(game, "Island");
    let prompt: string | undefined;
    a.chooseFromZoneFn = () => {
      const awaiting = game.state.awaiting;
      if (awaiting?.kind === "choose-from-zone") prompt = awaiting.prompt;
      return [];
    };
    activate(game, mystic, 0, { targets: [ref(A)] });
    expect(prompt).toBe("Looking at the top card of your library");
  });
});

describe("Lurking Informant", () => {
  it("may put the top card into its owner's graveyard", () => {
    const { game, a } = table();
    const informant = spawn(game, "Lurking Informant");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    const bear = toLibrary(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    activate(game, informant, 0, { targets: [ref(B)] });
    expect(graveyard(game, B)).toContain(bear);
    expect(game.state.objects[informant].tapped).toBe(true);
  });

  it("leaves it on top when declined", () => {
    const { game, a } = table();
    const informant = spawn(game, "Lurking Informant");
    spawn(game, "Wastes");
    spawn(game, "Wastes");
    const bear = toLibrary(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = () => [];
    activate(game, informant, 0, { targets: [ref(B)] });
    expect(libraryOf(game)[0]).toBe(bear);
  });
});

describe("Coral Fighters", () => {
  it("looks at the defending player's top card, unblocked, and may bottom it", () => {
    const { game, a } = table({ players: 3 });
    const fighters = spawn(game, "Coral Fighters", A, { sick: false });
    const bear = toLibrary(game, "Grizzly Bears", C);
    const bobTop = libraryOf(game, B)[0];
    let shown: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      shown = eligible;
      return eligible;
    };
    attack(game, a, [fighters], C);
    // Carol's, the player it attacked, not Bob's.
    expect(shown).toEqual([bear]);
    const carol = libraryOf(game, C);
    expect(carol[carol.length - 1]).toBe(bear);
    expect(carol[0]).not.toBe(bear);
    expect(libraryOf(game, B)[0]).toBe(bobTop);
  });

  it("asks nothing when it's blocked", () => {
    const { game, a, b } = table();
    const fighters = spawn(game, "Coral Fighters", A, { sick: false });
    const wall = spawn(game, "Grizzly Bears", B);
    const bear = toLibrary(game, "Grizzly Bears", B);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    b.declareBlockersFn = () => [{ blocker: wall, attacker: fighters }];
    attack(game, a, [fighters], B);
    expect(asked).toBe(0);
    expect(libraryOf(game)[0]).toBe(bear);
  });
});

describe("Precognition", () => {
  /** Precognition's controller at the start of her next upkeep. */
  function upkeep(top: string): { game: Game; a: ReturnType<typeof table>["a"]; card: ObjectId } {
    const { game, a } = table();
    spawn(game, "Precognition");
    // Past Bob's own draw.
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "end");
    const card = toLibrary(game, top, B);
    a.chooseTargetsFn = () => [ref(B)];
    return { game, a, card };
  }

  it("may look, and may then put the card on the bottom", () => {
    const { game, a, card } = upkeep("Grizzly Bears");
    a.chooseModesFn = () => [0];
    let shown: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      shown = eligible;
      return eligible;
    };
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    settle(game);
    expect(shown).toEqual([card]);
    const library = libraryOf(game);
    expect(library[library.length - 1]).toBe(card);
  });

  it("shows nothing when you don't look", () => {
    const { game, a, card } = upkeep("Grizzly Bears");
    a.chooseModesFn = () => [];
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      return [];
    };
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    settle(game);
    expect(asked).toBe(0);
    expect(libraryOf(game)).toContain(card);
    expect(libraryOf(game)[libraryOf(game).length - 1]).not.toBe(card);
  });
});

describe("Wand of Denial", () => {
  it("pays 2 life to put a nonland top card into its owner's graveyard", () => {
    const { game, a } = table();
    const wand = spawn(game, "Wand of Denial");
    const bear = toLibrary(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    a.chooseModesFn = () => [0];
    activate(game, wand, 0, { targets: [ref(B)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(bear);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });

  it("costs nothing and moves nothing when you don't pay", () => {
    const { game, a } = table();
    const wand = spawn(game, "Wand of Denial");
    const bear = toLibrary(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    a.chooseModesFn = () => [];
    activate(game, wand, 0, { targets: [ref(B)] });
    expect(libraryOf(game)[0]).toBe(bear);
    expect(life(game, A)).toBe(20);
  });

  it("only shows a land: nothing can be chosen and nothing is asked to pay", () => {
    const { game, a } = table();
    const wand = spawn(game, "Wand of Denial");
    const island = toLibrary(game, "Island", B);
    let eligibleSeen: readonly ObjectId[] | undefined;
    let idsSeen: readonly ObjectId[] = [];
    let paid = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      eligibleSeen = eligible;
      const awaiting = game.state.awaiting;
      if (awaiting?.kind === "choose-from-zone") idsSeen = awaiting.ids;
      return [];
    };
    a.chooseModesFn = () => {
      paid += 1;
      return [0];
    };
    activate(game, wand, 0, { targets: [ref(B)] });
    expect(idsSeen).toEqual([island]);
    expect(eligibleSeen).toEqual([]);
    expect(paid).toBe(0);
    expect(libraryOf(game)[0]).toBe(island);
    expect(life(game, A)).toBe(20);
  });

  it("can't pay with less than 2 life, so the card stays", () => {
    const { game, a } = table({ life: 1 });
    const wand = spawn(game, "Wand of Denial");
    const bear = toLibrary(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    a.chooseModesFn = () => [0];
    activate(game, wand, 0, { targets: [ref(B)] });
    expect(libraryOf(game)[0]).toBe(bear);
    expect(life(game, A)).toBe(1);
  });
});
