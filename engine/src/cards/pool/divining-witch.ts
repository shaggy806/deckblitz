import { defineCard } from "../define.js";

const WITCH_TEXT =
  "{1}{B}, {T}, Discard a card: Choose a card name. Exile the top six cards of your library, then reveal cards from the top of your library until you reveal a card with the chosen name. Put that card into your hand and exile all other cards revealed this way.";

export default defineCard({
  name: "Divining Witch",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: WITCH_TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "choose-card-name",
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile-from-library", amount: 6 },
            { kind: "reveal-until", filter: { hasName: "$chosenName" }, put: "hand", rest: "exile" },
          ],
        },
      },
      resolve: null,
      text: WITCH_TEXT,
    },
  ],
});
