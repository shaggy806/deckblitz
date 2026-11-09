import { defineCard } from "../define.js";

const TEXT =
  "Nonland permanents you control are artifacts in addition to their other types. The same is true for permanent spells you control and nonland permanent cards you own that aren't on the battlefield.";

export default defineCard({
  name: "Encroaching Mycosynth",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you", notTypes: ["land"] } },
      addTypes: ["artifact"],
      outsideBattlefield: {
        ofType: ["artifact", "battle", "creature", "enchantment", "planeswalker"],
        notType: "land",
        addTypes: ["artifact"],
      },
      text: TEXT,
    },
  ],
});
