import { defineCard } from "../define.js";

const TEXT = "{T}: Destroy target artifact if its mana value is equal to the amount of unspent mana you have.";

// EDHREC rank 16303. The pool as the ability resolves (rule 106.4).
export default defineCard({
  name: "Glissa Sunseeker",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["artifact"],
      effect: {
        kind: "conditional",
        condition: { kind: "amounts", left: { manaValueOf: 0 }, op: "eq", right: { unspentMana: "you" } },
        then: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
