import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, choose one —";
const MODE_1 = "Return up to one target Ninja or Rogue creature card from your graveyard to your hand.";
const MODE_2 = "Put target creature card from your graveyard on top of your library.";

export default defineCard({
  name: "Kami of Restless Shadows",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n• ${MODE_1}\n• ${MODE_2}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: MODE_1,
            targets: [
              {
                kind: "optional",
                of: {
                  kind: "card-in-graveyard",
                  whose: "you",
                  filter: { type: "creature", subtypes: ["Ninja", "Rogue"] },
                },
              },
            ],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
          {
            text: MODE_2,
            targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
            effect: { kind: "put-on-library", target: 0, position: "top" },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
