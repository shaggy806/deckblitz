import { defineCard } from "../define.js";

// Each player but the caster copies the spell, in turn order (`for-each-player`
// with `except`), each controlling their copy and choosing its new targets.
export default defineCard({
  name: "Hive Mind",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Whenever a player casts an instant or sorcery spell, each other player copies that spell. Each of those players may choose new targets for their copy.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-player",
        except: "trigger-controller",
        effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true, controller: "that-player" },
      },
      resolve: null,
      text: "Whenever a player casts an instant or sorcery spell, each other player copies that spell. Each of those players may choose new targets for their copy.",
    },
  ],
});
