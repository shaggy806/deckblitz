import { defineCard } from "../define.js";

// "Put into your graveyard from the battlefield" is a dies trigger on a
// creature you own; one that's both a Kithkin and an Elf triggers it once
// (the ruling) — one `subtypes` OR clause.
export default defineCard({
  name: "Kithkin Mourncaller",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Scout"],
  power: 2,
  toughness: 2,
  text: "Whenever an attacking Kithkin or Elf is put into your graveyard from the battlefield, you may draw a card.",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", attacking: true, subtypes: ["Kithkin", "Elf"], ownedBy: "you" },
      },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "Whenever an attacking Kithkin or Elf is put into your graveyard from the battlefield, you may draw a card.",
    },
  ],
});
