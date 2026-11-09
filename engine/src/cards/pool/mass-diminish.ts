import { defineCard } from "../define.js";

// Only the creatures that player controls as it resolves (rule 611.2c, the
// ruling): `become` fixes them then.
export default defineCard({
  name: "Mass Diminish",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["sorcery"],
  flashback: { cost: "{3}{U}" },
  text: "Until your next turn, creatures target player controls have base power and toughness 1/1.\nFlashback {3}{U} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  targets: ["player"],
  effect: {
    kind: "become",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    power: 1,
    toughness: 1,
    duration: "until-your-next-turn",
  },
});
