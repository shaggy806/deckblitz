/**
 * Hour of Devastation, group F: eternalize with and without a discard, the
 * Desert conditions, the Gods' Defeat cycle's filters, exert triggers, and
 * the rest of the clauses most likely to be wrong.
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
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  quiet,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Champion of Wits", () => {
  it("draws cards equal to its power and discards two; eternalized, it draws four", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    enter(game, "Champion of Wits");
    expect(hand(game).length).toBe(before); // drew 2, discarded 2

    const card = toGraveyard(game, "Champion of Wits");
    lands(game, "Island", 7);
    toStep(game, "precombat-main"); // the enter settled past main; eternalize is sorcery-speed
    const handBefore = hand(game).length;
    activate(game, card, 0);
    expect(zone(game, card)).toBe("exile");
    const token = named(game, "Champion of Wits").find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    expect(pt(game, token!)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, token!)).toContain("Zombie");
    expect(hand(game).length).toBe(handBefore + 4 - 2);
  });

  it("declined, draws and discards nothing", () => {
    const { game, a } = table();
    pickModes(a);
    const before = hand(game).length;
    enter(game, "Champion of Wits");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toHaveLength(0);
  });
});

describe("Sunscourge Champion", () => {
  it("eternalizes for {2}{W}{W} and a discard; the 4/4 token gains 4 life", () => {
    const { game } = table();
    const card = toGraveyard(game, "Sunscourge Champion");
    lands(game, "Plains", 4);
    const handBefore = hand(game).length;
    activate(game, card, 0);
    expect(zone(game, card)).toBe("exile");
    expect(hand(game).length).toBe(handBefore - 1);
    expect(life(game)).toBe(24);
  });
});

describe("Apocalypse Demon", () => {
  it("is as big as your graveyard, and taps at upkeep with nothing to sacrifice", () => {
    const { game } = table();
    const demon = spawn(game, "Apocalypse Demon");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    toGraveyard(game, "Hill Giant", B);
    expect(pt(game, demon)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main");
    expect(game.state.objects[demon].tapped).toBe(true);
  });

  it("stays untapped if you sacrifice another creature", () => {
    const { game, a } = table();
    const demon = spawn(game, "Apocalypse Demon");
    const bears = spawn(game, "Grizzly Bears");
    toGraveyard(game, "Wastes");
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[demon].tapped).toBe(false);
  });
});

describe("Ramunap Hydra", () => {
  it("gets +1/+1 for a Desert you control and +1/+1 more for one in your graveyard", () => {
    const { game } = table();
    const hydra = spawn(game, "Ramunap Hydra");
    expect(pt(game, hydra)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Hostile Desert");
    expect(pt(game, hydra)).toEqual({ power: 4, toughness: 4 });
    toGraveyard(game, "Desert of the True");
    expect(pt(game, hydra)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Hostile Desert", () => {
  it("exiles a land card from your graveyard to become a 3/4 Elemental land creature", () => {
    const { game } = table();
    const desert = spawn(game, "Hostile Desert");
    const forest = toGraveyard(game, "Forest");
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    activate(game, desert, 1);
    expect(zone(game, forest)).toBe("exile");
    expect(types(game, desert)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, desert)).toEqual(expect.arrayContaining(["Desert", "Elemental"]));
    expect(pt(game, desert)).toEqual({ power: 3, toughness: 4 });
  });

  it("can't be activated without a land card in your graveyard", () => {
    const { game } = table();
    const desert = spawn(game, "Hostile Desert");
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    expect(() => activate(game, desert, 1)).toThrow();
  });
});

describe("Samut, the Tested", () => {
  it("−7 puts up to two creature and/or planeswalker cards onto the battlefield", () => {
    const { game, a } = table();
    const samut = spawn(game, "Samut, the Tested");
    const giant = toLibrary(game, "Hill Giant");
    const chandra = toLibrary(game, "Chandra, Torch of Defiance");
    pickFromZone(a, giant, chandra);
    loyalty(game, samut, -7, { atLeast: 7 });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, chandra)).toBe("battlefield");
  });

  it("+1 gives up to one target creature double strike", () => {
    const { game } = table();
    const samut = spawn(game, "Samut, the Tested");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, samut, 1, { targets: [{ kind: "object", object: bears }] });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(game.state.objects[samut].counters.loyalty).toBe(5);
  });

  it("+1 may target no creature", () => {
    const { game } = table();
    const samut = spawn(game, "Samut, the Tested");
    spawn(game, "Grizzly Bears");
    loyalty(game, samut, 1, { targets: [null] });
    expect(game.state.objects[samut].counters.loyalty).toBe(5);
  });
});

describe("Chandra's Defeat", () => {
  it("targets only red creatures and planeswalkers", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    expect(() => cast(game, toHand(game, "Chandra's Defeat"), { targets: [{ kind: "object", object: bears }] })).toThrow();
  });

  it("deals 5 to a Chandra and offers a rummage", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Torch of Defiance", B);
    game.state.objects[chandra].counters.loyalty = 6;
    lands(game, "Mountain", 1);
    const spell = toHand(game, "Chandra's Defeat");
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, spell, { targets: [{ kind: "object", object: chandra }] });
    expect(game.state.objects[chandra].counters.loyalty).toBe(1);
    // The spell left the hand; one discarded, one drawn.
    expect(hand(game).length).toBe(before - 1);
    expect(graveyard(game)).toHaveLength(2);
  });
});

describe("Gideon's Defeat", () => {
  it("exiles an attacking white creature, not a white one that isn't in combat", () => {
    const { game, a } = table();
    const lions = spawn(game, "Savannah Lions");
    const idle = spawn(game, "Savannah Lions");
    lands(game, "Plains", 2);
    expect(() => cast(game, toHand(game, "Gideon's Defeat"), { targets: [{ kind: "object", object: idle }] })).toThrow();
    a.declareAttackersFn = () => [{ attacker: lions, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && quiet(s) && s.priority.holder === A);
    cast(game, toHand(game, "Gideon's Defeat"), { targets: [{ kind: "object", object: lions }] });
    expect(zone(game, lions)).toBe("exile");
    expect(life(game)).toBe(20);
  });
});

describe("Grisly Survivor", () => {
  it("gets +2/+0 when you cycle a card", () => {
    const { game } = table();
    const survivor = spawn(game, "Grisly Survivor");
    lands(game, "Mountain", 1);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Forgotten Cave") });
    game.advanceUntil(quiet);
    expect(pt(game, survivor)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Vizier of the True", () => {
  it("exerted as it attacks, taps target creature an opponent controls", () => {
    const { game, a } = table();
    const vizier = spawn(game, "Vizier of the True");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    attack(game, a, [vizier]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
  });
});

describe("Khenra Scrapper", () => {
  it("exerted, gets +2/+0", () => {
    const { game, a } = table();
    const scrapper = spawn(game, "Khenra Scrapper");
    pickModes(a, 0);
    attack(game, a, [scrapper]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Wretched Camel", () => {
  it("dying with a Desert in your graveyard makes target player discard", () => {
    const { game, a } = table();
    const camel = spawn(game, "Wretched Camel");
    toGraveyard(game, "Desert of the True");
    const bobHand = hand(game, B).length;
    pickTargets(a, B);
    destroy(game, camel);
    expect(hand(game, B).length).toBe(bobHand - 1);
  });

  it("does nothing without a Desert", () => {
    const { game, a } = table();
    const camel = spawn(game, "Wretched Camel");
    const bobHand = hand(game, B).length;
    pickTargets(a, B);
    destroy(game, camel);
    expect(hand(game, B).length).toBe(bobHand);
  });
});

describe("God-Pharaoh's Faithful", () => {
  it("gains 1 life for a red spell, none for a green one", () => {
    const { game } = table();
    spawn(game, "God-Pharaoh's Faithful");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [{ kind: "object", object: bears }] });
    expect(life(game)).toBe(20);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    expect(life(game)).toBe(21);
  });
});

describe("Resilient Khenra", () => {
  it("gives target creature +X/+X equal to its power", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Resilient Khenra");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});
