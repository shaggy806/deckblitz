import { defineCard } from "../define.js";

// EDHREC rank 10779.

const ENTER_TEXT =
  "When this creature enters, return up to one other target creature you control to its owner's hand.";

export default defineCard({
  name: "Flock Impostor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 2,
  keywords: ["changeling", "flash", "flying"],
  text: `Changeling (This card is every creature type.)\nFlash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
