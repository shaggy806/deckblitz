import { defineCard } from "../define.js";

const TEXT =
  'When this Aura enters, if enchanted creature has flying, this Aura deals 2 damage to that creature and this Aura gains "Enchanted creature loses flying."';

// The Aura gains the static, so a flying the creature gains later is applied
// after it, in timestamp order (the ruling), and nothing is lost if the
// creature had no flying as the trigger resolved (intervening "if").
export default defineCard({
  name: "Earthbind",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { attachedTo: { keyword: "flying" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, target: "attached" },
          {
            kind: "grant-static",
            target: "source",
            ability: { affects: { scope: "attached" }, loseKeywords: ["flying"], text: "Enchanted creature loses flying." },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
