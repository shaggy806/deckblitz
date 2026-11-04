/**
 * A card exiled face down from a hand (rule 406.3), and what it's linked to
 * (607.2a) or what it becomes: `look-and-choose`'s `exile-face-down` from
 * `zone: "hand"` with its `faceDownLooks`; `become-foretold` (rule 702.143d),
 * from a hand or the battlefield, with a cost it's given beside any printed;
 * and `look-at-face-down`, a look they close at face-down permanents (708.5).
 */

import { describe, expect, it } from "vitest";

import type { CastVia } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf, publicNameAt } from "../state.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** Whether `viewer` is shown what's in exile as `card`. */
const sees = (game: Game, viewer: PlayerId, card: ObjectId): boolean => game.viewFor(viewer).objects[card] !== undefined;

const castOffers = (game: Game, card: ObjectId, via: CastVia, player: PlayerId = A) =>
  game.legalActions(player).filter((a) => a.kind === "cast-spell" && a.card === card && a.via === via);

/** What `viewer` is shown of a face-down permanent's identity. */
const shownCard = (game: Game, viewer: PlayerId, card: ObjectId): string | undefined =>
  game.viewFor(viewer).objects[card]?.faceDown?.card;

const faceDown = (game: Game, id: ObjectId, player: PlayerId = B): void => {
  game.debugApplyEffect(player, { kind: "turn-face-down", target: 0 }, [ref(id)]);
};

describe("Gustha's Scepter: exiled from a hand, the chooser's own look", () => {
  it("{T}: the card leaves the hand face down, the chooser alone may look", () => {
    const { game, a } = table();
    const scepter = spawn(game, "Gustha's Scepter");
    const card = toHand(game, "Grizzly Bears");
    const kept = toHand(game, "Lightning Bolt");
    const seen = pickFromZone(a, card);
    activate(game, scepter, 0);
    expect(seen.offered).toEqual(expect.arrayContaining([card, kept]));
    expect(zone(game, card)).toBe("exile");
    expect(zone(game, kept)).toBe("hand");
    expect(sees(game, A, card)).toBe(true);
    expect(sees(game, B, card)).toBe(false);
    expect(game.state.objects[card].exiledWith?.source).toBe(scepter);
    // The log never names it, either, to anyone reading it later.
    expect(publicNameAt(game.state.publicStints ?? {}, card, game.state.eventSeq)).toBeUndefined();
  });

  it("{T}: a card you own comes back to your hand, and no one else's", () => {
    const { game, a } = table();
    const scepter = spawn(game, "Gustha's Scepter");
    const mine = toHand(game, "Grizzly Bears");
    pickFromZone(a, mine);
    activate(game, scepter, 0);
    // Someone else's, exiled with it while they had it (their trigger's on
    // the stack, here left out of the picture by linking it by hand).
    const theirs = spawn(game, "Elvish Mystic", B);
    game.debugApplyEffect(A, { kind: "exile", target: 0, linked: true }, [ref(theirs)], { source: scepter });
    expect(game.state.objects[theirs].exiledWith?.source).toBe(scepter);
    nextTurn(game);
    nextTurn(game);
    const seen = pickFromZone(a, mine);
    activate(game, scepter, 1);
    expect(seen.offered).toEqual([mine]);
    expect(hand(game)).toContain(mine);
    expect(zone(game, theirs)).toBe("exile");
    expect(game.state.objects[mine].exiledFaceDown).toBeUndefined();
  });

  it("a new controller gets no look, and the trigger has every card into its owner's graveyard", () => {
    const { game, a } = table();
    const scepter = spawn(game, "Gustha's Scepter");
    const card = toHand(game, "Grizzly Bears");
    pickFromZone(a, card);
    activate(game, scepter, 0);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(scepter)]);
    expect(game.state.objects[card].exiledFaceDown?.lookers).toEqual([A]);
    settle(game);
    expect(graveyard(game, A)).toContain(card);
  });

  it("the trigger reaches them too when it leaves the battlefield", () => {
    const { game, a } = table();
    const scepter = spawn(game, "Gustha's Scepter");
    const card = toHand(game, "Grizzly Bears");
    pickFromZone(a, card);
    activate(game, scepter, 0);
    destroy(game, scepter);
    settle(game);
    expect(graveyard(game, A)).toContain(card);
  });
});

describe("Bane Alley Broker: looks that go with the permanent", () => {
  it("draws, then exiles — the card just drawn may go, with no time to use it", () => {
    const { game, a } = table();
    const broker = spawn(game, "Bane Alley Broker");
    const top = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, top);
    activate(game, broker, 0);
    expect(seen.offered).toContain(top);
    expect(zone(game, top)).toBe("exile");
    expect(sees(game, A, top)).toBe(true);
    expect(sees(game, B, top)).toBe(false);
  });

  it("whoever comes to control it may look too, and returns a card to its owner's hand", () => {
    const { game, a, b } = table();
    const broker = spawn(game, "Bane Alley Broker");
    const card = toHand(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, card);
    activate(game, broker, 0);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(broker)]);
    settle(game);
    expect(sees(game, B, card)).toBe(true);
    expect(sees(game, A, card)).toBe(true);
    game.state.objects[broker].tapped = false;
    game.state.objects[broker].summoningSick = false;
    lands(game, "Underground Sea", 2, B);
    nextTurn(game);
    while (activePlayerOf(game.state) !== B) nextTurn(game);
    pickFromZone(b, card);
    activate(game, broker, 1, { player: B });
    expect(hand(game, A)).toContain(card);
  });

  it("gone, its cards stay exiled for good, and a later one has no link to them", () => {
    const { game, a } = table();
    const broker = spawn(game, "Bane Alley Broker");
    const card = toHand(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, card);
    activate(game, broker, 0);
    destroy(game, broker);
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(sees(game, A, card)).toBe(true);
    const later = spawn(game, "Bane Alley Broker");
    lands(game, "Underground Sea", 2);
    activate(game, later, 1);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Summoner's Egg: nobody looks, then it's turned face up", () => {
  it("you may decline; imprinted, not even you may look; dying, a creature card comes in under you", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears");
    pickFromZone(a);
    const declined = enter(game, "Summoner's Egg");
    expect(zone(game, card)).toBe("hand");
    destroy(game, declined);
    settle(game);

    pickFromZone(a, card);
    const egg = enter(game, "Summoner's Egg");
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].exiledFaceDown?.lookers).toEqual([]);
    expect(sees(game, A, card)).toBe(false);
    expect(sees(game, B, card)).toBe(false);
    destroy(game, egg);
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].controller).toBe(A);
  });

  it("not a creature card: it stays exiled, face up for everyone", () => {
    const { game, a } = table();
    const card = toHand(game, "Lightning Bolt");
    pickFromZone(a, card);
    const egg = enter(game, "Summoner's Egg");
    destroy(game, egg);
    settle(game);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].exiledFaceDown).toBeUndefined();
    expect(sees(game, B, card)).toBe(true);
  });

  it("under another's control, it's they who get the creature", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears");
    pickFromZone(a, card);
    const egg = enter(game, "Summoner's Egg");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(egg)]);
    settle(game);
    destroy(game, egg, A);
    settle(game);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].controller).toBe(B);
    expect(game.state.objects[card].owner).toBe(A);
  });
});

describe("become-foretold (rule 702.143d)", () => {
  it("The Foretold Soldier: dealing damage it's exiled foretold, its owner's to cast after this turn", () => {
    const { game, a } = table();
    const soldier = spawn(game, "The Foretold Soldier");
    attack(game, a, [soldier]);
    settle(game);
    expect(life(game, B)).toBe(14);
    expect(zone(game, soldier)).toBe("exile");
    expect(game.state.objects[soldier].foretold).toBe(true);
    expect(sees(game, A, soldier)).toBe(true);
    expect(sees(game, B, soldier)).toBe(false);
    expect(publicNameAt(game.state.publicStints ?? {}, soldier, game.state.eventSeq)).toBeUndefined();
    lands(game, "Forest", 2);
    expect(castOffers(game, soldier, "foretell")).toEqual([]); // the turn it became foretold
    nextTurn(game);
    nextTurn(game);
    expect(castOffers(game, soldier, "foretell").length).toBeGreaterThan(0);
    cast(game, soldier, { via: "foretell" });
    expect(zone(game, soldier)).toBe("battlefield");
    expect(game.state.objects[soldier].foretold).toBe(false);
  });

  it("only its owner may cast it, whoever controlled it", () => {
    const { game, b } = table();
    const soldier = spawn(game, "The Foretold Soldier");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(soldier)]);
    settle(game);
    game.state.objects[soldier].summoningSick = false;
    while (activePlayerOf(game.state) !== B) nextTurn(game);
    attack(game, b, [soldier], A);
    settle(game);
    expect(zone(game, soldier)).toBe("exile");
    expect(sees(game, A, soldier)).toBe(true);
    expect(sees(game, B, soldier)).toBe(false);
    lands(game, "Forest", 2, B);
    lands(game, "Forest", 2, A);
    nextTurn(game);
    while (activePlayerOf(game.state) !== B) nextTurn(game);
    expect(castOffers(game, soldier, "foretell", B)).toEqual([]);
    while (activePlayerOf(game.state) !== A) nextTurn(game);
    expect(castOffers(game, soldier, "foretell", A).length).toBeGreaterThan(0);
  });

  it("not foretelling it: nothing that watches for a foretold card fires", () => {
    const { game, a } = table();
    const soldier = spawn(game, "The Foretold Soldier");
    attack(game, a, [soldier]);
    settle(game);
    expect(game.state.objects[soldier].foretold).toBe(true);
    expect(game.eventsOfType("card-foretold")).toEqual([]);
  });

  it("gone already when the trigger resolves, there's nothing to foretell", () => {
    const { game } = table();
    const soldier = spawn(game, "The Foretold Soldier");
    game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(soldier)]);
    game.debugApplyEffect(A, { kind: "sequence", effects: [{ kind: "exile", target: "source" }, { kind: "become-foretold", target: "exiled-this-way" }] }, [], { source: soldier });
    expect(zone(game, soldier)).toBe("exile");
    expect(game.state.objects[soldier].foretold).not.toBe(true);
  });

  it("Ethereal Valkyrie: draw, exile from the hand, its mana cost less {2}, even with her gone", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickFromZone(a, card);
    const valkyrie = enter(game, "Ethereal Valkyrie");
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].foretold).toBe(true);
    expect(game.state.objects[card].exiledFaceDown).toBeUndefined();
    expect(sees(game, A, card)).toBe(true);
    expect(sees(game, B, card)).toBe(false);
    lands(game, "Forest", 1);
    expect(castOffers(game, card, "foretell")).toEqual([]);
    destroy(game, valkyrie);
    settle(game);
    nextTurn(game);
    nextTurn(game);
    // {1}{G} less {2}: only generic comes off, so {G}.
    cast(game, card, { via: "foretell" });
    expect(zone(game, card)).toBe("battlefield");
  });

  it("attacking, she does it again", () => {
    const { game, a } = table();
    const valkyrie = spawn(game, "Ethereal Valkyrie");
    const card = toHand(game, "Lightning Bolt");
    toLibrary(game, "Wastes");
    pickFromZone(a, card);
    attack(game, a, [valkyrie]);
    expect(zone(game, card)).toBe("exile");
    expect(game.state.objects[card].foretold).toBe(true);
  });

  it("a card with a printed foretell cost has two: either may be paid", () => {
    const { game, a } = table();
    const card = toHand(game, "Poison the Cup");
    const victim = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Wastes");
    pickFromZone(a, card);
    enter(game, "Ethereal Valkyrie");
    nextTurn(game);
    nextTurn(game);
    // Foretell {1}{B} printed; {1}{B}{B} less {2} given, {B}{B}.
    const wastes = lands(game, "Wastes", 1);
    const swamps = lands(game, "Swamp", 1);
    expect(castOffers(game, card, "foretell").length).toBeGreaterThan(0);
    expect(castOffers(game, card, "foretell-given")).toEqual([]);
    swamps.push(...lands(game, "Swamp", 1));
    const given = castOffers(game, card, "foretell-given");
    expect(castOffers(game, card, "foretell").length).toBeGreaterThan(0);
    expect(given.length).toBeGreaterThan(0);
    expect(given[0].kind === "cast-spell" ? given[0].altCostText : null).toBe("foretell, for the {B}{B} it was given");
    const before = game.eventsOfType("scried").length;
    cast(game, card, { via: "foretell-given", targets: [ref(victim)] });
    expect(zone(game, victim)).toBe("graveyard");
    expect(game.state.objects[swamps[0]].tapped).toBe(true);
    expect(game.state.objects[swamps[1]].tapped).toBe(true);
    expect(game.state.objects[wastes[0]].tapped).toBe(false);
    // "If this spell was foretold": it was, whichever cost paid.
    expect(game.eventsOfType("scried").length).toBeGreaterThan(before);
  });

  it("the two costs being the same, it's offered once", () => {
    const { game, a } = table();
    // {3}{W}{W} less {2}, and Foretell {1}{W}{W}.
    const card = toHand(game, "Doomskar");
    toLibrary(game, "Wastes");
    pickFromZone(a, card);
    enter(game, "Ethereal Valkyrie");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Plains", 3);
    expect(castOffers(game, card, "foretell").length).toBeGreaterThan(0);
    expect(castOffers(game, card, "foretell-given")).toEqual([]);
  });

  it("a modal card: either nonland face for that face's cost, never played as a land", () => {
    const { game, a } = table();
    const kolvori = toHand(game, "Kolvori, God of Kinship");
    toLibrary(game, "Wastes");
    pickFromZone(a, kolvori);
    enter(game, "Ethereal Valkyrie");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 1);
    // The Ringhart Crest is {1}{G}, so {G}; Kolvori, {2}{G}{G}, is {G}{G}.
    expect(castOffers(game, kolvori, "foretell").map((o) => (o.kind === "cast-spell" ? o.face : null))).toEqual([1]);
    lands(game, "Forest", 1);
    expect(castOffers(game, kolvori, "foretell").map((o) => (o.kind === "cast-spell" ? o.face : null))).toEqual([0, 1]);
  });

  it("a land card can't be cast, and stays where it is", () => {
    const { game, a } = table();
    const land = toHand(game, "Forest");
    toLibrary(game, "Wastes");
    pickFromZone(a, land);
    enter(game, "Ethereal Valkyrie");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 3);
    expect(game.legalActions(A).some((o) => (o.kind === "cast-spell" || o.kind === "play-land") && o.card === land)).toBe(false);
    expect(zone(game, land)).toBe("exile");
  });

  it("no mana cost, no foretell cost", () => {
    const { game, a } = table();
    const vision = toHand(game, "Ancestral Vision");
    toLibrary(game, "Wastes");
    pickFromZone(a, vision);
    enter(game, "Ethereal Valkyrie");
    nextTurn(game);
    nextTurn(game);
    lands(game, "Island", 3);
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === vision)).toBe(false);
    expect(zone(game, vision)).toBe("exile");
  });

  it("Dream Devourer's grant reads the same way: its reduction, on the face cast", () => {
    const { game } = table();
    spawn(game, "Dream Devourer");
    const kolvori = toHand(game, "Kolvori, God of Kinship");
    lands(game, "Wastes", 2);
    game.dispatch({ type: "foretell", player: A, card: kolvori });
    settle(game);
    expect(game.state.objects[kolvori].foretoldReducedBy).toBe(2);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Forest", 2);
    expect(castOffers(game, kolvori, "foretell").map((o) => (o.kind === "cast-spell" ? o.face : null))).toEqual([0, 1]);
  });
});

describe("look-at-face-down (rule 708.5)", () => {
  it("Smoke Teller: shown it for as long as the look lasts, to them alone, and not later", () => {
    const { game, a } = table({ players: 3 });
    const teller = spawn(game, "Smoke Teller");
    const bears = spawn(game, "Grizzly Bears", B);
    faceDown(game, bears);
    lands(game, "Island", 2);
    expect(shownCard(game, A, bears)).toBeUndefined();
    let during: readonly (string | undefined)[] = [];
    a.chooseFromZoneFn = () => {
      during = [shownCard(game, A, bears), shownCard(game, B, bears), shownCard(game, C, bears)];
      return [];
    };
    activate(game, teller, 0, { targets: [ref(bears)] });
    expect(during).toEqual(["Grizzly Bears", "Grizzly Bears", undefined]);
    expect(shownCard(game, A, bears)).toBeUndefined();
    expect(game.state.objects[bears].faceDown).toBeDefined();
  });

  it("targeting your own asks nothing: you may look at those any time", () => {
    const { game, a } = table();
    const teller = spawn(game, "Smoke Teller");
    const bears = spawn(game, "Grizzly Bears");
    faceDown(game, bears, A);
    lands(game, "Island", 2);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    activate(game, teller, 0, { targets: [ref(bears)] });
    expect(asked).toBe(false);
  });

  it("Revealing Wind: each one attacking or blocking and no other, with the damage prevented", () => {
    const { game, a, b } = table();
    const attacking = spawn(game, "Grizzly Bears", B);
    const home = spawn(game, "Elvish Mystic", B);
    faceDown(game, attacking);
    faceDown(game, home);
    while (activePlayerOf(game.state) !== B) nextTurn(game);
    const wind = toHand(game, "Revealing Wind");
    lands(game, "Forest", 3);
    b.declareAttackersFn = () => [{ attacker: attacking, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    let shown: { ids: readonly ObjectId[]; attacking?: string; home?: string } = { ids: [] };
    a.chooseFromZoneFn = () => {
      shown = {
        ids: game.state.awaiting?.kind === "choose-from-zone" ? game.state.awaiting.ids : [],
        attacking: shownCard(game, A, attacking),
        home: shownCard(game, A, home),
      };
      return [];
    };
    cast(game, wind, { player: A });
    settle(game);
    expect(shown).toEqual({ ids: [attacking], attacking: "Grizzly Bears", home: undefined });
    expect(life(game, A)).toBe(20);
  });

  it("Revealing Wind with nothing to look at: the damage is still prevented", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    while (activePlayerOf(game.state) !== B) nextTurn(game);
    const wind = toHand(game, "Revealing Wind");
    lands(game, "Forest", 3);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    cast(game, wind, { player: A });
    settle(game);
    expect(life(game, A)).toBe(20);
  });

  it("Spy Network: a hand, a library's top, that player's face-down creatures alone, then your own four", () => {
    const { game, a } = table({ players: 3 });
    const net = toHand(game, "Spy Network");
    lands(game, "Island", 1);
    const held = toHand(game, "Lightning Bolt", B);
    const top = toLibrary(game, "Elvish Mystic", B);
    const theirs = spawn(game, "Grizzly Bears", B);
    const others = spawn(game, "Grizzly Bears", C);
    faceDown(game, theirs);
    faceDown(game, others, C);
    const asked: (readonly ObjectId[])[] = [];
    const facing: (string | undefined)[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(game.state.awaiting?.kind === "choose-from-zone" ? game.state.awaiting.ids : []);
      facing.push(shownCard(game, A, theirs));
      return eligible;
    };
    cast(game, net, { targets: [ref(B)] });
    settle(game);
    expect(asked).toHaveLength(4);
    expect(asked[0]).toContain(held);
    expect(asked[1]).toEqual([top]);
    expect(asked[2]).toEqual([theirs]);
    expect(asked[3]).toHaveLength(4);
    expect(facing).toEqual([undefined, undefined, "Grizzly Bears", undefined]);
    expect(shownCard(game, A, others)).toBeUndefined();
  });
});
