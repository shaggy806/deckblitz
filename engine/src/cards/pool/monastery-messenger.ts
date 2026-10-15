import { defineCard } from "../define.js";

// EDHREC rank 21027.

const ENTER_TEXT =
  "When this creature enters, put up to one target noncreature, nonland card from your graveyard on top of your library.";

export default defineCard({
  name: "Monastery Messenger",
  manaCost: "{2/U}{2/R}{2/W}",
  colors: ["W", "U", "R"],
  types: ["creature"],
  subtypes: ["Bird", "Scout"],
  power: 2,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: { kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["creature", "land"] } },
        },
      ],
      effect: { kind: "put-on-library", target: 0, position: "top" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
