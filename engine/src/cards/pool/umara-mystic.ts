import { defineCard } from "../define.js";

// EDHREC rank 20692. Zendikar Rising. A Wizard spell is one with the creature
// type Wizard (the ruling).

const TEXT =
  "Whenever you cast an instant, sorcery, or Wizard spell, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Umara Mystic",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ typesAnyOf: ["instant", "sorcery"] }, { subtype: "Wizard" }] },
      },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
