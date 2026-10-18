/**
 * March of the Machine's Sieges and their back faces — each test written from
 * the Oracle text and rulings, aimed at the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
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
  named,
  pickFromZone,
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
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** Accept the Siege's "you may cast it transformed" with its first offer. */
function castTransformed(seat: ScriptedController): void {
  seat.chooseCastNowFn = (_view, offer) => {
    const way = offer.casts[0];
    if (way === undefined) return null;
    return {
      type: "cast-spell",
      player: A,
      card: way.card,
      targets: [],
      via: way.via,
      ...(way.face !== undefined ? { face: way.face } : {}),
      ...(offer.free ? { free: true } : {}),
    };
  };
}

/** A Siege's back face on the battlefield, silently: the card spawned and
 * turned over (it's no longer a battle, so its defense counters go). */
function back(game: Game, front: string, player: PlayerId = A): ObjectId {
  const id = spawn(game, front, player);
  const object = game.state.objects[id];
  object.face = 1;
  delete object.counters.defense;
  invalidateComputedCache();
  return id;
}

/** The seat discards `card` whenever it discards (its hand starts with seven
 * Wastes, the front of it by default). */
function discardThis(seat: ScriptedController, card: ObjectId): void {
  seat.chooseDiscardsFn = (_hand, count) => [card].slice(0, count);
}

function castSiege(game: Game, name: string, mana: readonly [string, number][]): ObjectId {
  for (const [land, n] of mana) lands(game, land, n);
  const siege = toHand(game, name);
  cast(game, siege);
  return siege;
}

describe("Invasion of Kylem // Valor's Reach Tag Team, end to end", () => {
  it("defeated, it's cast transformed: the sorcery makes two Warriors, which grow attacking together", () => {
    const { game, a } = table();
    pickTargets(a, null, null);
    const siege = castSiege(game, "Invasion of Kylem", [["Mountain", 2], ["Plains", 2]]);
    expect(zone(game, siege)).toBe("battlefield");
    expect(counters(game, siege, "defense")).toBe(5);

    const wurm = spawn(game, "Craw Wurm");
    pickModes(a, 0);
    castTransformed(a);
    attack(game, a, [wurm], siege);
    // The last defense counter went: exiled, then cast as Valor's Reach Tag
    // Team, a sorcery, which resolved and went to its owner's graveyard.
    expect(zone(game, siege)).toBe("graveyard");
    const warriors = named(game, "Warrior Token (Valor's Reach Tag Team)", A);
    expect(tokensNamed(game, "Warrior Token (Valor's Reach Tag Team)", A)).toBe(2);
    expect(types(game, warriors[0])).toContain("creature");

    // Next turn both attack: each is "this token and at least one other
    // creature token", so each gets a counter.
    toStep(game, "precombat-main");
    const both = named(game, "Warrior Token (Valor's Reach Tag Team)", A);
    attack(game, a, both, B);
    const after = named(game, "Warrior Token (Valor's Reach Tag Team)", A);
    expect(after.map((w) => counters(game, w))).toEqual([1, 1]);

    // One alongside a nontoken creature only: no other creature token, no counter.
    toStep(game, "precombat-main");
    const one = named(game, "Warrior Token (Valor's Reach Tag Team)", A)[0];
    attack(game, a, [one, wurm], B);
    expect(counters(game, one)).toBe(1);
  });
});

describe("Invasion of Kylem", () => {
  it("up to two target creatures get +2/+0, vigilance and haste", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    pickTargets(a, bears, elves);
    castSiege(game, "Invasion of Kylem", [["Mountain", 2], ["Plains", 2]]);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, elves)).toEqual({ power: 3, toughness: 1 });
    expect(keywords(game, elves).has("vigilance")).toBe(true);
    expect(keywords(game, elves).has("haste")).toBe(true);
  });
});

describe("Invasion of Theros // Ephara, Ever-Sheltering", () => {
  it("finds an Aura, a God or a Demigod, and nothing else", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears");
    const aura = toLibrary(game, "Pacifism");
    const god = toLibrary(game, "Heliod, Sun-Crowned");
    const demigod = toLibrary(game, "Anax, Hardened in the Forge");
    const seen = pickFromZone(a, demigod);
    castSiege(game, "Invasion of Theros", [["Plains", 3]]);
    expect([...seen.offered].sort()).toEqual([aura, god, demigod].sort());
    expect(zone(game, demigod)).toBe("hand");
  });

  it("Ephara has lifelink and indestructible only with three other enchantments", () => {
    const { game } = table();
    const ephara = back(game, "Invasion of Theros");
    spawn(game, "Glorious Anthem");
    spawn(game, "Glorious Anthem");
    expect(keywords(game, ephara).has("indestructible")).toBe(false);
    spawn(game, "Glorious Anthem");
    expect(keywords(game, ephara).has("indestructible")).toBe(true);
    expect(keywords(game, ephara).has("lifelink")).toBe(true);
  });

  it("Ephara draws a card when another enchantment you control enters", () => {
    const { game } = table();
    back(game, "Invasion of Theros");
    const before = hand(game).length;
    enter(game, "Glorious Anthem");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Invasion of Shandalar // Leyline Surge", () => {
  it("returns up to three permanent cards from your graveyard, not an instant", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const anthem = toGraveyard(game, "Glorious Anthem");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [bears, anthem, null]);
    castSiege(game, "Invasion of Shandalar", [["Forest", 5]]);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, anthem)).toBe("hand");
  });

  it("Leyline Surge puts a permanent card from your hand onto the battlefield at upkeep", () => {
    const { game, a } = table();
    back(game, "Invasion of Shandalar");
    const bolt = toHand(game, "Lightning Bolt");
    const wurm = toHand(game, "Craw Wurm");
    const seen = pickFromZone(a, wurm);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("Invasion of Tolvada // The Broken Sky", () => {
  it("returns a nonbattle permanent card to the battlefield; a battle card isn't a target", () => {
    const { game, a } = table();
    const battle = toGraveyard(game, "Invasion of Theros");
    const wurm = toGraveyard(game, "Craw Wurm");
    const anthem = toGraveyard(game, "Glorious Anthem");
    const seen = watchTargets(a, () => [wurm]);
    castSiege(game, "Invasion of Tolvada", [["Plains", 3], ["Swamp", 2]]);
    expect([...seen.offered[0]].sort()).toEqual([wurm, anthem].sort());
    expect(zone(game, battle)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("creature tokens you control get +1/+0 and lifelink; your end step makes a Spirit", () => {
    const { game } = table();
    back(game, "Invasion of Tolvada");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    const spirit = named(game, "Spirit Token (White-Black)", A)[0];
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, spirit).has("lifelink")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(false);
  });
});

describe("Invasion of Innistrad // Deluge of the Dead", () => {
  it("has flash: cast in combat, its -13/-13 kills", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 4);
    toStep(game, "begin-combat");
    pickTargets(a, wurm);
    cast(game, toHand(game, "Invasion of Innistrad"));
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("Deluge exiles a card from a graveyard, making a Zombie only for a creature card", () => {
    const { game } = table();
    const deluge = back(game, "Invasion of Innistrad");
    lands(game, "Swamp", 6);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const opt = toGraveyard(game, "Opt", B);
    activate(game, deluge, 0, { targets: [ref(opt)] });
    expect(zone(game, opt)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
    activate(game, deluge, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Invasion of Mercadia // Kyren Flamewright", () => {
  it("discarding draws two", () => {
    const { game, a } = table();
    const card = toHand(game, "Opt");
    discardThis(a, card);
    pickModes(a, 0);
    const before = hand(game).length;
    castSiege(game, "Invasion of Mercadia", [["Mountain", 2]]);
    expect(zone(game, card)).toBe("graveyard");
    // One card went, two came (the Siege was put in hand after counting).
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("declining discards and draws nothing", () => {
    const { game, a } = table();
    pickModes(a);
    const before = hand(game).length;
    castSiege(game, "Invasion of Mercadia", [["Mountain", 2]]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toEqual([]);
  });

  it("Kyren's Elementals get +1/+0 and haste; a creature arriving later doesn't", () => {
    const { game } = table();
    const kyren = back(game, "Invasion of Mercadia");
    lands(game, "Mountain", 3);
    toHand(game, "Opt");
    activate(game, kyren, 0);
    const elementals = named(game, "Elemental Token (Prismari Pianist)", A);
    expect(tokensNamed(game, "Elemental Token (Prismari Pianist)", A)).toBe(2);
    expect(pt(game, elementals[0])).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, elementals[0]).has("haste")).toBe(true);
    expect(pt(game, kyren)).toEqual({ power: 4, toughness: 3 });
    const late = spawn(game, "Grizzly Bears");
    expect(pt(game, late)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, late).has("haste")).toBe(false);
  });
});

describe("Invasion of Ergamon // Truga Cliffcharger", () => {
  it("makes a Treasure, then loots", () => {
    const { game, a } = table();
    const card = toHand(game, "Opt");
    discardThis(a, card);
    pickModes(a, 0);
    const before = hand(game).length;
    castSiege(game, "Invasion of Ergamon", [["Mountain", 1], ["Forest", 1]]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(zone(game, card)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });

  it("defeated, Truga Cliffcharger is cast and its discard finds a land or battle card", () => {
    const { game, a } = table();
    pickModes(a);
    const siege = castSiege(game, "Invasion of Ergamon", [["Mountain", 1], ["Forest", 1]]);
    discardThis(a, toHand(game, "Opt"));
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    const battle = toLibrary(game, "Invasion of Theros");
    const wurm = spawn(game, "Craw Wurm");
    pickModes(a, 0);
    castTransformed(a);
    const seen = pickFromZone(a, battle);
    attack(game, a, [wurm], siege);
    expect(zone(game, siege)).toBe("battlefield");
    expect(game.state.objects[siege].face).toBe(1);
    expect(pt(game, siege)).toEqual({ power: 3, toughness: 4 });
    // The library is otherwise Wastes, which are lands too.
    expect(seen.offered).toContain(forest);
    expect(seen.offered).toContain(battle);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, battle)).toBe("hand");
  });
});

describe("Invasion of Ixalan", () => {
  it("offers only permanent cards among the top five", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const opt = toLibrary(game, "Opt");
    const seen = pickFromZone(a, bears);
    castSiege(game, "Invasion of Ixalan", [["Forest", 2]]);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(bolt);
    expect(seen.offered).not.toContain(opt);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Invasion of Karsus", () => {
  it("deals 3 to each creature and each planeswalker, no player", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ajani = spawn(game, "Ajani, Caller of the Pride", B);
    const startLoyalty = counters(game, ajani, "loyalty");
    castSiege(game, "Invasion of Karsus", [["Mountain", 4]]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, ajani, "loyalty")).toBe(startLoyalty - 3);
    expect(life(game, B)).toBe(20);
  });
});

describe("Aetherwing, Golden-Scale Flagship", () => {
  it("its power counts the artifacts you control, itself included; toughness stays 4", () => {
    const { game } = table();
    const ship = back(game, "Invasion of Kaladesh");
    spawn(game, "Sol Ring");
    expect(pt(game, ship)).toEqual({ power: 2, toughness: 4 });
  });
});

describe("Overloaded Mage-Ring", () => {
  it("copies a spell you control", () => {
    const { game } = table();
    const ring = back(game, "Invasion of Vryn");
    lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    activate(game, ring, 0, { targets: [ref(bolt)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, B)).toBe(14);
  });
});

describe("Invasion of Kamigawa // Rooftop Saboteurs", () => {
  it("taps an already tapped creature and stuns it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    castSiege(game, "Invasion of Kamigawa", [["Island", 4]]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(1);
  });

  it("Rooftop Saboteurs draws on combat damage to a battle", () => {
    const { game, a } = table();
    const saboteurs = back(game, "Invasion of Kamigawa");
    pickTargets(a, null);
    const siege = castSiege(game, "Invasion of Xerex", [["Plains", 2], ["Island", 2]]);
    const before = hand(game).length;
    attack(game, a, [saboteurs], siege);
    expect(counters(game, siege, "defense")).toBe(2);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Invasion of Ulgrotha // Grandmother Ravi Sengir", () => {
  it("can't target itself; deals 3 and gains you 3", () => {
    const { game, a } = table();
    const seen = watchTargets(a, () => [B]);
    const siege = castSiege(game, "Invasion of Ulgrotha", [["Swamp", 5]]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).not.toContain(siege);
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(23);
  });

  it("grows and gains life when an opponent's creature dies, not yours", () => {
    const { game } = table();
    const ravi = back(game, "Invasion of Ulgrotha");
    const theirs = spawn(game, "Grizzly Bears", B);
    const ours = spawn(game, "Grizzly Bears");
    destroy(game, theirs);
    expect(counters(game, ravi)).toBe(1);
    expect(life(game)).toBe(21);
    destroy(game, ours);
    expect(counters(game, ravi)).toBe(1);
    expect(life(game)).toBe(21);
  });
});

describe("Invasion of Muraganda // Primordial Plasm", () => {
  it("counter, then your creature fights up to one creature you don't control", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, wurm, bears);
    castSiege(game, "Invasion of Muraganda", [["Forest", 5]]);
    expect(counters(game, wurm)).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("with no second target, the counter still goes on", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm");
    pickTargets(a, wurm, null);
    castSiege(game, "Invasion of Muraganda", [["Forest", 5]]);
    expect(counters(game, wurm)).toBe(1);
  });

  it("Primordial Plasm's slurp: another creature gets +2/+2 and loses all abilities", () => {
    const { game, a } = table({ step: "upkeep" });
    back(game, "Invasion of Muraganda");
    const angel = back(game, "Invasion of Dominaria", B);
    pickTargets(a, angel);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, angel)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, angel).has("flying")).toBe(false);
  });
});

describe("Vertex Paladin", () => {
  it("is as big as the number of creatures you control", () => {
    const { game } = table();
    const paladin = back(game, "Invasion of Xerex");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, paladin)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Invasion of Xerex", () => {
  it("returns a creature to its owner's hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    castSiege(game, "Invasion of Xerex", [["Plains", 2], ["Island", 2]]);
    expect(zone(game, bears)).toBe("hand");
    expect(graveyard(game, B)).not.toContain(bears);
  });
});
