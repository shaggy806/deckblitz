import { defineCard } from "../define.js";

// Sengir Nosferatu's Bat. Rulings: the Sengir Nosferatu it returns needn't be
// the one that created it, or be owned by the same player; a copy exiled isn't
// named Sengir Nosferatu in exile. Chosen as the ability resolves, no target.
const TEXT = "{1}{B}, Sacrifice this creature: Return an exiled card named Sengir Nosferatu to the battlefield under its owner's control.";

export default defineCard({
  name: "Bat Token (Sengir Nosferatu)",
  art: "4c532e0f-8934-4ad3-bb1a-640abe946e10",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exile",
        filter: { name: "Sengir Nosferatu" },
        min: 1,
        max: 1,
        destination: "battlefield",
        under: "owners",
        leftover: "stay",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
