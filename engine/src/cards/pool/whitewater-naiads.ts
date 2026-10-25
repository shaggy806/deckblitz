import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, target creature can't be blocked this turn.";

export default defineCard({
  name: "Whitewater Naiads",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    }),
  ],
});
