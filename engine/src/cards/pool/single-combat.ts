import { defineCard } from "../define.js";

export default defineCard({
  name: "Single Combat",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Each player chooses a creature or planeswalker they control, then sacrifices the rest. Players can't cast creature or planeswalker spells until the end of your next turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice-all-but", who: "each-player", keep: 1, filter: { typesAnyOf: ["creature", "planeswalker"] } },
      { kind: "prohibit", prohibits: [{ act: "cast", who: "each-player", filter: { typesAnyOf: ["creature", "planeswalker"] } }], duration: "until-end-of-your-next-turn" },
    ],
  },
});
