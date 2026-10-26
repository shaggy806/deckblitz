import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of combat on your turn, you may clash with an opponent. If you win, this creature gets +2/+0 and loses defender until end of turn.";

export default defineCard({
  name: "Sentry Oak",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Treefolk", "Warrior"],
  power: 3,
  toughness: 5,
  keywords: ["defender"],
  text: `Defender\n${TEXT} (Each clashing player reveals the top card of their library, then puts that card on their choice of the top or bottom. A player wins if their card had a greater mana value.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Clash with an opponent?",
        effect: {
          kind: "clash",
          won: {
            kind: "sequence",
            effects: [
              { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
              { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
            ],
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
