/**
 * `would-draw` replacements beyond "draw N instead": a draw replaced by an
 * effect (Underrealm Lich, Tomorrow, Azami's Familiar, Sages of the Anima —
 * rule 614.11, each draw of several answered before the next, 614.11a), and
 * a "draw N instead" that passes by the first card of your draw step
 * (Teferi's Ageless Insight, Bard, King of Dale) or applies only the first
 * time you would draw each turn (Reed Richards, Smartest Man).
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, lands, graveyard, hand, nextTurn, settle, spawn, table, toHand, toLibrary, toStep } from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = A) => game.state.zones.perPlayer[player].library;

describe("a draw replaced by an effect", () => {
  it("Underrealm Lich: each draw of two is a look at three, one to hand and the rest to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    spawn(game, "Underrealm Lich");
    // Six named cards on top, the last spawned on top.
    for (const name of ["Forest", "Island", "Swamp", "Mountain", "Plains", "Grizzly Bears"]) toLibrary(game, name);
    const looks: string[][] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      looks.push(eligible.map((id) => game.state.objects[id].cardName));
      return [eligible[eligible.length - 1]];
    };
    const drawnBefore = game.state.players[A].cardsDrawnThisTurn;
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    cast(game, toHand(game, "Divination"));
    // Two looks, one after the other, each at the top three then.
    expect(looks).toEqual([
      ["Grizzly Bears", "Plains", "Mountain"],
      ["Swamp", "Island", "Forest"],
    ]);
    // The two kept cards came in.
    expect(hand(game).length).toBe(handBefore + 2);
    expect(hand(game).map((id) => game.state.objects[id].cardName)).toEqual(expect.arrayContaining(["Mountain", "Forest"]));
    // Four looked-at cards and Divination itself.
    expect(graveyard(game).length).toBe(graveBefore + 5);
    // Replaced draws aren't draws.
    expect(game.state.players[A].cardsDrawnThisTurn).toBe(drawnBefore);
  });

  it("Underrealm Lich: a draw from an empty library is replaced, so it isn't a loss", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    spawn(game, "Underrealm Lich");
    for (const id of [...library(game)]) game.debugMove(id, "exile");
    a.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Divination"));
    expect(game.state.players[A].attemptedDrawFromEmptyLibrary).not.toBe(true);
    settle(game);
    expect(game.state.players[A].hasLost).toBe(false);
  });

  it("Underrealm Lich replaces the turn's draw too, and only its controller's", () => {
    const { game, a, b } = table();
    lands(game, "Island", 6);
    spawn(game, "Underrealm Lich");
    let asked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked += 1;
      return [eligible[0]];
    };
    b.chooseFromZoneFn = () => {
      throw new Error("bob's draw isn't replaced");
    };
    const bobHand = hand(game, B).length;
    nextTurn(game); // bob's turn: his draw is his own
    expect(hand(game, B).length).toBe(bobHand + 1);
    const before = graveyard(game).length;
    nextTurn(game); // alice's: her draw step's draw is a look
    expect(asked).toBe(1);
    expect(graveyard(game).length).toBe(before + 2);
  });

  it("Tomorrow, Azami's Familiar: one card to hand, the other two to the bottom", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    spawn(game, "Tomorrow, Azami's Familiar");
    for (const name of ["Island", "Swamp", "Grizzly Bears"]) toLibrary(game, name);
    const graveBefore = graveyard(game).length;
    // The pick, then the order of the two going to the bottom.
    a.chooseFromZoneFn = (_view, eligible) => {
      const swamp = eligible.find((id) => game.state.objects[id].cardName === "Swamp");
      return swamp !== undefined ? [swamp] : eligible;
    };
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(hand(game).map((id) => game.state.objects[id].cardName)).toContain("Swamp");
    // Nothing to the graveyard; Grizzly Bears and Island are at the bottom.
    expect(graveyard(game).length).toBe(graveBefore);
    const lib = library(game);
    const bottomTwo = lib.slice(lib.length - 2).map((id) => game.state.objects[id].cardName).sort();
    expect(bottomTwo).toEqual(["Grizzly Bears", "Island"]);
  });

  it("Sages of the Anima: every creature card revealed goes to hand, the rest to the bottom", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Sages of the Anima");
    for (const name of ["Llanowar Elves", "Island", "Grizzly Bears"]) toLibrary(game, name);
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Opt"));
    const names = hand(game).map((id) => game.state.objects[id].cardName);
    expect(names).toEqual(expect.arrayContaining(["Grizzly Bears", "Llanowar Elves"]));
    // Two creature cards came in, from one replaced draw.
    expect(hand(game).length).toBe(handBefore + 2);
    const lib = library(game);
    expect(game.state.objects[lib[lib.length - 1]].cardName).toBe("Island");
  });
});

describe("draw N instead, with exemptions", () => {
  it("Teferi's Ageless Insight passes by the draw step's first card and doubles the rest", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Teferi's Ageless Insight");
    nextTurn(game); // bob's
    const before = hand(game).length;
    toStep(game, "draw"); // alice's draw step: one card
    expect(hand(game).length).toBe(before + 1);
    toStep(game, "precombat-main");
    const mid = hand(game).length;
    cast(game, toHand(game, "Divination"));
    // Each of Divination's two draws became two.
    expect(hand(game).length).toBe(mid + 4);
  });

  it("two of them multiply, and a draw in an opponent's draw step is doubled", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Teferi's Ageless Insight");
    spawn(game, "Bard, King of Dale");
    const before = hand(game).length;
    cast(game, toHand(game, "Opt"));
    // Scry 1, then one draw — four cards.
    expect(hand(game).length).toBe(before + 4);
  });

  it("Reed Richards: the turn's first draw past the draw step's first is four, then no more", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Reed Richards, Smartest Man");
    nextTurn(game); // bob's
    toStep(game, "draw"); // alice's draw step: her first card isn't replaced
    const before = hand(game).length;
    toStep(game, "precombat-main");
    expect(hand(game).length).toBe(before);
    cast(game, toHand(game, "Divination"));
    // The first draw became four; the second is a draw of one.
    expect(hand(game).length).toBe(before + 4 + 1);
    cast(game, toHand(game, "Opt"));
    expect(hand(game).length).toBe(before + 4 + 1 + 1);
  });

  it("Reed Richards arriving after the turn's first draw waits for the next turn", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Opt"));
    spawn(game, "Reed Richards, Smartest Man");
    const before = hand(game).length;
    cast(game, toHand(game, "Opt"));
    expect(hand(game).length).toBe(before + 1);
  });
});
