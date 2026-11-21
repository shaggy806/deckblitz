/**
 * "+1/+1 for each point of bushido it has" (Takeno, Samurai General):
 * `grantPtPerCount.ofAffected: "bushido"`, read off the abilities stamped
 * `keywordOf: "bushido"` (rule 702.45a-b).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, lands, pt, ref, spawn, subtypes, table, toStep } from "./harness.js";

describe("Takeno, Samurai General", () => {
  it("gives each other Samurai you control +1/+1 per point of bushido, not itself or an opponent's", () => {
    const { game } = table();
    const takeno = spawn(game, "Takeno, Samurai General");
    const ronin = spawn(game, "Battle-Mad Ronin"); // 1/1, bushido 2, written longhand
    // 1/2, bushido 1 (the helper); +1/+2 of its own with Takeno, a legendary Samurai.
    const hatamoto = spawn(game, "Konda's Hatamoto");
    const theirs = spawn(game, "Battle-Mad Ronin", B);
    expect(pt(game, takeno)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, ronin)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, hatamoto)).toEqual({ power: 3, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
  });

  it("gives nothing to a Samurai with no bushido, or one that lost its abilities", () => {
    const { game } = table();
    spawn(game, "Takeno, Samurai General");
    const ronin = spawn(game, "Battle-Mad Ronin");
    game.debugApplyEffect(A, { kind: "become", loseAbilities: true, target: 0, duration: "end-of-turn" }, [ref(ronin)]);
    expect(pt(game, ronin)).toEqual({ power: 1, toughness: 1 });
  });

  it("counts every instance: a Samurai trained by Sensei Golden-Tail has its own bushido and the granted one", () => {
    const { game } = table();
    spawn(game, "Takeno, Samurai General");
    const sensei = spawn(game, "Sensei Golden-Tail"); // 2/1, bushido 1
    const bears = spawn(game, "Grizzly Bears");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    lands(game, "Plains", 2);
    activate(game, sensei, 0, { targets: [ref(bears)] });
    expect(subtypes(game, bears)).toContain("Samurai");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    // The Sensei: its own bushido 1.
    expect(pt(game, sensei)).toEqual({ power: 3, toughness: 2 });
  });

  it("reads Fumiko the Lowblood's bushido X live: the number of attacking creatures", () => {
    const { game, a } = table();
    spawn(game, "Takeno, Samurai General");
    const fumiko = spawn(game, "Fumiko the Lowblood"); // 3/2
    expect(pt(game, fumiko)).toEqual({ power: 3, toughness: 2 });
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    a.declareAttackersFn = () => bears.map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    expect(pt(game, fumiko)).toEqual({ power: 5, toughness: 4 });
  });
});
