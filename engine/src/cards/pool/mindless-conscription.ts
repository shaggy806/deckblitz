import { defineCard } from "../define.js";

// EDHREC rank 13120.
// Makes Zombie Army by amassing → the engine's "Army Token".
//
// Rulings:
//   [2024-06-07] In the rare case that you control multiple Army creatures (perhaps because you
//     played a creature with changeling) while you amass Zombies, you choose which of your Army
//     creatures to put the +1/+1 counters on. If that creature isn't a Zombie, it becomes a Zombie
//     in addition to its other types.
//   [2024-06-07] If you don't control an Army, the Zombie Army token that you create enters the
//     battlefield as a 0/0 creature. Any abilities that trigger when a creature with a certain
//     power enters the battlefield, such as that of Mentor of the Meek, will see the token enter
//     as a 0/0 creature before it gets +1/+1 counters.
//
// One ability with two trigger conditions, written as two triggered abilities
// with the same effect (Astrologian's Planisphere's shape).
const TEXT =
  "When this enchantment enters and whenever you draw your third card each turn, amass Zombies 3. (Put three +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)";

export default defineCard({
  name: "Mindless Conscription",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "amass", amount: 3, creatureType: "Zombie" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 3 },
      targets: [],
      effect: { kind: "amass", amount: 3, creatureType: "Zombie" },
      resolve: null,
      text: TEXT,
    },
  ],
});
