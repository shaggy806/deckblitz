import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";
import type { TargetSpec } from "../../target.js";

const TEXT =
  'When this creature enters, for each player, choose up to one other target artifact or creature that player controls. For as long as this creature remains on the battlefield, the chosen permanents become Treasure artifacts with "{T}, Sacrifice this artifact: Add one mana of any color" and lose all other abilities.';

const slot = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "other", of: { kind: "permanent", whose: { seat }, filter: { typesAnyOf: ["artifact", "creature"] } } },
});

const becomeTreasure = (target: number): EffectSpec => ({
  kind: "become",
  target,
  duration: "while-source",
  setTypes: ["artifact"],
  setSubtypes: ["Treasure"],
  loseAbilities: true,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice this artifact: Add one mana of any color.",
    },
  ],
});

export default defineCard({
  name: "Kitesail Larcenist",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying, ward {1}\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{1}" } },
      resolve: null,
      text: "Ward {1}",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [slot(0), slot(1), slot(2), slot(3)],
      effect: {
        kind: "sequence",
        effects: [becomeTreasure(0), becomeTreasure(1), becomeTreasure(2), becomeTreasure(3)],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
