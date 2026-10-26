import { defineCard } from "../define.js";

// EDHREC rank 20069.
//
// Rulings:
//   The ability can be activated only while the card is in your graveyard
//     (Necrosavant's shape, with metalcraft added to the restriction).

const TEXT =
  "Metalcraft — {4}: Return this card from your graveyard to the battlefield. Activate only during your upkeep and only if you control three or more artifacts.";

export default defineCard({
  name: "Kuldotha Phoenix",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }, { kind: "metalcraft" }],
      },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
