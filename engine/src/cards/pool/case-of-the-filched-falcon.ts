import { defineCard } from "../define.js";
import { caseToSolve, investigate } from "../helpers.js";

const ENTER_TEXT = "When this Case enters, investigate.";
const SOLVE_TEXT =
  "To solve — You control three or more artifacts. (If unsolved, solve at the beginning of your end step.)";
const SOLVED_TEXT =
  "Solved — {2}{U}, Sacrifice this Case: Put four +1/+1 counters on target noncreature artifact. It becomes a 0/0 Bird creature with flying in addition to its other types.";

// The animation has no duration: it lasts as long as the artifact stays.
// Its other types and subtypes stay (the ruling); a Vehicle's P/T is set to
// 0/0 in layer 7b, under the counters.
export default defineCard({
  name: "Case of the Filched Falcon",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Case"],
  text: `${ENTER_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${SOLVE_TEXT}\n${SOLVED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: ENTER_TEXT,
    },
    caseToSolve({ kind: "controls", filter: { type: "artifact" }, atLeast: 3 }, SOLVE_TEXT),
  ],
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, sacrifice: "self" },
      condition: { kind: "solved" },
      targets: [{ kind: "permanent", filter: { type: "artifact", notTypes: ["creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 4 },
          {
            kind: "animate",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Bird"],
            keywords: ["flying"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: SOLVED_TEXT,
    },
  ],
});
