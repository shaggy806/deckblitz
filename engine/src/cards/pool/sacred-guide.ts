import { defineCard } from "../define.js";

const GUIDE_TEXT =
  "{1}{W}, Sacrifice this creature: Reveal cards from the top of your library until you reveal a white card. Put that card into your hand and exile all other cards revealed this way.";

export default defineCard({
  name: "Sacred Guide",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: GUIDE_TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "reveal-until", filter: { colors: ["W"] }, put: "hand", rest: "exile" },
      resolve: null,
      text: GUIDE_TEXT,
    },
  ],
});
