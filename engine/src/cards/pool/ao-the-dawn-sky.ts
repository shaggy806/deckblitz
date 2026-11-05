import { defineCard } from "../define.js";

// The mode is chosen as the trigger goes on the stack (`announced`). The
// first mode's cards are capped together at total mana value 4.

const DIES_TEXT = "When Ao dies, choose one —";
const LOOK_TEXT =
  "• Look at the top seven cards of your library. Put any number of nonland permanent cards with total mana value 4 or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";
const COUNTERS_TEXT = "• Put two +1/+1 counters on each permanent you control that's a creature or Vehicle.";

export default defineCard({
  name: "Ao, the Dawn Sky",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${DIES_TEXT}\n${LOOK_TEXT}\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: LOOK_TEXT,
            effect: {
              kind: "look-and-choose",
              zone: "library",
              count: 7,
              min: 0,
              max: 7,
              filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "planeswalker"], notTypes: ["land"] },
              together: { totalManaValueAtMost: 4 },
              destination: "battlefield",
              leftover: "bottom-random",
            },
          },
          {
            text: COUNTERS_TEXT,
            effect: {
              kind: "add-counter-all",
              filter: { controlledBy: "you", anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] },
              counter: "+1/+1",
              amount: 2,
            },
          },
        ],
      },
      resolve: null,
      text: `${DIES_TEXT}\n${LOOK_TEXT}\n${COUNTERS_TEXT}`,
    },
  ],
});
