import { defineCard } from "../define.js";

const ENTER_TEXT = "As this creature enters, exile an instant or sorcery card from your graveyard.";
const PT_TEXT = "Living Lore's power and toughness are each equal to the exiled card's mana value.";
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage, you may sacrifice it. If you do, you may cast the exiled card without paying its mana cost.";

export default defineCard({
  name: "Living Lore",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PT_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        asEnters: { exile: { filter: { typesAnyOf: ["instant", "sorcery"] }, count: 1 } },
      },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { aggregate: "sum", of: "mana-value", filter: {}, in: "exiled-with-source" }, plusPower: 0, plusToughness: 0 },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", combat: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Sacrifice Living Lore to cast the exiled card without paying its mana cost?",
        effect: {
          kind: "sacrifice-source",
          then: { kind: "cast-now", from: "exiled-with-source", free: true },
        },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
