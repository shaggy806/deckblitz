import { defineCard } from "../define.js";

// EDHREC rank 25510. Wilds of Eldraine. An intervening-if (rule 603.4),
// checked as combat begins and again as the trigger resolves; it counts this
// creature itself (a triggered ability's condition does). The defender
// waiver is Krotiq Nestguard's, aimed at itself.
const COMBAT_TEXT =
  "At the beginning of combat on your turn, if you control a creature with power 4 or greater, this creature gets +1/+0 until end of turn and can attack this turn as though it didn't have defender.";

export default defineCard({
  name: "Territorial Witchstalker",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${COMBAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "attack-despite-defender", target: "source" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
