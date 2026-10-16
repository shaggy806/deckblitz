import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever Kylox attacks, sacrifice any number of other creatures, then exile the top X cards of your library, where X is their total power. You may cast any number of instant and/or sorcery spells from among the exiled cards without paying their mana costs.";

export default defineCard({
  name: "Kylox, Visionary Inventor",
  manaCost: "{5}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Artificer"],
  power: 4,
  toughness: 4,
  keywords: ["menace", "haste"],
  text: `Menace, ward {2}, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    {
      // X is the sacrificed creatures' power as they last existed (the
      // ruling); the spells are cast as this resolves, timing ignored, X 0.
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            upTo: { countOf: { type: "creature", controlledBy: "you" } },
            exceptSource: true,
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of other creatures",
          },
          { kind: "exile-from-library", whose: "you", amount: { thisWay: "sacrificed", sumOf: "power" } },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            free: true,
            repeat: true,
            spell: { typesAnyOf: ["instant", "sorcery"] },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
