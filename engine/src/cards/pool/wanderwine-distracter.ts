import { defineCard } from "../define.js";

// EDHREC rank 23149. It becomes tapped however it's tapped — attacking, a
// cost, an opponent's tap effect (rule 701.26a).

const TEXT = "Whenever this creature becomes tapped, target creature an opponent controls gets -3/-0 until end of turn.";

export default defineCard({
  name: "Wanderwine Distracter",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
