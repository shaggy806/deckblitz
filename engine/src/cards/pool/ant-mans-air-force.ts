import { defineCard } from "../define.js";

// EDHREC rank 29105.

const ATTACK_TEXT = "Whenever this creature attacks, up to one target creature gets -1/-0 until end of turn.";

export default defineCard({
  name: "Ant-Man's Air Force",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
