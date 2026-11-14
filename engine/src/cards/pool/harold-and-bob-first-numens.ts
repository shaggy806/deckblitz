import { defineCard } from "../define.js";

// EDHREC rank 9062.
const MANA_TEXT = "{T}: Add three mana of any one color. You get two rad counters.";
const GRANT_TEXT = `Enchanted Forest has '${MANA_TEXT}'`;
const RETURN_TEXT = `When Harold and Bob dies, if it was a creature, return it to the battlefield. It's an Aura enchantment with enchant Forest you control and "${GRANT_TEXT}" Harold and Bob loses all other abilities.`;

/**
 * Harold and Bob, First Numens. "If it was a creature" is read as it last
 * existed on the battlefield (the Enduring cycle's shape), so it comes back
 * once: dying as an Aura, it stays in the graveyard. It returns under the
 * control of its controller, who puts it there (the ruling: "It doesn't
 * matter who owns the card"), as an Aura enchantment — no other types or
 * subtypes — enchanting a Forest that player chooses as it enters (rule
 * 303.4f); with none it stays in the graveyard (303.4g, the ruling). It keeps
 * its name, colour and supertype.
 */
export default defineCard({
  name: "Harold and Bob, First Numens",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Treefolk", "Mutant"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "vigilance"],
  text: `Reach, vigilance\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "source", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        enterAs: {
          setTypes: ["enchantment"],
          enchant: { kind: "permanent", whose: "you", filter: { subtype: "Forest" } },
          loseAbilities: true,
          static: [
            {
              affects: { scope: "attached" },
              grantsActivated: [
                {
                  cost: { mana: null, tap: true },
                  targets: [],
                  effect: {
                    kind: "add-mana",
                    mana: "any-color",
                    amount: 3,
                    also: { kind: "add-player-counters", counter: "rad", amount: 2, who: "you" },
                  },
                  resolve: null,
                  text: MANA_TEXT,
                },
              ],
              text: GRANT_TEXT,
            },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
