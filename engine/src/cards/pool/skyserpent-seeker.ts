import { defineCard } from "../define.js";

const EXHAUST_TEXT =
  "Exhaust — {4}: Reveal cards from the top of your library until you reveal two land cards. Put those land cards onto the battlefield tapped and the rest on the bottom of your library in a random order. Put a +1/+1 counter on this creature. (Activate each exhaust ability only once.)";

export default defineCard({
  name: "Skyserpent Seeker",
  manaCost: "{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "deathtouch"],
  text: `Flying, deathtouch\n${EXHAUST_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "reveal-until-count",
            filter: { type: "land" },
            count: 2,
            put: "battlefield",
            tapped: true,
            rest: "bottom-random",
          },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      exhaust: true,
      text: EXHAUST_TEXT,
    },
  ],
});
