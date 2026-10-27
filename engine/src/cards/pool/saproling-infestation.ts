import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 25547.

const TEXT = "Whenever a player kicks a spell, you create a 1/1 green Saproling creature token.";

// Any player's kicked spell (the `kicked` filter: kicker paid, not buyback,
// entwine or another kicker-like keyword); a copy isn't cast, so it doesn't
// trigger this.
export default defineCard({
  name: "Saproling Infestation",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { kicked: true } },
      targets: [],
      effect: { kind: "create-token", token: "Saproling Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
