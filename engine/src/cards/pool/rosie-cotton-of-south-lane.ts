import { defineCard } from "../define.js";

// "Whenever you create a token": a token enters under the control of the player
// who creates it (rule 111.2), once per token (its ruling), so an entering token
// you control is one you created.
const ENTERS = "When Rosie Cotton enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";
const TOKEN = "Whenever you create a token, put a +1/+1 counter on target creature you control other than Rosie Cotton.";

export default defineCard({
  name: "Rosie Cotton of South Lane",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Peasant"],
  power: 1,
  toughness: 1,
  text: `${ENTERS}\n${TOKEN}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true } },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TOKEN,
    },
  ],
});
