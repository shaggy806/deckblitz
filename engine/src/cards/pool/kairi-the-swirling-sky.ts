import { defineCard } from "../define.js";

// EDHREC rank 7488. A modal dies trigger: its first mode a group of any number of
// targets with total mana value 6 or less (Patch Up's cap), its second Another
// Chance's mill and untargeted return.

export default defineCard({
  name: "Kairi, the Swirling Sky",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon", "Spirit"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying, ward {3}\nWhen Kairi dies, choose one —\n• Return any number of target nonland permanents with total mana value 6 or less to their owners' hands.\n• Mill six cards, then return up to two instant and/or sorcery cards from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Return any number of target nonland permanents with total mana value 6 or less to their owners' hands.",
            targets: [{ kind: "any-number", of: "nonland-permanent", maxTotalManaValue: 6 }],
            effect: {
              kind: "for-each-target",
              from: 0,
              simultaneous: true,
              effect: { kind: "return-to-hand", target: 0 },
            },
          },
          {
            text: "Mill six cards, then return up to two instant and/or sorcery cards from your graveyard to your hand.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "mill", target: "you", amount: 6 },
                {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  min: 0,
                  max: 2,
                  destination: "hand",
                  leftover: "stay",
                  filter: { typesAnyOf: ["instant", "sorcery"] },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "When Kairi dies, choose one —\n• Return any number of target nonland permanents with total mana value 6 or less to their owners' hands.\n• Mill six cards, then return up to two instant and/or sorcery cards from your graveyard to your hand.",
    },
  ],
});
