/**
 * B338, combat-targeting lane: Strax, Sontaran Nurse — "choose a player at
 * random. When you do, Strax fights another target creature that player
 * controls": `reflexive-trigger`'s `player`, the reflexive ability's trigger
 * player, so its `whose: "trigger-player"` slot is the chosen player's
 * (603.12). Strax's controller chooses which creature (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, counters, lands, spawn, table, watchTargets, zone } from "./harness.js";

describe("Strax, Sontaran Nurse", () => {
  /** Activates Grenades! and returns who was chosen at random and what the
   * reflexive ability offered. */
  function grenades(seed: number): { chosen: PlayerId; offered: readonly ObjectId[]; mine: ObjectId[]; theirs: ObjectId[]; strax: ObjectId } {
    const { game, a } = table({ seed });
    const strax = spawn(game, "Strax, Sontaran Nurse");
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Llanowar Elves")];
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    const relic = spawn(game, "Ornithopter");
    lands(game, "Mountain", 2);
    const seen = watchTargets(a, (offered) => [offered[0][0]]);
    const since = game.state.eventLog.length;
    activate(game, strax, 0, { sacrifice: relic });
    const pick = game.state.eventLog.slice(since).find((e) => e.type === "chosen-at-random");
    if (pick?.type !== "chosen-at-random" || pick.chosen.kind !== "player") throw new Error("no player chosen at random");
    expect(seen.asked).toBe(1);
    expect(zone(game, relic)).toBe("graveyard");
    return { chosen: pick.chosen.player, offered: seen.offered[0] as ObjectId[], mine, theirs, strax };
  }

  it("fights another creature the randomly chosen player controls, chosen by Strax's controller", () => {
    const seen = new Set<PlayerId>();
    for (let seed = 1; seed <= 12 && seen.size < 2; seed++) {
      const { chosen, offered, mine, theirs, strax } = grenades(seed);
      seen.add(chosen);
      // Strax itself is never offered: "another target creature".
      expect([...offered].sort()).toEqual([...(chosen === A ? mine : theirs)].sort());
      expect(offered).not.toContain(strax);
    }
    expect(seen.size).toBe(2);
  });

  it("gets a +1/+1 counter for the damage it deals in the fight", () => {
    for (let seed = 1; seed <= 12; seed++) {
      const { game, a } = table({ seed });
      const strax = spawn(game, "Strax, Sontaran Nurse");
      const bears = spawn(game, "Grizzly Bears", B);
      spawn(game, "Hill Giant", B);
      const relic = spawn(game, "Ornithopter");
      lands(game, "Mountain", 2);
      watchTargets(a, (offered) => [offered[0].includes(bears) ? bears : offered[0][0]]);
      activate(game, strax, 0, { sacrifice: relic });
      if (zone(game, bears) !== "graveyard") continue;
      expect(counters(game, strax)).toBe(1);
      return;
    }
    throw new Error("Bob was never chosen");
  });
});
