import { defineCard } from "../define.js";

export default defineCard({
  name: "Dovin, Architect of Law",
  manaCost: "{4}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dovin"],
  loyalty: 5,
  text: "+1: You gain 2 life and draw a card.\n−1: Tap target creature. It doesn't untap during its controller's next untap step.\n−9: Tap all permanents target opponent controls. That player skips their next untap step.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "+1: You gain 2 life and draw a card.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: "−1: Tap target creature. It doesn't untap during its controller's next untap step.",
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap-all", filter: { controlledBy: "you" }, controlledByTarget: 0 },
          { kind: "skip-untap-step", who: 0 },
        ],
      },
      resolve: null,
      text: "−9: Tap all permanents target opponent controls. That player skips their next untap step.",
    },
  ],
});
