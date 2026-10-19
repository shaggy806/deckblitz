import { defineCard } from "../define.js";

export default defineCard({
  name: "Dig Deep",
  art: "https://cards.scryfall.io/art_crop/back/4/f/4fe31ab9-d217-464e-96b1-d8a1ca6ad005.jpg",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Choose target creature. Mill four cards, then put a +1/+1 counter on that creature for each creature card milled this way. (Then exile this card. You may cast the creature later from exile.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "mill", target: "you", amount: 4 },
      {
        kind: "add-counter",
        target: 0,
        counter: "+1/+1",
        amount: { thisWay: "milled", filter: { type: "creature" } },
      },
    ],
  },
  faces: ["Colossal Badger", "Dig Deep"],
  adventure: true,
});
