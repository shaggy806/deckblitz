import { defineCard } from "../define.js";

// EDHREC rank 32679.

export default defineCard({
  name: "Gorn Captain",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Gorn", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample (This creature can deal excess combat damage to the player it's attacking.)",
});
