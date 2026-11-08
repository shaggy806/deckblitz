import { defineCard } from "../define.js";

const TEXT =
  "Once during each of your turns, you may cast an artifact creature spell from your graveyard. If you cast a spell this way, that artifact creature enters with a finality counter on it.";

export default defineCard({
  name: "Overflow Submatrix",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (If a creature with a finality counter on it would die, exile it instead.)`,
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        filter: { types: ["artifact", "creature"] },
        oncePerTurn: true,
        yourTurnOnly: true,
        entersWith: { kind: "finality", amount: 1 },
      },
      text: TEXT,
    },
  ],
});
