import { defineCard } from "../define.js";

// EDHREC rank 14125. March of the Machine: The Aftermath.
//
// Rulings:
//   [2023-05-12] You don't have to choose a target artifact or enchantment card to cast Campus
//     Renovation. However, if you do, and that card is an illegal target at the time Campus
//     Renovation tries to resolve, it won't resolve and none of its effects will happen. You won't
//     exile any cards from your library.
//
// Badlands Revival's optional reanimation slot, then Reckless Impulse. The
// ruling is rule 608.2b: a spell whose every chosen target is illegal doesn't
// resolve, and one that chose none has nothing to check.
export default defineCard({
  name: "Campus Renovation",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["sorcery"],
  text: "Return up to one target artifact or enchantment card from your graveyard to the battlefield. Exile the top two cards of your library. Until the end of your next turn, you may play those cards.",
  targets: [
    {
      kind: "optional",
      of: { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "impulse-exile", amount: 2, duration: "your-next-turn" },
    ],
  },
});
