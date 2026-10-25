import { defineCard } from "../define.js";

// EDHREC rank 29372. Frost Trickster's tap-and-freeze, on a land.

export default defineCard({
  name: "Stensia Innkeeper",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, tap target land an opponent controls. That land doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "land", controlledBy: "opponent" } }],
      effect: { kind: "tap", target: 0, doesntUntapNext: true },
      resolve: null,
      text: "When this creature enters, tap target land an opponent controls. That land doesn't untap during its controller's next untap step.",
    },
  ],
});
