import { defineCard } from "../define.js";

// EDHREC rank 19851.

export default defineCard({
  name: "Skystinger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nWhenever this creature blocks a creature with flying, this creature gets +5/+0 until end of turn.",
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 5, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever this creature blocks a creature with flying, this creature gets +5/+0 until end of turn.",
      whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } },
    },
  ],
});
