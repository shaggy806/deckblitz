import { defineCard } from "../define.js";

const TEXT = "{1}{U}: Return target Spirit you control to its owner's hand.";

export default defineCard({
  name: "Spectral Shepherd",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Spirit", controlledBy: "you" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
