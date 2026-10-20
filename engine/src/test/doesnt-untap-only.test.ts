/**
 * "Target creature doesn't untap during its controller's next untap step" with no "tap it" — the
 * `tap` effect's `onlyDoesntUntap`: an untapped creature stays untapped; a tapped one skips its
 * next untap. Barl's Cage, Kefnet's Monument, Stitcher's Graft, Skyline Cascade.
 */
import { describe, expect, it } from "vitest";

import { B, activate, attack, cast, enter, lands, nextTurn, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

describe("doesn't untap, alone", () => {
  it("Barl's Cage: an untapped creature isn't tapped; a tapped one stays tapped through its untap step", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const cage = spawn(game, "Barl's Cage");
    const awake = spawn(game, "Grizzly Bears", B);
    const asleep = spawn(game, "Hill Giant", B, { tapped: true });
    activate(game, cage, 0, { targets: [ref(awake)] });
    expect(game.state.objects[awake].tapped).toBe(false);
    activate(game, cage, 0, { targets: [ref(asleep)] });
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    expect(game.state.objects[asleep].tapped).toBe(true);
  });

  it("Kefnet's Monument: a blue creature costs {1} less, and its cast keeps an opponent's creature down", () => {
    const { game, a } = table();
    spawn(game, "Kefnet's Monument");
    lands(game, "Island", 1);
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    // Coral Merfolk costs {1}{U}: one Island pays it with the reduction.
    const merfolk = toHand(game, "Coral Merfolk");
    a.chooseTargetsFn = () => [ref(giant)];
    cast(game, merfolk);
    expect(game.state.objects[merfolk].zone).toBe("battlefield");
    nextTurn(game);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("Stitcher's Graft: the attacker skips its next untap", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const graft = spawn(game, "Stitcher's Graft");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, graft, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(game.state.players[B].life).toBe(15);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.activePlayerIndex).toBe(0);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("Skyline Cascade enters tapped and keeps an opponent's creature down", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    a.chooseTargetsFn = () => [ref(giant)];
    const cascade = enter(game, "Skyline Cascade");
    settle(game);
    expect(game.state.objects[cascade].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("Tangle: no combat damage, and every attacker skips its next untap, none tapped by it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const knight = spawn(game, "Serra Angel");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: knight, defender: B },
    ];
    toStep(game, "declare-blockers");
    game.debugApplyEffect(B, {
      kind: "sequence",
      effects: [
        { kind: "prevent-all-combat-damage" },
        { kind: "tap-all", filter: { type: "creature", attacking: true }, doesntUntapNext: true, onlyDoesntUntap: true },
      ],
    });
    toStep(game, "postcombat-main");
    expect(game.state.players[B].life).toBe(20);
    // Serra Angel has vigilance: still untapped, but it won't untap next time either.
    expect(game.state.objects[knight].tapped).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
