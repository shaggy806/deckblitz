import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, target creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Oakheart Dryads",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph", "Dryad"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    }),
  ],
});
