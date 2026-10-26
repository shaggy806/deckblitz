import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 26226. "No Reflection tokens on the battlefield"
// is anyone's: neither you nor any opponent controls one. It's an
// intervening-if (rule 603.4), checked as the upkeep begins and again on
// resolution (the 2004-10-04 ruling). The {0} ability destroys any Reflection,
// token or not.

const TRIGGER_TEXT =
  "At the beginning of your upkeep, if there are no Reflection tokens on the battlefield, create a 2/2 white Reflection creature token.";
const REFLECTION_TOKEN = { subtype: "Reflection", token: true } as const;

export default defineCard({
  name: "Spirit Mirror",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n{0}: Destroy target Reflection.`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Reflection" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{0}: Destroy target Reflection.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: {
        kind: "all",
        of: [
          { kind: "not", of: { kind: "controls", filter: REFLECTION_TOKEN, atLeast: 1 } },
          { kind: "not", of: { kind: "opponent-controls", filter: REFLECTION_TOKEN, atLeast: 1 } },
        ],
      },
      targets: [],
      effect: { kind: "create-token", token: "Reflection Token (White, 2/2)", count: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
