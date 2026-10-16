/**
 * Set walk batch 89, part g (2026-10-16): the plot and crime cards of Outlaws of Thunder Junction (OTJ), its Commander decks (OTC) and The Big Score (BIG).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const crimes = (game: Game, player: PlayerId = A): number => game.state.players[player].crimesThisTurn ?? 0;

const bolt = (game: Game, target: PlayerId | ObjectId, player: PlayerId = A): void => {
  lands(game, "Mountain", 1, player);
  cast(game, toHand(game, "Lightning Bolt", player), { player, targets: [ref(target)] });
};

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const plot = (game: Game, card: ObjectId, player: PlayerId = A): void => {
  const why = game.canDispatch({ type: "plot", player, card });
  if (why !== null) throw new Error(why);
  game.dispatch({ type: "plot", player, card });
  settle(game);
};

describe("Pillage the Bog", () => {
  it("looks at twice as many cards as you control lands, one to hand and the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    // Seven cards on top, the last one placed on top: six are looked at.
    const placed = ["Hill Giant", "Grizzly Bears", "Craw Wurm", "Llanowar Elves", "Shock", "Opt", "Divination"].map(
      (name) => toLibrary(game, name),
    );
    const topIsFront = library(game)[0] === placed[6];
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [placed[1]];
    };
    cast(game, toHand(game, "Pillage the Bog"));
    expect([...offered].sort()).toEqual(placed.slice(1).sort());
    expect(zone(game, placed[1])).toBe("hand");
    // The seventh card is the new top; the other five went under.
    const lib = library(game);
    expect(topIsFront ? lib[0] : lib[lib.length - 1]).toBe(placed[0]);
    const bottom = topIsFront ? lib.slice(-5) : lib.slice(0, 5);
    expect([...bottom].sort()).toEqual(placed.slice(2).sort());
  });
});

describe("Plan the Heist", () => {
  it("draws three, surveilling 3 first only with an empty hand", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    lands(game, "Island", 4);
    const heist = toHand(game, "Plan the Heist");
    const before = hand(game).length;
    cast(game, heist);
    expect(asked).toBe(0);
    expect(hand(game).length).toBe(before - 1 + 3);

    // An empty hand as it resolves: surveil 3, then draw.
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    expect(hand(game)).toHaveLength(0);
    let surveiled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards, mode) => {
      asked += 1;
      expect(mode).toBe("surveil");
      surveiled = cards;
      return cards.slice(0, 1);
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Plan the Heist"));
    expect(asked).toBe(1);
    expect(surveiled).toHaveLength(3);
    expect(zone(game, surveiled[0])).toBe("graveyard");
    expect(hand(game)).toHaveLength(3);
  });
});

describe("Pyretic Charge", () => {
  it("discards the hand, draws four, and pumps creatures there +1/+0 per card discarded", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    const charge = toHand(game, "Pyretic Charge");
    const discarding = hand(game).length - 1;
    cast(game, charge);
    expect(graveyard(game)).toHaveLength(discarding + 1);
    expect(hand(game)).toHaveLength(4);
    expect(pt(game, bear)).toEqual({ power: 2 + discarding, toughness: 2 });
    // Only creatures there as it resolved.
    const later = spawn(game, "Grizzly Bears");
    expect(pt(game, later)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Rattleback Apothecary", () => {
  it("a crime gives target creature you control menace or lifelink, chosen as it resolves", () => {
    const { game, a } = table();
    spawn(game, "Rattleback Apothecary");
    const bear = spawn(game, "Grizzly Bears");
    // Targeting your own creature isn't a crime.
    bolt(game, spawn(game, "Hill Giant"));
    expect(keywords(game, bear).has("lifelink")).toBe(false);
    pickTargets(a, bear);
    pickModes(a, 1);
    bolt(game, B);
    expect(keywords(game, bear).has("lifelink")).toBe(true);
    expect(keywords(game, bear).has("menace")).toBe(false);
  });
});

describe("Rise of the Varmints", () => {
  it("makes a 2/1 green Varmint per creature card in your graveyard", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Hill Giant", B);
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Rise of the Varmints"));
    expect(tokensNamed(game, "Varmint Token", A)).toBe(3);
    const [varmint] = named(game, "Varmint Token");
    expect(pt(game, varmint)).toEqual({ power: 2, toughness: 1 });
    expect(game.state.objects[varmint].controller).toBe(A);
  });
});

describe("Seize the Secrets", () => {
  it("costs {1} less once you've committed a crime this turn", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const seize = toHand(game, "Seize the Secrets");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: seize, targets: [] })).not.toBeNull();
    bolt(game, B);
    const before = hand(game).length;
    cast(game, seize);
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Servant of the Stinger", () => {
  it("no crime this turn: its combat damage trigger does nothing", () => {
    const { game, a } = table();
    const servant = spawn(game, "Servant of the Stinger");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    attack(game, a, [servant]);
    expect(life(game, B)).toBe(19);
    expect(asked).toBe(0);
    expect(zone(game, servant)).toBe("battlefield");
  });

  it("after a crime it may be sacrificed to tutor any card", () => {
    const { game, a } = table();
    const servant = spawn(game, "Servant of the Stinger");
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    bolt(game, B);
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => {
      expect(eligible).toContain(giant);
      return [giant];
    };
    attack(game, a, [servant]);
    expect(zone(game, servant)).toBe("graveyard");
    expect(zone(game, giant)).toBe("hand");
  });

  it("declining keeps it, and no search happens", () => {
    const { game, a } = table();
    const servant = spawn(game, "Servant of the Stinger");
    const giant = toLibrary(game, "Hill Giant");
    bolt(game, B);
    pickModes(a);
    attack(game, a, [servant]);
    expect(zone(game, servant)).toBe("battlefield");
    expect(zone(game, giant)).toBe("library");
  });
});

describe("Sheriff of Safe Passage", () => {
  it("enters with one +1/+1 counter plus one per other creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 3);
    const sheriff = toHand(game, "Sheriff of Safe Passage");
    cast(game, sheriff);
    expect(counters(game, sheriff)).toBe(3);
    expect(pt(game, sheriff)).toEqual({ power: 3, toughness: 3 });
  });

  it("plotted, it's cast free on a later turn", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const sheriff = toHand(game, "Sheriff of Safe Passage");
    plot(game, sheriff);
    expect(zone(game, sheriff)).toBe("exile");
    spawn(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    for (const id of game.state.zones.shared.battlefield) game.state.objects[id].tapped = true;
    cast(game, sheriff, { via: "plot", free: true });
    expect(zone(game, sheriff)).toBe("battlefield");
    expect(counters(game, sheriff)).toBe(2);
  });
});

describe("Slickshot Lockpicker", () => {
  it("gives an instant in your graveyard flashback for its mana cost", () => {
    const { game, a } = table();
    const old = toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 3);
    pickTargets(a, old);
    cast(game, toHand(game, "Slickshot Lockpicker"));
    expect(game.state.objects[old].grantedFlashback?.cost).toBe("{R}");
    lands(game, "Mountain", 1);
    cast(game, old, { targets: [ref(B)], via: "flashback" });
    expect(life(game, B)).toBe(17);
    expect(zone(game, old)).toBe("exile");
  });
});

describe("Stagecoach Security", () => {
  it("entering, creatures you control get +1/+1 and vigilance until end of turn", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    const coach = toHand(game, "Stagecoach Security");
    cast(game, coach);
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bear).has("vigilance")).toBe(true);
    expect(pt(game, coach)).toEqual({ power: 5, toughness: 6 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    const later = spawn(game, "Grizzly Bears");
    expect(pt(game, later)).toEqual({ power: 2, toughness: 2 });
    nextTurn(game);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Tumbleweed Rising", () => {
  it("makes an X/X green Elemental, X the greatest power among your creatures as it resolves", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Tumbleweed Rising"));
    const [token] = named(game, "Elemental Token (Dance of the Tumbleweeds)");
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[token].isToken).toBe(true);
    // X was read once.
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [
      ref(giant),
    ]);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
  });

  it("with no creatures, the token is 0/0 and dies", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Tumbleweed Rising"));
    expect(named(game, "Elemental Token (Dance of the Tumbleweeds)")).toHaveLength(0);
  });
});

describe("Unscrupulous Contractor", () => {
  it("may sacrifice a creature (itself too); when it does, target player draws two and loses 2 — a crime against an opponent", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [bear];
    };
    pickModes(a, 0);
    pickTargets(a, B);
    lands(game, "Swamp", 3);
    const contractor = toHand(game, "Unscrupulous Contractor");
    const bobsHand = hand(game, B).length;
    cast(game, contractor);
    expect(offered).toEqual(expect.arrayContaining([bear, contractor]));
    expect(zone(game, bear)).toBe("graveyard");
    expect(hand(game, B)).toHaveLength(bobsHand + 2);
    expect(life(game, B)).toBe(18);
    expect(crimes(game)).toBe(1);
  });

  it("declining does nothing, and the enters trigger alone is no crime", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    pickModes(a);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Unscrupulous Contractor"));
    expect(zone(game, bear)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
    expect(crimes(game)).toBe(0);
  });
});

describe("Vadmir, New Blood", () => {
  it("grows once each turn you commit a crime, and has menace and lifelink at four counters", () => {
    const { game } = table();
    const vadmir = spawn(game, "Vadmir, New Blood");
    bolt(game, B);
    bolt(game, B);
    expect(counters(game, vadmir)).toBe(1);
    expect(keywords(game, vadmir).has("menace")).toBe(false);
    game.state.objects[vadmir].counters["+1/+1"] = 3;
    expect(keywords(game, vadmir).has("lifelink")).toBe(false);
    nextTurn(game);
    nextTurn(game);
    bolt(game, B);
    expect(counters(game, vadmir)).toBe(4);
    expect(keywords(game, vadmir).has("menace")).toBe(true);
    expect(keywords(game, vadmir).has("lifelink")).toBe(true);
  });
});

describe("Visage Bandit", () => {
  it("may enter as a copy of a creature you control, and is a Shapeshifter Rogue too", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Craw Wurm", B);
    let options: readonly ObjectId[] = [];
    a.chooseCopyFn = (_view, _source, offered) => {
      options = offered;
      return giant;
    };
    lands(game, "Island", 4);
    const bandit = toHand(game, "Visage Bandit");
    cast(game, bandit);
    expect(options).toContain(giant);
    expect(options).not.toContain(theirs);
    expect(game.state.objects[bandit].cardName).toBe("Visage Bandit");
    expect(pt(game, bandit)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, bandit)).toEqual(expect.arrayContaining(["Giant", "Shapeshifter", "Rogue"]));
  });

  it("choosing nothing, it's a 2/2", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant");
    a.chooseCopyFn = () => null;
    lands(game, "Island", 4);
    const bandit = toHand(game, "Visage Bandit");
    cast(game, bandit);
    expect(pt(game, bandit)).toEqual({ power: 2, toughness: 2 });
  });
});
