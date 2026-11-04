/**
 * What an opponent's permanent does to a library search. Opposition Agent:
 * "You control your opponents while they're searching their libraries" (rule
 * 723.2) and they exile what they find, for you to play. Aven Mindcensor: the
 * top four cards alone. And Yavimaya Dryad's find under another player's control.
 */
import { describe, expect, it } from "vitest";
import { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import { answeringPlayer, controlOf } from "../player-control.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  controller,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

/** `seat` answers `player`'s search with `pick`, recording who was asked. */
const answerSearchAs = (
  game: Game,
  seat: ScriptedController,
  player: PlayerId,
  pick: (eligible: readonly ObjectId[]) => readonly ObjectId[],
): { offered: readonly ObjectId[]; answering: PlayerId | null; min: number } => {
  const seen = { offered: [] as readonly ObjectId[], answering: null as PlayerId | null, min: -1 };
  seat.standInFn = (p) => {
    if (p !== player) return undefined;
    const stand = new ScriptedController(p);
    stand.chooseFromZoneFn = (_view, eligible, min) => {
      seen.offered = eligible;
      seen.min = min;
      seen.answering = answeringPlayer(game.state, p);
      return pick(eligible);
    };
    return stand;
  };
  return seen;
};

/** Bob's turn, his priority, a library of `Wastes` and these on top of it. */
const bobsTurn = (game: Game, ...onTop: readonly string[]): ObjectId[] => {
  nextTurn(game);
  return onTop.map((name) => toLibrary(game, name, B));
};

describe("Opposition Agent: you control your opponents while they're searching their libraries", () => {
  it("answers their search, sees what they'd see, and is over once it's answered", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    const seen = answerSearchAs(game, a, B, (eligible) => eligible.filter((id) => id === forest));
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(seen.answering).toBe(A);
    expect(seen.offered).toContain(forest);
    expect(game.state.playerControl).toBeUndefined();
    expect(controlOf(game.state, B)).toBeUndefined();
  });

  it("must find a card when the search states no quality (rule 701.23d, the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [card] = bobsTurn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    const seen = answerSearchAs(game, a, B, () => [card]);
    cast(game, toHand(game, "Demonic Tutor", B), { player: B });
    expect(seen.min).toBe(1);
    expect(zone(game, card)).toBe("exile");
  });

  it("leaves a search of your own library, or of another's library, alone", () => {
    const { game, a, b } = table();
    spawn(game, "Opposition Agent");
    const mine = toLibrary(game, "Forest");
    lands(game, "Forest", 2);
    const own = pickFromZone(a, mine);
    cast(game, toHand(game, "Rampant Growth"));
    expect(own.offered).toContain(mine);
    expect(zone(game, mine)).toBe("battlefield");

    // Bribery: Bob searches Alice's library, not his own.
    nextTurn(game);
    const hers = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 5, B);
    const search = pickFromZone(b, hers);
    cast(game, toHand(game, "Bribery", B), { player: B, targets: [ref(A)] });
    expect(search.offered).toContain(hers);
    expect(zone(game, hers)).toBe("battlefield");
    expect(controller(game, hers)).toBe(B);
  });

  it("does nothing once it has lost its abilities", () => {
    const { game, b } = table();
    spawn(game, "Opposition Agent");
    spawn(game, "Humility");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    pickFromZone(b, forest);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("gives way to a control effect created after it entered, and overrides an earlier one (rule 723.1a)", () => {
    const { game, a, c } = table({ players: 3 });
    const agent = spawn(game, "Opposition Agent");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    const stamp = game.state.objects[agent].timestamp;
    game.state.playerControl = [{ controlled: B, controller: C, during: "next-turn", began: game.state.turn.number, createdAt: stamp + 1 }];
    const later = answerSearchAs(game, c, B, () => [forest]);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(later.answering).toBe(C);
    // Still the Agent's exile.
    expect(zone(game, forest)).toBe("exile");

    const again = toLibrary(game, "Forest", B);
    game.state.playerControl = [{ controlled: B, controller: C, during: "next-turn", began: game.state.turn.number, createdAt: stamp - 1 }];
    lands(game, "Forest", 2, B);
    const earlier = answerSearchAs(game, a, B, () => [again]);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(earlier.answering).toBe(A);
    expect(game.state.playerControl?.map((p) => p.during)).toEqual(["next-turn"]);
  });
});

describe("Opposition Agent: they exile each card they find, and you may play them", () => {
  it("takes the find whatever the search says: battlefield, then the shuffle still happens", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    answerSearchAs(game, a, B, () => [forest]);
    const shuffles = game.state.eventSeq;
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(zone(game, forest)).toBe("exile");
    expect(game.state.objects[forest].exiledFaceDown).toBeUndefined();
    expect(game.state.objects[forest].impulse).toMatchObject({ player: A, expiry: { kind: "while-exiled" }, spendAs: "any-color" });
    expect(game.state.eventSeq).toBeGreaterThan(shuffles);
  });

  it("takes both of a search that splits its finds", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [one, two] = bobsTurn(game, "Forest", "Island");
    lands(game, "Forest", 3, B);
    answerSearchAs(game, a, B, () => [one, two]);
    cast(game, toHand(game, "Cultivate", B), { player: B });
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(hand(game, B)).not.toContain(two);
  });

  it("lets you cast it on your own turn, with any colour of mana, and it stays yours to play", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [bears] = bobsTurn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    answerSearchAs(game, a, B, () => [bears]);
    cast(game, toHand(game, "Demonic Tutor", B), { player: B });
    nextTurn(game);
    lands(game, "Swamp", 2);
    // Grizzly Bears is green; Swamps pay for it this way.
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].owner).toBe(B);
  });

  it("lets you play a land from it, and not its owner", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    answerSearchAs(game, a, B, () => [forest]);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(game.canDispatch({ type: "play-land", player: B, card: forest })).not.toBeNull();
    nextTurn(game);
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).toBeNull();
    game.dispatch({ type: "play-land", player: A, card: forest });
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("with two players' Agents: the later one's controller controls, and says who may play each find", () => {
    const { game, c } = table({ players: 3 });
    spawn(game, "Opposition Agent");
    const later = spawn(game, "Opposition Agent", C);
    expect(game.state.objects[later].controller).toBe(C);
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    const seen = answerSearchAs(game, c, B, () => [forest]);
    // "Alice may play Forest", the second mode, is generous of Carol.
    pickModes(c, 1);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(seen.answering).toBe(C);
    expect(zone(game, forest)).toBe("exile");
    expect(game.state.objects[forest].impulse).toMatchObject({ player: A, expiry: { kind: "while-exiled" }, spendAs: "any-color" });
    expect(game.state.objects[forest].impulse?.castOnly).toBeUndefined();
  });

  it("with two of one player's Agents, there's nothing to choose", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    spawn(game, "Opposition Agent");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    answerSearchAs(game, a, B, () => [forest]);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(game.state.objects[forest].impulse?.player).toBe(A);
    expect(game.state.awaiting).toBeNull();
  });

  it("covers every zone a search takes in, the library among them (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    bobsTurn(game);
    const inGraveyard = game.debugSpawn("Forest", B, "graveyard");
    lands(game, "Forest", 5, B);
    answerSearchAs(game, a, B, () => [inGraveyard]);
    cast(game, toHand(game, "Nissa's Encouragement", B), { player: B });
    expect(zone(game, inGraveyard)).toBe("exile");
  });
});

describe("Opposition Agent's rulings", () => {
  it("can't have them find what the search didn't ask for", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    spawn(game, "Opposition Agent");
    const [forest, giant] = bobsTurn(game, "Forest", "Hill Giant");
    lands(game, "Forest", 2, B);
    const seen = answerSearchAs(game, a, B, () => [forest]);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(seen.offered).toEqual([forest]);
    expect(seen.offered).not.toContain(giant);
  });

  it("may find nothing when a quality is stated, and the library is shuffled all the same", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [forest] = bobsTurn(game, "Forest");
    lands(game, "Forest", 2, B);
    const seen = answerSearchAs(game, a, B, () => []);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(seen.min).toBe(0);
    expect(zone(game, forest)).toBe("library");
    expect(game.state.playerControl).toBeUndefined();
  });

  it("the search's other effects still happen: Grim Tutor's life loss", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [giant] = bobsTurn(game, "Hill Giant");
    lands(game, "Swamp", 3, B);
    answerSearchAs(game, a, B, () => [giant]);
    cast(game, toHand(game, "Grim Tutor", B), { player: B });
    expect(zone(game, giant)).toBe("exile");
    expect(hand(game, B)).not.toContain(giant);
    expect(life(game, B)).toBe(17);
  });

  it("what refers to the finds can't see them in exile, and the rest goes on: Test of Talents", () => {
    const talents = (withAgent: boolean): { readonly drawn: number; readonly copy: string } => {
      const { game, a, b } = table();
      if (withAgent) spawn(game, "Opposition Agent");
      nextTurn(game);
      for (let i = 0; i < 3; i++) toLibrary(game, "Wastes", B);
      lands(game, "Island", 5, B);
      const copy = toHand(game, "Divination", B);
      const spell = toHand(game, "Divination", B);
      cast(game, spell, { player: B, settle: false });
      const pick = (eligible: readonly ObjectId[]): readonly ObjectId[] => eligible.filter((id) => id === copy);
      if (withAgent) answerSearchAs(game, a, B, pick);
      else b.chooseFromZoneFn = (_view, eligible) => pick(eligible);
      const before = hand(game, B).length;
      cast(game, toHand(game, "Test of Talents", B), { player: B, targets: [ref(spell)] });
      return { drawn: hand(game, B).length - (before - 1), copy: zone(game, copy) };
    };
    // Its controller's own spell: "That player shuffles, then draws a card for
    // each card exiled from their hand this way." Without an Agent, one.
    expect(talents(false)).toEqual({ drawn: 1, copy: "exile" });
    // The Agent exiled it, not the spell: none to draw for.
    expect(talents(true)).toEqual({ drawn: 0, copy: "exile" });
  });

  it("an instruction about the find does nothing, and asks nothing: Stonehewer Giant's attach", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [sword] = bobsTurn(game, "Leonin Scimitar");
    const giant = spawn(game, "Stonehewer Giant", B);
    lands(game, "Plains", 2, B);
    answerSearchAs(game, a, B, () => [sword]);
    activate(game, giant, 0, { player: B });
    expect(zone(game, sword)).toBe("exile");
    expect(game.state.objects[sword].attachedTo ?? null).toBeNull();
    expect(game.state.awaiting).toBeNull();
    expect(game.state.objects[sword].impulse?.player).toBe(A);
  });

  it("an instruction to cast the find offers nothing: Sunforger's free cast", () => {
    const { game, a, b } = table();
    spawn(game, "Opposition Agent");
    const [bolt] = bobsTurn(game, "Lightning Bolt");
    const bears = spawn(game, "Grizzly Bears", B);
    const sunforger = spawn(game, "Sunforger", B);
    game.state.objects[sunforger].attachedTo = bears;
    lands(game, "Plateau", 2, B);
    answerSearchAs(game, a, B, () => [bolt]);
    let offered = false;
    b.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    activate(game, sunforger, 0, { player: B });
    expect(offered).toBe(false);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].impulse?.player).toBe(A);
  });

  it("you still pay for it, and may not cast it without the mana", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    const [bears] = bobsTurn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    answerSearchAs(game, a, B, () => [bears]);
    cast(game, toHand(game, "Demonic Tutor", B), { player: B });
    nextTurn(game);
    expect(() => cast(game, bears, { via: "impulse" })).toThrow();
    expect(zone(game, bears)).toBe("exile");
  });

  it("keeps normal timing: a creature card or a land only when you could play one", () => {
    const { game, a } = table();
    spawn(game, "Opposition Agent");
    lands(game, "Swamp", 2);
    const [bears, forest] = bobsTurn(game, "Grizzly Bears", "Forest");
    lands(game, "Swamp", 3, B);
    answerSearchAs(game, a, B, () => [bears]);
    cast(game, toHand(game, "Demonic Tutor", B), { player: B });
    answerSearchAs(game, a, B, () => [forest]);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    // Bob's turn, Alice holding priority with an empty stack.
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.priority.holder).toBe(A);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" })).not.toBeNull();
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).not.toBeNull();
    nextTurn(game);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" })).toBeNull();
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).toBeNull();
  });

  it("a card whose owner leaves the game leaves with them", () => {
    const { game, a } = table({ players: 3 });
    spawn(game, "Opposition Agent");
    const [bears] = bobsTurn(game, "Grizzly Bears");
    lands(game, "Swamp", 2, B);
    answerSearchAs(game, a, B, () => [bears]);
    cast(game, toHand(game, "Demonic Tutor", B), { player: B });
    expect(zone(game, bears)).toBe("exile");
    lands(game, "Swamp", 2);
    nextTurn(game);
    game.concede(B);
    nextTurn(game);
    expect(game.state.priority.holder).toBe(A);
    // It stays on the board to be seen, and is out of the game (rule 800.4a).
    expect(game.canDispatch({ type: "cast-spell", player: A, card: bears, targets: [], via: "impulse" })).not.toBeNull();
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === bears)).toBe(false);
  });

  it("controls them for the search and nothing else: their next choice is their own", () => {
    const { game, a, b } = table();
    spawn(game, "Opposition Agent");
    const [giant] = bobsTurn(game, "Hill Giant");
    lands(game, "Swamp", 3, B);
    answerSearchAs(game, a, B, () => [giant]);
    cast(game, toHand(game, "Grim Tutor", B), { player: B });
    expect(controlOf(game.state, B)).toBeUndefined();
    expect(answeringPlayer(game.state, B)).toBe(B);
    expect(b.playerId).toBe(B);
  });
});

describe("Aven Mindcensor: the top four cards of that library instead", () => {
  it("offers only a match among the top four, and shuffles the whole library", () => {
    const { game, b } = table({ deck: "Grizzly Bears" });
    spawn(game, "Aven Mindcensor");
    nextTurn(game);
    // Fifth from the top, then four cards over it.
    const deep = toLibrary(game, "Forest", B);
    const library = game.state.zones.perPlayer[B].library;
    library.splice(library.indexOf(deep), 1);
    library.splice(4, 0, deep);
    const near = toLibrary(game, "Forest", B);
    library.splice(library.indexOf(near), 1);
    library.splice(1, 0, near);
    lands(game, "Forest", 2, B);
    const search = pickFromZone(b, near);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(search.offered).toEqual([near]);
    expect(zone(game, near)).toBe("battlefield");
    expect(zone(game, deep)).toBe("library");
  });

  it("offers nothing if the top four hold no match, and leaves its controller's search alone", () => {
    const { game, a, b } = table({ deck: "Grizzly Bears" });
    spawn(game, "Aven Mindcensor");
    const mine = toLibrary(game, "Forest");
    const library = game.state.zones.perPlayer[A].library;
    library.splice(library.indexOf(mine), 1);
    library.splice(10, 0, mine);
    lands(game, "Forest", 2);
    const own = pickFromZone(a, mine);
    cast(game, toHand(game, "Rampant Growth"));
    expect(own.offered).toEqual([mine]);

    nextTurn(game);
    const deep = toLibrary(game, "Forest", B);
    const theirs = game.state.zones.perPlayer[B].library;
    theirs.splice(theirs.indexOf(deep), 1);
    theirs.splice(10, 0, deep);
    lands(game, "Forest", 2, B);
    const search = pickFromZone(b);
    cast(game, toHand(game, "Rampant Growth", B), { player: B });
    expect(search.offered).toEqual([]);
    expect(zone(game, deep)).toBe("library");
  });
});

describe("Yavimaya Dryad: a find under target player's control", () => {
  it("enters tapped under that player's control, and owned by its searcher", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    a.chooseTargetsFn = () => [ref(B)];
    a.chooseModesFn = () => [0];
    pickFromZone(a, forest);
    enter(game, "Yavimaya Dryad");
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
    expect(controller(game, forest)).toBe(B);
    expect(game.state.objects[forest].owner).toBe(A);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(graveyard(game).length).toBe(0);
  });
});
