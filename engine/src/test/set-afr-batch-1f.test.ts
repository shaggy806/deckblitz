/**
 * Adventures in the Forgotten Realms and its Commander set, group f: Midnight Pathlighter, Power
 * Word Kill, Death Tyrant, Farideh's Fireball, Icingdeath, Frost Tyrant, You Find a Cursed Idol,
 * Feywild Trickster, Price of Loyalty, Cloister Gargoyle, You Meet in a Tavern, Djinni Windseer,
 * Bag of Tricks, Mimic, Devour Intellect, Loathsome Troll, Hunter's Mark and Hired Hexblade.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { manaValueOfObject } from "../filter.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";
import type { BlockOffer } from "./harness.js";

const ventures = (game: Game, player = A): number =>
  game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;

/** Enter Lost Mine of Phandelver whenever asked, and take the first room at a fork. */
const intoLostMine = (seat: ScriptedController): void => {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined ? { dungeon: "Lost Mine of Phandelver" } : { room: offer.rooms![0]! };
};

const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("Midnight Pathlighter", () => {
  it("your creatures can be blocked only by legendary creatures", () => {
    const { game, a } = table();
    spawn(game, "Midnight Pathlighter");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const legend = spawn(game, "Barktooth Warbeard", B);
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, giant)).toEqual([]);
    expect(canBlock(offer, legend)).toEqual([bears]);
  });

  it("ventures once for one or more creatures dealing combat damage to a player", () => {
    const { game, a } = table();
    intoLostMine(a);
    const pathlighter = spawn(game, "Midnight Pathlighter");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [pathlighter, bears]);
    expect(life(game, B)).toBe(16);
    expect(ventures(game)).toBe(1);
  });
});

describe("Power Word Kill", () => {
  it("can't target an Angel, Demon, Devil or Dragon", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const dragon = spawn(game, "Shivan Dragon", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Power Word Kill");
    expect(() => cast(game, spell, { targets: [ref(dragon)] })).toThrow();
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Death Tyrant", () => {
  it("a Zombie for a blocking creature an opponent controls that dies", () => {
    const { game, a, b } = table();
    spawn(game, "Death Tyrant");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("a Zombie for an attacking creature you control that dies; none for a creature dying outside combat", () => {
    const { game, a, b } = table();
    spawn(game, "Death Tyrant");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    destroy(game, giant, A);
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("nothing for your blocking creature or an opponent's attacking creature dying", () => {
    const { game, a, b } = table();
    spawn(game, "Death Tyrant");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const wall = spawn(game, "Hill Giant");
    a.declareBlockersFn = () => [
      { blocker: bears, attacker: giant },
      { blocker: wall, attacker: elves },
    ];
    attack(game, b, [giant, elves], A);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("{5}{B}: returns from your graveyard tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const tyrant = toGraveyard(game, "Death Tyrant");
    activate(game, tyrant);
    expect(zone(game, tyrant)).toBe("battlefield");
    expect(game.state.objects[tyrant].tapped).toBe(true);
  });
});

describe("Farideh's Fireball", () => {
  it("5 to the target, then 2 to each player on 1—9 or to each opponent on 10—20", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      lands(game, "Mountain", 5);
      const angel = spawn(game, "Serra Angel", B);
      cast(game, toHand(game, "Farideh's Fireball"), { targets: [ref(angel)] });
      expect(zone(game, angel)).toBe("graveyard");
      const total = game.state.lastRoll!.total;
      expect(life(game, B)).toBe(18);
      expect(life(game, A)).toBe(total <= 9 ? 18 : 20);
    }
  });
});

describe("Icingdeath, Frost Tyrant", () => {
  it("dies into Icingdeath, Frost Tongue, a legendary white Equipment token", () => {
    const { game } = table();
    const icingdeath = spawn(game, "Icingdeath, Frost Tyrant");
    destroy(game, icingdeath);
    settle(game);
    const [tongue] = named(game, "Icingdeath, Frost Tongue", A);
    expect(tongue).toBeDefined();
    expect(game.state.objects[tongue!].isToken).toBe(true);
    expect(supertypes(game, tongue!)).toContain("legendary");
    expect(subtypes(game, tongue!)).toContain("Equipment");
  });

  it("Frost Tongue: +2/+0, and its wielder taps a creature defending player controls as it attacks", () => {
    const { game, a } = table();
    const tongue = spawn(game, "Icingdeath, Frost Tongue");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, tongue, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    const giant = spawn(game, "Hill Giant", B);
    a.chooseTargetsFn = () => [ref(giant)];
    attack(game, a, [bears]);
    expect(game.state.objects[giant].tapped).toBe(true);
  });
});

describe("You Find a Cursed Idol", () => {
  it("Steal Its Eyes: a Treasure and a venture", () => {
    const { game, a } = table();
    intoLostMine(a);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "You Find a Cursed Idol"), { modes: [2] });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(ventures(game)).toBe(1);
  });
});

describe("You Meet in a Tavern", () => {
  it("Form a Party: any number of the top five's creature cards to hand, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible;
    cast(game, toHand(game, "You Meet in a Tavern"), { modes: [0] });
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(named(game, "Lightning Bolt", A).every((id) => library.slice(-3).includes(id))).toBe(true);
  });
});

describe("Djinni Windseer and Feywild Trickster", () => {
  it("the d20's row decides how many to scry; the roll makes a Faerie Dragon", () => {
    for (const seed of [1, 2, 3, 4]) {
      const { game, a } = table({ seed });
      spawn(game, "Feywild Trickster");
      let looked = 0;
      a.chooseScryFn = (_view, cards) => {
        looked = cards.length;
        return [];
      };
      enter(game, "Djinni Windseer");
      const total = game.state.lastRoll!.total;
      expect(looked).toBe(total <= 9 ? 1 : total <= 19 ? 2 : 3);
      expect(tokensNamed(game, "Faerie Dragon Token", A)).toBe(1);
    }
  });
});

describe("Cloister Gargoyle", () => {
  it("ventures as it enters; +3/+0 and flying once you've completed a dungeon", () => {
    const { game, a } = table();
    intoLostMine(a);
    const gargoyle = enter(game, "Cloister Gargoyle");
    expect(ventures(game)).toBe(1);
    expect(pt(game, gargoyle)).toEqual({ power: 0, toughness: 4 });
    expect(keywords(game, gargoyle).has("flying")).toBe(false);
    game.state.players[A].completedDungeons = ["Lost Mine of Phandelver"];
    expect(pt(game, gargoyle)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, gargoyle).has("flying")).toBe(true);
  });
});

describe("Mimic", () => {
  it("{2}: a 3/3 Shapeshifter artifact creature until end of turn, still a Treasure", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const mimic = spawn(game, "Mimic");
    activate(game, mimic, 1);
    expect(types(game, mimic)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, mimic)).toEqual(expect.arrayContaining(["Treasure", "Shapeshifter"]));
    expect(pt(game, mimic)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Bag of Tricks", () => {
  it("puts the first creature card with mana value equal to the d8 onto the battlefield", () => {
    let hits = 0;
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game } = table({ seed });
      lands(game, "Forest", 5);
      const bag = spawn(game, "Bag of Tricks");
      const creatures = ["Llanowar Elves", "Grizzly Bears", "Hill Giant", "Serra Angel", "Shivan Dragon"].map((name) =>
        toLibrary(game, name),
      );
      activate(game, bag);
      const total = game.state.lastRoll!.total;
      const onField = creatures.filter((id) => zone(game, id) === "battlefield");
      const registry = registryOf(game);
      const matching = creatures.filter((id) => manaValueOfObject(registry, game.state.objects[id]) === total);
      expect(onField).toEqual(matching);
      hits += onField.length;
    }
    expect(hits).toBeGreaterThan(0);
  });
});

describe("Hired Hexblade", () => {
  it("draws and loses 1 life only if Treasure mana was spent to cast it", () => {
    const withTreasure = table();
    lands(withTreasure.game, "Wastes", 1);
    spawn(withTreasure.game, "Treasure Token");
    const before = hand(withTreasure.game).length;
    cast(withTreasure.game, toHand(withTreasure.game, "Hired Hexblade"));
    expect(hand(withTreasure.game)).toHaveLength(before + 1);
    expect(life(withTreasure.game)).toBe(19);

    const without = table();
    lands(without.game, "Swamp", 2);
    const beforeToo = hand(without.game).length;
    cast(without.game, toHand(without.game, "Hired Hexblade"));
    expect(hand(without.game)).toHaveLength(beforeToo);
    expect(life(without.game)).toBe(20);
  });
});

describe("Devour Intellect", () => {
  it("without Treasure mana: the opponent discards a card of their choice", () => {
    const { game, b } = table();
    lands(game, "Swamp", 1);
    const bolt = toHand(game, "Lightning Bolt", B);
    const land = toHand(game, "Forest", B);
    b.chooseDiscardsFn = () => [land];
    cast(game, toHand(game, "Devour Intellect"), { targets: [ref(B)] });
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
  });

  it("with Treasure mana: you choose a nonland card from their hand", () => {
    const { game, a } = table();
    spawn(game, "Treasure Token");
    const bolt = toHand(game, "Lightning Bolt", B);
    const land = toHand(game, "Forest", B);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [bolt];
    };
    cast(game, toHand(game, "Devour Intellect"), { targets: [ref(B)] });
    expect(offered).not.toContain(land);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, land)).toBe("hand");
  });
});

describe("Price of Loyalty", () => {
  it("steals, untaps and hastes; +2/+0 only when Treasure mana paid for it", () => {
    const paid = table();
    lands(paid.game, "Wastes", 2);
    spawn(paid.game, "Treasure Token");
    const giant = spawn(paid.game, "Hill Giant", B, { tapped: true });
    cast(paid.game, toHand(paid.game, "Price of Loyalty"), { targets: [ref(giant)] });
    expect(paid.game.state.objects[giant].controller).toBe(A);
    expect(paid.game.state.objects[giant].tapped).toBe(false);
    expect(keywords(paid.game, giant).has("haste")).toBe(true);
    expect(pt(paid.game, giant)).toEqual({ power: 5, toughness: 3 });

    const plain = table();
    lands(plain.game, "Mountain", 3);
    const other = spawn(plain.game, "Hill Giant", B);
    cast(plain.game, toHand(plain.game, "Price of Loyalty"), { targets: [ref(other)] });
    expect(plain.game.state.objects[other].controller).toBe(A);
    expect(pt(plain.game, other)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Hunter's Mark", () => {
  it("costs {3} less aimed at a blue permanent you don't control", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const crow = spawn(game, "Storm Crow", B);
    const giant = spawn(game, "Hill Giant", B);
    const mark = toHand(game, "Hunter's Mark");
    expect(() => cast(game, mark, { targets: [ref(bears), ref(giant)] })).toThrow();
    cast(game, mark, { targets: [ref(bears), ref(crow)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, crow)).toBe("graveyard");
    expect(graveyard(game)).toContain(mark);
  });
});

describe("Loathsome Troll", () => {
  it("from the graveyard: the d20's row puts it on top, in hand or onto the battlefield tapped", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      lands(game, "Forest", 4);
      const troll = toGraveyard(game, "Loathsome Troll");
      activate(game, troll);
      const total = game.state.lastRoll!.total;
      if (total <= 9) {
        expect(zone(game, troll)).toBe("library");
        expect(game.state.zones.perPlayer[A].library[0]).toBe(troll);
      } else if (total <= 19) {
        expect(zone(game, troll)).toBe("hand");
      } else {
        expect(zone(game, troll)).toBe("battlefield");
        expect(game.state.objects[troll].tapped).toBe(true);
      }
    }
  });

  it("can't be activated from the battlefield", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const troll = spawn(game, "Loathsome Troll");
    expect(() => activate(game, troll)).toThrow();
  });
});
