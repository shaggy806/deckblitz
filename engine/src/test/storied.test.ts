/**
 * Storied (rule 702.195): any time a player controls a permanent with storied
 * and three or more permanents that are artifacts, Sagas and/or legendary,
 * they have an enduring story for the rest of the game — had before the game
 * looks for triggers (702.195c), so the state-based check grants it. The
 * Hobbit's Dwarves read it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, destroy, enter, hand, keywords, lands, life, nextTurn, pickModes, pt, spawn, table, toHand, toStep, tokensNamed } from "./harness.js";

const story = (game: Game, player: PlayerId = A): boolean => game.state.players[player].enduringStory === true;
/** Pass priority far enough for a state-based check. */
const check = (game: Game): void => toStep(game, "begin-combat");

describe("storied", () => {
  it("three artifacts, Sagas and/or legendaries with a storied permanent: an enduring story", () => {
    const { game } = table();
    const ori = spawn(game, "Ori, Keeper of Songs"); // legendary itself
    spawn(game, "Sol Ring");
    check(game);
    expect(story(game)).toBe(false);
    expect(pt(game, ori).power).toBe(3);
    spawn(game, "Arcane Signet");
    toStep(game, "declare-attackers");
    expect(story(game)).toBe(true);
    expect(pt(game, ori).power).toBe(4);
    expect(keywords(game, ori).has("vigilance")).toBe(true);
    expect(game.viewFor(A).players[A].enduringStory).toBe(true);
  });

  it("is kept for the rest of the game, whatever leaves", () => {
    const { game } = table();
    const ori = spawn(game, "Ori, Keeper of Songs");
    const ring = spawn(game, "Sol Ring");
    spawn(game, "Arcane Signet");
    check(game);
    expect(story(game)).toBe(true);
    destroy(game, ring);
    destroy(game, ori);
    nextTurn(game);
    expect(story(game)).toBe(true);
    expect(story(game, B)).toBe(false);
  });

  it("needs a storied permanent: three artifacts alone tell no story", () => {
    const { game } = table();
    spawn(game, "Sol Ring");
    spawn(game, "Arcane Signet");
    spawn(game, "Mind Stone");
    check(game);
    expect(story(game)).toBe(false);
  });

  it("a storied permanent that lost its abilities grants nothing", () => {
    const { game } = table();
    const ori = spawn(game, "Ori, Keeper of Songs");
    game.debugApplyEffect(B, { kind: "lose-abilities", target: 0, duration: "permanent" }, [
      { kind: "object", object: ori },
    ]);
    spawn(game, "Sol Ring");
    spawn(game, "Arcane Signet");
    check(game);
    expect(story(game)).toBe(false);
  });

  it("Bombur doesn't untap without an enduring story, and does with one", () => {
    const { game } = table();
    const bombur = spawn(game, "Bombur, Gentle Dreamer", A, { tapped: true });
    nextTurn(game);
    expect(game.state.objects[bombur].tapped).toBe(true);
    spawn(game, "Sol Ring");
    spawn(game, "Arcane Signet");
    check(game);
    expect(story(game)).toBe(true);
    game.state.objects[bombur].tapped = true;
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bombur].tapped).toBe(false);
  });

  it("Balin deals X damage to each opponent only with an enduring story", () => {
    const { game, a } = table();
    // Every "you may" answered yes.
    pickModes(a, 0);
    for (const name of ["Grizzly Bears", "Grizzly Bears", "Grizzly Bears"]) toHand(game, name);
    const before = hand(game).length;
    enter(game, "Balin, Loremaster");
    // His own entry: no story yet (one legendary), so he only redraws.
    expect(hand(game).length).toBe(before);
    expect(life(game, B)).toBe(20);
    spawn(game, "Sol Ring");
    spawn(game, "Arcane Signet");
    check(game);
    expect(story(game)).toBe(true);
    const cards = hand(game).length;
    enter(game, "Dáin's Company");
    expect(life(game, B)).toBe(20 - cards);
  });

  it("Dáin's attack tax applies only with an enduring story", () => {
    const attackWithTwo = (withStory: boolean): string | null => {
      const { game } = table();
      spawn(game, "Dáin, Lord of the Iron Hills");
      if (withStory) {
        spawn(game, "Sol Ring");
        spawn(game, "Arcane Signet");
      }
      const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
      lands(game, "Forest", 1, B);
      nextTurn(game, "precombat-main");
      game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
      expect(story(game)).toBe(withStory);
      return game.canDispatch({
        type: "declare-attackers",
        player: B,
        attackers: bears.map((attacker) => ({ attacker, defender: A })),
      });
    };
    // {1} each, and one Forest: two can't attack together with a story.
    expect(attackWithTwo(true)).toMatch(/can't pay/);
    expect(attackWithTwo(false)).toBeNull();
  });

  it("Fíli makes a Dwarf as he enters; with a story, Bifur makes it two, and creatures get +1/+1", () => {
    const { game } = table();
    enter(game, "Fíli the Pathfinder");
    expect(tokensNamed(game, "2/2 Red Dwarf Token", A)).toBe(1);
    // A story: Fíli, Bifur (both legendary) and Sol Ring.
    const bifur = spawn(game, "Bifur, Melodic Rider");
    spawn(game, "Sol Ring");
    check(game);
    expect(story(game)).toBe(true);
    expect(pt(game, bifur).power).toBe(5);
    enter(game, "Dáin's Company");
    // Fíli's trigger, about a Dwarf, triggers an additional time.
    expect(tokensNamed(game, "2/2 Red Dwarf Token", A)).toBe(3);
  });
});
