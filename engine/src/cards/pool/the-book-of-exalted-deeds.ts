import { defineCard } from "../define.js";

const ACTIVATED =
  "{W}{W}{W}, {T}, Exile The Book of Exalted Deeds: Put an enlightened counter on target Angel. It gains \"You can't lose the game and your opponents can't win the game.\" Activate only as a sorcery.";

// The granted ability is the Angel's for as long as it's that object — not
// tied to the counter or to its still being an Angel (the rulings).
export default defineCard({
  name: "The Book of Exalted Deeds",
  manaCost: "{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `At the beginning of your end step, if you gained 3 or more life this turn, create a 3/3 white Angel creature token with flying.\n${ACTIVATED}`,
  activated: [
    {
      cost: { mana: "{W}{W}{W}", tap: true, exileSelf: true },
      targets: [{ kind: "permanent", filter: { subtype: "Angel" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "enlightened", amount: 1 },
          {
            kind: "grant-static",
            target: 0,
            ability: {
              affects: { scope: "self" },
              cantLoseGame: true,
              opponentsCantWinGame: true,
              text: "You can't lose the game and your opponents can't win the game.",
            },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: ACTIVATED,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "create-token", token: "3/3 White Angel Token", count: 1 },
      resolve: null,
      text: "At the beginning of your end step, if you gained 3 or more life this turn, create a 3/3 white Angel creature token with flying.",
    },
  ],
});
