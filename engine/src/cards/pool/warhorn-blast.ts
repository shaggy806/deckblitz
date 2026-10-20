import { defineCard } from "../define.js";

export default defineCard({
  name: "Warhorn Blast",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Creatures you control get +2/+1 until end of turn.\nForetell {2}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: [],
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    power: 2,
    toughness: 1,
    duration: "end-of-turn",
  },
  foretell: { cost: "{2}{W}" },
});
