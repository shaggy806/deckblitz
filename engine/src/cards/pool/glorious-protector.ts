import { defineCard } from "../define.js";

const TEXT = "When this creature enters, you may exile any number of non-Angel creatures you control until this creature leaves the battlefield.";

// Rulings:
//   If Glorious Protector leaves the battlefield before its triggered ability resolves, no
//     creatures will be exiled.
//   If a token is exiled this way, it will cease to exist and won't return to the battlefield.
//   Glorious Protector's enters-the-battlefield ability doesn't target any creatures. You choose
//     which non-Angel creatures to exile, if any, as that ability resolves.
export default defineCard({
  name: "Glorious Protector",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Cleric"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "flying"],
  foretell: { cost: "{2}{W}" },
  text: `Flash\nFlying\n${TEXT}\nForetell {2}{W} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "choose-permanents",
          filter: { type: "creature", notSubtypes: ["Angel"], controlledBy: "you" },
          upTo: { countOf: { type: "creature", notSubtypes: ["Angel"], controlledBy: "you" } },
          then: { kind: "exile", target: 0, untilSourceLeaves: true },
          prompt: "Exile any number of non-Angel creatures you control until this creature leaves the battlefield",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
