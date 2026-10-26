/**
 * Shards of Alara and Magic 2011 — group D of B174: the clause of each card
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

function cycle(game: Game, card: ObjectId): void {
  const why = game.canDispatch({ type: "cycle", player: A, card });
  if (why !== null) throw new Error(`cycle refused: ${why}`);
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
}

describe("Sphinx Sovereign", () => {
  it("gains you 3 life at your end step while untapped", () => {
    const { game } = table();
    spawn(game, "Sphinx Sovereign");
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(20);
  });

  it("drains each opponent instead while tapped", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Sphinx Sovereign", A, { tapped: true });
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
  });
});

describe("Banewasp Affliction", () => {
  it("the enchanted creature's controller loses life equal to its toughness when it dies", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const giant = spawn(game, "Hill Giant", B);
    const aura = toHand(game, "Banewasp Affliction");
    cast(game, aura, { targets: [ref(giant)] });
    destroy(game, giant);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });
});

describe("Skeletonize", () => {
  it("makes a Skeleton when the creature it damaged dies later this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Skeletonize"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(tokensNamed(game, "Skeleton Regenerating Token", A)).toBe(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(tokensNamed(game, "Skeleton Regenerating Token", A)).toBe(1);
  });

  it("makes nothing for a creature that survives", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Skeletonize"), { targets: [ref(maw)] });
    expect(zone(game, maw)).toBe("battlefield");
    expect(tokensNamed(game, "Skeleton Regenerating Token", A)).toBe(0);
  });
});

describe("Gustrider Exuberant", () => {
  it("gives flying only to creatures you control with power 5 or greater", () => {
    const { game } = table();
    const gust = spawn(game, "Gustrider Exuberant");
    const maw = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    activate(game, gust);
    expect(zone(game, gust)).toBe("graveyard");
    expect(keywords(game, maw).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
  });
});

describe("Resounding Wave", () => {
  it("cycled, returns two target permanents and draws a card", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 5);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    const wave = toHand(game, "Resounding Wave");
    const before = hand(game, A).length;
    pickTargets(a, one, two);
    cycle(game, wave);
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Resounding Scream", () => {
  it("cycled, the target player discards two cards at random", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 5);
    const scream = toHand(game, "Resounding Scream");
    const before = hand(game, B).length;
    pickTargets(a, B);
    cycle(game, scream);
    expect(hand(game, B).length).toBe(before - 2);
  });

  it("cast, the target player discards one card at random", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Resounding Scream"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Quag Sickness", () => {
  it("gives -1/-1 for each Swamp its controller controls, live", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 4, B);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Quag Sickness"), { targets: [ref(maw)] });
    expect(pt(game, maw)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Swamp", 1);
    expect(pt(game, maw)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Bloodcrazed Goblin", () => {
  it("can attack only once an opponent has been dealt damage this turn", () => {
    const { game } = table();
    const goblin = spawn(game, "Bloodcrazed Goblin");
    expect(whyCannotAttack(game.state, game.registry, A, goblin, B)).not.toBeNull();
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(whyCannotAttack(game.state, game.registry, A, goblin, B)).toBeNull();
  });
});

describe("Hunters' Feast", () => {
  it("each chosen player gains 6 life", () => {
    const { game } = table({ players: 3 });
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Hunters' Feast"), { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(26);
    expect(life(game, B)).toBe(26);
    expect(life(game, C)).toBe(20);
  });
});

describe("Blood Tithe", () => {
  it("drains each opponent 3 and gains the total lost", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Blood Tithe"));
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(26);
  });
});

describe("Kiss of the Amesha", () => {
  it("the target player gains 7 life and draws two cards", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 5);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Kiss of the Amesha"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(27);
    expect(hand(game, B).length).toBe(before + 2);
  });
});

describe("Ember Hauler", () => {
  it("sacrifices itself to deal 2 damage to any target", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const hauler = spawn(game, "Ember Hauler");
    activate(game, hauler, 0, { targets: [ref(B)] });
    expect(zone(game, hauler)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});
