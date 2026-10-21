import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// "A spell of the chosen color": one cast trigger per colour, each part of
// whose trigger condition is that colour being the one chosen as it entered
// (`whileCondition` over `chosen-on-enter`) — so exactly one can fire, once
// for a spell of that colour however many colours it has, and none with no
// colour chosen (its ruling).

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TRIGGER_TEXT = "Whenever you cast a spell of the chosen color, put a +1/+1 counter on this creature.";

const triggered: TriggeredAbility[] = COLORS.map((color) => ({
  trigger: { on: "cast-spell", who: "you", filter: { colors: [color] } },
  whileCondition: { kind: "chosen-on-enter", value: color },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  resolve: null,
  text: TRIGGER_TEXT,
}));

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
