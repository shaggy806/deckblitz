/**
 * Restarting the game (rule 727) — the `restart-game` effect, Karn Liberated's
 * −14: the game ends with nobody winning it, and the players still in it begin
 * a new one by rule 103, its controller first (727.1a), every card they own in
 * it (727.2) but the non-Aura permanent cards exiled with Karn, which stay in
 * exile (727.5) and enter under its controller just before the first untap step
 * (727.4). Nothing of the old game is left (the rulings): life, counters,
 * commander tax and damage, effects; a player who had left stays out.
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { COMMANDER_RULES, activePlayerOf, cloneGameState } from "../state.js";
import { viewFor } from "../view.js";
import { A, B, C, attack, loyalty, named, pickFromZone, ref, registryOf, spawn, table, toExile, toHand, toStep, zone } from "./harness.js";

const registry = registryOf(table().game);

/** Every card `player` owns in the game, wherever it is, by name. */
function cardsOf(game: Game, player: PlayerId): string[] {
  const s = game.state;
  const ids = [
    ...s.zones.perPlayer[player].library,
    ...s.zones.perPlayer[player].hand,
    ...s.zones.perPlayer[player].graveyard,
    ...s.zones.shared.battlefield,
    ...s.zones.shared.stack,
    ...s.zones.shared.exile,
    ...s.zones.shared.command,
  ];
  return ids
    .map((id) => s.objects[id])
    .filter((o) => o.owner === player && o.kind === "card" && !o.isToken)
    .map((o) => o.cardName)
    .sort();
}

const restarted = (game: Game) => game.state.eventLog.filter((e) => e.type === "game-restarted");

/** Every object named `name`, in any zone. */
const everywhere = (game: Game, name: string): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.cardName === name)
    .map((o) => o.id);

/** Karn's −14, resolved by passing priority — and nothing more: a game with
 * mulligans stops at the new game's first question. */
function ultimate(game: Game, karnId: ObjectId, player: PlayerId = A): void {
  loyalty(game, karnId, -14, { player, atLeast: 14, settle: false });
  for (let i = 0; i < 8 && (game.state.restarts ?? 0) === 0; i += 1) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder as PlayerId });
  }
  expect(game.state.restarts).toBe(1);
}

describe("Karn Liberated's +4 and −3 exile cards linked to it (rule 607.2a)", () => {
  it("+4: the target player picks the card from their hand; −3 exiles a permanent; both are Karn's", () => {
    const { game, b } = table();
    const karn = spawn(game, "Karn Liberated");
    const bolt = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(b, bolt);
    loyalty(game, karn, 4, { targets: [ref(B)] });
    expect(seen.offered).toContain(bolt);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].exiledWith?.source).toBe(karn);
    expect(game.state.objects[karn].counters.loyalty).toBe(10);

    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, karn, -3, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[bears].exiledWith?.source).toBe(karn);
  });
});

describe("Karn Liberated's −14 restarts the game (rule 727)", () => {
  /** Alice's Karn has exiled Bob's Grizzly Bears (−3), then his Pacifism (an
   * Aura) and Lightning Bolt (+4, his picks), and the −14 is next. */
  function karnBoard() {
    const t = table();
    const { game, b } = t;
    const karn = spawn(game, "Karn Liberated");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, karn, -3, { targets: [ref(bears)] });
    toStep(game, "precombat-main");
    const pacifism = toHand(game, "Pacifism", B);
    pickFromZone(b, pacifism);
    loyalty(game, karn, 4, { targets: [ref(B)] });
    toStep(game, "precombat-main");
    const bolt = toHand(game, "Lightning Bolt", B);
    pickFromZone(b, bolt);
    loyalty(game, karn, 4, { targets: [ref(B)] });
    toStep(game, "precombat-main");
    expect([bears, pacifism, bolt].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    return { ...t, karn, bears, pacifism, bolt };
  }

  it("a new game: alice first, every card back in its owner's deck, the non-Aura permanent card onto her battlefield", () => {
    const { game, karn } = karnBoard();
    game.state.players[A].life = 7;
    game.state.players[B].life = 12;
    game.state.players[A].counters.poison = 3;
    // Not linked to Karn: exiled by something else.
    const elves = toExile(game, "Llanowar Elves", B);
    const aliceBefore = cardsOf(game, A);
    const bobBefore = cardsOf(game, B);

    loyalty(game, karn, -14, { atLeast: 14 });

    expect(game.state.restarts).toBe(1);
    expect(restarted(game)).toMatchObject([{ by: A, source: "Karn Liberated", players: [A, B] }]);
    // Turn 1 of the new game has begun, alice's (727.1a).
    expect(game.state.turn).toMatchObject({ number: 1, step: "untap" });
    expect(activePlayerOf(game.state)).toBe(A);
    expect(game.state.startingPlayer).toBe(A);
    // Every card is still each player's, and a new object (rule 400.7).
    expect(cardsOf(game, A)).toEqual(aliceBefore);
    expect(cardsOf(game, B)).toEqual(bobBefore);
    expect(game.state.objects[karn]).toBeUndefined();
    expect(game.state.objects[elves]).toBeUndefined();
    // The new game's opening hands, and its starting life (103.4).
    expect(game.state.zones.perPlayer[A].hand).toHaveLength(7);
    expect(game.state.zones.perPlayer[B].hand).toHaveLength(7);
    expect(game.state.players[A].life).toBe(20);
    expect(game.state.players[B].life).toBe(20);
    expect(game.state.players[A].counters.poison ?? 0).toBe(0);
    // Bob's Bears: alice's now, and not summoning sick on her first turn.
    const [bears] = named(game, "Grizzly Bears");
    expect(game.state.objects[bears]).toMatchObject({ zone: "battlefield", owner: B, controller: A, summoningSick: false });
    expect(game.state.zones.shared.battlefield).toEqual([bears]);
    // The Aura card, the instant and the card exiled otherwise are in Bob's
    // deck; nothing is in exile any more.
    for (const name of ["Pacifism", "Lightning Bolt", "Llanowar Elves"]) {
      const [id] = everywhere(game, name);
      expect(game.state.objects[id].owner).toBe(B);
      expect(["library", "hand"]).toContain(game.state.objects[id].zone);
    }
    expect(game.state.zones.shared.exile).toEqual([]);
    const [newKarn] = everywhere(game, "Karn Liberated");
    expect(["library", "hand"]).toContain(game.state.objects[newKarn].zone);
  });

  it("the Bears attack on alice's first turn: she has controlled them since it began", () => {
    const { game, a } = karnBoard();
    loyalty(game, karn(game), -14, { atLeast: 14 });
    const [bears] = named(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(game.state.turn.number).toBe(1);
    expect(game.state.players[B].life).toBe(18);
  });

  it("a card exiled with a different Karn isn't kept: it's that object's, not this one's (rule 607.2a)", () => {
    const { game } = table();
    const karnA = spawn(game, "Karn Liberated");
    const karnB = spawn(game, "Karn Liberated", B);
    const ox = spawn(game, "Grizzly Bears");
    // Bob's Karn exiles alice's Bears on his turn.
    toStep(game, "precombat-main", B);
    loyalty(game, karnB, -3, { player: B, targets: [ref(ox)] });
    expect(game.state.objects[ox].exiledWith?.source).toBe(karnB);
    toStep(game, "precombat-main");
    loyalty(game, karnA, -14, { atLeast: 14 });
    expect(game.state.restarts).toBe(1);
    expect(game.state.zones.shared.battlefield).toEqual([]);
    const [bears] = everywhere(game, "Grizzly Bears");
    expect(game.state.objects[bears].owner).toBe(A);
    expect(["library", "hand"]).toContain(game.state.objects[bears].zone);
  });

  it("the old game's effects, the journal and the decisions it waited on are gone; the log carries on", () => {
    const { game } = karnBoard();
    const logBefore = game.state.eventLog.length;
    game.state.monarch = B;
    game.state.dayNight = "night";
    loyalty(game, karn(game), -14, { atLeast: 14 });
    expect(game.state.monarch).toBeNull();
    expect(game.state.dayNight).toBeNull();
    expect(game.state.delayedTriggers).toEqual([]);
    expect(game.state.activeReplacements).toEqual([]);
    expect(game.state.restartPending).toBeUndefined();
    expect(game.state.restartHeld).toBeUndefined();
    expect(game.state.eventLog.length).toBeGreaterThan(logBefore);
    const types = game.state.eventLog.slice(logBefore).map((e) => e.type);
    expect(types.indexOf("game-restarted")).toBeLessThan(types.indexOf("game-started"));
    // What the log knew of each old object stops where the old game did.
    const stints = game.state.publicStints ?? {};
    const restartSeq = restarted(game)[0].seq;
    for (const [id, list] of Object.entries(stints)) {
      if (game.state.objects[id as ObjectId] !== undefined) continue;
      const last = list[list.length - 1];
      expect(last.until === undefined ? Infinity : last.until).toBeLessThanOrEqual(restartSeq);
    }
  });

  it("each seat's view says the game restarted, and shows no old object", () => {
    const { game, bears } = karnBoard();
    loyalty(game, karn(game), -14, { atLeast: 14 });
    for (const seat of [A, B]) {
      const view = viewFor(game.state, registry, seat);
      expect(view.restarts).toBe(1);
      expect(view.objects[bears]).toBeUndefined();
      expect(view.zones.battlefield).toHaveLength(1);
    }
  });

  it("replays the same from a snapshot (determinism)", () => {
    const { game, a, b } = karnBoard();
    const snapshot = cloneGameState(game.state);
    loyalty(game, karn(game), -14, { atLeast: 14 });
    const again = Game.fromSnapshot(snapshot, { registry, controllers: { [A]: a, [B]: b } as Record<PlayerId, ScriptedController> });
    loyalty(again, karn(again), -14, { atLeast: 14 });
    const order = (g: Game, p: PlayerId) => g.state.zones.perPlayer[p].library.map((id) => g.state.objects[id].cardName);
    expect(order(again, B)).toEqual(order(game, B));
    expect(again.state.zones.perPlayer[A].hand).toEqual(game.state.zones.perPlayer[A].hand);
  });

  it("a kept card's \"as this enters\" choice is made by alice before her first turn (rule 727.4)", () => {
    const { game, a } = table();
    const karnId = spawn(game, "Karn Liberated");
    const cavern = spawn(game, "Cavern of Souls", B);
    loyalty(game, karnId, -3, { targets: [ref(cavern)] });
    toStep(game, "precombat-main");
    const asked: string[] = [];
    a.chooseCreatureTypeFn = (view, _source, options) => {
      asked.push(`${view.state.turn.number}:${view.state.turn.step}`);
      return options.includes("Elf") ? "Elf" : options[0];
    };
    loyalty(game, karnId, -14, { atLeast: 14 });
    expect(asked).toEqual(["0:untap"]);
    const [kept] = named(game, "Cavern of Souls");
    expect(game.state.objects[kept]).toMatchObject({ zone: "battlefield", controller: A, owner: B });
    expect(game.state.turn.number).toBe(1);
  });

  it("a player with fewer than seven cards loses at the first upkeep, not before (rule 727.3)", () => {
    const { game, karn: karnId } = mulliganBoard();
    // Bob's deck is down to three cards.
    const bob = game.state.zones.perPlayer[B];
    bob.library.splice(3);
    bob.hand.splice(0);
    ultimate(game, karnId);
    // Asked to mulligan like anyone: the pregame checks no state-based actions.
    expect(game.state.awaiting).toMatchObject({ kind: "mulligan" });
    expect(Object.keys(game.state.awaiting?.kind === "mulligan" ? game.state.awaiting.hands : {}).sort()).toEqual([A, B]);
    expect(game.state.players[B].hasLost).toBe(false);
    expect(game.state.zones.perPlayer[B].hand).toHaveLength(3);
    game.advanceUntil((s) => s.result.over || s.turn.number >= 1);
    game.advanceUntil((s) => s.result.over);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
    expect(game.state.players[B].hasLost).toBe(true);
    // As turn 1 begins, before anyone has priority in it (the engine checks
    // as its untap step ends, which nothing can tell from its upkeep's check).
    expect(game.state.turn.number).toBe(1);
    expect(["untap", "upkeep"]).toContain(game.state.turn.step);
    const lost = game.state.eventLog.findIndex((e) => e.type === "player-lost");
    const began = game.state.eventLog.findIndex((e) => e.type === "game-started" && e.seq > restarted(game)[0].seq);
    expect(lost).toBeGreaterThan(began);
    expect(game.state.eventLog.slice(began, lost).some((e) => e.type === "turn-began")).toBe(true);
  });

  it("…unless a kept Platinum Angel has entered by then: the cards come in before the first upkeep (727.4)", () => {
    const { game, karn: karnId } = mulliganBoard();
    const angel = spawn(game, "Platinum Angel", B);
    loyalty(game, karnId, -3, { targets: [ref(angel)] });
    toStep(game, "precombat-main");
    const alice = game.state.zones.perPlayer[A];
    alice.library.splice(2);
    alice.hand.splice(0);
    loyalty(game, karnId, -14, { atLeast: 14 });
    game.advanceUntil((s) => s.result.over || (s.turn.number === 1 && s.turn.step === "precombat-main"));
    expect(game.state.result.over).toBe(false);
    expect(game.state.players[A].hasLost).toBe(false);
    const [kept] = named(game, "Platinum Angel");
    expect(game.state.objects[kept]).toMatchObject({ zone: "battlefield", controller: A });
  });

  /** A two-player game with mulligans, Karn on alice's side. */
  function mulliganBoard() {
    const a = new ScriptedController(A);
    const b = new ScriptedController(B);
    const game = Game.create({
      seed: 3,
      shuffle: false,
      mulligans: true,
      registry,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99 },
      controllers: { [A]: a, [B]: b } as Record<PlayerId, ScriptedController>,
      decks: [
        { player: A, cards: Array<string>(40).fill("Wastes") },
        { player: B, cards: Array<string>(40).fill("Wastes") },
      ],
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    return { game, a, b, karn: spawn(game, "Karn Liberated") };
  }
});

describe("restarting a Commander game (rules 727.5a, 903)", () => {
  const ALICE = "Isamaru, Hound of Konda";
  const BOB = "Kenrith, the Returned King";

  function commanderGame(players: 2 | 3 = 2) {
    const seats = [A, B, C].slice(0, players);
    const controllers = Object.fromEntries(seats.map((p) => [p, new ScriptedController(p)])) as Record<PlayerId, ScriptedController>;
    const game = Game.create({
      seed: 5,
      shuffle: false,
      mulligans: true,
      registry,
      rules: COMMANDER_RULES,
      controllers,
      decks: seats.map((player, i) => ({
        player,
        cards: Array<string>(60).fill("Wastes"),
        commanders: [[ALICE, BOB, "Grand Arbiter Augustin IV"][i]],
      })),
    });
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main" && s.priority.holder === A);
    return { game, controllers };
  }

  const commanderOf = (game: Game, name: string): ObjectId =>
    everywhere(game, name).find((id) => game.state.objects[id].isCommander)!;

  it("commanders go back to the command zone, tax and damage reset, life is 40; one exiled with Karn stays out and comes in", () => {
    const { game, controllers } = commanderGame();
    const karnId = spawn(game, "Karn Liberated");
    // Bob's commander on the battlefield, exiled with Karn, left in exile.
    const kenrith = commanderOf(game, BOB);
    game.state.players[B].commanderCastCounts[BOB] = 2;
    game.state.players[A].commanderCastCounts[ALICE] = 3;
    game.state.players[B].commanderDamageTaken[commanderOf(game, ALICE)] = 15;
    const onField = game.debugSpawn(BOB, B, "battlefield", { summoningSick: false });
    game.state.objects[onField].isCommander = true;
    game.state.zones.shared.command.splice(game.state.zones.shared.command.indexOf(kenrith), 1);
    delete game.state.objects[kenrith];
    controllers[B].commanderReplacementFn = () => false;
    loyalty(game, karnId, -3, { targets: [ref(onField)] });
    expect(zone(game, onField)).toBe("exile");

    toStep(game, "precombat-main");
    ultimate(game, karnId);
    // The mulligans come first, then Kenrith enters before turn 1.
    expect(game.state.awaiting?.kind).toBe("mulligan");
    const [heldKenrith] = everywhere(game, BOB);
    expect(game.state.objects[heldKenrith]).toMatchObject({ zone: "exile", isCommander: true, owner: B });
    game.advanceUntil((s) => s.turn.number === 1 && s.priority.holder !== null);

    const isamaru = commanderOf(game, ALICE);
    expect(zone(game, isamaru)).toBe("command");
    expect(game.state.objects[heldKenrith]).toMatchObject({ zone: "battlefield", controller: A, owner: B, isCommander: true });
    expect(game.state.players[A].commanderCastCounts).toEqual({});
    expect(game.state.players[B].commanderCastCounts).toEqual({});
    expect(game.state.players[B].commanderDamageTaken).toEqual({});
    expect(game.state.players[A].life).toBe(40);
    expect(game.state.players[B].life).toBe(40);
    // 60 cards and a commander each: Alice's Karn is one of hers now.
    expect(game.state.players[A].startingDeckSize).toBe(62);
    expect(game.state.players[B].startingDeckSize).toBe(60);
  });

  it("a player who had left stays out; the restarter goes first; the rules are the new player count's (103.5c, 103.8a)", () => {
    const { game } = commanderGame(3);
    expect(game.state.rules).toMatchObject({ skipFirstDraw: false, freeFirstMulligan: true });
    game.concede(C);
    toStep(game, "precombat-main", B);
    const karnId = spawn(game, "Karn Liberated", B);
    ultimate(game, karnId, B);

    expect(game.state.players[C]).toMatchObject({ hasLost: true });
    expect(cardsOf(game, C)).toEqual([]);
    expect(game.state.awaiting).toMatchObject({ kind: "mulligan" });
    expect(Object.keys(game.state.awaiting?.kind === "mulligan" ? game.state.awaiting.hands : {}).sort()).toEqual([A, B]);
    // A two-player game now (100.1b): the starter skips their first draw,
    // and the first mulligan isn't free.
    expect(game.state.rules).toMatchObject({ skipFirstDraw: true, freeFirstMulligan: false });
    expect(game.state.startingPlayer).toBe(B);
    game.advanceUntil((s) => s.turn.number === 1 && s.turn.step === "precombat-main");
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.zones.perPlayer[B].hand).toHaveLength(7);
    expect(game.state.zones.perPlayer[C].hand).toEqual([]);
  });
});

/** The Karn Liberated on the battlefield. */
function karn(game: Game): ObjectId {
  return named(game, "Karn Liberated").find((id) => game.state.objects[id].zone === "battlefield")!;
}
