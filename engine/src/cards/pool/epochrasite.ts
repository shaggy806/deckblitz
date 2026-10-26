import { defineCard } from "../define.js";

// "If you didn't cast it from your hand": Patched Plaything's condition with
// the amounts swapped — a card put onto the battlefield, or cast from
// anywhere else (suspend's free cast from exile), gets the counters.
export default defineCard({
  name: "Epochrasite",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: "This creature enters with three +1/+1 counters on it if you didn't cast it from your hand.\nWhen this creature dies, exile it with three time counters on it and it gains suspend. (At the beginning of its owner's upkeep, they remove a time counter. When the last is removed, they may cast this card without paying its mana cost. It has haste.)",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
            then: 0,
            else: 3,
          },
        },
      },
      text: "This creature enters with three +1/+1 counters on it if you didn't cast it from your hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Sinister Concierge's shape: exile the card from the graveyard, then
      // the cards exiled this way get the counters and suspend.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          { kind: "give-suspend", timeCounters: 3 },
        ],
      },
      resolve: null,
      text: "When this creature dies, exile it with three time counters on it and it gains suspend.",
    },
  ],
});
