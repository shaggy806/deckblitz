import { defineCard } from "../define.js";

// Rulings:
//   The colors are white, blue, black, red, and green. Colorless is not a color.
//   Lands are normally colorless permanents, even if they tap for mana of a certain color.
//   An Aura being put onto the battlefield this way can't enchant anything else that is being
//     put onto the battlefield at the same time.
//   The value of X is calculated only once, as Aurora Awakener's triggered ability resolves.
//   If an Aura is put onto the battlefield without being cast, the Aura's controller-to-be
//     chooses what it will enchant as it enters the battlefield.
//
// X counts Aurora Awakener itself, still on the battlefield as it resolves. The permanent cards
// found are offered to choose any number of (`anyNumber`); those not chosen go to the bottom with
// the rest of the revealed cards, in a random order.

const TEXT =
  "Vivid — When this creature enters, reveal cards from the top of your library until you reveal X permanent cards, where X is the number of colors among permanents you control. Put any number of those permanent cards onto the battlefield, then put the rest of the revealed cards on the bottom of your library in a random order.";

export default defineCard({
  name: "Aurora Awakener",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant", "Druid"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "reveal-until-count",
        filter: { notTypes: ["instant", "sorcery"] },
        count: { colorsAmong: { controlledBy: "you" } },
        put: "battlefield",
        anyNumber: true,
        rest: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
