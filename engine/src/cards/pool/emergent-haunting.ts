import { defineCard } from "../define.js";

// EDHREC rank 26337. Both halves of the intervening "if" (rule 603.4) are
// asked as the end step begins and again as it resolves (the ruling). The
// animation has no duration, so it lasts indefinitely (the ruling).
const END_TEXT =
  "At the beginning of your end step, if you haven't cast a spell from your hand this turn and this enchantment isn't a creature, it becomes a 3/3 Spirit creature with flying in addition to its other types.";
const SURVEIL_TEXT = "{2}{U}: Surveil 1.";

export default defineCard({
  name: "Emergent Haunting",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${END_TEXT}\n${SURVEIL_TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "cast-this-turn", filter: { castFrom: "hand" }, atLeast: 0, atMost: 0 },
          { kind: "source", filter: { notTypes: ["creature"] } },
        ],
      },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 3,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Spirit"],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: SURVEIL_TEXT,
    },
  ],
});
