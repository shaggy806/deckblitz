/**
 * Urza's Saga (USG; B193) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  graveyard,
  hand,
  lands,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Ill-Gotten Gains", () => {
  it("each player discards their hand, then returns up to three cards from their graveyard; the spell is exiled", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const gains = toHand(game, "Ill-Gotten Gains");
    const aCards = [0, 1, 2, 3].map(() => toGraveyard(game, "Grizzly Bears", A));
    const bCards = [0, 1].map(() => toGraveyard(game, "Grizzly Bears", B));
    const aHandBefore = hand(game, A).filter((id) => id !== gains);
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toEqual(expect.arrayContaining(aCards));
      return aCards.slice(0, 3);
    };
    b.chooseFromZoneFn = () => [bCards[0]];
    cast(game, gains);
    settle(game);
    expect(zone(game, gains)).toBe("exile");
    expect([...hand(game, A)].sort()).toEqual(aCards.slice(0, 3).sort());
    expect(hand(game, B)).toEqual([bCards[0]]);
    for (const id of aHandBefore) expect(graveyard(game, A)).toContain(id);
  });
});

describe("Brand", () => {
  it("you regain control of every permanent you own", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    expect(controller(game, bears)).toBe(B);
    cast(game, toHand(game, "Brand"));
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Spreading Algae", () => {
  it("destroys the Swamp when it becomes tapped and returns to its owner's hand", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const swamp = spawn(game, "Swamp", B);
    const algae = toHand(game, "Spreading Algae");
    cast(game, algae, { targets: [ref(swamp)] });
    expect(zone(game, algae)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(swamp)]);
    settle(game);
    expect(zone(game, swamp)).toBe("graveyard");
    expect(zone(game, algae)).toBe("hand");
  });

  it("can't enchant a land that isn't a Swamp", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const forest = spawn(game, "Forest", B);
    expect(() => cast(game, toHand(game, "Spreading Algae"), { targets: [ref(forest)] })).toThrow();
  });
});

describe("Whirlwind", () => {
  it("destroys only creatures with flying", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bird = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Whirlwind"));
    expect(zone(game, bird)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Hibernation", () => {
  it("returns green permanents only", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    cast(game, toHand(game, "Hibernation"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("battlefield");
  });
});
