import { defineCard } from "../define.js";

// Dissension.
const UPKEEP = "At the beginning of your upkeep, sacrifice this creature unless you pay {W}{W}.";
const PREVENT = "{W}: The next time a source of your choice would deal damage to you this turn, prevent that damage.";

export default defineCard({
  name: "Haazda Shield Mate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${UPKEEP}\n${PREVENT}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time" },
      resolve: null,
      text: PREVENT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{W}{W}", text: "Pay {W}{W}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
