/**
 * Judgment (JUD; B217), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
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
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Phantom Tiger", () => {
  it("enters with two counters; damage to it is prevented and one counter is removed", () => {
    const { game } = table();
    const tiger = enter(game, "Phantom Tiger");
    expect(counters(game, tiger)).toBe(2);
    expect(pt(game, tiger)).toEqual({ power: 3, toughness: 2 });
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(tiger)]);
    settle(game);
    expect(zone(game, tiger)).toBe("battlefield");
    expect(counters(game, tiger)).toBe(1);
    expect(game.state.objects[tiger].damageMarked ?? 0).toBe(0);
  });
});

describe("Dwarven Driller", () => {
  it("the land's controller may take 2 damage to save it, or let it be destroyed", () => {
    const { game, b } = table();
    const driller = spawn(game, "Dwarven Driller");
    const [saved, lost] = lands(game, "Wastes", 2, B);
    pickModes(b, 0);
    activate(game, driller, 0, { targets: [ref(saved)] });
    expect(zone(game, saved)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
    game.state.objects[driller].tapped = false;
    pickModes(b, 1);
    activate(game, driller, 0, { targets: [ref(lost)] });
    expect(zone(game, lost)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Elephant Guide", () => {
  it("gives +3/+3, and its controller gets an Elephant when the opponent's enchanted creature dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    pickTargets(a, bears);
    cast(game, toHand(game, "Elephant Guide"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    destroy(game, bears, A);
    expect(tokensNamed(game, "Elephant Token", A)).toBe(1);
    expect(tokensNamed(game, "Elephant Token", B)).toBe(0);
  });
});

describe("Forcemage Advocate", () => {
  it("returns a card from an opponent's graveyard to their hand and puts a counter on a creature", () => {
    const { game } = table();
    const advocate = spawn(game, "Forcemage Advocate");
    const card = toGraveyard(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    activate(game, advocate, 0, { targets: [ref(card), ref(advocate)] });
    expect(zone(game, card)).toBe("hand");
    expect(hand(game, B).length).toBe(before + 1);
    expect(counters(game, advocate)).toBe(1);
  });
});

describe("Swirling Sandstorm", () => {
  it("does nothing without threshold, and hits only creatures without flying with it", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const bird = spawn(game, "Commander Eesha", B);
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Swirling Sandstorm"));
    expect(zone(game, bears)).toBe("battlefield");
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    cast(game, toHand(game, "Swirling Sandstorm"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, bird)).toBe("battlefield");
  });
});

describe("Vigilant Sentry", () => {
  it("gets +1/+1 and its pump ability only with threshold", () => {
    const { game, a } = table();
    const sentry = spawn(game, "Vigilant Sentry");
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, sentry)).toEqual({ power: 2, toughness: 2 });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && quiet(s));
    expect(() => activate(game, sentry, 0, { targets: [ref(bears)] })).toThrow();
    for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
    expect(pt(game, sentry)).toEqual({ power: 3, toughness: 3 });
    activate(game, sentry, 0, { targets: [ref(bears)], settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Ancestor's Chosen", () => {
  it("gains 1 life per card in your graveyard", () => {
    const { game } = table();
    for (let i = 0; i < 4; i++) toGraveyard(game, "Wastes");
    enter(game, "Ancestor's Chosen");
    expect(life(game, A)).toBe(24);
  });
});
