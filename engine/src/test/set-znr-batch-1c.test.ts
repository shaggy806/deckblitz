/**
 * Zendikar Rising and its Commander decks (ZNR, ZNC; B114) — group c: party, kicker and
 * landfall cards.
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
  hand,
  keywords,
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
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Trove Warden", () => {
  it("landfall exiles a small permanent card; when it dies, that card comes back", () => {
    const { game, a } = table();
    const warden = spawn(game, "Trove Warden");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Wastes");
    expect(zone(game, bears)).toBe("exile");
    destroy(game, warden);
    expect(zone(game, warden)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("Orah, Skyclave Hierophant", () => {
  it("when Orah dies, returns a Cleric card with lesser mana value", () => {
    const { game, a } = table();
    const orah = spawn(game, "Orah, Skyclave Hierophant");
    const matron = toGraveyard(game, "Abbey Matron"); // mana value 3, a Cleric
    pickTargets(a, matron);
    destroy(game, orah);
    expect(zone(game, matron)).toBe("battlefield");
  });
});

describe("Sea Gate Stormcaller", () => {
  it("kicked, copies the next cheap instant twice", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Wastes", 5);
    lands(game, "Mountain", 1);
    const caller = toHand(game, "Sea Gate Stormcaller");
    cast(game, caller, { kicked: true });
    expect(zone(game, caller)).toBe("battlefield");
    pickTargets(a, B);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });

  it("unkicked, copies it once", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Sea Gate Stormcaller"));
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Tazri, Beacon of Unity", () => {
  it("pays the {2/C} pips with generic, and offers only party-type cards", () => {
    const { game, a } = table();
    const tazri = spawn(game, "Tazri, Beacon of Unity");
    lands(game, "Wastes", 8);
    const bears = toLibrary(game, "Grizzly Bears");
    const matron = toLibrary(game, "Abbey Matron");
    const raider = toLibrary(game, "Academy Raider");
    const seen = pickFromZone(a, matron, raider);
    activate(game, tazri, 0);
    expect(seen.offered).toContain(matron);
    expect(seen.offered).toContain(raider);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, matron)).toBe("hand");
    expect(zone(game, raider)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
  });
});

describe("Windrider Wizard", () => {
  it("loots off a Wizard creature spell", () => {
    const { game, a } = table();
    spawn(game, "Windrider Wizard");
    lands(game, "Island", 2);
    const caller = toHand(game, "Sea Gate Stormcaller"); // a Human Wizard
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, caller);
    expect(hand(game).length).toBe(before - 1);
    expect(game.state.zones.perPlayer[A].graveyard.length).toBe(1);
  });
});

describe("The Destined White Mage", () => {
  it("puts one counter without a full party, three with one", () => {
    const { game, a } = table();
    spawn(game, "The Destined White Mage");
    const raider = spawn(game, "Academy Raider");
    pickTargets(a, raider);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(counters(game, raider)).toBe(1);
    spawn(game, "Aetherblade Agent");
    spawn(game, "Aether Adept");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    settle(game);
    expect(counters(game, raider)).toBe(4);
  });
});

describe("Allied Assault", () => {
  it("gives up to two creatures +X/+X for the party", () => {
    const { game } = table();
    spawn(game, "Abbey Matron");
    spawn(game, "Academy Raider");
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Allied Assault"), { targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, two)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Shepherd of Heroes", () => {
  it("gains 2 life per party creature, itself included", () => {
    const { game } = table();
    spawn(game, "Academy Raider");
    enter(game, "Shepherd of Heroes");
    expect(life(game, A)).toBe(24);
  });
});

describe("Skyclave Sentinel", () => {
  it("kicked, enters with two counters and can attack despite defender", () => {
    const { game, a } = table();
    lands(game, "Wastes", 7);
    const sentinel = toHand(game, "Skyclave Sentinel");
    cast(game, sentinel, { kicked: true });
    expect(counters(game, sentinel)).toBe(2);
    toStep(game, "precombat-main");
    attack(game, a, [sentinel]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Hagra Constrictor", () => {
  it("gives menace to creatures with +1/+1 counters", () => {
    const { game } = table();
    const snake = enter(game, "Hagra Constrictor");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, snake).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});
