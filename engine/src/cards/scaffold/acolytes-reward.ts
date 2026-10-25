import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 18777.
//
// Rulings:
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don't count toward your devotion to any color.
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don't count toward your
//     devotion to any color.
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it's still on the battlefield at that time.
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2014-02-01] After Acolyte's Reward resolves, it no longer matters whether either target is
//     still legal. For example, if the second target is a creature controlled by an opponent, and
//     it gains hexproof after Acolyte's Reward resolves but before it prevents damage, Acolyte's
//     Reward will still deal damage to that creature. If Acolyte's Reward can't deal damage to the
//     second target (perhaps because it's a creature that has left the battlefield), Acolyte's
//     Reward will still prevent damage; it just won't deal any damage itself.
//   [2014-02-01] Acolyte's Reward has two targets: the creature that would be dealt damage and the
//     permanent or player that Acolyte's Reward will deal damage to. These targets are chosen as
//     you cast Acolyte's Reward.
//   [2014-02-01] The amount of damage the prevention shield will prevent is based on your devotion
//     to white as Acolyte's Reward resolves. That amount won't change later in the turn, even if
//     your devotion to white does.
//   [2014-02-01] If Acolyte's Reward prevents damage, it deals its damage immediately afterward as
//     part of that same prevention effect. This happens before state-based actions are performed,
//     and before any player can cast spells or activate abilities. If the source of the original
//     damage was a spell or ability, this happens before that spell or ability resumes its
//     resolution.
//   [2014-02-01] As Acolyte's Reward tries to resolve, if only the first target is illegal,
//     Acolyte's Reward won't prevent any damage that would be dealt to that creature and, because
//     of this, Acolyte's Reward won't deal damage to the second target. If only the second target
//     is illegal, damage that would be dealt to the first target will be prevented, but Acolyte's
//     Reward won't deal damage. If both targets are illegal, Acolyte's Reward won't resolve.
//   [2014-02-01] The damage will be dealt by Acolyte's Reward as it existed on the stack, not as
//     it exists when the damage is dealt. That is, it's an instant spell that's dealing the
//     damage, in case an ability cares about that (such as Satyr Firedancer's, which includes the
//     phrase "Whenever an instant or sorcery spell you control deals damage to an opponent").
//   [2014-02-01] If the amount of damage that would be dealt to the first target is in excess of
//     the amount of damage that Acolyte's Reward would prevent, the source deals its excess damage
//     to the first target at the same time that the rest of it is prevented. Then Acolyte's Reward
//     deals its damage.
//   [2014-02-01] You don't choose a source of damage. The prevention shield will apply to the next
//     X damage that would be dealt to the first target, no matter where that damage comes from. It
//     also doesn't matter whether the damage is dealt at the same time. For example, if the shield
//     prevents the next 5 damage to the first target, and that creature would be dealt 3 damage by
//     Lightning Strike, that 3 damage is prevented and Acolyte's Reward deals 3 damage to the
//     second target. The prevention effect will still apply to the next 2 damage the first target
//     would be dealt that turn.
//   [2014-02-01] The effect of Acolyte's Reward isn't a redirection effect. If it prevents damage,
//     Acolyte's Reward (not the source of that damage) deals damage to the second target as part
//     of that prevention effect. Acolyte's Reward is the source of the new damage, so the
//     characteristics of the original source (such as its color or whether it had lifelink) don't
//     apply. The new damage isn't combat damage, even if the prevented damage was.
//   [2014-02-01] If the first target would be dealt combat damage by multiple creatures, you
//     choose which of that damage to prevent. (For example, if one of those creatures has
//     deathtouch, you could choose to prevent the damage from that creature specifically.) You
//     don't decide until the point at which the creatures would deal their damage.

export default defineCard({
  name: "Acolyte's Reward",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent the next X damage that would be dealt to target creature this turn, where X is your devotion to white. If damage is prevented this way, Acolyte's Reward deals that much damage to any target. (Each {W} in the mana costs of permanents you control counts toward your devotion to white.)",
  // TODO(scaffold): Prevent the next X damage that would be dealt to target creature this turn, where X is your devotion to white.
  // TODO(scaffold): If damage is prevented this way, ~ deals that much damage to any target.
});
