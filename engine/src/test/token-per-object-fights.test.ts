/**
 * "For each creature your opponents control, create a token. Each of those
 * tokens fights a different one of those creatures" (`created-tokens-fight`,
 * Ezuri's Predation): the rulings, one by one.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, lands, life, named, pickPermanents, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const BEAST = "Phyrexian Beast Token (Ezuri's Predation)";

function predation(game: Game): void {
  lands(game, "Forest", 8);
  cast(game, toHand(game, "Ezuri's Predation"));
}

describe("Ezuri's Predation", () => {
  it("one Beast per creature, each fighting a different one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const baloth = spawn(game, "Rumbling Baloth", B); // 4/4
    const giant = spawn(game, "Hill Giant", B); // 3/3
    const mine = spawn(game, "Grizzly Bears", A);
    predation(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, baloth)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    // The Baloth's fight kills its Beast; the others live with their damage.
    expect(tokensNamed(game, BEAST, A)).toBe(2);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked ?? 0).toBe(0);
  });

  it("with none, nothing at all", () => {
    const { game } = table();
    predation(game);
    expect(tokensNamed(game, BEAST, A)).toBe(0);
    expect(game.state.awaiting).toBeNull();
  });

  it("every opponent's creatures, at a four-player table", () => {
    const { game } = table({ players: 4 });
    const bob = spawn(game, "Grizzly Bears", B);
    const carol = spawn(game, "Grizzly Bears", C);
    predation(game);
    expect(zone(game, bob)).toBe("graveyard");
    expect(zone(game, carol)).toBe("graveyard");
    expect(tokensNamed(game, BEAST, A)).toBe(2);
  });

  it("a stack's tokens are each a creature of their own", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "Goblin Token", count: 5 });
    settle(game);
    predation(game);
    expect(tokensNamed(game, "Goblin Token", B)).toBe(0);
    expect(tokensNamed(game, BEAST, A)).toBe(5);
  });

  it("the extra tokens from a doubler fight nothing (ruling)", () => {
    const { game } = table();
    spawn(game, "Anointed Procession");
    const baloth = spawn(game, "Rumbling Baloth", B);
    const giant = spawn(game, "Hill Giant", B);
    predation(game);
    expect(game.state.awaiting).toBeNull();
    expect(tokensNamed(game, BEAST, A)).toBe(3);
    expect(zone(game, baloth)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    const damaged = named(game, BEAST, A).filter((id) => (game.state.objects[id].damageMarked ?? 0) > 0);
    expect(damaged.map((id) => game.state.objects[id].damageMarked)).toEqual([3]);
  });

  it("all at the same time (ruling)", () => {
    const { game } = table();
    const link = spawn(game, "Vampire Nighthawk", B); // 2/3 flying, deathtouch, lifelink
    const bears = spawn(game, "Grizzly Bears", B);
    predation(game);
    expect(zone(game, link)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(22);
    // The Nighthawk's deathtouch killed its Beast; the other is left with 2.
    expect(tokensNamed(game, BEAST, A)).toBe(1);
  });

  it("you choose which tokens fight and which creature each fights, when the tokens differ (ruling)", () => {
    const { game, a } = table();
    spawn(game, "Chatterfang, Squirrel General");
    const baloth = spawn(game, "Rumbling Baloth", B); // 4/4
    const bears = spawn(game, "Grizzly Bears", B); // 2/2
    const prompts: string[] = [];
    let turn = 0;
    a.choosePermanentsFn = (_view, eligible) => {
      const awaiting = game.state.awaiting;
      const prompt = awaiting?.kind === "choose-permanents" ? (awaiting.prompt ?? "") : "";
      prompts.push(prompt);
      turn += 1;
      const isSquirrel = (id: ObjectId): boolean => game.state.objects[id].cardName === "Squirrel Token";
      if (turn === 1) {
        // Two Beasts and two Squirrels: one of each fights.
        expect(eligible).toHaveLength(4);
        return [eligible.find(isSquirrel)!, eligible.find((id) => !isSquirrel(id))!];
      }
      expect(eligible).toEqual(expect.arrayContaining([baloth]));
      return prompt.includes("Squirrel") ? [baloth] : [bears];
    };
    predation(game);
    expect(prompts[0]).toContain("Choose 2 of those tokens");
    expect(prompts).toHaveLength(2);
    // The Squirrel took on the Baloth and died; the Beast ate the Bears.
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, baloth)).toBe("battlefield");
    expect(game.state.objects[baloth].damageMarked).toBe(1);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(1);
    expect(tokensNamed(game, BEAST, A)).toBe(2);
  });

  it("creatures alike are no choice of which: only which tokens fight", () => {
    const { game, a } = table();
    spawn(game, "Chatterfang, Squirrel General");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a);
    a.choosePermanentsFn = (_view, eligible, _min, max) => {
      seen.offered = eligible;
      expect(max).toBe(2);
      return eligible.filter((id) => game.state.objects[id].cardName !== "Squirrel Token");
    };
    predation(game);
    expect(seen.offered).toHaveLength(4);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(0);
    expect(tokensNamed(game, BEAST, A)).toBe(2);
    expect(tokensNamed(game, "Squirrel Token", A)).toBe(2);
  });

  it("a token that isn't a creature can be named, and fights nothing (rule 701.14)", () => {
    const { game, a } = table();
    spawn(game, "Tippy-Toe, Terrific Partner");
    const bears = spawn(game, "Grizzly Bears", B);
    a.choosePermanentsFn = (_view, eligible) =>
      eligible.filter((id) => game.state.objects[id].cardName === "Food Token");
    predation(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, BEAST, A)).toBe(1);
  });
});
