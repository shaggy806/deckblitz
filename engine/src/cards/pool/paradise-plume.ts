import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TRIGGER_TEXT = "Whenever a player casts a spell of the chosen color, you may gain 1 life.";
const MANA_TEXT = "{T}: Add one mana of the chosen color.";

// One trigger per colour, live only for the colour chosen as it entered: with
// no colour chosen none triggers (the ruling), and a colorless spell never does.
const triggered: TriggeredAbility[] = COLORS.map((color) => ({
  trigger: { on: "cast-spell", who: "any", filter: { colors: [color] } },
  whileCondition: { kind: "chosen-on-enter", value: color },
  targets: [],
  effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
  resolve: null,
  text: TRIGGER_TEXT,
}));

export default defineCard({
  name: "Paradise Plume",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a color.\n${TRIGGER_TEXT}\n${MANA_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
