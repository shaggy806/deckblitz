import { defineCard } from "../define.js";

// EDHREC rank 18080. Marvel Super Heroes Commander.
//
// Desecrated Tomb's trigger with a 2/2 Zombie, and Whisper, Blood
// Liturgist's reanimation with Shuri's Fabricator's finality counter. Targets
// are chosen before costs are paid (rule 601.2c before 601.2h), so neither
// sacrificed creature can be the target; the card it returns leaves your
// graveyard, which makes a Zombie.
const ZOMBIE_TEXT = "Whenever one or more creature cards leave your graveyard, create a 2/2 black Zombie creature token.";
const RETURN_TEXT =
  "{3}{B}, {T}, Sacrifice two creatures: Return target creature card from your graveyard to the battlefield with a finality counter on it. Activate only as a sorcery. (If a creature with a finality counter on it would die, exile it instead.)";

export default defineCard({
  name: "Grim Reaper's Scythe",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${ZOMBIE_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: ZOMBIE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: true, sacrifice: { filter: { type: "creature" }, count: 2 } },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, withCounters: { kind: "finality", amount: 1 } },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
});
