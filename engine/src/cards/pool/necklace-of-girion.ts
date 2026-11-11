import { defineCard } from "../define.js";

// EDHREC rank 7600. One ability with two trigger events ("whenever A and
// whenever B"): two entries naming each other (`sameAbilityAs`). "A Forest"
// is any land with the subtype (Staff of the Wild Magus's ruling).

const TEXT =
  "Whenever you cast a green spell and whenever a Forest you control enters, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Necklace of Girion",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${TEXT}\n{T}: Add {G}.`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["G"] } },
      sameAbilityAs: 1,
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Forest" } },
      sameAbilityAs: 0,
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 1 },
      resolve: null,
      text: "{T}: Add {G}.",
    },
  ],
});
