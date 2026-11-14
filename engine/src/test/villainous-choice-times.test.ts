/**
 * Facing a villainous choice (rule 701.55): each player's whole process —
 * choose, then do it — before the next player's (701.55d), and a replacement
 * that makes them face it additional times, each after the last is done
 * (701.55c — The Valeyard). Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, enter, hand, spawn, table, tokensNamed, toStep, settle, zone } from "./harness.js";

describe("The Valeyard: an opponent faces a villainous choice an additional time", () => {
  it("asks the opponent twice, and they may make different choices", () => {
    const { game, b } = table();
    spawn(game, "The Valeyard");
    spawn(game, "The Dalek Emperor");
    const giant = spawn(game, "Hill Giant", B);
    const answers = [[0], [1]];
    let asked = 0;
    b.chooseModesFn = () => answers[asked++];
    b.chooseSacrificesFn = () => [giant];
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(2);
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Dalek Token", A)).toBe(1);
  });

  it("does the first choice before the second is faced (rule 701.55c)", () => {
    const { game, b } = table();
    spawn(game, "The Valeyard");
    spawn(game, "The Dalek Emperor");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const seen: string[] = [];
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      seen.push(zone(game, giant));
      return [0];
    };
    b.chooseSacrificesFn = (_view, eligible) => (eligible.includes(giant) ? [giant] : [eligible[0]]);
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(2);
    // The giant was already sacrificed when the second choice was faced.
    expect(seen).toEqual(["battlefield", "graveyard"]);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("adds nothing when its controller faces the choice", () => {
    const { game, b } = table();
    // Bob's Valeyard; Alice's Emperor makes Bob face the choice.
    spawn(game, "The Valeyard", B);
    spawn(game, "The Dalek Emperor");
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(1);
  });

  it("two of them make the opponent face it three times (rule 614.5)", () => {
    // Legendary: one each for Alice and Carol, both Bob's opponents.
    const { game, b, c } = table({ players: 3 });
    spawn(game, "The Valeyard");
    spawn(game, "The Valeyard", C);
    spawn(game, "The Dalek Emperor");
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [1];
    };
    // Carol faces it too: twice, by Alice's Valeyard alone.
    let carolAsked = 0;
    c.chooseModesFn = () => {
      carolAsked += 1;
      return [1];
    };
    toStep(game, "begin-combat");
    settle(game);
    expect(asked).toBe(3);
    expect(carolAsked).toBe(2);
    expect(tokensNamed(game, "Dalek Token", A)).toBe(5);
  });

  it("doesn't touch a choice that isn't villainous", () => {
    const { game, b } = table();
    spawn(game, "The Valeyard");
    // Teferi's Realm's "that player chooses artifact, creature, land, or
    // non-Aura enchantment" is a choice, but not a villainous one.
    spawn(game, "Teferi's Realm");
    let asked = 0;
    b.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "draw", B);
    expect(asked).toBe(1);
  });
});

describe("Villainous choices: one player at a time (rule 701.55d)", () => {
  it("each opponent's choice is done before the next opponent faces theirs", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "The Dalek Emperor");
    const bGiant = spawn(game, "Hill Giant", B);
    const cGiant = spawn(game, "Hill Giant", C);
    b.chooseModesFn = () => [0];
    b.chooseSacrificesFn = () => [bGiant];
    let seenByC: string | undefined;
    c.chooseModesFn = () => {
      seenByC = zone(game, bGiant);
      return [0];
    };
    c.chooseSacrificesFn = () => [cGiant];
    toStep(game, "begin-combat");
    settle(game);
    expect(seenByC).toBe("graveyard");
    expect(zone(game, cGiant)).toBe("graveyard");
  });

  it("a discard is done before the next opponent chooses (Sycorax Commander)", () => {
    const { game, b, c } = table({ players: 3 });
    const bCards = hand(game, B).length;
    b.chooseModesFn = () => [0];
    let bHandWhenCChose: number | undefined;
    c.chooseModesFn = () => {
      bHandWhenCChose = hand(game, B).length;
      return [1];
    };
    enter(game, "Sycorax Commander");
    // Bob discarded his hand and drew one fewer before Carol chose.
    expect(bHandWhenCChose).toBe(bCards - 1);
  });
});
