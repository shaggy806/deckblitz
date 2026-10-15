import { defineCard } from "../define.js";

// EDHREC rank 28908.
// "Enchant artifact or non-Aura enchantment" is the Aura's target, kept as
// its enchant restriction (rule 303.4). The static is a layer-4 addition
// (creature, Construct) and a layer-7b base P/T, so the enchanted permanent
// keeps its other types, and counters and bonuses still apply on top.
const STATIC_TEXT =
  "Enchanted permanent is a Construct creature with base power and toughness 5/5 in addition to its other types.";
const RETURN_TEXT = "{4}{G}: Return this card from your graveyard to your hand.";

export default defineCard({
  name: "Puppet Crafting",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or non-Aura enchantment\n${STATIC_TEXT}\n${RETURN_TEXT}`,
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment", notSubtypes: ["Aura"] }] },
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Construct"],
      setBasePt: { power: 5, toughness: 5 },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}{G}", tap: false },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
