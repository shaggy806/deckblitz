import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 32076. Ethereal Champion's shield,
// for {1}.

const TEXT = "{1}: Prevent the next 1 damage that would be dealt to this creature this turn.";

export default defineCard({
  name: "Revered Elder",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "prevent-damage", target: "source", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
