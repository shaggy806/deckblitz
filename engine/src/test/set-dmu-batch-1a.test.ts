/**
 * Dominaria United Commander, group a. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
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
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  registryOf as registryOfGame,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const FIVE_BASICS = ["Plains", "Island", "Swamp", "Mountain", "Forest"] as const;
const basics = (game: Game): void => {
  for (const land of FIVE_BASICS) spawn(game, land);
};
const pool = (game: Game): string[] => game.state.players[A].manaPool.map((unit) => unit.type).sort();
const canCast = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
/** A real token (a spawned token card isn't one), created for `player`. */
const token = (game: Game, name: string, player = A): ObjectId => {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 }, []);
  settle(game);
  return game.battlefield.find((id) => !before.has(id))!;
};

describe("Jenson Carthalion, Druid Exile", () => {
  it("a five-colour spell makes a 4/4 flying, vigilant Angel", () => {
    const { game } = table();
    spawn(game, "Jenson Carthalion, Druid Exile");
    basics(game);
    cast(game, toHand(game, "Fusion Elemental"));
    expect(tokensNamed(game, "4/4 Vigilant Angel Token", A)).toBe(1);
    const angel = named(game, "4/4 Vigilant Angel Token", A)[0];
    expect(keywords(game, angel).has("flying")).toBe(true);
    expect(keywords(game, angel).has("vigilance")).toBe(true);
  });

  it("a two-colour spell only scries; a mono-coloured one doesn't trigger", () => {
    const { game, a } = table();
    spawn(game, "Jenson Carthalion, Druid Exile");
    let scries = 0;
    a.chooseScryFn = () => {
      scries += 1;
      return [];
    };
    lands(game, "Forest", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Watchwolf"));
    expect(scries).toBe(1);
    expect(tokensNamed(game, "4/4 Vigilant Angel Token", A)).toBe(0);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(scries).toBe(1);
  });

  it("{5}, {T}: adds one mana of each colour", () => {
    const { game } = table();
    const jenson = spawn(game, "Jenson Carthalion, Druid Exile");
    lands(game, "Wastes", 5);
    activate(game, jenson, 0, { settle: false });
    expect(pool(game)).toEqual(["B", "G", "R", "U", "W"]);
  });
});

describe("Mana Cannons", () => {
  it("deals damage equal to the multicoloured spell's number of colours", () => {
    const { game, a } = table();
    spawn(game, "Mana Cannons");
    basics(game);
    pickTargets(a, B);
    cast(game, toHand(game, "Fusion Elemental"));
    expect(life(game, B)).toBe(15);
  });

  it("two colours, two damage; mono-coloured spells don't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Mana Cannons");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    pickTargets(a, B);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 3 - 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20 - 3 - 2 - 2);
  });
});

describe("Obsidian Obelisk", () => {
  it("enters tapped", () => {
    const { game } = table();
    const obelisk = enter(game, "Obsidian Obelisk");
    expect(tapped(game, obelisk)).toBe(true);
  });

  it("its coloured mana casts only a multicoloured spell", () => {
    const { game } = table();
    const obelisk = spawn(game, "Obsidian Obelisk");
    game.state.objects[obelisk].tapped = false; // as though a turn had passed
    spawn(game, "Plains");
    const elves = toHand(game, "Llanowar Elves");
    const wolf = toHand(game, "Watchwolf");
    game.dispatch({ type: "activate-ability", player: A, source: obelisk, abilityIndex: 1, manaColors: ["G"] });
    expect(pool(game)).toEqual(["G"]);
    expect(canCast(game, elves)).toBe(false);
    expect(canCast(game, wolf)).toBe(true);
  });
});

describe("Iridian Maelstrom", () => {
  it("destroys every creature that isn't all colours, colourless ones included", () => {
    const { game } = table();
    basics(game);
    const fusion = spawn(game, "Fusion Elemental", B);
    const wolf = spawn(game, "Watchwolf", B);
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter", B);
    cast(game, toHand(game, "Iridian Maelstrom"));
    expect(zone(game, fusion)).toBe("battlefield");
    expect(zone(game, wolf)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("graveyard");
  });
});

describe("Jared Carthalion", () => {
  it("+1: a 3/3 trampling Kavu that's all colours", () => {
    const { game } = table();
    const jared = spawn(game, "Jared Carthalion");
    loyalty(game, jared, 1, { atLeast: 5 });
    const kavu = named(game, "Kavu Token (Jared Carthalion)", A)[0];
    expect(pt(game, kavu)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, kavu).has("trample")).toBe(true);
    // All colours: the Maelstrom spares it.
    basics(game);
    cast(game, toHand(game, "Iridian Maelstrom"));
    expect(zone(game, kavu)).toBe("battlefield");
  });

  it("−3: each target gets a counter per colour it is", () => {
    const { game } = table();
    const jared = spawn(game, "Jared Carthalion");
    const wolf = spawn(game, "Watchwolf");
    const fusion = spawn(game, "Fusion Elemental", B);
    loyalty(game, jared, -3, { atLeast: 5, targets: [ref(wolf), ref(fusion)] });
    expect(counters(game, wolf)).toBe(2);
    expect(counters(game, fusion)).toBe(5);
  });

  it("−6: a five-colour card also draws and makes two Treasures; only multicoloured cards are offered", () => {
    const { game } = table();
    const jared = spawn(game, "Jared Carthalion");
    const fusion = toGraveyard(game, "Fusion Elemental");
    const bears = toGraveyard(game, "Grizzly Bears");
    game.state.objects[jared].counters.loyalty = 6;
    const minusSix = registryOfGame(game)
      .get("Jared Carthalion")
      .activated.findIndex((ab) => ab.loyaltyCost === -6);
    const refusal = (card: ObjectId): string | null =>
      game.canDispatch({ type: "activate-ability", player: A, source: jared, abilityIndex: minusSix, targets: [ref(card)] });
    expect(refusal(bears)).not.toBeNull();
    expect(refusal(fusion)).toBeNull();
    const before = hand(game).length;
    loyalty(game, jared, -6, { targets: [ref(fusion)] });
    expect(zone(game, fusion)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("−6: a two-colour card just returns", () => {
    const { game } = table();
    const jared = spawn(game, "Jared Carthalion");
    const wolf = toGraveyard(game, "Watchwolf");
    const before = hand(game).length;
    loyalty(game, jared, -6, { atLeast: 6, targets: [ref(wolf)] });
    expect(zone(game, wolf)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Baru, Wurmspeaker", () => {
  it("Wurms you control get +2/+2 and trample; others don't", () => {
    const { game } = table();
    spawn(game, "Baru, Wurmspeaker");
    const wurm = token(game, "Wurm Token (Baru, Wurmspeaker)");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = token(game, "Wurm Token (Baru, Wurmspeaker)", B);
    expect(pt(game, wurm)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, wurm).has("trample")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });

  it("costs {X} less for the greatest Wurm power, never below {G} (the ruling)", () => {
    const { game } = table();
    const baru = spawn(game, "Baru, Wurmspeaker");
    // No Wurms: {7}{G} with two Forests can't be paid.
    lands(game, "Forest", 2);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: baru, abilityIndex: 0, targets: [] })).not.toBeNull();
    // A Wurm with power 6 (4/4 + 2): {1}{G}.
    token(game, "Wurm Token (Baru, Wurmspeaker)");
    activate(game, baru, 0);
    expect(tokensNamed(game, "Wurm Token (Baru, Wurmspeaker)", A)).toBe(2);
  });

  it("a Wurm with power over 7 still leaves {G} to pay", () => {
    const { game } = table();
    const baru = spawn(game, "Baru, Wurmspeaker");
    token(game, "6/6 Wurm Token");
    const offered = (): boolean =>
      game.canDispatch({ type: "activate-ability", player: A, source: baru, abilityIndex: 0, targets: [] }) === null;
    expect(offered()).toBe(false);
    spawn(game, "Forest");
    expect(offered()).toBe(true);
  });
});

describe("Rosnakht, Heir of Rohgahh", () => {
  it("heroic: a spell targeting it makes Kobolds of Kher Keep; one targeting another creature doesn't", () => {
    const { game } = table();
    const rosnakht = spawn(game, "Rosnakht, Heir of Rohgahh");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(rosnakht)] });
    expect(tokensNamed(game, "Kobolds of Kher Keep", A)).toBe(1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(tokensNamed(game, "Kobolds of Kher Keep", A)).toBe(1);
  });

  it("battle cry pumps each other attacker", () => {
    const { game, a } = table();
    const rosnakht = spawn(game, "Rosnakht, Heir of Rohgahh");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [rosnakht, bears]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, rosnakht)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Rohgahh, Kher Keep Overlord", () => {
  it("other Kobolds get +2/+2", () => {
    const { game } = table();
    const rohgahh = spawn(game, "Rohgahh, Kher Keep Overlord");
    const kobold = spawn(game, "Kobolds of Kher Keep");
    expect(pt(game, kobold)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, rohgahh)).toEqual({ power: 4, toughness: 4 });
  });

  it("a Kobold spell: pay {2} for a 4/4 flying Dragon, or decline", () => {
    const { game, a } = table();
    spawn(game, "Rohgahh, Kher Keep Overlord");
    lands(game, "Mountain", 2);
    pickModes(a);
    cast(game, toHand(game, "Kobolds of Kher Keep"));
    expect(tokensNamed(game, "Dragon Token (Dragonback Assault)", A)).toBe(0);
    pickModes(a, 0);
    cast(game, toHand(game, "Kobolds of Kher Keep"));
    expect(tokensNamed(game, "Dragon Token (Dragonback Assault)", A)).toBe(1);
  });

  it("a Dragon spell makes Kobolds of Kher Keep", () => {
    const { game } = table();
    spawn(game, "Rohgahh, Kher Keep Overlord");
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Shivan Dragon"));
    expect(tokensNamed(game, "Kobolds of Kher Keep", A)).toBe(1);
  });
});

describe("Torsten, Founder of Benalia", () => {
  it("takes any number of the revealed creature and land cards; the rest go to the bottom", () => {
    const { game, a } = table();
    for (let i = 0; i < 3; i++) toLibrary(game, "Sol Ring");
    const forest = toLibrary(game, "Forest");
    const ring = toLibrary(game, "Sol Ring");
    const bears = toLibrary(game, "Grizzly Bears");
    const wolf = toLibrary(game, "Watchwolf");
    const seen = pickFromZone(a, bears, forest);
    enter(game, "Torsten, Founder of Benalia");
    expect([...seen.offered].sort()).toEqual([wolf, bears, forest].sort());
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, wolf)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(ring)).toBeLessThan(library.length);
    expect(library.slice(-5)).toContain(ring);
    expect(library.slice(-5)).toContain(wolf);
  });

  it("dies: seven 1/1 Soldiers", () => {
    const { game } = table();
    const torsten = spawn(game, "Torsten, Founder of Benalia");
    destroy(game, torsten);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(7);
  });
});

describe("The Mana Rig", () => {
  it("a multicoloured spell makes a tapped Powerstone", () => {
    const { game } = table();
    spawn(game, "The Mana Rig");
    lands(game, "Forest", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Watchwolf"));
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
    expect(tapped(game, named(game, "Powerstone Token", A)[0])).toBe(true);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(tokensNamed(game, "Powerstone Token", A)).toBe(1);
  });

  it("{X}{X}{X}, {T}: looks at X and takes up to two", () => {
    const { game, a } = table();
    const rig = spawn(game, "The Mana Rig");
    lands(game, "Wastes", 9);
    const deep = toLibrary(game, "Sol Ring");
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Watchwolf");
    const three = toLibrary(game, "Forest");
    const seen = pickFromZone(a, three, one);
    activate(game, rig, 0, { x: 3 });
    expect([...seen.offered].sort()).toEqual([one, two, three].sort());
    expect(zone(game, three)).toBe("hand");
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("library");
    expect(zone(game, deep)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(two);
    expect(library[0]).toBe(deep);
  });
});

describe("Ohabi Caleria", () => {
  it("your Archers untap during each other player's untap step; other creatures don't", () => {
    const { game } = table();
    const ohabi = spawn(game, "Ohabi Caleria", A, { tapped: true });
    const archer = spawn(game, "Centaur Archer", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Centaur Archer", B, { tapped: true });
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(tapped(game, ohabi)).toBe(false);
    expect(tapped(game, archer)).toBe(false);
    expect(tapped(game, bears)).toBe(true);
    expect(tapped(game, theirs)).toBe(false);
  });

  it("an Archer dealing damage to a creature: pay {2} to draw", () => {
    const { game, a } = table();
    spawn(game, "Ohabi Caleria");
    const archer = spawn(game, "Centaur Archer");
    const thopter = spawn(game, "Ornithopter", B);
    lands(game, "Wastes", 2);
    pickModes(a, 0);
    const before = hand(game).length;
    activate(game, archer, 0, { targets: [ref(thopter)] });
    expect(hand(game).length).toBe(before + 1);
  });

  it("a non-Archer's damage doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, "Ohabi Caleria");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 3);
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before);
  });
});

describe("Jedit Ojanen, Mercenary", () => {
  it("itself and another legendary creature entering: pay {G} for a forestwalking Cat Warrior", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    pickModes(a, 0);
    enter(game, "Jedit Ojanen, Mercenary");
    expect(tokensNamed(game, "Cat Warrior Token", A)).toBe(1);
    enter(game, "Rohgahh, Kher Keep Overlord");
    expect(tokensNamed(game, "Cat Warrior Token", A)).toBe(2);
    const cat = named(game, "Cat Warrior Token", A)[0];
    expect(keywords(game, cat).has("forestwalk")).toBe(true);
  });

  it("a nonlegendary creature doesn't trigger it, and declining makes nothing", () => {
    const { game, a } = table();
    spawn(game, "Jedit Ojanen, Mercenary");
    lands(game, "Forest", 2);
    pickModes(a, 0);
    enter(game, "Grizzly Bears");
    expect(tokensNamed(game, "Cat Warrior Token", A)).toBe(0);
    pickModes(a);
    enter(game, "Rohgahh, Kher Keep Overlord");
    expect(tokensNamed(game, "Cat Warrior Token", A)).toBe(0);
  });
});

describe("Tobias, Doomed Conqueror", () => {
  it("counts every nontoken creature you controlled that died this turn, itself included", () => {
    const { game } = table();
    const tobias = spawn(game, "Tobias, Doomed Conqueror");
    const bears = spawn(game, "Grizzly Bears");
    const soldier = token(game, "Soldier Token");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    destroy(game, soldier);
    destroy(game, theirs);
    destroy(game, tobias);
    expect(graveyard(game)).toContain(tobias);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
  });
});
