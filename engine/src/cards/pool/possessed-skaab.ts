import { defineCard } from "../define.js";

const RETURN = "When this creature enters, return target instant, sorcery, or creature card from your graveyard to your hand.";
const EXILE = "If this creature would die, exile it instead.";

export default defineCard({
  name: "Possessed Skaab",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: `${RETURN}\n${EXILE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery", "creature"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: RETURN,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true, from: "battlefield" },
      text: EXILE,
    },
  ],
});
