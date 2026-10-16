import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 14352. "If you've sacrificed an artifact this turn" is the
// turn history's sacrifices (Bonecache Overseer's Food), any artifact — a
// Clue sacrificed to draw counts.
const ENTERS = "When this artifact enters, investigate twice.";
const THOPTER =
  "{T}: Create a 1/1 colorless Thopter artifact creature token with flying. Activate only if you've sacrificed an artifact this turn.";

export default defineCard({
  name: "Detective's Satchel",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["artifact"],
  text: `${ENTERS} (To investigate, create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${THOPTER}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: investigate(2),
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "turn-history", what: "sacrificed", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: { kind: "create-token", token: "Thopter Token", count: 1 },
      resolve: null,
      text: THOPTER,
    },
  ],
});
