// Unleash (rule 702.98a) and detain (rule 701.35a) — Return to Ravnica's
// mechanics, on its cards.
import { describe, expect, it } from "vitest";

import { restrictionsOf } from "../characteristics.js";
import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, counters, enter, keywords, lands, nextTurn, pt, ref, spawn, table, toHand } from "./harness.js";

const cantBlock = (game: Game, id: ObjectId): boolean =>
  restrictionsOf(game.state, game.registry, id).has("cant-block");

const canActivate = (game: Game, source: ObjectId, player = B): boolean =>
  game.canDispatch({ type: "activate-ability", player, source, abilityIndex: 0, targets: [ref(A)] }) === null;

describe("unleash", () => {
  it("asks as it enters: with the counter it can't block, without it it can", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const asked: string[][] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked.push([...options]);
      return options[0];
    };
    const unleashed = toHand(game, "Gore-House Chainwalker");
    cast(game, unleashed);
    expect(asked).toEqual([["+1/+1 counter", "No counter"]]);
    expect(counters(game, unleashed)).toBe(1);
    expect(pt(game, unleashed)).toEqual({ power: 3, toughness: 2 });
    expect(cantBlock(game, unleashed)).toBe(true);

    a.chooseCreatureTypeFn = (_view, _source, options) => options[1];
    const held = toHand(game, "Gore-House Chainwalker");
    cast(game, held);
    expect(counters(game, held)).toBe(0);
    expect(cantBlock(game, held)).toBe(false);
    // Any +1/+1 counter stops it blocking, not only unleash's (the ruling).
    game.state.objects[held].counters["+1/+1"] = 1;
    expect(cantBlock(game, held)).toBe(true);
  });

  it("Chaos Imps has trample only while it has a +1/+1 counter", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    const imps = toHand(game, "Chaos Imps");
    cast(game, imps);
    expect(pt(game, imps)).toEqual({ power: 7, toughness: 6 });
    expect(keywords(game, imps).has("trample")).toBe(true);
    game.state.objects[imps].counters["+1/+1"] = 0;
    expect(keywords(game, imps).has("trample")).toBe(false);
  });
});

describe("detain", () => {
  it("until its controller's next turn: can't attack or block, no activated abilities", () => {
    const { game, a } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer", B);
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(sorcerer)];
    enter(game, "Azorius Arrester");
    expect(cantBlock(game, sorcerer)).toBe(true);
    expect(cantBlock(game, bear)).toBe(false);
    // Bob's turn: it can't attack, and its {T} ability can't be activated.
    nextTurn(game);
    expect(canActivate(game, sorcerer)).toBe(false);
    expect(cantBlock(game, bear)).toBe(false);
    expect(whyCannotAttack(game.state, game.registry, B, sorcerer, A)).toMatch(/can't attack/);
    expect(whyCannotAttack(game.state, game.registry, B, bear, A)).toBeNull();
    // Alice's next turn: it's over.
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(cantBlock(game, sorcerer)).toBe(false);
    nextTurn(game);
    expect(canActivate(game, sorcerer)).toBe(true);
  });

  it("Lyev Decree detains up to two creatures, and one is enough", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(one), null];
    cast(game, toHand(game, "Lyev Decree"), { targets: [ref(one), null] });
    expect(cantBlock(game, one)).toBe(true);
    expect(cantBlock(game, two)).toBe(false);
  });

  it("a detained creature's mana ability can't be activated either (the ruling)", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    lands(game, "Island", 2);
    const elves = spawn(game, "Llanowar Elves", B);
    const guildmage = spawn(game, "New Prahv Guildmage");
    game.dispatch({ type: "activate-ability", player: A, source: guildmage, abilityIndex: 1, targets: [ref(elves)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(
      game.canDispatch({ type: "activate-ability", player: B, source: elves, abilityIndex: 0, targets: [] }),
    ).not.toBeNull();
  });
});
