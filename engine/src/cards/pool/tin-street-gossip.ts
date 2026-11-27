import { defineCard } from "../define.js";

// "Face-down spells" are spells cast face down by morph, megamorph or disguise
// (rule 708.4), the whole of their cost; a face-down permanent is a 2/2
// creature (708.2a), so "to turn creatures face up" is the turn-face-up
// special action (116.2b), whichever way it's paid: a morph or disguise cost,
// or a manifested or cloaked card's mana cost.

const MANA_TEXT = "{T}: Add {R}{G}. Spend this mana only to cast face-down spells or to turn creatures face up.";

export default defineCard({
  name: "Tin Street Gossip",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Advisor"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["R", "G"] },
        amount: 1,
        spendOnly: {
          purposes: ["face-down-spell", "turn-face-up"],
          text: "Spend this mana only to cast face-down spells or to turn creatures face up.",
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
