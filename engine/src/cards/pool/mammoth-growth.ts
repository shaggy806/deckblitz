import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 20342.
export default defineCard({
  name: "Mammoth Growth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +4/+4 until end of turn.\nForetell {G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  foretell: { cost: "{G}" },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
});
