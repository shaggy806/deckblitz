import { defineCard } from "../define.js";

const TOKEN_TEXT =
  "If one or more tokens would be created under your control, those tokens plus a 1/1 green Frog creature token are created instead.";
const COUNTER_TEXT = "{2}, Sacrifice a Frog: Put a +1/+1 counter on Quina.";

export default defineCard({
  name: "Quina, Qu Gourmet",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Qu"],
  power: 2,
  toughness: 3,
  text: `${TOKEN_TEXT}\n${COUNTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusOneToken: "Frog Token" },
      text: TOKEN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: { filter: { subtype: "Frog" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
