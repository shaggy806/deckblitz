/**
 * Homelands (HML) — group D of the set walk: Truce's per-player draw-or-life
 * choice, Didgeridoo, the Minotaur lord, the block-triggered first strike of
 * Ghost Hounds and Mammoth Harness, and Hungry Mist's upkeep.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pt,
  quiet,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Truce", () => {
  /** The seat answers its mode questions with these, in order. */
  const answers = (seat: ScriptedController, ...each: number[][]): void => {
    const queue = [...each];
    seat.chooseModesFn = () => queue.shift() ?? [];
  };

  it("one card drawn gains 2, none gains 4, two gains nothing — the caster's own choice included", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Plains", 3);
    const truce = toHand(game, "Truce");
    const before = [A, B, C].map((p) => hand(game, p).length);
    answers(a, [0], [1]); // draws, one card
    answers(b, []); // declines
    answers(c, [0], [0]); // draws, two cards
    cast(game, truce);
    expect(hand(game, A).length).toBe(before[0] - 1 + 1);
    expect(life(game, A)).toBe(22);
    expect(hand(game, B).length).toBe(before[1]);
    expect(life(game, B)).toBe(24);
    expect(hand(game, C).length).toBe(before[2] + 2);
    expect(life(game, C)).toBe(20);
  });
});

describe("Didgeridoo", () => {
  it("may put a Minotaur permanent card from hand onto the battlefield", () => {
    const { game, a } = table();
    const didge = spawn(game, "Didgeridoo");
    lands(game, "Wastes", 3);
    const minotaur = toHand(game, "Hurloon Minotaur");
    const bears = toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, minotaur);
    activate(game, didge);
    expect(seen.offered).toContain(minotaur);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, minotaur)).toBe("battlefield");
  });
});

describe("Anaba Spirit Crafter", () => {
  it("Minotaurs, itself included, get +1/+0", () => {
    const { game } = table();
    const anaba = spawn(game, "Anaba Spirit Crafter");
    const minotaur = spawn(game, "Hurloon Minotaur", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, anaba)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, minotaur)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Mystic Decree and Serra Aviary", () => {
  it("Serra Aviary pumps fliers; Mystic Decree takes flying away (and the pump with it)", () => {
    const { game } = table();
    const drake = spawn(game, "Wind Drake");
    spawn(game, "Serra Aviary");
    expect(pt(game, drake)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Mystic Decree", B);
    expect(keywords(game, drake).has("flying")).toBe(false);
  });
});

describe("Ghost Hounds", () => {
  it("gains first strike when blocked by a white creature, not by another", () => {
    const { game, a, b } = table();
    const hounds = spawn(game, "Ghost Hounds");
    const lions = spawn(game, "Savannah Lions", B);
    a.declareAttackersFn = () => [{ attacker: hounds, defender: B }];
    b.declareBlockersFn = () => [{ blocker: lions, attacker: hounds }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && quiet(s));
    expect(keywords(game, hounds).has("first-strike")).toBe(true);
  });

  it("no first strike when blocked by a nonwhite creature", () => {
    const { game, a, b } = table();
    const hounds = spawn(game, "Ghost Hounds");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: hounds, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: hounds }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && quiet(s));
    expect(keywords(game, hounds).has("first-strike")).toBe(false);
  });
});

describe("Mammoth Harness", () => {
  it("the enchanted creature loses flying; its blocker gains first strike", () => {
    const { game, a, b } = table();
    const angel = spawn(game, "Serra Angel");
    const harness = spawn(game, "Mammoth Harness", B);
    game.state.objects[harness].attachedTo = angel;
    expect(keywords(game, angel).has("flying")).toBe(false);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: angel, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: angel }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && quiet(s));
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, angel).has("first-strike")).toBe(false);
  });
});

describe("Hungry Mist", () => {
  it("is sacrificed at upkeep when {G}{G} isn't paid", () => {
    const { game } = table();
    const mist = spawn(game, "Hungry Mist");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, mist)).toBe("graveyard");
  });
});
