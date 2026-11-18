/**
 * Tetsuo, Imperial Champion (top-1000 commander #951): "whenever Tetsuo
 * attacks, if it's equipped, choose one" — damage, or a free instant or
 * sorcery from hand, each sized by the **greatest** mana value among the
 * Equipment attached to it (an aggregate `max` over `wasAttachedTo:
 * "source"`). Bonesplitter (mana value 1) and Loxodon Warhammer (3) together
 * make 3, where a sum would make 4.
 */
import { describe, expect, it } from "vitest";
import type { Action, LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, attack, B, lands, life, pickModes, pickTargets, ref, spawn, table, toHand, zone } from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** Tetsuo with Bonesplitter and Loxodon Warhammer attached by their equip
 * abilities. */
function equippedTetsuo(game: Game): ObjectId {
  const tetsuo = spawn(game, "Tetsuo, Imperial Champion");
  lands(game, "Wastes", 4);
  const equipment = [spawn(game, "Bonesplitter"), spawn(game, "Loxodon Warhammer")];
  for (const e of equipment) activate(game, e, 0, { targets: [ref(tetsuo)] });
  expect(equipment.map((e) => game.state.objects[e].attachedTo)).toEqual([tetsuo, tetsuo]);
  return tetsuo;
}

describe("Tetsuo, Imperial Champion", () => {
  it("deals damage equal to the greatest mana value among its Equipment, not their sum", () => {
    const { game, a } = table();
    const tetsuo = equippedTetsuo(game);
    // Craw Wurm is 6/4: 3 damage leaves it, 4 would kill it.
    const wurm = spawn(game, "Craw Wurm", B);
    pickModes(a, 0);
    pickTargets(a, wurm);
    attack(game, a, [tetsuo]);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });

  it("offers a free instant or sorcery from hand with mana value up to that greatest", () => {
    const { game, a } = table();
    const tetsuo = equippedTetsuo(game);
    const divination = toHand(game, "Divination");
    const concentrate = toHand(game, "Concentrate");
    const bears = toHand(game, "Grizzly Bears");
    let offered: CastNowOffer | undefined;
    a.chooseCastNowFn = (_v, offer): Cast => {
      offered = offer;
      return { type: "cast-spell", player: A, card: divination, targets: [], via: "effect", free: true };
    };
    pickModes(a, 1);
    attack(game, a, [tetsuo]);
    expect(offered?.cards).toContain(divination);
    // Concentrate's mana value is 4; Grizzly Bears is no instant or sorcery.
    expect(offered?.cards).not.toContain(concentrate);
    expect(offered?.cards).not.toContain(bears);
    expect(zone(game, divination)).toBe("graveyard");
  });

  it("doesn't trigger unequipped", () => {
    const { game, a } = table();
    const tetsuo = spawn(game, "Tetsuo, Imperial Champion");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    pickTargets(a, B);
    attack(game, a, [tetsuo]);
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(20 - 3);
  });
});
