import { defineCard } from "../define.js";

// The player dealt the damage chooses the target, among the nonland
// permanents of any of this creature's controller's opponents — their own or
// another opponent's.
const TEXT =
  "Whenever this creature deals combat damage to a player, destroy target nonland permanent of that player's choice that one of your opponents controls.";

export default defineCard({
  name: "Bladegriff Prototype",
  manaCost: "{5}",
  types: ["artifact", "creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { notTypes: ["land"] } }],
      targetsChosenBy: "trigger-player",
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
