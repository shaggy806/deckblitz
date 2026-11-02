import { defineCard } from "../define.js";

// The count is of lands that entered, ones since gone included (a sacrificed
// Lander's fetched land stays counted), each as it entered; a creature land
// entering isn't one of them yet as its own counters are decided (rule 614.12).
const STATIC =
  "Each creature you control enters with an additional +1/+1 counter on it for each land that entered the battlefield under your control this turn.";
const ENTERS =
  "When this enchantment enters, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")";

export default defineCard({
  name: "Bioengineered Future",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTERS}\n${STATIC}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: { turnHistory: "entered", filter: { type: "land" } } },
      },
      text: STATIC,
    },
  ],
});
