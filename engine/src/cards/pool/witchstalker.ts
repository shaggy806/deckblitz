import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent casts a blue or black spell during your turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Witchstalker",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 3,
  keywords: ["hexproof"],
  text: `Hexproof (This creature can't be the target of spells or abilities your opponents control.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } },
      whileCondition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
