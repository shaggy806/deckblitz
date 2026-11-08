import { defineCard } from "../define.js";

const TRIGGER =
  "Whenever this creature deals combat damage to a player, untap it. After this phase, there is an additional combat phase.";
const RESTRICTION = "This creature can't attack a player it has already attacked this turn.";

export default defineCard({
  name: "Bloodthirster",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${TRIGGER}\n${RESTRICTION}`,
  static: [{ affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", at: "attacked-this-turn" }], text: RESTRICTION }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: "source" },
          { kind: "additional-combat", afterThisPhase: true },
        ],
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
