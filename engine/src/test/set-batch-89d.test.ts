/**
 * Set walk batch 89, part d (2026-10-16): The Big Score (BIG), Outlaws of Thunder Junction Commander (OTC) and Outlaws of Thunder Junction (OTJ), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const libraryTop = (game: Game, player: PlayerId = A): ObjectId => game.state.zones.perPlayer[player].library[0];
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;
/** Any offer to cast or play `card` (from wherever it is). */
const offersFor = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === card);
const tap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
};

describe("Reach for the Sky", () => {
  it("gives +3/+2 and reach, and draws a card when it goes to the graveyard from the battlefield", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const aura = toHand(game, "Reach for the Sky");
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
    expect(keywords(game, bears).has("reach")).toBe(true);
    const before = hand(game).length;
    destroy(game, aura);
    expect(zone(game, aura)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw when its target is gone as it resolves", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 4);
    const aura = toHand(game, "Reach for the Sky");
    cast(game, aura, { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    const before = hand(game).length;
    settle(game);
    expect(zone(game, aura)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Bruse Tarl, Roving Rancher", () => {
  it("exiles a land card off the top for a double-striking Ox, and the land can't be played", () => {
    const { game } = table();
    const wastes = toLibrary(game, "Wastes");
    enter(game, "Bruse Tarl, Roving Rancher");
    expect(zone(game, wastes)).toBe("exile");
    expect(tokensNamed(game, "Ox Token", A)).toBe(1);
    const [ox] = named(game, "Ox Token", A);
    expect(keywords(game, ox).has("double-strike")).toBe(true);
    expect(offersFor(game, wastes)).toHaveLength(0);
  });

  it("exiles a nonland card it may cast, and makes no Ox; its attack does it again", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const bruse = enter(game, "Bruse Tarl, Roving Rancher");
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Ox Token", A)).toBe(0);
    toStep(game, "postcombat-main");
    lands(game, "Forest", 2);
    expect(offersFor(game, bears).length).toBeGreaterThan(0);
    // Its attack (next turn, still inside the permission) exiles a Wastes: an Ox.
    attack(game, a, [bruse]);
    expect(tokensNamed(game, "Ox Token", A)).toBe(1);
  });

  it("only Oxen you control have double strike", () => {
    const { game } = table();
    spawn(game, "Bruse Tarl, Roving Rancher");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "create-token", token: "Ox Token", count: 1 });
    const [theirOx] = named(game, "Ox Token", B);
    expect(keywords(game, bears).has("double-strike")).toBe(false);
    expect(keywords(game, theirOx).has("double-strike")).toBe(false);
  });
});

describe("Shackle Slinger", () => {
  it("taps an untapped creature on your second spell, not your first or third", () => {
    const { game } = table();
    spawn(game, "Shackle Slinger");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ornithopter"));
    expect(isTapped(game, bears)).toBe(false);
    cast(game, toHand(game, "Ornithopter"));
    expect(isTapped(game, bears)).toBe(true);
    expect(counters(game, bears, "stun")).toBe(0);
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, bears, "stun")).toBe(0);
  });

  it("stuns a creature that's already tapped", () => {
    const { game } = table();
    spawn(game, "Shackle Slinger");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Ornithopter"));
    expect(counters(game, bears, "stun")).toBe(1);
    expect(isTapped(game, bears)).toBe(true);
  });
});

describe("Silver Deputy", () => {
  it("may search for a basic land or a Desert and put it on top; taps to pump at sorcery speed", () => {
    const { game, a } = table();
    const desert = toLibrary(game, "Hashep Oasis");
    const bolt = toLibrary(game, "Lightning Bolt");
    pickModes(a, 0);
    const seen = pickFromZone(a, desert);
    const deputy = enter(game, "Silver Deputy");
    expect(seen.offered).toContain(desert);
    expect(seen.offered).not.toContain(bolt);
    expect(seen.offered.some((id) => game.state.objects[id].cardName === "Wastes")).toBe(true);
    expect(libraryTop(game)).toBe(desert);
    toStep(game, "postcombat-main");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, deputy, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Patient Naturalist", () => {
  it("mills three and puts a land card from among them into your hand", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Patient Naturalist");
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("makes a Treasure when no land card was milled", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Lightning Bolt");
    toLibrary(game, "Ornithopter");
    const before = hand(game).length;
    enter(game, "Patient Naturalist");
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(3);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Prickly Pair", () => {
  it("makes the shared Mercenary token", () => {
    const { game } = table();
    enter(game, "Prickly Pair");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
  });
});

describe("Caught in the Crossfire", () => {
  it("the outlaw mode hits only outlaws, the other only non-outlaws, and both hit everything", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const raider = spawn(game, "Mine Raider", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Caught in the Crossfire"), { modes: [0] });
    expect(zone(game, raider)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    const merc = spawn(game, "Prickly Pair");
    cast(game, toHand(game, "Caught in the Crossfire"), { modes: [1] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, merc)).toBe("battlefield");
  });

  it("costs {1} more for each mode chosen", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const spell = toHand(game, "Caught in the Crossfire");
    expect(() => cast(game, spell, { modes: [0, 1] })).toThrow();
    cast(game, spell, { modes: [0] });
    expect(zone(game, spell)).toBe("graveyard");
  });
});

describe("Thunder Lasso", () => {
  it("attaches as it enters, gives +1/+1, and taps a creature the defending player controls", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    const lasso = toHand(game, "Thunder Lasso");
    cast(game, lasso);
    expect(game.state.objects[lasso].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const theirs = spawn(game, "Hill Giant", B);
    const otherOfTheirs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Hill Giant", C);
    const seen = watchTargets(a, () => [theirs]);
    attack(game, a, [bears], B);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).toContain(otherOfTheirs);
    expect(seen.offered[0]).not.toContain(carols);
    expect(isTapped(game, theirs)).toBe(true);
    expect(isTapped(game, carols)).toBe(false);
  });
});

describe("Cactarantula", () => {
  it("costs {1} less while you control a Desert", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const spider = toHand(game, "Cactarantula");
    expect(() => cast(game, spider)).toThrow();
    spawn(game, "Hashep Oasis", A, { tapped: true });
    cast(game, spider);
    expect(zone(game, spider)).toBe("battlefield");
  });
});

describe("Boneyard Desecrator", () => {
  const sacrifice = (game: Game, source: ObjectId, victim: ObjectId): void => {
    game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 0, targets: [], sacrifice: victim });
    settle(game);
  };

  it("grows on another creature sacrificed, and makes a Treasure only for an outlaw", () => {
    const { game } = table();
    const desecrator = spawn(game, "Boneyard Desecrator");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 4);
    sacrifice(game, desecrator, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, desecrator)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    const raider = spawn(game, "Mine Raider");
    sacrifice(game, desecrator, raider);
    expect(counters(game, desecrator)).toBe(2);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("can't sacrifice itself", () => {
    const { game } = table();
    const desecrator = spawn(game, "Boneyard Desecrator");
    lands(game, "Swamp", 2);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: desecrator, abilityIndex: 0, targets: [], sacrifice: desecrator }),
    ).not.toBeNull();
  });
});

describe("Hellspur Brute", () => {
  it("costs {1} less for each outlaw you control", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const brute = toHand(game, "Hellspur Brute");
    spawn(game, "Mine Raider");
    expect(() => cast(game, brute)).toThrow();
    game.debugApplyEffect(A, { kind: "create-token", token: "Mercenary Token", count: 1 });
    cast(game, brute);
    expect(zone(game, brute)).toBe("battlefield");
  });
});

describe("Boom Box", () => {
  it("destroys up to one target artifact, creature and land", () => {
    const { game } = table();
    const box = spawn(game, "Boom Box");
    lands(game, "Wastes", 6);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    activate(game, box, 0, { targets: [ref(ring), ref(bears), ref(forest)] });
    expect(zone(game, box)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("can leave slots empty", () => {
    const { game } = table();
    const box = spawn(game, "Boom Box");
    lands(game, "Wastes", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, box, 0, { targets: [null, ref(bears), null] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Redrock Sentinel", () => {
  it("sacrifices a land to draw a card and make a Treasure", () => {
    const { game } = table();
    const sentinel = spawn(game, "Redrock Sentinel");
    const [first] = lands(game, "Wastes", 3);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: sentinel, abilityIndex: 0, targets: [], sacrifice: first });
    settle(game);
    expect(zone(game, first)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Mine Raider", () => {
  it("makes a Treasure only if you control another outlaw", () => {
    const { game } = table();
    enter(game, "Mine Raider");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    spawn(game, "Grizzly Bears");
    spawn(game, "Vault Plunderer", B);
    enter(game, "Mine Raider");
    // The first Mine Raider is another outlaw now.
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("an opponent's outlaw isn't yours", () => {
    const { game } = table();
    spawn(game, "Vault Plunderer", B);
    enter(game, "Mine Raider");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });
});

describe("Annie Flash, the Veteran", () => {
  it("cast, returns a permanent card with mana value 3 or less from your graveyard tapped", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const giant = toGraveyard(game, "Hill Giant");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Annie Flash, the Veteran"));
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
    expect(isTapped(game, bears)).toBe(true);
  });

  it("put onto the battlefield without being cast, returns nothing", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    enter(game, "Annie Flash, the Veteran");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("becoming tapped exiles the top two cards, which may be played this turn", () => {
    const { game } = table();
    const annie = spawn(game, "Annie Flash, the Veteran");
    const second = toLibrary(game, "Wastes");
    const first = toLibrary(game, "Grizzly Bears");
    tap(game, annie);
    expect(zone(game, first)).toBe("exile");
    expect(zone(game, second)).toBe("exile");
    toStep(game, "postcombat-main");
    expect(offersFor(game, second).length).toBeGreaterThan(0);
    lands(game, "Forest", 2);
    expect(offersFor(game, first).length).toBeGreaterThan(0);
  });
});

describe("Neutralize the Guards", () => {
  it("shrinks the target opponent's creatures, not yours, then surveils 2", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Hill Giant", C);
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    cast(game, toHand(game, "Neutralize the Guards"), { targets: [ref(B)] });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, carols)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(surveilled).toHaveLength(2);
    expect(graveyard(game).length).toBe(3);
  });
});

describe("Outlaws' Fury", () => {
  it("pumps your creatures, and with an outlaw exiles the top card to play through your next turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const raider = spawn(game, "Mine Raider");
    const top = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Outlaws' Fury"));
    expect(pt(game, raider)).toEqual({ power: 5, toughness: 2 });
    expect(zone(game, top)).toBe("exile");
    lands(game, "Forest", 2);
    expect(offersFor(game, top).length).toBeGreaterThan(0);
  });

  it("without an outlaw, only pumps", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const top = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Outlaws' Fury"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(zone(game, top)).toBe("library");
  });
});

describe("Thunder Salvo", () => {
  it("deals 2 plus the number of other spells you've cast this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wurm = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Thunder Salvo"), { targets: [ref(wurm)] });
    expect(damage(game, wurm)).toBe(2);
    cast(game, toHand(game, "Ornithopter"));
    const other = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Thunder Salvo"), { targets: [ref(other)] });
    // The first Salvo and the Ornithopter: 2 + 2.
    expect(damage(game, other)).toBe(4);
  });

  it("a copy counts every spell you cast, the original among them", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const wurm = spawn(game, "Colossal Dreadmaw", B);
    const salvo = toHand(game, "Thunder Salvo");
    cast(game, salvo, { targets: [ref(wurm)], settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(salvo)], settle: false });
    // Twincast resolves, then the copy: 2 + Thunder Salvo + Twincast.
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(damage(game, wurm)).toBe(4);
    // The original: 2 + Twincast.
    settle(game);
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Consuming Ashes", () => {
  it("exiles the creature, and surveils 2 only if it had mana value 3 or less", () => {
    const { game, a } = table();
    lands(game, "Swamp", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    let asked = 0;
    a.chooseScryFn = () => {
      asked += 1;
      return [];
    };
    cast(game, toHand(game, "Consuming Ashes"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(asked).toBe(0);
    cast(game, toHand(game, "Consuming Ashes"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(asked).toBe(1);
  });
});

describe("Vault Plunderer", () => {
  it("target player draws a card and loses 1 life", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const before = hand(game, B).length;
    enter(game, "Vault Plunderer");
    expect(hand(game, B).length).toBe(before + 1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Raucous Entertainer", () => {
  it("puts a +1/+1 counter on each creature you control that entered this turn", () => {
    const { game } = table();
    const entertainer = spawn(game, "Raucous Entertainer");
    const old = spawn(game, "Grizzly Bears");
    game.state.objects[entertainer].enteredBattlefieldOnTurn = 0;
    game.state.objects[old].enteredBattlefieldOnTurn = 0;
    const fresh = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 1);
    activate(game, entertainer);
    expect(counters(game, fresh)).toBe(1);
    expect(counters(game, old)).toBe(0);
    expect(counters(game, entertainer)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Spring Splasher", () => {
  it("gives a creature the defending player controls -3/-0 as it attacks", () => {
    const { game, a } = table();
    const splasher = spawn(game, "Spring Splasher");
    const giant = spawn(game, "Hill Giant", B);
    attack(game, a, [splasher]);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Betrayal at the Vault", () => {
  it("your creature deals damage equal to its power to each of two other creatures", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const maw = spawn(game, "Colossal Dreadmaw");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Betrayal at the Vault");
    // The two other targets are different creatures, neither yours-dealing-it.
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(maw), ref(giant), ref(giant)] }),
    ).not.toBeNull();
    expect(
      game.canDispatch({ type: "cast-spell", player: A, card: spell, targets: [ref(maw), ref(maw), ref(giant)] }),
    ).not.toBeNull();
    cast(game, spell, { targets: [ref(maw), ref(giant), ref(bears)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(damage(game, maw)).toBe(0);
  });

  it("deals no damage if your creature has left; one other target gone still leaves the other", () => {
    const { game } = table();
    lands(game, "Forest", 12);
    const maw = spawn(game, "Colossal Dreadmaw");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Betrayal at the Vault"), { targets: [ref(maw), ref(giant), ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(maw)]);
    settle(game);
    expect(damage(game, giant)).toBe(0);
    expect(damage(game, bears)).toBe(0);
    const other = spawn(game, "Colossal Dreadmaw");
    cast(game, toHand(game, "Betrayal at the Vault"), { targets: [ref(other), ref(giant), ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
  });
});
