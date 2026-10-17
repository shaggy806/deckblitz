import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, gain control of target artifact that player controls.";

/** Wake the Dragon's 6/6 black and red Dragon with flying, menace and its
 * artifact-stealing combat damage trigger. */
export default defineCard({
  name: "Dragon Token (Wake the Dragon)",
  art: "11335886-a422-42ff-be14-226602202603",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "menace"],
  text: `Flying, menace\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "artifact" } }],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
