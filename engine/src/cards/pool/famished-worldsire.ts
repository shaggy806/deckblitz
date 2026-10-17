import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// "Devour land 3" (rule 702.82b). X is its power as the enters ability
// resolves; the lands found enter tapped, then the library is shuffled.

const ENTER_TEXT =
  "When this creature enters, look at the top X cards of your library, where X is this creature's power. Put any number of land cards from among them onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Famished Worldsire",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 0,
  toughness: 0,
  text: `Ward {3}\nDevour land 3 (As this creature enters, you may sacrifice any number of lands. It enters with three times that many +1/+1 counters on it.)\n${ENTER_TEXT}`,
  devour: { multiplier: 3, filter: { type: "land" } },
  triggered: [
    ward({ mana: "{3}" }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: { powerOf: "source" },
            min: 0,
            max: { powerOf: "source" },
            filter: { type: "land" },
            destination: "battlefield",
            enterTapped: true,
            leftover: "stay",
          },
          { kind: "shuffle-library" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
