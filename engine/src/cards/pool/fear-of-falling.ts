import { defineCard } from "../define.js";

// "Defending player" is the player the attack trigger names. A creature
// that loses flying this way can gain it back from a later effect (the
// ruling) — the loss applies at its timestamp (rule 613.7).

const TEXT =
  "Whenever this creature attacks, target creature defending player controls gets -2/-0 and loses flying until your next turn.";

export default defineCard({
  name: "Fear of Falling",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "until-your-next-turn" },
          { kind: "lose-keywords", target: 0, keywords: ["flying"], duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
