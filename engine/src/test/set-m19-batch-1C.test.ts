/**
 * Commander 2018 and Core Set 2019, group C: the clause of each card most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("Isareth the Awakener", () => {
  it("returns only a creature card with mana value X, with a corpse counter, exiled if it would leave", () => {
    const { game, a } = table();
    const isareth = spawn(game, "Isareth the Awakener");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const sable = toGraveyard(game, "Bronze Sable");
    lands(game, "Swamp", 2);
    a.declareAttackersFn = () => [{ attacker: isareth, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    const seen = watchTargets(a, () => [bears]);
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(sable);
    expect(seen.offered[0]).not.toContain(giant);
    const back = named(game, "Grizzly Bears", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "corpse")).toBe(1);
    destroy(game, back[0]);
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(false);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Turntimber Sower", () => {
  it("makes one Plant for several lands put into your graveyard at once", () => {
    const { game } = table();
    spawn(game, "Turntimber Sower");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Tome Scour"), { targets: [ref(A)] });
    expect(tokensNamed(game, "Plant Token", A)).toBe(1);
  });

  it("sacrifices three creatures, itself among them, to return a land card", () => {
    const { game } = table();
    const sower = spawn(game, "Turntimber Sower");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    const forest = toGraveyard(game, "Forest");
    activate(game, sower, 0, { targets: [ref(forest)] });
    expect(hand(game)).toContain(forest);
    expect(zone(game, sower)).toBe("graveyard");
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Genesis Storm", () => {
  it("puts the nonland permanent card found onto the battlefield, the rest on the bottom", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const wastes = toLibrary(game, "Wastes");
    lands(game, "Forest", 6);
    pickModes(a, 0);
    cast(game, toHand(game, "Genesis Storm"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(game.state.zones.perPlayer[A].library.at(-1)).toBe(wastes);
    void bears;
  });

  it("declined, puts the card found on the bottom with the rest", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    lands(game, "Forest", 6);
    pickModes(a);
    cast(game, toHand(game, "Genesis Storm"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(game.state.zones.perPlayer[A].library.slice(-2)).toContain(bears);
  });
});

describe("Bone Dragon", () => {
  it("returns tapped from the graveyard by exiling seven other cards, and needs seven", () => {
    const { game } = table();
    const dragon = toGraveyard(game, "Bone Dragon");
    const others = Array.from({ length: 6 }, () => toGraveyard(game, "Wastes"));
    lands(game, "Swamp", 5);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: dragon, abilityIndex: 0, targets: [] })).not.toBeNull();
    others.push(toGraveyard(game, "Wastes"));
    activate(game, dragon, 0);
    expect(zone(game, dragon)).toBe("battlefield");
    expect(game.state.objects[dragon].tapped).toBe(true);
    for (const id of others) expect(zone(game, id)).toBe("exile");
  });
});

describe("Transmogrifying Wand", () => {
  it("destroys a creature and gives its controller a 2/4 Ox, spending a charge counter", () => {
    const { game } = table();
    const wand = enter(game, "Transmogrifying Wand");
    expect(counters(game, wand, "charge")).toBe(3);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    activate(game, wand, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Ox Token (Ox Drover)", B)).toBe(1);
    expect(tokensNamed(game, "Ox Token (Ox Drover)", A)).toBe(0);
    expect(pt(game, named(game, "Ox Token (Ox Drover)", B)[0])).toEqual({ power: 2, toughness: 4 });
    expect(counters(game, wand, "charge")).toBe(2);
  });
});

describe("Sigiled Sword of Valeron", () => {
  it("makes the equipped creature a 4/2 vigilant Knight, and its attack brings an attacking Knight", () => {
    const { game, a } = table();
    const sword = spawn(game, "Sigiled Sword of Valeron");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(subtypes(game, bears)).toContain("Knight");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Knight Token", A)).toBe(1);
    expect(life(game, B)).toBe(14);
  });
});

describe("Infernal Reckoning", () => {
  it("exiles only a colorless creature, and you gain life equal to its power", () => {
    const { game } = table();
    const sable = spawn(game, "Bronze Sable", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    const spell = toHand(game, "Infernal Reckoning");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(bears)] })).not.toBeNull();
    cast(game, spell, { targets: [ref(sable)] });
    expect(zone(game, sable)).toBe("exile");
    expect(life(game)).toBe(22);
  });
});

describe("Regal Bloodlord and Dwarven Priest", () => {
  it("the Priest gains 1 life per creature, and the Bloodlord then makes a Bat at the end step", () => {
    const { game } = table();
    spawn(game, "Regal Bloodlord");
    enter(game, "Dwarven Priest");
    expect(life(game)).toBe(22);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Bat Token", A)).toBe(1);
  });

  it("makes no Bat on a turn you gained no life", () => {
    const { game } = table();
    spawn(game, "Regal Bloodlord");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Bat Token", A)).toBe(0);
  });
});

describe("Skyrider Patrol", () => {
  it("pays {G}{U} for a counter and flying on another creature you control", () => {
    const { game, a } = table();
    const patrol = spawn(game, "Skyrider Patrol");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Hill Giant");
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    pickModes(a, 0);
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered[0]).toContain(other);
    expect(seen.offered[0]).not.toContain(patrol);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Shield Mare", () => {
  it("gains 3 life as it enters", () => {
    const { game, a } = table();
    pickTargets(a);
    enter(game, "Shield Mare");
    expect(life(game)).toBe(23);
  });
});
