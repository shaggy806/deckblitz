import { defineCard } from "../define.js";

// EDHREC rank 6972.
//
// Rulings:
//   [2025-02-07] If a card in your graveyard is an artifact creature card, count it only once when
//     determining how many Insect tokens to create for Aatchik’s first ability.
//   [2025-02-07] If Aatchik is dealt lethal damage at the same time as another Insect you control,
//     Aatchik’s last ability will still trigger, causing each opponent to lose 1 life, but Aatchik
//     won’t get a +1/+1 counter in time to save it.

const ETB_TEXT =
  "When Aatchik enters, create a 1/1 green Insect creature token for each artifact and/or creature card in your graveyard.";
const DIES_TEXT =
  "Whenever another Insect you control dies, put a +1/+1 counter on Aatchik. Each opponent loses 1 life.";

export default defineCard({
  name: "Aatchik, Emerald Radian",
  manaCost: "{3}{B}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Druid"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // An artifact creature card counts once (the ruling): one filter, a
      // card matching either type.
      effect: {
        kind: "create-token",
        token: "Insect Token",
        count: { countInGraveyard: { typesAnyOf: ["artifact", "creature"], ownedBy: "you" } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", subtype: "Insect" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "lose-life", amount: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
