import { defineCard } from "../define.js";

export default defineCard({
  name: "Hidden Path",
  manaCost: "{2}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "Green creatures have forestwalk. (They can't be blocked as long as defending player controls a Forest.)",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["G"] } },
      grantKeywords: ["forestwalk"],
      text: "Green creatures have forestwalk.",
    },
  ],
});
