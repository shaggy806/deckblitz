import { defineCard } from "../define.js";

// Mystery Booster Commander. The new Goblin is among the creature tokens
// copied (it was created first); the tokens are counted as the copying
// begins (Clone Legion's `for-each-permanent`), so a copy isn't copied again.
const MONARCH = "When Chief Magistrate of Mercadia enters, you become the monarch.";
const UPKEEP =
  "At the beginning of your upkeep, create a 2/1 red Goblin creature token with haste. Then if you're the monarch, for each creature token you control, create a token that's a copy of it.";

export default defineCard({
  name: "Chief Magistrate of Mercadia",
  manaCost: "{4}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 3,
  toughness: 3,
  text: `${MONARCH}\n${UPKEEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: MONARCH,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Goblin Token (Rakdos Guildmage)", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "monarch", who: "you" },
            then: {
              kind: "for-each-permanent",
              filter: { type: "creature", token: true, controlledBy: "you" },
              as: 0,
              effect: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
            },
          },
        ],
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
