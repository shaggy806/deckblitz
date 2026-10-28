import { defineCard } from "../define.js";

// "Another enchantment or creature": Echo of Death's Wail's `exceptSource`.
const ENTER_TEXT =
  "When this enchantment enters, you may sacrifice another enchantment or creature. If you do, draw two cards.";
const SAC_TEXT =
  "When you sacrifice this enchantment, manifest dread. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)";

export default defineCard({
  name: "Disturbing Mirth",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["enchantment", "creature"] },
            exceptSource: true,
            text: "Sacrifice another enchantment or creature",
          },
        ],
        ifDid: { kind: "draw", amount: 2 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "sacrifice", who: "you", selfOnly: true },
      targets: [],
      effect: { kind: "manifest-dread" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
