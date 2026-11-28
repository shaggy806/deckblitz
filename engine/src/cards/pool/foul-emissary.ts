import { defineCard } from "../define.js";

// EDHREC rank 29108. Its last ability is a `sacrifice` trigger with
// `whileCasting: "emerge"`: sacrificed for any reason while you're casting a
// spell with emerge, for its emerge cost or not (the card's ruling).

const ENTER_TEXT =
  "When this creature enters, look at the top four cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";
const EMERGE_TEXT =
  "When you sacrifice this creature while casting a spell with emerge, create a 3/2 colorless Eldrazi Horror creature token.";

export default defineCard({
  name: "Foul Emissary",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Horror"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${EMERGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "creature" },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", selfOnly: true, whileCasting: "emerge" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
      resolve: null,
      text: EMERGE_TEXT,
    },
  ],
});
