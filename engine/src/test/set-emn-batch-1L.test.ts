/** Batch 147's lead-authored cards (Conspiracy: Take the Crown, Eldritch
 * Moon): Custodi Soulcaller, on melee's count of the players attacked this
 * combat; and the "as long as this creature is monstrous" cards, on the
 * `monstrous` filter clause (rule 701.37b). */
import { describe, expect, it } from "vitest";

import { activate, B, C, counters, keywords, lands, pickTargets, spawn, table, toGraveyard, zone } from "./harness.js";

describe("Custodi Soulcaller", () => {
  it("returns a creature card with mana value up to the number of players attacked", () => {
    const g = table({ players: 3 });
    const { game, a } = g;
    const soulcaller = spawn(game, "Custodi Soulcaller");
    const bears = spawn(game, "Grizzly Bears");
    const twoDrop = toGraveyard(game, "Grizzly Bears");
    const fourDrop = toGraveyard(game, "Hill Giant");
    a.declareAttackersFn = () => [
      { attacker: soulcaller, defender: B },
      { attacker: bears, defender: C },
    ];
    pickTargets(a, twoDrop);
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(zone(game, twoDrop)).toBe("battlefield");
    expect(zone(game, fourDrop)).toBe("graveyard");
  });
});

describe("monstrous", () => {
  it("Sinuous Vermin has menace only once it's monstrous", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const vermin = spawn(game, "Sinuous Vermin");
    expect(keywords(game, vermin).has("menace")).toBe(false);
    activate(game, vermin, 0);
    expect(counters(game, vermin)).toBe(3);
    expect(keywords(game, vermin).has("menace")).toBe(true);
  });

  it("Domesticated Hydra's monstrosity X puts X counters on it, and it gains trample", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const hydra = spawn(game, "Domesticated Hydra");
    activate(game, hydra, 0, { x: 2 });
    expect(counters(game, hydra)).toBe(2);
    expect(keywords(game, hydra).has("trample")).toBe(true);
  });
});
