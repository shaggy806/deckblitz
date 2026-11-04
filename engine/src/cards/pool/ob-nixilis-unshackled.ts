import { defineCard } from "../define.js";

// The player who searched, whoever's effect made them. With no creature they
// still lose 10 life (the ruling).

const SEARCH = "Whenever an opponent searches their library, that player sacrifices a creature of their choice and loses 10 life.";
const DIES = "Whenever another creature dies, put a +1/+1 counter on Ob Nixilis.";

export default defineCard({
  name: "Ob Nixilis, Unshackled",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${SEARCH}\n${DIES}`,
  triggered: [
    {
      trigger: { on: "searches-library", who: "opponent" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "trigger-player", filter: { type: "creature" }, count: 1 },
          { kind: "lose-life", amount: 10, who: "trigger-player" },
        ],
      },
      resolve: null,
      text: SEARCH,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES,
    },
  ],
});
