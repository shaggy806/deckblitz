import { defineCard } from "../define.js";

export default defineCard({
  name: "Gonti, Lord of Luxury",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Aetherborn", "Rogue"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhen Gonti enters, look at the top four cards of target opponent's library, exile one of them face down, then put the rest on the bottom of that library in a random order. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      resolve: null,
      text: "When Gonti enters, look at the top four cards of target opponent's library, exile one of them face down, then put the rest on the bottom of that library in a random order. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.",
      targets: ["opponent"],
      effect: {
        kind: "look-and-choose",
        from: { target: 0 },
        zone: "library",
        count: 4,
        min: 1,
        max: 1,
        destination: "exile-face-down",
        unlinked: true,
        mayPlay: { duration: "while-exiled", spendAs: "any-type" },
        leftover: "bottom-random",
      },
    },
  ],
});
