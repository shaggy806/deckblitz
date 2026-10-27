import { defineCard } from "../define.js";

// EDHREC rank 23566.

const TEXT = "All creatures have forestwalk. (They can't be blocked as long as defending player controls a Forest.)";

export default defineCard({
  name: "Lumbering Satyr",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Beast"],
  power: 5,
  toughness: 4,
  text: TEXT,
  static: [{ affects: { scope: "all-creatures" }, grantKeywords: ["forestwalk"], text: TEXT }],
});
