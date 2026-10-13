import { defineCard } from "../define.js";
import { entersTappedStatic, manaTapAbility } from "../helpers.js";

// EDHREC rank 7130.

const LIFE_TEXT = "{G}, {T}: You gain 1 life. Activate only if you control two or more green permanents.";

export default defineCard({
  name: "Sapseep Forest",
  colors: [],
  types: ["land"],
  subtypes: ["Forest"],
  text: `({T}: Add {G}.)\nThis land enters tapped.\n${LIFE_TEXT}`,
  static: [{ ...entersTappedStatic("Sapseep Forest"), text: "This land enters tapped." }],
  activated: [
    manaTapAbility("G"),
    {
      cost: { mana: "{G}", tap: true },
      condition: { kind: "controls", filter: { colors: ["G"] }, atLeast: 2 },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
