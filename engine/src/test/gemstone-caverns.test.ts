// Gemstone Caverns (rule 103.6a): "If this card is in your opening hand and
// you're not the starting player, you may begin the game with Gemstone Caverns
// on the battlefield with a luck counter on it. If you do, exile a card from
// your hand." `CardDefinition.beginsOnBattlefield`'s riders, and a mana ability
// whose type depends on a condition (`BoardManaList`'s `ifCondition`).

import { describe, expect, it } from "vitest";

import { HeuristicBotController } from "../controller.js";
import { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, D, enter, ref, table, toHand } from "./harness.js";

/** No shuffle, so the named cards are in the opening hand. */
const deck = (...named: string[]): string[] => [
  ...named,
  ...Array.from({ length: 40 - named.length }, (_, i) => (i % 2 === 0 ? "Forest" : "Grizzly Bears")),
];

const newGame = (decks: Record<string, string[]>, startingPlayer: PlayerId): Game =>
  Game.create({
    seed: 7,
    shuffle: false,
    startingPlayer,
    decks: Object.entries(decks).map(([player, cards]) => ({ player: asPlayerId(player), cards })),
  });

const inHand = (game: Game, player: PlayerId, name: string): ObjectId[] =>
  game.handOf(player).filter((id) => game.state.objects[id].cardName === name);

const onBattlefield = (game: Game, name: string): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);

const zoneChoice = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-from-zone") throw new Error(`expected a zone choice, got ${awaiting?.kind}`);
  return awaiting;
};

describe("Gemstone Caverns: beginning the game on the battlefield, with more to it", () => {
  it("isn't offered to the starting player, and is to anyone else", () => {
    const starting = newGame({ alice: deck("Gemstone Caverns"), bob: deck() }, A);
    expect(starting.state.turn.number).toBe(1);
    expect(onBattlefield(starting, "Gemstone Caverns")).toEqual([]);
    expect(inHand(starting, A, "Gemstone Caverns")).toHaveLength(1);

    const second = newGame({ alice: deck("Gemstone Caverns"), bob: deck() }, B);
    expect(second.state.turn.number).toBe(0);
    const asked = zoneChoice(second);
    expect([asked.player, asked.min, asked.max, asked.destination]).toEqual([A, 0, 1, "battlefield"]);
  });

  it("a Leyline beside it is still the starting player's to begin with, the Caverns not", () => {
    const game = newGame({ alice: deck("Gemstone Caverns", "Leyline of Sanctity"), bob: deck() }, A);
    expect(zoneChoice(game).eligible).toEqual(inHand(game, A, "Leyline of Sanctity"));
  });

  it("arrives with a luck counter, then asks for a card from what's left of the hand", () => {
    const game = newGame({ alice: deck("Gemstone Caverns", "Shock"), bob: deck() }, B);
    const [caverns] = inHand(game, A, "Gemstone Caverns");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [caverns] });

    expect(game.state.objects[caverns].zone).toBe("battlefield");
    expect(game.state.objects[caverns].counters?.luck).toBe(1);
    expect(game.state.turn.number).toBe(0);

    const asked = zoneChoice(game);
    expect([asked.player, asked.destination, asked.min, asked.max]).toEqual([A, "exile", 1, 1]);
    expect(asked.eligible).toHaveLength(6);
    expect(asked.eligible).not.toContain(caverns);
    expect(game.legalActions(A)).toMatchObject([{ kind: "choose-from-zone", openingHand: true, destination: "exile" }]);
    // What's in alice's hand is still her business.
    const bobSees = game.viewFor(B).awaiting;
    expect(bobSees?.kind === "choose-from-zone" ? bobSees.ids : null).toEqual([]);

    // It must be a card: none is refused.
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [] })).toThrow();

    const [shock] = inHand(game, A, "Shock");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [shock] });
    expect(game.state.objects[shock].zone).toBe("exile");
    expect(game.handOf(A)).toHaveLength(5);
    expect(game.state.turn.number).toBe(1);
  });

  it("left in the hand, nothing is exiled and no counter is anywhere", () => {
    const game = newGame({ alice: deck("Gemstone Caverns"), bob: deck() }, B);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    expect(game.state.turn.number).toBe(1);
    expect(game.handOf(A)).toHaveLength(7);
    expect(onBattlefield(game, "Gemstone Caverns")).toEqual([]);
    expect(game.state.zones.shared.exile).toEqual([]);
  });

  it("at four players each is asked in turn order, and exiles before the next is asked", () => {
    const game = newGame(
      {
        alice: deck("Gemstone Caverns"),
        bob: deck("Gemstone Caverns"),
        carol: deck(),
        dave: deck("Gemstone Caverns"),
      },
      B,
    );
    // Bob starts, so his isn't offered; carol holds none; dave is next.
    expect(zoneChoice(game).player).toBe(D);
    game.dispatch({ type: "choose-from-zone", player: D, chosen: inHand(game, D, "Gemstone Caverns") });
    const exile = zoneChoice(game);
    expect([exile.player, exile.destination]).toEqual([D, "exile"]);
    game.dispatch({ type: "choose-from-zone", player: D, chosen: [exile.eligible[0]] });
    const next = zoneChoice(game);
    expect([next.player, next.destination]).toEqual([A, "battlefield"]);
    expect(inHand(game, B, "Gemstone Caverns")).toHaveLength(1);
  });

  it("two begun exile two cards, and the legend rule waits for the first upkeep (the ruling)", () => {
    const game = newGame({ alice: deck("Gemstone Caverns", "Gemstone Caverns", "Shock", "Shock"), bob: deck() }, B);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: inHand(game, A, "Gemstone Caverns") });
    expect(onBattlefield(game, "Gemstone Caverns")).toHaveLength(2);
    const exile = zoneChoice(game);
    expect([exile.min, exile.max]).toEqual([2, 2]);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: inHand(game, A, "Shock") });
    expect(game.state.zones.shared.exile).toHaveLength(2);
    expect(game.state.turn.number).toBe(1);
    expect(game.state.awaiting).toMatchObject({ kind: "legend-rule", player: A });
  });

  it("a hand with nothing else left has nothing to give, and the game goes on", () => {
    const game = Game.create({
      seed: 7,
      shuffle: false,
      startingPlayer: B,
      rules: { openingHandSize: 1 },
      decks: [
        { player: A, cards: deck("Gemstone Caverns") },
        { player: B, cards: deck() },
      ],
    });
    const [caverns] = inHand(game, A, "Gemstone Caverns");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [caverns] });
    expect(game.state.objects[caverns].counters?.luck).toBe(1);
    expect(game.handOf(A)).toEqual([]);
    expect(game.state.zones.shared.exile).toEqual([]);
    expect(game.state.turn.number).toBe(1);
  });

  describe("a commander exiled from the opening hand (rule 903.9a)", () => {
    /** Alice has begun with the Caverns and exiled a commander with it: the
     * state-based check that owes her the choice is the first one, once every
     * opening-hand question is answered and turn 1 has begun (rule 704.3). */
    function exileCommander(decks: Record<string, string[]>, starting: PlayerId): { game: Game; krenko: ObjectId } {
      const game = newGame(decks, starting);
      const [krenko] = inHand(game, A, "Krenko, Mob Boss");
      game.state.objects[krenko].isCommander = true;
      game.dispatch({ type: "choose-from-zone", player: A, chosen: inHand(game, A, "Gemstone Caverns") });
      game.dispatch({ type: "choose-from-zone", player: A, chosen: [krenko] });
      return { game, krenko };
    }

    it("is asked as turn 1 begins: to the command zone, and the game goes on", () => {
      const { game, krenko } = exileCommander({ alice: deck("Gemstone Caverns", "Krenko, Mob Boss"), bob: deck() }, B);
      expect(game.state.objects[krenko].zone).toBe("exile");
      expect(game.state.turn.number).toBe(1);
      expect(game.state.awaiting).toMatchObject({ kind: "commander-replacement", player: A, commander: krenko });
      game.dispatch({ type: "commander-replacement", player: A, toCommandZone: true });
      expect(game.state.objects[krenko].zone).toBe("command");
      expect(game.state.zones.shared.command).toContain(krenko);
      expect(game.state.awaiting).toBeNull();
      expect(game.state.priority.holder).toBe(B);
      // The game goes on as one with no commander in it does.
      game.dispatch({ type: "pass-priority", player: B });
      game.dispatch({ type: "pass-priority", player: A });
      expect(game.state.turn.step).toBe("upkeep");
      expect(game.state.awaiting).toBeNull();
    });

    it("choosing exile leaves it there, and doesn't ask again", () => {
      const { game, krenko } = exileCommander({ alice: deck("Gemstone Caverns", "Krenko, Mob Boss"), bob: deck() }, B);
      game.dispatch({ type: "commander-replacement", player: A, toCommandZone: false });
      expect(game.state.objects[krenko].zone).toBe("exile");
      expect(game.state.awaiting).toBeNull();
      expect(game.state.priority.holder).toBe(B);
      game.dispatch({ type: "pass-priority", player: B });
      expect(game.state.awaiting?.kind).not.toBe("commander-replacement");
      expect(game.state.objects[krenko].zone).toBe("exile");
    });

    it("the opening-hand questions still to come are asked first, whoever they're for", () => {
      const { game, krenko } = exileCommander(
        {
          alice: deck("Gemstone Caverns", "Krenko, Mob Boss", "Chancellor of the Tangle"),
          bob: deck("Gemstone Caverns"),
          carol: deck(),
          dave: deck(),
        },
        D,
      );
      // Her own reveal, then bob's Caverns: neither lost to the owed choice.
      expect(zoneChoice(game).destination).toBe("reveal");
      expect(zoneChoice(game).player).toBe(A);
      game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
      const bob = zoneChoice(game);
      expect([bob.player, bob.destination]).toEqual([B, "battlefield"]);
      expect(game.state.objects[krenko].zone).toBe("exile");
      expect(game.state.turn.number).toBe(0);
      game.dispatch({ type: "choose-from-zone", player: B, chosen: [] });
      expect(game.state.turn.number).toBe(1);
      expect(game.state.awaiting).toMatchObject({ kind: "commander-replacement", player: A, commander: krenko });
      game.dispatch({ type: "commander-replacement", player: A, toCommandZone: true });
      expect(game.state.objects[krenko].zone).toBe("command");
    });
  });

  it("v1 takes it, and gives up what a mulligan would have it bottom first (its dearest spell)", () => {
    const game = newGame({ alice: deck("Gemstone Caverns", "Craw Wurm"), bob: deck() }, B);
    const view = { player: A, state: game.state, legalActions: () => game.legalActions(A) };
    const bot = new HeuristicBotController(A, game.registry);
    const begun = bot.act(view);
    expect(begun).toMatchObject({ type: "choose-from-zone", chosen: inHand(game, A, "Gemstone Caverns") });
    game.dispatch(begun);
    const answer = bot.act({ ...view, state: game.state });
    if (answer.type !== "choose-from-zone") throw new Error("expected a zone choice");
    expect(answer.chosen).toHaveLength(1);
    expect(game.state.objects[answer.chosen[0]].cardName).toBe("Craw Wurm");
    game.dispatch(answer);
    expect(game.state.turn.number).toBe(1);
  });
});

describe("a mana ability whose type depends on a condition", () => {
  const offers = (game: Game, source: ObjectId) =>
    game.legalActions(A).flatMap((a) => (a.kind === "activate-ability" && a.source === source ? [a.manaColors] : []));

  it("makes {C} and nothing else with no luck counter", () => {
    const { game } = table();
    const caverns = enter(game, "Gemstone Caverns", A);
    expect(offers(game, caverns)).toEqual([["C"]]);
    game.dispatch({ type: "activate-ability", player: A, source: caverns, abilityIndex: 0, targets: [], manaColors: ["C"] });
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ C: 1 });
  });

  it("makes one mana of any color, and no {C}, with one", () => {
    const { game } = table();
    const caverns = enter(game, "Gemstone Caverns", A);
    game.state.objects[caverns].counters = { luck: 1 };
    expect(offers(game, caverns)).toEqual([["W"], ["U"], ["B"], ["R"], ["G"]]);
    game.dispatch({ type: "activate-ability", player: A, source: caverns, abilityIndex: 0, targets: [], manaColors: ["U"] });
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ U: 1, C: 0 });
  });

  it("pays a coloured cost only with the counter", () => {
    const without = table().game;
    enter(without, "Gemstone Caverns", A);
    const notPaid = toHand(without, "Shock", A);
    expect(() => cast(without, notPaid, { targets: [ref(B)] })).toThrow();

    const lucky = table().game;
    const caverns = enter(lucky, "Gemstone Caverns", A);
    lucky.state.objects[caverns].counters = { luck: 1 };
    const paid = toHand(lucky, "Shock", A);
    cast(lucky, paid, { targets: [ref(B)] });
    expect(lucky.state.objects[caverns].tapped).toBe(true);
  });
});
