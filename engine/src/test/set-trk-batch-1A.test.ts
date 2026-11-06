/**
 * Star Trek (TRK) — group A of the set walk: Spacecraft, Officers, the Borg's
 * artifact-creature payoffs and the "strange new worlds" land counts.
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
  hand,
  life,
  lands,
  pickFromZone,
  pickModes,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const pool = (game: Game, player: PlayerId = A): string[] =>
  game.state.players[player].manaPool.map((unit) => unit.type).sort();

describe("Deep Space 9", () => {
  it("exiles the top four and puts only the permanent cards onto the battlefield", () => {
    const { game } = table();
    const divination = toLibrary(game, "Divination");
    const forest = toLibrary(game, "Forest");
    const shock = toLibrary(game, "Shock");
    const bears = toLibrary(game, "Grizzly Bears");
    enter(game, "Deep Space 9");
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, shock)).toBe("exile");
    expect(zone(game, divination)).toBe("exile");
  });
});

describe("Captain Jean-Luc Picard", () => {
  it("taps seven Officers, himself among them, to put a Spacecraft in with seven charge counters", () => {
    const { game, a } = table();
    const picard = spawn(game, "Captain Jean-Luc Picard");
    const officers = Array.from({ length: 6 }, () => spawn(game, "Tactical Officer"));
    const shuttle = toLibrary(game, "Class-F Shuttlecraft");
    pickFromZone(a, shuttle);
    activate(game, picard, 0);
    expect(game.state.objects[picard].tapped).toBe(true);
    expect(officers.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(zone(game, shuttle)).toBe("battlefield");
    expect(counters(game, shuttle, "charge")).toBe(7);
    expect(types(game, shuttle)).toContain("creature");
  });

  it("makes an Officer for a Spacecraft spell", () => {
    const { game } = table();
    spawn(game, "Captain Jean-Luc Picard");
    lands(game, "Wastes", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Oberth-Class Starship"));
    expect(tokensNamed(game, "Officer Token", A)).toBe(1);
  });
});

describe("Captain James T. Kirk", () => {
  it("chooses one with a card in hand, and one or more with none", () => {
    const { game, a } = table({ openingHandSize: 0 });
    // The turn's draw is alice's one card.
    expect(hand(game)).toHaveLength(1);
    let offered = 0;
    a.chooseModesFn = (_view, _min, max) => {
      offered = max;
      return [1];
    };
    const kirk = enter(game, "Captain James T. Kirk");
    expect(offered).toBe(1);
    expect(tokensNamed(game, "Officer Token", A)).toBe(1);
    expect(pt(game, kirk).power).toBe(2);

    game.dispatch({ type: "play-land", player: A, card: hand(game)[0] });
    expect(hand(game)).toHaveLength(0);
    a.chooseModesFn = (_view, _min, max) => {
      offered = max;
      return [1, 2];
    };
    enter(game, "Captain James T. Kirk");
    expect(offered).toBe(3);
    expect(tokensNamed(game, "Officer Token", A)).toBe(2);
    expect(pt(game, kirk).power).toBe(3);
  });
});

describe("Peace in Our Time", () => {
  it("draws its active player a card, stops their attack, and counts a peace counter", () => {
    const { game, a } = table();
    const peace = spawn(game, "Peace in Our Time");
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, peace, "peace")).toBe(1);
    expect(life(game, B)).toBe(20);
  });
});

describe("Will Riker, First in the Field", () => {
  it("puts two revealed lands onto the battlefield and sacrifices them at the end step", () => {
    const { game } = table();
    spawn(game, "Will Riker, First in the Field");
    const second = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Island");
    toStep(game, "begin-combat");
    toStep(game, "postcombat-main");
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    expect(game.state.objects[first].tapped).toBe(false);
    expect(zone(game, bears)).toBe("library");
    toStep(game, "end");
    toStep(game, "cleanup");
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
  });
});

describe("Lieutenant Commander Data", () => {
  it("removes three counters of any kinds from among creatures to draw", () => {
    const { game } = table();
    const data = spawn(game, "Lieutenant Commander Data");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[data].counters["+1/+1"] = 1;
    game.state.objects[bears].counters["+1/+1"] = 1;
    game.state.objects[bears].counters.shield = 1;
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    activate(game, data, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, data)).toBe(0);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, bears, "shield")).toBe(0);
  });
});

describe("Jadzia Dax, Living Legacy", () => {
  it("adds {G} for every counter on her, of any kind, after the new one", () => {
    const { game } = table();
    const jadzia = spawn(game, "Jadzia Dax, Living Legacy");
    game.state.objects[jadzia].counters.charge = 1;
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, jadzia)).toBe(1);
    expect(pool(game)).toEqual(["G", "G"]);
  });
});

describe("Tactical Officer", () => {
  it("grows and untaps when creatures you control total 8 power as you attack", () => {
    const { game, a } = table();
    const officer = spawn(game, "Tactical Officer");
    spawn(game, "Craw Wurm");
    attack(game, a, [officer]);
    expect(counters(game, officer)).toBe(1);
    expect(game.state.objects[officer].tapped).toBe(false);
  });

  it("doesn't trigger below 8 total power", () => {
    const { game, a } = table();
    const officer = spawn(game, "Tactical Officer");
    spawn(game, "Grizzly Bears");
    attack(game, a, [officer]);
    expect(counters(game, officer)).toBe(0);
    expect(game.state.objects[officer].tapped).toBe(true);
  });
});

describe("Branching Timeline", () => {
  it("reveals X for X differently named lands and puts every permanent card in tapped", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    const below = toLibrary(game, "Mountain");
    const swamp = toLibrary(game, "Swamp");
    const shock = toLibrary(game, "Shock");
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Branching Timeline"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(zone(game, swamp)).toBe("battlefield");
    expect(zone(game, shock)).toBe("library");
    expect(zone(game, below)).toBe("library");
  });
});

describe("Exploratory Mission", () => {
  it("exiles to a nonland card it may play, and adds {R}{R} at five quest counters", () => {
    const { game } = table();
    const mission = spawn(game, "Exploratory Mission");
    game.state.objects[mission].counters.quest = 4;
    const bears = toLibrary(game, "Grizzly Bears");
    enter(game, "Forest");
    expect(counters(game, mission, "quest")).toBe(5);
    expect(zone(game, bears)).toBe("exile");
    expect(pool(game)).toEqual(["R", "R"]);
  });
});

describe("Support Mission", () => {
  it("puts one +1/+1 counter, or two from the fifth quest counter on", () => {
    const { game } = table();
    const mission = spawn(game, "Support Mission");
    const first = enter(game, "Grizzly Bears");
    expect(counters(game, first)).toBe(1);
    game.state.objects[mission].counters.quest = 4;
    const later = enter(game, "Grizzly Bears");
    expect(counters(game, later)).toBe(2);
  });
});

describe("Hive Mind Coprocessor", () => {
  it("gives artifact creatures a pay-1-life-to-draw combat damage trigger", () => {
    const { game, a } = table();
    const hive = spawn(game, "Hive Mind Coprocessor");
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [hive]);
    expect(life(game, B)).toBe(16);
    expect(life(game)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Live Long and Prosper", () => {
  it("doubles your life and draws as many cards as are in your hand", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Island", 3);
    const spell = toHand(game, "Live Long and Prosper");
    const inHand = hand(game).length - 1;
    cast(game, spell);
    expect(life(game)).toBe(40);
    expect(hand(game).length).toBe(inHand * 2);
  });
});

describe("Captain Kathryn Janeway", () => {
  it("has itself and each other creature explore as it enters", () => {
    const { game } = table();
    const forest = toLibrary(game, "Forest");
    enter(game, "Captain Kathryn Janeway");
    expect(zone(game, forest)).toBe("hand");
    toLibrary(game, "Shock");
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("70,000 Light-Years from Home", () => {
  it("exiles a creature and lets its controller fetch a basic land to hand", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const forest = toLibrary(game, "Forest", B);
    const before = hand(game, B).length;
    pickModes(b, 0);
    pickFromZone(b, forest);
    cast(game, toHand(game, "70,000 Light-Years from Home"), { targets: [{ kind: "object", object: bears }] });
    expect(zone(game, bears)).toBe("exile");
    expect(hand(game, B).length).toBe(before + 1);
    expect(zone(game, forest)).toBe("hand");
  });
});

describe("Sulu, Space Swashbuckler", () => {
  it("draws as it becomes tapped if a Spacecraft entered under your control this turn", () => {
    const { game, a } = table();
    const sulu = spawn(game, "Sulu, Space Swashbuckler");
    enter(game, "Class-F Shuttlecraft");
    const before = hand(game).length;
    attack(game, a, [sulu]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Excalbian Gamemaster", () => {
  it("makes an Officer for each differently named land", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    enter(game, "Excalbian Gamemaster");
    expect(tokensNamed(game, "Officer Token", A)).toBe(2);
  });
});

describe("Genesis Device", () => {
  it("fetches a Planet card onto the battlefield tapped", () => {
    const { game, a } = table();
    const earth = toLibrary(game, "Earth, Sector 001");
    pickFromZone(a, earth);
    enter(game, "Genesis Device");
    expect(zone(game, earth)).toBe("battlefield");
    expect(game.state.objects[earth].tapped).toBe(true);
  });
});

describe("Set Phasers to . . .", () => {
  it("stuns a creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Set Phasers to . . ."), { modes: [0], targets: [{ kind: "object", object: bears }] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });
});
