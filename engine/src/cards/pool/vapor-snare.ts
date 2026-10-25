import { defineCard } from "../define.js";

// Worldwake (WWK). EDHREC rank 28956.
//
// Control Magic's shape (`controlEnchanted`, layer 2), with an upkeep
// "sacrifice unless": with a land to return you may return one, and the
// Aura is sacrificed if you don't — or can't, with no land.
const UPKEEP_TEXT =
  "At the beginning of your upkeep, sacrifice this Aura unless you return a land you control to its owner's hand.";

export default defineCard({
  name: "Vapor Snare",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nYou control enchanted creature.\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land" }, atLeast: 1 },
        then: {
          kind: "may",
          prompt: "Return a land you control to its owner's hand? If you don't, sacrifice Vapor Snare.",
          effect: {
            kind: "choose-permanents",
            filter: { type: "land", controlledBy: "you" },
            min: 1,
            upTo: 1,
            then: { kind: "return-to-hand", target: 0 },
            prompt: "Return a land you control to its owner's hand",
          },
          else: { kind: "sacrifice-source" },
        },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
