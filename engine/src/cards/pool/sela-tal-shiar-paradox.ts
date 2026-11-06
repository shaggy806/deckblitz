import { defineCard } from "../define.js";

const ATTACK = "Whenever Sela attacks, exile up to one target card from a graveyard.";
const LEAVE = "Whenever one or more cards leave your graveyard, create a tapped 2/2 black Romulan creature token.";

export default defineCard({
  name: "Sela, Tal Shiar Paradox",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Romulan", "Human", "Rogue"],
  power: 3,
  toughness: 3,
  text: `${ATTACK}\n${LEAVE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any" } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: ATTACK,
    },
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: { kind: "create-token", token: "Romulan Token", count: 1, tapped: true },
      resolve: null,
      text: LEAVE,
    },
  ],
});
