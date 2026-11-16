/**
 * An optional replacement for being put into a graveyard, asked as the move
 * happens: Pulmonic Sliver's "All Slivers have 'If this permanent would be put
 * into a graveyard, you may put it on top of its owner's library instead'"
 * (`GraveyardExileReplacement.optional`). The permanent waits on the
 * battlefield while its controller ("you", rule 109.5) answers a
 * `choose-from-zone` (`graveyardInstead`) about every one of theirs leaving in
 * the same event — which go on top, the first picked on top (rule 401.4) —
 * each controller in APNAP order (616.1, 101.4); then every move of the event
 * is made at once (603.10a). Declined, the move goes on, and any other
 * replacement of it still applies (616.1).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameEvent } from "../events.js";
import type { ScriptedController } from "../controller.js";
import { poolCounts } from "../mana.js";
import {
  A,
  B,
  C,
  D,
  activate,
  cast,
  counters,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  pickFromZone,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const eventsSince = (game: Game, from: number): readonly GameEvent[] => game.state.eventLog.slice(from);
const asked = (game: Game): Extract<NonNullable<Game["state"]["awaiting"]>, { kind: "choose-from-zone" }> | undefined => {
  const awaiting = game.state.awaiting;
  return awaiting?.kind === "choose-from-zone" && awaiting.graveyardInstead !== undefined ? awaiting : undefined;
};
const onBattlefield = (game: Game, name: string): readonly ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === name);

/** Alice casts Wrath of God. */
function wrath(game: Game): void {
  lands(game, "Plains", 4);
  cast(game, toHand(game, "Wrath of God"));
}

/** `player`'s Blood Artist, its drain aimed at `at`: one life a death. */
function bloodArtist(game: Game, seat: ScriptedController, player: PlayerId, at: PlayerId): ObjectId {
  seat.chooseTargetsFn = () => [{ kind: "player", player: at }];
  return spawn(game, "Blood Artist", player);
}

describe("Pulmonic Sliver", () => {
  it("gives Sliver creatures flying", () => {
    const { game } = table();
    const pulmonic = spawn(game, "Pulmonic Sliver");
    const muscle = spawn(game, "Muscle Sliver", B);
    const bears = spawn(game, "Grizzly Bears");
    expect(keywords(game, pulmonic).has("flying")).toBe(true);
    expect(keywords(game, muscle).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });

  it("destroyed, its controller may put it on top of its library instead: it never dies", () => {
    const { game, a, b } = table();
    const pulmonic = spawn(game, "Pulmonic Sliver");
    bloodArtist(game, b, B, A);
    const offer = pickFromZone(a, pulmonic);
    destroy(game, pulmonic);
    expect(offer.offered).toEqual([pulmonic]);
    expect(library(game)[0]).toBe(pulmonic);
    expect(graveyard(game)).toEqual([]);
    // Bob's Blood Artist saw nothing die.
    expect(life(game, A)).toBe(20);
    expect(game.state.pendingOptionalGraveyardMoves).toBeUndefined();
  });

  it("declined, it dies, destroyed", () => {
    const { game, a, b } = table();
    const pulmonic = spawn(game, "Pulmonic Sliver");
    bloodArtist(game, b, B, A);
    pickFromZone(a);
    const from = game.state.eventLog.length;
    destroy(game, pulmonic);
    expect(zone(game, pulmonic)).toBe("graveyard");
    expect(life(game, A)).toBe(19);
    const events = eventsSince(game, from);
    // The destroy is announced after the move it reports (`thisWay: "died"`).
    const left = events.findIndex((e) => e.type === "permanent-left-battlefield" && e.object === pulmonic);
    const destroyed = events.findIndex((e) => e.type === "permanent-destroyed" && e.object === pulmonic);
    expect(left).toBeGreaterThanOrEqual(0);
    expect(destroyed).toBeGreaterThan(left);
  });

  it("waits on the battlefield until it's answered, and the resolution waits with it", () => {
    const { game } = table();
    const muscle = spawn(game, "Muscle Sliver");
    spawn(game, "Pulmonic Sliver");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(muscle)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null || s.zones.shared.stack.length === 0);
    // Murder resolved as far as the destroy; the Sliver is asked about.
    expect(asked(game)?.ids).toEqual([muscle]);
    expect(asked(game)?.player).toBe(A);
    expect(asked(game)?.min).toBe(0);
    expect(zone(game, muscle)).toBe("battlefield");
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [muscle] });
    settle(game);
    expect(library(game)[0]).toBe(muscle);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("a non-Sliver isn't asked about, nor a Sliver card discarded", () => {
    const { game, a } = table();
    spawn(game, "Pulmonic Sliver");
    const bears = spawn(game, "Grizzly Bears");
    const offer = pickFromZone(a);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(offer.offered).toEqual([]);
    const winged = toHand(game, "Winged Sliver");
    const muscle = toHand(game, "Muscle Sliver");
    a.chooseDiscardsFn = () => [winged, muscle];
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Mind Rot"), { targets: [ref(A)] });
    expect(zone(game, winged)).toBe("graveyard");
    expect(zone(game, muscle)).toBe("graveyard");
    expect(offer.offered).toEqual([]);
  });

  it("without Pulmonic Sliver, a Sliver just dies", () => {
    const { game, a } = table();
    const muscle = spawn(game, "Muscle Sliver");
    const offer = pickFromZone(a, muscle);
    destroy(game, muscle);
    expect(zone(game, muscle)).toBe("graveyard");
    expect(offer.offered).toEqual([]);
  });

  it("a wrath asks once about all of its controller's Slivers, Pulmonic Sliver's own included, and they go in the order picked", () => {
    const { game, a } = table();
    const pulmonic = spawn(game, "Pulmonic Sliver");
    const muscle = spawn(game, "Muscle Sliver");
    const winged = spawn(game, "Winged Sliver");
    const bears = spawn(game, "Grizzly Bears");
    const chainsaw = spawn(game, "Chainsaw", B);
    const domination = spawn(game, "Robot Domination");
    bloodArtist(game, a, A, B);
    const offer = pickFromZone(a, winged, pulmonic);
    wrath(game);
    // "Whenever one or more creature cards are put into your graveyard": once.
    expect(counters(game, domination, "plan")).toBe(1);
    expect([...offer.offered].sort()).toEqual([pulmonic, muscle, winged].sort());
    // The first picked on top: Robot Domination's draw took it.
    expect(game.state.zones.perPlayer[A].hand).toContain(winged);
    expect(library(game)[0]).toBe(pulmonic);
    expect(zone(game, muscle)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    // One event: "whenever one or more creatures die" once…
    expect(counters(game, chainsaw, "rev")).toBe(1);
    // …and Blood Artist, gone in the same wrath, sees the Muscle Sliver that
    // died after the answer (rule 603.10a): it, the Bears and itself.
    expect(life(game, B)).toBe(17);
  });

  it("several players' Slivers: each controller is asked about theirs in turn order, and they move together", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const mine = spawn(game, "Pulmonic Sliver", A);
    const bobs = spawn(game, "Muscle Sliver", B);
    const carols = [spawn(game, "Winged Sliver", C), spawn(game, "Muscle Sliver", C)];
    const daves = spawn(game, "Grizzly Bears", D);
    const chainsaw = spawn(game, "Chainsaw", D);
    const order: PlayerId[] = [];
    const record = (seat: ScriptedController, player: PlayerId, pick: (eligible: readonly ObjectId[]) => readonly ObjectId[]): void => {
      seat.chooseFromZoneFn = (view, eligible) => {
        order.push(player);
        // Each is asked about their own, and nothing has moved until every
        // one of them has answered.
        expect(eligible.every((id) => view.state.objects[id].controller === player)).toBe(true);
        expect(view.state.objects[mine].zone).toBe("battlefield");
        return pick(eligible);
      };
    };
    record(a, A, (eligible) => eligible);
    record(b, B, () => []);
    record(c, C, (eligible) => [...eligible].reverse());
    d.chooseFromZoneFn = () => {
      throw new Error("Dave has no Sliver to be asked about");
    };
    wrath(game);
    expect(order).toEqual([A, B, C]);
    expect(library(game, A)[0]).toBe(mine);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(library(game, C).slice(0, 2)).toEqual([...carols].reverse());
    expect(zone(game, daves)).toBe("graveyard");
    expect(counters(game, chainsaw, "rev")).toBe(1);
  });

  it("dying to lethal damage, a state-based action, it's asked too", () => {
    const { game, a } = table();
    spawn(game, "Pulmonic Sliver");
    const winged = spawn(game, "Winged Sliver");
    pickFromZone(a, winged);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(winged)] });
    expect(library(game)[0]).toBe(winged);
  });

  it("sacrificed for a cost, it's still sacrificed, and the cost is paid", () => {
    const { game, a } = table();
    spawn(game, "Pulmonic Sliver");
    const muscle = spawn(game, "Muscle Sliver");
    const altar = spawn(game, "Ashnod's Altar");
    pickFromZone(a, muscle);
    const from = game.state.eventLog.length;
    activate(game, altar, 0, { sacrifice: muscle });
    expect(library(game)[0]).toBe(muscle);
    expect(poolCounts(game.state.players[A].manaPool).C).toBe(2);
    expect(eventsSince(game, from).some((e) => e.type === "permanent-sacrificed" && e.object === muscle)).toBe(true);
    // Priority comes back to Alice, who activated it.
    expect(game.state.priority.holder).toBe(A);
  });

  it("with Rest in Peace out, its controller chooses: the library, or exile", () => {
    const { game, a } = table();
    spawn(game, "Rest in Peace", B);
    spawn(game, "Pulmonic Sliver");
    const muscle = spawn(game, "Muscle Sliver");
    const winged = spawn(game, "Winged Sliver");
    pickFromZone(a, muscle);
    destroy(game, muscle);
    expect(library(game)[0]).toBe(muscle);
    pickFromZone(a);
    destroy(game, winged);
    expect(zone(game, winged)).toBe("exile");
  });

  it("a stack of Sliver tokens is asked about token by token", () => {
    const { game, a } = table();
    spawn(game, "Pulmonic Sliver");
    game.debugApplyEffect(A, { kind: "create-token", token: "Sliver Token", count: 3 });
    settle(game);
    bloodArtist(game, a, A, B);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible.filter((id) => game.state.objects[id].isToken === true).slice(0, 1);
    };
    wrath(game);
    // Pulmonic Sliver and the three tokens, each its own.
    expect(offered).toHaveLength(4);
    expect(offered.filter((id) => game.state.objects[id] === undefined || game.state.objects[id].isToken)).toHaveLength(3);
    // Two tokens, Pulmonic Sliver and Blood Artist died; the token picked
    // went to the library.
    expect(life(game, B)).toBe(16);
    expect(onBattlefield(game, "Sliver Token")).toEqual([]);
  });

  it("a Sliver it controls but doesn't own: it chooses, and the owner arranges two or more of theirs (rule 401.4)", () => {
    const { game, a, b } = table();
    spawn(game, "Pulmonic Sliver");
    const first = spawn(game, "Muscle Sliver", B);
    const second = spawn(game, "Winged Sliver", B);
    lands(game, "Island", 8);
    cast(game, toHand(game, "Control Magic"), { targets: [ref(first)] });
    cast(game, toHand(game, "Control Magic"), { targets: [ref(second)] });
    expect(game.state.objects[first].controller).toBe(A);
    expect(game.state.objects[second].controller).toBe(A);
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === first || id === second);
    let arranged: readonly ObjectId[] = [];
    b.chooseFromZoneFn = (view, eligible) => {
      const awaiting = view.state.awaiting;
      expect(awaiting?.kind === "choose-from-zone" && awaiting.graveyardInstead?.arrange).toBe(true);
      arranged = eligible;
      return [second, first];
    };
    wrath(game);
    expect([...arranged].sort()).toEqual([first, second].sort());
    expect(library(game, B).slice(0, 2)).toEqual([second, first]);
  });

  it("a Pulmonic Sliver that isn't a Sliver still gives the Slivers dying with it the choice (its ruling)", () => {
    const { game, a } = table();
    const pulmonic = spawn(game, "Pulmonic Sliver");
    const muscle = spawn(game, "Muscle Sliver");
    game.debugApplyEffect(A, { kind: "become", target: 0, loseCreatureTypes: true, duration: "end-of-turn" }, [ref(pulmonic)]);
    settle(game);
    let offered: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return eligible;
    };
    wrath(game);
    expect(offered).toEqual([muscle]);
    expect(zone(game, pulmonic)).toBe("graveyard");
    expect(library(game)[0]).toBe(muscle);
  });

  it("a commander Sliver put on top of its library is then offered the command zone, the wrath still one event", () => {
    const { game, a, b } = table();
    const pulmonic = spawn(game, "Pulmonic Sliver");
    game.state.objects[pulmonic].isCommander = true;
    spawn(game, "Grizzly Bears");
    const chainsaw = spawn(game, "Chainsaw", B);
    bloodArtist(game, b, B, A);
    pickFromZone(a, pulmonic);
    let offered = false;
    a.commanderReplacementFn = () => {
      offered = true;
      return true;
    };
    wrath(game);
    expect(offered).toBe(true);
    expect(zone(game, pulmonic)).toBe("command");
    // Bears and Blood Artist died, in one event.
    expect(counters(game, chainsaw, "rev")).toBe(1);
    expect(life(game, A)).toBe(18);
  });

  it("'dies this way' reads where it went", () => {
    const { game, a } = table();
    spawn(game, "Pulmonic Sliver");
    const muscle = spawn(game, "Muscle Sliver");
    pickFromZone(a, muscle);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Saw in Half"), { targets: [ref(muscle)] });
    expect(library(game)[0]).toBe(muscle);
    // It didn't die: no copies.
    expect(onBattlefield(game, "Muscle Sliver")).toEqual([]);
    const winged = spawn(game, "Winged Sliver");
    pickFromZone(a);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Saw in Half"), { targets: [ref(winged)] });
    expect(zone(game, winged)).toBe("graveyard");
    expect(onBattlefield(game, "Winged Sliver")).toHaveLength(2);
  });
});
