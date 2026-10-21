import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

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
  name: "Diamond Mare",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horse"],
  power: 1,
  toughness: 3,
  text: `As this creature enters, choose a color.\n${TRIGGER_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered,
});
