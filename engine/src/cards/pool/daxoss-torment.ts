import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this enchantment or another enchantment you control enters, this enchantment becomes a 5/5 Demon creature with flying and haste in addition to its other types until end of turn.";

export default defineCard({
  name: "Daxos's Torment",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 5,
        toughness: 5,
        addTypes: ["creature"],
        addSubtypes: ["Demon"],
        keywords: ["flying", "haste"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
