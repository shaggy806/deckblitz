import { defineCard } from "../define.js";
import { fortify } from "../helpers.js";

// EDHREC rank 20337. A Fortification goes on a land as an Equipment goes on a
// creature (rule 301.6); "fortified land" is what it's attached to (301.5f).
const STATIC_TEXT = "Fortified land has indestructible.";
const TAP_TEXT = "Whenever fortified land becomes tapped, target creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Darksteel Garrison",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Fortification"],
  text: `${STATIC_TEXT}\n${TAP_TEXT}\nFortify {3} ({3}: Attach to target land you control. Fortify only as a sorcery. This card enters unattached and stays on the battlefield if the land leaves.)`,
  static: [{ affects: { scope: "attached" }, grantKeywords: ["indestructible"], text: STATIC_TEXT }],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
  activated: [fortify("{3}")],
});
