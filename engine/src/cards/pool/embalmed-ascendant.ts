import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 15883.
const ENTERS_TEXT = "When this creature enters, create a 2/2 black Zombie creature token.";
const DRAIN_TEXT = "Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.";

export default defineCard({
  name: "Embalmed Ascendant",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 2,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\nMax speed — ${DRAIN_TEXT}`,
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
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "you-control", filter: { type: "creature" } },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "lose-life", amount: 1, who: "each-opponent" },
              { kind: "gain-life", amount: 1 },
            ],
          },
          resolve: null,
          text: DRAIN_TEXT,
        },
      ],
      text: `Max speed — ${DRAIN_TEXT}`,
    }),
  ],
});
