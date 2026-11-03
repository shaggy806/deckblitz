import { defineCard } from "../define.js";

const TEXT = "All nonland permanents are legendary.";

export default defineCard({
  name: "Leyline of Singularity",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  beginsOnBattlefield: true,
  text: `If this card is in your opening hand, you may begin the game with it on the battlefield.\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { notTypes: ["land"] } },
      addSupertypes: ["legendary"],
      text: TEXT,
    },
  ],
});
