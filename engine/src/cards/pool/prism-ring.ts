import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Magic Origins (ORI). EDHREC rank 8796.
//
// Diamond Mare's shape: the colour is chosen as it enters (rule 614.12), and one trigger per
// colour listens only while that colour is the chosen one.
const COLORS = ["W", "U", "B", "R", "G"] as const;
const TRIGGER_TEXT = "Whenever you cast a spell of the chosen color, you gain 1 life.";

const triggered: TriggeredAbility[] = COLORS.map((color) => ({
  trigger: { on: "cast-spell", who: "you", filter: { colors: [color] } },
  whileCondition: { kind: "chosen-on-enter", value: color },
  targets: [],
  effect: { kind: "gain-life", amount: 1 },
  resolve: null,
  text: TRIGGER_TEXT,
}));

export default defineCard({
  name: "Prism Ring",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a color.\n${TRIGGER_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered,
});
