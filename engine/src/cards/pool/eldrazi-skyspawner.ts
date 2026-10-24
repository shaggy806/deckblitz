import { defineCard } from "../define.js";

// EDHREC rank 12722. Devoid: colourless (`colors: []`).

export default defineCard({
  name: "Eldrazi Skyspawner",
  manaCost: "{2}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: 'Devoid (This card has no color.)\nFlying\nWhen this creature enters, create a 1/1 colorless Eldrazi Scion creature token. It has "Sacrifice this token: Add {C}."',
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Scion Token", count: 1 },
      resolve: null,
      text: 'When this creature enters, create a 1/1 colorless Eldrazi Scion creature token. It has "Sacrifice this token: Add {C}."',
    },
  ],
});
