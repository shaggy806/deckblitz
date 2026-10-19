/**
 * Streets of New Capenna, group b. One test (or two) per card, on its
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
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
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
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const shards = (game: Game, ...names: readonly string[]): void => {
  for (const name of names) spawn(game, name);
};

const blitzOffers =(game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === "blitz");

describe("Kamiz, Obscura Oculus", () => {
  it("the target can't be blocked and connives; then a creature with less power than it now has gains double strike", () => {
    const { game, a } = table();
    spawn(game, "Kamiz, Obscura Oculus");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const otherGiant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm");
    const discard = toHand(game, "Savannah Lions");
    pickTargets(a, giant);
    a.chooseDiscardsFn = () => [discard];
    const seen = pickPermanents(a, otherGiant);
    attack(game, a, [giant, bears, otherGiant, wurm]);
    expect(counters(game, giant)).toBe(1);
    expect(keywords(game, giant).has("unblockable")).toBe(true);
    // 3 power is less than the connived Giant's 4, so the other Giant counts.
    expect([...seen.offered].sort()).toEqual([bears, otherGiant].sort());
    expect(keywords(game, otherGiant).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
    expect(keywords(game, wurm).has("double-strike")).toBe(false);
  });

  it("discarding a land gives no counter, so an equal-power creature doesn't qualify", () => {
    const { game, a } = table();
    spawn(game, "Kamiz, Obscura Oculus");
    const giant = spawn(game, "Hill Giant");
    const otherGiant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    pickTargets(a, giant);
    a.chooseDiscardsFn = (h) => [h.find((o) => o.cardName === "Wastes")!.id];
    const seen = pickPermanents(a, bears);
    attack(game, a, [giant, otherGiant, bears, lions]);
    expect(counters(game, giant)).toBe(0);
    expect([...seen.offered].sort()).toEqual([bears, lions].sort());
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, otherGiant).has("double-strike")).toBe(false);
  });
});

describe("Sinister Concierge", () => {
  it("exiles itself and up to one target creature, each with three time counters and suspend", () => {
    const { game, a } = table();
    const concierge = spawn(game, "Sinister Concierge");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a, 0);
    destroy(game, concierge);
    const cards = game.state.zones.shared.exile.filter((id) =>
      ["Sinister Concierge", "Hill Giant"].includes(game.state.objects[id].cardName),
    );
    expect(cards).toHaveLength(2);
    for (const id of cards) {
      expect(counters(game, id, "time")).toBe(3);
      expect(game.state.objects[id].suspended).toBe(true);
    }
  });

  it("declined, neither is exiled", () => {
    const { game, a } = table();
    const concierge = spawn(game, "Sinister Concierge");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    pickModes(a);
    destroy(game, concierge);
    expect(zone(game, giant)).toBe("battlefield");
    expect(graveyard(game).some((id) => game.state.objects[id].cardName === "Sinister Concierge")).toBe(true);
  });
});

describe("Angelic Sleuth", () => {
  it("investigates when another permanent you control with a counter leaves, not one without", () => {
    const { game } = table();
    spawn(game, "Angelic Sleuth");
    const countered = spawn(game, "Grizzly Bears");
    game.state.objects[countered].counters["+1/+1"] = 1;
    const plain = spawn(game, "Grizzly Bears");
    destroy(game, plain);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    destroy(game, countered);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Mezzio Mugger", () => {
  it("exiles the top card of each library, and you may cast them with mana of any color", () => {
    const { game, a } = table();
    const mugger = spawn(game, "Mezzio Mugger");
    const theirs = toLibrary(game, "Grizzly Bears", B);
    const mine = toLibrary(game, "Savannah Lions", A);
    lands(game, "Island", 3);
    attack(game, a, [mugger]);
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("exile");
    // Islands pay {1}{G} and {W}: mana spent as though it were any color.
    expect(game.canDispatch({ type: "cast-spell", player: A, card: theirs, targets: [], via: "impulse" })).toBeNull();
    cast(game, theirs, { via: "impulse" });
    expect(game.state.objects[theirs].zone).toBe("battlefield");
    expect(game.state.objects[theirs].controller).toBe(A);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: mine, targets: [], via: "impulse" })).toBeNull();
  });

  it("has blitz {2}{R}", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    expect(blitzOffers(game, toHand(game, "Mezzio Mugger"))).toHaveLength(1);
  });
});

describe("Caldaia Guardian", () => {
  it("another creature you control with mana value 4 or greater dying makes two Citizens; a smaller one doesn't", () => {
    const { game } = table();
    spawn(game, "Caldaia Guardian");
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(tokensNamed(game, "Citizen Token", A)).toBe(0);
    destroy(game, spawn(game, "Hill Giant"));
    expect(tokensNamed(game, "Citizen Token", A)).toBe(2);
    destroy(game, spawn(game, "Hill Giant", B));
    expect(tokensNamed(game, "Citizen Token", A)).toBe(2);
  });

  it("itself dying makes two Citizens", () => {
    const { game } = table();
    destroy(game, spawn(game, "Caldaia Guardian"));
    expect(tokensNamed(game, "Citizen Token", A)).toBe(2);
  });

  it("dying together with a big creature, it triggers for each", () => {
    const { game } = table();
    const guardian = spawn(game, "Caldaia Guardian");
    spawn(game, "Hill Giant");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(zone(game, guardian)).toBe("graveyard");
    expect(tokensNamed(game, "Citizen Token", A)).toBe(4);
  });
});

describe("Riveteers Charm", () => {
  it("the target opponent sacrifices their creature or planeswalker with the greatest mana value", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    shards(game, "Swamp", "Mountain", "Forest");
    cast(game, toHand(game, "Riveteers Charm"), { modes: [0], targets: [ref(B)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("exiles the top three cards, playable until your next end step", () => {
    const { game } = table();
    shards(game, "Swamp", "Mountain", "Forest");
    const top = [toLibrary(game, "Wastes"), toLibrary(game, "Wastes"), toLibrary(game, "Wastes")];
    cast(game, toHand(game, "Riveteers Charm"), { modes: [1] });
    expect(top.every((id) => zone(game, id) === "exile")).toBe(true);
    expect(game.canDispatch({ type: "play-land", player: A, card: top[0] })).toBeNull();
  });

  it("exiles target player's graveyard", () => {
    const { game } = table();
    shards(game, "Swamp", "Mountain", "Forest");
    const card = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Riveteers Charm"), { modes: [2], targets: [ref(B)] });
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Maestros Charm", () => {
  it("looks at five, one to hand and the rest to the graveyard", () => {
    const { game, a } = table();
    shards(game, "Island", "Swamp", "Mountain");
    const top = [1, 2, 3, 4].map(() => toLibrary(game, "Wastes"));
    const lions = toLibrary(game, "Savannah Lions");
    pickFromZone(a, lions);
    cast(game, toHand(game, "Maestros Charm"), { modes: [0] });
    expect(zone(game, lions)).toBe("hand");
    expect(top.every((id) => zone(game, id) === "graveyard")).toBe(true);
  });

  it("drains each opponent for 3, or deals 5 to a creature", () => {
    const { game } = table();
    shards(game, "Island", "Swamp", "Mountain", "Island", "Swamp", "Mountain");
    cast(game, toHand(game, "Maestros Charm"), { modes: [1] });
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Maestros Charm"), { modes: [2], targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Mage's Attendant", () => {
  it("makes a 1/1 blue Wizard that sacrifices itself to counter a noncreature spell unless its controller pays {1}", () => {
    const { game } = table();
    enter(game, "Mage's Attendant");
    const [wizard] = named(game, "Wizard Token (Mage's Attendant)", A);
    expect(wizard).toBeDefined();
    expect(pt(game, wizard)).toEqual({ power: 1, toughness: 1 });
    expect(game.state.objects[wizard].isToken).toBe(true);
    lands(game, "Mountain", 2);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    activate(game, wizard, 0, { targets: [ref(bolt)] });
    expect(game.battlefield.includes(wizard)).toBe(false);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Refuse to Yield", () => {
  it("gives +2/+7 and untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Refuse to Yield"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 9 });
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Exhibition Magician", () => {
  it("makes a Citizen or a Treasure, as chosen", () => {
    const { game, a } = table();
    pickModes(a, 1);
    enter(game, "Exhibition Magician");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(0);
    pickModes(a, 0);
    enter(game, "Exhibition Magician");
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
  });
});

describe("Metropolis Angel", () => {
  it("draws one card when you attack with creatures with counters, however many", () => {
    const { game, a } = table();
    spawn(game, "Metropolis Angel");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    game.state.objects[x].counters["+1/+1"] = 1;
    game.state.objects[y].counters["-1/-1"] = 1;
    const before = hand(game).length;
    attack(game, a, [x, y]);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw for an attack with no counters", () => {
    const { game, a } = table();
    spawn(game, "Metropolis Angel");
    const x = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [x]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Rogues' Gallery", () => {
  it("returns up to one creature card of each color; a multicolored card fills one slot", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const upstart = toGraveyard(game, "Brazen Upstart");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const lions = toGraveyard(game, "Savannah Lions");
    const gallery = toHand(game, "Rogues' Gallery");
    // The same card can't be chosen for two colors.
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: gallery,
        targets: [ref(upstart), null, null, ref(upstart), null],
      }),
    ).not.toBeNull();
    cast(game, gallery, { targets: [ref(upstart), null, null, ref(giant), ref(bears)] });
    expect([upstart, giant, bears].every((id) => zone(game, id) === "hand")).toBe(true);
    expect(zone(game, lions)).toBe("graveyard");
  });

  it("a slot takes only a card of its color", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card: toHand(game, "Rogues' Gallery"),
        targets: [ref(bears), null, null, null, null],
      }),
    ).not.toBeNull();
  });
});

describe("Luxurious Libation", () => {
  it("gives +X/+X and makes a Citizen", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Luxurious Libation"), { x: 3, targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
  });
});

describe("Incandescent Aria", () => {
  it("deals 3 damage to each nontoken creature only", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm");
    game.debugApplyEffect(A, { kind: "create-token", token: "Citizen Token", count: 1 }, []);
    shards(game, "Mountain", "Forest", "Plains");
    cast(game, toHand(game, "Incandescent Aria"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
  });
});

describe("Quick-Draw Dagger", () => {
  it("attaches as it enters, giving first strike this turn and +1/+1", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Savannah Lions");
    pickTargets(a, bears);
    const dagger = enter(game, "Quick-Draw Dagger");
    expect(game.state.objects[dagger].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });
});

describe("Forge Boss", () => {
  it("deals 2 to each opponent the first time you sacrifice another creature each turn", () => {
    const { game } = table();
    spawn(game, "Forge Boss");
    const altar = spawn(game, "Ashnod's Altar");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    const sacrifice = (id: ObjectId): void => {
      const index = game.registry.get("Ashnod's Altar").activated.findIndex((ab) => ab.cost.sacrifice !== undefined);
      game.dispatch({ type: "activate-ability", player: A, source: altar, abilityIndex: index, targets: [], sacrifice: id });
      settle(game);
    };
    sacrifice(x);
    expect(life(game, B)).toBe(18);
    sacrifice(y);
    expect(life(game, B)).toBe(18);
  });

  it("sacrificing a creature you don't control doesn't count, nor does Forge Boss itself", () => {
    const { game } = table();
    const boss = spawn(game, "Forge Boss");
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(boss)]);
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("Warm Welcome", () => {
  it("may take a creature card from the top five, the rest to the bottom, and makes a Citizen", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = toLibrary(game, "Grizzly Bears");
    const top = [1, 2, 3, 4].map(() => toLibrary(game, "Wastes"));
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Warm Welcome"));
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    const lib = library(game);
    expect(top.every((id) => lib.slice(-4).includes(id))).toBe(true);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
  });
});

describe("Revelation of Power", () => {
  it("a creature with a counter also gains flying and lifelink", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters.stun = 1;
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Revelation of Power"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });

  it("one without a counter only gets +2/+2", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Revelation of Power"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Brazen Upstart", () => {
  it("dying, it may put a creature card from the top five into your hand", () => {
    const { game, a } = table();
    const upstart = spawn(game, "Brazen Upstart");
    const giant = toLibrary(game, "Hill Giant");
    [1, 2, 3, 4].forEach(() => toLibrary(game, "Wastes"));
    pickFromZone(a, giant);
    destroy(game, upstart);
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Caldaia Strongarm", () => {
  it("puts two +1/+1 counters on target creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Savannah Lions");
    pickTargets(a, bears);
    enter(game, "Caldaia Strongarm");
    expect(counters(game, bears)).toBe(2);
  });

  it("has blitz {3}{G}", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    expect(blitzOffers(game, toHand(game, "Caldaia Strongarm"))).toHaveLength(1);
  });
});

describe("Join the Maestros", () => {
  it("makes a 4/3 black Ogre Warrior, and a second one when its casualty is paid", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    cast(game, toHand(game, "Join the Maestros"));
    expect(zone(game, bears)).toBe("graveyard");
    const ogres = named(game, "Ogre Warrior Token", A);
    expect(tokensNamed(game, "Ogre Warrior Token", A)).toBe(2);
    expect(pt(game, ogres[0])).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Take to the Streets", () => {
  it("creatures get +2/+2; Citizens an extra +1/+1 and vigilance", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const servant = spawn(game, "Civil Servant");
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Take to the Streets"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("vigilance")).toBe(false);
    expect(pt(game, servant)).toEqual({ power: 5, toughness: 6 });
    expect(keywords(game, servant).has("vigilance")).toBe(true);
  });
});

describe("Civil Servant", () => {
  it("may tap another untapped Citizen to get +1/+0 and lifelink", () => {
    const { game, a } = table();
    const servant = spawn(game, "Civil Servant");
    game.debugApplyEffect(A, { kind: "create-token", token: "Citizen Token", count: 1 }, []);
    const [citizen] = named(game, "Citizen Token", A);
    pickPermanents(a, citizen);
    attack(game, a, [servant]);
    expect(game.state.objects[citizen].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });

  it("without another Citizen, nothing happens", () => {
    const { game, a } = table();
    const servant = spawn(game, "Civil Servant");
    spawn(game, "Grizzly Bears");
    attack(game, a, [servant]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Cabaretti Ascendancy", () => {
  it("at your upkeep, a creature or planeswalker card on top may go to your hand", () => {
    const { game, a } = table();
    spawn(game, "Cabaretti Ascendancy");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, giant)).toBe("hand");
  });

  it("a card not taken may go to the bottom", () => {
    const { game, a } = table();
    spawn(game, "Cabaretti Ascendancy");
    const relic = toLibrary(game, "Darksteel Relic");
    const seen = { offered: [] as readonly ObjectId[] };
    a.chooseFromZoneFn = (_view, eligible) => {
      seen.offered = eligible;
      return eligible.includes(relic) ? [relic] : [];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, relic)).toBe("library");
    expect(library(game).at(-1)).toBe(relic);
  });
});
