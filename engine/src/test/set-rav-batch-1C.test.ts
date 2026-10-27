/**
 * Ravnica: City of Guilds (RAV; B229), group C. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Nullstone Gargoyle", () => {
  it("counters the turn's first noncreature spell, whoever cast it, and no later one", () => {
    const { game } = table();
    spawn(game, "Nullstone Gargoyle", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    const first = toHand(game, "Shock");
    cast(game, first, { targets: [ref(bears)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("ignores creature spells", () => {
    const { game } = table();
    spawn(game, "Nullstone Gargoyle", B);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("doesn't counter the next one when a noncreature spell was cast before it arrived", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    spawn(game, "Nullstone Gargoyle", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("Hunted Troll", () => {
  it("gives the targeted opponent four Faeries", () => {
    const { game } = table();
    enter(game, "Hunted Troll");
    expect(tokensNamed(game, "Faerie Token", B)).toBe(4);
    expect(tokensNamed(game, "Faerie Token", A)).toBe(0);
  });
});

describe("Necroplasm", () => {
  it("destroys each creature whose mana value equals its counters", () => {
    const { game } = table();
    const plasm = spawn(game, "Necroplasm");
    game.state.objects[plasm].counters["+1/+1"] = 2;
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, plasm)).toBe("battlefield");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, plasm)).toBe(3);
  });
});

describe("Dimir Doppelganger", () => {
  it("exiles a creature card and becomes a copy of it, keeping its ability", () => {
    const { game } = table();
    const doppel = spawn(game, "Dimir Doppelganger");
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const elves = toGraveyard(game, "Llanowar Elves", B);
    lands(game, "Underground Sea", 6);
    activate(game, doppel, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(pt(game, doppel)).toEqual({ power: 2, toughness: 2 });
    activate(game, doppel, 0, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("exile");
    expect(pt(game, doppel)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Firemane Angel", () => {
  it("gains 1 life at your upkeep from the graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Firemane Angel");
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, A)).toBe(21);
  });

  it("returns from the graveyard only during your upkeep", () => {
    const { game, a } = table();
    const angel = toGraveyard(game, "Firemane Angel");
    lands(game, "Plateau", 10);
    const action = { type: "activate-ability", player: A, source: angel, abilityIndex: 0, targets: [] } as const;
    expect(game.canDispatch(action)).not.toBeNull();
    pickModes(a, 0);
    toStep(game, "upkeep");
    game.dispatch(action);
    settle(game);
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Hammerfist Giant", () => {
  it("deals 4 to each creature without flying and each player", () => {
    const { game } = table();
    const giant = spawn(game, "Hammerfist Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    activate(game, giant, 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(16);
  });
});

describe("Razia, Boros Archangel", () => {
  it("sends the next 3 damage to your creature to another creature", () => {
    const { game } = table();
    const razia = spawn(game, "Razia, Boros Archangel");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Serra Angel", B);
    activate(game, razia, 0, { targets: [ref(mine), ref(theirs)] });
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[theirs].damageMarked).toBe(2);
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(game.state.objects[theirs].damageMarked).toBe(3);
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.objects[mine].damageMarked).toBe(1);
  });
});

describe("Vulturous Zombie", () => {
  it("grows for a card put into an opponent's graveyard, not a token", () => {
    const { game } = table();
    const zombie = spawn(game, "Vulturous Zombie");
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(counters(game, zombie)).toBe(1);
    expect(named(game, "Vulturous Zombie", A)).toHaveLength(1);
  });
});
