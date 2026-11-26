import { defineCard } from "../define.js";

// "Attacking alone" (rule 506.5, `attackingAlone`): attacking while no other
// creature is, whoever controls it.

const PUMP = "{B}: Target creature that's attacking alone gets +1/+1 until end of turn.";
const GRANT =
  "{B}: Target creature that's attacking alone gains your choice of deathtouch or lifelink until end of turn.";

export default defineCard({
  name: "Viper, Cruel Conspirator",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Villain"],
  power: 2,
  toughness: 2,
  text: `${PUMP}\n${GRANT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", attackingAlone: true } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
    {
      cost: { mana: "{B}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", attackingAlone: true } }],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Deathtouch", effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" } },
          { text: "Lifelink", effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: GRANT,
    },
  ],
});
