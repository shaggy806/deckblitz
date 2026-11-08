import { defineCard } from "../define.js";

const TWO = "{T}: Add two mana of any one color. Spend this mana only to cast spells from your graveyard.";
const RETURN = "{G}{U}, {T}, Exile this creature: Return target card with flashback you own from exile to your hand.";

export default defineCard({
  name: "Rootcoil Creeper",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Plant", "Horror"],
  power: 2,
  toughness: 2,
  text: `{T}: Add one mana of any color.\n${TWO}\n${RETURN}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 2,
        spendOnly: { castFrom: { zones: ["graveyard"], yours: true }, text: "Spend this mana only to cast spells from your graveyard." },
      },
      resolve: null,
      text: TWO,
    },
    {
      cost: { mana: "{G}{U}", tap: true, do: { kind: "exile", target: "source" } },
      targets: [{ kind: "card-in-exile", whose: "you", filter: { hasKeyword: "flashback" } }],
      effect: { kind: "return-to-hand", target: 0, from: "exile" },
      resolve: null,
      text: RETURN,
    },
  ],
});
