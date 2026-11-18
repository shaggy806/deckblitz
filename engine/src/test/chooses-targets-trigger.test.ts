/**
 * "Whenever a player chooses one or more targets" (Psychic Battle): the
 * `"chooses-targets"` trigger event — once for a spell or ability cast,
 * activated or put on the stack with a target chosen, or whose targets are
 * changed (rule 115.7), its trigger object that spell or ability — and the
 * revealed-card contest (`exile-top-contest` `reveal`): the single greatest
 * mana value's player may choose new targets; a tie changes nothing. The
 * change it makes doesn't trigger a Psychic Battle (`unseenByNamesake`).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, cast, enter, lands, life, ref, spawn, table, toHand, toLibrary, watchTargets } from "./harness.js";

// The table's libraries are Wastes (mana value 0): a Hill Giant (4) on top
// wins the contest.

describe("Psychic Battle", () => {
  it("the player who reveals the greatest mana value may change the spell's target, once", () => {
    const { game, b } = table({ players: 3 });
    spawn(game, "Psychic Battle");
    lands(game, "Mountain", 1);
    toLibrary(game, "Hill Giant", B);
    const bolt = toHand(game, "Lightning Bolt");
    const seen = watchTargets(b, () => [A]);
    cast(game, bolt, { targets: [ref(B)] });
    // Asked once: the change made this way doesn't trigger it again.
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(A);
    expect(seen.offered[0]).toContain(C);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(17);
  });

  it("a tie for greatest changes nothing, and nobody is asked", () => {
    const { game, b } = table();
    spawn(game, "Psychic Battle");
    lands(game, "Mountain", 1);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Hill Giant", B);
    const bolt = toHand(game, "Lightning Bolt");
    const seen = watchTargets(b, () => [A]);
    cast(game, bolt, { targets: [ref(B)] });
    expect(seen.asked).toBe(0);
    expect(life(game, B)).toBe(17);
  });

  it("the winner may keep the targets as they are", () => {
    const { game, a } = table();
    spawn(game, "Psychic Battle");
    lands(game, "Mountain", 1);
    toLibrary(game, "Hill Giant", A);
    const bolt = toHand(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [B]);
    cast(game, bolt, { targets: [ref(B)] });
    expect(seen.asked).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("an activated ability's target sets it off too", () => {
    const { game, b } = table();
    spawn(game, "Psychic Battle", B);
    toLibrary(game, "Hill Giant", B);
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    const seen = watchTargets(b, () => [A]);
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    expect(seen.asked).toBe(1);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(20);
  });

  it("so does a triggered ability's", () => {
    const { game, a, b } = table();
    spawn(game, "Psychic Battle", B);
    toLibrary(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    let kavu: ObjectId | PlayerId | undefined;
    const seen = watchTargets(b, (offered) => {
      kavu = offered[0].find((id) => id !== bears);
      return [kavu ?? bears];
    });
    const id = enter(game, "Flametongue Kavu");
    expect(seen.asked).toBe(1);
    expect(kavu).toBe(id);
    // Four damage to the Kavu itself, not the Bears.
    expect(game.state.objects[id].zone).toBe("graveyard");
    expect(game.state.objects[bears].zone).toBe("battlefield");
  });

  it("another card's change of targets sets it off", () => {
    const { game, b } = table();
    const battle = spawn(game, "Psychic Battle");
    lands(game, "Mountain", 1);
    lands(game, "Island", 2, B);
    const bolt = toHand(game, "Lightning Bolt");
    const redirect = toHand(game, "Redirect", B);
    // Every top card is a Wastes: each contest is a tie, and changes nothing.
    const triggers = (): number =>
      game.state.eventLog.filter((e) => e.type === "ability-triggered" && e.source === battle).length;
    cast(game, bolt, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.priority.holder === B);
    watchTargets(b, () => [A]);
    cast(game, redirect, { player: B, targets: [ref(bolt)] });
    // The Bolt cast, the Redirect cast, and the Redirect's change.
    expect(triggers()).toBe(3);
    expect(life(game, A)).toBe(17);
  });

  it("a spell with no targets doesn't set it off", () => {
    const { game, a, b } = table();
    spawn(game, "Psychic Battle");
    toLibrary(game, "Hill Giant", B);
    lands(game, "Island", 1);
    const opt = toHand(game, "Opt");
    let asked = 0;
    b.chooseTargetsFn = () => {
      asked += 1;
      return [];
    };
    a.chooseModesFn = () => [];
    cast(game, opt);
    expect(asked).toBe(0);
  });
});
