/**
 * Streets of New Capenna (and New Capenna Commander), group f. One test (or
 * two) per card, on its riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

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
  pickFromZone,
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

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

const castable = (game: Game, card: ObjectId, extra: Partial<Extract<Action, { type: "cast-spell" }>> = {}): boolean =>
  game.canDispatch({ type: "cast-spell", player: A, card, targets: [], ...extra }) === null;

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((a) => a.kind === "cast-spell" && a.card === card);

const withCounters = (game: Game, id: ObjectId, n: number): ObjectId => {
  game.state.objects[id].counters = { ...game.state.objects[id].counters, "+1/+1": n };
  return id;
};

describe("Park Heights Maverick", () => {
  it("dethrones, then proliferates when it deals combat damage to a player", () => {
    const { game, a } = table();
    const maverick = spawn(game, "Park Heights Maverick");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), 1);
    attack(game, a, [maverick]);
    // Dethrone (tied for most life): one counter; proliferate: one more each.
    expect(counters(game, maverick)).toBe(2);
    expect(counters(game, bears)).toBe(2);
  });

  it("proliferates when it dies", () => {
    const { game } = table();
    const maverick = spawn(game, "Park Heights Maverick");
    const bears = withCounters(game, spawn(game, "Grizzly Bears"), 1);
    destroy(game, maverick);
    expect(counters(game, bears)).toBe(2);
  });

  it("can't be blocked by creatures with power 2 or less", () => {
    const { game, a } = table();
    const maverick = spawn(game, "Park Heights Maverick");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const offer = blockOffer(game, a, [maverick]);
    expect(canBlock(offer, bears)).toEqual([]);
    expect(canBlock(offer, giant)).toEqual([maverick]);
  });
});

describe("Crash the Party", () => {
  it("creates a tapped 4/4 Rhino Warrior for each tapped creature you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Hill Giant", A, { tapped: true });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Crash the Party"));
    const rhinos = named(game, "Rhino Warrior Token", A);
    expect(tokensNamed(game, "Rhino Warrior Token", A)).toBe(2);
    expect(rhinos.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(pt(game, rhinos[0])).toEqual({ power: 4, toughness: 4 });
    expect(tokensNamed(game, "Rhino Warrior Token", B)).toBe(0);
  });
});

describe("Spellbinding Soprano", () => {
  it("instant and sorcery spells cost {1} less for the rest of the turn once it attacks", () => {
    const { game, a } = table();
    const soprano = spawn(game, "Spellbinding Soprano");
    lands(game, "Island", 2);
    const divination = toHand(game, "Divination");
    expect(castable(game, divination)).toBe(false);
    attack(game, a, [soprano]);
    cast(game, divination);
    expect(zone(game, divination)).toBe("graveyard");
  });
});

describe("Mr. Orfeo, the Boulder", () => {
  it("whenever you attack, doubles target creature's power until end of turn", () => {
    const { game, a } = table();
    spawn(game, "Mr. Orfeo, the Boulder");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const seen = watchTargets(a, () => [giant]);
    attack(game, a, [bears]);
    expect(seen.offered[0]).toContain(bears);
    expect(pt(game, giant)).toEqual({ power: 6, toughness: 3 });
    nextTurn(game);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Riveteers Requisitioner", () => {
  it("makes a Treasure when it dies", () => {
    const { game } = table();
    destroy(game, spawn(game, "Riveteers Requisitioner"));
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("blitzed, it is sacrificed at the end step for a Treasure and a card", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const requisitioner = toHand(game, "Riveteers Requisitioner");
    cast(game, requisitioner, { via: "blitz" });
    expect(keywords(game, requisitioner).has("haste")).toBe(true);
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(zone(game, requisitioner)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Girder Goons", () => {
  it("leaves a tapped 2/2 black Rogue when it dies", () => {
    const { game } = table();
    destroy(game, spawn(game, "Girder Goons"));
    const rogues = named(game, "Rogue Token", A);
    expect(rogues).toHaveLength(1);
    expect(game.state.objects[rogues[0]].tapped).toBe(true);
    expect(pt(game, rogues[0])).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Whack", () => {
  it("costs {3} less aimed at a white creature, and gives -4/-4", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const lions = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const whack = toHand(game, "Whack");
    expect(() => cast(game, whack, { targets: [ref(bears)] })).toThrow(/cannot pay/);
    cast(game, whack, { targets: [ref(lions)] });
    expect(zone(game, lions)).toBe("graveyard");
  });
});

describe("Out of the Way", () => {
  it("costs {2} less aimed at a green permanent; bounces it and draws", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const spell = toHand(game, "Out of the Way");
    expect(() => cast(game, spell, { targets: [ref(giant)] })).toThrow(/cannot pay/);
    const before = hand(game).length;
    cast(game, spell, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B)).toContain(bears);
    // The spell left the hand, a card came in.
    expect(hand(game).length).toBe(before);
  });
});

describe("Crew Captain", () => {
  it("has indestructible only the turn it entered", () => {
    const { game } = table();
    const captain = enter(game, "Crew Captain");
    expect(keywords(game, captain).has("indestructible")).toBe(true);
    nextTurn(game);
    expect(keywords(game, captain).has("indestructible")).toBe(false);
  });
});

describe("Expendable Lackey", () => {
  it("exiles itself from the graveyard for an unblockable 1/1 Fish", () => {
    const { game, a, b } = table();
    lands(game, "Island", 2);
    const lackey = toGraveyard(game, "Expendable Lackey");
    activate(game, lackey);
    expect(zone(game, lackey)).toBe("exile");
    const fish = named(game, "Fish Token (Expendable Lackey)", A);
    expect(fish).toHaveLength(1);
    expect(keywords(game, fish[0]).has("unblockable")).toBe(true);
    game.state.objects[fish[0]].summoningSick = false;
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: fish[0] }];
    attack(game, a, [fish[0]]);
    expect(life(game, B)).toBe(19);
  });
});

describe("Illuminator Virtuoso", () => {
  it("connives when a spell you control targets it", () => {
    const { game, a } = table();
    const virtuoso = spawn(game, "Illuminator Virtuoso");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(virtuoso)] });
    // The trigger resolves first: draw, discard (the Bears, a nonland card),
    // +1/+1 counter; then Giant Growth.
    expect(graveyard(game)).toContain(bears);
    expect(counters(game, virtuoso)).toBe(1);
    expect(pt(game, virtuoso)).toEqual({ power: 5, toughness: 5 });
  });

  it("doesn't connive for an opponent's spell", () => {
    const { game } = table();
    const virtuoso = spawn(game, "Illuminator Virtuoso");
    const handBefore = hand(game).length;
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" }, [
      ref(virtuoso),
    ]);
    settle(game);
    expect(hand(game).length).toBe(handBefore);
    expect(counters(game, virtuoso)).toBe(0);
  });
});

describe("Unleash the Inferno", () => {
  const inferno = (game: Game): void => {
    for (const land of ["Swamp", "Mountain", "Forest", "Mountain"]) spawn(game, land);
  };

  it("destroys an artifact with mana value up to the excess damage", () => {
    const { game, a } = table();
    inferno(game);
    const giant = spawn(game, "Hill Giant", B);
    const stone = spawn(game, "Mind Stone", B);
    const ring = spawn(game, "Sol Ring", B);
    const wurmcoil = spawn(game, "Wurmcoil Engine", B);
    const own = spawn(game, "Sol Ring");
    const seen = watchTargets(a, () => [stone]);
    cast(game, toHand(game, "Unleash the Inferno"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    // 7 to a 3/3: 4 excess. Wurmcoil (6) is too big; your Sol Ring is yours.
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([stone, ring].sort());
    expect(seen.offered[0]).not.toContain(wurmcoil);
    expect(seen.offered[0]).not.toContain(own);
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("no excess, no second ability", () => {
    const { game, a } = table();
    inferno(game);
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters = { "+1/+1": 4 };
    const stone = spawn(game, "Mind Stone", B);
    const relic = spawn(game, "Darksteel Relic", B);
    const seen = watchTargets(a, () => [relic]);
    cast(game, toHand(game, "Unleash the Inferno"), { targets: [ref(giant)] });
    // 7 to a 7/7: lethal, but nothing past it.
    expect(zone(game, giant)).toBe("graveyard");
    expect(seen.asked).toBe(0);
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Maestros Diabolist", () => {
  it("two attacking Diabolists make only one Devil (the intervening if)", () => {
    const { game, a } = table();
    const one = spawn(game, "Maestros Diabolist");
    const two = spawn(game, "Maestros Diabolist");
    attack(game, a, [one, two]);
    expect(tokensNamed(game, "Devil Token", A)).toBe(1);
    // 1 + 1 + the Devil's 1, all unblocked.
    expect(game.state.players[B].life).toBe(17);
  });
});

describe("Corpse Appraiser", () => {
  it("exiles a creature card from a graveyard, then takes one of the top three", () => {
    const { game, a } = table();
    const corpse = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    const bottom = toLibrary(game, "Island");
    const middle = toLibrary(game, "Forest");
    const top = toLibrary(game, "Lightning Bolt");
    pickTargets(a, corpse);
    pickFromZone(a, middle);
    enter(game, "Corpse Appraiser");
    expect(zone(game, corpse)).toBe("exile");
    expect(hand(game)).toContain(middle);
    expect(graveyard(game)).toEqual(expect.arrayContaining([top, bottom]));
  });

  it("with no card exiled, looks at nothing", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears", B);
    const top = toLibrary(game, "Lightning Bolt");
    pickTargets(a, null);
    enter(game, "Corpse Appraiser");
    expect(zone(game, top)).toBe("library");
  });
});

describe("Soul of Emancipation", () => {
  it("destroys up to three; each one's controller gets an Angel, indestructible or not", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const relic = spawn(game, "Darksteel Relic", B);
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, bears, relic, mine);
    enter(game, "Soul of Emancipation");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, relic)).toBe("battlefield");
    expect(zone(game, mine)).toBe("graveyard");
    expect(tokensNamed(game, "3/3 White Angel Token", B)).toBe(2);
    expect(tokensNamed(game, "3/3 White Angel Token", A)).toBe(1);
  });

  it("a target gone illegal makes no Angel", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears, giant);
    enter(game, "Soul of Emancipation", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(giant)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("hand");
    expect(tokensNamed(game, "3/3 White Angel Token", B)).toBe(1);
  });
});

describe("Meeting of the Five", () => {
  it("exiles ten; only exactly-three-colour spells may be cast from them, with its mana", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest", "Plains", "Plains", "Plains"]) spawn(game, land);
    for (let i = 0; i < 7; i += 1) toLibrary(game, "Wastes");
    const orfeo = toLibrary(game, "Mr. Orfeo, the Boulder");
    const watchwolf = toLibrary(game, "Watchwolf");
    const exiledBears = toLibrary(game, "Grizzly Bears");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, toHand(game, "Meeting of the Five"));
    expect(zone(game, orfeo)).toBe("exile");
    expect(zone(game, watchwolf)).toBe("exile");
    expect(zone(game, exiledBears)).toBe("exile");
    // Every land is tapped; the ten restricted mana won't pay for a mono-green spell.
    expect(castable(game, bears)).toBe(false);
    expect(castOffers(game, watchwolf)).toHaveLength(0);
    expect(castOffers(game, exiledBears)).toHaveLength(0);
    expect(castOffers(game, orfeo).length).toBeGreaterThan(0);
    cast(game, orfeo, { via: "impulse" });
    expect(zone(game, orfeo)).toBe("battlefield");
  });
});
