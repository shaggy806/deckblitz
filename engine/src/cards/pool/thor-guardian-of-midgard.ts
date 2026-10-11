import { defineCard } from "../define.js";

// EDHREC rank 16804.
//
// Virtue of Courage's trigger, word for word: once per opponent dealt
// noncombat damage, "that many" the damage dealt; "play" includes lands.

const DAMAGE_TEXT =
  "Whenever a source you control deals noncombat damage to an opponent, you may exile that many cards from the top of your library. You may play those cards this turn.";

export default defineCard({
  name: "Thor, Guardian of Midgard",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["God", "Warrior", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", to: "opponent", combat: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile that many cards from the top of your library?",
        effect: { kind: "impulse-exile", amount: { triggerValue: true }, duration: "end-of-turn" },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
