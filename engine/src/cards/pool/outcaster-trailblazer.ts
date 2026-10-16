import { defineCard } from "../define.js";

const MANA_TEXT = "When this creature enters, add one mana of any color.";
const DRAW_TEXT = "Whenever another creature you control with power 4 or greater enters, draw a card.";

// Not a mana ability: it uses the stack (the ruling). The entering creature's
// power is read as it is on the battlefield, counters it entered with and
// statics included (the ruling).
export default defineCard({
  name: "Outcaster Trailblazer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 4,
  toughness: 2,
  plot: { cost: "{2}{G}" },
  text: `${MANA_TEXT}\n${DRAW_TEXT}\nPlot {2}{G} (You may pay {2}{G} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Add {W}.", effect: { kind: "add-mana", mana: "W", amount: 1 } },
          { text: "Add {U}.", effect: { kind: "add-mana", mana: "U", amount: 1 } },
          { text: "Add {B}.", effect: { kind: "add-mana", mana: "B", amount: 1 } },
          { text: "Add {R}.", effect: { kind: "add-mana", mana: "R", amount: 1 } },
          { text: "Add {G}.", effect: { kind: "add-mana", mana: "G", amount: 1 } },
        ],
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
