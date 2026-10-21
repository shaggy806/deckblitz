/**
 * Commander 2018 + Core Set 2019, group B: the clause of each card most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  keywords,
  lands,
  life,
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Nylea's Colossus", () => {
  it("doubles a creature's power and toughness as it enters and as another enchantment enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Nylea's Colossus");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    enter(game, "Eidolon of Blossoms");
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
  });
});

describe("Gyrus, Waker of Corpses", () => {
  it("offers only creature cards with lesser power, and the attacking token is exiled at end of combat", () => {
    const { game, a } = table();
    const gyrus = spawn(game, "Gyrus, Waker of Corpses");
    game.state.objects[gyrus].counters["+1/+1"] = 3;
    const bears = toGraveyard(game, "Grizzly Bears");
    const ogre = toGraveyard(game, "Gray Ogre");
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, (offered) => offered.map(() => bears));
    pickModes(a, 0);
    attack(game, a, [gyrus]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, ogre]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 3 - 2);
    expect(tokensNamed(game, "Grizzly Bears")).toBe(0);
  });
});

describe("Lena, Selfless Champion", () => {
  it("makes a Soldier for each nontoken creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    enter(game, "Lena, Selfless Champion");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
  });

  it("sacrificed, gives indestructible only to creatures with power less than hers", () => {
    const { game } = table();
    const lena = spawn(game, "Lena, Selfless Champion");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    activate(game, lena, 0);
    expect(zone(game, lena)).toBe("graveyard");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, giant).has("indestructible")).toBe(false);
  });
});

describe("Liliana, the Necromancer", () => {
  it("−7 destroys a target creature, then puts creature cards from any graveyard onto the battlefield under your control", () => {
    const { game, a } = table();
    const liliana = spawn(game, "Liliana, the Necromancer");
    const giant = spawn(game, "Hill Giant", B);
    toGraveyard(game, "Craw Wurm", B);
    a.chooseFromZoneFn = (_view, eligible) =>
      eligible.filter((id) => ["Hill Giant", "Craw Wurm"].includes(game.state.objects[id].cardName));
    loyalty(game, liliana, -7, { atLeast: 7, targets: [ref(giant)] });
    expect(named(game, "Hill Giant", A)).toHaveLength(1);
    expect(named(game, "Craw Wurm", A)).toHaveLength(1);
    expect(named(game, "Hill Giant", B)).toHaveLength(0);
  });
});

describe("Ajani, Adversary of Tyrants", () => {
  it("−7's emblem makes three lifelink Cats at your end step", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Adversary of Tyrants");
    loyalty(game, ajani, -7, { atLeast: 7 });
    toStep(game, "end");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null);
    expect(tokensNamed(game, "Lifelink Cat Token", A)).toBe(3);
  });
});

describe("Dwindle", () => {
  it("destroys the enchanted creature when it blocks, and the attacker stays blocked", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const blocker = spawn(game, "Craw Wurm", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Dwindle"), { targets: [ref(blocker)] });
    expect(pt(game, blocker).power).toBe(0);
    b.declareBlockersFn = () => [{ blocker, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, blocker)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Nightmare's Thirst", () => {
  it("gives -X/-X for all the life you gained this turn, its own 1 included", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "gain-life", amount: 2 }, []);
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Nightmare's Thirst"), { targets: [ref(wurm)] });
    expect(life(game)).toBe(23);
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Isolate", () => {
  it("exiles only a permanent with mana value 1", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter", B);
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Plains", 1);
    const isolate = toHand(game, "Isolate");
    const at = (target: typeof ring): Action => ({ type: "cast-spell", player: A, card: isolate, targets: [ref(target)] });
    expect(game.canDispatch(at(thopter))).not.toBeNull();
    cast(game, isolate, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("exile");
  });
});

describe("Liliana's Spoils", () => {
  it("offers only a black card from the top five", () => {
    const { game, a } = table();
    const murder = toLibrary(game, "Murder");
    const bears = toLibrary(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    const seen = pickFromZone(a, murder);
    cast(game, toHand(game, "Liliana's Spoils"), { targets: [ref(B)] });
    expect(seen.offered).toContain(murder);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, murder)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Echo Storm", () => {
  it("creates a token copy of the target artifact", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Island", 5);
    cast(game, toHand(game, "Echo Storm"), { targets: [ref(ring)] });
    expect(tokensNamed(game, "Sol Ring", A)).toBe(1);
  });
});
