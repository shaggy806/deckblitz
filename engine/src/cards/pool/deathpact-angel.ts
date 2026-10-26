import { defineCard } from "../define.js";

export default defineCard({
  name: "Deathpact Angel",
  manaCost: "{3}{W}{B}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature dies, create a 1/1 white and black Cleric creature token. It has \"{3}{W}{B}{B}, {T}, Sacrifice this token: Return a card named Deathpact Angel from your graveyard to the battlefield.\"",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Cleric Token (Deathpact Return)", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 1/1 white and black Cleric creature token. It has \"{3}{W}{B}{B}, {T}, Sacrifice this token: Return a card named Deathpact Angel from your graveyard to the battlefield.\"",
    },
  ],
});
