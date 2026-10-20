import { defineCard } from "../define.js";

// EDHREC rank 26881.

export default defineCard({
  name: "Sunrise Cavalier",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["trample", "haste"],
  becomesDayAsEnters: true,
  text: "Trample, haste\nIf it's neither day nor night, it becomes day as this creature enters.\nWhenever day becomes night or night becomes day, put a +1/+1 counter on target creature you control.",
  triggered: [
    {
      trigger: { on: "day-night-changes" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Whenever day becomes night or night becomes day, put a +1/+1 counter on target creature you control.",
    },
  ],
});
