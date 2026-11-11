import { defineCard } from "../define.js";

const PROTECTION_TEXT = "You and permanents you control have protection from Salamanders.";
const END_TEXT =
  "At the beginning of your end step, each player who controls the fewest creatures creates a 4/3 blue Salamander Warrior creature token.";

export default defineCard({
  name: "Gor Muldrak, Amphinologist",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 2,
  text: `${PROTECTION_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { controlledBy: "you" } },
      protection: { filter: { subtype: "Salamander" } },
      playerProtection: { filter: { subtype: "Salamander" } },
      text: PROTECTION_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        // The fewest: nobody else controls fewer, read as this resolves.
        whoIf: {
          kind: "of-player",
          player: "that-player",
          condition: {
            kind: "not",
            of: { kind: "player-compare", stat: { controls: { type: "creature" } }, compare: "more", than: "an-opponent" },
          },
        },
        effect: { kind: "create-token", token: "Salamander Warrior Token", count: 1, who: "that-player" },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
