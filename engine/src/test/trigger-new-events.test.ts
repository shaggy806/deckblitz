/**
 * Trigger events added to the vocabulary for the triggers-journal lane
 * (2026-11-13): a mill once per card, each one its own trigger.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";
import { investigate } from "../cards/helpers.js";

describe("mills, per card (Glowing One, Infesting Radroach)", () => {
  it("Glowing One gains 1 life for each nonland card milled, whoever milled", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    spawn(game, "Glowing One");
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes", B);
    toLibrary(game, "Llanowar Elves", B);
    toLibrary(game, "Shock", B);
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 4 });
    settle(game);
    expect(life(game, A)).toBe(before + 3);
  });

  it("a mill of lands alone doesn't trigger it", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    spawn(game, "Glowing One");
    const before = life(game, A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 3 });
    settle(game);
    expect(life(game, A)).toBe(before);
  });

  it("Infesting Radroach returns from your graveyard when an opponent mills a nonland card", () => {
    const { game, a } = table({ players: 2, deck: "Wastes" });
    const roach = toGraveyard(game, "Infesting Radroach", A);
    toLibrary(game, "Grizzly Bears", B);
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("hand");
    expect(hand(game, A)).toContain(roach);
  });

  it("doesn't trigger on its controller's own mill", () => {
    const { game } = table({ players: 2, deck: "Wastes" });
    const roach = toGraveyard(game, "Infesting Radroach", A);
    toLibrary(game, "Grizzly Bears", A);
    game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("graveyard");
  });

  it("sees an opponent's mill made at the same time as its own (the ruling)", () => {
    // Each player mills a card, in turn order: Alice's Bears, then Bob's,
    // then Carol's Radroach — announced once every one of them has milled.
    const { game, c } = table({ players: 3, deck: "Wastes" });
    toLibrary(game, "Grizzly Bears", A);
    toLibrary(game, "Grizzly Bears", B);
    const roach = toLibrary(game, "Infesting Radroach", C);
    pickModes(c, 0);
    game.debugApplyEffect(B, { kind: "mill", target: "each-player", amount: 1 });
    settle(game);
    expect(zone(game, roach)).toBe("hand");
  });
});

describe("investigates (Erdwal Illuminator)", () => {
  const clues = (game: ReturnType<typeof table>["game"]): number => tokensNamed(game, "Clue Token", A);

  it("investigates an additional time the first time each turn, and only then", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Erdwal Illuminator");
    game.debugApplyEffect(A, investigate());
    settle(game);
    expect(clues(game)).toBe(2);
    game.debugApplyEffect(A, investigate());
    settle(game);
    expect(clues(game)).toBe(3);
  });

  it("counts an investigation made before it arrived this turn", () => {
    const { game } = table({ players: 2 });
    game.debugApplyEffect(A, investigate());
    settle(game);
    spawn(game, "Erdwal Illuminator");
    game.debugApplyEffect(A, investigate());
    settle(game);
    expect(clues(game)).toBe(2);
  });

  it("isn't a Clue made without the word, nor an opponent's investigation", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Erdwal Illuminator");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    game.debugApplyEffect(B, investigate());
    settle(game);
    expect(clues(game)).toBe(1);
    expect(tokensNamed(game, "Clue Token", B)).toBe(1);
  });

  it("sees a pool card's investigation (Thraben Inspector)", () => {
    const { game } = table({ players: 2 });
    spawn(game, "Erdwal Illuminator");
    enter(game, "Thraben Inspector");
    settle(game);
    expect(clues(game)).toBe(2);
  });
});

describe("pays life (Font of Agonies)", () => {
  it("counts an ability's life cost", () => {
    const { game } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    lands(game, "Swamp", 1);
    const greed = spawn(game, "Greed");
    activate(game, greed);
    expect(counters(game, font, "blood")).toBe(2);
  });

  it("counts an additional cost's X life, that many", () => {
    const { game } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Toxic Deluge"), { x: 3 });
    expect(counters(game, font, "blood")).toBe(3);
  });

  it("counts an \"unless you pay N life\" paid, and not a loss of life", () => {
    const { game, a } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 3, who: "you" });
    settle(game);
    expect(counters(game, font, "blood")).toBe(0);
    pickModes(a, 0);
    game.debugApplyEffect(A, {
      kind: "unless",
      chooser: "you",
      options: [{ payLife: 2, text: "Pay 2 life" }],
      otherwise: { kind: "draw", amount: 1 },
    });
    settle(game);
    expect(counters(game, font, "blood")).toBe(2);
  });

  it("removes four blood counters to destroy a creature", () => {
    const { game } = table({ players: 2 });
    const font = spawn(game, "Font of Agonies");
    game.debugApplyEffect(A, { kind: "add-counter", target: "source", counter: "blood", amount: 4 }, [], { source: font });
    lands(game, "Swamp", 2);
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, font, 0, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(counters(game, font, "blood")).toBe(0);
  });
});
