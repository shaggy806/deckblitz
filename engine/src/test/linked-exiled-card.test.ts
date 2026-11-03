/**
 * Effects that read or target a card in exile, and cards exiled with their
 * source (rule 607.2a): the `card-in-exile` target spec (`faceUp`, `linked`,
 * `whose`, a filter a face-down card never matches — rule 406.3a), the
 * `hasFlashback` filter, a face-down linked card turned face up and put onto
 * the battlefield, an intervening if over "the exiled card", and a linked-exile
 * cast permission spending mana as any colour (rule 609.4b).
 *
 * Proving cards: Pull from Eternity, Gelatinous Cube, Runic Repetition, Clone
 * Shell, Cemetery Protector, King Narfi's Betrayal.
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  nextTurn,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("card-in-exile targets", () => {
  it("Pull from Eternity reaches a face-up exiled card, never a face-down one", () => {
    const { game, a } = table();
    const faceUp = toExile(game, "Grizzly Bears", B);
    // Clone Shell exiles the top of Alice's library face down.
    const hidden = toLibrary(game, "Hill Giant");
    pickFromZone(a, hidden);
    enter(game, "Clone Shell");
    expect(zone(game, hidden)).toBe("exile");
    expect(game.state.objects[hidden].exiledFaceDown).toBeDefined();

    lands(game, "Plains", 1);
    const pull = toHand(game, "Pull from Eternity");
    expect(() => cast(game, pull, { targets: [ref(hidden)] })).toThrow(/target/);
    cast(game, pull, { targets: [ref(faceUp)] });
    expect(zone(game, faceUp)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(faceUp);
    expect(zone(game, hidden)).toBe("exile");
  });

  it("Gelatinous Cube's Dissolve takes only a creature card exiled with it, of mana value X", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const elsewhere = toExile(game, "Llanowar Elves", B);
    const seen = watchTargets(a, (offered) => [offered[0].includes(bears) ? bears : offered[0][0]]);
    const cube = enter(game, "Gelatinous Cube");
    expect(seen.offered[0]).toContain(giant);
    expect(zone(game, bears)).toBe("exile");

    lands(game, "Swamp", 6);
    // X = 1: no card exiled with it has mana value 1 (the Elves weren't).
    expect(() => activate(game, cube, 0, { x: 1, targets: [ref(elsewhere)] })).toThrow();
    activate(game, cube, 0, { x: 2, targets: [ref(bears)] });
    expect(graveyard(game, B)).toContain(bears);

    // It stays there when the Cube leaves.
    destroy(game, cube);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Runic Repetition returns only an exiled card with flashback its caster owns", () => {
    const { game } = table();
    const mine = toExile(game, "Think Twice");
    const plain = toExile(game, "Grizzly Bears");
    const bobs = toExile(game, "Deep Analysis", B);
    lands(game, "Island", 3);
    const spell = toHand(game, "Runic Repetition");
    expect(() => cast(game, spell, { targets: [ref(plain)] })).toThrow(/target/);
    expect(() => cast(game, spell, { targets: [ref(bobs)] })).toThrow(/target/);
    cast(game, spell, { targets: [ref(mine)] });
    expect(hand(game)).toContain(mine);
  });
});

describe("cards exiled with the source", () => {
  it("Clone Shell turns its face-down card up as it dies and puts a creature onto the battlefield", () => {
    const { game, a } = table();
    for (const name of ["Wastes", "Wastes", "Wastes"]) toLibrary(game, name);
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    const shell = enter(game, "Clone Shell");
    expect(game.state.objects[giant].exiledFaceDown?.lookers).toContain(A);
    destroy(game, shell);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].controller).toBe(A);
  });

  it("Clone Shell leaves a noncreature card in exile, face up", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    pickFromZone(a, bolt);
    const shell = enter(game, "Clone Shell");
    destroy(game, shell);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].exiledFaceDown).toBeUndefined();
  });

  it("Cemetery Protector makes a Human only for what shares a card type with the exiled card", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(a, bears);
    enter(game, "Cemetery Protector");
    expect(zone(game, bears)).toBe("exile");

    lands(game, "Forest", 3);
    game.dispatch({ type: "play-land", player: A, card: toHand(game, "Forest") });
    expect(tokensNamed(game, "Human Token", A)).toBe(0);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(tokensNamed(game, "Human Token", A)).toBe(1);
  });

  it("King Narfi's Betrayal exiles from each graveyard, then lets its controller cast them with any colour", () => {
    const { game, a } = table();
    const mine = toGraveyard(game, "Hill Giant");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => (eligible.length > 0 ? [eligible.includes(mine) ? mine : eligible.includes(theirs) ? theirs : eligible[0]] : []);
    enter(game, "King Narfi's Betrayal");
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(graveyard(game, A).length).toBe(4);

    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(game.state.turn.number).toBe(3);
    lands(game, "Island", 6);
    // Green Bears from Bob's graveyard, paid with Islands.
    cast(game, theirs, { via: "impulse" });
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
    cast(game, mine, { via: "impulse" });
    expect(zone(game, mine)).toBe("battlefield");
  });
});
