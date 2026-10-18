import { defineCard } from "../define.js";

// EDHREC rank 24242. March of the Machine.
// Its 1/1 blue and red Elemental is Prismari Pianist's token.

export default defineCard({
  name: "Preening Champion",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a 1/1 blue and red Elemental creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Elemental Token (Prismari Pianist)", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 blue and red Elemental creature token.",
    },
  ],
});
