import { defineCard } from "../define.js";

// Llanowar Mentor's token: a 1/1 green Elf Druid creature token *named*
// Llanowar Elves with "{T}: Add {G}." — keyed " Token", named by `tokenName`.
// No mana cost (the ruling: its mana value is 0).

export default defineCard({
  name: "Llanowar Elves Token",
  tokenName: "Llanowar Elves",
  art: "cbcb0668-e88c-4462-b079-34f140c0277e",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: "{T}: Add {G}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
});
