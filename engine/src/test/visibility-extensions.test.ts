/**
 * Who may look at which hidden or face-down cards: `StaticAbility.visibility`
 * as `viewFor` reads it (hands played revealed, library tops played revealed,
 * looking at face-down creatures), and the one-shot look at a library's top
 * card (`look-at-library-top`).
 */
import { describe, expect, it } from "vitest";
import { viewFor } from "../view.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  destroy,
  enter,
  lands,
  nextTurn,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

const sees = (game: Game, viewer: PlayerId, id: ObjectId): boolean =>
  viewFor(game.state, registryOf(game), viewer).objects[id] !== undefined;

const topShownTo = (game: Game, viewer: PlayerId, player: PlayerId): ObjectId | null =>
  viewFor(game.state, registryOf(game), viewer).revealedLibraryTop[player] ?? null;

const faceDownCard = (game: Game, viewer: PlayerId, id: ObjectId): string | undefined =>
  viewFor(game.state, registryOf(game), viewer).objects[id]?.faceDown?.card;

/** What a `choose-from-zone` is showing its chooser now. */
const looked = (game: Game): readonly ObjectId[] =>
  game.state.awaiting?.kind === "choose-from-zone" ? game.state.awaiting.ids : [];

const manifest = (game: Game, name: string, player: PlayerId): ObjectId => {
  const id = spawn(game, name, player);
  game.state.objects[id]!.faceDown = { kind: "manifest" };
  return id;
};

describe("hands played revealed", () => {
  it("Telepathy shows each opponent's hand to its controller, not its controller's", () => {
    const { game } = table({ players: 3 });
    const card = toHand(game, "Grizzly Bears", B);
    const mine = toHand(game, "Llanowar Elves", A);
    expect(sees(game, A, card)).toBe(false);
    spawn(game, "Telepathy");
    expect(sees(game, A, card)).toBe(true);
    expect(viewFor(game.state, registryOf(game), A).objects[card]?.cardName).toBe("Grizzly Bears");
    expect(sees(game, B, mine)).toBe(false);
  });

  it("revealed means to every player: another opponent sees it too", () => {
    const { game } = table({ players: 3 });
    const card = toHand(game, "Grizzly Bears", B);
    spawn(game, "Telepathy");
    expect(sees(game, C, card)).toBe(true);
    // ...and a new card in that hand as soon as it's there.
    const drawn = toHand(game, "Hill Giant", B);
    expect(sees(game, A, drawn)).toBe(true);
  });

  it("Wandering Eye reveals every hand, its controller's too", () => {
    const { game } = table();
    const mine = toHand(game, "Llanowar Elves", A);
    const theirs = toHand(game, "Grizzly Bears", B);
    spawn(game, "Wandering Eye");
    expect(sees(game, B, mine)).toBe(true);
    expect(sees(game, A, theirs)).toBe(true);
  });

  it("stops with the permanent", () => {
    const { game } = table();
    const card = toHand(game, "Grizzly Bears", B);
    const eye = spawn(game, "Wandering Eye");
    expect(sees(game, A, card)).toBe(true);
    destroy(game, eye);
    expect(sees(game, A, card)).toBe(false);
  });

  it("a face-down Wandering Eye has no such ability (rule 708.2a)", () => {
    const { game } = table();
    const card = toHand(game, "Grizzly Bears", B);
    manifest(game, "Wandering Eye", A);
    expect(sees(game, A, card)).toBe(false);
  });
});

describe("library tops played revealed", () => {
  it("Wizened Snitches shows every player's top card to every player", () => {
    const { game } = table();
    const mine = toLibrary(game, "Grizzly Bears", A);
    const theirs = toLibrary(game, "Hill Giant", B);
    expect(topShownTo(game, A, B)).toBe(null);
    spawn(game, "Wizened Snitches", A);
    expect(topShownTo(game, A, B)).toBe(theirs);
    expect(topShownTo(game, B, A)).toBe(mine);
    expect(sees(game, A, theirs)).toBe(true);
    expect(sees(game, B, theirs)).toBe(true);
  });
});

describe("looking at face-down creatures", () => {
  it("Keeper of the Lens shows its controller what they are, and no one else", () => {
    const { game } = table({ players: 3 });
    const down = manifest(game, "Grizzly Bears", B);
    expect(faceDownCard(game, A, down)).toBeUndefined();
    spawn(game, "Keeper of the Lens");
    expect(faceDownCard(game, A, down)).toBe("Grizzly Bears");
    expect(faceDownCard(game, C, down)).toBeUndefined();
    // Its own controller always could (rule 708.5).
    expect(faceDownCard(game, B, down)).toBe("Grizzly Bears");
  });

  it("Found Footage reads the same", () => {
    const { game } = table();
    const down = manifest(game, "Grizzly Bears", B);
    spawn(game, "Found Footage");
    expect(faceDownCard(game, A, down)).toBe("Grizzly Bears");
  });

  it("not a face-down spell on the stack (the rulings)", () => {
    const { game } = table();
    spawn(game, "Keeper of the Lens");
    const card = toHand(game, "Lumbering Laundry", B);
    lands(game, "Wastes", 3, B);
    nextTurn(game);
    cast(game, card, { player: B, via: "face-down", settle: false });
    expect(game.state.objects[card]?.zone).toBe("stack");
    expect(faceDownCard(game, A, card)).toBeUndefined();
    settle(game);
    expect(game.state.objects[card]?.zone).toBe("battlefield");
    expect(faceDownCard(game, A, card)).toBe("Lumbering Laundry");
  });

  it("Lumbering Laundry's activation lasts until end of turn", () => {
    const { game } = table();
    const down = manifest(game, "Grizzly Bears", B);
    const laundry = spawn(game, "Lumbering Laundry");
    lands(game, "Wastes", 2);
    expect(faceDownCard(game, A, down)).toBeUndefined();
    activate(game, laundry, 0);
    expect(faceDownCard(game, A, down)).toBe("Grizzly Bears");
    nextTurn(game);
    expect(faceDownCard(game, A, down)).toBeUndefined();
  });

  it("Found Footage still surveils and draws", () => {
    const { game } = table();
    const footage = spawn(game, "Found Footage");
    lands(game, "Wastes", 2);
    const before = game.state.zones.perPlayer[A].hand.length;
    activate(game, footage, 0);
    expect(game.state.objects[footage]?.zone).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
  });
});

describe("a granted look at your own library", () => {
  it("Glowcap Lantern: the equipped creature's controller sees their top card, and it explores", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Forest", A);
    const bears = spawn(game, "Grizzly Bears");
    const lantern = spawn(game, "Glowcap Lantern");
    lands(game, "Wastes", 2);
    expect(topShownTo(game, A, A)).toBe(null);
    activate(game, lantern, 0, { targets: [ref(bears)] });
    expect(topShownTo(game, A, A)).toBe(top);
    expect(topShownTo(game, B, A)).toBe(null);
    attack(game, a, [bears]);
    // A land on top: explore takes it to hand.
    expect(game.state.objects[top]?.zone).toBe("hand");
  });
});

describe("a look at a library's top card", () => {
  it("Mishra's Bauble shows the looker the top card, alone, and draws next upkeep", () => {
    const { game, a } = table({ players: 3 });
    const top = toLibrary(game, "Grizzly Bears", B);
    const bauble = spawn(game, "Mishra's Bauble");
    let shown: readonly ObjectId[] = [];
    let stranger = true;
    a.chooseFromZoneFn = () => {
      shown = looked(game);
      stranger = sees(game, C, top);
      return [];
    };
    const hand = game.state.zones.perPlayer[A].hand.length;
    activate(game, bauble, 0, { targets: [ref(B)] });
    expect(shown).toEqual([top]);
    expect(stranger).toBe(false);
    expect(game.state.zones.perPlayer[B].library[0]).toBe(top);
    expect(game.state.objects[bauble]?.zone).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand);
    expect(game.state.delayedTriggers.length).toBe(1);
    nextTurn(game);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 1);
  });

  it("an empty library asks nothing, and the Observer's trigger is a look", () => {
    const { game, a } = table();
    const top = toLibrary(game, "Grizzly Bears", B);
    let asked = 0;
    a.chooseFromZoneFn = () => {
      asked += 1;
      expect(looked(game)).toEqual([top]);
      return [];
    };
    a.chooseTargetsFn = () => [ref(B)];
    enter(game, "Merfolk Observer");
    expect(asked).toBe(1);
    game.state.zones.perPlayer[B].library.length = 0;
    enter(game, "Merfolk Observer");
    expect(asked).toBe(1);
  });

  it("Peek looks, then draws", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears", B);
    let shown: readonly ObjectId[] = [];
    a.chooseFromZoneFn = () => {
      shown = looked(game);
      return [];
    };
    lands(game, "Island", 1);
    const hand = game.state.zones.perPlayer[A].hand.length;
    cast(game, toHand(game, "Peek"), { targets: [ref(B)] });
    expect(shown).toContain(card);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(hand + 1);
  });
});
