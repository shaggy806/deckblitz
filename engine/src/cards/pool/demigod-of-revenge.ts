import { defineCard } from "../define.js";

// EDHREC rank 29159. Shadowmoor.
//
// Rulings:
//   [2008-05-01] If Demigod of Revenge is countered *before* its triggered ability resolves, the
//     ability will still resolve. It will return that Demigod of Revenge from your graveyard to
//     the battlefield, as well as any others.
//   [2008-05-01] The triggered ability will resolve before Demigod of Revenge will.
//   [2008-05-01] This ability triggers when you cast Demigod of Revenge as a spell. It won’t
//     trigger if Demigod of Revenge is put directly onto the battlefield.

const CAST_TEXT =
  "When you cast this spell, return all cards named Demigod of Revenge from your graveyard to the battlefield.";

export default defineCard({
  name: "Demigod of Revenge",
  manaCost: "{B/R}{B/R}{B/R}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 5,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: `${CAST_TEXT}\nFlying, haste`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { name: "Demigod of Revenge" },
        destination: "battlefield",
        count: "all",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
