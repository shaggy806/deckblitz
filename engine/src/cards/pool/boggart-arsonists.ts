import { defineCard } from "../define.js";

// EDHREC rank 28821.

export default defineCard({
  name: "Boggart Arsonists",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue"],
  power: 2,
  toughness: 1,
  keywords: ["plainswalk"],
  text: "Plainswalk (This creature can't be blocked as long as defending player controls a Plains.)\n{2}{R}, Sacrifice this creature: Destroy target Scarecrow or Plains.",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { subtypes: ["Scarecrow", "Plains"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{R}, Sacrifice this creature: Destroy target Scarecrow or Plains.",
    },
  ],
});
