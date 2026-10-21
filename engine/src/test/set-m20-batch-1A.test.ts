/**
 * Commander 2019 and Core Set 2020 (C19, M20; B121), group A. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("Anje's Ravager", () => {
  it("attacking, discards the whole hand and draws three", () => {
    const { game, a } = table();
    const ravager = spawn(game, "Anje's Ravager");
    const kept = toHand(game, "Shock");
    attack(game, a, [ravager]);
    expect(zone(game, kept)).toBe("graveyard");
    expect(hand(game, A).length).toBe(3);
  });
});

describe("Blood for Bones", () => {
  it("returns one creature card to the battlefield, then another to hand", () => {
    const { game, a } = table();
    const serra = toGraveyard(game, "Serra Angel");
    const air = toGraveyard(game, "Air Elemental");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    a.chooseFromZoneFn = (_view, eligible) => [eligible.includes(serra) ? serra : air];
    cast(game, toHand(game, "Blood for Bones"), { sacrifice: bears });
    expect(zone(game, serra)).toBe("battlefield");
    expect(zone(game, air)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Unholy Indenture", () => {
  it("returns the enchanted creature under your control with a +1/+1 counter", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Unholy Indenture"), { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Yarok's Fenlurker", () => {
  it("each opponent exiles a card of their choice from their hand", () => {
    const { game, b } = table();
    const shock = toHand(game, "Shock", B);
    const before = hand(game, B).length;
    pickFromZone(b, shock);
    enter(game, "Yarok's Fenlurker");
    expect(zone(game, shock)).toBe("exile");
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Thunderkin Awakener", () => {
  it("returns an Elemental with lesser toughness tapped and attacking, sacrificed at end step", () => {
    const { game, a } = table();
    const awakener = spawn(game, "Thunderkin Awakener");
    const spark = toGraveyard(game, "Spark Elemental");
    const air = toGraveyard(game, "Air Elemental");
    toGraveyard(game, "Grizzly Bears");
    // Spark Elemental (toughness 1) is the only legal target — the 4/4 and the
    // non-Elemental aren't — so it's chosen without asking.
    const seen = watchTargets(a, () => [spark]);
    attack(game, a, [awakener]);
    expect(seen.asked).toBe(0);
    expect(zone(game, spark)).toBe("battlefield");
    expect(zone(game, air)).toBe("graveyard");
    expect(life(game, B)).toBe(20 - 1 - 3);
    nextTurn(game);
    expect(zone(game, spark)).toBe("graveyard");
  });

  it("can't return an Elemental whose toughness isn't less than its own", () => {
    const { game, a } = table();
    const awakener = spawn(game, "Thunderkin Awakener");
    const air = toGraveyard(game, "Air Elemental");
    attack(game, a, [awakener]);
    expect(zone(game, air)).toBe("graveyard");
  });
});

describe("Overgrowth Elemental", () => {
  it("gains 1 life per other creature dying, and a counter only for an Elemental", () => {
    const { game } = table();
    const crasher = spawn(game, "Thicket Crasher");
    const bears = spawn(game, "Grizzly Bears");
    // The only other Elemental is the only legal target, so it's chosen unasked.
    const overgrowth = enter(game, "Overgrowth Elemental");
    expect(counters(game, crasher)).toBe(1);
    expect(counters(game, bears)).toBe(0);
    expect(keywords(game, overgrowth).has("trample")).toBe(true);
    destroy(game, bears);
    expect(life(game, A)).toBe(21);
    expect(counters(game, overgrowth)).toBe(0);
    destroy(game, crasher);
    expect(life(game, A)).toBe(22);
    expect(counters(game, overgrowth)).toBe(1);
  });
});

describe("Chandra's Flame Wave", () => {
  it("deals 2 to the target player and each creature they control, not yours", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const air = spawn(game, "Air Elemental", B);
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 5);
    pickModes(a, 2);
    cast(game, toHand(game, "Chandra's Flame Wave"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, air)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Squad Captain", () => {
  it("enters with a counter for each other creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const captain = enter(game, "Squad Captain");
    expect(counters(game, captain)).toBe(2);
  });
});

describe("Captivating Gyre", () => {
  it("returns three target creatures together", () => {
    const { game } = table();
    const ids: ObjectId[] = [spawn(game, "Grizzly Bears", B), spawn(game, "Air Elemental", B), spawn(game, "Serra Angel")];
    lands(game, "Island", 6);
    cast(game, toHand(game, "Captivating Gyre"), { targets: ids.map(ref) });
    for (const id of ids) expect(zone(game, id)).toBe("hand");
  });
});

describe("Ogre Siegebreaker", () => {
  it("can target only a creature dealt damage this turn", () => {
    const { game } = table();
    const ogre = spawn(game, "Ogre Siegebreaker");
    const hurt = spawn(game, "Air Elemental", B);
    const fresh = spawn(game, "Serra Angel", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(hurt)] });
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const activation = (target: ObjectId) =>
      ({ type: "activate-ability", player: A, source: ogre, abilityIndex: 0, targets: [ref(target)] }) as const;
    expect(game.canDispatch(activation(fresh))).not.toBeNull();
    activate(game, ogre, 0, { targets: [ref(hurt)] });
    expect(zone(game, hurt)).toBe("graveyard");
    expect(zone(game, fresh)).toBe("battlefield");
  });
});

describe("Devout Decree", () => {
  it("can target only a black or red creature or planeswalker", () => {
    const { game } = table();
    const spark = spawn(game, "Spark Elemental", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const decree = toHand(game, "Devout Decree");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: decree, targets: [ref(bears)] })).not.toBeNull();
    cast(game, decree, { targets: [ref(spark)] });
    expect(zone(game, spark)).toBe("exile");
  });
});

describe("Gruesome Scourger", () => {
  it("deals damage equal to the creatures you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    enter(game, "Gruesome Scourger");
    expect(life(game, B)).toBe(17);
  });
});

describe("Aerial Assault", () => {
  it("destroys a tapped creature and gains 1 life per flier you control", () => {
    const { game } = table();
    spawn(game, "Serra Angel");
    spawn(game, "Air Elemental");
    spawn(game, "Grizzly Bears");
    const tapped = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Aerial Assault"), { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
    expect(graveyard(game, B)).toContain(tapped);
  });
});
