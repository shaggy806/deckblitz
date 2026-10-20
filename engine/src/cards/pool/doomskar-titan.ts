import { defineCard } from "../define.js";

// Kaldheim (KHM). EDHREC rank 23253. Imodane's Recruiter's trigger: only the
// creatures you control as it resolves (the ruling — rule 611.2c).
const YOURS = { type: "creature", controlledBy: "you" } as const;
const ENTER_TEXT = "When this creature enters, creatures you control get +1/+0 and gain haste until end of turn.";

export default defineCard({
  name: "Doomskar Titan",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\nForetell {4}{R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  foretell: { cost: "{4}{R}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: YOURS, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: YOURS, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
