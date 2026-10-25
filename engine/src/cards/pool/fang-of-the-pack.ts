import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

// Granted melee is the melee trigger itself, until end of turn; each grant is
// its own instance and triggers separately.

const TEXT = "At the beginning of combat on your turn, another target creature you control gains melee until end of turn.";

export default defineCard({
  name: "Fang of the Pack",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 5,
  toughness: 3,
  text: `Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)\n${TEXT} (If a creature has multiple instances of melee, each triggers separately.)`,
  triggered: [
    melee(),
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-triggered", target: 0, ability: melee(), duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
