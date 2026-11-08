import { defineCard } from "../define.js";
import { forageCost } from "../helpers.js";

export default defineCard({
  name: "Feed the Cycle",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, forage or pay {B}. (To forage, exile three cards from your graveyard or sacrifice a Food.)\nDestroy target creature or planeswalker.",
  additionalCost: {
    options: [
      { text: "Forage", also: { text: "Forage", do: forageCost() } },
      { text: "Pay {B}", mana: "{B}" },
    ],
  },
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "destroy", target: 0 },
});
