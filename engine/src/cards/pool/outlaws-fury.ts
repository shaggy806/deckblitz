import { defineCard } from "../define.js";

// EDHREC rank 18275.
//
// Rulings:
//   [2024-04-12] A card, spell, or permanent is an outlaw if it has the Assassin, Mercenary,
//     Pirate, Rogue, or Warlock creature type. It doesn't matter if it has more than one of those
//     creature types; as long as it has at least one, it's an outlaw.
//   [2024-04-12] You pay all costs and follow all normal timing rules for a card played from exile
//     this way. For example, if the exiled card is a land card, you may play it only during your
//     main phase while the stack is empty.
//   [2024-04-12] If an ability refers to an outlaw or whether a player controls an outlaw, it's
//     referring only to permanents with one or more of the creature types specified above.
//     Notably, it's not referring to any spell or card not on the battlefield. However, other
//     abilities may refer to an "outlaw spell" or "outlaw card" in a zone other than the
//     battlefield. Those abilities refer to spells and cards with one or more of the specified
//     creature types.
//   [2024-04-12] Outlaws' Fury affects only creatures you control at the time it resolves.
//     Creatures you begin to control later in the turn and noncreature permanents that become
//     creatures later in the turn won't get +2/+0.
//   [2024-04-12] Outlaw is not a creature type. If an effect asks you to choose a creature type,
//     you can't choose outlaw.

const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

// The creatures you control as it resolves get +2/+0 (the ruling); whether
// you control an outlaw is read after that.
export default defineCard({
  name: "Outlaws' Fury",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Creatures you control get +2/+0 until end of turn. If you control an outlaw, exile the top card of your library. Until the end of your next turn, you may play that card. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtypes: OUTLAWS }, atLeast: 1 },
        then: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      },
    ],
  },
});
