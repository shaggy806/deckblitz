import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// "A spell of the chosen color": the trigger's filter reads the colour chosen
// as it entered (`ofChosenColor`) — once for a spell of that colour however
// many colours it has, and never with no colour chosen (its ruling).

const TRIGGER_TEXT = "Whenever you cast a spell of the chosen color, put a +1/+1 counter on this creature.";

const triggered: TriggeredAbility[] = [{
  trigger: { on: "cast-spell", who: "you", filter: { ofChosenColor: true } },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  resolve: null,
  text: TRIGGER_TEXT,
}];

export default defineCard({
  name: "Diamond Knight",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Knight"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance (Attacking doesn't cause this creature to tap.)\nAs this creature enters, choose a color.\n${TRIGGER_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered,
});
