import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  destroy,
  grant,
  life,
  pickFromZone,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/**
 * A rules audit (2026-11-17): combat rules the engine's source never cited,
 * each asked of the game. They held; the tests keep them holding.
 */
type Seat = ReturnType<typeof table>["a"];

/** Alice's `attackers` at bob, bob's `blocks`, on to alice's priority in the
 * declare blockers step. */
function blocked(
  game: Game,
  a: Seat,
  b: Seat,
  attackers: readonly ObjectId[],
  blocks: readonly { blocker: ObjectId; attacker: ObjectId }[],
): void {
  a.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: B }));
  b.declareBlockersFn = () => [...blocks];
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === A);
}

describe("combat rules, audited", () => {
  it("a blocker tapped after it blocks still deals and takes combat damage (rule 506.4b)", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    blocked(game, a, b, [bears], [{ blocker: giant, attacker: bears }]);
    game.debugApplyEffect(A, { kind: "tap", target: 0 }, [ref(giant)]);
    expect(game.state.objects[giant].tapped).toBe(true);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("an attacker untapped after it attacks is still attacking (rule 506.4b)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(bears)]);
    expect(game.state.objects[bears].tapped).toBe(false);
    const before = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before - 2);
  });

  it("a blocked attacker whose blocker is gone stays blocked and deals no damage (rules 509.1h, 510.1c)", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    blocked(game, a, b, [bears], [{ blocker: giant, attacker: bears }]);
    destroy(game, giant, A);
    const before = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("an attacker that changes controller is removed from combat (rule 506.4)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: true }, [ref(bears)]);
    expect(game.state.objects[bears].controller).toBe(B);
    expect(game.state.objects[bears].attacking).toBe(null);
    const before = life(game, B);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before);
  });

  it("a double-striking trampler whose blocker died to its first strike sends the second all at the player (rule 702.19e)", () => {
    // Colossal Dreadmaw, 6/6 trample, with double strike, blocked by Grizzly
    // Bears: 2 to the Bears and 4 over in the first step; the Bears gone, all
    // 6 at the player in the second.
    const { game, a, b } = table();
    const maw = spawn(game, "Colossal Dreadmaw");
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, maw, "double-strike");
    const before = life(game, B);
    blocked(game, a, b, [maw], [{ blocker: bears, attacker: maw }]);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 4 - 6);
  });

  it("a blocked double striker without trample deals nothing more once its blocker is dead (rule 510.1c)", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, giant, "double-strike");
    const before = life(game, B);
    blocked(game, a, b, [giant], [{ blocker: bears, attacker: giant }]);
    toStep(game, "postcombat-main");
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(before);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("a creature given first strike after the first damage step still deals its damage in the second (rule 510.4)", () => {
    // It had neither first strike nor double strike as the first step began.
    const { game, a } = table();
    const ace = spawn(game, "Fencing Ace"); // double strike: makes a first step
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: ace, defender: B },
      { attacker: bears, defender: B },
    ];
    const before = life(game, B);
    game.advanceUntil(
      (s) => s.turn.step === "combat-damage" && s.awaiting === null && s.priority.holder === A && life(game, B) === before - 1,
    );
    grant(game, bears, "first-strike");
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before - 1 - 1 - 2);
  });

  it("a creature put onto the battlefield attacking a player who has left enters, and isn't attacking (rule 506.3c)", () => {
    // Kaalia of the Vast: "…onto the battlefield tapped and attacking that
    // opponent", her trigger on the stack as that opponent concedes.
    const { game, a } = table({ players: 3 });
    const kaalia = spawn(game, "Kaalia of the Vast");
    const dragon = toHand(game, "Shivan Dragon");
    pickFromZone(a, dragon);
    a.declareAttackersFn = () => [{ attacker: kaalia, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    expect(game.state.zones.shared.stack.length).toBeGreaterThan(0);
    game.concede(B);
    const carol = life(game, C);
    toStep(game, "postcombat-main");
    expect(zone(game, dragon)).toBe("battlefield");
    expect(game.state.objects[dragon].tapped).toBe(true);
    expect(life(game, C)).toBe(carol);
    const hits = game.state.eventLog.filter((e) => e.type === "damage-dealt" && e.combat);
    expect(hits).toHaveLength(0);
  });

  it("a creature put onto the battlefield attacking with no player named goes at one still in the game (rule 508.4)", () => {
    // Hero of Bladehold's Soldiers are "tapped and attacking": their
    // controller says whom. With the player the Hero attacked gone, that is
    // the opponent left, for 2 each with battle cry.
    const { game, a } = table({ players: 3 });
    const hero = spawn(game, "Hero of Bladehold");
    a.declareAttackersFn = () => [{ attacker: hero, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    game.concede(B);
    const carol = life(game, C);
    toStep(game, "postcombat-main");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    expect(life(game, C)).toBe(carol - 4);
  });

  it("a creature put onto the battlefield attacking doesn't trigger 'whenever a creature attacks' (rule 508.2a)", () => {
    // Hero of Bladehold's two Soldiers enter tapped and attacking. Hellrider
    // sees the Hero declared, and not the tokens: 1 from it, then 3 + 2 + 2
    // in combat (battle cry's +1/+0 on each token).
    const { game, a } = table();
    spawn(game, "Hellrider");
    const hero = spawn(game, "Hero of Bladehold");
    a.declareAttackersFn = () => [{ attacker: hero, defender: B }];
    const before = life(game, B);
    toStep(game, "postcombat-main");
    const pings = game.state.eventLog.filter(
      (e) => e.type === "damage-dealt" && !e.combat && e.target.kind === "player" && e.target.player === B,
    );
    expect(pings).toHaveLength(1);
    expect(life(game, B)).toBe(before - 1 - 7);
  });
});
