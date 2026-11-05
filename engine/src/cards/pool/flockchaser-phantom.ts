import { defineCard } from "../define.js";

// EDHREC rank 13882.

export default defineCard({
  name: "Flockchaser Phantom",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying, vigilance\nWhenever this creature attacks, the next spell you cast this turn has convoke.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "grant-spells-this-turn", next: true, convoke: true },
      resolve: null,
      text: "Whenever this creature attacks, the next spell you cast this turn has convoke.",
    },
  ],
});
