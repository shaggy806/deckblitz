import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

const DAMAGE_TEXT = "When its power becomes 20 this way, it deals 20 damage to any target.";
const PUMP_TEXT = `{R}: Inferno of the Star Mounts gets +1/+0 until end of turn. ${DAMAGE_TEXT}`;

const PUMP: EffectSpec = { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" };
const POWER_IS_20 = { kind: "source", filter: { power: { op: "eq", n: 20 } } } as const;

export default defineCard({
  name: "Inferno of the Star Mounts",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "haste"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nFlying, haste\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      // "Becomes 20 this way" (its ruling): exactly 20 after this pump and not
      // 20 before it, so a power already at 20 that the pump doesn't move
      // triggers nothing.
      effect: {
        kind: "conditional",
        condition: POWER_IS_20,
        then: PUMP,
        else: {
          kind: "sequence",
          effects: [
            PUMP,
            {
              kind: "conditional",
              condition: POWER_IS_20,
              then: {
                kind: "reflexive-trigger",
                targets: ["any-target"],
                effect: { kind: "damage", amount: 20, target: 0 },
                text: DAMAGE_TEXT,
              },
            },
          ],
        },
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
