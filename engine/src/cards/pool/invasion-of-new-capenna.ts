import { defineCard } from "../define.js";
import { SIEGE_REMINDER, siege } from "../helpers.js";

// EDHREC rank 10013. The reflexive ability's target is chosen once you've
// sacrificed (its ruling).
const ENTER_TEXT =
  "When this Siege enters, you may sacrifice an artifact or creature. When you do, exile target artifact or creature an opponent controls.";

export default defineCard({
  name: "Invasion of New Capenna",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["battle"],
  subtypes: ["Siege"],
  defense: 4,
  text: `${SIEGE_REMINDER}\n${ENTER_TEXT}`,
  triggered: [
    siege(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { typesAnyOf: ["artifact", "creature"] }, text: "Sacrifice an artifact or creature" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["artifact", "creature"] } }],
          effect: { kind: "exile", target: 0 },
          text: "Exile target artifact or creature an opponent controls.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  faces: ["Invasion of New Capenna", "Holy Frazzle-Cannon"],
  transform: true,
});
