import { defineCard } from "../define.js";

// EDHREC rank 29234.
//
// Rulings:
//   [2004-10-04] You only get the opportunity to pay {U}{U}{U} (and thus to return Puppet
//     Master to its owner's hand) if the creature card actually gets returned to its owner's
//     hand. If it isn't (for instance, if it was removed from the graveyard prior to this
//     ability resolving), you don't get the option to pay.
//
// Demonic Vigor's return, then the ruling's gate as a `this-way` check on
// that return, then Angelic Destiny's return of the Aura itself.

const TEXT =
  "When enchanted creature dies, return that card to its owner's hand. If that card is returned to its owner's hand this way, you may pay {U}{U}{U}. If you do, return this card to its owner's hand.";

export default defineCard({
  name: "Puppet Master",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand", target: "trigger-object", from: "graveyard" },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "returned-to-hand" },
            then: {
              kind: "may",
              prompt: "Pay {U}{U}{U} to return Puppet Master to its owner's hand?",
              cost: "{U}{U}{U}",
              effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
