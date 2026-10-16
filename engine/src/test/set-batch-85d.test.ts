/**
 * Set walk batch 85, part d (2026-10-15): Foundations Jumpstart (J25), Duskmourn: House of Horror Commander (DSC) and Duskmourn: House of Horror (DSK), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
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
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** Four card types in `player`'s graveyard: delirium. */
const delirium = (game: Game, player: PlayerId = A): void => {
  for (const name of ["Forest", "Hill Giant", "Lightning Bolt", "Divination"]) toGraveyard(game, name, player);
};

/** Activate `source`'s ability `index`, sacrificing `sacrifice` for its cost. */
const activateSacrificing = (game: Game, source: ObjectId, index: number, sacrifice: ObjectId): void => {
  const action = { type: "activate-ability", player: A, source, abilityIndex: index, targets: [], sacrifice } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
};

const faceDown = (game: Game, player: PlayerId = A): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined && game.state.objects[id].controller === player);

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

describe("Spectral Snatcher", () => {
  it("ward—discard a card: an opponent's spell is countered unless they discard", () => {
    const { game, a } = table();
    const snatcher = spawn(game, "Spectral Snatcher", B);
    lands(game, "Mountain", 1);
    pickModes(a);
    const before = hand(game).length;
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(snatcher)] });
    // Declined: countered, and nothing discarded.
    expect(game.state.objects[snatcher].damageMarked).toBe(0);
    expect(hand(game).length).toBe(before);
  });

  it("paying the discard lets the spell resolve", () => {
    const { game, a } = table();
    const snatcher = spawn(game, "Spectral Snatcher", B);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(snatcher)] });
    expect(game.state.objects[snatcher].damageMarked).toBe(3);
    // The Bolt and the card discarded for ward.
    expect(hand(game).length).toBe(before - 1);
  });

  it("swampcycles for a Swamp", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const swamp = toLibrary(game, "Swamp");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === swamp);
    const card = toHand(game, "Spectral Snatcher");
    expect(game.legalActions(A).some((o) => o.kind === "cycle" && o.card === card)).toBe(true);
    game.dispatch({ type: "cycle", player: A, card });
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
    expect(zone(game, swamp)).toBe("hand");
  });
});

describe("Cracked Skull", () => {
  it("as it enters, its controller looks at a hand and may make that player discard a nonland card", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const forest = toHand(game, "Forest", B);
    lands(game, "Swamp", 3);
    pickTargets(a, B);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [bolt];
    };
    cast(game, toHand(game, "Cracked Skull"), { targets: [ref(wurm)] });
    expect(offered).toContain(bolt);
    expect(offered).not.toContain(forest);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("choosing nothing discards nothing", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    toHand(game, "Lightning Bolt", B);
    lands(game, "Swamp", 3);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [];
    const before = hand(game, B).length;
    cast(game, toHand(game, "Cracked Skull"), { targets: [ref(wurm)] });
    expect(hand(game, B).length).toBe(before);
  });

  it("destroys the enchanted creature when it's dealt damage", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 3);
    pickTargets(a, B);
    a.chooseFromZoneFn = () => [];
    cast(game, toHand(game, "Cracked Skull"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(wurm)]);
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Haunted Screen", () => {
  it("{7}: seven +1/+1 counters and a 0/0 Spirit artifact creature for good — only once per object", () => {
    const { game } = table();
    const screen = spawn(game, "Haunted Screen");
    lands(game, "Wastes", 14);
    activate(game, screen, 2);
    expect(types(game, screen)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, screen)).toContain("Spirit");
    expect(pt(game, screen)).toEqual({ power: 7, toughness: 7 });
    expect(() => activate(game, screen, 2)).toThrow();
    nextTurn(game);
    nextTurn(game);
    expect(pt(game, screen)).toEqual({ power: 7, toughness: 7 });
  });

  it("a new object after leaving and returning may activate it again (the ruling)", () => {
    const { game } = table();
    const screen = spawn(game, "Haunted Screen");
    lands(game, "Wastes", 17);
    activate(game, screen, 2);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(screen)]);
    settle(game);
    expect(zone(game, screen)).toBe("hand");
    cast(game, screen);
    const back = named(game, "Haunted Screen", A)[0];
    expect(types(game, back)).not.toContain("creature");
    activate(game, back, 2);
    expect(pt(game, back)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Fanatic of the Harrowing", () => {
  it("each player discards a card, and you draw since you discarded", () => {
    const { game } = table();
    const mine = hand(game).length;
    const bobs = hand(game, B).length;
    enter(game, "Fanatic of the Harrowing");
    expect(hand(game).length).toBe(mine);
    expect(hand(game, B).length).toBe(bobs - 1);
  });

  it("with an empty hand you discard nothing and draw nothing", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "discard", target: "you", amount: hand(game).length }, []);
    settle(game);
    expect(hand(game)).toHaveLength(0);
    const bobs = hand(game, B).length;
    enter(game, "Fanatic of the Harrowing");
    expect(hand(game)).toHaveLength(0);
    expect(hand(game, B).length).toBe(bobs - 1);
  });
});

describe("Sawblade Skinripper", () => {
  it("sacrifices another creature or enchantment for a counter — not itself, not an artifact", () => {
    const { game } = table();
    const ripper = spawn(game, "Sawblade Skinripper");
    const bears = spawn(game, "Grizzly Bears");
    const anthem = spawn(game, "Glorious Anthem");
    const stone = spawn(game, "Mind Stone");
    lands(game, "Wastes", 6);
    const offer = (sacrifice: ObjectId) =>
      game.canDispatch({ type: "activate-ability", player: A, source: ripper, abilityIndex: 0, targets: [], sacrifice });
    expect(offer(ripper)).not.toBeNull();
    expect(offer(stone)).not.toBeNull();
    activateSacrificing(game, ripper, 0, bears);
    activateSacrificing(game, ripper, 0, anthem);
    expect(counters(game, ripper)).toBe(2);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, anthem)).toBe("graveyard");
  });

  it("at your end step deals damage equal to the permanents you sacrificed this turn", () => {
    const { game, a } = table();
    const ripper = spawn(game, "Sawblade Skinripper");
    lands(game, "Wastes", 4);
    activateSacrificing(game, ripper, 0, spawn(game, "Grizzly Bears"));
    activateSacrificing(game, ripper, 0, spawn(game, "Grizzly Bears"));
    pickTargets(a, B);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("doesn't trigger when nothing was sacrificed this turn", () => {
    const { game, a } = table();
    spawn(game, "Sawblade Skinripper");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(B)];
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(20);
  });
});

describe("Cathartic Parting", () => {
  it("shuffles an opponent's artifact into its owner's library, and up to four of your graveyard cards into yours", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const stone = spawn(game, "Mind Stone", B);
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const giant = toGraveyard(game, "Hill Giant");
    pickModes(a, 0);
    cast(game, toHand(game, "Cathartic Parting"), { targets: [ref(stone), ref(bears), ref(bolt)] });
    expect(zone(game, stone)).toBe("library");
    expect(library(game, B)).toContain(stone);
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, bolt)).toBe("library");
    expect(library(game)).toEqual(expect.arrayContaining([bears, bolt]));
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("declining the shuffle leaves the graveyard cards; the artifact still goes", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const stone = spawn(game, "Mind Stone", B);
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a);
    cast(game, toHand(game, "Cathartic Parting"), { targets: [ref(stone), ref(bears)] });
    expect(zone(game, stone)).toBe("library");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("can't take your own artifact, nor more than four graveyard cards", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const mine = spawn(game, "Mind Stone");
    const theirs = spawn(game, "Mind Stone", B);
    const cards = Array.from({ length: 5 }, () => toGraveyard(game, "Grizzly Bears"));
    const card = toHand(game, "Cathartic Parting");
    expect(() => cast(game, card, { targets: [ref(mine)] })).toThrow();
    expect(() => cast(game, card, { targets: [ref(theirs), ...cards.map(ref)] })).toThrow();
  });
});

describe("Beastie Beatdown", () => {
  it("your creature deals damage equal to its power to theirs, one-sided", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Beastie Beatdown"), { targets: [ref(bears), ref(wurm)] });
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(counters(game, bears)).toBe(0);
  });

  it("delirium: two +1/+1 counters first, so it deals 4", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    delirium(game);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Beastie Beatdown"), { targets: [ref(bears), ref(wurm)] });
    expect(counters(game, bears)).toBe(2);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Midnight Mayhem", () => {
  it("makes three Gremlins; Gremlins you control then gain menace, lifelink and haste — not later ones", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Midnight Mayhem"));
    expect(tokensNamed(game, "Gremlin Token", A)).toBe(3);
    const gremlins = named(game, "Gremlin Token", A);
    for (const id of gremlins) {
      const kw = keywords(game, id);
      expect(kw.has("menace") && kw.has("lifelink") && kw.has("haste")).toBe(true);
    }
    expect(keywords(game, bears).has("haste")).toBe(false);
    // A Gremlin made afterwards gains nothing (the ruling).
    game.debugApplyEffect(A, { kind: "create-token", token: "Gremlin Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Gremlin Token", A)).toBe(4);
    const hasty = named(game, "Gremlin Token", A)
      .filter((id) => keywords(game, id).has("haste"))
      .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(hasty).toBe(3);
  });
});

describe("Jump Scare", () => {
  it("+2/+2, flying, and a Horror enchantment creature until end of turn", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Jump Scare"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(types(game, bears)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Horror"]));
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(types(game, bears)).not.toContain("enchantment");
    expect(subtypes(game, bears)).not.toContain("Horror");
  });
});

describe("Manifest Dread", () => {
  it("manifests one of the top two, the other to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const giant = toLibrary(game, "Hill Giant");
    const wurm = toLibrary(game, "Craw Wurm");
    a.chooseFromZoneFn = () => [giant];
    cast(game, toHand(game, "Manifest Dread"));
    expect(game.state.objects[giant].faceDown?.kind).toBe("manifest");
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Skullsnap Nuisance", () => {
  it("eerie: surveils 1 for each enchantment you control entering and each Room you fully unlock", () => {
    const { game, a } = table();
    spawn(game, "Skullsnap Nuisance");
    let surveils = 0;
    a.chooseScryFn = (_view, cards, mode) => {
      if (mode === "surveil") surveils += 1;
      return cards;
    };
    // A Room: its entering (an enchantment), then fully unlocking it.
    lands(game, "Island", 6);
    pickTargets(a, null);
    const top = toLibrary(game, "Hill Giant");
    const room = toHand(game, "Bottomless Pool // Locker Room");
    game.dispatch({ type: "cast-spell", player: A, card: room, face: 1, targets: [] });
    settle(game);
    expect(surveils).toBe(1);
    expect(zone(game, top)).toBe("graveyard");
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(surveils).toBe(2);
    enter(game, "Glorious Anthem");
    expect(surveils).toBe(3);
    // An opponent's enchantment doesn't count.
    enter(game, "Glorious Anthem", B);
    expect(surveils).toBe(3);
  });
});

describe("Wildfire Wickerfolk", () => {
  it("a hasty 3/2; with delirium a 4/3 with trample", () => {
    const { game } = table();
    const folk = spawn(game, "Wildfire Wickerfolk");
    expect(pt(game, folk)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, folk).has("haste")).toBe(true);
    expect(keywords(game, folk).has("trample")).toBe(false);
    delirium(game);
    expect(pt(game, folk)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, folk).has("trample")).toBe(true);
  });
});

describe("Glimmer Seeker", () => {
  it("survival without a Glimmer creature: makes a 1/1 Glimmer", () => {
    const { game } = table();
    spawn(game, "Glimmer Seeker", A, { tapped: true });
    const before = hand(game).length;
    toStep(game, "postcombat-main");
    settle(game);
    expect(tokensNamed(game, "Glimmer Token", A)).toBe(1);
    expect(hand(game).length).toBe(before);
  });

  it("survival with a Glimmer creature: draws instead", () => {
    const { game } = table();
    spawn(game, "Glimmer Seeker", A, { tapped: true });
    game.debugApplyEffect(A, { kind: "create-token", token: "Glimmer Token", count: 1 }, []);
    settle(game);
    const before = hand(game).length;
    toStep(game, "postcombat-main");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Glimmer Token", A)).toBe(1);
  });

  it("untapped, nothing", () => {
    const { game } = table();
    spawn(game, "Glimmer Seeker");
    const before = hand(game).length;
    toStep(game, "postcombat-main");
    settle(game);
    expect(tokensNamed(game, "Glimmer Token", A)).toBe(0);
    expect(hand(game).length).toBe(before);
  });
});

describe("Wary Watchdog", () => {
  it("surveils 1 as it enters and as it dies", () => {
    const { game, a } = table();
    a.chooseScryFn = (_view, cards) => cards;
    const bears = toLibrary(game, "Grizzly Bears");
    const dog = enter(game, "Wary Watchdog");
    expect(zone(game, bears)).toBe("graveyard");
    const giant = toLibrary(game, "Hill Giant");
    destroy(game, dog);
    expect(zone(game, dog)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Hardened Escort", () => {
  it("as it attacks, another creature you control gets +1/+0 and indestructible", () => {
    const { game, a } = table();
    const escort = spawn(game, "Hardened Escort");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    spawn(game, "Craw Wurm", B, { tapped: true });
    const seen = watchTargets(a, () => [bears]);
    attack(game, a, [escort]);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, escort).has("indestructible")).toBe(false);
  });
});

describe("Unnerving Grasp", () => {
  it("returns a nonland permanent and manifests dread", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    cast(game, toHand(game, "Unnerving Grasp"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(faceDown(game)).toHaveLength(1);
  });

  it("with no target chosen it still manifests dread", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    cast(game, toHand(game, "Unnerving Grasp"), { targets: [null] });
    expect(faceDown(game)).toHaveLength(1);
  });

  it("with its target gone it doesn't resolve: no manifest (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    const libraryBefore = library(game).length;
    cast(game, toHand(game, "Unnerving Grasp"), { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(faceDown(game)).toHaveLength(0);
    expect(library(game).length).toBe(libraryBefore);
  });
});

describe("Violent Urge", () => {
  it("+1/+0 and first strike; double strike only with delirium", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Violent Urge"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
    delirium(game);
    const giant = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Violent Urge"), { targets: [ref(giant)] });
    expect(keywords(game, giant).has("double-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, giant).has("double-strike")).toBe(false);
  });
});

describe("Cursed Windbreaker", () => {
  it("manifests dread as it enters and attaches to that creature, which has flying; equip {3}", () => {
    const { game } = table();
    const breaker = enter(game, "Cursed Windbreaker");
    const host = game.state.objects[breaker].attachedTo;
    expect(host).not.toBeNull();
    expect(game.state.objects[host!].faceDown).toBeDefined();
    expect(keywords(game, host!).has("flying")).toBe(true);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    toStep(game, "postcombat-main");
    activate(game, breaker, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, host!).has("flying")).toBe(false);
  });
});

describe("Rite of the Moth", () => {
  it("returns a creature card with a finality counter, and again by flashback", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const rite = toHand(game, "Rite of the Moth");
    cast(game, rite, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "finality")).toBe(1);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");

    expect(zone(game, rite)).toBe("graveyard");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, rite, { targets: [ref(giant)], via: "flashback" });
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant, "finality")).toBe(1);
    expect(zone(game, rite)).toBe("exile");
  });
});

describe("Fear of Being Hunted", () => {
  it("a hasty enchantment creature that must be blocked if able", () => {
    const { game, a } = table();
    const fear = spawn(game, "Fear of Being Hunted");
    expect(keywords(game, fear).has("haste")).toBe(true);
    expect(types(game, fear)).toEqual(expect.arrayContaining(["enchantment", "creature"]));
    spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [fear]);
    expect(offer.mustBeBlockedIfAble).toEqual([fear]);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: [] })).toThrow(/must be blocked/);
  });
});

void graveyard;
