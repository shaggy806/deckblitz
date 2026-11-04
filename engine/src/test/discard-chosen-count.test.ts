/**
 * `discard-chosen` with an exact number of cards (`picks`, without `reveals`)
 * — Mind Warp's "choose X cards from it", Abandon Hope's, Gruesome Discovery's
 * "you choose two cards", Last Rites's "a nonland card … for each card
 * discarded this way" — and one chosen card per filter (`oneEach` — Distended
 * Mindbender). Exactly that many: as many as there are when fewer (rule 609.3),
 * and none may be held back, unlike `upTo` (Discordant Dirge).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  destroy,
  graveyard,
  hand,
  lands,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

/** Replace a player's hand with these cards. */
const handOf = (game: Game, player: typeof A, ...names: readonly string[]): ObjectId[] => {
  for (const id of [...hand(game, player)]) game.debugMove(id, "library");
  return names.map((name) => toHand(game, name, player));
};

const awaitingChoice = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a choice from a zone, got ${awaiting?.kind}`);
  return awaiting;
};

const stopAtChoice = (game: Game): void => game.advanceUntil((s) => s.awaiting !== null);

const revealed = (game: Game) => game.state.eventLog.filter((e) => e.type === "cards-revealed" && e.player === B);

describe("discard-chosen: an exact number", () => {
  it("Mind Warp: looks without revealing, and exactly X must be chosen", () => {
    const { game, a } = table();
    const [bolt, bears, forest] = handOf(game, B, "Lightning Bolt", "Grizzly Bears", "Forest", "Craw Wurm");
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Mind Warp"), { x: 2, targets: [ref(B)], settle: false });
    stopAtChoice(game);
    const choice = awaitingChoice(game);
    expect(choice.player).toBe(A);
    expect(choice.forPlayer).toBe(B);
    expect([choice.min, choice.max]).toEqual([2, 2]);
    expect(choice.eligible.length).toBe(4);
    expect(revealed(game)).toEqual([]);
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bolt] })).not.toBeNull();
    a.chooseFromZoneFn = () => [bolt, forest];
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, forest] });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, bears)).toBe("hand");
    expect(hand(game, B).length).toBe(2);
  });

  it("Mind Warp: takes the whole hand when X is more, and X = 0 is a look alone", () => {
    const { game } = table();
    const [bolt, bears] = handOf(game, B, "Lightning Bolt", "Grizzly Bears");
    lands(game, "Swamp", 13);
    cast(game, toHand(game, "Mind Warp"), { x: 5, targets: [ref(B)], settle: false });
    stopAtChoice(game);
    const all = awaitingChoice(game);
    expect([all.min, all.max]).toEqual([2, 2]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, bears] });
    settle(game);
    expect(hand(game, B).length).toBe(0);

    const [shock] = handOf(game, B, "Shock");
    cast(game, toHand(game, "Mind Warp"), { x: 0, targets: [ref(B)], settle: false });
    stopAtChoice(game);
    const look = awaitingChoice(game);
    expect([look.min, look.max]).toEqual([0, 0]);
    expect(look.ids).toContain(shock);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);
    expect(zone(game, shock)).toBe("hand");
  });

  it("Abandon Hope: one X discarded by the caster and chosen from the opponent's hand", () => {
    const { game } = table();
    handOf(game, A, "Wastes", "Wastes");
    const [bolt, bears] = handOf(game, B, "Lightning Bolt", "Grizzly Bears", "Forest");
    lands(game, "Swamp", 8);
    const hope = toHand(game, "Abandon Hope");
    const offer = game.legalActions(A).find((la) => la.kind === "cast-spell" && la.cardName === "Abandon Hope");
    // Six Swamps' worth of X, but only the two other cards to discard.
    expect(offer?.kind === "cast-spell" && offer.xCost?.maxX).toBe(2);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: hope, targets: [ref(B)], xValue: 3 })).not.toBeNull();
    cast(game, hope, { x: 2, targets: [ref(B)], settle: false });
    stopAtChoice(game);
    // The caster's two cards went as the cost was paid.
    expect(hand(game, A).length).toBe(0);
    const choice = awaitingChoice(game);
    expect(choice.forPlayer).toBe(B);
    expect([choice.min, choice.max]).toEqual([2, 2]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, bears] });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game, B).length).toBe(1);
  });

  it("Gruesome Discovery: the player picks two, and with morbid the caster does, from a revealed hand", () => {
    const { game, b } = table();
    const [bolt, bears, forest] = handOf(game, B, "Lightning Bolt", "Grizzly Bears", "Forest");
    lands(game, "Swamp", 8);
    b.chooseDiscardsFn = (_hand, count) => {
      expect(count).toBe(2);
      return [bears, forest];
    };
    cast(game, toHand(game, "Gruesome Discovery"), { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
    expect(revealed(game)).toEqual([]);

    const [shock, wurm, hill] = handOf(game, B, "Shock", "Craw Wurm", "Forest");
    destroy(game, spawn(game, "Llanowar Elves", B));
    cast(game, toHand(game, "Gruesome Discovery"), { targets: [ref(B)], settle: false });
    stopAtChoice(game);
    const choice = awaitingChoice(game);
    expect(choice.player).toBe(A);
    expect([choice.min, choice.max]).toEqual([2, 2]);
    expect(revealed(game).length).toBe(1);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [shock, wurm] });
    settle(game);
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, hill)).toBe("hand");
  });

  it("Last Rites: a nonland card for each card the caster discarded, exactly", () => {
    const { game } = table();
    const [one, two] = handOf(game, A, "Wastes", "Wastes", "Wastes");
    const [bolt, bears, forest] = handOf(game, B, "Lightning Bolt", "Grizzly Bears", "Forest", "Craw Wurm");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Last Rites"), { targets: [ref(B)], settle: false });
    stopAtChoice(game);
    game.dispatch({ type: "discard", player: A, cards: [one, two] });
    stopAtChoice(game);
    expect(zone(game, one)).toBe("graveyard");
    const choice = awaitingChoice(game);
    expect(choice.destination).toBe("discard");
    // The land isn't one to choose; two chosen, not up to two.
    expect(choice.eligible).not.toContain(forest);
    expect([choice.min, choice.max]).toEqual([2, 2]);
    expect(revealed(game).length).toBe(1);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, bears] });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
  });

  it("Last Rites: discarding nothing reveals the hand and takes nothing", () => {
    const { game } = table();
    handOf(game, A, "Wastes");
    const [bolt] = handOf(game, B, "Lightning Bolt");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Last Rites"), { targets: [ref(B)], settle: false });
    stopAtChoice(game);
    game.dispatch({ type: "discard", player: A, cards: [] });
    settle(game);
    expect(zone(game, bolt)).toBe("hand");
    expect(revealed(game).length).toBe(1);
    expect(hand(game, A).length).toBe(1);
  });
});

describe("discard-chosen: one card per filter (Distended Mindbender)", () => {
  /** Cast for its full {8}, stopping at the trigger's choice. */
  const castMindbender = (game: Game): void => {
    lands(game, "Swamp", 8);
    cast(game, toHand(game, "Distended Mindbender"), { settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
  };

  it("offers both kinds, wants one of each, and discards the two together on casting", () => {
    const { game, a } = table();
    const [bolt, bears, wurm, forest] = handOf(game, B, "Lightning Bolt", "Grizzly Bears", "Craw Wurm", "Forest");
    a.chooseTargetsFn = () => [ref(B)];
    castMindbender(game);
    const choice = awaitingChoice(game);
    expect(choice.player).toBe(A);
    expect(choice.forPlayer).toBe(B);
    // The land has mana value 0 and is no nonland card: neither filter's.
    expect(new Set(choice.eligible)).toEqual(new Set([bolt, bears, wurm]));
    expect(choice.ids).toContain(forest);
    expect([choice.min, choice.max]).toEqual([2, 2]);
    // Two of the small ones don't answer it.
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bolt, bears] })).not.toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bolt] })).not.toBeNull();
    const before = game.state.eventLog.length;
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bears, wurm] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
    expect(graveyard(game, B).length).toBe(2);
    const discards = game.state.eventLog.slice(before).filter((e) => e.type === "cards-discarded");
    expect(discards.length).toBe(1);
    // The creature is still a spell: the ability resolved first (rule 603.3).
    expect(game.state.zones.shared.stack.length).toBe(1);
  });

  it("takes only the one there's a card for, when the hand has no other kind", () => {
    const { game, a } = table();
    const [bolt, shock, forest] = handOf(game, B, "Lightning Bolt", "Shock", "Forest");
    a.chooseTargetsFn = () => [ref(B)];
    castMindbender(game);
    const choice = awaitingChoice(game);
    expect([choice.min, choice.max]).toEqual([1, 1]);
    expect(new Set(choice.eligible)).toEqual(new Set([bolt, shock]));
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [shock] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
  });

  it("asks nothing when neither kind is there, the hand still revealed", () => {
    const { game, a } = table();
    const [forest] = handOf(game, B, "Forest");
    a.chooseTargetsFn = () => [ref(B)];
    lands(game, "Swamp", 8);
    cast(game, toHand(game, "Distended Mindbender"));
    expect(zone(game, forest)).toBe("hand");
    expect(revealed(game).length).toBe(1);
  });

  it("goes on the stack by emerge too, the trigger the same", () => {
    const { game, a } = table();
    const [bears, wurm] = handOf(game, B, "Grizzly Bears", "Craw Wurm");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Swamp", 6);
    a.chooseTargetsFn = () => [ref(B)];
    const card = toHand(game, "Distended Mindbender");
    const offer = game
      .legalActions(A)
      .find((la) => la.kind === "cast-spell" && la.cardName === "Distended Mindbender" && la.via === "emerge");
    expect(offer).toBeDefined();
    cast(game, card, { via: "emerge", sacrifice: elves, settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bears, wurm] });
    settle(game);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, card)).toBe("battlefield");
    expect(graveyard(game, B).length).toBe(2);
  });
});
