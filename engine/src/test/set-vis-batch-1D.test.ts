/** Batch 172, group D (Visions): Bogardan Phoenix's death-counter branch,
 * Lichenthrope's damage-to-counters replacement, Goblin Swine-Rider's
 * blocked sweep, Waterspout Djinn's Island upkeep, Stampeding Wildebeests'
 * self-return, the Chimeras' lasting grant, Mortal Wound and Hope Charm. */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Bogardan Phoenix", () => {
  it("returns with a death counter, then is exiled the next time it dies", () => {
    const { game } = table();
    destroy(game, spawn(game, "Bogardan Phoenix"));
    const back = named(game, "Bogardan Phoenix", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "death")).toBe(1);
    destroy(game, back[0]);
    expect(named(game, "Bogardan Phoenix")).toHaveLength(0);
    const exiled = Object.values(game.state.objects).filter(
      (o) => o.cardName === "Bogardan Phoenix" && o.zone === "exile",
    );
    expect(exiled).toHaveLength(1);
  });
});

describe("Lichenthrope", () => {
  it("gets -1/-1 counters instead of damage, and sheds one each upkeep", () => {
    const { game } = table();
    const lichen = spawn(game, "Lichenthrope");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(lichen)]);
    settle(game);
    expect(counters(game, lichen, "-1/-1")).toBe(3);
    expect(pt(game, lichen)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[lichen].damageMarked).toBe(0);
    toStep(game, "precombat-main");
    expect(counters(game, lichen, "-1/-1")).toBe(2);
  });
});

describe("Goblin Swine-Rider", () => {
  it("deals 2 to each attacking and each blocking creature when blocked", () => {
    const { game, a, b } = table();
    const rider = spawn(game, "Goblin Swine-Rider");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const bystander = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: rider }];
    attack(game, a, [rider, giant]);
    expect(zone(game, rider)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bystander)).toBe("battlefield");
    expect(game.state.objects[bystander].damageMarked).toBe(0);
  });
});

describe("Waterspout Djinn", () => {
  it("returns an untapped Island to stay", () => {
    const { game, a } = table();
    const djinn = spawn(game, "Waterspout Djinn");
    const island = spawn(game, "Island");
    pickModes(a, 0);
    pickPermanents(a, island);
    toStep(game, "precombat-main");
    expect(zone(game, djinn)).toBe("battlefield");
    expect(zone(game, island)).toBe("hand");
  });

  it("is sacrificed with no Island to return", () => {
    const { game } = table();
    const djinn = spawn(game, "Waterspout Djinn");
    const forest = spawn(game, "Forest");
    toStep(game, "precombat-main");
    expect(zone(game, djinn)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
  });
});

describe("Stampeding Wildebeests", () => {
  it("returns itself with no other green creature", () => {
    const { game } = table();
    const beasts = spawn(game, "Stampeding Wildebeests");
    const giant = spawn(game, "Hill Giant");
    toStep(game, "precombat-main");
    expect(hand(game)).toContain(beasts);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Iron-Heart Chimera", () => {
  it("puts a +2/+2 counter on a Chimera, which keeps vigilance", () => {
    const { game } = table();
    const iron = spawn(game, "Iron-Heart Chimera");
    const lead = spawn(game, "Lead-Belly Chimera");
    activate(game, iron, 0, { targets: [ref(lead)] });
    expect(graveyard(game)).toContain(iron);
    expect(pt(game, lead)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    nextTurn(game);
    expect(keywords(game, lead).has("vigilance")).toBe(true);
    expect(keywords(game, lead).has("trample")).toBe(true);
  });

  it("can't target a non-Chimera", () => {
    const { game } = table();
    const iron = spawn(game, "Iron-Heart Chimera");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, iron, 0, { targets: [ref(bears)] })).toThrow();
  });
});

describe("Mortal Wound and Hope Charm", () => {
  it("Mortal Wound destroys the enchanted creature when it's dealt damage", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Mortal Wound"), { targets: [ref(giant)] });
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("Hope Charm destroys target Aura", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const giant = spawn(game, "Hill Giant", B);
    const wound = toHand(game, "Mortal Wound");
    cast(game, wound, { targets: [ref(giant)] });
    cast(game, toHand(game, "Hope Charm"), { modes: [2], targets: [ref(wound)] });
    expect(zone(game, wound)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });
});
