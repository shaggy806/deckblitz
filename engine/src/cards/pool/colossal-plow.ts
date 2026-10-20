import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this Vehicle attacks, add {W}{W}{W} and you gain 3 life. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Colossal Plow",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 6,
  toughness: 3,
  text: `${ATTACK_TEXT}\nCrew 6 (Tap any number of creatures you control with total power 6 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(6)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-mana", mana: "W", amount: 3, persists: true },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
