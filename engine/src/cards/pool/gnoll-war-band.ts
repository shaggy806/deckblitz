import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

export default defineCard({
  name: "Gnoll War Band",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Gnoll"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: "This spell costs {1} less to cast for each opponent who was dealt damage this turn.\nMenace\nMyriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)",
  selfCostReduction: {
    // Unconditional: the same always-true gate Blasphemous Act uses.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { playersWithTurnStat: "damage-taken", who: "each-opponent" },
  },
  triggered: [myriad()],
});
