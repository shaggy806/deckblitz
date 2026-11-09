/**
 * Rule 712.14a: a double-faced card put onto the battlefield transformed enters with its back face
 * up, so its "as this enters" choices are the back face's. Skin Invasion returns as Skin Shedder, a
 * creature: it enchants nothing, and isn't an Aura with nothing to enchant (303.4g).
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";

import { A, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const FRONT = "Test Invading Aura";
const BACK = "Test Shed Creature";
const registry = createDefaultRegistry()
  .register(
    defineCard({
      name: FRONT,
      manaCost: "{R}",
      types: ["enchantment"],
      subtypes: ["Aura"],
      text: "Enchant creature",
      targets: ["creature"],
      faces: [FRONT, BACK],
      transform: true,
    }),
  )
  .register(
    defineCard({
      name: BACK,
      types: ["creature"],
      subtypes: ["Phyrexian", "Human"],
      power: 3,
      toughness: 4,
      text: "",
    }),
  );

const returnTransformed = (game: Game, card: ObjectId): void => {
  game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true, underYourControl: true }, [ref(card)]);
  settle(game);
};

describe("an Aura put onto the battlefield transformed (rule 712.14a)", () => {
  it("enters as its creature back face with no creature around to enchant", () => {
    const { game } = table({ registry });
    const card = toGraveyard(game, FRONT);
    returnTransformed(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].face).toBe(1);
  });

  it("isn't asked what to enchant when there is a creature, and enters unattached", () => {
    const { game, a } = table({ registry });
    spawn(game, "Grizzly Bears");
    let asked = false;
    a.chooseEnchantFn = () => {
      asked = true;
      return null;
    };
    const card = toGraveyard(game, FRONT);
    returnTransformed(game, card);
    expect(asked).toBe(false);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[card].attachedTo).toBeNull();
  });

  it("the front face put on the battlefield normally is still an Aura that needs a host", () => {
    const { game } = table({ registry });
    const card = toGraveyard(game, FRONT);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, underYourControl: true }, [ref(card)]);
    settle(game);
    expect(zone(game, card)).toBe("graveyard");
  });
});
