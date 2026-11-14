/**
 * "Whenever a creature deals combat damage to enchanted player" (the
 * `deals-combat-damage-to-player` trigger's `toEnchantedPlayer`) and
 * "creatures attacking enchanted player" (`CardFilter.attackingEnchantedPlayer`):
 * Curse of Hospitality and Curse of Stalked Prey — once per creature (the
 * ruling), whoever controls it, and only for the player the Curse enchants.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, cast, counters, lands, life, ref, spawn, table, toHand, toStep } from "./harness.js";

function curse(game: Game, name: string, player: PlayerId): void {
  lands(game, "Mountain", 3);
  cast(game, toHand(game, name), { targets: [ref(player)] });
}

const exiledFrom = (game: Game, owner: PlayerId) =>
  Object.values(game.state.objects).filter((o) => o.zone === "exile" && o.owner === owner);

describe("Curse of Hospitality", () => {
  it("exiles one card per creature that dealt the enchanted player combat damage, for its controller to play this turn", () => {
    const { game, a } = table({ players: 3 });
    curse(game, "Curse of Hospitality", B);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: wurm, defender: B },
    ];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(12);
    const exiled = exiledFrom(game, B);
    expect(exiled).toHaveLength(2);
    for (const card of exiled) {
      expect(card.playPermission?.player).toBe(A);
      expect(card.playPermission?.spendAs).toBe("any-color");
    }
  });

  it("doesn't trigger on damage to another player", () => {
    const { game, a } = table({ players: 3 });
    curse(game, "Curse of Hospitality", B);
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: C }];
    toStep(game, "postcombat-main");
    expect(life(game, C)).toBe(18);
    expect(exiledFrom(game, C)).toHaveLength(0);
    expect(exiledFrom(game, B)).toHaveLength(0);
  });

  it("gives creatures attacking the enchanted player trample, and no others", () => {
    const { game, a, b, c } = table({ players: 3 });
    curse(game, "Curse of Hospitality", B);
    const wurm = spawn(game, "Craw Wurm");
    const other = spawn(game, "Craw Wurm");
    const bobBears = spawn(game, "Grizzly Bears", B);
    const carolBears = spawn(game, "Grizzly Bears", C);
    a.declareAttackersFn = () => [
      { attacker: wurm, defender: B },
      { attacker: other, defender: C },
    ];
    b.declareBlockersFn = () => [{ blocker: bobBears, attacker: wurm }];
    c.declareBlockersFn = () => [{ blocker: carolBears, attacker: other }];
    toStep(game, "postcombat-main");
    // 6 power, 2 to the 2/2 blocker, 4 tramples over to bob; carol takes none.
    expect(life(game, B)).toBe(16);
    expect(life(game, C)).toBe(20);
  });
});

describe("Curse of Stalked Prey", () => {
  it("puts a +1/+1 counter on each creature that dealt the enchanted player combat damage", () => {
    const { game, a } = table({ players: 3 });
    curse(game, "Curse of Stalked Prey", B);
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm");
    const third = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: wurm, defender: B },
      { attacker: third, defender: C },
    ];
    toStep(game, "postcombat-main");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, wurm)).toBe(1);
    expect(counters(game, third)).toBe(0);
  });
});
