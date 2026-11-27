import { defineCard } from "../define.js";

// EDHREC rank 25641. The granted tax is the creature's own static
// (`grant-static`), read where combat taxes are (`combat/tax.ts`): its
// controller pays, the Clerics counted as the creature attacks or blocks, and
// two grants are two taxes (the ruling).

const GRANTED = "This creature can't attack or block unless its controller pays {1} for each Cleric on the battlefield.";
const TEXT = `{1}{W}: Until end of turn, target creature gains "${GRANTED}"`;

export default defineCard({
  name: "Whipgrass Entangler",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "grant-static",
        target: 0,
        ability: {
          affects: { scope: "self" },
          combatTax: { on: ["attack", "block"], generic: { countOf: { subtype: "Cleric" } } },
          text: GRANTED,
        },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
