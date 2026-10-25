import { defineCard } from "../define.js";

// Worldwake (WWK).

const ENTER_TEXT = "When this creature enters, create a 2/2 green Wolf creature token for each time it was kicked.";

export default defineCard({
  name: "Wolfbriar Elemental",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 4,
  toughness: 4,
  text: `Multikicker {G} (You may pay an additional {G} any number of times as you cast this spell.)\n${ENTER_TEXT}`,
  kicker: { cost: "{G}", multi: true },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: { timesKicked: "source" } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
