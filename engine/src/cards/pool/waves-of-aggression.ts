import { defineCard } from "../define.js";

export default defineCard({
  name: "Waves of Aggression",
  manaCost: "{3}{R/W}{R/W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  retrace: true,
  text: "Untap all creatures that attacked this turn. After this main phase, there is an additional combat phase followed by an additional main phase.\nRetrace (You may cast this card from your graveyard by discarding a land card in addition to paying its other costs.)",
  effect: {
    kind: "sequence",
    effects: [{ kind: "untap-all", filter: { type: "creature", attackedThisTurn: true } }, { kind: "additional-combat" }],
  },
});
