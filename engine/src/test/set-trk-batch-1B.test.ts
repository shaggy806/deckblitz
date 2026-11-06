/**
 * Star Trek (TRK) — group B of the preview-card walk: Borg artifact
 * creatures, Spacecraft, counter doublers, quest-counter missions and the
 * crew of several ships.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
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

describe("Quark, Humble Proprietor", () => {
  it("keeps your Treasures from being sacrificed, and makes one at each upkeep", () => {
    const { game } = table();
    spawn(game, "Quark, Humble Proprietor");
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    const treasure = named(game, "Treasure Token", A)[0];
    try {
      game.dispatch({ type: "activate-ability", player: A, source: treasure, abilityIndex: 0, targets: [] });
    } catch {
      // Refused outright is as good as unpayable.
    }
    settle(game);
    expect(zone(game, treasure)).toBe("battlefield");
    const before = tokensNamed(game, "Treasure Token", A);
    nextTurn(game);
    // Bob's upkeep makes one for Quark's controller.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", B)).toBe(0);
  });
});

describe("Dr. Joseph M'Benga", () => {
  it("doubles counters you put on your creatures only, and shields the others that have one", () => {
    const { game } = table();
    const mbenga = spawn(game, "Dr. Joseph M'Benga");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const put = (id: ObjectId): void => {
      game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(id)]);
      settle(game);
    };
    put(mine);
    put(theirs);
    put(mbenga);
    expect(counters(game, mine)).toBe(2);
    expect(counters(game, theirs)).toBe(1);
    expect(counters(game, mbenga)).toBe(2);
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    expect(keywords(game, mbenga).has("hexproof")).toBe(false);
  });
});

describe("Lt. Cmdr. Geordi La Forge and Warp Core", () => {
  it("doubles the charge counters Warp Core puts on a Spacecraft", () => {
    const { game } = table();
    spawn(game, "Lt. Cmdr. Geordi La Forge");
    const core = spawn(game, "Warp Core");
    const ship = spawn(game, "Suurok-Class Science Vessel");
    lands(game, "Wastes", 1);
    activate(game, core, 0, { targets: [ref(ship)] });
    expect(counters(game, ship, "charge")).toBe(4);
    // Not yet 5+.
    expect(types(game, ship)).not.toContain("creature");
  });
});

describe("D-7 Battle Cruiser", () => {
  it("at 3+ makes a hasty Klingon Warrior each combat, sacrificed at end step", () => {
    const { game } = table();
    const cruiser = spawn(game, "D-7 Battle Cruiser");
    toStep(game, "begin-combat");
    settle(game);
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(0);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 3 }, [ref(cruiser)]);
    settle(game);
    toStep(game, "begin-combat");
    settle(game);
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(1);
    expect(types(game, cruiser)).not.toContain("creature");
    nextTurn(game);
    expect(tokensNamed(game, "Klingon Warrior Token", A)).toBe(0);
  });
});

describe("Brazen Bluff", () => {
  function boltOnTheStack(game: ReturnType<typeof table>["game"]): ObjectId {
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    return bolt;
  }

  it("if the spell's controller won't exile it, you may cast a noncreature spell free", () => {
    const { game, a, b } = table();
    const bolt = boltOnTheStack(game);
    lands(game, "Mountain", 2, B);
    const divination = toHand(game, "Divination", B);
    b.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === divination);
      return way === undefined
        ? null
        : { type: "cast-spell", player: B, card: divination, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    pickModes(a);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Brazen Bluff", B), { player: B, targets: [ref(bolt)] });
    expect(zone(game, divination)).toBe("graveyard");
    // Brazen Bluff left the hand; Divination left it and drew two.
    expect(hand(game, B).length).toBe(before - 1 + 2);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("if they exile it, there's no free spell", () => {
    const { game, a, b } = table();
    const bolt = boltOnTheStack(game);
    lands(game, "Mountain", 2, B);
    const divination = toHand(game, "Divination", B);
    let offered = false;
    b.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    pickModes(a, 0);
    cast(game, toHand(game, "Brazen Bluff", B), { player: B, targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(offered).toBe(false);
    expect(zone(game, divination)).toBe("hand");
    expect(life(game, B)).toBe(20);
  });
});

describe("The Wrath of Khan", () => {
  it("chapter I deals 4, then takes the creature at the next combat until end of turn", () => {
    const { game, a } = table();
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B, { tapped: true });
    pickTargets(a, dreadmaw);
    enter(game, "The Wrath of Khan");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(4);
    expect(controller(game, dreadmaw)).toBe(B);
    toStep(game, "begin-combat");
    settle(game);
    expect(controller(game, dreadmaw)).toBe(A);
    expect(game.state.objects[dreadmaw].tapped).toBe(false);
    expect(keywords(game, dreadmaw).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, dreadmaw)).toBe(B);
  });
});

describe("Conquest Mission", () => {
  it("makes a Borg per nontoken artifact, two from six quest counters", () => {
    const { game } = table();
    const mission = spawn(game, "Conquest Mission");
    enter(game, "Ornithopter");
    expect(counters(game, mission, "quest")).toBe(1);
    expect(tokensNamed(game, "Borg Token", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "quest", amount: 4 }, [ref(mission)]);
    settle(game);
    enter(game, "Ornithopter");
    expect(counters(game, mission, "quest")).toBe(6);
    expect(tokensNamed(game, "Borg Token", A)).toBe(3);
  });
});

describe("Seven of Nine, Unassimilated", () => {
  it("draws at your first main phase and discards unless five differently named lands", () => {
    const { game } = table();
    spawn(game, "Seven of Nine, Unassimilated");
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const before = hand(game).length;
    const discardsBefore = graveyard(game).length;
    toStep(game, "precombat-main");
    settle(game);
    // Draw step + the trigger, then a discard: four names.
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(discardsBefore + 1);
    lands(game, "Forest", 1);
    const second = hand(game).length;
    toStep(game, "precombat-main");
    settle(game);
    expect(hand(game).length).toBe(second + 2);
  });

  it("becomes 7/9 only with seven differently named lands", () => {
    const { game } = table();
    const seven = spawn(game, "Seven of Nine, Unassimilated");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes"]) lands(game, land, 1);
    lands(game, "Island", 1);
    const act = { type: "activate-ability", player: A, source: seven, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch(act)).not.toBeNull();
    lands(game, "Mountain", 1, A);
    spawn(game, "Command Tower");
    activate(game, seven, 0);
    expect(pt(game, seven)).toEqual({ power: 7, toughness: 9 });
  });
});

describe("Crystalline Entity", () => {
  it("destroys nonartifact creatures only if it was cast", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    enter(game, "Crystalline Entity");
    expect(zone(game, bears)).toBe("battlefield");
    lands(game, "Wastes", 8);
    cast(game, toHand(game, "Crystalline Entity"));
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("battlefield");
    expect(named(game, "Crystalline Entity").length).toBe(2);
  });
});

describe("Dathon, His Heart Open", () => {
  it("draws on an enchantment spell, and a Saga deals 2 to each opponent", () => {
    const { game } = table();
    spawn(game, "Dathon, His Heart Open");
    lands(game, "Mountain", 3);
    const saga = toHand(game, "The Wrath of Khan");
    const before = hand(game).length;
    cast(game, saga);
    expect(hand(game).length).toBe(before - 1 + 1);
    expect(life(game, B)).toBe(18);
  });
});

describe("Collective Drone", () => {
  it("counts the artifact creatures you control", () => {
    const { game } = table();
    const drone = spawn(game, "Collective Drone");
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    expect(pt(game, drone)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Nyota Uhura, Communications", () => {
  it("draws when an opponent casts a spell of the chosen mana value, 0 included", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "0";
    lands(game, "Island", 3);
    cast(game, toHand(game, "Nyota Uhura, Communications"));
    expect(game.state.objects[named(game, "Nyota Uhura, Communications")[0]].chosenOnEnter).toBe("0");
    nextTurn(game);
    const before = hand(game).length;
    cast(game, toHand(game, "Ornithopter", B), { player: B });
    expect(hand(game).length).toBe(before + 1);
  });
});
