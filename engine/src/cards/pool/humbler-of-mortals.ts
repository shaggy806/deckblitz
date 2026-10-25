import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, creatures you control gain trample until end of turn.";

export default defineCard({
  name: "Humbler of Mortals",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Elemental"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you" },
        keyword: "trample",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
