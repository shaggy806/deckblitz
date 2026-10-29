import { defineCard } from "../define.js";
import { BASIC_LAND_TYPE_CHOICES, CHOSEN_CREATURE_TYPE } from "../helpers.js";

// The type is chosen as the ability resolves (the ruling); the land loses its
// other land types and rules-text abilities until end of turn (rule 305.7).
export default defineCard({
  name: "Pixie Illusionist",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  kicker: { cost: "{3}{G}" },
  text: "Kicker {3}{G} (You may pay an additional {3}{G} as you cast this spell.)\nFlying\nIf this creature was kicked, it enters with two +1/+1 counters on it.\n{T}: Target land you control becomes the basic land type of your choice until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["land-you-control"],
      effect: {
        kind: "choose-creature-type",
        options: BASIC_LAND_TYPE_CHOICES,
        prompt: "choose a basic land type",
        then: { kind: "add-types", target: 0, setSubtypes: [CHOSEN_CREATURE_TYPE], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{T}: Target land you control becomes the basic land type of your choice until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: "If this creature was kicked, it enters with two +1/+1 counters on it.",
    },
  ],
});
