/**
 * Set walk batch 85, part c (2026-10-15): Foundations Jumpstart (J25), Duskmourn: House of Horror Commander (DSC) and Duskmourn: House of Horror (DSK), the rest of the sets.
 * Written on the shared table in `harness.ts`.
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
  watchTargets,
  zone,
} from "./harness.js";

const ROOM = "Underwater Tunnel // Slimy Aquarium";

const libraryOf = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const restrictions = (game: Game, id: ObjectId): readonly string[] => [...(game.characteristics(id).restrictions ?? [])];

/** Cast `ROOM`'s Underwater Tunnel door (face 1), its surveil keeping both cards. */
function castTunnel(game: Game): ObjectId {
  const room = toHand(game, ROOM);
  game.dispatch({ type: "cast-spell", player: A, card: room, face: 1, targets: [] });
  settle(game);
  return room;
}

/** Four card types in alice's graveyard: a land, an instant, an artifact and a creature. */
function delirium(game: Game): void {
  toGraveyard(game, "Forest");
  toGraveyard(game, "Lightning Bolt");
  toGraveyard(game, "Sol Ring");
  toGraveyard(game, "Grizzly Bears");
}

describe("Growing Dread", () => {
  it("manifests dread as it enters, and a permanent you turn face up gets a +1/+1 counter", () => {
    const { game, a } = table();
    spawn(game, "Forest");
    spawn(game, "Island");
    const giant = toLibrary(game, "Hill Giant");
    const bolt = toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [giant];
    cast(game, toHand(game, "Growing Dread"));
    expect(game.state.objects[giant].faceDown).toBeDefined();
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, giant)).toBe(0);
    lands(game, "Mountain", 4);
    game.dispatch({ type: "turn-face-up", player: A, permanent: giant });
    settle(game);
    expect(game.state.objects[giant].faceDown).toBeUndefined();
    expect(counters(game, giant)).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Scrabbling Skullcrab", () => {
  it("target player mills two when an enchantment you control enters and when you fully unlock a Room", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    spawn(game, "Scrabbling Skullcrab");
    pickTargets(a, B);
    // An opponent's enchantment doesn't count.
    enter(game, "Glorious Anthem", B);
    expect(graveyard(game, B).length).toBe(0);
    enter(game, "Glorious Anthem");
    expect(graveyard(game, B).length).toBe(2);
    toStep(game, "precombat-main");
    // The Room entering is an enchantment entering (2 more); its second door
    // fully unlocks it (2 more).
    const room = castTunnel(game);
    expect(graveyard(game, B).length).toBe(4);
    toStep(game, "precombat-main");
    a.chooseFromZoneFn = (_view, cards) => [cards[0]];
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(graveyard(game, B).length).toBe(6);
  });
});

describe("Clammy Prowler", () => {
  it("makes another attacking creature unblockable this turn", () => {
    const { game, a } = table();
    const prowler = spawn(game, "Clammy Prowler");
    const bears = spawn(game, "Grizzly Bears");
    // The bears are the one other attacker: the one legal target.
    attack(game, a, [prowler, bears]);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
    expect(keywords(game, prowler).has("unblockable")).toBe(false);
  });

  it("attacking alone, it has no other attacker to target", () => {
    const { game, a } = table();
    const prowler = spawn(game, "Clammy Prowler");
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, (o) => o.map((slot) => slot[0] ?? null));
    attack(game, a, [prowler]);
    expect(seen.asked).toBe(0);
    expect(keywords(game, prowler).has("unblockable")).toBe(false);
  });
});

describe("Underwater Tunnel // Slimy Aquarium", () => {
  it("Underwater Tunnel surveils 2 as it's unlocked; Slimy Aquarium manifests dread and counters that creature", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const second = toLibrary(game, "Lightning Bolt");
    const first = toLibrary(game, "Grizzly Bears");
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    const room = castTunnel(game);
    expect([...surveilled].sort()).toEqual([first, second].sort());
    expect([zone(game, first), zone(game, second)]).toEqual(["graveyard", "graveyard"]);
    // The other door, for {3}{U}.
    const giant = toLibrary(game, "Hill Giant");
    const pacifism = toLibrary(game, "Pacifism");
    a.chooseFromZoneFn = () => [giant];
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(game.state.objects[room].doors).toEqual({ left: true, right: true });
    expect(game.state.objects[giant].faceDown).toBeDefined();
    expect(counters(game, giant)).toBe(1);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, pacifism)).toBe("graveyard");
  });
});

describe("Innocuous Rat", () => {
  it("manifests dread when it dies", () => {
    const { game, a } = table();
    const rat = spawn(game, "Innocuous Rat");
    const giant = toLibrary(game, "Hill Giant");
    toLibrary(game, "Lightning Bolt");
    a.chooseFromZoneFn = () => [giant];
    destroy(game, rat);
    expect(zone(game, rat)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown).toBeDefined();
  });
});

describe("Peer Past the Veil", () => {
  it("discards your hand, then draws one card per card type in your graveyard", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    toGraveyard(game, "Pacifism");
    // The opening hand is Wastes (a land); add an instant, an artifact and a creature.
    toHand(game, "Lightning Bolt");
    toHand(game, "Sol Ring");
    toHand(game, "Grizzly Bears");
    const veil = toHand(game, "Peer Past the Veil");
    cast(game, veil);
    // Enchantment, land, instant, artifact, creature — the spell itself
    // (still on the stack as it counts) isn't one of them.
    expect(hand(game).length).toBe(5);
    expect(zone(game, veil)).toBe("graveyard");
  });
});

describe("Fear of Failed Tests", () => {
  it("draws a card for each point of combat damage it deals to a player", () => {
    const { game, a } = table();
    const fear = spawn(game, "Fear of Failed Tests");
    const before = hand(game).length;
    attack(game, a, [fear]);
    settle(game);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Popular Egotist", () => {
  it("sacrifices another creature or enchantment to gain indestructible and tap; each sacrifice drains 1", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const egotist = spawn(game, "Popular Egotist");
    const bears = spawn(game, "Grizzly Bears");
    const anthem = spawn(game, "Glorious Anthem");
    game.dispatch({ type: "activate-ability", player: A, source: egotist, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(isTapped(game, egotist)).toBe(true);
    expect(keywords(game, egotist).has("indestructible")).toBe(true);
    expect([life(game, A), life(game, B)]).toEqual([21, 19]);
    game.dispatch({ type: "activate-ability", player: A, source: egotist, abilityIndex: 0, targets: [], sacrifice: anthem });
    settle(game);
    expect(zone(game, anthem)).toBe("graveyard");
    expect([life(game, A), life(game, B)]).toEqual([22, 18]);
  });

  it("can't sacrifice itself to its ability, but its own sacrifice drains", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const egotist = spawn(game, "Popular Egotist");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: egotist, abilityIndex: 0, targets: [], sacrifice: egotist }),
    ).not.toBeNull();
    // An edict alice aims at herself: Popular Egotist is her only creature.
    cast(game, toHand(game, "Diabolic Edict"), { targets: [ref(A)] });
    expect(zone(game, egotist)).toBe("graveyard");
    expect([life(game, A), life(game, B)]).toEqual([21, 19]);
  });
});

describe("Patchwork Beastie", () => {
  it("can't attack or block without delirium; may mill a card each upkeep", () => {
    const { game, a } = table();
    const beastie = spawn(game, "Patchwork Beastie");
    expect(restrictions(game, beastie)).toEqual(expect.arrayContaining(["cant-attack", "cant-block"]));
    delirium(game);
    expect(restrictions(game, beastie)).not.toContain("cant-attack");
    expect(restrictions(game, beastie)).not.toContain("cant-block");
    const before = graveyard(game).length;
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(graveyard(game).length).toBe(before + 1);
  });

  it("declining the mill mills nothing", () => {
    const { game, a } = table();
    spawn(game, "Patchwork Beastie");
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Fear of Infinity", () => {
  it("can't block, and returns from your graveyard to your hand when an enchantment you control enters", () => {
    const { game, a } = table();
    const onField = spawn(game, "Fear of Infinity");
    expect(restrictions(game, onField)).toContain("cant-block");
    const fear = toGraveyard(game, "Fear of Infinity");
    pickModes(a, 0);
    // An opponent's enchantment doesn't count.
    enter(game, "Glorious Anthem", B);
    expect(zone(game, fear)).toBe("graveyard");
    enter(game, "Glorious Anthem");
    expect(zone(game, fear)).toBe("hand");
    expect(zone(game, onField)).toBe("battlefield");
  });

  it("returns when you fully unlock a Room, and may be left there", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const room = castTunnel(game);
    const fear = toGraveyard(game, "Fear of Infinity");
    pickModes(a);
    toStep(game, "precombat-main");
    // Declined: it stays.
    castTunnel(game);
    expect(zone(game, fear)).toBe("graveyard");
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, cards) => [cards[0]];
    toStep(game, "precombat-main");
    game.dispatch({ type: "unlock-door", player: A, permanent: room, door: "right" });
    settle(game);
    expect(zone(game, fear)).toBe("hand");
  });
});

describe("Balustrade Wurm", () => {
  it("returns from your graveyard with a finality counter only with delirium", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const wurm = toGraveyard(game, "Balustrade Wurm");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Lightning Bolt");
    // Creature, land and instant: three types.
    expect(() => activate(game, wurm)).toThrow();
    toGraveyard(game, "Sol Ring");
    activate(game, wurm);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(counters(game, wurm, "finality")).toBe(1);
    expect(keywords(game, wurm).has("haste")).toBe(true);
    // The finality counter exiles it instead of letting it die.
    destroy(game, wurm);
    expect(zone(game, wurm)).toBe("exile");
  });

  it("can't be countered", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const wurm = toHand(game, "Balustrade Wurm");
    cast(game, wurm, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(wurm)]);
    settle(game);
    expect(zone(game, wurm)).toBe("battlefield");
  });
});

describe("House Cartographer", () => {
  it("tapped at your second main phase, it reveals until a land and puts it into your hand", () => {
    const { game, a } = table();
    const cartographer = spawn(game, "House Cartographer");
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    attack(game, a, [cartographer]);
    settle(game);
    expect(zone(game, forest)).toBe("hand");
    const library = libraryOf(game);
    expect(library[library.length - 1]).toBe(bears);
  });

  it("untapped, it does nothing", () => {
    const { game } = table();
    spawn(game, "House Cartographer");
    const forest = toLibrary(game, "Forest");
    toStep(game, "postcombat-main");
    settle(game);
    expect(zone(game, forest)).toBe("library");
  });
});

describe("Seized from Slumber", () => {
  it("costs {3} less aimed at a tapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const awake = spawn(game, "Grizzly Bears", B);
    const asleep = spawn(game, "Hill Giant", B, { tapped: true });
    const card = toHand(game, "Seized from Slumber");
    expect(() => cast(game, card, { targets: [ref(awake)] })).toThrow();
    cast(game, card, { targets: [ref(asleep)] });
    expect(zone(game, asleep)).toBe("graveyard");
    expect(zone(game, awake)).toBe("battlefield");
  });
});

describe("Coordinated Clobbering", () => {
  it("taps one or two of your untapped creatures, and each deals damage equal to its power to the opponent's creature", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Coordinated Clobbering"), { targets: [ref(bears), ref(giant), ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect([isTapped(game, bears), isTapped(game, giant)]).toEqual([true, true]);
    // One-sided: neither takes damage back.
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("can take just one, and never a tapped creature", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    const tired = spawn(game, "Grizzly Bears", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Coordinated Clobbering");
    expect(() => cast(game, card, { targets: [ref(tired), null, ref(bears)] })).toThrow();
    expect(() => cast(game, card, { targets: [ref(giant), ref(tired), ref(bears)] })).toThrow();
    cast(game, card, { targets: [ref(giant), null, ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(isTapped(game, giant)).toBe(true);
  });
});

describe("Spineseeker Centipede", () => {
  it("fetches a basic land as it enters, and gets +1/+2 and vigilance with delirium", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = () => [forest];
    const centipede = toHand(game, "Spineseeker Centipede");
    cast(game, centipede);
    expect(zone(game, forest)).toBe("hand");
    expect(pt(game, centipede)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, centipede).has("vigilance")).toBe(false);
    delirium(game);
    expect(pt(game, centipede)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, centipede).has("vigilance")).toBe(true);
  });
});

describe("Living Phone", () => {
  it("when it dies, finds a creature card with power 2 or less among the top five", () => {
    const { game, a } = table();
    const phone = spawn(game, "Living Phone");
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, cards) => {
      offered = cards;
      return [bears];
    };
    destroy(game, phone);
    expect(offered).toContain(bears);
    expect(offered).not.toContain(giant);
    expect(zone(game, bears)).toBe("hand");
    expect(libraryOf(game).slice(-4)).toContain(giant);
  });
});

describe("Ghostly Keybearer", () => {
  it("unlocks a locked door of up to one target Room you control on combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const room = castTunnel(game);
    const keybearer = spawn(game, "Ghostly Keybearer");
    pickTargets(a, room);
    a.chooseFromZoneFn = (_view, cards) => [cards[0]];
    attack(game, a, [keybearer]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[room].doors).toEqual({ left: true, right: true });
  });

  it("with no Room chosen, nothing is unlocked", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const room = castTunnel(game);
    const keybearer = spawn(game, "Ghostly Keybearer");
    pickTargets(a, null);
    attack(game, a, [keybearer]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[room].doors).toEqual({ left: true, right: false });
  });
});
