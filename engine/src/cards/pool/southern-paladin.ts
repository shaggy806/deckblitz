import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 25193.

const TEXT = "{W}{W}, {T}: Destroy target red permanent.";

export default defineCard({
  name: "Southern Paladin",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}{W}", tap: true },
      targets: [{ kind: "permanent", filter: { colors: ["R"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
