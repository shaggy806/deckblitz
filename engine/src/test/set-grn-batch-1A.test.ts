/**
 * Guilds of Ravnica, group A: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const library = (game: Game, player: PlayerId = A) => game.state.zones.perPlayer[player].library;

describe("Drowned Secrets", () => {
  it("mills two for a blue spell, and nothing for a red one", () => {
    const { game, a } = table();
    spawn(game, "Drowned Secrets");
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    pickTargets(a, B);
    const before = library(game, B).length;
    cast(game, toHand(game, "Radical Idea"));
    expect(library(game, B).length).toBe(before - 2);
    cast(game, toHand(game, "Shock"), { targets: [{ kind: "player", player: B }] });
    expect(library(game, B).length).toBe(before - 2);
  });
});

describe("Dream Eater", () => {
  it("surveils, then may bounce a nonland permanent an opponent controls", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    enter(game, "Dream Eater");
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Haazda Marshal", () => {
  it("makes a lifelink Soldier when it and two others attack, not with one other", () => {
    const { game, a } = table();
    const marshal = spawn(game, "Haazda Marshal");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, [marshal, bears[0]]);
    expect(tokensNamed(game, "Lifelink Soldier Token", A)).toBe(0);
    attack(game, a, [marshal, ...bears]);
    expect(tokensNamed(game, "Lifelink Soldier Token", A)).toBe(1);
  });
});

describe("Disinformation Campaign and Start the TARDIS", () => {
  it("draws and makes each opponent discard, then goes back to hand when you surveil", () => {
    const { game } = table();
    const mine = hand(game).length;
    const theirs = hand(game, B).length;
    const campaign = enter(game, "Disinformation Campaign");
    expect(hand(game).length).toBe(mine + 1);
    expect(hand(game, B).length).toBe(theirs - 1);
    toStep(game, "postcombat-main");
    lands(game, "Island", 2);
    const tardis = toHand(game, "Start the TARDIS");
    const before = hand(game).length;
    cast(game, tardis);
    // Surveil 2 (all kept on top), a card drawn, the Campaign back in hand.
    expect(zone(game, campaign)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 1 + 1);
    expect(zone(game, tardis)).toBe("graveyard");
  });
});

describe("Devious Cover-Up", () => {
  it("exiles the countered spell and shuffles the targeted graveyard cards into the library", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 4);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [{ kind: "player", player: B }], settle: false });
    const bears = toGraveyard(game, "Grizzly Bears");
    const other = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    cast(game, toHand(game, "Devious Cover-Up"), {
      targets: [{ kind: "object", object: shock }, { kind: "object", object: bears }],
    });
    expect(zone(game, shock)).toBe("exile");
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, other)).toBe("graveyard");
  });
});

describe("Pelt Collector", () => {
  it("grows for a bigger creature entering or dying, not an equal one, and tramples at three counters", () => {
    const { game } = table();
    const pelt = spawn(game, "Pelt Collector");
    enter(game, "Grizzly Bears");
    expect(counters(game, pelt)).toBe(1);
    // Now 2/2: another 2/2 entering isn't greater.
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, pelt)).toBe(1);
    const giant = spawn(game, "Hill Giant");
    destroy(game, giant);
    expect(counters(game, pelt)).toBe(2);
    destroy(game, bears);
    expect(counters(game, pelt)).toBe(2);
    expect(keywords(game, pelt).has("trample")).toBe(false);
    game.state.objects[pelt].counters["+1/+1"] = 3;
    expect(keywords(game, pelt).has("trample")).toBe(true);
  });
});

describe("League Guildmage", () => {
  it("copies only a spell you control whose mana value is X", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const mage = spawn(game, "League Guildmage");
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [{ kind: "player", player: B }], settle: false });
    const act = (x: number): Action => ({
      type: "activate-ability",
      player: A,
      source: mage,
      abilityIndex: 1,
      targets: [{ kind: "object", object: shock }],
      xValue: x,
    });
    expect(game.canDispatch(act(2))).not.toBeNull();
    pickTargets(a, B);
    activate(game, mage, 1, { targets: [{ kind: "object", object: shock }], x: 1 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Swathcutter Giant", () => {
  it("deals 1 damage to each creature the defending player controls, no one else's", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Swathcutter Giant");
    const mine = spawn(game, "Llanowar Elves");
    const bobs = spawn(game, "Llanowar Elves", B);
    const carols = spawn(game, "Llanowar Elves", C);
    attack(game, a, [giant], B);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Golgari Raiders", () => {
  it("enters with a counter for each creature card in your graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves");
    toGraveyard(game, "Shock");
    const raiders = toHand(game, "Golgari Raiders");
    cast(game, raiders);
    expect(counters(game, raiders)).toBe(2);
  });
});

describe("Vivid Revival", () => {
  it("targets only multicolored cards, returns them, and exiles itself", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const split = toGraveyard(game, "Status // Statue");
    const bears = toGraveyard(game, "Grizzly Bears");
    const revival = toHand(game, "Vivid Revival");
    expect(() => cast(game, revival, { targets: [{ kind: "object", object: bears }, null, null] })).toThrow();
    cast(game, revival, { targets: [{ kind: "object", object: split }, null, null] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, split)).toBe("hand");
    expect(zone(game, revival)).toBe("exile");
  });
});

describe("Centaur Peacemaker", () => {
  it("gives every player 4 life", () => {
    const { game } = table();
    enter(game, "Centaur Peacemaker");
    expect(life(game, A)).toBe(24);
    expect(life(game, B)).toBe(24);
  });
});

describe("Attendant of Vraska", () => {
  it("gains its power in life only while you control a Vraska planeswalker", () => {
    const { game } = table();
    const lone = spawn(game, "Attendant of Vraska");
    destroy(game, lone);
    expect(life(game)).toBe(20);
    spawn(game, "Vraska, Golgari Queen");
    const attendant = spawn(game, "Attendant of Vraska");
    destroy(game, attendant);
    expect(life(game)).toBe(23);
  });
});

describe("Status // Statue and Integrity // Intervention", () => {
  it("casts Statue to destroy an artifact", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 2);
    const ring = spawn(game, "Sol Ring", B);
    const card = toHand(game, "Status // Statue");
    cast(game, card, { face: 2, targets: [{ kind: "object", object: ring }] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(graveyard(game)).toContain(card);
  });

  it("casts Intervention for 3 damage and 3 life", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 2);
    cast(game, toHand(game, "Integrity // Intervention"), { face: 2, targets: [{ kind: "player", player: B }] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});
