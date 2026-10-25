import { defineCard } from "../define.js";

// EDHREC rank 14037.

export default defineCard({
  name: "Gnarlroot Trapper",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 1,
  toughness: 1,
  text: "{T}, Pay 1 life: Add {G}. Spend this mana only to cast an Elf creature spell.\n{T}: Target attacking Elf you control gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy it.)",
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "G",
        amount: 1,
        spendOnly: { spell: { type: "creature", subtype: "Elf" }, text: "Spend this mana only to cast an Elf creature spell." },
      },
      resolve: null,
      text: "{T}, Pay 1 life: Add {G}. Spend this mana only to cast an Elf creature spell.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Elf", attacking: true } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target attacking Elf you control gains deathtouch until end of turn.",
    },
  ],
});
