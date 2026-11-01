import { defineCard } from "../define.js";

// Innistrad: Crimson Vow (VOW). X counts the life
// opponents lost this turn, not how far their totals fell (the ruling); the
// card exiled gets "you may play it this turn" — `playable` — and the rest go
// under.
//
// Rulings:
//   [2021-09-24] Florian's ability checks only how much life opponents lost during the turn, not
//     by how much their life totals decreased compared to the start of the turn.
//   [2021-09-24] If you somehow have more than two main phases in a turn, each main phase after
//     your first one is a postcombat main phase, and Florian's last ability triggers at the
//     beginning of each of them.
//   [2021-09-24] You must pay all costs and follow all timing rules for cards you play with
//     Florian's last ability.

const TEXT =
  "At the beginning of each of your postcombat main phases, look at the top X cards of your library, where X is the total amount of life your opponents lost this turn. Exile one of those cards and put the rest on the bottom of your library in a random order. You may play the exiled card this turn.";

export default defineCard({
  name: "Florian, Voldaren Scion",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Noble"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "postcombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: { turnStat: "life-lost", who: "each-opponent" },
        min: 1,
        max: 1,
        destination: "exile",
        unlinked: true,
        playable: { duration: "end-of-turn" },
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
