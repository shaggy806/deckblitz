import { defineCard } from "../define.js";

// Only creature cards come back: a land animated when it was exiled stays
// exiled, since it's no creature card there (the filter reads it in exile).

const EXILE_TEXT = "{2}, {T}: Exile target creature you control.";
const RETURN_TEXT = "{4}, {T}, Sacrifice this land: Return each creature card exiled with this land to the battlefield under its owner's control.";

export default defineCard({
  name: "Endless Sands",
  manaCost: "",
  colors: [],
  types: ["land"],
  subtypes: ["Desert"],
  text: `{T}: Add {C}.\n${EXILE_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{2}", tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "battlefield", filter: { type: "creature" } },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
