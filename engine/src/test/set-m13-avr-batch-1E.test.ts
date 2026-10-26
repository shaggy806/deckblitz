/**
 * Magic 2013 and Avacyn Restored (M13, AVR; B182), group E. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Ring of Thune", () => {
  it("gives vigilance, and a counter each upkeep only while the creature is white", () => {
    const { game } = table();
    const ring = spawn(game, "Ring of Thune");
    const lions = spawn(game, "Savannah Lions");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, ring, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, bears)).toBe(0);
    toStep(game, "precombat-main");
    activate(game, ring, 0, { targets: [ref(lions)] });
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, lions)).toBe(1);
  });
});

describe("Downpour", () => {
  it("taps three different creatures", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    lands(game, "Island", 2);
    cast(game, toHand(game, "Downpour"), { targets: bears.map(ref) });
    for (const id of bears) expect(game.state.objects[id].tapped).toBe(true);
  });
});

describe("Flames of the Firebrand", () => {
  it("divides 3 damage among three targets", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flames of the Firebrand"), {
      targets: [ref(one), ref(two), ref(B)],
      division: [1, 1, 1],
    });
    expect(game.state.objects[one].damageMarked).toBe(1);
    expect(game.state.objects[two].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Demonic Taskmaster", () => {
  it("sacrifices another creature at upkeep, never itself", () => {
    const { game } = table();
    const demon = spawn(game, "Demonic Taskmaster");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, demon)).toBe("battlefield");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, demon)).toBe("battlefield");
  });
});

describe("Sheltering Word", () => {
  it("gives hexproof and gains life equal to the creature's toughness", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Sheltering Word"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(life(game, A)).toBe(22);
  });
});

describe("Amass the Components", () => {
  it("draws three, then puts the chosen card from hand on the bottom", () => {
    const { game, a } = table();
    const keep = toHand(game, "Grizzly Bears");
    lands(game, "Island", 4);
    const before = hand(game).length;
    pickFromZone(a, keep);
    cast(game, toHand(game, "Amass the Components"));
    expect(hand(game).length).toBe(before + 2);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(keep);
  });
});

describe("Falkenrath Exterminator", () => {
  it("deals damage equal to its +1/+1 counters", () => {
    const { game } = table();
    const vamp = spawn(game, "Falkenrath Exterminator");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(vamp)]);
    settle(game);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    activate(game, vamp, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Captain of the Mists", () => {
  it("taps a permanent, then untaps when another Human enters", () => {
    const { game, a } = table();
    const captain = spawn(game, "Captain of the Mists");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    pickModes(a, 0);
    activate(game, captain, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[captain].tapped).toBe(true);
    enter(game, "Elite Vanguard");
    expect(game.state.objects[captain].tapped).toBe(false);
  });
});

describe("Driver of the Dead", () => {
  it("returns a creature card with mana value 2 or less when it dies", () => {
    const { game, a } = table();
    const driver = spawn(game, "Driver of the Dead");
    const bears = game.debugSpawn("Grizzly Bears", A, "graveyard");
    pickTargets(a, bears);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(driver)]);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
