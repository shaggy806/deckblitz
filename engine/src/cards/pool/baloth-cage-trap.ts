import { defineCard } from "../define.js";

export default defineCard({
  name: "Baloth Cage Trap",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent had an artifact enter the battlefield under their control this turn, you may pay {1}{G} rather than pay this spell's mana cost.\nCreate a 4/4 green Beast creature token.",
  alternativeCost: {
    mana: "{1}{G}",
    condition: { kind: "turn-history", what: "entered", who: "opponent", filter: { type: "artifact" } },
  },
  effect: { kind: "create-token", token: "Beast Token", count: 1 },
});
