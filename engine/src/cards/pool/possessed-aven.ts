import { defineCard } from "../define.js";

const ABILITY_TEXT = "{2}{B}, {T}: Destroy target blue creature.";
const TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1, is black, and has "${ABILITY_TEXT}"`;

export default defineCard({
  name: "Possessed Aven",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      setColors: ["B"],
      grantsActivated: [
        {
          cost: { mana: "{2}{B}", tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", colors: ["U"] } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
