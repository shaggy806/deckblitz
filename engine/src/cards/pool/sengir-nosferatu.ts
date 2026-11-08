import { defineCard } from "../define.js";

const TEXT =
  "{1}{B}, Exile this creature: Create a 1/2 black Bat creature token with flying. It has \"{1}{B}, Sacrifice this token: Return an exiled card named Sengir Nosferatu to the battlefield under its owner's control.\"";

export default defineCard({
  name: "Sengir Nosferatu",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: { kind: "create-token", token: "Bat Token (Sengir Nosferatu)", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
