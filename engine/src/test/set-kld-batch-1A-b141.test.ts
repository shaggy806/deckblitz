/**
 * Commander 2016 and Kaladesh, group A: the clause of each card most likely to be wrong.
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
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Aetherstorm Roc", () => {
  it("gets {E} as it and as another creature you control enters", () => {
    const { game } = table();
    enter(game, "Aetherstorm Roc");
    expect(game.state.players[A].energy).toBe(1);
    enter(game, "Grizzly Bears");
    expect(game.state.players[A].energy).toBe(2);
    enter(game, "Grizzly Bears", B);
    expect(game.state.players[A].energy).toBe(2);
  });

  it("paying {E}{E} as it attacks puts a counter on it and taps a defender's creature", () => {
    const { game, a } = table();
    const roc = spawn(game, "Aetherstorm Roc");
    game.state.players[A].energy = 2;
    const blocker = spawn(game, "Grizzly Bears", B);
    pickTargets(a, blocker);
    pickModes(a, 0);
    attack(game, a, [roc]);
    expect({
      counters: counters(game, roc),
      tapped: game.state.objects[blocker].tapped,
      energy: game.state.players[A].energy,
      lifeB: life(game, B),
    }).toEqual({ counters: 1, tapped: true, energy: 0, lifeB: 16 });
  });
});

describe("Morbid Curiosity", () => {
  it("draws cards equal to the sacrificed permanent's mana value", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const angel = spawn(game, "Serra Angel");
    const spell = toHand(game, "Morbid Curiosity");
    const before = hand(game).length;
    cast(game, spell, { sacrifice: angel });
    expect(zone(game, angel)).toBe("graveyard");
    expect(hand(game).length).toBe(before - 1 + 5);
  });
});

describe("Cultivator of Blades", () => {
  it("gives the other attacking creatures +X/+X, X its power", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const cultivator = enter(game, "Cultivator of Blades");
    expect(pt(game, cultivator)).toEqual({ power: 3, toughness: 3 });
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [cultivator, bears]);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, cultivator)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Sequestered Stash", () => {
  it("mills five, then may put a milled artifact card back on top", () => {
    const { game, a } = table();
    const ring = toLibrary(game, "Sol Ring");
    lands(game, "Wastes", 4);
    const stash = spawn(game, "Sequestered Stash");
    pickFromZone(a, ring);
    activate(game, stash, 1);
    expect(zone(game, ring)).toBe("library");
    expect(graveyard(game)).toHaveLength(5); // four Wastes and the Stash
    expect(zone(game, stash)).toBe("graveyard");
  });
});

describe("Night Market Lookout", () => {
  it("drains each opponent for 1 when it becomes tapped", () => {
    const { game, a } = table();
    const lookout = spawn(game, "Night Market Lookout");
    attack(game, a, [lookout]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(21);
  });
});

describe("Nissa, Nature's Artisan", () => {
  it("−4 puts the land among the top two onto the battlefield and the other card into hand", () => {
    const { game } = table();
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const nissa = spawn(game, "Nissa, Nature's Artisan");
    loyalty(game, nissa, -4);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(hand(game)).toContain(bears);
  });
});

describe("Master Trinketeer", () => {
  it("makes a Servo, which gets +1/+1", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const trinketeer = spawn(game, "Master Trinketeer");
    activate(game, trinketeer, 0);
    const [servo] = named(game, "Servo Token");
    expect(pt(game, servo)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Deadlock Trap", () => {
  it("enters tapped with {E}{E}; its target is tapped and its abilities can't be activated this turn", () => {
    const { game } = table();
    const trap = enter(game, "Deadlock Trap");
    expect(game.state.objects[trap].tapped).toBe(true);
    expect(game.state.players[A].energy).toBe(2);
    game.state.objects[trap].tapped = false;
    const locked = spawn(game, "Prodigal Sorcerer");
    const free = spawn(game, "Prodigal Sorcerer");
    activate(game, trap, 0, { targets: [ref(locked)] });
    expect(game.state.objects[locked].tapped).toBe(true);
    expect(game.state.players[A].energy).toBe(1);
    game.state.objects[locked].tapped = false;
    const ping = (source: string) =>
      game.canDispatch({ type: "activate-ability", player: A, source: source as never, abilityIndex: 0, targets: [ref(B)] });
    expect(ping(locked)).not.toBeNull();
    expect(ping(free)).toBeNull();
  });
});

describe("Durable Handicraft", () => {
  it("pays {1} to put a counter on the creature that entered", () => {
    const { game, a } = table();
    lands(game, "Wastes", 1);
    spawn(game, "Durable Handicraft");
    pickModes(a, 0);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Tezzeret's Ambition", () => {
  it("discards a card with no artifact", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const spell = toHand(game, "Tezzeret's Ambition");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 3 - 1);
  });

  it("keeps all three with an artifact", () => {
    const { game } = table();
    lands(game, "Island", 5);
    spawn(game, "Sol Ring");
    const spell = toHand(game, "Tezzeret's Ambition");
    const before = hand(game).length;
    cast(game, spell);
    expect(hand(game).length).toBe(before - 1 + 3);
  });
});

describe("Grave Upheaval", () => {
  it("puts an opponent's creature card onto the battlefield under your control with haste", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const angel = toGraveyard(game, "Serra Angel", B);
    cast(game, toHand(game, "Grave Upheaval"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(controller(game, angel)).toBe(A);
    expect(keywords(game, angel).has("haste")).toBe(true);
  });
});

describe("Verdant Crescendo", () => {
  it("puts a basic land onto the battlefield tapped and finds Nissa in the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const nissa = toGraveyard(game, "Nissa, Nature's Artisan");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const landsBefore = game.battlefield.length;
    cast(game, toHand(game, "Verdant Crescendo"));
    expect(hand(game)).toContain(nissa);
    expect(game.battlefield.length).toBe(landsBefore + 1);
    const fetched = game.battlefield[game.battlefield.length - 1];
    expect(game.state.objects[fetched].cardName).toBe("Wastes");
    expect(game.state.objects[fetched].tapped).toBe(true);
  });
});

describe("Malfunction", () => {
  it("can enchant an artifact, tapping it", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const ring = spawn(game, "Sol Ring", B);
    const aura = toHand(game, "Malfunction");
    cast(game, aura, { targets: [ref(ring)] });
    expect(game.state.objects[aura].attachedTo).toBe(ring);
    expect(game.state.objects[ring].tapped).toBe(true);
  });
});

describe("Inventor's Goggles", () => {
  it("may attach itself to an Artificer that enters", () => {
    const { game, a } = table();
    const goggles = spawn(game, "Inventor's Goggles");
    pickModes(a, 0);
    const apprentice = enter(game, "Inventor's Apprentice");
    expect(game.state.objects[goggles].attachedTo).toBe(apprentice);
    // 1/2, +1/+1 for the artifact, +1/+2 from the Goggles.
    expect(pt(game, apprentice)).toEqual({ power: 3, toughness: 5 });
  });
});

describe("Dukhara Scavenger", () => {
  it("may put an artifact card from your graveyard on top of your library", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    pickTargets(a, ring);
    enter(game, "Dukhara Scavenger");
    expect(zone(game, ring)).toBe("library");
  });
});
