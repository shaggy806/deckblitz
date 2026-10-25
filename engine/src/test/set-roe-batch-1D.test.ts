/**
 * Rise of the Eldrazi, batch 1 group D: the clauses most likely to be wrong —
 * level-banded activated abilities, the conditional token count, "that many"
 * after a mass sacrifice, Thought Gorger's "if you do", the Aura movers.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
} from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const level = (game: Game, id: ObjectId, n: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "level", amount: n }, [ref(id)]);

describe("Rise of the Eldrazi — group D", () => {
  it("Brood Birthing: one Spawn without an Eldrazi Spawn, three with one", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Brood Birthing"));
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(1);
    cast(game, toHand(game, "Brood Birthing"));
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(4);
  });

  it("Hellion Eruption: a Hellion for each creature sacrificed, tokens included", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Eldrazi Spawn Token", count: 3 }, []);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hellion Eruption"));
    expect(tokensNamed(game, "Eldrazi Spawn Token", A)).toBe(0);
    expect(tokensNamed(game, "Hellion Token", A)).toBe(5);
    expect(tokensNamed(game, "Hellion Token", B)).toBe(0);
  });

  it("Thought Gorger: a counter per card in hand, the hand discarded, and a card per counter as it leaves", () => {
    const { game } = table();
    const before = hand(game).length;
    expect(before).toBeGreaterThan(0);
    const gorger = enter(game, "Thought Gorger");
    expect(counters(game, gorger)).toBe(before);
    expect(hand(game)).toHaveLength(0);
    destroy(game, gorger);
    settle(game);
    expect(hand(game)).toHaveLength(before);
  });

  it("Echo Mage: no copy below level 2; at level 2 copies a spell once", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const mage = spawn(game, "Echo Mage");
    level(game, mage, 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(() => activate(game, mage, 1, { targets: [ref(bolt)], settle: false })).toThrow();
    level(game, mage, 1);
    expect(pt(game, mage)).toEqual({ power: 2, toughness: 4 });
    activate(game, mage, 1, { targets: [ref(bolt)] });
    expect(life(game, B)).toBe(14);
  });

  it("Kargan Dragonlord: 8/8 flying trample at level 8, and only then pumps", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const lord = spawn(game, "Kargan Dragonlord");
    level(game, lord, 7);
    expect(pt(game, lord)).toEqual({ power: 4, toughness: 4 });
    expect(() => activate(game, lord, 1)).toThrow();
    level(game, lord, 1);
    expect(keywords(game, lord).has("trample")).toBe(true);
    activate(game, lord, 1);
    expect(pt(game, lord)).toEqual({ power: 9, toughness: 8 });
  });

  it("Brimstone Mage: 1 damage at level 1-2, 3 at level 3+", () => {
    const { game } = table();
    const mage = spawn(game, "Brimstone Mage");
    expect(() => activate(game, mage, 1, { targets: [ref(B)] })).toThrow();
    level(game, mage, 3);
    expect(() => activate(game, mage, 1, { targets: [ref(B)] })).toThrow();
    activate(game, mage, 2, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
  });

  it("Near-Death Experience: wins at exactly 1 life in your upkeep", () => {
    const { game } = table();
    spawn(game, "Near-Death Experience");
    game.state.players[A].life = 1;
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("Lust for War: 3 damage to the enchanted creature's controller when it becomes tapped", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lust for War"), { targets: [ref(bear)] });
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(bear)]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("Felidar Umbra and Aura Finesse move an Aura, and Finesse draws", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 1);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const three = spawn(game, "Grizzly Bears", B);
    const umbra = toHand(game, "Felidar Umbra");
    cast(game, umbra, { targets: [ref(one)] });
    expect(keywords(game, one).has("lifelink")).toBe(true);
    activate(game, umbra, 0, { targets: [ref(two)] });
    expect(game.state.objects[umbra].attachedTo).toBe(two);
    expect(keywords(game, one).has("lifelink")).toBe(false);
    const before = hand(game).length;
    cast(game, toHand(game, "Aura Finesse"), { targets: [ref(umbra), ref(three)] });
    expect(game.state.objects[umbra].attachedTo).toBe(three);
    expect(game.state.objects[umbra].controller).toBe(A);
    expect(keywords(game, three).has("lifelink")).toBe(true);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("Aura Gnarlid: +1/+1 for each Aura on the battlefield, either side's", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const gnarlid = spawn(game, "Aura Gnarlid");
    const bear = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lust for War"), { targets: [ref(bear)] });
    expect(pt(game, gnarlid)).toEqual({ power: 3, toughness: 3 });
  });
});
