import { defineCard } from "../define.js";

// EDHREC rank 25475.

export default defineCard({
  name: "Daru Spiritualist",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "Whenever a Cleric creature you control becomes the target of a spell or ability, it gets +0/+2 until end of turn.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "you-control", filter: { type: "creature", subtype: "Cleric" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: 0, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever a Cleric creature you control becomes the target of a spell or ability, it gets +0/+2 until end of turn.",
    },
  ],
});
