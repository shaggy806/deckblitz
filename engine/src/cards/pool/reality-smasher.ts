import { defineCard } from "../define.js";

// EDHREC rank 10634.
//
// Ward-shaped, but only for spells (`spellOnly`) an opponent controls — an
// Aura spell included (the ruling); an ability targeting it does nothing.
const TEXT =
  "Whenever this creature becomes the target of a spell an opponent controls, counter that spell unless its controller discards a card.";

export default defineCard({
  name: "Reality Smasher",
  manaCost: "{4}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 5,
  toughness: 5,
  keywords: ["trample", "haste"],
  text: `({C} represents colorless mana.)\nTrample, haste\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true, spellOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { discard: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
