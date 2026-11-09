import { defineCard } from "../define.js";

// EDHREC rank 2091. One replacement, on artifacts and creatures you control and
// on you (`onPlayers: "you"`), whoever is putting the counters.

const TEXT =
  "If one or more counters would be put on an artifact or creature you control, that many plus one of each of those kinds of counters are put on that permanent instead.\nIf you would get one or more counters, you get that many plus one of each of those kinds of counters instead.";

export default defineCard({
  name: "Winding Constrictor",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-add-counter",
        instead: { modify: { plus: 1 } },
        filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" },
        onPlayers: "you",
      },
      text: TEXT,
    },
  ],
});
