import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this creature or another enchantment you control enters, target creature gains intimidate until end of turn.";

export default defineCard({
  name: "Dreadbringer Lampads",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Nymph"],
  power: 4,
  toughness: 2,
  text: `${TEXT} (It can't be blocked except by artifact creatures and/or creatures that share a color with it.)`,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "intimidate", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    }),
  ],
});
