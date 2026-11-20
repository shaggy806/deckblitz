/**
 * The Celestial Toymaker (top-1000 commander #890): its attack trigger
 * separates the top three into a face-down and a face-up pile, both exiled
 * as they're made (`separate-into-piles`' `exilePiles`, rule 406.3), the
 * defending player choosing the one put into the hand; and its end-step
 * drain counts every spell or ability that made a player guess or group
 * cards or permanents into piles this turn (rule 700.3 — the journal's
 * `piled-or-guessed`, the `pileOrGuessEffectsThisTurn` amount), each once.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, cast, hand, lands, life, nextTurn, pickTargets, spawn, table, toHand, toLibrary, toStep, zone } from "./harness.js";

/** Three named cards on top of alice's library, the first on top. */
function topThree(game: Parameters<typeof toLibrary>[0]): ObjectId[] {
  return ["Grizzly Bears", "Shock", "Island"].reverse().map((name) => toLibrary(game, name)).reverse();
}

describe("The Celestial Toymaker — the attack trigger", () => {
  it("exiles both piles before the defending player chooses, the face-down one face down", () => {
    const { game, a, b } = table();
    const toymaker = spawn(game, "The Celestial Toymaker");
    const cards = topThree(game);
    a.separatePilesFn = (_view, offer) => {
      expect(offer.faceDown).toBe(true);
      expect(offer.chooser).toBe(B);
      return [cards.slice(0, 1), cards.slice(1)];
    };
    let atChoice: { zones: string[]; faceDown: boolean[] } | undefined;
    b.choosePileFn = () => {
      atChoice = {
        zones: cards.map((id) => zone(game, id)),
        faceDown: cards.map((id) => game.state.objects[id].exiledFaceDown !== undefined),
      };
      return 1;
    };
    a.declareAttackersFn = () => [{ attacker: toymaker, defender: B }];
    toStep(game, "postcombat-main");
    expect(atChoice).toEqual({ zones: ["exile", "exile", "exile"], faceDown: [true, false, false] });
    // The face-up pile into the hand; the face-down card stays in exile, face down.
    for (const id of cards.slice(1)) expect(hand(game)).toContain(id);
    expect(zone(game, cards[0])).toBe("exile");
    expect(game.state.objects[cards[0]].exiledFaceDown).toBeDefined();
  });

  it("the face-down pile chosen goes to the hand, and the face-up pile stays exiled", () => {
    const { game, a, b } = table();
    const toymaker = spawn(game, "The Celestial Toymaker");
    const cards = topThree(game);
    a.separatePilesFn = () => [cards.slice(0, 2), cards.slice(2)];
    b.choosePileFn = () => 0;
    a.declareAttackersFn = () => [{ attacker: toymaker, defender: B }];
    toStep(game, "postcombat-main");
    for (const id of cards.slice(0, 2)) expect(hand(game)).toContain(id);
    expect(zone(game, cards[2])).toBe("exile");
    expect(game.state.objects[cards[2]].exiledFaceDown).toBeUndefined();
  });
});

describe("The Celestial Toymaker — the end-step drain", () => {
  it("each opponent loses 2 for its own attack trigger, and 2 more for Fact or Fiction", () => {
    const { game, a, b } = table({ players: 3 });
    const toymaker = spawn(game, "The Celestial Toymaker");
    lands(game, "Island", 4);
    for (let i = 0; i < 8; i += 1) toLibrary(game, "Island");
    // Fact or Fiction: the opponent separates (one spell, one count).
    b.separatePilesFn = (_view, offer) => [offer.objects.slice(0, 2), offer.objects.slice(2)];
    a.choosePileFn = () => 0;
    cast(game, toHand(game, "Fact or Fiction"));
    a.separatePilesFn = (_view, offer) => [offer.objects.slice(0, 1), offer.objects.slice(1)];
    b.choosePileFn = () => 1;
    a.declareAttackersFn = () => [{ attacker: toymaker, defender: B }];
    toStep(game, "postcombat-main");
    const [bLife, cLife, aLife] = [life(game, B), life(game, C), life(game, A)];
    nextTurn(game);
    expect(life(game, B)).toBe(bLife - 4);
    expect(life(game, C)).toBe(cLife - 4);
    expect(life(game, A)).toBe(aLife);
  });

  it("one spell that makes two players separate counts once (Make an Example)", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "The Celestial Toymaker");
    lands(game, "Swamp", 4);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    b.separatePilesFn = (_view, offer) => [[...offer.objects], []];
    c.separatePilesFn = (_view, offer) => [[...offer.objects], []];
    cast(game, toHand(game, "Make an Example"));
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    expect(life(game, C)).toBe(18);
  });

  it("a guess counts (Liar's Pendulum), and a turn with none drains nothing", () => {
    const { game, a, b } = table();
    spawn(game, "The Celestial Toymaker");
    const pendulum = spawn(game, "Liar's Pendulum");
    lands(game, "Island", 2);
    a.chooseCardNameFn = () => "Island";
    b.chooseModesFn = () => [0];
    pickTargets(a, B);
    activate(game, pendulum, 0, { targets: [{ kind: "player", player: B }] });
    nextTurn(game);
    expect(life(game, B)).toBe(18);
    // Bob's turn: nothing guessed or piled, so its end step drains nothing.
    nextTurn(game);
    expect(life(game, B)).toBe(18);
  });
});
