import { defineCard } from "../define.js";

export default defineCard({
  name: "Kaya's Onslaught",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +1/+1 and gains double strike until end of turn.\nForetell {W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
    ],
  },
  foretell: { cost: "{W}" },
});
