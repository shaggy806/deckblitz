/**
 * A static gated on who its host is in combat with: a `controls` condition
 * (`anyController`) whose filter's `blockingRelation` is read against the
 * source — Sting, the Glinting Dagger's "has first strike as long as it's
 * blocking or blocked by a Goblin or Orc" (rules 509.1g-h, 506.4).
 */
import { describe, expect, it } from "vitest";

import type { BlockerDeclaration } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  keywords,
  lands,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  zone,
} from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

/** Sting on `host`, paid for and equipped in alice's main phase. */
function equipped(game: Game, host: ObjectId): ObjectId {
  const sting = spawn(game, "Sting, the Glinting Dagger");
  lands(game, "Plains", 2);
  activate(game, sting, 0, { targets: [ref(host)] });
  expect(game.state.objects[sting].attachedTo).toBe(host);
  return sting;
}

const toBlocks = (game: Game): void =>
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-blockers" &&
      s.priority.holder === activePlayerOf(s) &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0,
  );

describe("Sting, the Glinting Dagger", () => {
  it("gives +1/+1 and haste, and no first strike out of combat", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    equipped(game, bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("first strike while blocked by a Goblin: it kills the Goblin first and takes nothing", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    equipped(game, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = blocks([goblin, bears]);
    toBlocks(game);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(zone(game, goblin)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("first strike while blocking an Orc on another player's turn", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const orc = spawn(game, "Brutal Hordechief", B);
    equipped(game, bears);
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: orc, defender: A }];
    a.declareBlockersFn = blocks([bears, orc]);
    toBlocks(game);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });

  it("a creature of another type, or a Goblin blocking something else, gives nothing", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Wall of Wood", B);
    const goblin = spawn(game, "Raging Goblin", B);
    equipped(game, bears);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: B },
    ];
    b.declareBlockersFn = blocks([wall, bears], [goblin, other]);
    toBlocks(game);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("loses it when the Goblin goes, though the creature stays blocked", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const goblin = spawn(game, "Raging Goblin", B);
    equipped(game, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = blocks([goblin, bears]);
    toBlocks(game);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(goblin)]);
    expect(game.state.objects[bears].blocked).toBe(true);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("untaps the equipped creature at the beginning of each combat, not only its controller's", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    equipped(game, bears);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "end");
    expect(game.state.objects[bears].tapped).toBe(true);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "declare-attackers");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});
