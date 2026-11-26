import { defineCard } from "../define.js";

// Chapter I counts the foretold cards its controller owns in exile (rule
// 702.143c-d, face down, `foretold`). Chapter II's mana pays the foretell
// special action (`purposes: ["foretell"]`, 702.143a) or a spell with
// printed foretell, cast from anywhere (the ruling). Chapter III's "card with
// foretell" is the printed keyword too.

const CHAPTER_I = "I — You gain 2 life for each foretold card you own in exile.";
const SPEND = "Spend this mana only to foretell cards or cast spells that have foretell.";
const CHAPTER_II = `II — Add {W}{U}. ${SPEND}`;
const CHAPTER_III = "III — Return target card with foretell from your graveyard to your hand.";

export default defineCard({
  name: "Niko Defies Destiny",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "gain-life", amount: { product: [{ countInExile: { ownedBy: "you", foretold: true } }, 2] } },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { all: ["W", "U"] },
        amount: 1,
        spendOnly: { spell: { hasKeyword: "foretell" }, purposes: ["foretell"], text: SPEND },
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { hasKeyword: "foretell" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
