import { defineCard } from "../define.js";

// EDHREC rank 10578. The blessing is read as the delayed ability resolves
// (its ruling), so the tokens it made can count toward it; each token picks
// its own defender as it enters (its ruling — `attacking: "choose"`).

const TEXT =
  "Whenever this creature attacks, you may pay {X}{R}. If you do, create X 1/1 red Elemental creature tokens that are tapped and attacking. At the beginning of the next end step, exile those tokens unless you have the city's blessing.";

export default defineCard({
  name: "Tilonalli's Summoner",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X}{R} to create X tapped and attacking 1/1 Elementals?",
        cost: "{X}{R}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "1/1 Red Elemental Token", count: "x", tapped: true, attacking: "choose" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              about: "created",
              effect: {
                kind: "conditional",
                condition: { kind: "not", of: { kind: "citys-blessing" } },
                then: { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 } },
              },
              text: "At the beginning of the next end step, exile those tokens unless you have the city's blessing.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
