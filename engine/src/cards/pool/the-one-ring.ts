import { defineCard } from "../define.js";

// Rulings:
//   [2023-06-16] Protection from everything (rule 702.16j): all damage that would be dealt to
//     you is prevented, Auras can't be attached to you, and you can't be the target of spells
//     or abilities. Nothing else is prevented — creatures can still attack you.
//   [2023-06-16] Gaining it gives a spell or ability on the stack that targets you an illegal
//     target.

const ENTER = "When The One Ring enters, if you cast it, you gain protection from everything until your next turn.";
const UPKEEP = "At the beginning of your upkeep, you lose 1 life for each burden counter on The One Ring.";
const TAP = "{T}: Put a burden counter on The One Ring, then draw a card for each burden counter on The One Ring.";

export default defineCard({
  name: "The One Ring",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: `Indestructible\n${ENTER}\n${UPKEEP}\n${TAP}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "burden", amount: 1 },
          { kind: "draw", amount: { countersOn: "source", counter: "burden" } },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "If you cast it" — an intervening-if read off how it entered
      // (Iridescent Tiger).
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [],
      effect: { kind: "player-effect", duration: "until-your-next-turn", protectionFromEverything: "you" },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "lose-life", amount: { countersOn: "source", counter: "burden" }, who: "you" },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
