import { defineCard } from "../define.js";

// X may be 0: nothing is exiled, and a card exiled earlier — by anything — with
// a study counter may still go to your hand (its rulings).
const TEXT =
  "{X}{U}{U}, {T}: Exile the top X cards of your library and put a study counter on each of them. Then you may put a card you own in exile with a study counter on it into your hand.";

export default defineCard({
  name: "Imbraham, Dean of Theory",
  art: "https://cards.scryfall.io/art_crop/back/8/b/8b45dc40-6827-46a7-a9b7-802be698d053.jpg",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{X}{U}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", whose: "you", amount: "x", withCounters: { kind: "study", amount: 1 } },
          {
            kind: "look-and-choose",
            zone: "exile",
            min: 0,
            max: 1,
            filter: { ownedBy: "you", counters: { kind: "study", compare: { op: "gte", n: 1 } } },
            destination: "hand",
            leftover: "stay",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Kianne, Dean of Substance", "Imbraham, Dean of Theory"],
});
