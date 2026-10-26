/**
 * Shards of Alara and Magic 2011 — group A of batch B174.
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
  lands,
  life,
  named,
  nextTurn,
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
  tokensNamed,
  zone,
} from "./harness.js";

describe("Exuberant Firestoker", () => {
  it("deals 2 at your end step only while you control a creature with power 5 or greater", () => {
    const { game, a } = table();
    spawn(game, "Exuberant Firestoker");
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(20);
    spawn(game, "Craw Wurm");
    pickTargets(a, B);
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(18);
  });
});

describe("Sigil Blessing", () => {
  it("gives the target +3/+3 and your other creatures +1/+1", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Sigil Blessing"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, lions)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Behemoth's Herald", () => {
  it("sacrifices itself as the green creature, with a red and a white one, to fetch Godsire", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const herald = spawn(game, "Behemoth's Herald");
    const goblin = spawn(game, "Raging Goblin");
    const lions = spawn(game, "Savannah Lions");
    const godsire = toLibrary(game, "Godsire");
    pickFromZone(a, godsire);
    activate(game, herald);
    expect(zone(game, herald)).toBe("graveyard");
    expect(zone(game, goblin)).toBe("graveyard");
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, godsire)).toBe("battlefield");
  });

  it("can't be activated without a white creature", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const herald = spawn(game, "Behemoth's Herald");
    spawn(game, "Raging Goblin");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, herald)).toThrow();
  });
});

describe("Puppet Conjurer", () => {
  it("makes a 0/1 blue Homunculus, and sacrifices a Homunculus each upkeep", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const conjurer = spawn(game, "Puppet Conjurer");
    activate(game, conjurer);
    expect(tokensNamed(game, "Homunculus Token", A)).toBe(1);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(tokensNamed(game, "Homunculus Token", A)).toBe(0);
    expect(zone(game, conjurer)).toBe("battlefield");
  });
});

describe("Carrion Thrash", () => {
  it("may pay {2} as it dies to return another creature card", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const thrash = spawn(game, "Carrion Thrash");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    destroy(game, thrash);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, thrash)).toBe("graveyard");
  });
});

describe("Rockcaster Platoon", () => {
  it("deals 2 to each creature with flying and each player", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const platoon = spawn(game, "Rockcaster Platoon");
    const crow = spawn(game, "Storm Crow", B);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, platoon);
    expect(zone(game, crow)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
  });
});

describe("Frost Titan", () => {
  it("taps a permanent as it enters, and it doesn't untap in its controller's next untap step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "Frost Titan");
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Primal Cocoon", () => {
  it("grows the creature each upkeep and is sacrificed when it attacks", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const cocoon = toHand(game, "Primal Cocoon");
    pickTargets(a, bears);
    cast(game, cocoon, { targets: [ref(bears)] });
    expect(zone(game, cocoon)).toBe("battlefield");
    nextTurn(game);
    expect(counters(game, bears)).toBe(0);
    nextTurn(game);
    expect(counters(game, bears)).toBe(1);
    attack(game, a, [bears]);
    expect(zone(game, cocoon)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Squadron Hawk", () => {
  it("may search for up to three cards named Squadron Hawk", () => {
    const { game, a } = table();
    const hawks = [toLibrary(game, "Squadron Hawk"), toLibrary(game, "Squadron Hawk"), toLibrary(game, "Squadron Hawk")];
    const before = hand(game).length;
    pickModes(a, 0);
    pickFromZone(a, ...hawks);
    enter(game, "Squadron Hawk");
    expect(hand(game).length).toBe(before + 3);
    for (const hawk of hawks) expect(zone(game, hawk)).toBe("hand");
    expect(named(game, "Squadron Hawk").filter((id) => zone(game, id) === "battlefield").length).toBe(1);
  });
});

describe("Phantom Beast", () => {
  it("is sacrificed when it becomes a target", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const beast = spawn(game, "Phantom Beast", B);
    pickTargets(a, beast);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(beast)] });
    expect(zone(game, beast)).toBe("graveyard");
  });
});
