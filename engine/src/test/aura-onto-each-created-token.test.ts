/**
 * "For each of those tokens, you may put an Aura card from your hand and/or
 * graveyard onto the battlefield attached to it": a `for-each-permanent` over
 * the tokens created this way (`thisWay: "created"`), each one's turn a `may`
 * around `return-from-graveyard` `from: "hand-or-graveyard"` attached to its
 * slot. No engine code.
 *
 * Proving card: Liberated Livestock.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { cast, lands, named, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type Cards = { strength: ObjectId; rancor: ObjectId; growth: ObjectId };

/** Livestock dies with Holy Strength and Wild Growth in hand and Rancor in
 * the graveyard; `yes` answers each token's "may" in turn, `picks` the Aura
 * chosen each time. */
const dying = (yes: readonly boolean[], picks: (cards: Cards) => readonly ObjectId[]) => {
  const { game, a } = table();
  const livestock = spawn(game, "Liberated Livestock");
  const cards = { strength: toHand(game, "Holy Strength"), rancor: toGraveyard(game, "Rancor"), growth: toHand(game, "Wild Growth") };
  const answers = [...yes];
  a.chooseModesFn = () => (answers.shift() === true ? [0] : []);
  const order = picks(cards);
  const offered: (readonly ObjectId[])[] = [];
  a.chooseFromZoneFn = (_view, eligible) => {
    offered.push(eligible);
    const next = order[offered.length - 1];
    return next !== undefined ? [next] : [];
  };
  lands(game, "Swamp", 2);
  cast(game, toHand(game, "Doom Blade"), { targets: [ref(livestock)] });
  const tokens = [...named(game, "Lifelink Cat Token"), ...named(game, "Bird Token"), ...named(game, "Ox Token (Ox Drover)")];
  return { game, livestock, ...cards, offered, tokens };
};

const attachedTo = (game: ReturnType<typeof table>["game"], id: ObjectId) => game.state.objects[id]!.attachedTo ?? null;

describe("Liberated Livestock", () => {
  it("makes a Cat, a Bird and an Ox, and an Aura from hand or graveyard goes onto each of the first two", () => {
    const { game, livestock, strength, rancor, growth, offered, tokens } = dying([true, true, false], (c) => [c.strength, c.rancor]);
    expect(zone(game, livestock)).toBe("graveyard");
    expect(tokens).toHaveLength(3);
    // The Auras of both zones that could enchant it are offered.
    expect([...offered[0]!].sort()).toEqual([strength, rancor].sort());
    expect(zone(game, strength)).toBe("battlefield");
    expect(zone(game, rancor)).toBe("battlefield");
    const hosts = [attachedTo(game, strength), attachedTo(game, rancor)];
    expect(new Set(hosts).size).toBe(2);
    for (const host of hosts) expect(tokens).toContain(host);
    // The third token's "may" was declined: nothing more was offered.
    expect(offered).toHaveLength(2);
    expect(zone(game, growth)).toBe("hand");
  });

  it("an Aura that can't enchant the token isn't offered, and stays where it was (303.4i)", () => {
    const { game, growth, offered, tokens } = dying([true, false, false], (c) => [c.strength]);
    expect(tokens).toHaveLength(3);
    expect(offered[0]).not.toContain(growth);
    expect(zone(game, growth)).toBe("hand");
  });
});
