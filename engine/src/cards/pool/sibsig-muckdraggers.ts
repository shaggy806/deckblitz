import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Sibsig Muckdraggers",
  manaCost: "{8}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 6,
  text: `Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\n${ENTERS_TEXT}`,
  delve: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
