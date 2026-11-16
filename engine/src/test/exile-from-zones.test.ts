/**
 * `exile-from-zones`: each player exiles some of their own things from
 * several zones at once, any mix (Lich's Mastery, Nicol Bolas, Dragon-God,
 * Descent into Madness) — chosen in turn order, the hand's picks hidden from
 * the others, then all exiled together (rule 101.4).
 */

import { describe, expect, it } from "vitest";
import { EvalBotController } from "../bot/eval-bot.js";
import { HeuristicBotController } from "../controller.js";
import type { GameEvent } from "../events.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  graveyard,
  hand,
  life,
  loyalty,
  named,
  registryOf,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const chosenEvents = (events: readonly GameEvent[]): Extract<GameEvent, { type: "cards-chosen-from-zone" }>[] =>
  events.filter((e): e is Extract<GameEvent, { type: "cards-chosen-from-zone" }> => e.type === "cards-chosen-from-zone");

describe("Lich's Mastery: for each 1 life lost, a permanent or a card from hand or graveyard", () => {
  it("asks for that many from all three zones at once, any mix, and exiles them together", () => {
    const { game, a } = table();
    const mastery = spawn(game, "Lich's Mastery");
    const elves = spawn(game, "Llanowar Elves");
    const bears = toHand(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const kept = toGraveyard(game, "Shock");
    let offered: readonly ObjectId[] = [];
    let prompt: string | undefined;
    let stillThere = false;
    a.chooseFromZoneFn = (view, eligible, min, max) => {
      offered = eligible;
      prompt = view.state.awaiting?.kind === "choose-from-zone" ? view.state.awaiting.prompt : undefined;
      expect([min, max]).toEqual([3, 3]);
      stillThere = zone(game, elves) === "battlefield" && zone(game, bears) === "hand";
      return [elves, bears, bolt];
    };
    game.debugApplyEffect(B, { kind: "lose-life", amount: 3, who: "each-opponent" });
    settle(game);
    expect(life(game, A)).toBe(17);
    expect(offered).toEqual(expect.arrayContaining([mastery, elves, bears, bolt, kept]));
    expect(prompt).toBe("Choose 3 permanents you control and/or cards from your hand or graveyard to exile");
    expect(stillThere).toBe(true);
    expect([zone(game, elves), zone(game, bears), zone(game, bolt)]).toEqual(["exile", "exile", "exile"]);
    expect([zone(game, mastery), zone(game, kept)]).toEqual(["battlefield", "graveyard"]);
    // One event for the three (rule 603.10a).
    const arrivals = game.state.eventLog.filter((e) => e.type === "cards-put-into-exile");
    expect(arrivals).toHaveLength(1);
  });

  it("exiles everything there is, itself too, with no more than the life lost — and then you lose", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const mastery = spawn(game, "Lich's Mastery");
    const elves = spawn(game, "Llanowar Elves");
    const bears = toHand(game, "Grizzly Bears");
    let asked = false;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      asked = true;
      return eligible.slice(0, min);
    };
    game.debugApplyEffect(B, { kind: "lose-life", amount: 5, who: "each-opponent" });
    settle(game);
    expect(asked).toBe(false);
    expect([zone(game, mastery), zone(game, elves), zone(game, bears)]).toEqual(["exile", "exile", "exile"]);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("offers a token stack token by token, and exiles only the tokens picked", () => {
    const { game, a } = table({ openingHandSize: 0 });
    spawn(game, "Lich's Mastery");
    const stack = spawn(game, "Soldier Token");
    game.state.objects[stack].isToken = true;
    game.state.objects[stack].stackCount = 4;
    const lands = [toHand(game, "Swamp"), toHand(game, "Swamp")];
    let soldiers: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      soldiers = eligible.filter((id) => game.state.objects[id]?.cardName === "Soldier Token");
      return soldiers;
    };
    game.debugApplyEffect(B, { kind: "lose-life", amount: 2, who: "each-opponent" });
    settle(game);
    // Two of the stack offered (as many as it takes), both exiled, two left.
    expect(soldiers).toHaveLength(2);
    const left = named(game, "Soldier Token", A).reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(left).toBe(2);
    expect(lands.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
  });

  it("v1 gives up the graveyard first, then the hand, then permanents, the Mastery last", () => {
    // Alice's hand: the Wastes she drew, and the Bears.
    const { game, a } = table({ openingHandSize: 0 });
    const mastery = spawn(game, "Lich's Mastery");
    const elves = spawn(game, "Llanowar Elves");
    const [wastes] = hand(game, A);
    const bears = toHand(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bot = new HeuristicBotController(A, registryOf(game));
    let picks: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (view, eligible, min, max) => {
      picks = bot.chooseFromZone(view, eligible, min, max);
      return eligible.slice(0, min);
    };
    game.debugApplyEffect(B, { kind: "lose-life", amount: 4, who: "each-opponent" });
    settle(game);
    expect(picks).toHaveLength(4);
    expect(picks[0]).toBe(bolt);
    expect([...picks.slice(1, 3)].sort()).toEqual([wastes, bears].sort());
    expect(picks[3]).toBe(elves);
    expect(picks).not.toContain(mastery);
  });

  it("v2 searches the answer through the held exile, and gives up the graveyard card", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const mastery = spawn(game, "Lich's Mastery");
    const elves = spawn(game, "Llanowar Elves");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bot = new EvalBotController(A, registryOf(game));
    let answer: unknown;
    a.chooseFromZoneFn = (view, eligible, min) => {
      answer = bot.act(view);
      return eligible.slice(0, min);
    };
    game.debugApplyEffect(B, { kind: "lose-life", amount: 1, who: "each-opponent" });
    settle(game);
    expect(answer).toEqual({ type: "choose-from-zone", player: A, chosen: [bolt] });
    expect([zone(game, mastery), zone(game, elves)]).toEqual(["battlefield", "battlefield"]);
  });
});

describe("Nicol Bolas, Dragon-God's +1: each opponent exiles a card from their hand or a permanent", () => {
  it("asks each opponent in turn order, hides a hand pick from the others, then exiles all at once", () => {
    const { game, b, c } = table({ players: 4, openingHandSize: 0 });
    const bolas = spawn(game, "Nicol Bolas, Dragon-God");
    const bobsBears = toHand(game, "Grizzly Bears", B);
    const bobsElves = spawn(game, "Llanowar Elves", B);
    const carolsBears = toHand(game, "Grizzly Bears", C);
    const carolsElves = spawn(game, "Llanowar Elves", C);
    const davesElves = spawn(game, "Llanowar Elves", D);
    const order: string[] = [];
    let bobOffered: readonly ObjectId[] = [];
    let othersSaw: unknown;
    let heldWhileCarolChose = false;
    let logWhileCarolChose: ReturnType<typeof chosenEvents> = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      order.push("bob");
      bobOffered = eligible;
      // What the others see of bob's choice: none of his hand.
      othersSaw = game.viewFor(C).awaiting;
      return [bobsBears];
    };
    c.chooseFromZoneFn = () => {
      order.push("carol");
      heldWhileCarolChose = zone(game, bobsBears) === "hand";
      logWhileCarolChose = chosenEvents(game.viewFor(C).events);
      return [carolsElves];
    };
    const handBefore = hand(game, A).length;
    loyalty(game, bolas, 1);
    expect(order).toEqual(["bob", "carol"]);
    expect([...bobOffered].sort()).toEqual([bobsBears, bobsElves].sort());
    expect(othersSaw).toMatchObject({ kind: "choose-from-zone", player: B, eligible: [bobsElves] });
    // Carol chose knowing bob's choice was one hand card, not which (rule 101.4a/b).
    expect(heldWhileCarolChose).toBe(true);
    expect(logWhileCarolChose.at(-1)).toMatchObject({ player: B, objects: [], fromHand: 1 });
    expect(JSON.stringify(logWhileCarolChose)).not.toContain(bobsBears);
    expect(hand(game, A).length).toBe(handBefore + 1);
    // Dave had one permanent and no hand: exiled unasked. All at once.
    expect([zone(game, bobsBears), zone(game, carolsElves), zone(game, davesElves)]).toEqual(["exile", "exile", "exile"]);
    expect([zone(game, bobsElves), zone(game, carolsBears)]).toEqual(["battlefield", "hand"]);
    expect(game.state.eventLog.filter((e) => e.type === "cards-put-into-exile")).toHaveLength(1);
  });

  it("−8: each opponent without a legendary creature or planeswalker loses", () => {
    const { game } = table({ players: 3 });
    const bolas = spawn(game, "Nicol Bolas, Dragon-God");
    spawn(game, "Isamaru, Hound of Konda", B);
    loyalty(game, bolas, -8, { atLeast: 8 });
    expect(game.state.players[B].hasLost).toBe(false);
    expect(game.state.players[C].hasLost).toBe(true);
  });
});

describe("Descent into Madness: each player exiles X permanents and/or cards from hand", () => {
  it("you choose first, then each other player, then all are exiled together", () => {
    const { game, a, b } = table({ openingHandSize: 0 });
    const descent = spawn(game, "Descent into Madness");
    const alicesElves = spawn(game, "Llanowar Elves");
    const bobsBears = toHand(game, "Grizzly Bears", B);
    const bobsElves = spawn(game, "Llanowar Elves", B);
    const order: string[] = [];
    let alicePrompt: string | undefined;
    a.chooseFromZoneFn = (view, eligible) => {
      order.push("alice");
      alicePrompt = view.state.awaiting?.kind === "choose-from-zone" ? view.state.awaiting.prompt : undefined;
      expect(eligible.every((id) => game.state.objects[id]?.zone !== "graveyard")).toBe(true);
      return [alicesElves];
    };
    b.chooseFromZoneFn = () => {
      order.push("bob");
      expect(zone(game, alicesElves)).toBe("battlefield");
      return [bobsBears];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[descent].counters.despair).toBe(1);
    expect(order).toEqual(["alice", "bob"]);
    expect(alicePrompt).toBe("Choose a permanent you control or a card from your hand to exile");
    expect([zone(game, alicesElves), zone(game, bobsBears), zone(game, bobsElves)]).toEqual([
      "exile",
      "exile",
      "battlefield",
    ]);
    expect(graveyard(game, B)).toHaveLength(0);
  });
});
