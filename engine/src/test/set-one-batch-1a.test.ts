/**
 * Phyrexia: All Will Be One (and its Commander set), group a — each test
 * written from the Oracle text and rulings, aimed at the clause most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Kethek, Crucible Goliath", () => {
  it("sacrificing another creature reveals to a nonlegendary creature card with lesser mana value", () => {
    const { game, a } = table();
    const kethek = spawn(game, "Kethek, Crucible Goliath");
    const giant = spawn(game, "Hill Giant"); // mana value 4
    const courser = spawn(game, "Centaur Courser");
    // Library, top first: a legendary creature, a bigger creature, then the hit.
    const bears = toLibrary(game, "Grizzly Bears");
    const ogre = toLibrary(game, "Gray Ogre"); // mana value 3
    const wurm = toLibrary(game, "Craw Wurm"); // mana value 6
    const isamaru = toLibrary(game, "Isamaru, Hound of Konda"); // legendary, mana value 1
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [giant];
    };
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    // "Another creature": Kethek isn't offered.
    expect([...offered].sort()).toEqual([giant, courser].sort());
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("battlefield");
    expect(zone(game, kethek)).toBe("battlefield");
    // The rest go to the bottom; the card below the hit stays on top.
    const library = game.state.zones.perPlayer[A].library;
    expect(library[0]).toBe(bears);
    expect([...library.slice(-2)].sort()).toEqual([wurm, isamaru].sort());
  });

  it("an equal mana value isn't lesser", () => {
    const { game, a } = table();
    spawn(game, "Kethek, Crucible Goliath");
    const bears = spawn(game, "Grizzly Bears"); // mana value 2
    const thopter = toLibrary(game, "Ornithopter"); // mana value 0
    const otherBears = toLibrary(game, "Grizzly Bears"); // mana value 2: skipped
    a.chooseSacrificesFn = () => [bears];
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(zone(game, thopter)).toBe("battlefield");
    expect(zone(game, otherBears)).toBe("library");
  });

  it("declining sacrifices nothing and reveals nothing", () => {
    const { game, a } = table();
    spawn(game, "Kethek, Crucible Goliath");
    const giant = spawn(game, "Hill Giant");
    const ogre = toLibrary(game, "Gray Ogre");
    pickModes(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, ogre)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(ogre);
  });
});

describe("Feed the Infection", () => {
  it("you draw three and lose 3; only each opponent with three or more poison counters loses 3", () => {
    const { game } = table({ players: 3 });
    game.state.players[B].counters.poison = 3;
    game.state.players[C].counters.poison = 2;
    lands(game, "Swamp", 4);
    const spell = toHand(game, "Feed the Infection");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
  });
});

describe("Cacophony Scamp", () => {
  it("sacrificed after combat damage, it proliferates, then its death deals damage equal to its power", () => {
    const { game, a } = table();
    const scamp = spawn(game, "Cacophony Scamp");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickModes(a, 0);
    pickTargets(a, B);
    attack(game, a, [scamp]);
    settle(game);
    expect(zone(game, scamp)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
    // 1 combat damage, then 1 from the dies trigger.
    expect(life(game, B)).toBe(18);
  });

  it("declining keeps it and proliferates nothing", () => {
    const { game, a } = table();
    const scamp = spawn(game, "Cacophony Scamp");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickModes(a);
    attack(game, a, [scamp]);
    settle(game);
    expect(zone(game, scamp)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Ambulatory Edifice", () => {
  it("paying 2 life gives target creature -1/-1 until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Ambulatory Edifice");
    expect(life(game, A)).toBe(18);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });

  it("not paying, nothing happens", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    pickTargets(a, bears);
    enter(game, "Ambulatory Edifice");
    expect(life(game, A)).toBe(20);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Watchful Blisterzoa", () => {
  it("enters with an oil counter, and dying draws a card per oil counter it had", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const zoa = toHand(game, "Watchful Blisterzoa");
    cast(game, zoa);
    expect(counters(game, zoa, "oil")).toBe(1);
    game.state.objects[zoa].counters.oil = 2;
    const before = hand(game).length;
    destroy(game, zoa);
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Escaped Experiment", () => {
  it("attacking, target creature an opponent controls gets -X/-0, X the artifacts you control", () => {
    const { game, a } = table();
    const experiment = spawn(game, "Escaped Experiment");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    attack(game, a, [experiment]);
    // Itself and two Sol Rings.
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Sinew Dancer", () => {
  it("its corrupted ability is activatable only once an opponent has three or more poison counters", () => {
    const { game } = table();
    const dancer = spawn(game, "Sinew Dancer");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    expect(() => activate(game, dancer, 1, { targets: [{ kind: "object", object: bears }] })).toThrow();
    game.state.players[B].counters.poison = 3;
    activate(game, dancer, 1, { targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Paladin of Predation", () => {
  it("toxic 6: combat damage to a player gives six poison counters", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Paladin of Predation");
    attack(game, a, [paladin]);
    expect(life(game, B)).toBe(14);
    expect(game.state.players[B].counters.poison).toBe(6);
  });
});

describe("Oxidda Finisher", () => {
  it("affinity for Equipment: {1} less for each Equipment you control", () => {
    const { game } = table();
    spawn(game, "Bonesplitter");
    spawn(game, "Bonesplitter");
    lands(game, "Mountain", 5);
    const finisher = toHand(game, "Oxidda Finisher");
    cast(game, finisher);
    expect(zone(game, finisher)).toBe("battlefield");
  });
});
