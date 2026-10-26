import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 28767.
//
// Swamp Mosquito's shape: "attacks and isn't blocked" (rule 509.3g), whose
// trigger player is the defending player. The counter comes from the trigger,
// so removing the Cobra or preventing its damage afterwards doesn't stop it
// (the ruling).

const TEXT =
  "Whenever this creature attacks and isn't blocked, defending player gets a poison counter. (A player with ten or more poison counters loses the game.)";

export default defineCard({
  name: "Crypt Cobra",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
