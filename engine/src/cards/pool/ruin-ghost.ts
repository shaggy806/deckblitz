import { defineCard } from "../define.js";

// EDHREC rank 14381.

const TEXT = "{W}, {T}: Exile target land you control, then return it to the battlefield under your control.";

export default defineCard({
  name: "Ruin Ghost",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["land-you-control"],
      effect: { kind: "flicker", target: 0, underYourControl: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
