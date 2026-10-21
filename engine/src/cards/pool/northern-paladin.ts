import { defineCard } from "../define.js";

// Limited Edition Alpha. EDHREC rank 22718.
const TEXT = "{W}{W}, {T}: Destroy target black permanent.";

export default defineCard({
  name: "Northern Paladin",
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
      targets: [{ kind: "permanent", filter: { colors: ["B"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
