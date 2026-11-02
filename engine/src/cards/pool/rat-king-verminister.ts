import { defineCard } from "../define.js";

// The target is chosen before the three Rats are sacrificed, and a Rat of its
// name is among "all other cards" by the time the ability resolves.

const DISAPPEAR =
  "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, create a 1/1 black Rat creature token and put a +1/+1 counter on Rat King.";
const RETURN =
  "{T}, Sacrifice three Rats: Return target creature card and all other cards with the same name as that card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Rat King, Verminister",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Rat", "Avatar"],
  power: 1,
  toughness: 1,
  text: `${DISAPPEAR}\n${RETURN}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: { kind: "turn-history", what: "left" },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Rat Token", count: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: DISAPPEAR,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Rat" }, count: 3 } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "return-from-graveyard",
        filter: { sameNameAsTarget: 0 },
        destination: "battlefield",
        count: "all",
        enterTapped: true,
      },
      resolve: null,
      text: RETURN,
    },
  ],
});
