import { defineCard } from "../define.js";

// EDHREC rank 12915.

const ENTER_TEXT =
  "This creature enters with X +1/+1 counters on it, where X is the greatest power among creatures you control and creature cards in your graveyard.";

export default defineCard({
  name: "Ambitious Dragonborn",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon", "Barbarian"],
  power: 0,
  toughness: 0,
  text: ENTER_TEXT,
  static: [
    {
      // Read as it is about to enter (rule 614.12): it isn't on the
      // battlefield yet (the ruling), but entering from your graveyard it is
      // still a creature card there.
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            aggregate: "max",
            of: "power",
            filter: { type: "creature", controlledBy: "you" },
            plus: [{ filter: { type: "creature", ownedBy: "you" }, in: "graveyards" }],
          },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
