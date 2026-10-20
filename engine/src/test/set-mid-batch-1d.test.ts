/**
 * Innistrad: Midnight Hunt (and Midnight Hunt Commander), group d. One test
 * (or two) per card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  destroy,
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
  tokensNamed,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const pool = (game: Game, player: PlayerId = A): readonly string[] =>
  game.state.players[player].manaPool.map((u) => u.type);
const loseLife = (game: Game, player: PlayerId, amount = 1): void =>
  game.debugApplyEffect(player, { kind: "lose-life", amount, target: 0 }, [ref(player)]);
/** `source` (a real permanent) deals `amount` damage to `target`. */
const damage = (game: Game, source: ObjectId, target: ObjectId, amount: number): void => {
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [ref(target)], {
    source,
  });
  settle(game);
};
/** Cast `card` from A's graveyard by flashback. */
const flashback = (game: Game, card: ObjectId, targets: readonly ObjectId[] = []): void => {
  game.dispatch({ type: "cast-spell", player: A, card, targets: targets.map(ref), via: "flashback" });
  settle(game);
};

describe("Blessed Defiance", () => {
  it("pumps and grants lifelink, and makes a Spirit when that creature dies this turn", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Blessed Defiance"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(0);
    destroy(game, bears);
    expect(tokensNamed(game, "Spirit Token", A)).toBe(1);
  });
});

describe("Bramble Armor", () => {
  it("attaches itself to target creature you control as it enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    pickTargets(a, bears);
    const armor = toHand(game, "Bramble Armor");
    cast(game, armor);
    expect(game.state.objects[armor].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Devoted Grafkeeper // Departed Soulkeeper", () => {
  it("mills two as it enters, and taps a creature you don't control when you cast a spell from your graveyard", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", B);
    const before = library(game).length;
    const keeper = toHand(game, "Devoted Grafkeeper");
    cast(game, keeper);
    expect(library(game).length).toBe(before - 2);
    const courage = toGraveyard(game, "Homestead Courage");
    pickTargets(a, giant);
    flashback(game, courage, [keeper]);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("disturbed, it's the back face, and is exiled rather than going to the graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const card = toGraveyard(game, "Devoted Grafkeeper");
    game.dispatch({ type: "cast-spell", player: A, card, targets: [], via: "disturb", face: 1 });
    settle(game);
    expect(printedCardName(game.state.objects[card])).toBe("Departed Soulkeeper");
    expect(pt(game, card)).toEqual({ power: 3, toughness: 1 });
    destroy(game, card);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Famished Foragers", () => {
  it("adds {R}{R}{R} as it enters only if an opponent lost life this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Famished Foragers"));
    expect(pool(game)).toEqual([]);
    loseLife(game, B);
    cast(game, toHand(game, "Famished Foragers"));
    expect(pool(game)).toEqual(["R", "R", "R"]);
  });

  it("{2}{R}, discard a card: draw a card", () => {
    const { game, a } = table();
    const foragers = spawn(game, "Famished Foragers");
    lands(game, "Mountain", 3);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    a.chooseDiscardsFn = () => [bolt];
    activate(game, foragers);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Flare of Faith", () => {
  it("gives a Human +3/+3 and indestructible instead of +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const human = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Flare of Faith"), { targets: [ref(human)] });
    expect(pt(game, human)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, human).has("indestructible")).toBe(true);
    cast(game, toHand(game, "Flare of Faith"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });
});

describe("Fleshtaker", () => {
  it("sacrificing another creature pumps it, gains 1 life and scries 1", () => {
    const { game, a } = table();
    const taker = spawn(game, "Fleshtaker");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    game.dispatch({ type: "activate-ability", player: A, source: taker, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(pt(game, taker)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, A)).toBe(21);
    expect(scried).toBe(1);
  });

  it("doesn't trigger on its own sacrifice", () => {
    const { game } = table();
    const taker = spawn(game, "Fleshtaker");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(taker)]);
    settle(game);
    expect(zone(game, taker)).toBe("graveyard");
    expect(life(game, A)).toBe(20);
  });
});

describe("Gavony Silversmith", () => {
  it("puts a +1/+1 counter on each of up to two target creatures", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    cast(game, toHand(game, "Gavony Silversmith"));
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Hedgewitch's Mask", () => {
  it("equipped creature gets +1/+1 and can't be blocked by creatures with power 4 or greater", () => {
    const { game, a } = table();
    const mask = spawn(game, "Hedgewitch's Mask");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, mask, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const giant = spawn(game, "Hill Giant", B); // 3/3
    const angel = spawn(game, "Serra Angel", B); // 4/4
    const offer = blockOffer(game, a, [bears]);
    expect(offer.eligible.find((e) => e.blocker === giant)?.canBlock).toEqual([bears]);
    expect(offer.eligible.find((e) => e.blocker === angel)?.canBlock ?? []).toEqual([]);
  });
});

describe("Homestead Courage", () => {
  it("a counter and vigilance, again by flashback, then exiled", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const courage = toHand(game, "Homestead Courage");
    cast(game, courage, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(zone(game, courage)).toBe("graveyard");
    flashback(game, courage, [bears]);
    expect(counters(game, bears)).toBe(2);
    expect(zone(game, courage)).toBe("exile");
  });
});

describe("Kurbis, Harvest Celebrant", () => {
  it("enters with a counter for each mana spent to cast it", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const kurbis = toHand(game, "Kurbis, Harvest Celebrant");
    cast(game, kurbis, { x: 2 });
    expect(counters(game, kurbis)).toBe(4);
    expect(pt(game, kurbis)).toEqual({ power: 4, toughness: 4 });
  });

  it("removing a counter prevents all damage to another creature with a +1/+1 counter this turn", () => {
    const { game } = table();
    const kurbis = spawn(game, "Kurbis, Harvest Celebrant");
    game.state.objects[kurbis].counters["+1/+1"] = 3;
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const activation = (target: ObjectId) =>
      ({ type: "activate-ability", player: A, source: kurbis, abilityIndex: 0, targets: [ref(target)] }) as const;
    // Another creature, and one with a +1/+1 counter on it.
    expect(game.canDispatch(activation(kurbis))).not.toBeNull();
    expect(game.canDispatch(activation(plain))).not.toBeNull();
    activate(game, kurbis, 0, { targets: [ref(bears)] });
    expect(counters(game, kurbis)).toBe(2);
    // The shield holds once the counter that made it a legal target is gone.
    game.state.objects[bears].counters["+1/+1"] = 0;
    damage(game, giant, bears, 5);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked ?? 0).toBe(0);
  });
});

describe("Nebelgast Intruder", () => {
  it("gives up to one creature an opponent controls -2/-0 as it enters", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Nebelgast Intruder"));
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Ominous Roost", () => {
  it("makes a Bird as it enters and whenever you cast a spell from your graveyard, not from your hand", () => {
    const { game } = table();
    lands(game, "Island", 9);
    cast(game, toHand(game, "Ominous Roost"));
    expect(tokensNamed(game, "Bird Token (Ominous Roost)", A)).toBe(1);
    cast(game, toHand(game, "Think Twice"));
    expect(tokensNamed(game, "Bird Token (Ominous Roost)", A)).toBe(1);
    flashback(game, toGraveyard(game, "Think Twice"));
    expect(tokensNamed(game, "Bird Token (Ominous Roost)", A)).toBe(2);
    const [bird] = named(game, "Bird Token (Ominous Roost)");
    expect(keywords(game, bird).has("flying")).toBe(true);
  });
});

describe("Organ Hoarder", () => {
  it("puts one of the top three into your hand and the rest into your graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const forest = toLibrary(game, "Forest");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, bolt);
    cast(game, toHand(game, "Organ Hoarder"));
    expect(zone(game, bolt)).toBe("hand");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Path to the Festival", () => {
  it("fetches a basic land tapped, then scries 1 with three basic land types among your lands", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    spawn(game, "Plains");
    const island = toLibrary(game, "Island");
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    pickFromZone(a, island);
    cast(game, toHand(game, "Path to the Festival"));
    expect(zone(game, island)).toBe("battlefield");
    expect(game.state.objects[island].tapped).toBe(true);
    expect(scried).toBe(1);
  });

  it("doesn't scry with only two basic land types", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toLibrary(game, "Forest");
    let scried = 0;
    a.chooseScryFn = () => {
      scried += 1;
      return [];
    };
    spawn(game, "Plains");
    pickFromZone(a, forest);
    cast(game, toHand(game, "Path to the Festival"));
    expect(zone(game, forest)).toBe("battlefield");
    expect(scried).toBe(0);
  });
});

describe("Ravenous Rotbelly", () => {
  it("each opponent sacrifices as many creatures as Zombies you sacrificed", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const corpse1 = spawn(game, "Walking Corpse");
    const corpse2 = spawn(game, "Walking Corpse");
    const theirs = [spawn(game, "Hill Giant", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    a.chooseSacrificesFn = () => [corpse1, corpse2];
    pickModes(a, 2);
    const rotbelly = toHand(game, "Ravenous Rotbelly");
    cast(game, rotbelly);
    expect(zone(game, corpse1)).toBe("graveyard");
    expect(zone(game, corpse2)).toBe("graveyard");
    expect(zone(game, rotbelly)).toBe("battlefield");
    expect(theirs.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
  });

  it("choosing three with fewer Zombies sacrifices what there is, and that many", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const corpse = spawn(game, "Walking Corpse");
    const bears = spawn(game, "Grizzly Bears"); // not a Zombie
    const theirs = [spawn(game, "Hill Giant", B), spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    pickModes(a, 3);
    const rotbelly = toHand(game, "Ravenous Rotbelly");
    cast(game, rotbelly);
    // Rotbelly is a Zombie too: the corpse and Rotbelly go, the Bears stay.
    expect(zone(game, corpse)).toBe("graveyard");
    expect(zone(game, rotbelly)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(theirs.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
  });

  it("choosing none sacrifices nothing", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const corpse = spawn(game, "Walking Corpse");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    const rotbelly = toHand(game, "Ravenous Rotbelly");
    cast(game, rotbelly);
    expect(zone(game, corpse)).toBe("battlefield");
    expect(zone(game, rotbelly)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Secrets of the Key", () => {
  it("investigates once from hand and twice by flashback", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const secrets = toHand(game, "Secrets of the Key");
    cast(game, secrets);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    flashback(game, secrets);
    expect(tokensNamed(game, "Clue Token", A)).toBe(3);
    expect(zone(game, secrets)).toBe("exile");
  });
});

describe("Soul-Guide Gryff", () => {
  it("exiles up to one target card from a graveyard as it enters", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, bolt);
    cast(game, toHand(game, "Soul-Guide Gryff"));
    expect(zone(game, bolt)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(1);
  });
});

describe("Storm the Festival", () => {
  it("puts up to two permanent cards with mana value 5 or less onto the battlefield, the rest on the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const forest = toLibrary(game, "Forest");
    const bolt = toLibrary(game, "Lightning Bolt");
    const dragon = toLibrary(game, "Shivan Dragon");
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears, giant);
    cast(game, toHand(game, "Storm the Festival"));
    expect([...seen.offered].sort()).toEqual([bears, giant, forest].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    const lib = library(game);
    expect(lib.slice(-3).sort()).toEqual([forest, bolt, dragon].sort());
  });
});

describe("Tapping at the Window", () => {
  it("may put a creature card from the top three into your hand, the rest into your graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const forest = toLibrary(game, "Forest");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Tapping at the Window"));
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});
