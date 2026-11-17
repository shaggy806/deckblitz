import { defineCard } from "../define.js";

// EDHREC rank 13159. An attack trigger's "that player" is the defending
// player (Siege Dragon's shape), asked as it triggers and again as it
// resolves (rule 603.4).

const ATTACKS =
  "Whenever this creature attacks, if defending player controls no Glimmer creatures, it gains menace and deathtouch until end of turn.";

export default defineCard({
  name: "Fear of the Dark",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 5,
  toughness: 5,
  text: `${ATTACKS} (A creature with menace can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Glimmer", type: "creature" }, atLeast: 1 } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "deathtouch", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
