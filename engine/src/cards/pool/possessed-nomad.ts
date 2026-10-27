import { defineCard } from "../define.js";

const ABILITY_TEXT = "{2}{B}, {T}: Destroy target white creature.";
const TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +1/+1, is black, and has "${ABILITY_TEXT}"`;

export default defineCard({
  name: "Possessed Nomad",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Nomad", "Horror"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [1, 1],
      setColors: ["B"],
      grantsActivated: [
        {
          cost: { mana: "{2}{B}", tap: true },
          targets: [{ kind: "permanent", filter: { type: "creature", colors: ["W"] } }],
          effect: { kind: "destroy", target: 0 },
          resolve: null,
          text: ABILITY_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
