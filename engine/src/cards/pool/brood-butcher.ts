import { defineCard } from "../define.js";

const ETB_TEXT =
  'When this creature enters, create a 1/1 colorless Eldrazi Scion creature token. It has "Sacrifice this token: Add {C}."';
const SAC_TEXT = "{B}{G}, Sacrifice a creature: Target creature gets -2/-2 until end of turn.";

export default defineCard({
  name: "Brood Butcher",
  manaCost: "{3}{B}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${ETB_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{G}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
