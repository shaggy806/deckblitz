import { defineCard } from "../define.js";

const TEXT =
  "Whenever another creature you control enters and whenever you activate a power-up ability, put a +1/+1 counter on Marvel Boy.";
const GROW = { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } as const;

export default defineCard({
  name: "Marvel Boy, Noh-Varr",
  manaCost: "{1}{R/W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kree", "Soldier", "Hero"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: GROW,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "activates-ability", who: "you", powerUp: true },
      targets: [],
      effect: GROW,
      resolve: null,
      text: TEXT,
    },
  ],
});
