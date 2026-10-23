import { defineCard } from "../define.js";

// EDHREC rank 7532.
//
// All of the tokens or none — no number in between (the ruling): one `may`
// over the whole batch.
const DAMAGE_TEXT = "Whenever this creature is dealt damage, you may create that many 1/1 green Insect creature tokens.";

export default defineCard({
  name: "Broodhatch Nantuko",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{2}{G}" },
  text: `${DAMAGE_TEXT}\nMorph {2}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Create that many 1/1 green Insect creature tokens?",
        effect: { kind: "create-token", token: "Insect Token", count: { triggerValue: true } },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
