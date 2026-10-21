/**
 * Legends (LEG; B132), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  nextTurn,
  zone,
} from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;
const attackOffer = (game: Game, p: PlayerId): AttackOffer => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers");
  const offer = game.legalActions(p).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error("no attack offer");
  return offer;
};

const colorsOf = (game: Game, id: ObjectId): readonly string[] => [
  ...computeCharacteristics(game.state, game.registry, id).colors,
];

describe("The Tabernacle at Pendrell Vale", () => {
  it("gives each creature its controller's upkeep destroy-unless-pay-{1} trigger", () => {
    const { game, a, b } = table();
    spawn(game, "The Tabernacle at Pendrell Vale");
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1, A);
    pickModes(a, 0); // alice pays
    pickModes(b); // bob doesn't
    nextTurn(game, "draw"); // bob's upkeep
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    toStep(game, "draw"); // alice's upkeep: she pays {1}
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Urborg", () => {
  it("makes the target lose the keyword chosen as the ability resolves", () => {
    const { game, a } = table();
    const urborg = spawn(game, "Urborg");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "grant-keyword", target: 0, keyword: "first-strike", duration: "end-of-turn" }, [ref(bears)]);
    game.debugApplyEffect(B, { kind: "grant-keyword", target: 0, keyword: "swampwalk", duration: "end-of-turn" }, [ref(bears)]);
    pickModes(a, 1);
    activate(game, urborg, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("swampwalk")).toBe(false);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("Moat", () => {
  it("stops creatures without flying from attacking", () => {
    const { game } = table();
    spawn(game, "Moat", B);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel");
    const offer = attackOffer(game, A);
    expect(offer.eligible).toContain(angel);
    expect(offer.eligible).not.toContain(bears);
  });
});

describe("Reset", () => {
  it("is cast only on an opponent's turn after their upkeep, and untaps your lands", () => {
    const { game } = table();
    const paying = lands(game, "Island", 2);
    const tapped = [spawn(game, "Island", A, { tapped: true }), spawn(game, "Island", A, { tapped: true })];
    const reset = toHand(game, "Reset");
    expect(() => cast(game, reset)).toThrow(); // alice's own turn
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(() => cast(game, reset, { settle: false })).toThrow(); // bob's upkeep
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "draw" && s.priority.holder === A);
    cast(game, reset);
    for (const id of [...paying, ...tapped]) expect(game.state.objects[id].tapped).toBe(false);
  });
});

describe("Touch of Darkness", () => {
  it("turns each of several target creatures black", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Touch of Darkness"), { targets: [ref(one), ref(two)] });
    expect(colorsOf(game, one)).toEqual(["B"]);
    expect(colorsOf(game, two)).toEqual(["B"]);
  });
});

describe("Angus Mackenzie", () => {
  it("prevents the turn's combat damage, activated only before the combat damage step", () => {
    const { game, a } = table();
    const angus = spawn(game, "Angus Mackenzie");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    activate(game, angus, 0);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
    // Postcombat main is after the combat damage step.
    nextTurn(game);
    nextTurn(game);
    toStep(game, "postcombat-main");
    expect(() => activate(game, angus, 0)).toThrow();
  });
});

describe("Storm Seeker", () => {
  it("deals damage equal to the cards in the target player's hand", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const before = life(game, B);
    const cards = game.state.zones.perPlayer[B].hand.length;
    cast(game, toHand(game, "Storm Seeker"), { targets: [ref(B)] });
    expect(cards).toBeGreaterThan(0);
    expect(life(game, B)).toBe(before - cards);
  });
});

describe("Kobold Drill Sergeant", () => {
  it("gives other Kobolds you control +0/+1 and trample", () => {
    const { game } = table();
    const sergeant = spawn(game, "Kobold Drill Sergeant");
    const taskmaster = spawn(game, "Kobold Taskmaster");
    expect(pt(game, taskmaster).toughness).toBe(3);
    expect(keywords(game, taskmaster).has("trample")).toBe(true);
    expect(keywords(game, sergeant).has("trample")).toBe(false);
  });
});

describe("Bronze Horse", () => {
  it("prevents damage from a spell that targets it while you control another creature", () => {
    const { game, b } = table();
    const horse = spawn(game, "Bronze Horse");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2, B);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "precombat-main" && s.priority.holder === B);
    pickTargets(b, horse);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(horse)] });
    expect(game.state.objects[horse].damageMarked).toBe(0);
    // Without another creature, the spell's damage gets through.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(horse)] });
    expect(game.state.objects[horse].damageMarked).toBe(2);
  });
});

describe("Blight", () => {
  it("destroys the enchanted land when it becomes tapped", () => {
    const { game } = table();
    const land = spawn(game, "Forest", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Blight"), { targets: [ref(land)] });
    expect(zone(game, land)).toBe("battlefield");
    game.debugApplyEffect(B, { kind: "tap", target: 0 }, [ref(land)]);
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
  });
});

describe("Rohgahh of Kher Keep", () => {
  it("unpaid, taps itself and every Kobolds of Kher Keep and an opponent gains control of them", () => {
    const { game, a } = table();
    const rohgahh = spawn(game, "Rohgahh of Kher Keep");
    const mine = spawn(game, "Kobolds of Kher Keep", A);
    const theirs = spawn(game, "Kobolds of Kher Keep", B);
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 1 });
    pickModes(a); // decline to pay
    nextTurn(game); // bob's turn
    toStep(game, "draw"); // alice's upkeep has resolved
    for (const id of [rohgahh, mine, theirs]) {
      expect(controller(game, id)).toBe(B);
      expect(game.state.objects[id].tapped).toBe(true);
    }
  });
});
