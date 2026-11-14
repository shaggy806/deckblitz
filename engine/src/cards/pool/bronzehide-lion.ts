import { defineCard } from "../define.js";

// EDHREC rank 10296.
const INDESTRUCTIBLE_TEXT = "{G}{W}: This creature gains indestructible until end of turn.";
const GRANTED_TEXT = "{G}{W}: Enchanted creature gains indestructible until end of turn.";
const RETURN_TEXT = `When this creature dies, return it to the battlefield. It's an Aura enchantment with enchant creature you control and "${GRANTED_TEXT.slice(0, -1)}," and it loses all other abilities.`;

/**
 * Bronzehide Lion. It returns under the control of whoever controlled it
 * (the ruling), as an Aura enchantment — no longer a creature, so no
 * creature types — enchanting a creature that player chooses as it enters
 * (rule 303.4f); with none, it stays in the graveyard (303.4g, the ruling).
 * As an Aura it has only the enchant ability and the granted one, so its
 * own dies trigger is gone and it doesn't come back again. Entering without
 * its abilities, no "as this enters" replacement of its own applies.
 */
export default defineCard({
  name: "Bronzehide Lion",
  manaCost: "{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: `${INDESTRUCTIBLE_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      resolve: null,
      text: INDESTRUCTIBLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        underYourControl: true,
        enterAs: {
          setTypes: ["enchantment"],
          enchant: { kind: "permanent", whose: "you", filter: { type: "creature" } },
          loseAbilities: true,
          activated: [
            {
              cost: { mana: "{G}{W}", tap: false },
              targets: [],
              effect: { kind: "grant-keyword", target: "attached", keyword: "indestructible", duration: "end-of-turn" },
              resolve: null,
              text: GRANTED_TEXT,
            },
          ],
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
