import { defineCard } from "../define.js";

const ENTER = "When this creature enters, return target permanent card from your graveyard to your hand.";
const LEAVE =
  "Whenever a card leaves your graveyard, create a 3/3 colorless Illusion artifact creature token. This ability triggers only once each turn.";

export default defineCard({
  name: "Hologram Stalker",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hirogen", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ENTER}\n${LEAVE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "create-token", token: "Illusion Token 3/3 artifact", count: 1 },
      resolve: null,
      text: LEAVE,
    },
  ],
});
