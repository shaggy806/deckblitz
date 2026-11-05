import { defineCard } from "../define.js";

const TOKEN =
  "Whenever you cast a creature spell, create a 1/1 red Mercenary creature token with \"{T}: Target creature you control gets +1/+0 until end of turn. Activate only as a sorcery.\"";
const MANA = "{T}: Choose a color. Add one mana of that color for each different power among creatures you control.";

export default defineCard({
  name: "Selvala, Eager Trailblazer",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Scout"],
  power: 4,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${TOKEN}\n${MANA}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: { aggregate: "distinct", of: "power", filter: { type: "creature", controlledBy: "you" } },
      },
      resolve: null,
      text: MANA,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Mercenary Token", count: 1 },
      resolve: null,
      text: TOKEN,
    },
  ],
});
