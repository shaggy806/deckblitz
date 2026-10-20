/**
 * Dungeons (rule 309), venturing (701.49) and the initiative (726): Undercity's rooms pinned
 * against the printed card (`data/oracle/dungeons.json`); taking the initiative enters Undercity
 * and fires Secret Entrance; the holder's upkeep ventures on, asking at a fork; combat damage
 * to the holder passes it on; the bottommost room completes the dungeon (309.6, 701.49c);
 * retaking it ventures again (726.5); a holder leaving passes it on (726.4); Throne of the Dead
 * Three's creature enters with three +1/+1 counters and hexproof.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { DUNGEONS, UNDERCITY, dungeonMap } from "../cards/dungeons.js";
import { HeuristicBotController } from "../controller.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  counters,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pt,
  settle,
  spawn,
  supertypes,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const stackNames = (game: Game): string[] =>
  game.state.zones.shared.stack.map((id) => game.state.objects[id]?.cardName ?? "?");
const roomOf = (game: Game, player: PlayerId): string | undefined => {
  const d = game.state.players[player].dungeon;
  return d === undefined ? undefined : DUNGEONS.get(d.name)?.rooms[d.room]?.name;
};

const FORGOTTEN_REALMS = ["Lost Mine of Phandelver", "Dungeon of the Mad Mage", "Tomb of Annihilation"];

describe("every dungeon's rooms are the printed card's", () => {
  const data = JSON.parse(
    readFileSync(new URL("../../data/oracle/dungeons.json", import.meta.url), "utf8"),
  ) as { cards: { name: string; faces: { name: string; oracle_text: string }[] }[] };
  it.each([...FORGOTTEN_REALMS, UNDERCITY])("%s: every room's name, text and arrows match the Oracle text", (name) => {
    const face = data.cards.flatMap((c) => c.faces).find((f) => f.name === name)!;
    const lines = face.oracle_text.split("\n").filter((l) => l.includes(" — "));
    const dungeon = DUNGEONS.get(name)!;
    expect(dungeon.rooms.map((r) => r.name)).toEqual(lines.map((l) => l.split(" — ")[0]));
    for (const [i, room] of dungeon.rooms.entries()) {
      const leads = room.next.map((n) => dungeon.rooms[n]!.name).join(", ");
      expect(`${room.name} — ${room.text}${leads === "" ? "" : ` (Leads to: ${leads})`}`).toBe(lines[i]);
    }
  });
});

describe("the initiative (rule 726)", () => {
  it("taking it enters Undercity, and Secret Entrance's ability goes on the stack", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "take-initiative" });
    expect(game.state.initiative).toBe(A);
    // The take trigger ventures; the venture enters Undercity; the room triggers.
    settle(game);
    expect(game.state.players[A].dungeon?.name).toBe(UNDERCITY);
    expect(roomOf(game, A)).toBe("Secret Entrance");
    expect(game.state.eventLog.some((e) => e.type === "ventured" && e.player === A && e.entered)).toBe(true);
  });

  it("the holder's upkeep ventures on, and a fork asks which room", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "take-initiative" });
    settle(game);
    const offered: number[][] = [];
    a.chooseVentureFn = (_view, offer) => {
      offered.push([...(offer.rooms ?? [])]);
      return { room: 2 };
    };
    nextTurn(game);
    nextTurn(game, "upkeep");
    settle(game);
    expect(offered).toEqual([[1, 2]]);
    expect(roomOf(game, A)).toBe("Lost Well");
  });

  it("Forge puts two +1/+1 counters on its target", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "take-initiative" });
    settle(game);
    a.chooseVentureFn = () => ({ room: 1 });
    a.chooseTargetsFn = () => [{ kind: "object", object: bears }];
    game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
    settle(game);
    expect(roomOf(game, A)).toBe("Forge");
    expect(counters(game, bears)).toBe(2);
  });

  it("combat damage to the holder passes it to the attacker's controller, who ventures", () => {
    const { game, b } = table();
    game.debugApplyEffect(A, { kind: "take-initiative" });
    settle(game);
    const raider = spawn(game, "Grizzly Bears", B);
    b.declareAttackersFn = () => [{ attacker: raider, defender: A }];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
    // Still Alice's until the ability resolves.
    expect(stackNames(game)).toEqual(["The Initiative"]);
    expect(game.state.initiative).toBe(A);
    settle(game);
    expect(game.state.initiative).toBe(B);
    expect(game.state.players[B].dungeon?.name).toBe(UNDERCITY);
    expect(roomOf(game, B)).toBe("Secret Entrance");
  });

  it("taking it again while you have it ventures again (726.5)", () => {
    const { game } = table();
    game.debugApplyEffect(A, { kind: "take-initiative" });
    settle(game);
    game.debugApplyEffect(A, { kind: "take-initiative" });
    settle(game);
    expect(game.state.initiative).toBe(A);
    expect(game.state.eventLog.filter((e) => e.type === "ventured" && e.player === A)).toHaveLength(2);
  });

  it("passes to the active player when its holder leaves the game, who ventures (726.4)", () => {
    const { game } = table({ players: 3 });
    game.debugApplyEffect(C, { kind: "take-initiative" });
    settle(game);
    game.state.players[C].life = 0;
    // A state-based check (as player-leaves-game.test.ts runs one).
    (game as unknown as { prepareForPriority(player: PlayerId): void }).prepareForPriority(A);
    settle(game);
    expect(game.state.players[C].hasLost).toBe(true);
    expect(game.state.initiative).toBe(A);
    expect(game.state.players[A].dungeon?.name).toBe(UNDERCITY);
  });
});

describe("completing a dungeon (rules 309.6, 309.7, 701.49c)", () => {
  it("the bottommost room's ability resolves, then the dungeon is completed; venturing again re-enters", () => {
    const { game, a } = table();
    // Secret Entrance → Lost Well → Stash → Catacombs → Throne: no draw or target on the way.
    a.chooseVentureFn = (_view, offer) => ({ room: [2, 5, 7].find((r) => offer.rooms?.includes(r)) ?? offer.rooms![0]! });
    for (let i = 0; i < 12; i += 1) toLibrary(game, "Island");
    game.debugApplyEffect(A, { kind: "take-initiative" });
    settle(game);
    for (let i = 0; i < 3; i += 1) {
      game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
      settle(game);
    }
    // On top now — Secret Entrance's search shuffled the library.
    const giant = toLibrary(game, "Craw Wurm");
    game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
    settle(game);
    // Throne of the Dead Three resolved: the Wurm is out with three counters and hexproof.
    expect(game.state.objects[giant]?.zone).toBe("battlefield");
    expect(counters(game, giant)).toBe(3);
    expect(keywords(game, giant).has("hexproof")).toBe(true);
    // …and the state-based action completed Undercity once its ability left the stack.
    expect(game.state.players[A].dungeon).toBeUndefined();
    expect(game.state.players[A].completedDungeons).toEqual([UNDERCITY]);
    game.debugApplyEffect(A, { kind: "venture", into: "undercity" });
    settle(game);
    expect(roomOf(game, A)).toBe("Secret Entrance");
    expect(hand(game, A).length).toBeGreaterThanOrEqual(0);
    expect(life(game, A)).toBe(20);
  });
});

describe("a bot's venture (rule 701.49)", () => {
  const fork = { from: 0, rooms: [1, 2], maps: [dungeonMap(UNDERCITY)!] };
  const choose = (game: Game, offer: Parameters<HeuristicBotController["chooseVenture"]>[1]) =>
    new HeuristicBotController(A).chooseVenture({ state: game.state, player: A, legalActions: () => [] }, offer);

  it("takes Forge when it has a creature to grow", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    expect(choose(game, fork)).toEqual({ room: 1 });
  });

  it("takes Lost Well when Forge would have no target", () => {
    const { game } = table();
    expect(choose(game, fork)).toEqual({ room: 2 });
  });
});

/** Venture (into the dungeon, not Undercity) once, choosing `dungeon` if one
 * is asked and the first room of `path` that a fork offers. */
function ventureTo(game: Game, seat: ScriptedController, dungeon: string, path: readonly number[], times = 1): void {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined
      ? { dungeon }
      : { room: path.find((r) => offer.rooms?.includes(r)) ?? offer.rooms![0]! };
  for (let i = 0; i < times; i += 1) {
    game.debugApplyEffect(A, { kind: "venture" });
    settle(game);
  }
}

describe("the Forgotten Realms dungeons (rule 701.49a)", () => {
  it("a plain venture offers the three Forgotten Realms dungeons, never Undercity", () => {
    const { game, a } = table();
    const offered: (readonly string[])[] = [];
    a.chooseVentureFn = (_view, offer) => {
      offered.push(offer.dungeons ?? []);
      return { dungeon: "Lost Mine of Phandelver" };
    };
    game.debugApplyEffect(A, { kind: "venture" });
    settle(game);
    expect(offered).toEqual([FORGOTTEN_REALMS]);
    expect(roomOf(game, A)).toBe("Cave Entrance");
  });

  it("Lost Mine of Phandelver: Goblin Lair, Dark Pool and Temple of Dumathoin, then it's completed", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Island");
    const before = hand(game, A).length;
    ventureTo(game, a, "Lost Mine of Phandelver", [1, 4], 4);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
    expect(hand(game, A)).toHaveLength(before + 1);
    expect(game.state.players[A].completedDungeons).toEqual(["Lost Mine of Phandelver"]);
  });

  it("Mad Wizard's Lair: draws three, reveals them, and one may be cast without paying its mana cost", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Island");
    // Goblin Bazaar and Muiral's Graveyard on the way: no targets.
    ventureTo(game, a, "Dungeon of the Mad Mage", [2, 6], 6);
    expect(roomOf(game, A)).toBe("Deep Mines");
    expect(tokensNamed(game, "Skeleton Token", A)).toBe(2);
    const giant = toLibrary(game, "Hill Giant");
    const bears = toLibrary(game, "Grizzly Bears");
    const island = toLibrary(game, "Island");
    const offered: (readonly ObjectId[])[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offered.push(offer.cards);
      const way = offer.casts.find((c) => c.card === giant)!;
      return { type: "cast-spell", player: A, card: giant, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    a.chooseScryFn = () => [];
    ventureTo(game, a, "Dungeon of the Mad Mage", []);
    // All three revealed to everyone (rule 701.16); the land can't be cast,
    // so it isn't offered.
    expect(game.state.revealedThisTurn).toEqual(expect.arrayContaining([giant, bears, island]));
    expect(offered).toHaveLength(1);
    expect([...offered[0]!].sort()).toEqual([giant, bears].sort());
    expect(zone(game, giant)).toBe("battlefield");
    expect(hand(game, A)).toEqual(expect.arrayContaining([bears, island]));
    expect(game.state.players[A].completedDungeons).toEqual(["Dungeon of the Mad Mage"]);
  });

  it("Runestone Caverns: the two exiled cards stay playable on a later turn", () => {
    const { game, a } = table();
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Island");
    ventureTo(game, a, "Dungeon of the Mad Mage", [2, 5], 4);
    const bears = toLibrary(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest");
    ventureTo(game, a, "Dungeon of the Mad Mage", [5]);
    expect(roomOf(game, A)).toBe("Runestone Caverns");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, forest)).toBe("exile");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.number).toBe(3);
    expect(game.legalActions(A).some((x) => x.kind === "play-land" && x.card === forest)).toBe(true);
  });

  it("Tomb of Annihilation: Trapped Entry, Oubliette, then The Atropal", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const thopter = spawn(game, "Ornithopter");
    const [island] = lands(game, "Island", 2);
    const card = toHand(game, "Hill Giant");
    a.chooseDiscardsFn = () => [card];
    const asked: (readonly ObjectId[])[] = [];
    const stillThere: string[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      asked.push(eligible);
      stillThere.push(zone(game, bears), zone(game, thopter));
      return [eligible.includes(island!) ? island! : eligible[0]!];
    };
    ventureTo(game, a, "Tomb of Annihilation", [3], 2);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    expect(roomOf(game, A)).toBe("Oubliette");
    // The Ornithopter is the only artifact, so it isn't offered as the
    // creature: the Bears go as the creature, it as the artifact, and only
    // the land is a choice.
    expect(asked).toHaveLength(1);
    expect(asked[0]).toHaveLength(2);
    expect(zone(game, card)).toBe("graveyard");
    for (const id of [bears, thopter, island!]) expect(zone(game, id)).toBe("graveyard");
    // Sacrificed at once (rule 603.10a): the creature and the artifact were
    // still on the battlefield while the land was chosen.
    expect(stillThere).toEqual(["battlefield", "battlefield"]);
    expect(game.state.eventLog.filter((e) => e.type === "permanent-sacrificed")).toHaveLength(3);
    ventureTo(game, a, "Tomb of Annihilation", []);
    const [atropal] = named(game, "The Atropal", A);
    expect(supertypes(game, atropal!)).toContain("legendary");
    expect(pt(game, atropal!)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, atropal!).has("deathtouch")).toBe(true);
  });

  it("Oubliette: one artifact creature never counts as both the creature and the artifact", () => {
    const { game, a } = table();
    const thopter = spawn(game, "Ornithopter");
    const island = lands(game, "Island", 1)[0]!;
    ventureTo(game, a, "Tomb of Annihilation", [3], 2);
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, island)).toBe("graveyard");
    expect(game.state.eventLog.filter((e) => e.type === "permanent-sacrificed")).toHaveLength(2);
  });

  it("Veils of Fear: each player who doesn't discard a card loses 2 life", () => {
    const { game, a } = table();
    toHand(game, "Hill Giant", A);
    // Alice discards; Bob declines (the scripted default).
    a.chooseModesFn = () => [0];
    ventureTo(game, a, "Tomb of Annihilation", [1], 2);
    expect(roomOf(game, A)).toBe("Veils of Fear");
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(17);
  });
});
