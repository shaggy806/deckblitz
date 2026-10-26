/**
 * New Phyrexia (NPH) and Commander 2011 (CMD) — group C.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Tariel, Reckoner of Souls", () => {
  it("puts a creature card at random from target opponent's graveyard onto the battlefield under your control", () => {
    const { game } = table();
    const tariel = spawn(game, "Tariel, Reckoner of Souls");
    toGraveyard(game, "Lightning Bolt", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    activate(game, tariel, 0, { targets: [ref(B)] });
    const onField = named(game, "Grizzly Bears");
    expect(onField).toHaveLength(1);
    expect(controller(game, onField[0])).toBe(A);
    expect(graveyard(game, B)).not.toContain(bears);
    expect(named(game, "Lightning Bolt").length).toBe(0);
  });
});

describe("Sensor Splicer", () => {
  it("makes a Golem, and Golems you control have vigilance", () => {
    const { game } = table();
    const splicer = enter(game, "Sensor Splicer");
    const golem = named(game, "Phyrexian Golem Token")[0];
    expect(golem).toBeDefined();
    expect(keywords(game, golem).has("vigilance")).toBe(true);
    expect(keywords(game, splicer).has("vigilance")).toBe(false);
    const theirs = spawn(game, "Phyrexian Golem Token", B);
    expect(keywords(game, theirs).has("vigilance")).toBe(false);
  });
});

describe("Vital Splicer", () => {
  it("regenerates a Golem you control, and can't target a non-Golem", () => {
    const { game } = table();
    const splicer = enter(game, "Vital Splicer");
    const golem = named(game, "Phyrexian Golem Token")[0];
    lands(game, "Wastes", 2);
    expect(() => activate(game, splicer, 0, { targets: [ref(splicer)] })).toThrow();
    activate(game, splicer, 0, { targets: [ref(golem)] });
    destroy(game, golem);
    expect(zone(game, golem)).toBe("battlefield");
  });
});

describe("Caress of Phyrexia", () => {
  it("target player draws three, loses 3 life and gets three poison counters", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Caress of Phyrexia"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before + 3);
    expect(life(game, B)).toBe(17);
    expect(game.state.players[B].counters.poison).toBe(3);
  });
});

describe("Xenograft", () => {
  it("makes each creature you control the chosen type", () => {
    const { game, a } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    a.chooseCreatureTypeFn = () => "Elf";
    lands(game, "Island", 5);
    cast(game, toHand(game, "Xenograft"));
    expect(subtypes(game, mine)).toContain("Elf");
    expect(subtypes(game, mine)).toContain("Bear");
    expect(subtypes(game, theirs)).not.toContain("Elf");
  });
});

describe("Postmortem Lunge", () => {
  it("returns a creature card with mana value X, hasty, and exiles it at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const lunge = toHand(game, "Postmortem Lunge");
    expect(() => cast(game, lunge, { x: 2, targets: [ref(giant)] })).toThrow();
    cast(game, lunge, { x: 2, targets: [ref(bears)] });
    const back = named(game, "Grizzly Bears")[0];
    expect(back).toBeDefined();
    expect(keywords(game, back).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(Object.values(game.state.objects).some((o) => o.cardName === "Grizzly Bears" && o.zone === "exile")).toBe(true);
  });
});

describe("Impaler Shrike", () => {
  it("sacrificed after combat damage, it draws three cards", () => {
    const { game, a } = table();
    const shrike = spawn(game, "Impaler Shrike");
    pickModes(a, 0);
    const before = hand(game, A).length;
    attack(game, a, [shrike]);
    expect(zone(game, shrike)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before + 3);
    expect(life(game, B)).toBe(17);
  });
});

describe("Furnace Scamp", () => {
  it("sacrificed after combat damage, it deals 3 more damage to that player", () => {
    const { game, a } = table();
    const scamp = spawn(game, "Furnace Scamp");
    pickModes(a, 0);
    attack(game, a, [scamp]);
    expect(zone(game, scamp)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
  });

  it("declining keeps it and deals nothing more", () => {
    const { game, a } = table();
    const scamp = spawn(game, "Furnace Scamp");
    pickModes(a);
    attack(game, a, [scamp]);
    expect(zone(game, scamp)).toBe("battlefield");
    expect(life(game, B)).toBe(19);
  });
});

describe("Ichor Explosion", () => {
  it("all creatures get -X/-X, X the sacrificed creature's power", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    const giant = spawn(game, "Hill Giant");
    const ogre = spawn(game, "Gray Ogre", B);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Ichor Explosion"), { sacrifice: giant });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ogre)).toBe("graveyard");
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 1 });
  });
});
