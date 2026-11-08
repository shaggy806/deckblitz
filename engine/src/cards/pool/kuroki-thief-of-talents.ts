import { defineCard } from "../define.js";

// Mystery Booster Commander. The opponent decides; drawing gives you a look
// at their hand and one free cast from it (Silent-Blade Oni's shape),
// declining gives Kuroki the counters.
const TEXT =
  "At the beginning of your end step, target opponent may draw four cards. If they do, look at that player's hand and you may cast a spell from their hand without paying its mana cost. If they don't, put two +1/+1 counters on Kuroki.";

export default defineCard({
  name: "Kuroki, Thief of Talents",
  manaCost: "{4}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Draw four cards?",
        effect: { kind: "draw", amount: 4 },
        ifDid: { kind: "cast-now", from: { handOf: "that-player", look: true }, free: true },
        ifDidnt: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
