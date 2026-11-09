/**
 * Exchanges with a life total (rule 701.12): two players' life totals
 * (`exchange-life-totals`, 701.12c — Mirror Universe, Soul Conduit, Mister
 * Negative, Psychic Transfer, Profane Transfusion) and a life total with a
 * creature's power or toughness (`exchange-life-stat`, 701.12g — Evra, Halcyon
 * Witness). All or nothing (701.12a), under "can't gain life" and "can't lose
 * life" (rules 119.7–8).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  enter,
  hand,
  life,
  lands,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const setLife = (game: Game, player: PlayerId, n: number): void => {
  game.state.players[player].life = n;
};
/** Their life total can't change (Teferi's Protection's half): rules 119.7–8. */
const lifeFrozen = (game: Game, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "prohibit", prohibits: [{ act: "change-life", who: "you" }], duration: "until-your-next-turn" });
};
const horror = (game: Game): ObjectId | undefined =>
  game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName.startsWith("Horror Token"));

describe("two players' life totals (rule 701.12c)", () => {
  it("Soul Conduit: each gains or loses to reach the other's previous total", () => {
    const { game, a } = table({ players: 3 });
    setLife(game, B, 7);
    setLife(game, C, 30);
    const conduit = spawn(game, "Soul Conduit");
    lands(game, "Wastes", 6);
    pickTargets(a, B, C);
    activate(game, conduit, 0, { targets: [ref(B), ref(C)] });
    expect(life(game, B)).toBe(30);
    expect(life(game, C)).toBe(7);
    expect(life(game, A)).toBe(20);
  });

  it("is a real gain and a real loss: a doubling doubles the gain (the rulings)", () => {
    const { game, a } = table();
    setLife(game, A, 10);
    setLife(game, B, 14);
    spawn(game, "Boon Reflection");
    const conduit = spawn(game, "Soul Conduit");
    lands(game, "Wastes", 6);
    pickTargets(a, A, B);
    activate(game, conduit, 0, { targets: [ref(A), ref(B)] });
    // Alice gains 4, doubled; Bob loses 4.
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(10);
  });

  it("nothing changes if one can't gain life, or one can't lose it (rules 119.7–8, 701.12a)", () => {
    const { game, a } = table();
    setLife(game, A, 5);
    setLife(game, B, 15);
    spawn(game, "Erebos, God of the Dead", B);
    const conduit = spawn(game, "Soul Conduit");
    lands(game, "Wastes", 6);
    pickTargets(a, A, B);
    activate(game, conduit, 0, { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(5);
    expect(life(game, B)).toBe(15);
  });

  it("the player who can't gain life isn't given more, but can be given less", () => {
    const { game, a } = table();
    setLife(game, A, 15);
    setLife(game, B, 5);
    // Bob's opponents can't gain life: Alice can't, but she'd be going down.
    spawn(game, "Erebos, God of the Dead", B);
    const conduit = spawn(game, "Soul Conduit");
    lands(game, "Wastes", 6);
    pickTargets(a, A, B);
    activate(game, conduit, 0, { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(5);
    expect(life(game, B)).toBe(15);
  });

  it("a player whose life total can't change stops it either way (rules 119.7–8)", () => {
    const { game, a } = table();
    setLife(game, A, 25);
    setLife(game, B, 5);
    lifeFrozen(game, A);
    const conduit = spawn(game, "Soul Conduit");
    lands(game, "Wastes", 6);
    pickTargets(a, A, B);
    activate(game, conduit, 0, { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(25);
    expect(life(game, B)).toBe(5);
  });

  it("the same life totals, and nothing happens", () => {
    const { game, a } = table();
    const conduit = spawn(game, "Soul Conduit");
    lands(game, "Wastes", 6);
    pickTargets(a, A, B);
    activate(game, conduit, 0, { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("Mirror Universe only in your upkeep, sacrificed, with target opponent", () => {
    const { game, a } = table();
    setLife(game, A, 3);
    const mirror = spawn(game, "Mirror Universe");
    pickTargets(a, B);
    expect(() => activate(game, mirror, 0, { targets: [ref(B)] })).toThrow();
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "upkeep" && s.priority.holder === A);
    activate(game, mirror, 0, { targets: [ref(B)] });
    expect(zone(game, mirror)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(3);
  });
});

describe("Mister Negative's 'if you lost life this way'", () => {
  it("draws what you lost", () => {
    const { game, a } = table();
    setLife(game, B, 16);
    setLife(game, A, 20);
    pickTargets(a, B);
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Mister Negative");
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(before + 4);
  });

  it("draws nothing for a gain", () => {
    const { game, a } = table();
    setLife(game, A, 10);
    pickTargets(a, B);
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Mister Negative");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(10);
    expect(hand(game).length).toBe(before);
  });

  it("declined, nothing happens", () => {
    const { game, a } = table();
    setLife(game, B, 16);
    pickTargets(a, B);
    pickModes(a);
    const before = hand(game).length;
    enter(game, "Mister Negative");
    expect(life(game, A)).toBe(20);
    expect(hand(game).length).toBe(before);
  });
});

describe("Psychic Transfer's 'if the difference … is 5 or less'", () => {
  const run = (mine: number, theirs: number): Game => {
    const { game, a } = table();
    setLife(game, A, mine);
    setLife(game, B, theirs);
    lands(game, "Wastes", 4);
    lands(game, "Island", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Psychic Transfer"), { targets: [ref(B)] });
    return game;
  };

  it("exchanges at exactly 5, up or down", () => {
    const up = run(20, 15);
    expect(life(up, A)).toBe(15);
    expect(life(up, B)).toBe(20);
    const down = run(15, 20);
    expect(life(down, A)).toBe(20);
    expect(life(down, B)).toBe(15);
  });

  it("doesn't at 6", () => {
    const game = run(21, 15);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(15);
  });
});

describe("Profane Transfusion's token", () => {
  it("is X/X, the difference after the exchange, colourless and an artifact", () => {
    const { game, a } = table();
    setLife(game, A, 4);
    setLife(game, B, 13);
    lands(game, "Swamp", 9);
    pickTargets(a, A, B);
    cast(game, toHand(game, "Profane Transfusion"), { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(13);
    expect(life(game, B)).toBe(4);
    const token = horror(game);
    expect(token).toBeDefined();
    expect(pt(game, token as ObjectId)).toEqual({ power: 9, toughness: 9 });
    expect(game.characteristics(token as ObjectId).types).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(game.characteristics(token as ObjectId).colors.size).toBe(0);
    expect(tokensNamed(game, "Horror Token (Profane Transfusion)", A)).toBe(1);
  });

  it("reads a doubled gain: the ruling's different number", () => {
    const { game, a } = table();
    setLife(game, A, 10);
    setLife(game, B, 14);
    spawn(game, "Boon Reflection");
    lands(game, "Swamp", 9);
    pickTargets(a, A, B);
    cast(game, toHand(game, "Profane Transfusion"), { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(10);
    expect(pt(game, horror(game) as ObjectId)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("a life total with a creature's power (rule 701.12g — Evra)", () => {
  const ready = (life_: number): { game: Game; evra: ObjectId } => {
    const { game } = table();
    setLife(game, A, life_);
    const evra = spawn(game, "Evra, Halcyon Witness");
    lands(game, "Wastes", 4);
    return { game, evra };
  };

  it("the power becomes your life total, your life total its power, and it stays", () => {
    const { game, evra } = ready(30);
    activate(game, evra);
    expect(life(game, A)).toBe(4);
    expect(pt(game, evra)).toEqual({ power: 30, toughness: 4 });
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main");
    expect(pt(game, evra)).toEqual({ power: 30, toughness: 4 });
  });

  it("counters apply on top: the power it had counts them, and they stay (the ruling)", () => {
    const { game, evra } = ready(7);
    game.state.objects[evra].counters["+1/+1"] = 2;
    activate(game, evra);
    expect(life(game, A)).toBe(6);
    expect(pt(game, evra)).toEqual({ power: 9, toughness: 6 });
  });

  it("gone before it resolves, and nothing happens (the ruling)", () => {
    const { game, evra } = ready(30);
    activate(game, evra, 0, { settle: false });
    game.debugMove(evra, "graveyard");
    settle(game);
    expect(zone(game, evra)).toBe("graveyard");
    expect(life(game, A)).toBe(30);
  });

  it("power 0, and you lose the game (the ruling)", () => {
    const { game, evra } = ready(10);
    game.state.objects[evra].modifiers.push({
      timestamp: 999_999,
      power: -4,
      toughness: 0,
      keywords: [],
      untilEndOfTurn: false,
    });
    activate(game, evra);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("a player who can't lose the life: neither half happens (701.12a)", () => {
    const { game, evra } = ready(30);
    lifeFrozen(game, A);
    activate(game, evra);
    expect(life(game, A)).toBe(30);
    expect(pt(game, evra).power).toBe(4);
  });

  it("not a creature any more, so no power to exchange (rule 208.3)", () => {
    const { game, evra } = ready(30);
    game.state.objects[evra].modifiers.push({
      timestamp: 999_999,
      power: 0,
      toughness: 0,
      keywords: [],
      removeTypes: ["creature"],
      untilEndOfTurn: false,
    });
    activate(game, evra);
    expect(life(game, A)).toBe(30);
  });
});
