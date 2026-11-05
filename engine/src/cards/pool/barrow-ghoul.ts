import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this creature unless you exile the top creature card of your graveyard.";

/** "Unless you exile" is offered only while there's a creature card to exile
 * (if you can't, you must sacrifice — its ruling), hence the `conditional`
 * around the `unless`. The card is the topmost creature card (rule 404.2). */
export default defineCard({
  name: "Barrow Ghoul",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 4,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", filter: { type: "creature" }, atLeast: 1 },
        then: {
          kind: "unless",
          chooser: "you",
          options: [
            {
              doing: {
                kind: "top-of-graveyard",
                filter: { type: "creature" },
                then: { kind: "exile", target: 0 },
              },
              text: "Exile the top creature card of your graveyard",
            },
          ],
          otherwise: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
