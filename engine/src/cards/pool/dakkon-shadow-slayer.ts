import { defineCard } from "../define.js";

// Printed loyalty 0 (rule 306.5b); the lands are counted as he enters, a
// replacement (Nissa, Steward of Elements' shape), so with none he dies to
// the state-based check. The −6 is Kastral's "from your hand or graveyard".
export default defineCard({
  name: "Dakkon, Shadow Slayer",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Dakkon"],
  loyalty: 0,
  text: "Dakkon enters with a number of loyalty counters on him equal to the number of lands you control.\n+1: Surveil 2.\n−3: Exile target creature.\n−6: You may put an artifact card from your hand or graveyard onto the battlefield.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "loyalty", amount: { countOf: { type: "land", controlledBy: "you" } } },
      },
      text: "Dakkon enters with a number of loyalty counters on him equal to the number of lands you control.",
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: "+1: Surveil 2.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "−3: Exile target creature.",
    },
    {
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put an artifact card from your hand or graveyard onto the battlefield?",
        effect: {
          kind: "return-from-graveyard",
          filter: { type: "artifact" },
          destination: "battlefield",
          count: 1,
          from: "hand-or-graveyard",
        },
      },
      resolve: null,
      text: "−6: You may put an artifact card from your hand or graveyard onto the battlefield.",
    },
  ],
});
