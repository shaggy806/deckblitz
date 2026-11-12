/**
 * `add-mana`'s `spellGains.uncounterable` — "if that mana is spent on an
 * instant or sorcery spell, that spell can't be countered" (Boseiju, Who
 * Shelters All): the spell it pays for is stamped as Cavern of Souls' is; a
 * spell of another type isn't.
 */
import { describe, expect, it } from "vitest";

import { B, activate, cast, lands, life, ref, settle, spawn, table, toHand, zone } from "./harness.js";

function boseiju(game: Parameters<typeof spawn>[0]) {
  const land = spawn(game, "Boseiju, Who Shelters All");
  // It entered tapped (its own replacement): a later turn's untap.
  game.state.objects[land].tapped = false;
  activate(game, land, 0);
  return land;
}

describe("Boseiju, Who Shelters All", () => {
  it("costs 2 life; a sorcery its {C} paid for can't be countered", () => {
    const { game } = table();
    lands(game, "Island", 2);
    boseiju(game);
    expect(life(game)).toBe(18);
    const divination = toHand(game, "Divination");
    cast(game, divination, { settle: false });
    expect(game.state.objects[divination].uncounterable).toBe(true);
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(divination)]);
    expect(zone(game, divination)).toBe("stack");
    settle(game);
    expect(zone(game, divination)).toBe("graveyard");
  });

  it("a creature spell it pays for can still be countered", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    boseiju(game);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(game.state.objects[bears].uncounterable).not.toBe(true);
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(bears)]);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
