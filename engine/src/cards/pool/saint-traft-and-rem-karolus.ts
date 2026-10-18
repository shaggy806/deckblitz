import { defineCard } from "../define.js";

// EDHREC rank 14354.
//
// Counted resolutions (`resolved-this-turn`, Harvestrite Host's shape): the
// fourth and later do nothing (the ruling). The untap triggers on any spell
// that has convoke, convoked or not (the ruling).
//
// Rulings:
//   [2023-04-14] If it’s the fourth or subsequent time the first ability has resolved in a turn,
//     nothing happens.
//   [2023-04-14] The last ability of Saint Traft and Rem Karolus will trigger whether you tapped
//     any creatures to pay for the spell or not, as long as it has convoke.

const TAP_TEXT =
  "Whenever Saint Traft and Rem Karolus becomes tapped, create a 1/1 red Human creature token if this is the first time this ability has resolved this turn. If it's the second time, create a 1/1 blue Spirit creature token with flying. If it's the third time, create a 4/4 white Angel creature token with flying.";

export default defineCard({
  name: "Saint Traft and Rem Karolus",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Human"],
  power: 3,
  toughness: 4,
  text: "Whenever Saint Traft and Rem Karolus becomes tapped, create a 1/1 red Human creature token if this is the first time this ability has resolved this turn. If it's the second time, create a 1/1 blue Spirit creature token with flying. If it's the third time, create a 4/4 white Angel creature token with flying.\nWhenever you cast a spell that has convoke, untap Saint Traft and Rem Karolus.",
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "resolved-this-turn", n: 1 },
        then: { kind: "create-token", token: "Red Human Token", count: 1 },
        else: {
          kind: "conditional",
          condition: { kind: "resolved-this-turn", n: 2 },
          then: { kind: "create-token", token: "Spirit Token (Saint Traft and Rem Karolus)", count: 1 },
          else: {
            kind: "conditional",
            condition: { kind: "resolved-this-turn", n: 3 },
            then: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
          },
        },
      },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { hasConvoke: true } },
      targets: [],
      effect: { kind: "untap", target: "source" },
      resolve: null,
      text: "Whenever you cast a spell that has convoke, untap Saint Traft and Rem Karolus.",
    },
  ],
});
