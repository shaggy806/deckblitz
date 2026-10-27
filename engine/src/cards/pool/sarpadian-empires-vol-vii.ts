import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 21563. The choice is a `chooseOnEnter`
// label, asked before it moves (rule 614.1c); the ability makes the one
// token that label names.

const CHOICES = [
  ["white Citizen", "White Citizen Token"],
  ["blue Camarid", "Camarid Token"],
  ["black Thrull", "1/1 Thrull Token"],
  ["red Goblin", "Goblin Token"],
  ["green Saproling", "Saproling Token"],
] as const;

const MAKE_TEXT = "{3}, {T}: Create a 1/1 creature token of the chosen color and type.";

const make: EffectSpec = {
  kind: "sequence",
  effects: CHOICES.map(
    ([label, token]): EffectSpec => ({
      kind: "conditional",
      condition: { kind: "chosen-on-enter", value: label },
      then: { kind: "create-token", token, count: 1 },
    }),
  ),
};

export default defineCard({
  name: "Sarpadian Empires, Vol. VII",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `As this artifact enters, choose white Citizen, blue Camarid, black Thrull, red Goblin, or green Saproling.\n${MAKE_TEXT}`,
  chooseOnEnter: CHOICES.map(([label]) => label),
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: make,
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
