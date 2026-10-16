import { defineCard } from "../define.js";

// EDHREC rank 19243. "Another target creature you control": a mandatory
// target, never this creature (Living Lightning, Charged Up's slot).
const ENTER_TEXT =
  "When this creature enters, another target creature you control gets +1/+1 and gains haste until end of turn.";

export default defineCard({
  name: "Cunning Coyote",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Coyote"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  plot: { cost: "{1}{R}" },
  text: `Haste\n${ENTER_TEXT}\nPlot {1}{R} (You may pay {1}{R} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
