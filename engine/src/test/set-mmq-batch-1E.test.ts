/**
 * Urza's Destiny's rest, Starter 1999 and Mercadian Masques (B227), group E.
 * One test per card whose behaviour is more than a stat line, on the clause
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  enter,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Cinder Seer", () => {
  it("deals damage equal to the number of red cards revealed", () => {
    const { game, a } = table();
    const seer = spawn(game, "Cinder Seer");
    lands(game, "Mountain", 3);
    const bolt = toHand(game, "Lightning Bolt");
    const shock = toHand(game, "Shock");
    pickTargets(a, B);
    pickFromZone(a, bolt, shock);
    activate(game, seer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Lurking Jackals", () => {
  it("becomes a 3/2 Jackal creature once an opponent is at 10 or less life", () => {
    const { game } = table();
    const jackals = spawn(game, "Lurking Jackals");
    game.debugApplyEffect(A, { kind: "lose-life", amount: 10, target: 0 }, [ref(B)]);
    toStep(game, "postcombat-main");
    expect(types(game, jackals)).toEqual(["creature"]);
    expect(pt(game, jackals)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Monkey Cage", () => {
  it("is sacrificed for Monkeys equal to the entering creature's mana value", () => {
    const { game } = table();
    const cage = spawn(game, "Monkey Cage");
    enter(game, "Grizzly Bears", B);
    expect(zone(game, cage)).toBe("graveyard");
    expect(tokensNamed(game, "Monkey Token", A)).toBe(2);
  });
});

describe("Hunted Wumpus", () => {
  it("lets an opponent put a creature card from their hand onto the battlefield", () => {
    const { game, b } = table();
    const bears = toHand(game, "Grizzly Bears", B);
    pickModes(b, 0);
    pickFromZone(b, bears);
    enter(game, "Hunted Wumpus");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Rishadan Footpad", () => {
  it("makes an opponent who can't pay sacrifice a permanent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Rishadan Footpad");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("spares an opponent who pays {2}", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2, B);
    pickModes(b, 0);
    enter(game, "Rishadan Footpad");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Cowardice", () => {
  it("returns a creature to its owner's hand when it becomes a target", () => {
    const { game, a } = table();
    spawn(game, "Cowardice");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Pangosaur", () => {
  it("returns to its owner's hand when a player plays a land", () => {
    const { game } = table();
    const pangosaur = spawn(game, "Pangosaur");
    const forest = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, pangosaur)).toBe("hand");
  });
});

describe("Spontaneous Generation", () => {
  it("creates a Saproling for each card left in your hand", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const spell = toHand(game, "Spontaneous Generation");
    const inHand = hand(game).length - 1;
    cast(game, spell);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(inHand);
  });
});

describe("Last Breath", () => {
  it("exiles the creature and its controller gains 4 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Last Breath"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(24);
    expect(life(game, A)).toBe(20);
  });
});
