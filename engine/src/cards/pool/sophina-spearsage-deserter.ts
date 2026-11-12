import { defineCard } from "../define.js";

// EDHREC rank 15277.

export default defineCard({
  name: "Sophina, Spearsage Deserter",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  pairing: { kind: "partner-group", group: "Friends forever" },
  text: "Menace\nWhenever Sophina, Spearsage Deserter attacks, investigate once for each nontoken attacking creature. (To investigate, create a Clue token. It's an artifact with \"{2}, Sacrifice this artifact: Draw a card.\")\nPartner—Friends forever (You can have two commanders if both have this ability.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Clue Token",
        count: { countOf: { type: "creature", attacking: true, token: false } },
      },
      resolve: null,
      text: "Whenever Sophina, Spearsage Deserter attacks, investigate once for each nontoken attacking creature.",
    },
  ],
});
