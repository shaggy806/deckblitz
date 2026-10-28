import { CHOSEN_CARD_NAME } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 27580. The name is chosen as the ability resolves, then the
// top card is revealed; a card that doesn't match stays on top (the
// ruling), and one that does is among the three drawn. With an empty
// library nothing is revealed and nothing else happens.

const TEXT =
  "{1}, {T}: Choose a card name, then reveal the top card of your library. If that card has the chosen name, sacrifice this artifact and draw three cards. Activate only as a sorcery.";

export default defineCard({
  name: "Diviner's Lockbox",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: {
        kind: "choose-card-name",
        aim: "own-library",
        then: {
          kind: "reveal-top",
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { hasName: CHOSEN_CARD_NAME } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "sacrifice-source" },
                { kind: "draw", amount: 3 },
              ],
            },
          },
        },
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
