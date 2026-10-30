import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of lands defending player controls.";

// The defending player is the attack trigger's player (`"trigger-player"`):
// the player attacked, or the controller of the planeswalker or battle's
// protector attacked (rule 506.2). X is read as the trigger resolves.
export default defineCard({
  name: "Terra Ravager",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Beast"],
  power: 0,
  toughness: 4,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "land", controlledBy: "you" }, forPlayer: "trigger-player" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
