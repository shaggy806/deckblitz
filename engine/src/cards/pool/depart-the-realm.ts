import { defineCard } from "../define.js";

// EDHREC rank 10066. Kaldheim.

export default defineCard({
  name: "Depart the Realm",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  foretell: { cost: "{U}" },
  text: "Return target nonland permanent to its owner's hand.\nForetell {U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
});
