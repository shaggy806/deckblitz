import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

const SQUAD_TEXT =
  "Squad {2} (As an additional cost to cast this spell, you may pay {2} any number of times. When this creature enters, create that many tokens that are copies of it.)";
const ENTER_TEXT = "When this creature enters, destroy up to one target artifact.";

// Each token copy enters too, so each triggers its own "destroy up to one
// target artifact".
export default defineCard({
  name: "Powder Ganger",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${ENTER_TEXT}`,
  triggered: [
    squadTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "artifact" }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
