import { describe, expect, it } from "vitest";
import { EvalBotController } from "../bot/index.js";
import { HeuristicBotController, type ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  hand,
  lands,
  life,
  pickFromZone,
  pickModes,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/**
 * A "may" someone else answers, the two shapes of it:
 *
 * - "**Any opponent** may have you …. If a player does, … that player ….
 *   Otherwise, …" (Sin Prodder, Distant Memories): `unless` over a scope, each
 *   asked in turn order (rule 101.4), the next only once the one before has
 *   declined, the option that player's own effect, and `otherwise` only if
 *   nobody took it.
 * - "**That player / its controller** may …" (Arcum Dagsson, Farrel's Mantle):
 *   `each-player-may` naming the one who answers, where a no does nothing.
 */

/** Every seat's `choose-modes` answers come from `answers`; returns who was
 * asked, in order. */
function answering(seats: readonly ScriptedController[], answers: Partial<Record<PlayerId, readonly number[]>>): PlayerId[] {
  const asked: PlayerId[] = [];
  for (const seat of seats) {
    seat.chooseModesFn = () => {
      asked.push(seat.playerId);
      return [...(answers[seat.playerId] ?? [])];
    };
  }
  return asked;
}

describe("Sin Prodder: any opponent may have you put the revealed card into your graveyard", () => {
  /** A's Prodder and a Bears on top of her library, at her next upkeep with
   * the trigger resolved. */
  function upkeep(players: 2 | 4, answers: Partial<Record<PlayerId, readonly number[]>>, top = "Grizzly Bears") {
    const t = table({ players });
    spawn(t.game, "Sin Prodder");
    const card = toLibrary(t.game, top);
    const asked = answering([t.b, t.c, t.d], answers);
    toStep(t.game, "upkeep");
    settle(t.game);
    return { ...t, card, asked };
  }

  it("stops at the first yes, in turn order: the damage is that player's and the card goes to the graveyard", () => {
    const { game, card, asked } = upkeep(4, { [C]: [0] });
    expect(asked).toEqual([B, C]);
    expect(zone(game, card)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].graveyard).toContain(card);
    expect(life(game, C)).toBe(18);
    expect(life(game, B)).toBe(20);
    expect(life(game, D)).toBe(20);
    expect(hand(game, A)).not.toContain(card);
  });

  it("puts the card in your hand when every opponent declines, and hurts no one", () => {
    const { game, card, asked } = upkeep(4, {});
    expect(asked).toEqual([B, C, D]);
    expect(hand(game, A)).toContain(card);
    for (const p of [B, C, D]) expect(life(game, p)).toBe(20);
  });

  it("deals no damage for a card with no mana value, and the card still goes", () => {
    const { game, card } = upkeep(2, { [B]: [0] }, "Forest");
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("reveals the card before anyone is asked", () => {
    const t = table({ players: 2 });
    spawn(t.game, "Sin Prodder");
    const card = toLibrary(t.game, "Grizzly Bears");
    let revealedWhenAsked = false;
    t.b.chooseModesFn = () => {
      revealedWhenAsked = t.game.state.revealedThisTurn.includes(card);
      return [];
    };
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(revealedWhenAsked).toBe(true);
  });

  it("asks no one over an empty library: nothing was revealed to have put there", () => {
    const t = table({ players: 2 });
    spawn(t.game, "Sin Prodder");
    t.game.state.zones.perPlayer[A].library.length = 0;
    const asked = answering([t.b], { [B]: [0] });
    toStep(t.game, "upkeep");
    settle(t.game);
    expect(asked).toEqual([]);
    expect(t.game.state.result.over).toBe(false);
  });

  it("the source that deals it is the Prodder, gone or not", () => {
    const t = table({ players: 2 });
    const prodder = spawn(t.game, "Sin Prodder");
    toLibrary(t.game, "Grizzly Bears");
    t.b.chooseModesFn = () => [0];
    toStep(t.game, "upkeep");
    settle(t.game);
    const dealt = t.game.state.eventLog.find((e) => e.type === "damage-dealt" && e.target.kind === "player");
    expect(dealt).toMatchObject({ source: prodder, amount: 2 });
  });
});

describe("Distant Memories: any opponent may have you put the exiled card into your hand", () => {
  function play(players: 2 | 4, answers: Partial<Record<PlayerId, readonly number[]>>) {
    const t = table({ players });
    lands(t.game, "Island", 4);
    const tutor = toLibrary(t.game, "Grizzly Bears");
    const asked = answering([t.b, t.c, t.d], answers);
    pickFromZone(t.a, tutor);
    const spell = toHand(t.game, "Distant Memories");
    const before = hand(t.game, A).length;
    cast(t.game, spell);
    return { ...t, tutor, asked, before };
  }

  it("puts the exiled card in hand on the first yes, and draws nothing", () => {
    const { game, tutor, asked, before } = play(4, { [B]: [0] });
    expect(asked).toEqual([B]);
    expect(zone(game, tutor)).toBe("hand");
    // Less the spell, plus the card.
    expect(hand(game, A).length).toBe(before);
  });

  it("draws three when no opponent does, and the card stays exiled", () => {
    const { game, tutor, asked, before } = play(4, {});
    expect(asked).toEqual([B, C, D]);
    expect(zone(game, tutor)).toBe("exile");
    expect(hand(game, A).length).toBe(before - 1 + 3);
  });

  it("asks no one with no card exiled, and you draw", () => {
    const t = table({ players: 2 });
    lands(t.game, "Island", 4);
    t.game.state.zones.perPlayer[A].library.length = 0;
    const asked = answering([t.b], { [B]: [0] });
    cast(t.game, toHand(t.game, "Distant Memories"));
    expect(asked).toEqual([]);
    // The empty library's draws lose the game (rule 704.5c).
    expect(t.game.state.players[A].hasLost).toBe(true);
  });
});

describe("Arcum Dagsson: that player may search", () => {
  it("is the sacrificed creature's controller's search, into play", () => {
    const t = table({ players: 3 });
    const { game } = t;
    const arcum = spawn(game, "Arcum Dagsson");
    const construct = spawn(game, "Ornithopter", B);
    const relic = toLibrary(game, "Sol Ring", B);
    const asked = answering([t.a, t.b, t.c], { [B]: [0] });
    pickFromZone(t.b, relic);
    activate(game, arcum, 0, { targets: [ref(construct)] });
    expect(asked).toEqual([B]);
    expect(zone(game, construct)).toBe("graveyard");
    expect(zone(game, relic)).toBe("battlefield");
    expect(game.state.objects[relic].controller).toBe(B);
  });

  it("neither searches nor shuffles on a no", () => {
    const t = table({ players: 2 });
    const { game } = t;
    const arcum = spawn(game, "Arcum Dagsson");
    const construct = spawn(game, "Ornithopter");
    toLibrary(game, "Sol Ring");
    const library = [...game.state.zones.perPlayer[A].library];
    pickModes(t.a);
    activate(game, arcum, 0, { targets: [ref(construct)] });
    expect(zone(game, construct)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].library).toEqual(library);
    expect(game.state.eventLog.some((e) => e.type === "library-shuffled")).toBe(false);
  });

  it("offers only a noncreature artifact", () => {
    const t = table({ players: 2 });
    const { game } = t;
    const arcum = spawn(game, "Arcum Dagsson");
    const construct = spawn(game, "Ornithopter");
    const other = toLibrary(game, "Ornithopter");
    const ring = toLibrary(game, "Sol Ring");
    pickModes(t.a, 0);
    const seen = pickFromZone(t.a, ring);
    activate(game, arcum, 0, { targets: [ref(construct)] });
    expect(seen.offered).toContain(ring);
    expect(seen.offered).not.toContain(other);
  });
});

describe("Farrel's Mantle: its controller may", () => {
  /** A's Bears enchanted with a Mantle `aura` controls, attacking bob with no
   * block; `yes` answers the Bears' controller's question. */
  function board(aura: PlayerId, yes: boolean) {
    const t = table({ players: 4 });
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears");
    const mantle = game.debugSpawn("Farrel's Mantle", aura, "battlefield", {});
    game.state.objects[mantle].attachedTo = bears;
    const victim = spawn(game, "Hill Giant", C);
    spawn(game, "Hill Giant", B);
    const asked = answering([t.a, t.b, t.c, t.d], yes ? { [A]: [0] } : {});
    const seats = { [A]: t.a, [B]: t.b, [C]: t.c, [D]: t.d };
    let chooser: PlayerId | null = null;
    seats[aura].chooseTargetsFn = (_view, _name, _specs, options) => {
      chooser = aura;
      expect(options[0].some((o) => o.kind === "object" && o.object === bears)).toBe(false);
      return [ref(victim)];
    };
    attack(game, t.a, [bears]);
    return { ...t, bears, victim, asked, chooser: () => chooser };
  }

  it("the Aura's controller targets, the creature's controller answers, and a yes costs its combat damage", () => {
    const { game, victim, asked, chooser } = board(D, true);
    expect(chooser()).toBe(D);
    expect(asked).toEqual([A]);
    // Hill Giant is a 3/3: the Bears' power 2 plus 2 is lethal.
    expect(zone(game, victim)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("a no leaves the target alone and the combat damage dealt", () => {
    const { game, victim, asked } = board(D, false);
    expect(asked).toEqual([A]);
    expect(zone(game, victim)).toBe("battlefield");
    expect(life(game, B)).toBe(18);
  });
});

describe("the bots answer an any-opponent may", () => {
  /** The question stands, for `seat`: A's Prodder revealed `top`. */
  function asking(game: Game, top: string): void {
    spawn(game, "Sin Prodder");
    toLibrary(game, top);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    expect(game.state.awaiting).toMatchObject({ kind: "choose-modes", player: B });
  }
  const viewFor = (game: Game) => ({ player: B, state: game.state, legalActions: () => game.legalActions(B) });
  const bots = [
    ["v1", (game: Game) => new HeuristicBotController(B, game.registry)],
    ["v2", (game: Game) => new EvalBotController(B, game.registry, { maxSimulations: 8 })],
  ] as const;

  for (const [name, make] of bots) {
    it(`${name} refuses a yes that would kill it`, () => {
      const t = table({ players: 2, life: 3 });
      asking(t.game, "Colossal Dreadmaw");
      const answer = make(t.game).act(viewFor(t.game));
      expect(answer).toMatchObject({ type: "choose-modes", player: B, modes: [] });
    });

    it(`${name} takes a yes that costs it nothing and denies the card`, () => {
      const t = table({ players: 2, life: 40 });
      asking(t.game, "Forest");
      const answer = make(t.game).act(viewFor(t.game));
      expect(answer).toMatchObject({ type: "choose-modes", player: B, modes: [0] });
    });

    it(`${name} gives one card rather than let three be drawn (Distant Memories)`, () => {
      const t = table({ players: 2 });
      lands(t.game, "Island", 4);
      const found = toLibrary(t.game, "Grizzly Bears");
      pickFromZone(t.a, found);
      cast(t.game, toHand(t.game, "Distant Memories"), { settle: false });
      t.game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
      const answer = make(t.game).act(viewFor(t.game));
      expect(answer).toMatchObject({ type: "choose-modes", player: B, modes: [0] });
    });
  }

  /** B's Bears, enchanted, attacks A unblocked; the Mantle's target `victim`. */
  function mantleAsks(victimOwner: PlayerId) {
    const t = table({ players: 2 });
    const { game } = t;
    const bears = spawn(game, "Grizzly Bears", B);
    const mantle = game.debugSpawn("Farrel's Mantle", A, "battlefield", {});
    game.state.objects[mantle].attachedTo = bears;
    const victim = spawn(game, "Hill Giant", victimOwner);
    spawn(game, "Hill Giant", victimOwner);
    t.a.chooseTargetsFn = () => [ref(victim)];
    t.b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    expect(game.state.awaiting).toMatchObject({ kind: "choose-modes", player: B });
    return t;
  }

  it("v1 has the enchanted creature hit an opponent's creature and spares its own (Farrel's Mantle)", () => {
    const yes = mantleAsks(A);
    expect(new HeuristicBotController(B, yes.game.registry).act(viewFor(yes.game))).toMatchObject({ modes: [0] });
    const no = mantleAsks(B);
    expect(new HeuristicBotController(B, no.game.registry).act(viewFor(no.game))).toMatchObject({ modes: [] });
  });

  it("every seat's bot answers at four players, turn after turn", () => {
    const t = table({ players: 4 });
    const { game } = t;
    spawn(game, "Sin Prodder");
    toLibrary(game, "Grizzly Bears");
    const asked: PlayerId[] = [];
    for (const seat of [t.b, t.c, t.d]) {
      const bot = new EvalBotController(seat.playerId, game.registry, { maxSimulations: 4 });
      seat.chooseModesFn = (view, min, max, texts) => {
        asked.push(seat.playerId);
        return bot.chooseModes(view, min, max, texts);
      };
    }
    toStep(game, "upkeep");
    settle(game);
    expect(asked[0]).toBe(B);
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});
