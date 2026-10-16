/**
 * Set walk batch 91, part d (2026-10-16): Murders at Karlov Manor (MKM) and Murders at Karlov Manor Commander (MKC), the rest of the sets.
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
  attack,
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
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const suspected = (game: Game, id: ObjectId): boolean => game.state.objects[id].suspectedAt !== undefined;

/** Cast `card` from alice's hand face down for {3} (rule 702.168a). */
const faceDown = (game: Game, card: ObjectId): void => {
  cast(game, card, { via: "face-down" });
  expect(game.state.objects[card].faceDown?.kind).toBe("disguise");
};

/** Turn alice's face-down `permanent` face up for its disguise cost — a
 * special action (rule 702.168d) — leaving any trigger unsettled. */
const turnUp = (game: Game, permanent: ObjectId, player: PlayerId = A): void => {
  const action = { type: "turn-face-up", player, permanent, morph: true } as Action;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
};

const stackHasItem = (game: Game): void => game.advanceUntil((s) => s.zones.shared.stack.length > 0);

describe("disguise creatures with no face-up trigger", () => {
  it("Riftburst Hellion is a 2/2 with ward {2} face down, and a 6/7 with reach once turned up", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const hellion = toHand(game, "Riftburst Hellion");
    faceDown(game, hellion);
    expect(pt(game, hellion)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, hellion).has("reach")).toBe(false);
    lands(game, "Mountain", 3);
    lands(game, "Forest", 3);
    turnUp(game, hellion);
    expect(game.state.objects[hellion].faceDown).toBeUndefined();
    expect(pt(game, hellion)).toEqual({ power: 6, toughness: 7 });
    expect(keywords(game, hellion).has("reach")).toBe(true);
  });

  it("Bolrac-Clan Basher turns up for {3}{R}{R} into a double-striking trampler", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const basher = toHand(game, "Bolrac-Clan Basher");
    faceDown(game, basher);
    lands(game, "Mountain", 4);
    // {3}{R}{R} is five mana: four isn't enough.
    expect(() => turnUp(game, basher)).toThrow();
    lands(game, "Mountain", 1);
    turnUp(game, basher);
    expect(pt(game, basher)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, basher).has("double-strike")).toBe(true);
    expect(keywords(game, basher).has("trample")).toBe(true);
  });
});

describe("Bubble Smuggler", () => {
  it("has four +1/+1 counters as it's turned face up", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const smuggler = toHand(game, "Bubble Smuggler");
    faceDown(game, smuggler);
    lands(game, "Island", 6);
    turnUp(game, smuggler);
    // A replacement, not a trigger: nothing waits on the stack.
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(counters(game, smuggler)).toBe(4);
    expect(pt(game, smuggler)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Forum Familiar", () => {
  it("returns another permanent you control and gets a +1/+1 counter as it's turned face up", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const familiar = toHand(game, "Forum Familiar");
    faceDown(game, familiar);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickTargets(a, bears);
    turnUp(game, familiar);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(counters(game, familiar)).toBe(1);
    expect(pt(game, familiar)).toEqual({ power: 2, toughness: 2 });
  });

  it("puts no counter on itself when its target is gone (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const familiar = toHand(game, "Forum Familiar");
    faceDown(game, familiar);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickTargets(a, bears);
    turnUp(game, familiar);
    stackHasItem(game);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, familiar)).toBe(0);
  });
});

describe("Sanguine Savior", () => {
  it("gives another creature you control lifelink as it's turned face up", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const savior = toHand(game, "Sanguine Savior");
    faceDown(game, savior);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickTargets(a, bears);
    turnUp(game, savior);
    settle(game);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, savior).has("flying")).toBe(true);
    expect(keywords(game, savior).has("lifelink")).toBe(true);
  });
});

describe("Dog Walker", () => {
  it("makes two tapped 1/1 Dogs as it's turned face up", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const walker = toHand(game, "Dog Walker");
    faceDown(game, walker);
    lands(game, "Mountain", 2);
    turnUp(game, walker);
    settle(game);
    expect(tokensNamed(game, "1/1 White Dog Token", A)).toBe(2);
    for (const dog of named(game, "1/1 White Dog Token", A)) expect(isTapped(game, dog)).toBe(true);
    expect(pt(game, walker)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Faerie Snoop", () => {
  it("looks at the top two as it's turned face up: one to hand, the other to the graveyard", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const snoop = toHand(game, "Faerie Snoop");
    faceDown(game, snoop);
    const second = toLibrary(game, "Grizzly Bears");
    const first = toLibrary(game, "Lightning Bolt");
    lands(game, "Island", 3);
    pickFromZone(a, second);
    turnUp(game, snoop);
    settle(game);
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, first)).toBe("graveyard");
  });
});

describe("Rakish Scoundrel", () => {
  it("gives a creature indestructible as it enters", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Rakish Scoundrel"));
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });

  it("does it again as it's turned face up, though it didn't as it entered face down", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Wastes", 3);
    const scoundrel = toHand(game, "Rakish Scoundrel");
    faceDown(game, scoundrel);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    lands(game, "Swamp", 6);
    turnUp(game, scoundrel);
    settle(game);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, scoundrel).has("deathtouch")).toBe(true);
  });
});

describe("Concealed Weapon", () => {
  it("is a 2/2 face down, and an Equipment that attaches itself as it's turned face up", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const weapon = toHand(game, "Concealed Weapon");
    faceDown(game, weapon);
    expect(types(game, weapon)).toContain("creature");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    pickTargets(a, bears);
    turnUp(game, weapon);
    settle(game);
    expect(types(game, weapon)).not.toContain("creature");
    expect(game.state.objects[weapon].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });

  it("can be turned face up with no creature to attach to, and stays unattached", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const weapon = toHand(game, "Concealed Weapon");
    faceDown(game, weapon);
    lands(game, "Mountain", 3);
    turnUp(game, weapon);
    settle(game);
    expect(zone(game, weapon)).toBe("battlefield");
    expect(game.state.objects[weapon].faceDown).toBeUndefined();
    expect(game.state.objects[weapon].attachedTo ?? null).toBe(null);
  });
});

describe("Sumala Sentry", () => {
  it("puts a +1/+1 counter on a permanent you turn face up and one on itself", () => {
    const { game } = table();
    const sentry = spawn(game, "Sumala Sentry");
    lands(game, "Wastes", 3);
    const walker = toHand(game, "Dog Walker");
    faceDown(game, walker);
    lands(game, "Mountain", 2);
    turnUp(game, walker);
    settle(game);
    expect(counters(game, walker)).toBe(1);
    expect(counters(game, sentry)).toBe(1);
    expect(pt(game, sentry)).toEqual({ power: 2, toughness: 4 });
  });

  it("ignores an opponent's permanent turned face up", () => {
    const { game } = table();
    const sentry = spawn(game, "Sumala Sentry");
    const walker = toHand(game, "Dog Walker", B);
    lands(game, "Wastes", 3, B);
    lands(game, "Mountain", 2, B);
    game.debugMove(walker, "battlefield");
    game.state.objects[walker].faceDown = { kind: "disguise" };
    game.advanceUntil((s) => s.priority.holder === B);
    turnUp(game, walker, B);
    settle(game);
    expect(counters(game, sentry)).toBe(0);
  });
});

describe("Goblin Maskmaker", () => {
  it("makes face-down spells cost {1} less for the rest of the turn once it attacks", () => {
    const { game, a } = table();
    const maskmaker = spawn(game, "Goblin Maskmaker");
    lands(game, "Wastes", 2);
    const hellion = toHand(game, "Riftburst Hellion");
    const faceDownOffers = (): number =>
      game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === hellion && o.via === "face-down").length;
    expect(faceDownOffers()).toBe(0);
    attack(game, a, [maskmaker]);
    expect(faceDownOffers()).toBeGreaterThan(0);
    faceDown(game, hellion);
    expect(game.state.objects[hellion].faceDown?.kind).toBe("disguise");
  });
});

describe("Basilica Stalker", () => {
  it("gains 1 life and surveils 1 when it deals combat damage to a player", () => {
    const { game, a } = table();
    const stalker = spawn(game, "Basilica Stalker");
    const top = toLibrary(game, "Grizzly Bears");
    a.chooseScryFn = () => [top];
    attack(game, a, [stalker]);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(21);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Festerleech", () => {
  it("mills two when it deals combat damage to a player", () => {
    const { game, a } = table();
    const leech = spawn(game, "Festerleech");
    const before = graveyard(game).length;
    attack(game, a, [leech]);
    expect(life(game, B)).toBe(19);
    expect(graveyard(game).length).toBe(before + 2);
  });

  it("pumps +2/+2 only once each turn", () => {
    const { game } = table();
    const leech = spawn(game, "Festerleech");
    lands(game, "Swamp", 4);
    activate(game, leech, 0);
    expect(pt(game, leech)).toEqual({ power: 3, toughness: 3 });
    expect(() => activate(game, leech, 0)).toThrow();
  });
});

describe("Reckless Detective", () => {
  it("sacrifices an artifact on attack to draw a card and get +2/+0", () => {
    const { game, a } = table();
    const detective = spawn(game, "Reckless Detective");
    game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1 });
    const [clue] = named(game, "Clue Token", A);
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [detective]);
    expect(game.state.objects[clue]?.zone).not.toBe("battlefield");
    expect(hand(game).length).toBe(before + 1);
    expect(pt(game, detective)).toEqual({ power: 2, toughness: 3 });
    expect(life(game, B)).toBe(18);
  });

  it("gets nothing when the chosen cost can't be paid", () => {
    const { game, a } = table();
    const detective = spawn(game, "Reckless Detective");
    const before = hand(game).length;
    // "Yes", then the sacrifice mode — with no artifact to sacrifice.
    pickModes(a, 0);
    attack(game, a, [detective]);
    expect(hand(game).length).toBe(before);
    expect(pt(game, detective)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Wrench", () => {
  it("is a Clue that gives +1/+1, vigilance and a tap ability, and sacrifices to draw", () => {
    const { game } = table();
    const wrench = spawn(game, "Wrench");
    expect(subtypes(game, wrench)).toContain("Clue");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 7);
    activate(game, wrench, 1, { targets: [ref(bears)] });
    expect(game.state.objects[wrench].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    // The granted "{3}, {T}: Tap target creature."
    activate(game, bears, 0, { targets: [ref(theirs)] });
    expect(isTapped(game, theirs)).toBe(true);
    expect(isTapped(game, bears)).toBe(true);
    const before = hand(game).length;
    activate(game, wrench, 0);
    expect(zone(game, wrench)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Lead Pipe", () => {
  it("gives +2/+0, and each opponent loses 1 life when the equipped creature dies", () => {
    const { game } = table({ players: 3 });
    const pipe = spawn(game, "Lead Pipe");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    activate(game, pipe, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    destroy(game, bears);
    expect(life(game, B)).toBe(19);
    expect(life(game, "carol" as PlayerId)).toBe(19);
    expect(life(game, A)).toBe(20);
  });

  it("does nothing when an unequipped creature dies", () => {
    const { game } = table();
    spawn(game, "Lead Pipe");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(life(game, B)).toBe(20);
  });
});

describe("Thinking Cap", () => {
  it("equips a Detective for {1}, anything else only for {3}", () => {
    const { game } = table();
    const cap = spawn(game, "Thinking Cap");
    const inspector = spawn(game, "Novice Inspector");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 1);
    expect(() => activate(game, cap, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, cap, 0, { targets: [ref(inspector)] });
    expect(pt(game, inspector)).toEqual({ power: 2, toughness: 4 });
    lands(game, "Wastes", 3);
    activate(game, cap, 1, { targets: [ref(bears)] });
    expect(game.state.objects[cap].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("It Doesn't Add Up", () => {
  it("returns a creature card from your graveyard to the battlefield suspected", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "It Doesn't Add Up"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(suspected(game, bears)).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(true);
  });
});

describe("Eliminate the Impossible", () => {
  it("investigates, shrinks opponents' creatures by -2/-0 and unsuspects them", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "suspect", target: 0 }, [ref(theirs)]);
    game.debugApplyEffect(B, { kind: "suspect", target: 0 }, [ref(mine)]);
    expect(suspected(game, theirs)).toBe(true);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Eliminate the Impossible"));
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 2 });
    expect(suspected(game, theirs)).toBe(false);
    expect(keywords(game, theirs).has("menace")).toBe(false);
    // Yours keep their power, and stay suspected.
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(suspected(game, mine)).toBe(true);
  });
});

describe("Rot Farm Mortipede", () => {
  it("gets +1/+0, menace and lifelink once when creature cards leave your graveyard together", () => {
    const { game } = table();
    const mortipede = spawn(game, "Rot Farm Mortipede");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, {
      kind: "return-from-graveyard",
      filter: { type: "creature" },
      destination: "hand",
      count: "all",
    });
    settle(game);
    expect(pt(game, mortipede)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, mortipede).has("menace")).toBe(true);
    expect(keywords(game, mortipede).has("lifelink")).toBe(true);
  });

  it("ignores a noncreature card leaving", () => {
    const { game } = table();
    const mortipede = spawn(game, "Rot Farm Mortipede");
    const bolt = toGraveyard(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(bolt)]);
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(pt(game, mortipede)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Burden of Proof", () => {
  it("gives a Detective you control +2/+2", () => {
    const { game } = table();
    const inspector = spawn(game, "Novice Inspector");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Burden of Proof"), { targets: [ref(inspector)] });
    expect(pt(game, inspector)).toEqual({ power: 3, toughness: 4 });
  });

  it("makes anything else a base 1/1 — an opponent's Detective too", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirInspector = spawn(game, "Novice Inspector", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Burden of Proof"), { targets: [ref(bears)] });
    cast(game, toHand(game, "Burden of Proof"), { targets: [ref(theirInspector)] });
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirInspector)).toEqual({ power: 1, toughness: 1 });
  });

  it("stops the enchanted creature blocking Detectives, but not other attackers", () => {
    const { game, a } = table();
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Burden of Proof"), { targets: [ref(blocker)] });
    const inspector = spawn(game, "Novice Inspector");
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [inspector, bears]);
    const entry = offer.eligible.find((e) => e.blocker === blocker);
    expect(entry?.canBlock).toEqual([bears]);
  });
});

describe("rule zero spot checks", () => {
  it("Concealed Weapon's equip is {1}{R}, at sorcery speed", () => {
    const { game } = table();
    const weapon = spawn(game, "Concealed Weapon");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    activate(game, weapon, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
  });

  it("Rakish Scoundrel face down has no deathtouch and no name to the opponent", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const scoundrel = toHand(game, "Rakish Scoundrel");
    faceDown(game, scoundrel);
    expect(keywords(game, scoundrel).has("deathtouch")).toBe(false);
    expect(game.viewFor(B).objects[scoundrel]?.cardName).not.toBe("Rakish Scoundrel");
  });
});
