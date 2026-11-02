/**
 * The would-create-token replacements as one event (rules 614.5, 616.1,
 * `token-replacements.ts`): one more of a named token (`plusOneToken`), a
 * replacement only for some tokens (`ofTokens`), the tokens made instead
 * (`tokensInstead`) and one of each (`oneOfEach`), in the order that makes
 * the most.
 */
import { describe, expect, it } from "vitest";

import { A, B, hand, keywords, named, pt, ref, settle, spawn, table, tokensNamed, toStep, types } from "./harness.js";

function treasure(game: ReturnType<typeof table>["game"], count = 1): void {
  game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count });
  settle(game);
}

describe("those tokens plus an additional one", () => {
  it("Xorn: one more Treasure however many are made, and nothing for other tokens", () => {
    const { game } = table();
    spawn(game, "Xorn");
    treasure(game, 3);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
  });

  it("only its controller's tokens", () => {
    const { game } = table();
    spawn(game, "Xorn", B);
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });

  it("two Xorns add one each", () => {
    const { game } = table();
    spawn(game, "Xorn");
    spawn(game, "Xorn");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("with a doubler, the extra one is doubled too: the order that makes the most", () => {
    const { game } = table();
    spawn(game, "Xorn");
    spawn(game, "Anointed Procession");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
  });

  it("with Chatterfang, the extra one comes first and gets a Squirrel too", () => {
    const { game } = table();
    spawn(game, "Tippy-Toe, Terrific Partner");
    spawn(game, "Chatterfang, Squirrel General");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("Stridehangar Automaton: artifact tokens, a Thopter that gets +1/+1 too", () => {
    const { game } = table();
    spawn(game, "Stridehangar Automaton");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
    treasure(game, 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
    const [thopter] = named(game, "Thopter Token", A);
    expect(pt(game, thopter)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, thopter).has("flying")).toBe(true);
  });

  it("a copy of an artifact is an artifact token, and the extra one isn't a copy", () => {
    const { game } = table();
    spawn(game, "Stridehangar Automaton");
    const rock = spawn(game, "Sol Ring");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(rock)]);
    settle(game);
    expect(named(game, "Sol Ring", A)).toHaveLength(2);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });

  it("a copy of a creature isn't an artifact token", () => {
    const { game } = table();
    spawn(game, "Stridehangar Automaton");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
  });

  it("gets what the effect does to the tokens: tapped, and removed at end step with them", () => {
    const { game } = table();
    spawn(game, "Tippy-Toe, Terrific Partner");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1, tapped: true });
    settle(game);
    for (const id of named(game, "Food Token", A)) expect(game.state.objects[id].tapped).toBe(true);
  });

  it("one instruction is one event: a Treasure and a Clue make one Food between them", () => {
    const { game } = table();
    spawn(game, "Tippy-Toe, Terrific Partner");
    game.debugApplyEffect(A, {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "create-token", token: "Treasure Token", count: 1 },
        { kind: "create-token", token: "Clue Token", count: 1 },
      ],
    });
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    // Two instructions are two events.
    game.debugApplyEffect(A, {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: "Treasure Token", count: 1 },
        { kind: "create-token", token: "Clue Token", count: 1 },
      ],
    });
    settle(game);
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
  });

  it("copies of several permanents, by one instruction, are one event", () => {
    const { game } = table();
    spawn(game, "Tippy-Toe, Terrific Partner");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    game.debugApplyEffect(A, {
      kind: "create-token-copy",
      of: { each: { type: "creature", controlledBy: "you", notSupertype: "legendary" } },
      count: 1,
    });
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(2);
    expect(named(game, "Hill Giant", A)).toHaveLength(2);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("the second kind of the event can still meet a replacement that hadn't applied", () => {
    const { game } = table();
    spawn(game, "Queen Allenal of Ruadach");
    game.debugApplyEffect(A, {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "create-token", token: "Treasure Token", count: 1 },
        { kind: "create-token", token: "Saproling Token", count: 2 },
      ],
    });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("Queen Allenal: another replacement's creature token makes it apply", () => {
    const { game } = table();
    spawn(game, "Queen Allenal of Ruadach");
    treasure(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
    spawn(game, "Chatterfang, Squirrel General");
    treasure(game);
    // Chatterfang first: a Treasure and a Squirrel, so a creature token.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("Queen Allenal's power and toughness are the creatures you control", () => {
    const { game } = table();
    const queen = spawn(game, "Queen Allenal of Ruadach");
    spawn(game, "Grizzly Bears");
    expect(pt(game, queen)).toEqual({ power: 2, toughness: 2 });
  });

  it("a replacement on a permanent that lost its abilities does nothing", () => {
    const { game } = table();
    spawn(game, "Xorn");
    spawn(game, "Humility");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("each token copy of a Xorn in a stack is a replacement of its own", () => {
    const { game } = table();
    const xorn = spawn(game, "Xorn");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 2 }, [ref(xorn)]);
    settle(game);
    expect(named(game, "Xorn", A)).toHaveLength(3);
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
  });

  it("Tippy-Toe draws at your end step only if you gained life", () => {
    const { game } = table();
    spawn(game, "Tippy-Toe, Terrific Partner");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
    toStep(game, "precombat-main");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    const after = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(after + 1);
  });
});

describe("the tokens made instead, for some tokens", () => {
  it("Draconic Visitor: artifact tokens become that many Dragons, others are left alone", () => {
    const { game } = table();
    spawn(game, "Draconic Visitor");
    treasure(game, 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(2);
  });

  it("a copy of an artifact is a plain Dragon, tapped if the copy would be", () => {
    const { game } = table();
    spawn(game, "Draconic Visitor");
    const rock = spawn(game, "Sol Ring");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, tapped: true }, [ref(rock)]);
    settle(game);
    expect(named(game, "Sol Ring", A)).toHaveLength(1);
    const [dragon] = named(game, "Dragon Token", A);
    expect(game.state.objects[dragon].tapped).toBe(true);
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
    expect(types(game, dragon)).not.toContain("artifact");
  });

  it("Stridehangar Automaton first: the Thopter is an artifact token too, the most Dragons", () => {
    const { game } = table();
    spawn(game, "Draconic Visitor");
    spawn(game, "Stridehangar Automaton");
    treasure(game);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(2);
  });

  it("the Dragon is a creature token, so Queen Allenal then applies", () => {
    const { game } = table();
    spawn(game, "Draconic Visitor");
    spawn(game, "Queen Allenal of Ruadach");
    treasure(game);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(1);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("with Divine Visitation, an artifact token ends as an Angel", () => {
    const { game } = table();
    spawn(game, "Draconic Visitor");
    spawn(game, "Divine Visitation");
    treasure(game);
    expect(tokensNamed(game, "Dragon Token", A)).toBe(0);
    expect(tokensNamed(game, "4/4 Vigilant Angel Token", A)).toBe(1);
  });

  it("Fisher's Talent: Fish to Shark at level 2, Shark to Octopus at level 3, not before", () => {
    const { game } = table();
    const talent = spawn(game, "Fisher's Talent");
    const fish = (): void => {
      game.debugApplyEffect(A, { kind: "create-token", token: "Fish Token", count: 1 });
      settle(game);
    };
    fish();
    expect(tokensNamed(game, "Fish Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "gain-class-level", level: 2 }, [], { source: talent });
    settle(game);
    fish();
    expect(tokensNamed(game, "Fish Token", A)).toBe(1);
    expect(tokensNamed(game, "Shark Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "gain-class-level", level: 3 }, [], { source: talent });
    settle(game);
    fish();
    expect(tokensNamed(game, "Shark Token", A)).toBe(1);
    expect(tokensNamed(game, "Octopus Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Shark Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Octopus Token", A)).toBe(2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Fisher's Talent's upkeep", () => {
  const upkeep = (deck: string, reveal: boolean) => {
    const { game, a } = table({ deck });
    spawn(game, "Fisher's Talent");
    let offered = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible.length;
      return reveal ? eligible : [];
    };
    const before = hand(game).length;
    toStep(game, "upkeep");
    settle(game);
    return { game, offered, drawn: hand(game).length - before };
  };

  it("a land revealed makes a Fish, then a draw", () => {
    const { game, offered, drawn } = upkeep("Wastes", true);
    expect(offered).toBe(1);
    expect(tokensNamed(game, "Fish Token", A)).toBe(1);
    expect(drawn).toBe(1);
  });

  it("a land not revealed makes no Fish, and still a draw", () => {
    const { game, drawn } = upkeep("Wastes", false);
    expect(tokensNamed(game, "Fish Token", A)).toBe(0);
    expect(drawn).toBe(1);
  });

  it("a nonland can't be revealed: no Fish, and still a draw", () => {
    const { game, offered, drawn } = upkeep("Grizzly Bears", true);
    expect(offered).toBe(0);
    expect(tokensNamed(game, "Fish Token", A)).toBe(0);
    expect(drawn).toBe(1);
  });
});

describe("one of each", () => {
  it("Academy Manufactor: a Clue, Food or Treasure token makes one of each", () => {
    const { game } = table();
    spawn(game, "Academy Manufactor");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("two tokens make two of each, and other tokens are left alone", () => {
    const { game } = table();
    spawn(game, "Academy Manufactor");
    game.debugApplyEffect(A, { kind: "create-token", token: "Food Token", count: 2 });
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });

  it("two Manufactors make three of each from one", () => {
    const { game } = table();
    spawn(game, "Academy Manufactor");
    spawn(game, "Academy Manufactor");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    expect(tokensNamed(game, "Clue Token", A)).toBe(3);
    expect(tokensNamed(game, "Food Token", A)).toBe(3);
  });

  it("Xorn between two Manufactors, the order that makes the most", () => {
    const { game } = table();
    spawn(game, "Academy Manufactor");
    spawn(game, "Academy Manufactor");
    spawn(game, "Xorn");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    settle(game);
    // A Clue, then one of each, then a second Treasure, then four of each.
    expect(tokensNamed(game, "Clue Token", A)).toBe(4);
    expect(tokensNamed(game, "Food Token", A)).toBe(4);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(4);
  });

  it("a doubler doubles the lot", () => {
    const { game } = table();
    spawn(game, "Academy Manufactor");
    spawn(game, "Anointed Procession");
    treasure(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(tokensNamed(game, "Food Token", A)).toBe(2);
  });
});
