import { defineCard } from "../define.js";

// EDHREC rank 10493.
//
// Rulings:
//   [2019-06-14] A creature dealt combat damage by Frostwalk Bastion won't untap during its
//     controller's next untap step, even if it was already tapped and even if Frostwalk Bastion
//     leaves the battlefield before then.
//   [2019-06-14] If you turn Frostwalk Bastion into a creature but haven't controlled it
//     continuously since your most recent turn began, you won't be able to activate its mana
//     ability or attack with it.

export default defineCard({
  name: "Frostwalk Bastion",
  colors: [],
  supertypes: ["snow"],
  types: ["land"],
  text: "{T}: Add {C}.\n{1}{S}: Until end of turn, this land becomes a 2/3 Construct artifact creature. It's still a land. ({S} can be paid with one mana from a snow source.)\nWhenever this land deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}{S}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 2,
        toughness: 3,
        addTypes: ["artifact", "creature"],
        addSubtypes: ["Construct"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{S}: Until end of turn, this land becomes a 2/3 Construct artifact creature. It's still a land.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "tap", target: "trigger-recipient", doesntUntapNext: true },
      resolve: null,
      text: "Whenever this land deals combat damage to a creature, tap that creature and it doesn't untap during its controller's next untap step.",
    },
  ],
});
