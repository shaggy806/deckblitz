import { defineCard } from "../define.js";

// EDHREC rank 14896.
const ENTERS = "When this artifact enters, target creature gets +2/+2 until end of turn. Untap it.";
const SAC = "{2}, {T}, Sacrifice this artifact: You gain 3 life.";

export default defineCard({
  name: "Guac & Marshmallow Pizza",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Food"],
  keywords: ["flash"],
  text: `Flash\n${ENTERS}\n${SAC}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: SAC,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
