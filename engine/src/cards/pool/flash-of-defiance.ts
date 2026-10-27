import { defineCard } from "../define.js";

// A rule over every green or white creature for the rest of the turn, so one
// that enters or turns green later can't block either (rule 611.2c).
export default defineCard({
  name: "Flash of Defiance",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Green creatures and white creatures can't block this turn.\nFlashback—{1}{R}, Pay 3 life. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "restrict",
    filter: { type: "creature", anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
    restrictions: ["cant-block"],
  },
  flashback: { cost: "{1}{R}", payLife: 3 },
});
