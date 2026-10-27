import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature deals damage to a player, tap target land that player controls. That land doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Mana Skimmer",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "land" } }],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
