import { defineCard } from "../define.js";

export default defineCard({
  name: "Get Lost",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Destroy target creature, enchantment, or planeswalker. Its controller creates two Map tokens. (They're artifacts with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "enchantment", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      // Even when it wasn't destroyed (indestructible): its controller, as it
      // last existed if it was.
      { kind: "create-token", token: "Map Token", count: 2, who: "target-controller" },
    ],
  },
});
