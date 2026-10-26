import { defineCard } from "../define.js";

const TEXT = "Whenever you scry, this creature gets +2/+0 and gains first strike until end of turn.";

// Once per scry instruction, however many cards (the ruling): the `scries` trigger.
export default defineCard({
  name: "Flamespeaker Adept",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
