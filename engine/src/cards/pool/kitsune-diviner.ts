import { defineCard } from "../define.js";

// EDHREC rank 29599. Any Spirit permanent, not only a creature.

export default defineCard({
  name: "Kitsune Diviner",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Cleric"],
  power: 0,
  toughness: 1,
  text: "{T}: Tap target Spirit.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Spirit" } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{T}: Tap target Spirit.",
    },
  ],
});
