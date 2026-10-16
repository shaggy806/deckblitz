import { defineCard } from "../define.js";

// EDHREC rank 24731.
const TAP_TEXT = "{2}, {T}: Tap target non-Mount creature.";

export default defineCard({
  name: "Sterling Keykeeper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 2,
  toughness: 2,
  text: TAP_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Mount"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
