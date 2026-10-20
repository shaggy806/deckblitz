import { defineCard } from "../define.js";

// EDHREC rank 19485.
//
// X is read as it resolves: three plus the party (rule 700.8).

export default defineCard({
  name: "Skyclave Plunder",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Look at the top X cards of your library, where X is three plus the number of creatures in your party. Put three of those cards into your hand and the rest on the bottom of your library in a random order. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { sum: [3, { partySize: "you" }] },
    min: 3,
    max: 3,
    destination: "hand",
    leftover: "bottom-random",
  },
});
