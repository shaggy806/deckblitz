// Batch 320: the top 5000's next cards by EDHREC rank (4407–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import { A, B, keywords, named, pickModes, pt, settle, spawn, table, tokensNamed } from "./harness.js";

describe("Jinnie Fay, Jetmir's Second: you may make that many Cats or Dogs instead", () => {
  const CAT = "2/2 Green Cat Token (Haste)";
  const DOG = "3/1 Green Dog Token (Vigilance)";

  it("taking the Cats: that many 2/2 hasty Cats, and none of the tokens", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 3 }, []);
    settle(game);
    expect(tokensNamed(game, CAT, A)).toBe(3);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    const cat = named(game, CAT, A)[0];
    expect(pt(game, cat)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, cat)).toContain("haste");
  });

  it("taking the Dogs, what the effect says of its tokens still holds: they enter tapped", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    pickModes(a, 2);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2, tapped: true }, []);
    settle(game);
    expect(tokensNamed(game, DOG, A)).toBe(2);
    expect(named(game, DOG, A).every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("declining keeps the tokens; an opponent's tokens aren't asked about", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Soldier Token", B)).toBe(1);
    expect(tokensNamed(game, CAT)).toBe(0);
  });

  it("a doubler doubles the Cats (rule 616.1)", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    spawn(game, "Anointed Procession");
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, CAT, A)).toBe(2);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });

  it("a copy token is made as a Cat too", () => {
    const { game, a } = table();
    spawn(game, "Jinnie Fay, Jetmir's Second");
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1 }, [{ kind: "object", object: bear }]);
    settle(game);
    expect(tokensNamed(game, CAT, A)).toBe(1);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });
});
