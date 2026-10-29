import { defineCard } from "../define.js";

// EDHREC rank 6528.
//
// Rulings:
//   [2006-09-25] Trickbind can be used to counter the echo triggered ability. If so, the echo
//     ability won’t trigger again so the echo cost is never paid.
//   [2006-09-25] If Trickbind counters an activated ability of a permanent, no activated abilities
//     of that permanent can be activated for the remainder of the turn. This includes activated
//     abilities other than the one that was countered, as well as any mana abilities that
//     permanent may have. Other abilities of that permanent, including triggered abilities and
//     static abilities, are unaffected.
//   [2006-09-25] Trickbind can be used to counter the suspend “remove a counter” ability. If so,
//     the counter won’t get removed, but the ability will trigger again as normal later on.
//     Trickbind can also be used to counter the suspend “play this card” ability. If so, the card
//     stays exiled (the ability won’t trigger again). Using suspend to exile a card in your hand
//     is neither an activated nor a triggered ability, so it can’t be countered this way.
//   [2006-09-25] Trickbind can be used to counter the madness triggered ability. The affected card
//     will remain exiled.
//   [2006-09-25] Trickbind can be used to counter the flanking triggered ability.
//   [2006-09-25] Trickbind can be used to counter the storm triggered ability. Doing so prevents
//     the copies from being created, but doesn’t counter the original storm spell.
//   [2006-09-25] Trickbind can’t counter or prevent paying the morph cost to turn a face-down
//     creature face up, since that action doesn’t use the stack.
//   [2016-06-08] Activated abilities contain a colon. They’re generally written “[Cost]:
//     [Effect].” Some keywords are activated abilities and will have colons in their reminder
//     text.
//   [2021-03-19] Players may turn face-down creatures face up while a spell with split second is
//     on the stack.
//   [2021-03-19] Casting a spell with split second won’t affect spells and abilities that are
//     already on the stack.
//   [2021-03-19] If the resolution of a triggered ability involves casting a spell, that spell
//     can’t be cast if a spell with split second is on the stack.
//   [2021-03-19] After a spell with split second resolves (or otherwise leaves the stack), players
//     may again cast spells and activate abilities before the next object on the stack resolves.
//   [2021-03-19] Split second doesn’t stop triggered abilities from triggering, such as that of
//     Chalice of the Void. If one does, its controller puts it on the stack and chooses targets
//     for it, if any. Those abilities will resolve as normal.
//   [2021-03-19] Players still get priority while a card with split second is on the stack; their
//     options are just limited to mana abilities and certain special actions.

export default defineCard({
  name: "Trickbind",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nCounter target activated or triggered ability. If a permanent's ability is countered this way, activated abilities of that permanent can't be activated this turn. (Mana abilities can't be targeted.)",
  splitSecond: true,
  targets: ["activated-or-triggered-ability"],
  // "That permanent": the countered ability's source, only if a permanent's.
  effect: { kind: "counter", target: 0, lockSource: true },
});
