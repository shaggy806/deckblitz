/**
 * Gatecrash (GTC; B176) — group c.
 */
import { describe, expect, it } from "vitest";

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
  named,
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
  nextTurn,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Duskmantle Seer", () => {
  it("each player reveals their top card, loses life equal to its mana value and puts it into their hand", () => {
    const { game } = table();
    spawn(game, "Duskmantle Seer");
    nextTurn(game); // bob's turn: his draw is past
    const bolt = toLibrary(game, "Grizzly Bears", A); // mana value 2
    const shock = toLibrary(game, "Shock", B); // mana value 1
    toStep(game, "upkeep", A);
    settle(game);
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, shock)).toBe("hand");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(19);
  });
});

describe("Simic Manipulator", () => {
  it("removes X counters to steal a creature with power X or less", () => {
    const { game } = table();
    const manipulator = spawn(game, "Simic Manipulator");
    game.state.objects[manipulator].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, manipulator, 0, { x: 1, targets: [ref(bears)] })).toThrow();
    activate(game, manipulator, 0, { x: 2, targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    expect(counters(game, manipulator)).toBe(0);
  });
});

describe("Killing Glare", () => {
  it("destroys a creature only with power X or less", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const glare = toHand(game, "Killing Glare");
    expect(() => cast(game, glare, { x: 1, targets: [ref(bears)] })).toThrow();
    cast(game, glare, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Structural Collapse", () => {
  it("an artifact land that's the only artifact goes as the artifact, and another land as the land", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const seat = spawn(game, "Seat of the Synod", B);
    const island = spawn(game, "Island", B);
    cast(game, toHand(game, "Structural Collapse"), { targets: [ref(B)] });
    expect(zone(game, seat)).toBe("graveyard");
    expect(zone(game, island)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Gruul Charm", () => {
  it("gains control of every permanent you own", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(bears)]);
    expect(controller(game, bears)).toBe(B);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gruul Charm"), { modes: [1] });
    expect(controller(game, bears)).toBe(A);
    expect(controller(game, theirs)).toBe(B);
  });
});

describe("Hold the Gates", () => {
  it("creatures you control get +0/+1 per Gate and have vigilance", () => {
    const { game } = table();
    spawn(game, "Hold the Gates");
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Azorius Guildgate");
    spawn(game, "Boros Guildgate");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Way of the Thief", () => {
  it("+2/+2, and can't be blocked only while you control a Gate", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Way of the Thief"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("unblockable")).toBe(false);
    spawn(game, "Dimir Guildgate");
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });
});

describe("Murder Investigation", () => {
  it("makes Soldiers equal to the enchanted creature's power when it dies", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Murder Investigation"), { targets: [ref(giant)] });
    destroy(game, giant);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(3);
  });
});

describe("Deathpact Angel", () => {
  it("dies into a Cleric that returns a Deathpact Angel from the graveyard", () => {
    const { game } = table();
    const angel = spawn(game, "Deathpact Angel");
    destroy(game, angel);
    expect(tokensNamed(game, "Cleric Token (Deathpact Return)", A)).toBe(1);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 5);
    nextTurn(game);
    toStep(game, "precombat-main", A);
    const [cleric] = named(game, "Cleric Token (Deathpact Return)", A);
    activate(game, cleric, 0);
    expect(tokensNamed(game, "Cleric Token (Deathpact Return)", A)).toBe(0);
    expect(named(game, "Deathpact Angel", A)).toHaveLength(1);
  });
});

describe("Rust Scarab", () => {
  it("becoming blocked may destroy an artifact the defending player controls", () => {
    const { game, a, b } = table();
    const scarab = spawn(game, "Rust Scarab");
    const bears = spawn(game, "Grizzly Bears", B);
    const thopter = spawn(game, "Ornithopter", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: scarab }];
    pickTargets(a, thopter);
    pickModes(a, 0);
    attack(game, a, [scarab]);
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("Rubblebelt Raiders", () => {
  it("gets a counter for each attacking creature you control", () => {
    const { game, a } = table();
    const raiders = spawn(game, "Rubblebelt Raiders");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [raiders, bears]);
    expect(counters(game, raiders)).toBe(2);
  });
});

describe("Foundry Street Denizen", () => {
  it("pumps only for another red creature", () => {
    const { game } = table();
    const denizen = spawn(game, "Foundry Street Denizen");
    enter(game, "Grizzly Bears");
    expect(pt(game, denizen).power).toBe(1);
    enter(game, "Goblin Guide");
    expect(pt(game, denizen).power).toBe(2);
  });
});

describe("Borborygmos Enraged", () => {
  it("puts the revealed lands into your hand and the rest into your graveyard", () => {
    const { game, a } = table();
    const borbo = spawn(game, "Borborygmos Enraged");
    const forest = toLibrary(game, "Forest");
    const shock = toLibrary(game, "Shock");
    const mountain = toLibrary(game, "Mountain");
    attack(game, a, [borbo]);
    expect(life(game, B)).toBe(13);
    expect(hand(game, A)).toContain(forest);
    expect(hand(game, A)).toContain(mountain);
    expect(graveyard(game, A)).toContain(shock);
  });
});

describe("Treasury Thrull", () => {
  it("attacking may return an artifact, creature or enchantment card", () => {
    const { game, a } = table();
    const thrull = spawn(game, "Treasury Thrull");
    const thopter = toGraveyard(game, "Ornithopter");
    pickTargets(a, thopter);
    pickModes(a, 0);
    attack(game, a, [thrull]);
    expect(zone(game, thopter)).toBe("hand");
  });
});
