import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever a player casts a spell of the chosen color, you may gain 1 life.";
const MANA_TEXT = "{T}: Add one mana of the chosen color.";

// "A spell of the chosen color" reads the colour chosen as it entered
// (`ofChosenColor`): with no colour chosen nothing triggers it (the ruling),
// and a colorless spell never does.
const triggered: TriggeredAbility[] = [{
  trigger: { on: "cast-spell", who: "any", filter: { ofChosenColor: true } },
  targets: [],
  effect: { kind: "may", prompt: "Gain 1 life?", effect: { kind: "gain-life", amount: 1 } },
  resolve: null,
  text: TRIGGER_TEXT,
}];

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
