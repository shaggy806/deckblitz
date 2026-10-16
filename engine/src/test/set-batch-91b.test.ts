/**
 * Set walk batch 91, part b (2026-10-16): Murders at Karlov Manor (MKM) and Murders at Karlov Manor Commander (MKC), the rest of the sets.
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
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
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
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
const tap = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(id)]);
  settle(game);
};
const poison = (game: Game, player: PlayerId): number => game.state.players[player].counters?.poison ?? 0;
/** Sacrifice one of `player`'s Clues for its own "{2}, Sacrifice: draw". */
const crackClue = (game: Game, player: PlayerId = A): void => {
  const [clue] = named(game, "Clue Token", player);
  lands(game, "Wastes", 2, player);
  activate(game, clue, 0, { player });
};
/** `player` sacrifices an artifact, made at the priority check a resolution
 * ends in (which a bare settle would skip with nothing else pending). */
const sacrificeArtifact = (game: Game, player: PlayerId): void => {
  game.debugApplyEffect(player, { kind: "sacrifice", who: "you", filter: { type: "artifact" }, count: 1 });
  (game as unknown as { prepareForPriority(p: PlayerId): void }).prepareForPriority(A);
  settle(game);
};
/** Turn a face-down permanent face up for its disguise cost. */
const disguiseUp = (game: Game, id: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent: id, morph: true });
  settle(game);
};

describe("Gearbane Orangutan", () => {
  it("destroys up to one target artifact", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 0);
    pickTargets(a, ring);
    const ape = enter(game, "Gearbane Orangutan");
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, ape)).toBe(0);
  });

  it("sacrifices an artifact for two +1/+1 counters, and gets none with nothing to sacrifice", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickModes(a, 1);
    const ape = enter(game, "Gearbane Orangutan");
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, ape)).toBe(2);
    const second = enter(game, "Gearbane Orangutan");
    expect(counters(game, second)).toBe(0);
  });
});

describe("Hard-Hitting Question", () => {
  it("has your creature deal damage equal to its power, one way only", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Hard-Hitting Question"), { targets: [ref(giant), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});

describe("Audience with Trostani", () => {
  it("makes a Plant, then draws one card per differently named creature token you control", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    makeToken(game, "Plant Token");
    makeToken(game, "Detective Token");
    makeToken(game, "Clue Token");
    makeToken(game, "Detective Token", B);
    const card = toHand(game, "Audience with Trostani");
    const before = hand(game).length;
    cast(game, card);
    expect(tokensNamed(game, "Plant Token", A)).toBe(2);
    // Plant and Detective: two names (the Clue isn't a creature, bob's isn't yours).
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Get a Leg Up", () => {
  it("gives +1/+1 for each creature you control, counted as it resolves, and reach", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Get a Leg Up"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("reach")).toBe(true);
  });
});

describe("Soul Enervation", () => {
  it("gives -4/-4 as it enters, and drains once when several creature cards leave your graveyard together", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Soul Enervation"));
    expect(zone(game, giant)).toBe("graveyard");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("doesn't drain for a noncreature card leaving", () => {
    const { game } = table();
    spawn(game, "Soul Enervation");
    toGraveyard(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("Essence of Antiquity", () => {
  it("turned face up, gives your creatures hexproof and untaps them", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    const essence = toHand(game, "Essence of Antiquity");
    cast(game, essence, { via: "face-down" });
    expect(game.state.objects[essence].faceDown?.kind).toBe("disguise");
    tap(game, essence);
    disguiseUp(game, essence);
    expect(pt(game, essence)).toEqual({ power: 1, toughness: 10 });
    expect(isTapped(game, bears)).toBe(false);
    expect(isTapped(game, essence)).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(isTapped(game, theirs)).toBe(true);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
  });
});

describe("Call a Surprise Witness", () => {
  it("returns a small creature card with a flying counter, a Spirit as well", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    cast(game, toHand(game, "Call a Surprise Witness"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "flying")).toBe(1);
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Spirit"]));
  });

  it("can't target a creature card with mana value 4 or more", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const big = toGraveyard(game, "Hill Giant");
    const small = toGraveyard(game, "Grizzly Bears");
    const card = toHand(game, "Call a Surprise Witness");
    const castAt = (id: ObjectId) => game.canDispatch({ type: "cast-spell", player: A, card, targets: [ref(id)] });
    expect(castAt(small)).toBeNull();
    expect(castAt(big)).not.toBeNull();
  });
});

describe("Cryptic Coat", () => {
  it("cloaks the top card and attaches to it: +1/+0, unblockable, ward {2}; {1}{U} returns it", () => {
    const { game } = table();
    const giant = toLibrary(game, "Hill Giant");
    const coat = enter(game, "Cryptic Coat");
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].faceDown?.kind).toBe("cloak");
    expect(game.state.objects[coat].attachedTo).toBe(giant);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, giant).has("unblockable")).toBe(true);
    lands(game, "Island", 2);
    activate(game, coat, 0);
    expect(zone(game, coat)).toBe("hand");
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Expedited Inheritance", () => {
  it("lets the damaged creature's controller exile that many and play them until the end of their next turn", () => {
    const { game, b } = table();
    spawn(game, "Expedited Inheritance");
    const giant = spawn(game, "Hill Giant", B);
    const top = [toLibrary(game, "Grizzly Bears", B), toLibrary(game, "Lightning Bolt", B)];
    const mine = toLibrary(game, "Hill Giant", A);
    pickModes(b, 0);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    for (const id of top) {
      expect(zone(game, id)).toBe("exile");
      expect(game.state.objects[id].impulse?.player).toBe(B);
    }
    expect(zone(game, mine)).toBe("library");
    // Through bob's next turn, gone after it.
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(game.state.objects[top[0]].impulse).toBeDefined();
    nextTurn(game);
    expect(game.state.objects[top[0]].impulse).toBeUndefined();
  });

  it("does nothing when they decline", () => {
    const { game, b } = table();
    spawn(game, "Expedited Inheritance");
    const giant = spawn(game, "Hill Giant", B);
    const top = toLibrary(game, "Grizzly Bears", B);
    pickModes(b);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    expect(zone(game, top)).toBe("library");
  });
});

describe("Flourishing Bloom-Kin", () => {
  it("gets +1/+1 for each Forest; face up, fetches two Forest cards — one onto the battlefield tapped, one to hand", () => {
    const { game, a } = table();
    lands(game, "Wastes", 3);
    const first = toLibrary(game, "Forest");
    const second = toLibrary(game, "Forest");
    const kin = toHand(game, "Flourishing Bloom-Kin");
    cast(game, kin, { via: "face-down" });
    lands(game, "Forest", 2);
    lands(game, "Wastes", 4);
    expect(pt(game, kin)).toEqual({ power: 2, toughness: 2 });
    const seen = pickFromZone(a, first, second);
    disguiseUp(game, kin);
    expect(seen.offered).toEqual(expect.arrayContaining([first, second]));
    expect(zone(game, first)).toBe("battlefield");
    expect(isTapped(game, first)).toBe(true);
    expect(zone(game, second)).toBe("hand");
    expect(pt(game, kin)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Pyrotechnic Performer", () => {
  it("a creature you control turned face up deals damage equal to its power to each opponent", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Pyrotechnic Performer");
    lands(game, "Swamp", 5);
    const brute = toHand(game, "Hunted Bonebrute");
    cast(game, brute, { via: "face-down" });
    disguiseUp(game, brute);
    expect(life(game, B)).toBe(14);
    expect(life(game, "carol" as PlayerId)).toBe(14);
    expect(life(game, A)).toBe(20);
  });

  it("triggers for itself turned face up", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const performer = toHand(game, "Pyrotechnic Performer");
    cast(game, performer, { via: "face-down" });
    disguiseUp(game, performer);
    expect(life(game, B)).toBe(17);
  });
});

describe("Agrus Kos, Spirit of Justice", () => {
  it("suspects a creature that isn't, and exiles one that is", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const agrus = enter(game, "Agrus Kos, Spirit of Justice");
    expect(game.state.objects[bears].suspectedAt).toBeDefined();
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    pickTargets(a, bears);
    attack(game, a, [agrus]);
    expect(zone(game, bears)).toBe("exile");
  });

  it("may choose no target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Agrus Kos, Spirit of Justice");
    expect(game.state.objects[bears].suspectedAt).toBeUndefined();
  });
});

describe("Curious Inquiry", () => {
  it("gives +1/+1 and investigates on combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Curious Inquiry"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Candlestick", () => {
  it("equipped creature gets +1/+1 and surveils 2 as it attacks; sacrificed, it draws", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears");
    const stick = spawn(game, "Candlestick");
    activate(game, stick, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    const top = [toLibrary(game, "Hill Giant"), toLibrary(game, "Lightning Bolt")];
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    attack(game, a, [bears]);
    expect(surveilled).toEqual(expect.arrayContaining(top));
    expect(top.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    activate(game, stick, 0);
    expect(zone(game, stick)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Persuasive Interrogators", () => {
  it("investigates, and each Clue you sacrifice gives the opponent two poison counters", () => {
    const { game } = table();
    enter(game, "Persuasive Interrogators");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    crackClue(game);
    expect(poison(game, B)).toBe(2);
    expect(poison(game, A)).toBe(0);
  });

  it("counts a Clue that isn't a token (Candlestick)", () => {
    const { game } = table();
    spawn(game, "Persuasive Interrogators");
    const stick = spawn(game, "Candlestick");
    lands(game, "Wastes", 2);
    activate(game, stick, 0);
    expect(poison(game, B)).toBe(2);
  });
});

describe("Nervous Gardener", () => {
  it("turned face up, finds a land card with a basic land type", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const forest = toLibrary(game, "Forest");
    const wastes = game.state.zones.perPlayer[A].library[5];
    const gardener = toHand(game, "Nervous Gardener");
    cast(game, gardener, { via: "face-down" });
    const seen = pickFromZone(a, forest);
    disguiseUp(game, gardener);
    expect(seen.offered).toContain(forest);
    expect(seen.offered).not.toContain(wastes);
    expect(zone(game, forest)).toBe("hand");
    expect(pt(game, gardener)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Alquist Proft, Master Sleuth", () => {
  it("investigates as it enters, and sacrifices a Clue to draw X and gain X", () => {
    const { game } = table();
    const proft = enter(game, "Alquist Proft, Master Sleuth");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    lands(game, "Plains", 1);
    lands(game, "Island", 2);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    const [clue] = named(game, "Clue Token", A);
    game.dispatch({ type: "activate-ability", player: A, source: proft, abilityIndex: 0, targets: [], xValue: 2, sacrifice: clue });
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(22);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });
});

describe("Felonious Rage", () => {
  it("gives +2/+0 and haste, and a Detective when that creature dies this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    cast(game, toHand(game, "Felonious Rage"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    destroy(game, bears);
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
    const [detective] = named(game, "Detective Token", A);
    expect(pt(game, detective)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Chalk Outline", () => {
  it("makes one Detective and one Clue when creature cards leave your graveyard together", () => {
    const { game } = table();
    spawn(game, "Chalk Outline");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Illicit Masquerade", () => {
  it("marks your creatures; one that dies is exiled and brings back another creature card", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    enter(game, "Illicit Masquerade");
    expect(counters(game, bears, "impostor")).toBe(1);
    expect(counters(game, theirs, "impostor")).toBe(0);
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [giant]);
    destroy(game, bears);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("doesn't trigger for a creature without an impostor counter", () => {
    const { game } = table();
    spawn(game, "Illicit Masquerade");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Presumed Dead", () => {
  it("+2/+0, and when it dies it comes back suspected", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Presumed Dead"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(B);
    expect(game.state.objects[bears].suspectedAt).toBeDefined();
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Out Cold", () => {
  it("taps up to two creatures with a stun counter each, then investigates", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Out Cold"), { targets: [ref(one), ref(two)] });
    for (const id of [one, two]) {
      expect(isTapped(game, id)).toBe(true);
      expect(counters(game, id, "stun")).toBe(1);
    }
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("investigates with no targets, but not when every target it chose is gone", () => {
    const { game } = table();
    lands(game, "Island", 8);
    cast(game, toHand(game, "Out Cold"), { targets: [null, null] });
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Out Cold"), { targets: [ref(bears), null], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });
});

describe("Vengeful Tracker", () => {
  it("deals 2 damage to an opponent who sacrifices an artifact, not to you for yours", () => {
    const { game } = table();
    spawn(game, "Vengeful Tracker");
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", A);
    sacrificeArtifact(game, B);
    expect(life(game, B)).toBe(18);
    sacrificeArtifact(game, A);
    expect(life(game, A)).toBe(20);
  });
});

describe("Detective's Satchel", () => {
  it("investigates twice; makes a Thopter only once you've sacrificed an artifact this turn", () => {
    const { game } = table();
    const satchel = enter(game, "Detective's Satchel");
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(() => activate(game, satchel, 0)).toThrow();
    crackClue(game);
    activate(game, satchel, 0);
    expect(tokensNamed(game, "Thopter Token", A)).toBe(1);
  });
});
