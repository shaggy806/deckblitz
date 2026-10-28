import { defineCard } from "../define.js";

// EDHREC rank 30849.

export default defineCard({
  name: "Midvast Protector",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "When this creature enters, target creature you control gains protection from the color of your choice until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "grant-protection",
        target: 0,
        from: { choose: "color" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "When this creature enters, target creature you control gains protection from the color of your choice until end of turn.",
    },
  ],
});
