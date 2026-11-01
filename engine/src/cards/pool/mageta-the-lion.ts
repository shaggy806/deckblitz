import { defineCard } from "../define.js";

const TEXT = "{2}{W}{W}, {T}, Discard two cards: Destroy all creatures except for Mageta. Those creatures can't be regenerated.";

export default defineCard({
  name: "Mageta the Lion",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{W}{W}", tap: true, discard: { count: 2 } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
