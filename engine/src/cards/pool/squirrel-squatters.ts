import { defineCard } from "../define.js";

// The Squirrels' count is read as the attack trigger resolves: each Attraction
// visited this turn once (rule 701.52a).

const OPEN = "When this creature enters, open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";
const ATTACK =
  "Whenever this creature attacks, create a 1/1 green Squirrel creature token that's tapped and attacking for each Attraction you've visited this turn.";

export default defineCard({
  name: "Squirrel Squatters",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel"],
  power: 4,
  toughness: 4,
  text: `${OPEN}\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "open-attraction" },
      resolve: null,
      text: OPEN,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Squirrel Token",
        count: { turnHistory: "visited" },
        tapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: ATTACK,
    },
  ],
});
