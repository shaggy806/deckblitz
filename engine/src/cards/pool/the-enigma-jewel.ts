import { defineCard } from "../define.js";

// Rulings:
//   Craft abilities are activated abilities. You can spend mana from The Enigma Jewel's activated
//     ability to activate its own craft ability.
//   If the materials required include multiple objects, you may exile some of them from among
//     permanents you control and the rest from among cards in your graveyard.

const CRAFT_TEXT =
  "Craft with four or more nonlands with activated abilities {8}{U} ({8}{U}, Exile this artifact, Exile the four or more from among other permanents you control and/or cards in your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)";

export default defineCard({
  name: "The Enigma Jewel",
  manaCost: "{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `The Enigma Jewel enters tapped.\n{T}: Add {C}{C}. Spend this mana only to activate abilities.\n${CRAFT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "The Enigma Jewel enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "C",
        amount: 2,
        spendOnly: { abilityOf: {}, abilityOfAnyZone: true, text: "Spend this mana only to activate abilities." },
      },
      resolve: null,
      text: "{T}: Add {C}{C}. Spend this mana only to activate abilities.",
    },
    {
      cost: {
        mana: "{8}{U}",
        tap: false,
        do: { kind: "exile", target: "source" },
        craft: {
          count: 4,
          orMore: true,
          filter: { notTypes: ["land"], hasActivatedAbility: {} },
          text: "four or more nonlands with activated abilities",
        },
      },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "craft-return" },
      resolve: null,
      text: "Craft with four or more nonlands with activated abilities {8}{U}",
    },
  ],
  faces: ["The Enigma Jewel", "Locus of Enlightenment"],
  transform: true,
});
