/**
 * "Prevent all damage that would be dealt to a creature by another creature
 * if they share a color" (Well-Laid Plans): a `would-deal-damage` prevention
 * with `sharesColorWithRecipient` (rule 615), each read as the damage would
 * be dealt.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { B, attack, cast, lands, life, nextTurn, ref, spawn, table, toHand, zone } from "./harness.js";

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Well-Laid Plans", () => {
  it("prevents combat damage between creatures that share a color, both ways", () => {
    const { game, a, b } = table();
    spawn(game, "Well-Laid Plans", B);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    nextTurn(game);
    b.declareBlockersFn = () => [{ blocker: theirs, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, theirs)).toBe("battlefield");
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, theirs)).toBe(0);
  });

  it("lets damage between creatures of different colors through", () => {
    const { game, a, b } = table();
    spawn(game, "Well-Laid Plans");
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions", B);
    nextTurn(game);
    nextTurn(game);
    b.declareBlockersFn = () => [{ blocker: lions, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, lions)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("prevents nothing a creature deals to a player, nor a noncreature source's", () => {
    const { game, a } = table();
    spawn(game, "Well-Laid Plans");
    const goblin = spawn(game, "Raging Goblin");
    const theirs = spawn(game, "Raging Goblin", B);
    attack(game, a, [goblin]);
    expect(life(game, B)).toBe(19);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
