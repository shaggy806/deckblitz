import { defineCard } from "../define.js";

// EDHREC rank 20970.
// Makes Merfolk → use "Merfolk Token (Silvergill Mentor)".

export default defineCard({
  name: "Merrow Skyswimmer",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "vigilance"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying, vigilance\nWhen this creature enters, create a 1/1 white and blue Merfolk creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token (Silvergill Mentor)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white and blue Merfolk creature token.",
    },
  ],
});
