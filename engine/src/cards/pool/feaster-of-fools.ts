import { defineCard } from "../define.js";

export default defineCard({
  name: "Feaster of Fools",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  convoke: true,
  devour: { multiplier: 2, filter: { type: "creature" } },
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying\nDevour 2 (As this creature enters, you may sacrifice any number of creatures. It enters with twice that many +1/+1 counters on it.)",
});
