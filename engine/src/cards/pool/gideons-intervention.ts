import { defineCard } from "../define.js";

const LOCK = "Your opponents can't cast spells with the chosen name.";
const PREVENT =
  "Prevent all damage that would be dealt to you and permanents you control by sources with the chosen name.";

// Rulings (2017-04-18): a card's name, not a token's; one half of a split
// card; a land's name may be chosen — its damage is still prevented.

export default defineCard({
  name: "Gideon's Intervention",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  chooseCardNameOnEnter: {},
  text: `As this enchantment enters, choose a card name.\n${LOCK}\n${PREVENT}`,
  static: [
    { affects: { scope: "self" }, prohibits: { who: "opponents", spells: { chosenName: true } }, text: LOCK },
    // One prevention, split by recipient: a replacement's `to` names a player
    // and its `toFilter` a permanent.
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "you", source: { chosenName: true } },
      text: PREVENT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, toFilter: { controlledBy: "you" }, source: { chosenName: true } },
      text: PREVENT,
    },
  ],
});
