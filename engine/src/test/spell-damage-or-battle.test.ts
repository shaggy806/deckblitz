/**
 * "Whenever an instant or sorcery spell you control deals damage to an
 * opponent **or battle**" — `deals-damage`'s `orBattle`: a battle the spell
 * damages is a recipient as an opponent is, whoever protects it. Bloodfeather
 * Phoenix's return works only from the graveyard (rule 113.6k), and it gains
 * haste once back.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, keywords, lands, pickModes, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

const PHOENIX = "Bloodfeather Phoenix";

/** Alice casts Invasion of Lorwyn: a battle bob protects (two players). */
function invade(game: Game): ObjectId {
  lands(game, "Swamp", 3);
  lands(game, "Forest", 3);
  const battle = toHand(game, "Invasion of Lorwyn");
  cast(game, battle);
  return battle;
}

describe("Bloodfeather Phoenix", () => {
  it("an instant dealing damage to an opponent: pay {R} and it returns with haste", () => {
    const { game, a } = table();
    const phoenix = toGraveyard(game, PHOENIX);
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    expect(game.state.players[B].life).toBe(17);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(keywords(game, phoenix).has("haste")).toBe(true);
  });

  it("declined, it stays in the graveyard", () => {
    const { game, a } = table();
    const phoenix = toGraveyard(game, PHOENIX);
    lands(game, "Mountain", 2);
    pickModes(a);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    expect(zone(game, phoenix)).toBe("graveyard");
  });

  it("damage to a battle counts", () => {
    const { game, a } = table();
    const battle = invade(game);
    const phoenix = toGraveyard(game, PHOENIX);
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(battle)] });
    expect(zone(game, phoenix)).toBe("battlefield");
  });

  it("damage to a creature, or to yourself, doesn't", () => {
    const { game, a } = table();
    const phoenix = toGraveyard(game, PHOENIX);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bear)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: A }] });
    expect(zone(game, phoenix)).toBe("graveyard");
  });

  it("on the battlefield it doesn't trigger: nothing is paid", () => {
    const { game, a } = table();
    spawn(game, PHOENIX);
    const mountains = lands(game, "Mountain", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "player", player: B }] });
    expect(mountains.filter((id) => game.state.objects[id]?.tapped === true)).toHaveLength(1);
  });
});
