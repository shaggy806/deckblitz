import { defineCard } from "../define.js";

// "Enchanted player" is the player this Curse is attached to
// (`{ controllerOf: "attached" }` on an Aura attached to a player).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, put a judgment counter on this Aura. Then if there are three or more judgment counters on it, enchanted player loses the game.";
const EXILE_TEXT = "If Sinner's Judgment would be put into a graveyard from anywhere, exile it instead.";

export default defineCard({
  name: "Sinner's Judgment",
  art: "https://cards.scryfall.io/art_crop/back/d/b/db791fb6-b0ff-4ded-bd3d-9447cf398312.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  text: `Enchant player\n${UPKEEP_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "judgment", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "source", filter: { counters: { kind: "judgment", compare: { op: "gte", n: 3 } } } },
            then: { kind: "lose-game", who: { controllerOf: "attached" } },
          },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: EXILE_TEXT,
    },
  ],
  faces: ["Faithbound Judge", "Sinner's Judgment"],
  transform: true,
});
