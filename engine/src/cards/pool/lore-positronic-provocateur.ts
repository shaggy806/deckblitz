import { defineCard } from "../define.js";

const PUMP_MODE = "Target creature gets +1/+0 until end of turn and can't be blocked this turn.";
const SURVEIL_MODE =
  "Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)";

export default defineCard({
  name: "Lore, Positronic Provocateur",
  manaCost: "{1}{U/B}{U/B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Android", "Rogue"],
  power: 2,
  toughness: 3,
  text: `When Lore enters, choose one —\n• ${PUMP_MODE}\n• ${SURVEIL_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: PUMP_MODE,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
                { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
              ],
            },
          },
          { text: SURVEIL_MODE, effect: { kind: "surveil", amount: 2 } },
        ],
      },
      resolve: null,
      text: "When Lore enters, choose one —",
    },
  ],
});
