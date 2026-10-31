import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30465.
//
// Paradise Plume's trigger on a spell of the colour chosen as it entered
// (`ofChosenColor`), with Urza's Chalice's "you may pay {2}. If you do, …".

const TRIGGER_TEXT = "Whenever a player casts a spell of the chosen color, you may pay {2}. If you do, you gain 2 life.";

const triggered: TriggeredAbility[] = [{
  trigger: { on: "cast-spell", who: "any", filter: { ofChosenColor: true } },
  targets: [],
  effect: { kind: "may", prompt: "Pay {2} to gain 2 life?", cost: "{2}", effect: { kind: "gain-life", amount: 2 } },
  resolve: null,
  text: TRIGGER_TEXT,
}];

export default defineCard({
  name: "Jeweled Torque",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose a color.\n${TRIGGER_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  triggered,
});
