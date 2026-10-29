/**
 * `damagedThisTurnBy: { source }` — "a creature dealt damage by **this**
 * creature this turn" (Sengir Vampire), "… by **enchanted** creature"
 * (Vampiric Embrace): one source, in the battlefield stint it has now or
 * the one it left in the same event (rules 400.7, 603.10a), as a dies
 * trigger's filter and as a "would die, exile it instead" replacement's
 * (Kumano's Pupils).
 */

import { describe, expect, it } from "vitest";

import { A, B, attack, cast, counters, lands, ref, spawn, table, toHand, zone } from "./harness.js";

describe("dealt damage by this source this turn", () => {
  it("Sengir Vampire grows when a creature it damaged dies, not one another source damaged", () => {
    const { game, a, b } = table();
    const vampire = spawn(game, "Sengir Vampire", A);
    const spider = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: vampire }];
    attack(game, a, [vampire]);
    expect(zone(game, spider)).toBe("graveyard");
    expect(counters(game, vampire)).toBe(1);

    // A creature Shock kills wasn't dealt damage by the Vampire.
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, vampire)).toBe(1);
  });

  it("…the same stint's damage counts, however the creature dies", () => {
    const { game, a, b } = table();
    const vampire = spawn(game, "Sengir Vampire", A);
    const spider = spawn(game, "Acid Web Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: vampire }];
    attack(game, a, [vampire]);
    expect(zone(game, spider)).toBe("battlefield");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(spider)] });
    expect(counters(game, vampire)).toBe(1);
  });

  it("…but not damage from the source's earlier stint on the battlefield (rule 400.7)", () => {
    const { game, a, b } = table();
    const vampire = spawn(game, "Sengir Vampire", A);
    const spider = spawn(game, "Acid Web Spider", B);
    b.declareBlockersFn = () => [{ blocker: spider, attacker: vampire }];
    attack(game, a, [vampire]);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(vampire)] });
    // The Vampire back is a new object: the Spider wasn't damaged by it.
    cast(game, toHand(game, "Murder"), { targets: [ref(spider)] });
    expect(zone(game, spider)).toBe("graveyard");
    expect(zone(game, vampire)).toBe("battlefield");
    expect(counters(game, vampire)).toBe(0);
  });

  it("Kumano's Pupils exiles a creature it damaged that would die", () => {
    const { game, a, b } = table();
    const pupils = spawn(game, "Kumano's Pupils", A);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: pupils }];
    attack(game, a, [pupils]);
    expect(zone(game, bears)).toBe("exile");
  });

  it("Kumano's Pupils leaves alone a creature another source killed", () => {
    const { game } = table();
    spawn(game, "Kumano's Pupils", A);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Vampiric Embrace counts the enchanted creature's damage and grows it", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Vampiric Embrace"), { targets: [ref(bears)] });
    const victim = spawn(game, "Giant Spider", B);
    b.declareBlockersFn = () => [{ blocker: victim, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, victim)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });
});
