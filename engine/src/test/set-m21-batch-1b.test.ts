/**
 * Core Set 2021 (M21) — group b.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Kaervek, the Spiteful", () => {
  it("gives every other creature -1/-1, whoever controls it", () => {
    const { game } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const kaervek = spawn(game, "Kaervek, the Spiteful");
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, kaervek)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Chandra's Pyreling", () => {
  it("noncombat damage to an opponent pumps it and gives double strike; to a creature doesn't", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const pyreling = spawn(game, "Chandra's Pyreling");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(pt(game, pyreling)).toEqual({ power: 1, toughness: 3 });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, pyreling)).toEqual({ power: 2, toughness: 3 });
    expect(keywords(game, pyreling).has("double-strike")).toBe(true);
  });
});

describe("Alchemist's Gift", () => {
  it("gives +1/+1 and the chosen keyword only", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    cast(game, toHand(game, "Alchemist's Gift"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("Heartfire Immolator", () => {
  it("deals damage equal to its power as it last existed — prowess included", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const immolator = spawn(game, "Heartfire Immolator");
    const zombie = spawn(game, "Caged Zombie", B); // 2/3
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, immolator).power).toBe(3);
    activate(game, immolator, 0, { targets: [ref(zombie)] });
    expect(zone(game, immolator)).toBe("graveyard");
    expect(zone(game, zombie)).toBe("graveyard");
  });
});

describe("Sanguine Indulgence", () => {
  it("costs {3} less once you've gained 3 life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Caged Zombie");
    const spell = toHand(game, "Sanguine Indulgence");
    expect(() => cast(game, spell, { targets: [ref(one), ref(two)] })).toThrow();
    enter(game, "Lone Missionary"); // gain 4 life
    toStep(game, "postcombat-main");
    cast(game, spell, { targets: [ref(one), ref(two)] });
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
  });
});

describe("Kinetic Augur", () => {
  it("has power equal to instants and sorceries in your graveyard; discards two, draws two", () => {
    const { game, a } = table();
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    pickModes(a, 2);
    const augur = enter(game, "Kinetic Augur");
    expect(pt(game, augur)).toEqual({ power: 2, toughness: 4 });
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(graveBefore + 2);
  });
});

describe("Alpine Houndmaster", () => {
  it("finds a Watchdog and a Cur, and gets +1/+0 for each other attacker", () => {
    const { game, a } = table();
    const dog = toLibrary(game, "Alpine Watchdog");
    const cur = toLibrary(game, "Igneous Cur");
    pickModes(a, 0);
    pickFromZone(a, dog, cur);
    const houndmaster = enter(game, "Alpine Houndmaster");
    expect(zone(game, dog)).toBe("hand");
    expect(zone(game, cur)).toBe("hand");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, [houndmaster, ...bears]);
    expect(pt(game, houndmaster)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Canopy Stalker", () => {
  it("gains 1 life for each creature that died this turn, itself included", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const stalker = spawn(game, "Canopy Stalker");
    destroy(game, bears);
    destroy(game, stalker);
    expect(life(game, A)).toBe(22);
  });
});

describe("Caged Zombie", () => {
  it("can be activated only once a creature has died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const zombie = spawn(game, "Caged Zombie");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, zombie, 0)).toThrow();
    destroy(game, bears);
    activate(game, zombie, 0);
    expect(life(game, B)).toBe(18);
  });
});

describe("Leafkin Avenger", () => {
  it("adds {G} for each creature with power 4 or greater you control", () => {
    const { game } = table();
    const leafkin = spawn(game, "Leafkin Avenger");
    spawn(game, "Canopy Stalker"); // 4/2
    spawn(game, "Grizzly Bears");
    spawn(game, "Canopy Stalker", B);
    activate(game, leafkin, 0);
    expect(game.state.players[A].manaPool).toHaveLength(2);
  });
});

describe("Rookie Mistake", () => {
  it("gives one creature +0/+2 and another -2/-0", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rookie Mistake"), { targets: [ref(one), ref(two)] });
    expect(pt(game, one)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, two)).toEqual({ power: 0, toughness: 2 });
  });
});
