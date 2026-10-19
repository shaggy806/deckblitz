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

import { DUNGEONS, UNDERCITY } from "../cards/dungeons.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

import { A, B, C, counters, hand, keywords, life, nextTurn, settle, spawn, table, toLibrary } from "./harness.js";

const stackNames = (game: Game): string[] =>
  game.state.zones.shared.stack.map((id) => game.state.objects[id]?.cardName ?? "?");
const roomOf = (game: Game, player: PlayerId): string | undefined => {
  const d = game.state.players[player].dungeon;
  return d === undefined ? undefined : DUNGEONS.get(d.name)?.rooms[d.room]?.name;
};

describe("Undercity's rooms are the printed card's", () => {
  it("every room's name, text and arrows match the Oracle text", () => {
    const data = JSON.parse(
      readFileSync(new URL("../../data/oracle/dungeons.json", import.meta.url), "utf8"),
    ) as { cards: { name: string; faces: { name: string; oracle_text: string }[] }[] };
    const face = data.cards.flatMap((c) => c.faces).find((f) => f.name === UNDERCITY)!;
    const lines = face.oracle_text.split("\n").filter((l) => l.includes(" — "));
    const dungeon = DUNGEONS.get(UNDERCITY)!;
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
