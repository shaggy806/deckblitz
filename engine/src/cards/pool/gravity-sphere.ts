import { defineCard } from "../define.js";

// EDHREC rank 25004. A world enchantment (the world rule, 704.5k).

const TEXT = "All creatures lose flying.";

export default defineCard({
  name: "Gravity Sphere",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "all-creatures" }, loseKeywords: ["flying"], text: TEXT }],
});
