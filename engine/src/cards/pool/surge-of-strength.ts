import { defineCard } from "../define.js";

export default defineCard({
  name: "Surge of Strength",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, discard a red or green card.\nTarget creature gains trample and gets +X/+0 until end of turn, where X is that creature's mana value.",
  additionalCost: { discard: 1, discardFilter: { anyOf: [{ colors: ["R"] }, { colors: ["G"] }] } },
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: { manaValueOf: 0 }, toughness: 0, duration: "end-of-turn" },
    ],
  },
});
