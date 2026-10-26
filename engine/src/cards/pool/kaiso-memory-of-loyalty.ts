import { defineCard } from "../define.js";

export default defineCard({
  name: "Kaiso, Memory of Loyalty",
  art: "https://cards.scryfall.io/art_crop/front/7/5/758abd53-6ad2-406e-8615-8e48678405b4.jpg",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nRemove a ki counter from Kaiso: Prevent all damage that would be dealt to target creature this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "ki", count: 1 } },
      targets: ["creature"],
      effect: { kind: "prevent-damage", target: 0, amount: "all" },
      resolve: null,
      text: "Remove a ki counter from Kaiso: Prevent all damage that would be dealt to target creature this turn.",
    },
  ],
  faces: ["Faithful Squire", "Kaiso, Memory of Loyalty"],
  flip: true,
});
