import { defineCard } from "../define.js";

const TEXT = "{2}{U}: Target Shapeshifter becomes a copy of target creature until your next turn.";

export default defineCard({
  name: "Shapesharer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 1,
  toughness: 1,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Shapeshifter" } }, "creature"],
      effect: { kind: "become-copy", target: 0, of: 1, until: "your-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
