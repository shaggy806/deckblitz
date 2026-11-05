import { CHOSEN_COLOR } from "../../effects.js";
import { defineCard } from "../define.js";

const TEXT =
  "{X}{U/B}: Choose a color. Target opponent exiles the top X cards of their library. For each card of the chosen color exiled this way, create a 1/1 blue and black Faerie Rogue creature token with flying.";

export default defineCard({
  name: "Oona, Queen of the Fae",
  manaCost: "{3}{U/B}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{U/B}", tap: false },
      targets: ["opponent"],
      // The colour is chosen as it resolves, the opponent targeted as it's
      // activated (the rulings).
      effect: {
        kind: "choose-value",
        value: "color",
        then: {
          kind: "sequence",
          effects: [
            { kind: "exile-from-library", whose: 0, amount: "x" },
            {
              kind: "create-token",
              token: "Blue-Black Faerie Rogue Token",
              count: { thisWay: "exiled", filter: { colors: [CHOSEN_COLOR] } },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
