import { defineCard } from "../define.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, prevent all damage that would be dealt to target creature this turn.";

// Constellation: it is an enchantment itself, so one "enchantment you
// control enters" trigger covers "this creature or another enchantment".
export default defineCard({
  name: "Harvestguard Alseids",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: TEXT,
    },
  ],
});
