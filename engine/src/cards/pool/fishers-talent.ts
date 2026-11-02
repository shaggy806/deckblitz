import { defineCard } from "../define.js";
import { atLevel, classLevel, CLASS_REMINDER } from "../helpers.js";

// Delver of Secrets' shape: revealing a card that isn't a land does nothing
// (the text allows only a land), and the card stays on top either way. The
// Sharks are made in the Fish's place, and level 3 makes those Octopuses:
// the second replacement applies to the event the first left (rule 616.1).
const UPKEEP_TEXT =
  "At the beginning of your upkeep, look at the top card of your library. You may reveal it if it's a land card. Create a 1/1 blue Fish creature token if you revealed it this way. Then draw a card.";
const LEVEL_2_TEXT = "If you would create a Fish token, create a 3/3 blue Shark creature token instead.";
const LEVEL_3_TEXT = "If you would create a Shark token, create an 8/8 blue Octopus creature token instead.";

export default defineCard({
  name: "Fisher's Talent",
  manaCost: "{2}{G}{U}",
  colors: ["G", "U"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `${CLASS_REMINDER}\n${UPKEEP_TEXT}\n{G}{U}: Level 2\n${LEVEL_2_TEXT}\n{2}{G}{U}: Level 3\n${LEVEL_3_TEXT}`,
  static: [
    atLevel(2, {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        tokensInstead: "Shark Token",
        ofTokens: { subtypesAnyOf: ["Fish"] },
      },
      text: LEVEL_2_TEXT,
    }),
    atLevel(3, {
      affects: { scope: "self" },
      replacement: {
        event: "would-create-token",
        tokensInstead: "Octopus Token",
        ofTokens: { subtypesAnyOf: ["Shark"] },
      },
      text: LEVEL_3_TEXT,
    }),
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 1,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { type: "land" },
            destination: "library-top",
            leftover: "stay",
            then: { kind: "create-token", token: "Fish Token", count: 1 },
          },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  activated: [classLevel(2, "{G}{U}"), classLevel(3, "{2}{G}{U}")],
});
