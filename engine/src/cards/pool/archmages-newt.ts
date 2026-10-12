import { defineCard } from "../define.js";
import { saddle } from "../helpers.js";

// Whether it's saddled is asked as the ability resolves. Flashback {0}: a
// spell with {X} is cast with X 0, and a card with no mana cost gains it too;
// one gaining flashback "equal to its mana cost" with none can't be cast that
// way (the rulings).
const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, target instant or sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost. That card gains flashback {0} until end of turn instead if this creature is saddled. (You may cast that card from your graveyard for its flashback cost. Then exile it.)";

export default defineCard({
  name: "Archmage's Newt",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Salamander", "Mount"],
  power: 2,
  toughness: 2,
  text: `${DAMAGE_TEXT}\nSaddle 3`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: ["instant-or-sorcery-in-your-graveyard"],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { saddled: true } },
        then: { kind: "grant-flashback", target: 0, cost: "{0}" },
        else: { kind: "grant-flashback", target: 0 },
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [saddle(3)],
});
