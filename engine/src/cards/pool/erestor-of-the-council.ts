import { defineCard } from "../define.js";

// EDHREC rank 11481.
// Makes Treasure → "Treasure Token".
//
// An opponent with more than one vote can count both as one who voted with
// you and as one who voted otherwise (the ruling). The draw happens however
// the vote went.

const TEXT =
  "Whenever players finish voting, each opponent who voted for a choice you voted for creates a Treasure token. You scry X, where X is the number of opponents who voted for a choice you didn't vote for. Draw a card.";

export default defineCard({
  name: "Erestor of the Council",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "players-finish-voting" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1, who: "opponents-who-voted-with-you" },
          { kind: "scry", amount: { opponentsVotedOtherwise: true } },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
