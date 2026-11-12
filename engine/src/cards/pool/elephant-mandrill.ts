import { defineCard } from "../define.js";

// EDHREC rank 13203.

export default defineCard({
  name: "Elephant-Mandrill",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Monkey"],
  power: 3,
  toughness: 2,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, each player creates a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nAt the beginning of combat on your turn, this creature gets +1/+1 until end of turn for each artifact your opponents control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1, who: "each-player" },
      resolve: null,
      text: "When this creature enters, each player creates a Food token.",
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { countOf: { type: "artifact", controlledBy: "opponent" } },
        toughness: { countOf: { type: "artifact", controlledBy: "opponent" } },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "At the beginning of combat on your turn, this creature gets +1/+1 until end of turn for each artifact your opponents control.",
    },
  ],
});
