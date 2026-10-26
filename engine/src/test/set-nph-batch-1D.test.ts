/**
 * New Phyrexia and Commander 2011 (NPH, CMD; B194), group D. One test per
 * card whose behaviour is more than a stat line, on the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
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
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const MYR = "Phyrexian Myr Token (Myr Sire)";

describe("Riddlekeeper", () => {
  it("mills the attacking creature's controller two cards", () => {
    const { game, b } = table();
    spawn(game, "Riddlekeeper", A);
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const before = game.state.zones.perPlayer[B].library.length;
    attack(game, b, [bears], A);
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 2);
    expect(game.state.zones.perPlayer[A].library.length).toBeGreaterThan(0);
  });
});

describe("Crescendo of War", () => {
  it("gains a strife counter each upkeep and pumps attackers by them", () => {
    const { game, a } = table();
    const crescendo = spawn(game, "Crescendo of War");
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game); // bob's upkeep
    expect(counters(game, crescendo, "strife")).toBe(1);
    toStep(game, "precombat-main"); // alice's upkeep
    expect(counters(game, crescendo, "strife")).toBe(2);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20 - 4);
  });
});

describe("Shrine of Loyal Legions", () => {
  it("charges on a white spell and makes a Myr per counter", () => {
    const { game } = table();
    const shrine = spawn(game, "Shrine of Loyal Legions");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(counters(game, shrine, "charge")).toBe(1);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, shrine, "charge")).toBe(1);
    game.state.objects[shrine].counters.charge = 3;
    lands(game, "Wastes", 3);
    activate(game, shrine);
    expect(zone(game, shrine)).toBe("graveyard");
    expect(tokensNamed(game, MYR, A)).toBe(3);
  });
});

describe("Shrine of Burning Rage", () => {
  it("deals damage equal to its charge counters as it's sacrificed", () => {
    const { game } = table();
    const shrine = spawn(game, "Shrine of Burning Rage");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, shrine, "charge")).toBe(1);
    game.state.objects[shrine].counters.charge = 5;
    lands(game, "Wastes", 3);
    activate(game, shrine, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 3 - 5);
  });
});

describe("Parasitic Implant", () => {
  it("makes the enchanted creature's controller sacrifice it, and you get the Myr", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Parasitic Implant"), { targets: [ref(bears)] });
    toStep(game, "precombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, MYR, A)).toBe(1);
    expect(tokensNamed(game, MYR, B)).toBe(0);
  });
});

describe("Entomber Exarch", () => {
  it("makes the opponent discard a noncreature card of your choice", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const dead = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 1);
    pickTargets(a, B);
    const seen = pickFromZone(a, bolt);
    enter(game, "Entomber Exarch");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(seen.offered).not.toContain(bears);
    expect(hand(game, B)).toContain(bears);
    expect(zone(game, dead)).toBe("graveyard");
  });
});

describe("Auriok Survivors", () => {
  it("returns an Equipment from the graveyard attached to itself", () => {
    const { game, a } = table();
    const sword = toGraveyard(game, "Bonesplitter");
    pickTargets(a, sword);
    pickModes(a, 0);
    const survivors = enter(game, "Auriok Survivors");
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].attachedTo).toBe(survivors);
    expect(graveyard(game, A)).not.toContain(sword);
  });

  it("may return it unattached", () => {
    const { game, a } = table();
    const sword = toGraveyard(game, "Bonesplitter");
    pickTargets(a, sword);
    let asked = 0;
    a.chooseModesFn = () => (asked++ === 0 ? [0] : []);
    enter(game, "Auriok Survivors");
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].attachedTo).toBeNull();
  });
});

describe("Scrapyard Salvo", () => {
  it("deals damage equal to the artifact cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Bonesplitter");
    toGraveyard(game, "Bonesplitter");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Bonesplitter", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Scrapyard Salvo"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
