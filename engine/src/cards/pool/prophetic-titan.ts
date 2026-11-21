import { defineCard } from "../define.js";

// EDHREC rank 19397.
//
// A modal triggered ability: its modes are chosen as it's put on the stack
// (rule 700.2b), and delirium is read then — both modes with four or more card
// types among the cards in your graveyard, and the ruling says it isn't
// checked again as the ability resolves (`exactlyIf`). The damage mode's
// target is chosen with the modes (rule 603.3c).
const ENTERS = "Delirium — When this creature enters, choose one. If there are four or more card types among cards in your graveyard, choose both instead.";
const DAMAGE = "This creature deals 4 damage to any target.";
const LOOK =
  "Look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Prophetic Titan",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Giant", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${ENTERS}\n• ${DAMAGE}\n• ${LOOK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        exactlyIf: { condition: { kind: "delirium" }, modes: 2 },
        modes: [
          { text: DAMAGE, targets: ["any-target"], effect: { kind: "damage", amount: 4, target: 0 } },
          {
            text: LOOK,
            targets: [],
            effect: {
              kind: "look-and-choose",
              zone: "library",
              count: 4,
              min: 1,
              max: 1,
              destination: "hand",
              leftover: "bottom-random",
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
