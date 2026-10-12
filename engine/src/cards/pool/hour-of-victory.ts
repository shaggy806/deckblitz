import { defineCard } from "../define.js";
import { maxSpeed } from "../helpers.js";

// EDHREC rank 13401.
const ENTERS_TEXT = "When this enchantment enters, create a 2/2 black Zombie creature token.";
const TUTOR_TEXT =
  "{1}{B}, Sacrifice this enchantment: Search your library for a card, put it into your hand, then shuffle. Activate only as a sorcery.";

export default defineCard({
  name: "Hour of Victory",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  keywords: ["start-your-engines"],
  text: `Start your engines!\n${ENTERS_TEXT}\nMax speed — ${TUTOR_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    maxSpeed({
      grantsActivated: [
        {
          cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "search-library", filter: {}, destination: "hand", min: 1, max: 1 },
          resolve: null,
          sorcerySpeed: true,
          text: TUTOR_TEXT,
        },
      ],
      text: `Max speed — ${TUTOR_TEXT}`,
    }),
  ],
});
