import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  grant,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/**
 * A rules audit (2026-11-17): what the game does with a player who has left
 * it (rules 104.5, 800.4). Rule 800.4e was found missing in a live game; the
 * cases here are the neighbours of that one. A multiplayer game goes on past
 * a player who loses or concedes, and everything that names "each opponent",
 * "that player" or a defending player must then leave them out.
 */
const eventsAt = (game: Game, player: PlayerId, type: string, from = 0) =>
  game.state.eventLog.slice(from).filter((e) => {
    if (e.type !== type) return false;
    if (e.type === "damage-dealt") return e.target.kind === "player" && e.target.player === player;
    return "player" in e && e.player === player;
  });

/** Alice's `attackers` are declared at bob; her priority in that step. */
function declared(game: Game, a: ReturnType<typeof table>["a"], attackers: readonly ObjectId[]): void {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
}

describe("a player who has left the game", () => {
  it("is not an opponent for 'each opponent' damage", () => {
    const { game } = table({ players: 3 });
    game.concede(B);
    const carol = life(game, C);
    const bob = life(game, B);
    game.debugApplyEffect(A, { kind: "damage", amount: 2, who: "each-opponent" });
    settle(game);
    expect(eventsAt(game, B, "damage-dealt")).toHaveLength(0);
    expect(life(game, B)).toBe(bob);
    expect(life(game, C)).toBe(carol - 2);
  });

  it("is not an opponent for 'each opponent loses life'", () => {
    const { game } = table({ players: 3 });
    game.concede(B);
    const carol = life(game, C);
    const bob = life(game, B);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1, who: "each-opponent" });
    settle(game);
    expect(life(game, B)).toBe(bob);
    expect(life(game, C)).toBe(carol - 1);
  });

  it("draws nothing when each player draws", () => {
    const { game } = table({ players: 3 });
    game.concede(B);
    const from = game.state.eventLog.length;
    game.debugApplyEffect(A, { kind: "draw", amount: 1, who: "each-player" });
    settle(game);
    expect(eventsAt(game, B, "card-drawn", from)).toHaveLength(0);
    expect(eventsAt(game, C, "card-drawn", from)).toHaveLength(1);
  });

  it("can't be targeted", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Mountain", 1);
    game.concede(B);
    pickTargets(a, B);
    expect(() => cast(game, toHand(game, "Shock"), { targets: [ref(B)] })).toThrow();
  });

  it("a spell aimed at them before they left does nothing", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const bob = life(game, B);
    game.concede(B);
    settle(game);
    expect(eventsAt(game, B, "damage-dealt")).toHaveLength(0);
    expect(life(game, B)).toBe(bob);
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("can't be attacked", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    game.concede(B);
    const bob = life(game, B);
    try {
      a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
      toStep(game, "postcombat-main");
    } catch {
      // A refused declaration is as good as one that deals nothing.
    }
    expect(eventsAt(game, B, "damage-dealt")).toHaveLength(0);
    expect(life(game, B)).toBe(bob);
  });

  it("an attack already declared at them deals no damage once they leave", () => {
    const { game, a } = table({ players: 3 });
    const angel = spawn(game, "Serra Angel");
    grant(game, angel, "lifelink");
    declared(game, a, [angel]);
    expect(game.state.objects[angel].attacking).toBe(B);
    const mine = life(game, A);
    game.concede(B);
    toStep(game, "postcombat-main");
    expect(eventsAt(game, B, "damage-dealt")).toHaveLength(0);
    expect(life(game, A)).toBe(mine);
    expect(zone(game, angel)).toBe("battlefield");
  });

  it("an attack trigger aimed at the player it attacks does nothing once they leave", () => {
    // Hellrider: "…deals 1 damage to the player or planeswalker it's
    // attacking", on the stack as the defender concedes.
    const { game, a } = table({ players: 3 });
    const rider = spawn(game, "Hellrider");
    grant(game, rider, "lifelink");
    declared(game, a, [rider]);
    expect(game.state.zones.shared.stack.length).toBe(1);
    const mine = life(game, A);
    const bob = life(game, B);
    game.concede(B);
    toStep(game, "postcombat-main");
    expect(eventsAt(game, B, "damage-dealt")).toHaveLength(0);
    expect(life(game, B)).toBe(bob);
    expect(life(game, A)).toBe(mine);
  });

  it("a trampler blocked by their creature deals them nothing once they leave", () => {
    const { game, a, b } = table({ players: 3 });
    const maw = spawn(game, "Colossal Dreadmaw"); // 6/6 trample
    grant(game, maw, "lifelink");
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [{ attacker: maw, defender: B }];
    b.declareBlockersFn = () => [{ blocker: bears, attacker: maw }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === A);
    expect(game.state.objects[maw].blocked).toBe(true);
    const mine = life(game, A);
    game.concede(B);
    toStep(game, "postcombat-main");
    expect(eventsAt(game, B, "damage-dealt")).toHaveLength(0);
    expect(life(game, A)).toBe(mine);
    expect(zone(game, maw)).toBe("battlefield");
  });

  it("takes their Aura off another player's creature, and frees a creature they had taken (rule 800.4a)", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", A);
    nextTurn(game);
    expect(game.state.turnOrder[game.state.turn.activePlayerIndex]).toBe(B);
    lands(game, "Plains", 2, B);
    lands(game, "Island", 4, B);
    cast(game, toHand(game, "Pacifism", B), { player: B, targets: [ref(bears)] });
    const magic = toHand(game, "Control Magic", B);
    cast(game, magic, { player: B, targets: [ref(giant)] });
    expect(game.state.objects[giant].controller).toBe(B);
    game.concede(B);
    settle(game);
    // Control Magic left with its owner: the Giant is Alice's again, and
    // still on the battlefield, as the Bears are, with no Pacifism on them.
    expect(game.state.objects[giant].controller).toBe(A);
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("battlefield");
    const attached = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id]?.attachedTo === bears);
    expect(attached).toHaveLength(0);
  });

  it("puts another player's Aura on their creature into its owner's graveyard", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const pacifism = toHand(game, "Pacifism");
    cast(game, pacifism, { targets: [ref(bears)] });
    expect(game.state.objects[pacifism].attachedTo).toBe(bears);
    game.concede(B);
    settle(game);
    expect(zone(game, pacifism)).toBe("graveyard");
  });

  it("ends 'until this leaves the battlefield' when its owner leaves: the exiled card comes back", () => {
    const { game, b } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", A);
    nextTurn(game);
    lands(game, "Plains", 3, B);
    const priest = toHand(game, "Banisher Priest", B);
    // Its enters trigger takes the target.
    pickTargets(b, bears);
    cast(game, priest, { player: B });
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    game.concede(B);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("makes 'whenever a player loses the game' trigger, conceding included (rule 603.9)", () => {
    const { game } = table({ players: 3 });
    const tyrant = spawn(game, "Blood Tyrant");
    const before = counters(game, tyrant);
    game.concede(B);
    settle(game);
    expect(counters(game, tyrant)).toBe(before + 5);
  });

  it("makes it trigger when life runs out too", () => {
    const { game } = table({ players: 3 });
    const tyrant = spawn(game, "Blood Tyrant");
    const before = counters(game, tyrant);
    lands(game, "Mountain", 1);
    game.state.players[B].life = 2;
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(game.state.players[B].hasLost).toBe(true);
    expect(counters(game, tyrant)).toBe(before + 5);
  });
});
