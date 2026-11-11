/**
 * "Creatures attacking your opponents and/or planeswalkers they control"
 * (`attackingOpponent: "or-their-planeswalkers"` — Roar of Resistance): a
 * creature attacking a player who is the filtering player's opponent, or a
 * planeswalker such a player controls (rule 506.2), whoever controls the
 * attacker — never one attacking the filtering player, a planeswalker of
 * theirs, or a battle. The set is fixed as the ability resolves (611.2c).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, keywords, lands, nextTurn, pickModes, pt, spawn, toHand, toStep, table } from "./harness.js";

describe("Roar of Resistance", () => {
  it("your attackers at an opponent and at their planeswalker both get +2/+0 when you pay", () => {
    const { game, a } = table();
    spawn(game, "Roar of Resistance");
    lands(game, "Mountain", 2);
    const walker = spawn(game, "Jace Beleren", B);
    const atPlayer = spawn(game, "Grizzly Bears");
    const atWalker = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.declareAttackersFn = () => [
      { attacker: atPlayer, defender: B },
      { attacker: atWalker, defender: walker },
    ];
    toStep(game, "declare-blockers");
    expect(pt(game, atPlayer)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, atWalker)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, home)).toEqual({ power: 2, toughness: 2 });
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Mountain" && game.state.objects[id].tapped)).toHaveLength(2);
  });

  it("declining, or having nothing to pay with, pumps nothing", () => {
    const { game, a } = table();
    spawn(game, "Roar of Resistance");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("triggers on another player's attack: only the creatures aimed at your opponents or their planeswalkers", () => {
    const { game, a, b } = table({ players: 3 });
    spawn(game, "Roar of Resistance");
    lands(game, "Mountain", 2);
    const yours = spawn(game, "Jace Beleren", A);
    const theirs = spawn(game, "Jace Beleren", C);
    const atYou = spawn(game, "Grizzly Bears", B);
    const atYourWalker = spawn(game, "Grizzly Bears", B);
    const atCarol = spawn(game, "Grizzly Bears", B);
    const atCarolsWalker = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    nextTurn(game);
    b.declareAttackersFn = () => [
      { attacker: atYou, defender: A },
      { attacker: atYourWalker, defender: yours },
      { attacker: atCarol, defender: C },
      { attacker: atCarolsWalker, defender: theirs },
    ];
    toStep(game, "declare-blockers", B);
    expect(pt(game, atYou).power).toBe(2);
    expect(pt(game, atYourWalker).power).toBe(2);
    expect(pt(game, atCarol).power).toBe(4);
    expect(pt(game, atCarolsWalker).power).toBe(4);
  });

  it("a creature attacking a battle an opponent protects isn't attacking them or a planeswalker", () => {
    const { game, a } = table();
    spawn(game, "Roar of Resistance");
    lands(game, "Swamp", 3);
    lands(game, "Forest", 3);
    const battle = toHand(game, "Invasion of Lorwyn");
    cast(game, battle);
    expect(game.state.objects[battle].protector).toBe(B);
    lands(game, "Mountain", 2);
    const atBattle = spawn(game, "Grizzly Bears");
    const atPlayer = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    a.declareAttackersFn = () => [
      { attacker: atBattle, defender: battle },
      { attacker: atPlayer, defender: B },
    ];
    toStep(game, "declare-blockers");
    expect(pt(game, atBattle).power).toBe(2);
    expect(pt(game, atPlayer).power).toBe(4);
  });

  it("creature tokens you control have haste", () => {
    const { game } = table();
    spawn(game, "Roar of Resistance");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const soldier = game.battlefield.find((id) => game.state.objects[id].isToken);
    expect(soldier).toBeDefined();
    expect(keywords(game, soldier!).has("haste")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});
