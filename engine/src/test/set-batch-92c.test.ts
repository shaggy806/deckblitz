/**
 * Set walk batch 92, part c (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  nextTurn,
  pickFromZone,
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
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const FUNGUS = "Fungus Token (Can't Block)";

const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
/** A permanent card into alice's graveyard: she descends. */
const descend = (game: Game): void => {
  game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
  settle(game);
};
const tap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
};
const activation = (
  source: ObjectId,
  extra: Partial<Extract<Action, { type: "activate-ability" }>> = {},
): Action => ({ type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], ...extra }) as Action;

describe("Broodrage Mycoid", () => {
  it("makes a Fungus that can't block at your end step only if you descended", () => {
    const { game } = table();
    spawn(game, "Broodrage Mycoid");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, FUNGUS, A)).toBe(0);
    nextTurn(game);
    toStep(game, "precombat-main");
    descend(game);
    descend(game);
    toStep(game, "end");
    settle(game);
    // Once, however many times you descended.
    expect(tokensNamed(game, FUNGUS, A)).toBe(1);
  });
});

describe("Cavernous Maw", () => {
  it("animates only when other Caves you control plus Cave cards in your graveyard reach three", () => {
    const { game } = table();
    const maw = spawn(game, "Cavernous Maw");
    spawn(game, "Promising Vein");
    spawn(game, "Captivating Cave");
    lands(game, "Wastes", 2);
    // Two other Caves: the Maw itself doesn't count.
    expect(game.canDispatch(activation(maw, { abilityIndex: 1 }))).not.toBeNull();
    toGraveyard(game, "Promising Vein");
    activate(game, maw, 1);
    expect(pt(game, maw)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, maw)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, maw)).toEqual(expect.arrayContaining(["Cave", "Elemental"]));
    nextTurn(game);
    expect(types(game, maw)).not.toContain("creature");
  });

  it("counts Cave cards in the graveyard alone", () => {
    const { game } = table();
    const maw = spawn(game, "Cavernous Maw");
    lands(game, "Wastes", 2);
    toGraveyard(game, "Promising Vein");
    toGraveyard(game, "Captivating Cave");
    expect(game.canDispatch(activation(maw, { abilityIndex: 1 }))).not.toBeNull();
    toGraveyard(game, "Cavernous Maw");
    activate(game, maw, 1);
    expect(types(game, maw)).toContain("creature");
  });
});

describe("Malamet Battle Glyph", () => {
  it("a creature that entered this turn gets a counter, then they fight", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Malamet Battle Glyph"), { targets: [ref(bears), ref(giant)] });
    // A 3/3 Bears and a 3/3 Giant trade.
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("no counter for a creature that didn't enter this turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    nextTurn(game);
    toStep(game, "precombat-main");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Malamet Battle Glyph"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("still puts the counter on when the other target is gone, and nothing fights", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Malamet Battle Glyph"), { targets: [ref(bears), ref(giant)], settle: false });
    destroy(game, giant);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Warden of the Inner Sky", () => {
  it("taps three artifacts and/or creatures, itself included, for a counter and a scry", () => {
    const { game, a } = table();
    const warden = spawn(game, "Warden of the Inner Sky");
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter");
    const top = toLibrary(game, "Hill Giant");
    a.chooseScryFn = (_view, cards) => cards;
    game.dispatch(activation(warden, { tap: [warden, bears, thopter] }));
    settle(game);
    expect(counters(game, warden)).toBe(1);
    expect([warden, bears, thopter].every((id) => isTapped(game, id))).toBe(true);
    expect(library(game).at(-1)).toBe(top);
  });

  it("has flying and vigilance with three counters of any kind", () => {
    const { game } = table();
    const warden = spawn(game, "Warden of the Inner Sky");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(warden)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "oil", amount: 1 }, [ref(warden)]);
    expect(keywords(game, warden).has("flying")).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "oil", amount: 1 }, [ref(warden)]);
    expect(keywords(game, warden).has("flying")).toBe(true);
    expect(keywords(game, warden).has("vigilance")).toBe(true);
  });
});

describe("Canonized in Blood", () => {
  it("grows a creature at your end step if you descended, and sacrifices for a Vampire Demon", () => {
    const { game, a } = table();
    const canonized = spawn(game, "Canonized in Blood");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(0);
    nextTurn(game);
    toStep(game, "precombat-main");
    descend(game);
    pickTargets(a, bears);
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    nextTurn(game);
    toStep(game, "precombat-main");
    lands(game, "Swamp", 7);
    activate(game, canonized, 0);
    expect(zone(game, canonized)).toBe("graveyard");
    const [demon] = tokensOf(game, "Vampire Demon Token");
    expect(pt(game, demon)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, demon).has("flying")).toBe(true);
  });
});

describe("In the Presence of Ages", () => {
  it("takes a creature card and a land card, the rest to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bolt = toLibrary(game, "Lightning Bolt");
    const giant = toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const offered: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered.push(eligible);
      return eligible.filter((id) => id === bears || id === forest);
    };
    cast(game, toHand(game, "In the Presence of Ages"));
    expect(offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(offered[0]).not.toContain(forest);
    expect(offered[1]).toEqual([forest]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("a creature land can be the land card beside another creature card", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    toLibrary(game, "Lightning Bolt");
    const arbor = toLibrary(game, "Dryad Arbor");
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    // The first pick is the creature card (the Arbor is offered there too):
    // the Bears is taken, then the Arbor as the land card.
    a.chooseFromZoneFn = (() => {
      let call = 0;
      return (_view: unknown, eligible: readonly ObjectId[]) => (call++ === 0 ? [bears] : eligible.filter((id) => id === arbor));
    })();
    cast(game, toHand(game, "In the Presence of Ages"));
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, arbor)).toBe("hand");
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName === "Lightning Bolt")).toHaveLength(2);
  });
});

describe("Goblin Tomb Raider", () => {
  it("gets +1/+0 and haste while you control an artifact", () => {
    const { game } = table();
    const raider = spawn(game, "Goblin Tomb Raider");
    expect(pt(game, raider)).toEqual({ power: 1, toughness: 2 });
    expect(keywords(game, raider).has("haste")).toBe(false);
    spawn(game, "Ornithopter");
    expect(pt(game, raider)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, raider).has("haste")).toBe(true);
  });
});

describe("Compass Gnome", () => {
  it("may search for a Cave card and put it on top", () => {
    const { game, a } = table();
    const vein = toLibrary(game, "Promising Vein");
    for (let i = 0; i < 5; i++) toLibrary(game, "Wastes");
    const bears = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, vein);
    enter(game, "Compass Gnome");
    expect(seen.offered).toContain(vein);
    expect(seen.offered).not.toContain(bears);
    expect(library(game)[0]).toBe(vein);
  });
});

describe("Volatile Wanderglyph", () => {
  it("becoming tapped, may discard a card to draw one", () => {
    const { game, a } = table();
    const glyph = spawn(game, "Volatile Wanderglyph");
    const before = hand(game).length;
    const discards = graveyard(game).length;
    pickModes(a, 0);
    tap(game, glyph);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(discards + 1);
  });
});

describe("Uchbenbak, the Great Mistake", () => {
  it("returns from the graveyard with a finality counter once eight permanent cards are there", () => {
    const { game } = table();
    const uchbenbak = toGraveyard(game, "Uchbenbak, the Great Mistake");
    for (let i = 0; i < 6; i++) toGraveyard(game, "Wastes");
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 5);
    lands(game, "Swamp", 1);
    // Seven permanent cards, itself included; the instant doesn't count.
    expect(game.canDispatch(activation(uchbenbak))).not.toBeNull();
    toGraveyard(game, "Wastes");
    activate(game, uchbenbak, 0);
    expect(zone(game, uchbenbak)).toBe("battlefield");
    expect(counters(game, uchbenbak, "finality")).toBe(1);
    destroy(game, uchbenbak);
    expect(zone(game, uchbenbak)).toBe("exile");
  });
});

describe("Synapse Necromage", () => {
  it("dying makes two Fungus that can't block", () => {
    const { game } = table();
    const necromage = spawn(game, "Synapse Necromage");
    destroy(game, necromage);
    expect(tokensNamed(game, FUNGUS, A)).toBe(2);
  });
});

describe("Soulcoil Viper", () => {
  it("sacrifices itself to return a creature card with a finality counter", () => {
    const { game } = table();
    const viper = spawn(game, "Soulcoil Viper");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 1);
    activate(game, viper, 0, { targets: [ref(giant)] });
    expect(zone(game, viper)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant, "finality")).toBe(1);
  });
});

describe("Attentive Sunscribe", () => {
  it("scries 1 whenever it becomes tapped", () => {
    const { game, a } = table();
    const scribe = spawn(game, "Attentive Sunscribe");
    const top = toLibrary(game, "Hill Giant");
    a.chooseScryFn = (_view, cards) => cards;
    tap(game, scribe);
    expect(library(game).at(-1)).toBe(top);
  });
});

describe("Echo of Dusk", () => {
  it("gets +1/+1 and lifelink with four permanent cards in your graveyard", () => {
    const { game } = table();
    const echo = spawn(game, "Echo of Dusk");
    for (let i = 0; i < 3; i++) toGraveyard(game, "Wastes");
    toGraveyard(game, "Lightning Bolt");
    expect(pt(game, echo)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, echo).has("lifelink")).toBe(false);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, echo)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, echo).has("lifelink")).toBe(true);
  });
});

describe("Tendril of the Mycotyrant", () => {
  it("makes a noncreature land a 7/7 Fungus with haste for good", () => {
    const { game } = table();
    const tendril = spawn(game, "Tendril of the Mycotyrant");
    lands(game, "Forest", 7);
    const target = spawn(game, "Wastes");
    activate(game, tendril, 0, { targets: [ref(target)] });
    expect(pt(game, target)).toEqual({ power: 7, toughness: 7 });
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, target)).toContain("Fungus");
    expect(keywords(game, target).has("haste")).toBe(true);
    nextTurn(game);
    expect(types(game, target)).toContain("creature");
  });
});

describe("Vito's Inquisitor", () => {
  it("sacrifices another creature or artifact for a counter and menace this turn", () => {
    const { game } = table();
    const inquisitor = spawn(game, "Vito's Inquisitor");
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Swamp", 1);
    game.dispatch(activation(inquisitor, { sacrifice: thopter }));
    settle(game);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(counters(game, inquisitor)).toBe(1);
    expect(keywords(game, inquisitor).has("menace")).toBe(true);
    nextTurn(game);
    expect(keywords(game, inquisitor).has("menace")).toBe(false);
  });
});

describe("Deep Goblin Skulltaker", () => {
  it("grows at your end step only if you descended", () => {
    const { game } = table();
    const goblin = spawn(game, "Deep Goblin Skulltaker");
    toStep(game, "end");
    settle(game);
    expect(counters(game, goblin)).toBe(0);
    nextTurn(game);
    toStep(game, "precombat-main");
    descend(game);
    toStep(game, "end");
    settle(game);
    expect(counters(game, goblin)).toBe(1);
  });
});

describe("Relic's Roar", () => {
  it("makes an artifact a 4/3 Dinosaur artifact creature until end of turn", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Relic's Roar"), { targets: [ref(ring)] });
    expect(pt(game, ring)).toEqual({ power: 4, toughness: 3 });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Dinosaur");
    nextTurn(game);
    expect(types(game, ring)).not.toContain("creature");
  });

  it("a creature keeps its abilities and gets base 4/3", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Relic's Roar"), { targets: [ref(thopter)] });
    expect(pt(game, thopter)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, thopter).has("flying")).toBe(true);
  });
});

describe("Huatli's Final Strike", () => {
  it("pumps your creature, which deals damage equal to its power and takes none", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Huatli's Final Strike"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Hotfoot Gnome", () => {
  it("gives another creature haste, never itself", () => {
    const { game } = table();
    const gnome = spawn(game, "Hotfoot Gnome", A, { sick: true });
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const offer = game
      .legalActions(A)
      .find((o): o is Extract<typeof o, { kind: "activate-ability" }> => o.kind === "activate-ability" && o.source === gnome);
    const offered = offer!.targetOptions[0].map((t) => (t.kind === "object" ? t.object : null));
    expect(offered).toContain(bears);
    expect(offered).not.toContain(gnome);
    activate(game, gnome, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});
