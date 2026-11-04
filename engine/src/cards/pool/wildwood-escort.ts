import { defineCard } from "../define.js";

const ENTER_TEXT = "When this creature enters, return target creature or battle card from your graveyard to your hand.";
const EXILE_TEXT = "If this creature would die, exile it instead.";

export default defineCard({
  name: "Wildwood Escort",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${ENTER_TEXT}\n${EXILE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true, from: "battlefield" },
      text: EXILE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "battle"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
