import { defineCard } from "../define.js";

// EDHREC rank 17838.
//
// Rulings:
//   [2022-02-18] The set of creatures that are goaded by this ability are locked in when it
//     resolves. A creature becoming enchanted later or an Aura being removed from a creature later
//     won't change whether it is goaded.
//
// Both steps read the same set as the ability resolves — goading changes
// nothing about which creatures are enchanted — so the counters count the
// creatures just goaded. "Your opponents control" in a free-for-all is every
// other player's.

const TEXT =
  "At the beginning of your end step, goad each creature your opponents control that's enchanted by an Aura you control. Put a +1/+1 counter on Kaima for each creature goaded this way.";
const GOADED = { type: "creature", controlledBy: "opponent", enchantedBy: "you" } as const;

export default defineCard({
  name: "Kaima, the Fractured Calm",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (Until your next turn, the goaded creatures attack each combat if able and attack a player other than you if able.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", filter: GOADED },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { countOf: GOADED } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
