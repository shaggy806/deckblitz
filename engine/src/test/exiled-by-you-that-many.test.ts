/**
 * "Whenever one or more cards are put into exile from your hand or a spell or
 * ability you control exiles one or more permanents from the battlefield, put
 * **that many** +1/+1 counters on this creature" (Hero of Bretagard): Ranar's
 * two entries joined by `sameAbilityAs`, triggering once for a move that does
 * both (rule 603.2c), its value every card and permanent that move counted —
 * the sibling's share added to the trigger already queued
 * (`Game.addToMoveTrigger`). And the counters' statics: any counters, five
 * for flying and Angel, ten for indestructible and God.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, counters, keywords, lands, nextTurn, ref, settle, spawn, subtypes, table, toHand, zone } from "./harness.js";

const HERO = "Hero of Bretagard";

const foretell = (game: Game, card: ObjectId, player: PlayerId = A): void => {
  game.dispatch({ type: "foretell", player, card });
};

const triggersOf = (game: Game, hero: ObjectId): number =>
  game.state.eventLog.filter((e) => e.type === "ability-triggered" && e.source === hero).length;

describe("Hero of Bretagard", () => {
  it("a card foretold from your hand: one counter", () => {
    const { game } = table();
    const hero = spawn(game, HERO);
    lands(game, "Island", 2);
    foretell(game, toHand(game, "Saw It Coming"));
    settle(game);
    expect(counters(game, hero)).toBe(1);
  });

  it("your spell exiling two artifacts, one an opponent's: two counters", () => {
    const { game } = table();
    const hero = spawn(game, HERO);
    spawn(game, "Sol Ring", B);
    spawn(game, "Sol Ring", A);
    game.debugApplyEffect(A, { kind: "exile-all", filter: { type: "artifact" } }, []);
    settle(game);
    expect(counters(game, hero)).toBe(2);
  });

  it("an opponent's spell exiling your creature: none", () => {
    const { game } = table();
    const hero = spawn(game, HERO);
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    lands(game, "Plains", 1, B);
    cast(game, toHand(game, "Swords to Plowshares", B), { player: B, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, hero)).toBe(0);
  });

  it("one move exiling cards from your hand and a permanent: one trigger, every one of them counted", () => {
    const { game } = table();
    const hero = spawn(game, HERO);
    spawn(game, "Sol Ring", B);
    toHand(game, "Saw It Coming");
    const inHand = game.state.zones.perPlayer[A].hand.length;
    game.debugApplyEffect(
      A,
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile-all", filter: { type: "artifact" } },
          { kind: "exile-graveyard", target: "each-player", fromHand: "also" },
        ],
      },
      [],
    );
    settle(game);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(0);
    expect(triggersOf(game, hero)).toBe(1);
    // Bob's hand isn't yours: only alice's cards and the Sol Ring.
    expect(counters(game, hero)).toBe(inHand + 1);
  });

  it("five counters: flying and an Angel; ten: indestructible and a God too — any kind of counter", () => {
    const { game } = table();
    const hero = spawn(game, HERO);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 }, [ref(hero)]);
    expect(keywords(game, hero).has("flying")).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "charge", amount: 1 }, [ref(hero)]);
    expect(keywords(game, hero).has("flying")).toBe(true);
    expect(subtypes(game, hero)).toEqual(expect.arrayContaining(["Human", "Warrior", "Angel"]));
    expect(keywords(game, hero).has("indestructible")).toBe(false);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 5 }, [ref(hero)]);
    expect(keywords(game, hero).has("indestructible")).toBe(true);
    expect(subtypes(game, hero)).toEqual(expect.arrayContaining(["Angel", "God"]));
  });
});
