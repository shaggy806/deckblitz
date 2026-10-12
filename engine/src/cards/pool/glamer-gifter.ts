import { defineCard } from "../define.js";
import { EVERY_CREATURE_TYPE } from "../../subtypes.js";

// EDHREC rank 12646.
//
// Rulings:
//   [2025-11-17] Glamer Gifter's last ability overwrites all previous effects that set the
//     affected creature's base power and toughness to specific values. Any power- or
//     toughness-setting effects that start to apply after the ability resolves will overwrite this
//     effect.

const ENTER_TEXT =
  "When this creature enters, choose up to one other target creature. Until end of turn, that creature has base power and toughness 4/4 and gains all creature types.";

export default defineCard({
  name: "Glamer Gifter",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 1,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: [],
        addSubtypes: [EVERY_CREATURE_TYPE],
        duration: "end-of-turn",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
