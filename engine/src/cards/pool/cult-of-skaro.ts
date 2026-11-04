import { defineCard } from "../define.js";

// Doctor Who Commander (WHO).

const HEAD = "Whenever Cult of Skaro attacks, choose one at random —";
const THAY = "Thay — Put a +1/+1 counter on each artifact creature you control.";
const CAAN = "Caan — Draw two cards.";
const SEC = "Sec — Create a 3/3 black Dalek artifact creature token with menace.";
const JAST = "Jast — Each opponent loses 4 life.";

export default defineCard({
  name: "Cult of Skaro",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Dalek"],
  power: 4,
  toughness: 4,
  text: `${HEAD}\n• ${THAY}\n• ${CAAN}\n• ${SEC}\n• ${JAST}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: THAY,
            effect: {
              kind: "add-counter-all",
              filter: { types: ["artifact", "creature"], controlledBy: "you" },
              counter: "+1/+1",
              amount: 1,
            },
          },
          { text: CAAN, effect: { kind: "draw", amount: 2 } },
          { text: SEC, effect: { kind: "create-token", token: "Dalek Token", count: 1 } },
          { text: JAST, effect: { kind: "lose-life", amount: 4, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: HEAD,
    },
  ],
});
