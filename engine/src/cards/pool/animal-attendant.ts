import { defineCard } from "../define.js";

const TEXT =
  "{T}: Add one mana of any color. If that mana is spent to cast a non-Human creature spell, that creature enters " +
  "with an additional +1/+1 counter on it.";

export default defineCard({
  name: "Animal Attendant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        spellEntersWith: { spell: { type: "creature", notSubtypes: ["Human"] }, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
