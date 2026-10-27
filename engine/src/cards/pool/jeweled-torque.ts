import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30465.
//
// Paradise Plume's per-colour triggers, live only for the colour chosen as
// it entered, each Urza's Chalice's "you may pay {2}. If you do, …".

const COLORS = ["W", "U", "B", "R", "G"] as const;
const TRIGGER_TEXT = "Whenever a player casts a spell of the chosen color, you may pay {2}. If you do, you gain 2 life.";

const triggered: TriggeredAbility[] = COLORS.map((color) => ({
  trigger: { on: "cast-spell", who: "any", filter: { colors: [color] } },
  whileCondition: { kind: "chosen-on-enter", value: color },
  targets: [],
  effect: { kind: "may", prompt: "Pay {2} to gain 2 life?", cost: "{2}", effect: { kind: "gain-life", amount: 2 } },
  resolve: null,
  text: TRIGGER_TEXT,
}));

export default defineCard({
  name: "Jeweled Torque",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a color.\n${TRIGGER_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered,
});
