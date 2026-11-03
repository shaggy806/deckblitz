/**
 * Whole hands exiled face down (rule 406.3) and returned later: `exile-graveyard`'s
 * `faceDown` with `fromHand: "only"`, read by a delayed ability (`about: "exiled"`,
 * `orNone`) or a linked one (rule 607.2a), and the delayed timing of "that
 * player's next turn" (`your-next-turn-end-step`, `turnOf`).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

const sees = (game: Game, viewer: PlayerId, card: ObjectId): boolean => game.viewFor(viewer).objects[card] !== undefined;

const exiledAway = (game: Game, ...cards: readonly ObjectId[]): void => {
  for (const card of cards) {
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].exiledFaceDown?.lookers).toEqual([]);
    for (const player of [A, B]) expect(sees(game, player, card)).toBe(false);
  }
};

/** The opening hands of the harness's Wastes, back on the libraries: these
 * tests are about what's in a hand. */
const noHands = (game: Game): void => {
  for (const player of game.state.turnOrder) {
    const zones = game.state.zones.perPlayer[player];
    for (const id of zones.hand) game.state.objects[id].zone = "library";
    zones.library = [...zones.hand, ...zones.library];
    zones.hand = [];
  }
};

const sorted = (ids: readonly ObjectId[]): readonly ObjectId[] => [...ids].sort();

/** Carry on until turn `turn`'s `step`, each seat passing. */
const untilTurn = (game: Game, turn: number, step: Game["state"]["turn"]["step"]): void => {
  game.advanceUntil((s) => s.turn.number === turn && s.turn.step === step);
};

describe("Memory Jar: every hand away, seven new ones, and back at the end step", () => {
  it("exiles each hand unseen, draws seven, then discards those and returns the old", () => {
    const { game } = table({ players: 3 });
    noHands(game);
    const jar = spawn(game, "Memory Jar");
    const mine = [toHand(game, "Grizzly Bears"), toHand(game, "Hill Giant")];
    const theirs = toHand(game, "Sol Ring", B);
    activate(game, jar);
    expect(zone(game, jar)).toBe("graveyard");
    exiledAway(game, ...mine, theirs);
    expect(hand(game, A)).toHaveLength(7);
    expect(hand(game, B)).toHaveLength(7);
    expect(hand(game, C)).toHaveLength(7);
    const sevens = [...hand(game, A), ...hand(game, B), ...hand(game, C)];

    toStep(game, "end");
    settle(game);
    expect(sorted(hand(game, A))).toEqual(sorted(mine));
    expect(hand(game, B)).toEqual([theirs]);
    expect(hand(game, C)).toEqual([]);
    for (const card of sevens) expect(zone(game, card)).toBe("graveyard");
    // Out of exile, an ordinary card in its owner's hand again.
    for (const card of mine) expect(game.state.objects[card].exiledFaceDown).toBeUndefined();
    expect(sees(game, A, mine[0])).toBe(true);
    expect(sees(game, B, mine[0])).toBe(false);
  });

  it("its stack object names no hidden card to anyone, though it acts on them", () => {
    const { game } = table();
    const jar = spawn(game, "Memory Jar");
    const mine = toHand(game, "Grizzly Bears");
    activate(game, jar);
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    const [ability] = game.state.zones.shared.stack;
    expect(game.state.objects[ability].targets).toContainEqual(ref(mine));
    for (const viewer of [A, B]) expect(game.viewFor(viewer).objects[ability].targets).toEqual([]);
  });

  it("still discards the seven with no hand to bring back", () => {
    const { game } = table();
    noHands(game);
    const jar = spawn(game, "Memory Jar");
    activate(game, jar);
    expect(hand(game, A)).toHaveLength(7);
    toStep(game, "end");
    settle(game);
    expect(hand(game, A)).toEqual([]);
    expect(graveyard(game, A)).toHaveLength(8); // the seven and the Jar
  });

  it("used in an end step, it's the next turn's end step", () => {
    const { game } = table({ step: "end" });
    const jar = spawn(game, "Memory Jar");
    const mine = toHand(game, "Grizzly Bears");
    activate(game, jar);
    settle(game);
    expect(zone(game, mine)).toBe("exile");
    untilTurn(game, 2, "postcombat-main");
    expect(zone(game, mine)).toBe("exile");
    untilTurn(game, 2, "cleanup");
    expect(zone(game, mine)).toBe("hand");
  });
});

describe('Ignorant Bliss: "then draw a card" needs no cards back', () => {
  it("returns the hand at the end step, then draws", () => {
    const { game } = table();
    noHands(game);
    lands(game, "Mountain", 2);
    const card = toHand(game, "Grizzly Bears");
    const drawn = toLibrary(game, "Hill Giant");
    cast(game, toHand(game, "Ignorant Bliss"));
    exiledAway(game, card);
    expect(hand(game, A)).toEqual([]);
    toStep(game, "end");
    settle(game);
    expect(sorted(hand(game, A))).toEqual(sorted([card, drawn]));
  });

  it("with an empty hand it still draws", () => {
    const { game } = table();
    noHands(game);
    lands(game, "Mountain", 2);
    const drawn = toLibrary(game, "Hill Giant");
    cast(game, toHand(game, "Ignorant Bliss"));
    toStep(game, "end");
    settle(game);
    expect(hand(game, A)).toEqual([drawn]);
  });

  it("a card that's a new object by then stays, and the draw still happens (rule 400.7)", () => {
    const { game } = table();
    noHands(game);
    lands(game, "Mountain", 2);
    const card = toHand(game, "Grizzly Bears");
    const drawn = toLibrary(game, "Hill Giant");
    cast(game, toHand(game, "Ignorant Bliss"));
    // As though it had left exile and come back: not the object that was exiled.
    game.state.objects[card].zoneChangeCount = (game.state.objects[card].zoneChangeCount ?? 0) + 1;
    toStep(game, "end");
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(hand(game, A)).toEqual([drawn]);
  });
});

describe("Suppress: that player's next turn, whoever's it is now", () => {
  it("on an opponent, back at the end step of their next turn, not this one's", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const card = toHand(game, "Grizzly Bears", B);
    const others = [...hand(game, B)].filter((id) => id !== card);
    cast(game, toHand(game, "Suppress"), { targets: [ref(B)] });
    exiledAway(game, card, ...others);
    toStep(game, "end");
    settle(game);
    expect(zone(game, card)).toBe("exile");
    untilTurn(game, 2, "postcombat-main");
    expect(zone(game, card)).toBe("exile");
    untilTurn(game, 2, "cleanup");
    expect(hand(game, B)).toContain(card);
    for (const other of others) expect(hand(game, B)).toContain(other);
  });

  it("the ability stays the caster's, though it waits on the target's turn (rule 603.7d)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Suppress"), { targets: [ref(B)] });
    const [delayed] = game.state.delayedTriggers;
    expect(delayed.controller).toBe(A);
    expect(delayed.turnOf).toBe(B);
  });

  it("on yourself during your turn, it's your next turn and not this one", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const card = toHand(game, "Grizzly Bears");
    cast(game, toHand(game, "Suppress"), { targets: [ref(A)] });
    toStep(game, "end");
    settle(game);
    expect(zone(game, card)).toBe("exile");
    // Bob's and Carol's turns go by, then Alice's next: turn 4.
    untilTurn(game, 3, "cleanup");
    expect(zone(game, card)).toBe("exile");
    untilTurn(game, 4, "postcombat-main");
    expect(zone(game, card)).toBe("exile");
    untilTurn(game, 4, "cleanup");
    expect(zone(game, card)).toBe("hand");
  });

  it("lapses if that turn's end step never comes (Time Stop)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const card = toHand(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Suppress"), { targets: [ref(B)] });
    lands(game, "Island", 6, B);
    const stop = toHand(game, "Time Stop", B);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === B);
    expect(game.state.delayedTriggers[0].turnBegan).toBe(true);
    cast(game, stop, { player: B });
    untilTurn(game, 3, "upkeep");
    expect(game.state.delayedTriggers).toEqual([]);
    expect(zone(game, card)).toBe("exile");
    untilTurn(game, 4, "cleanup");
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Induced Amnesia: linked to the permanent", () => {
  it("draws that many, and a graveyard trip returns them to their owner's hand", () => {
    const { game, a } = table();
    noHands(game);
    const cards = [toHand(game, "Grizzly Bears", B), toHand(game, "Hill Giant", B)];
    pickTargets(a, B);
    const amnesia = enter(game, "Induced Amnesia");
    exiledAway(game, ...cards);
    expect(game.state.objects[cards[0]].exiledWith?.source).toBe(amnesia);
    expect(hand(game, B)).toHaveLength(2);
    const replaced = [...hand(game, B)];
    destroy(game, amnesia);
    settle(game);
    expect(sorted(hand(game, B))).toEqual(sorted([...replaced, ...cards]));
  });

  it("leaving for anywhere but a graveyard leaves them exiled", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const amnesia = enter(game, "Induced Amnesia");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Boomerang"), { targets: [ref(amnesia)] });
    expect(zone(game, amnesia)).toBe("hand");
    expect(zone(game, card)).toBe("exile");
  });

  it("gone before the first ability resolves, the hand stays exiled for good", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const amnesia = enter(game, "Induced Amnesia", A, { settle: false });
    destroy(game, amnesia);
    settle(game);
    expect(zone(game, amnesia)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
  });

  it("a new controller of it gets no look at them", () => {
    const { game, b, a } = table();
    const card = toHand(game, "Grizzly Bears", B);
    pickTargets(b, B);
    const amnesia = enter(game, "Induced Amnesia", B);
    exiledAway(game, card);
    lands(game, "Island", 6);
    a.chooseEnchantFn = () => amnesia;
    cast(game, toHand(game, "Confiscate"), { targets: [ref(amnesia)] });
    expect(game.state.objects[amnesia].controller).toBe(A);
    exiledAway(game, card);
  });
});

describe("Bottled Cloister: away on each opponent's upkeep, back on yours", () => {
  it("exiles your hand on their upkeep, returns it on yours and draws", () => {
    const { game } = table();
    noHands(game);
    const cloister = spawn(game, "Bottled Cloister");
    const card = toHand(game, "Grizzly Bears");
    untilTurn(game, 2, "draw");
    exiledAway(game, card);
    expect(game.state.objects[card].exiledWith?.source).toBe(cloister);
    const fromCloister = toLibrary(game, "Hill Giant");
    untilTurn(game, 3, "draw");
    // With the card the draw step has just drawn.
    expect(hand(game, A)).toHaveLength(3);
    expect(hand(game, A)).toEqual(expect.arrayContaining([card, fromCloister]));
  });

  it("a new controller's upkeep brings back only the cards they own", () => {
    const { game, a } = table();
    noHands(game);
    const cloister = spawn(game, "Bottled Cloister", B);
    const bobs = toHand(game, "Grizzly Bears", B);
    // Alice's upkeep on turn 3 is an opponent's, to Bob: his hand goes.
    untilTurn(game, 3, "precombat-main");
    expect(zone(game, bobs)).toBe("exile");
    lands(game, "Island", 6);
    const confiscate = toHand(game, "Confiscate");
    a.chooseEnchantFn = () => cloister;
    cast(game, confiscate, { targets: [ref(cloister)] });
    expect(game.state.objects[cloister].controller).toBe(A);
    // Bob's upkeep is now an opponent's, to Alice: hers goes, and comes back on hers.
    const alices = toHand(game, "Hill Giant");
    untilTurn(game, 4, "draw");
    expect(zone(game, alices)).toBe("exile");
    untilTurn(game, 5, "draw");
    expect(hand(game, A)).toContain(alices);
    expect(zone(game, bobs)).toBe("exile");
  });
});

describe("Moonring Mirror: a hidden second hand", () => {
  /** A Mirror out, and Divination drawing two: the next two go under it. */
  const hidden = (game: Game): { mirror: ObjectId; under: readonly ObjectId[]; held: readonly ObjectId[] } => {
    const mirror = spawn(game, "Moonring Mirror");
    const under = [toLibrary(game, "Sol Ring"), toLibrary(game, "Ornithopter")];
    const held = [toLibrary(game, "Hill Giant"), toLibrary(game, "Grizzly Bears")];
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    return { mirror, under, held };
  };

  it("each draw hides the top card, linked and unseen", () => {
    const { game, a } = table();
    noHands(game);
    pickModes(a);
    const { mirror, under, held } = hidden(game);
    expect(sorted(hand(game, A))).toEqual(sorted(held));
    exiledAway(game, ...under);
    for (const card of under) expect(game.state.objects[card].exiledWith?.source).toBe(mirror);
  });

  it("upkeep swaps the hand for the others, and the swapped hand stays", () => {
    const { game, a } = table();
    noHands(game);
    pickModes(a);
    const { under, held } = hidden(game);
    pickModes(a, 0);
    untilTurn(game, 3, "upkeep");
    settle(game);
    expect(sorted(hand(game, A))).toEqual(sorted(under));
    exiledAway(game, ...held);
  });

  it("declining leaves everything where it is", () => {
    const { game, a } = table();
    noHands(game);
    pickModes(a);
    const { under, held } = hidden(game);
    untilTurn(game, 3, "upkeep");
    settle(game);
    expect(sorted(hand(game, A))).toEqual(sorted(held));
    exiledAway(game, ...under);
  });

  it("an empty hand may still choose to, and gets the others", () => {
    const { game, a } = table();
    noHands(game);
    pickModes(a);
    const { under, held } = hidden(game);
    expect(sorted(hand(game, A))).toEqual(sorted(held));
    for (const id of [...hand(game, A)]) {
      game.state.objects[id].zone = "graveyard";
      game.state.zones.perPlayer[A].graveyard = [...game.state.zones.perPlayer[A].graveyard, id];
    }
    game.state.zones.perPlayer[A].hand = [];
    pickModes(a, 0);
    untilTurn(game, 3, "upkeep");
    settle(game);
    expect(sorted(hand(game, A))).toEqual(sorted(under));
  });
});

describe("Kav Landseeker: the end step of your next turn", () => {
  it("keeps the Lander through this turn's end step, and sacrifices it on your next", () => {
    const { game } = table();
    enter(game, "Kav Landseeker");
    const lander = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Lander Token");
    expect(lander).toBeDefined();
    toStep(game, "end");
    settle(game);
    untilTurn(game, 2, "cleanup");
    expect(game.state.zones.shared.battlefield).toContain(lander);
    untilTurn(game, 3, "postcombat-main");
    expect(game.state.zones.shared.battlefield).toContain(lander);
    untilTurn(game, 3, "cleanup");
    expect(game.state.zones.shared.battlefield).not.toContain(lander);
  });
});
