import { defineCard } from "../define.js";

// Dominaria (DOM). The creature is chosen as this enters (rule 614.1c —
// `choosePermanentOnEnter`), not as the ability is activated; sacrificed for
// the cost, this is read as it last existed (rule 608.2h) for "the chosen
// creature" (`target: "chosen"`), which gets nothing once it has left the
// battlefield (rule 400.7).

const CHOOSE = "As this creature enters, choose another creature you control.";
const SAVE = "Sacrifice this creature: The chosen creature gains indestructible until end of turn.";

export default defineCard({
  name: "Dauntless Bodyguard",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  text: `${CHOOSE}\n${SAVE}`,
  choosePermanentOnEnter: {
    filter: { type: "creature", controlledBy: "you" },
    prompt: "Choose another creature you control",
  },
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "grant-keyword", target: "chosen", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: SAVE,
    },
  ],
});
