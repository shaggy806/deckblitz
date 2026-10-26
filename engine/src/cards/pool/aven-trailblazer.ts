import { defineCard } from "../define.js";

// Conflux (CON). A characteristic-defining ability for its toughness alone
// (People of the Woods' shape, counting domain).

const DOMAIN =
  "Domain — Aven Trailblazer's toughness is equal to the number of basic land types among lands you control.";

export default defineCard({
  name: "Aven Trailblazer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 2,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${DOMAIN}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { basicLandTypes: "you" },
        plusPower: 0,
        plusToughness: 0,
        only: "toughness",
      },
      text: DOMAIN,
    },
  ],
});
