/**
 * Limits on drawing (`prohibits`'s `drawsPerTurn`, rule 101.2 — Narset, Parter
 * of Veils; Spirit of the Labyrinth; Maralen of the Mornsong; Mornsong Aria) and
 * "the next time you would draw a card this turn, … instead", one replacement an
 * activated ability sets up (`player-effect`'s `nextDrawInstead`, rule 614.1a —
 * the Words cycle).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  life,
  loyalty,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const draw = (game: Game, player: PlayerId, amount = 1): void => {
  game.debugApplyEffect(player, { kind: "draw", amount }, []);
  settle(game);
};
const drawnThisTurn = (game: Game, player: PlayerId): number => game.state.players[player].cardsDrawnThisTurn;

describe("can't draw more than one card each turn", () => {
  it("Narset: an opponent's second draw is ignored, hers isn't, and the count starts anew next turn", () => {
    const { game } = table();
    spawn(game, "Narset, Parter of Veils", A);
    const before = hand(game, B).length;
    draw(game, B, 3);
    expect(hand(game, B).length).toBe(before + 1);
    draw(game, B);
    expect(hand(game, B).length).toBe(before + 1);

    const mine = hand(game, A).length;
    draw(game, A, 3);
    expect(hand(game, A).length).toBe(mine + 3);

    // Bob's turn: his draw step's card is his one.
    nextTurn(game);
    expect(drawnThisTurn(game, B)).toBe(1);
    const inHand = hand(game, B).length;
    draw(game, B);
    expect(hand(game, B).length).toBe(inHand);
  });

  it("sees draws made before it arrived", () => {
    const { game } = table();
    draw(game, B, 2);
    spawn(game, "Spirit of the Labyrinth", A);
    const inHand = hand(game, B).length;
    draw(game, B);
    expect(hand(game, B).length).toBe(inHand);
    expect(drawnThisTurn(game, B)).toBe(2);
  });

  it("a draw it stops can't lose the game from an empty library", () => {
    const { game } = table();
    spawn(game, "Spirit of the Labyrinth", A);
    draw(game, B);
    game.state.zones.perPlayer[B].library.length = 0;
    draw(game, B);
    expect(game.state.players[B].attemptedDrawFromEmptyLibrary).not.toBe(true);
    expect(game.state.result.over).toBe(false);
  });

  it("each card of 'draw two instead' is one of the draws it limits", () => {
    const { game } = table();
    spawn(game, "Spirit of the Labyrinth", A);
    spawn(game, "Thought Reflection", B);
    const inHand = hand(game, B).length;
    draw(game, B);
    expect(hand(game, B).length).toBe(inHand + 1);
  });

  it("a Notion Thief can't take a draw the player couldn't make, and can't give its controller one too many", () => {
    const { game } = table();
    spawn(game, "Notion Thief", A);
    spawn(game, "Spirit of the Labyrinth", A);
    // Alice has drawn her one, in her draw step. So Bob's draw, handed to her,
    // is nobody's.
    expect(drawnThisTurn(game, A)).toBe(1);
    const mine = hand(game, A).length;
    const his = hand(game, B).length;
    draw(game, B);
    expect(hand(game, A).length).toBe(mine);
    expect(hand(game, B).length).toBe(his);

    // And a draw Alice can't make isn't one Bob's Thief could take.
    const other = table();
    spawn(other.game, "Notion Thief", B);
    spawn(other.game, "Spirit of the Labyrinth", A);
    const bobs = hand(other.game, B).length;
    draw(other.game, A);
    expect(hand(other.game, B).length).toBe(bobs);
  });

  it("a replaced draw didn't happen, so the next is still allowed (Narset's ruling)", () => {
    const { game } = table();
    spawn(game, "Narset, Parter of Veils", A);
    spawn(game, "Underrealm Lich", B);
    const inHand = hand(game, B).length;
    draw(game, B);
    draw(game, B);
    expect(hand(game, B).length).toBe(inHand + 2);
    expect(drawnThisTurn(game, B)).toBe(0);
  });

  it("an optional draw that can't be done in full isn't offered: 'you may draw' goes to its else", () => {
    const { game, b } = table();
    spawn(game, "Narset, Parter of Veils", A);
    draw(game, B);
    let asked = false;
    b.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    game.debugApplyEffect(B, {
      kind: "may",
      prompt: "Draw a card?",
      effect: { kind: "draw", amount: 1 },
      else: { kind: "gain-life", amount: 1 },
    }, []);
    settle(game);
    expect(asked).toBe(false);
    expect(life(game, B)).toBe(21);

    // Not two with one left either (its ruling).
    const fresh = table();
    spawn(fresh.game, "Narset, Parter of Veils", A);
    let askedFresh = false;
    fresh.b.chooseModesFn = () => {
      askedFresh = true;
      return [0];
    };
    const inHand = hand(fresh.game, B).length;
    fresh.game.debugApplyEffect(B, { kind: "may", prompt: "Draw two?", effect: { kind: "draw", amount: 2 } }, []);
    settle(fresh.game);
    expect(askedFresh).toBe(false);
    expect(hand(fresh.game, B).length).toBe(inHand);
  });

  it("Narset's −2 finds a noncreature, nonland card", () => {
    const { game, a } = table({ deck: "Lightning Bolt" });
    const narset = spawn(game, "Narset, Parter of Veils", A);
    const top = game.state.zones.perPlayer[A].library[0];
    pickFromZone(a, top);
    loyalty(game, narset, -2);
    expect(hand(game, A)).toContain(top);
    expect(game.state.objects[narset].counters.loyalty).toBe(3);
  });

  it("is gone with the permanent", () => {
    const { game } = table();
    const narset = spawn(game, "Narset, Parter of Veils", A);
    draw(game, B);
    destroy(game, narset, B);
    const inHand = hand(game, B).length;
    draw(game, B);
    expect(hand(game, B).length).toBe(inHand + 1);
  });
});

describe("players can't draw cards", () => {
  it("Maralen stops every draw, the draw step's included, and has each player search instead at a cost of 3", () => {
    const { game, b } = table();
    spawn(game, "Maralen of the Mornsong", A);
    const inHand = hand(game, A).length;
    draw(game, A);
    expect(hand(game, A).length).toBe(inHand);

    const start = life(game, B);
    const hisHand = hand(game, B).length;
    const wanted = toLibrary(game, "Grizzly Bears", B);
    pickFromZone(b, wanted);
    nextTurn(game);
    expect(life(game, B)).toBe(start - 3);
    expect(hand(game, B)).toContain(wanted);
    expect(hand(game, B).length).toBe(hisHand + 1);
    expect(drawnThisTurn(game, B)).toBe(0);
  });

  it("replaces nothing: no Words for a draw that can't happen", () => {
    const { game } = table();
    const words = spawn(game, "Words of Worship", A);
    spawn(game, "Maralen of the Mornsong", A);
    lands(game, "Plains", 1);
    activate(game, words);
    const before = life(game, A);
    draw(game, A);
    expect(life(game, A)).toBe(before);
    expect((game.state.playerEffects ?? []).some((e) => e.nextDrawInstead !== undefined)).toBe(true);
  });

  it("Mornsong Aria: no draws, no life gained", () => {
    const { game } = table();
    spawn(game, "Mornsong Aria", A);
    const inHand = hand(game, B).length;
    draw(game, B);
    expect(hand(game, B).length).toBe(inHand);
    const start = life(game, B);
    game.debugApplyEffect(B, { kind: "gain-life", amount: 4 }, []);
    settle(game);
    expect(life(game, B)).toBe(start);
  });
});

describe("the next time you would draw a card this turn (the Words cycle)", () => {
  it("replaces one draw, not the one after, and each activation is one more", () => {
    const { game } = table();
    const words = spawn(game, "Words of Worship", A);
    lands(game, "Plains", 2);
    activate(game, words);
    activate(game, words);
    const start = life(game, A);
    const inHand = hand(game, A).length;
    const drawn = drawnThisTurn(game, A);
    // Three cards: two gains, one card.
    draw(game, A, 3);
    expect(life(game, A)).toBe(start + 10);
    expect(hand(game, A).length).toBe(inHand + 1);
    expect(drawnThisTurn(game, A)).toBe(drawn + 1);
  });

  it("lasts the turn, and is nobody else's", () => {
    const { game } = table();
    const words = spawn(game, "Words of Wilding", A);
    lands(game, "Forest", 1);
    activate(game, words);
    const his = hand(game, B).length;
    draw(game, B);
    expect(hand(game, B).length).toBe(his + 1);
    expect(tokensNamed(game, "Bear Token", A)).toBe(0);

    nextTurn(game);
    const inHand = hand(game, A).length;
    draw(game, A);
    expect(hand(game, A).length).toBe(inHand + 1);
    expect(tokensNamed(game, "Bear Token", A)).toBe(0);
  });

  it("applies though the library is empty, and the next draw in the same effect still fails (rule 614.11)", () => {
    const { game } = table();
    const words = spawn(game, "Words of Worship", A);
    lands(game, "Plains", 1);
    activate(game, words);
    game.state.zones.perPlayer[A].library.length = 0;
    const start = life(game, A);
    draw(game, A, 2);
    expect(life(game, A)).toBe(start + 5);
    expect(game.state.players[A].attemptedDrawFromEmptyLibrary).toBe(true);
  });

  it("replaces the draw step's draw", () => {
    const { game } = table();
    const words = spawn(game, "Words of Wilding", B);
    lands(game, "Forest", 1, B);
    nextTurn(game, "upkeep");
    activate(game, words, 0, { player: B });
    const inHand = hand(game, B).length;
    toStep(game, "precombat-main", B);
    expect(hand(game, B).length).toBe(inHand);
    expect(tokensNamed(game, "Bear Token", B)).toBe(1);
  });

  it("Words of War: the target is chosen as it's activated; gone from there, it's no one", () => {
    const { game } = table();
    const words = spawn(game, "Words of War", A);
    lands(game, "Mountain", 3);
    activate(game, words, 0, { targets: [ref(B)] });
    draw(game, A);
    expect(life(game, B)).toBe(18);

    // It deals the damage after Words of War itself has gone.
    activate(game, words, 0, { targets: [ref(B)] });
    destroy(game, words);
    expect(zone(game, words)).toBe("graveyard");
    draw(game, A);
    expect(life(game, B)).toBe(16);
  });

  it("Words of War: a creature that has changed zones since is no target", () => {
    const { game } = table();
    const words = spawn(game, "Words of War", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    activate(game, words, 0, { targets: [ref(bears)] });
    game.debugApplyEffect(B, { kind: "flicker", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    const inHand = hand(game, A).length;
    draw(game, A);
    expect(hand(game, A).length).toBe(inHand);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("Words of Waste: each opponent discards, before the next card is drawn", () => {
    const { game } = table();
    const words = spawn(game, "Words of Waste", A);
    lands(game, "Swamp", 1);
    activate(game, words);
    const his = hand(game, B).length;
    const mine = hand(game, A).length;
    draw(game, A, 2);
    expect(hand(game, B).length).toBe(his - 1);
    expect(hand(game, A).length).toBe(mine + 1);
  });

  it("with different Words waiting, the player chooses which applies, and the other stays (the ruling)", () => {
    const { game, a } = table();
    const worship = spawn(game, "Words of Worship", A);
    const wilding = spawn(game, "Words of Wilding", A);
    lands(game, "Plains", 2);
    activate(game, worship);
    activate(game, wilding, 0);
    const start = life(game, A);
    pickModes(a, 1);
    draw(game, A);
    expect(tokensNamed(game, "Bear Token", A)).toBe(1);
    expect(life(game, A)).toBe(start);
    // The other applies by itself to the next draw.
    draw(game, A);
    expect(life(game, A)).toBe(start + 5);
  });

  it("several of a draw of two: each answered before the next", () => {
    const { game, a } = table();
    const worship = spawn(game, "Words of Worship", A);
    const wilding = spawn(game, "Words of Wilding", A);
    lands(game, "Plains", 2);
    activate(game, worship);
    activate(game, wilding, 0);
    const start = life(game, A);
    const inHand = hand(game, A).length;
    pickModes(a, 0);
    draw(game, A, 3);
    expect(life(game, A)).toBe(start + 5);
    expect(tokensNamed(game, "Bear Token", A)).toBe(1);
    expect(hand(game, A).length).toBe(inHand + 1);
  });

  it("identical ones ask nothing", () => {
    const { game, a } = table();
    const worship = spawn(game, "Words of Worship", A);
    lands(game, "Plains", 2);
    activate(game, worship);
    activate(game, worship);
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    draw(game, A);
    expect(asked).toBe(false);
  });

  it("beside Underrealm Lich, the player chooses; Lich's stays for the next", () => {
    const { game, a } = table();
    const worship = spawn(game, "Words of Worship", A);
    spawn(game, "Underrealm Lich", A);
    lands(game, "Plains", 1);
    activate(game, worship);
    const start = life(game, A);
    pickModes(a, 0);
    draw(game, A);
    expect(life(game, A)).toBe(start + 5);
  });

  it("is taken before a Notion Thief's, and the draw a Thief hands its controller is theirs to replace", () => {
    const { game } = table();
    const worship = spawn(game, "Words of Worship", A);
    spawn(game, "Notion Thief", B);
    lands(game, "Plains", 1);
    activate(game, worship);
    const start = life(game, A);
    const his = hand(game, B).length;
    draw(game, A);
    expect(life(game, A)).toBe(start + 5);
    expect(hand(game, B).length).toBe(his);

    const other = table();
    const words = spawn(other.game, "Words of Worship", B);
    spawn(other.game, "Notion Thief", B);
    lands(other.game, "Plains", 1, B);
    nextTurn(other.game);
    activate(other.game, words, 0, { player: B });
    const bobs = life(other.game, B);
    other.game.debugApplyEffect(A, { kind: "draw", amount: 1 }, []);
    settle(other.game);
    expect(life(other.game, B)).toBe(bobs + 5);
  });

  it("a cast draw spell works the same way", () => {
    const { game } = table();
    const worship = spawn(game, "Words of Worship", A);
    lands(game, "Plains", 1);
    lands(game, "Island", 3);
    activate(game, worship);
    const start = life(game, A);
    const spell = toHand(game, "Divination", A);
    const inHand = hand(game, A).length;
    cast(game, spell);
    expect(life(game, A)).toBe(start + 5);
    expect(hand(game, A).length).toBe(inHand); // less the spell, plus one card
  });
});
