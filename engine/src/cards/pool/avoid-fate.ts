import { defineCard } from "../define.js";

// Legends. EDHREC rank 8255.
//
// Rulings:
//   Avoid Fate must target an instant spell or an Aura spell as it's cast, and it must be
//   targeting an instant or an Aura spell at the time it resolves.
//
// An Aura spell targets the permanent it will enchant (rule 303.4a), so the
// spell filter's `targets` clause reads it the same way as an instant's.
export default defineCard({
  name: "Avoid Fate",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Counter target instant or Aura spell that targets a permanent you control.",
  targets: [
    {
      kind: "spell",
      filter: {
        anyOf: [{ type: "instant" }, { type: "enchantment", subtype: "Aura" }],
        targets: { permanent: { controlledBy: "you" } },
      },
    },
  ],
  effect: { kind: "counter", target: 0 },
});
