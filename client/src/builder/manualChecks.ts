/**
 * A scenario for each entry of `docs/manual-checks.md`, loadable from the
 * scenario builder's "Manual checks" list: the board its Setup describes,
 * one preset per board where an entry has several. The entry's own text
 * (what to do, what to look for) is read from the doc itself, by `title` —
 * which must match the entry's `###` heading exactly; a server test builds
 * every preset and checks each heading has one (`server/src/test/
 * manual-check-presets.test.ts`).
 *
 * Boards are written with `board()`: "you" are alice, at your own precombat
 * main unless said otherwise, and opponents are bots unless an entry needs
 * you to act for them (`human: true` — then "Sit" at their seat).
 */

import type { PlayerId } from 'engine/client'
import type { ScenarioCard, ScenarioSeat, ScenarioSpec, ScenarioStep } from 'protocol'

/** A card on a side: `"Mountain*3"` is three; an object for anything more. */
type Card =
  | string
  | {
      readonly name: string
      readonly n?: number
      readonly tapped?: boolean
      readonly sick?: boolean
      readonly counters?: Readonly<Record<string, number>>
      /** The name of a permanent on any side to attach to (the first found). */
      readonly attach?: string
      readonly commander?: boolean
    }

interface Side {
  readonly bf?: readonly Card[]
  readonly hand?: readonly Card[]
  readonly gy?: readonly Card[]
  readonly exile?: readonly Card[]
  /** Top first. */
  readonly lib?: readonly Card[]
  /** Commanders left in the command zone. */
  readonly cmd?: readonly string[]
  readonly life?: number
  readonly poison?: number
  /** Played by you ("Sit" at the seat), not a bot. */
  readonly human?: boolean
}

interface BoardOpts {
  readonly you: Side
  /** One opponent, or several (a 3-4 player table). */
  readonly opp?: Side | readonly Side[]
  /** Whose turn: "you", or an opponent's index (0 = bob). */
  readonly turn?: 'you' | number
  readonly step?: ScenarioStep
  readonly fill?: number
}

export interface ManualCheckPreset {
  /** The entry's `###` heading in docs/manual-checks.md. */
  readonly title: string
  /** Which board, for an entry with several. */
  readonly variant?: string
  readonly spec: ScenarioSpec
}

const PLAYERS = ['alice', 'bob', 'carol', 'dave'] as unknown as readonly PlayerId[]

function expand(card: Card): Exclude<Card, string>[] {
  if (typeof card !== 'string') return Array.from({ length: card.n ?? 1 }, () => card)
  const m = /^(.*)\*(\d+)$/.exec(card)
  const name = m ? m[1] : card
  const n = m ? Number(m[2]) : 1
  return Array.from({ length: n }, () => ({ name }))
}

export function board(opts: BoardOpts): ScenarioSpec {
  const opps = opts.opp === undefined ? [{}] : Array.isArray(opts.opp) ? (opts.opp as readonly Side[]) : [opts.opp as Side]
  const sides: readonly Side[] = [opts.you, ...opps]
  const cards: ScenarioCard[] = []
  const pendingAttach: { key: string; to: string }[] = []
  let next = 1
  sides.forEach((side, i) => {
    const owner = PLAYERS[i]
    const put = (list: readonly Card[] | undefined, zone: ScenarioCard['zone']) => {
      for (const card of (list ?? []).flatMap(expand)) {
        const key = `m${next++}`
        cards.push({
          key,
          name: card.name,
          owner,
          zone,
          ...(card.commander ? { commander: true } : {}),
          ...(zone === 'battlefield' && card.tapped ? { tapped: true } : {}),
          ...(zone === 'battlefield' && card.sick ? { sick: true } : {}),
          ...(zone === 'battlefield' && card.counters ? { counters: card.counters } : {}),
        })
        if (zone === 'battlefield' && card.attach !== undefined) pendingAttach.push({ key, to: card.attach })
      }
    }
    put(side.bf, 'battlefield')
    put(side.hand, 'hand')
    put(side.gy, 'graveyard')
    put(side.exile, 'exile')
    put(side.lib, 'library')
    put(
      (side.cmd ?? []).map((name) => ({ name, commander: true })),
      'command',
    )
  })
  const withAttach = cards.map((c) => {
    const want = pendingAttach.find((p) => p.key === c.key)
    if (want === undefined) return c
    const host = cards.find((h) => h.zone === 'battlefield' && h.name === want.to && h.key !== c.key)
    if (host === undefined) throw new Error(`nothing named ${want.to} to attach ${c.name} to`)
    return { ...c, attachedTo: host.key }
  })
  const seats: ScenarioSeat[] = sides.map((side, i) => ({
    player: PLAYERS[i],
    life: side.life ?? 40,
    bot: i > 0 && side.human !== true,
    ...(side.poison !== undefined ? { poison: side.poison } : {}),
  }))
  return {
    seats,
    cards: withAttach,
    active: opts.turn === undefined || opts.turn === 'you' ? PLAYERS[0] : PLAYERS[opts.turn + 1],
    step: opts.step ?? 'precombat-main',
    libraryFill: opts.fill ?? 40,
  }
}

const preset = (title: string, spec: ScenarioSpec, variant?: string): ManualCheckPreset => ({
  title,
  spec,
  ...(variant !== undefined ? { variant } : {}),
})

export const MANUAL_CHECK_PRESETS: readonly ManualCheckPreset[] = [
  // --- Spells, copies and mana from unusual places (2026-10-03, first round) --------
  preset(
    'Feather: your spell on your creature returns at the end step',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
    }),
  ),
  preset(
    'Feather: a countered spell isn\'t exiled',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Forest', 'Island*2'], hand: ['Giant Growth', 'Counterspell'] },
    }),
  ),
  preset(
    'Feather: the spell still returns after Feather leaves',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Forest', 'Island'], hand: ['Giant Growth', 'Unsummon'] },
    }),
  ),
  preset(
    'Feather: choosing between two exile effects (Rest in Peace)',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
      opp: { bf: ['Rest in Peace'] },
    }),
  ),
  preset(
    'Feather: flashback spell, Feather\'s exile first',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Island'], gy: ['Defy Gravity'] },
    }),
  ),
  preset(
    'Feather: flashback spell, flashback\'s exile first',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Island'], gy: ['Defy Gravity'] },
    }),
  ),
  preset(
    'Feather: Adventure spell, Feather\'s exile first',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Swamp*2', 'Plains'], hand: ['Murderous Rider'] },
    }),
  ),
  preset(
    'Feather: Adventure spell, on an adventure instead',
    board({
      you: { bf: ['Feather, the Redeemed', 'Grizzly Bears', 'Swamp*4', 'Plains*2'], hand: ['Murderous Rider'] },
    }),
  ),
  preset(
    'Feather: a spell on an opponent\'s creature goes to the graveyard',
    board({
      you: { bf: ['Feather, the Redeemed', 'Forest'], hand: ['Giant Growth'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Zada: one copy per other creature, in the order you pick',
    board({
      you: { bf: ['Zada, Hedron Grinder', 'Grizzly Bears*2', 'Argothian Enchantress', 'Forest'], hand: ['Giant Growth'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Zada: only one other creature, no prompt',
    board({
      you: { bf: ['Zada, Hedron Grinder', 'Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
    }),
  ),
  preset(
    'Zada: a spell on Zada and another creature isn\'t copied',
    board({
      you: { bf: ['Zada, Hedron Grinder', 'Grizzly Bears*2', 'Forest', 'Plains'], hand: ['Seeds of Strength'] },
    }),
  ),
  preset(
    'Zada: all three targets on Zada copies the whole spell',
    board({
      you: { bf: ['Zada, Hedron Grinder', 'Grizzly Bears*2', 'Forest', 'Plains'], hand: ['Seeds of Strength'] },
    }),
  ),
  preset(
    'Zada: two tokens from one stack each get a copy',
    board({
      you: { bf: ['Zada, Hedron Grinder', 'Plains*2', 'Forest'], hand: ['Raise the Alarm', 'Giant Growth'] },
    }),
  ),
  preset(
    'Zada: a countered spell is still copied',
    board({
      you: { bf: ['Zada, Hedron Grinder', 'Grizzly Bears*2', 'Forest', 'Island*2'], hand: ['Giant Growth', 'Counterspell'] },
    }),
  ),
  preset(
    'Ivy: copying an opponent\'s pump spell onto Ivy',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
      turn: 0,
    }),
  ),
  preset(
    'Ivy: answering No makes no copy',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
      turn: 0,
    }),
  ),
  preset(
    'Ivy: copying a Shock kills her, so it\'s optional',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief', 'Grizzly Bears'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Ivy: no copy while she has shroud',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief', { name: 'Lightning Greaves', attach: 'Ivy, Gleeful Spellthief' }] },
      opp: { human: true, bf: ['Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
      turn: 0,
    }),
  ),
  preset(
    'Ivy: a spell on two different creatures doesn\'t trigger',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief', 'Grizzly Bears*2', 'Forest', 'Plains'], hand: ['Seeds of Strength'] },
    }),
  ),
  preset(
    'Ivy: one creature in every slot is copied onto Ivy',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief', 'Grizzly Bears', 'Forest', 'Plains'], hand: ['Seeds of Strength'] },
    }),
  ),
  preset(
    'Ivy: a spell aimed at Ivy herself doesn\'t trigger',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief', 'Forest'], hand: ['Giant Growth'] },
    }),
  ),
  preset(
    'Ivy: a spell aimed at a player doesn\'t trigger',
    board({
      you: { bf: ['Ivy, Gleeful Spellthief', 'Mountain'], hand: ['Shock'] },
    }),
  ),
  preset(
    'Krark: a lost flip returns the spell to your hand',
    board({
      you: { bf: ['Krark, the Thumbless', 'Mountain*6'], hand: ['Shock*3'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Krark: a won flip copies the spell with new targets',
    board({
      you: { bf: ['Krark, the Thumbless', 'Mountain*6'], hand: ['Shock*3'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Krark: countered after a lost flip, the spell stays in the graveyard',
    board({
      you: { bf: ['Krark, the Thumbless', 'Mountain*3', 'Island*6'], hand: ['Shock*3', 'Counterspell*3'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Krark: countered before a won flip, the copy is still made',
    board({
      you: { bf: ['Krark, the Thumbless', 'Mountain*3', 'Island*6'], hand: ['Shock*3', 'Counterspell*3'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Dawn Charm: counters a spell that targets you',
    board({
      you: { bf: ['Plains*2'], hand: ['Dawn Charm'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Rebuff the Wicked: can\'t counter a spell aimed at you',
    board({
      you: { bf: ['Plains'], hand: ['Rebuff the Wicked'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Rebuff the Wicked: counters a spell aimed at your creature',
    board({
      you: { bf: ['Grizzly Bears', 'Plains'], hand: ['Rebuff the Wicked'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Dawn Charm: can\'t counter a spell aimed at your creature',
    board({
      you: { bf: ['Grizzly Bears', 'Plains*2'], hand: ['Dawn Charm'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Rebuff the Wicked: fails if the creature is blinked',
    board({
      you: { bf: ['Grizzly Bears', 'Plains*2'], hand: ['Rebuff the Wicked', 'Cloudshift'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Season of Growth: a spell on your creature draws a card',
    board({
      you: { bf: ['Season of Growth', 'Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
    }),
  ),
  preset(
    'Season of Growth: one spell at two of your creatures draws once',
    board({
      you: { bf: ['Season of Growth', 'Grizzly Bears*2', 'Forest', 'Plains'], hand: ['Seeds of Strength'] },
    }),
  ),
  preset(
    'Season of Growth: a spell on an opponent\'s creature draws nothing',
    board({
      you: { bf: ['Season of Growth', 'Forest'], hand: ['Giant Growth'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Season of Growth: two tokens entering give two scry 1s',
    board({
      you: { bf: ['Season of Growth', 'Plains*2'], hand: ['Raise the Alarm'] },
    }),
  ),
  preset(
    'Sevinne\'s Reclamation: cast from hand, no copy',
    board({
      you: { bf: ['Plains*3'], hand: ["Sevinne's Reclamation"], gy: ['Wall of Omens'] },
    }),
  ),
  preset(
    'Sevinne\'s Reclamation: flashback copies onto a new target',
    board({
      you: { bf: ['Plains*5'], gy: ["Sevinne's Reclamation", 'Wall of Omens', 'Elvish Visionary', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Sevinne\'s Reclamation: a copy left on the old target does nothing',
    board({
      you: { bf: ['Plains*5'], gy: ["Sevinne's Reclamation", 'Wall of Omens', 'Elvish Visionary'] },
    }),
  ),
  preset(
    'Glarb: your top card is face up to you only',
    board({
      you: { bf: ["Glarb, Calamity's Augur", 'Forest*4', 'Swamp', 'Island'], lib: ['Colossal Dreadmaw'] },
      opp: { human: true },
    }),
  ),
  preset(
    'Glarb: an X spell from the top needs X of 4 or more',
    board({
      you: { bf: ["Glarb, Calamity's Augur", 'Forest*2', 'Swamp*2', 'Island*2', 'Wastes'], lib: ['Stonecoil Serpent'] },
    }),
  ),
  preset(
    'Glarb: a big creature casts from the top like from hand',
    board({
      you: { bf: ["Glarb, Calamity's Augur", 'Forest*4', 'Swamp', 'Island'], lib: ['Colossal Dreadmaw', 'Forest'] },
    }),
  ),
  preset(
    'Glarb: a land on top uses your land drop',
    board({
      you: { bf: ["Glarb, Calamity's Augur", 'Swamp'], lib: ['Forest', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Glarb: a cheap spell on top can\'t be cast',
    board({
      you: { bf: ["Glarb, Calamity's Augur", 'Forest*2'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Thundermane Dragon: a big creature from the top has haste',
    board({
      you: { bf: ['Thundermane Dragon', 'Mountain*2', 'Forest*4'], lib: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Thundermane Dragon: haste stays after the Dragon leaves',
    board({
      you: { bf: ['Thundermane Dragon', 'Mountain*2', 'Forest*4', 'Island'], hand: ['Unsummon'], lib: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Thundermane Dragon: a small creature on top can\'t be cast',
    board({
      you: { bf: ['Thundermane Dragon', 'Forest*2'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Korlessa: a Dragon on top can be cast',
    board({
      you: { bf: ['Korlessa, Scale Singer', 'Mountain*4', 'Forest*2'], lib: ['Shivan Dragon'] },
    }),
  ),
  preset(
    'Korlessa: a non-Dragon on top can\'t be cast',
    board({
      you: { bf: ['Korlessa, Scale Singer', 'Forest*2'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Sigarda: a Human on top can be cast',
    board({
      you: { bf: ['Sigarda, Font of Blessings', 'Plains*2'], lib: ['Akroan Jailer'] },
    }),
  ),
  preset(
    'Sigarda: your other permanents have hexproof',
    board({
      you: { bf: ['Sigarda, Font of Blessings', 'Grizzly Bears', 'Plains*2'] },
      opp: { human: true, bf: ['Plains*2'], hand: ['Swords to Plowshares'] },
    }),
  ),
  preset(
    'Realmwalker: choose a type, then cast that type from the top',
    board({
      you: { bf: ['Forest*4', 'Island'], hand: ['Realmwalker'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Realmwalker: a creature of another type can\'t be cast',
    board({
      you: { bf: ['Forest*4', 'Island'], hand: ['Realmwalker'], lib: ['Llanowar Elves'] },
    }),
  ),
  preset(
    'Realmwalker: a changeling on top can be cast',
    board({
      you: { bf: ['Forest*3', 'Swamp'], hand: ['Realmwalker'], lib: ['Changeling Outcast'] },
    }),
  ),
  preset(
    'Emperor Mihail II: paying {1} makes a Merfolk',
    board({
      you: { bf: ['Emperor Mihail II', 'Island*5'], lib: ['Coral Merfolk'] },
    }),
  ),
  preset(
    'Emperor Mihail II: declining the {1} makes nothing',
    board({
      you: { bf: ['Emperor Mihail II', 'Island*5'], lib: ['Coral Merfolk'] },
    }),
  ),
  preset(
    'Hakoda: an Ally on top can be cast',
    board({
      you: { bf: ['Hakoda, Selfless Commander', 'Plains*3'], lib: ['Expedition Envoy'] },
    }),
  ),
  preset(
    'Hakoda: sacrificing it protects your creatures',
    board({
      you: { bf: ['Hakoda, Selfless Commander', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Elven Chorus: your creatures tap for any colour',
    board({
      you: { bf: ['Elven Chorus', 'Grizzly Bears', 'Llanowar Elves', 'Forest*4'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Crystal Skull: an artifact on top can be cast',
    board({
      you: { bf: ['Crystal Skull, Isu Spyglass', 'Island*3'], lib: ['Sol Ring'] },
    }),
  ),
  preset(
    'Crystal Skull: a legendary creature on top can be cast',
    board({
      you: { bf: ['Crystal Skull, Isu Spyglass', 'Island*2', 'Mountain*3'], lib: ['Krenko, Mob Boss'] },
    }),
  ),
  preset(
    'Crystal Skull: a nonhistoric card on top can\'t be cast',
    board({
      you: { bf: ['Crystal Skull, Isu Spyglass', 'Forest*2'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Mystic Forge: an artifact on top can be cast',
    board({
      you: { bf: ['Mystic Forge', 'Mountain*4'], lib: ['Sol Ring'] },
    }),
  ),
  preset(
    'Mystic Forge: a colourless land on top can\'t be played',
    board({
      you: { bf: ['Mystic Forge', 'Mountain*4'], lib: ['Wastes'] },
    }),
  ),
  preset(
    'Mystic Forge: a coloured creature on top can\'t be cast',
    board({
      you: { bf: ['Mystic Forge', 'Forest*2'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Mystic Forge: pay 1 life to exile the top card',
    board({
      you: { bf: ['Mystic Forge', 'Mountain*4'], lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Gonti: one trigger exiles the top card face down',
    board({
      you: { bf: ['Gonti, Canny Acquisitor', 'Grizzly Bears', 'Island*5'] },
      opp: { lib: ['Craw Wurm', 'Forest'] },
    }),
  ),
  preset(
    'Gonti: the opponent sees only a face-down card',
    board({
      you: { bf: ['Gonti, Canny Acquisitor', 'Grizzly Bears', 'Island*5'] },
      opp: { human: true, lib: ['Craw Wurm', 'Forest'] },
    }),
  ),
  preset(
    'Gonti: cast the stolen card for {1} less with any mana',
    board({
      you: { bf: ['Gonti, Canny Acquisitor', 'Grizzly Bears', 'Island*5'] },
      opp: { lib: ['Craw Wurm', 'Forest'] },
    }),
  ),
  preset(
    'Gonti: no discount on your own cards',
    board({
      you: { bf: ['Gonti, Canny Acquisitor', 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Gonti: Feather doesn\'t exile a spell you don\'t own',
    board({
      you: { bf: ['Gonti, Canny Acquisitor', 'Feather, the Redeemed', 'Island*5'] },
      opp: { lib: ['Giant Growth', 'Forest'] },
    }),
  ),
  preset(
    'Outrageous Robbery: the cards are face down to everyone but you',
    board({
      you: { bf: ['Swamp*4'], hand: ['Outrageous Robbery'] },
      opp: { human: true, lib: ['Grizzly Bears', 'Forest'] },
    }),
  ),
  preset(
    'Outrageous Robbery: play the stolen land',
    board({
      you: { bf: ['Swamp*4'], hand: ['Outrageous Robbery'] },
      opp: { lib: ['Grizzly Bears', 'Forest'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Outrageous Robbery: cast the stolen creature with any mana',
    board({
      you: { bf: ['Swamp*4'], hand: ['Outrageous Robbery'] },
      opp: { lib: ['Grizzly Bears', 'Forest'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Outrageous Robbery: the cards stay playable on later turns',
    board({
      you: { bf: ['Swamp*4'], hand: ['Outrageous Robbery'] },
      opp: { lib: ['Grizzly Bears', 'Forest'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Grenzo: the goad mode targets only that player\'s creatures',
    board({
      you: { bf: ['Grenzo, Havoc Raiser', 'Grizzly Bears', 'Mountain*2'] },
      opp: { bf: [{ name: 'Craw Wurm', tapped: true }], lib: ['Grizzly Bears', 'Forest'] },
    }),
  ),
  preset(
    'Grenzo: an exiled spell can be cast this turn with any colour',
    board({
      you: { bf: ['Grenzo, Havoc Raiser', 'Grizzly Bears', 'Mountain*2'] },
      opp: { bf: [{ name: 'Craw Wurm', tapped: true }], lib: ['Grizzly Bears', 'Forest'] },
    }),
  ),
  preset(
    'Grenzo: an exiled land can\'t be played',
    board({
      you: { bf: ['Grenzo, Havoc Raiser', 'Grizzly Bears', 'Mountain*2'] },
      opp: { bf: [{ name: 'Craw Wurm', tapped: true }], lib: ['Forest', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Grenzo: an uncast card loses its permission next turn',
    board({
      you: { bf: ['Grenzo, Havoc Raiser', 'Grizzly Bears', 'Mountain*2'] },
      opp: { bf: [{ name: 'Craw Wurm', tapped: true }], lib: ['Grizzly Bears', 'Forest'] },
    }),
  ),
  preset(
    'Stolen Strategy: cast the stolen spell with off-colour mana',
    board({
      you: { bf: ['Stolen Strategy', 'Island*5'] },
      opp: { lib: ['Grizzly Bears', 'Forest'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Stolen Strategy: a stolen land can\'t be played',
    board({
      you: { bf: ['Stolen Strategy', 'Island*5'] },
      opp: { lib: ['Forest', 'Grizzly Bears'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Stolen Strategy: an uncast card loses its permission next turn',
    board({
      you: { bf: ['Stolen Strategy', 'Island*5'] },
      opp: { lib: ['Grizzly Bears', 'Forest'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Laughing Jasper Flint: X is the number of outlaws you control',
    board({
      you: { bf: ['Laughing Jasper Flint', 'Changeling Outcast', 'Island*5'] },
      opp: { lib: ['Grizzly Bears', 'Forest', 'Lightning Bolt'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Laughing Jasper Flint: a stolen creature is a Mercenary',
    board({
      you: { bf: ['Laughing Jasper Flint', 'Mountain*3'], hand: ['Act of Treason'] },
      opp: { bf: ['Craw Wurm'] },
    }),
  ),
  preset(
    'You Find Some Prisoners: pick one of three exiled cards',
    board({
      you: { bf: ['Mountain*4'], hand: ['You Find Some Prisoners'] },
      opp: { bf: ['Sol Ring'], lib: ['Island', 'Grizzly Bears', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'You Find Some Prisoners: a chosen land uses your land drop',
    board({
      you: { bf: ['Mountain*2'], hand: ['You Find Some Prisoners'] },
      opp: { lib: ['Island', 'Grizzly Bears', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'You Find Some Prisoners: the card is playable through your next turn',
    board({
      you: { bf: ['Mountain*4'], hand: ['You Find Some Prisoners'] },
      opp: { lib: ['Island', 'Grizzly Bears', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'You Find Some Prisoners: unplayed, it\'s stuck after your next turn',
    board({
      you: { bf: ['Mountain*4'], hand: ['You Find Some Prisoners'] },
      opp: { lib: ['Island', 'Grizzly Bears', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Tinybones: the activation is sorcery speed only',
    board({
      you: { bf: ['Tinybones, Bauble Burglar', 'Swamp*4'] },
      opp: { hand: ['Grizzly Bears', 'Lightning Bolt'] },
      step: 'begin-combat',
    }),
  ),
  preset(
    'Tinybones: the opponent chooses the discard',
    board({
      you: { bf: ['Tinybones, Bauble Burglar', 'Swamp*4'] },
      opp: { human: true, hand: ['Grizzly Bears', 'Lightning Bolt', 'Craw Wurm'] },
    }),
  ),
  preset(
    'Tinybones: each discarded card triggers separately',
    board({
      you: { bf: ['Tinybones, Bauble Burglar', 'Swamp*3'], hand: ['Mind Rot'] },
      opp: { hand: ['Grizzly Bears', 'Lightning Bolt', 'Craw Wurm'] },
    }),
  ),
  preset(
    'Tinybones: cast a stashed card on your turn with any mana',
    board({
      you: { bf: ['Tinybones, Bauble Burglar', 'Swamp*6'] },
      opp: { hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Tinybones: a stashed card can\'t be cast on the opponent\'s turn',
    board({
      you: { bf: ['Tinybones, Bauble Burglar', 'Swamp*6'] },
      opp: { hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Kalamax: copies your first instant while tapped',
    board({
      you: { bf: [{ name: 'Kalamax, the Stormsire', tapped: true }, 'Mountain'], hand: ['Shock'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Kalamax: your second instant isn\'t copied',
    board({
      you: { bf: [{ name: 'Kalamax, the Stormsire', tapped: true }, 'Mountain*2'], hand: ['Shock*2'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Kalamax: no copy if it\'s untapped when the trigger resolves',
    board({
      you: { bf: [{ name: 'Kalamax, the Stormsire', tapped: true }, 'Mountain', 'Island'], hand: ['Shock', 'Twiddle'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Stella Lee: your second spell exiles your top card to play',
    board({
      you: { bf: ['Stella Lee, Wild Card', 'Mountain*2', 'Forest*2'], hand: ['Shock*2'], lib: ['Grizzly Bears'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Stella Lee: the copy ability needs three spells first',
    board({
      you: { bf: ['Stella Lee, Wild Card', 'Mountain*3'], hand: ['Shock*3'], lib: ['Grizzly Bears'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Kalamax and Stella Lee: three Shocks and two copies',
    board({
      you: {
        bf: [{ name: 'Kalamax, the Stormsire', tapped: true }, 'Stella Lee, Wild Card', 'Mountain*3'],
        hand: ['Shock*3'],
        lib: ['Grizzly Bears'],
      },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Fire Lord Azula: a spell before combat isn\'t copied',
    board({
      you: { bf: ['Fire Lord Azula', 'Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Fire Lord Azula: a spell cast while she attacks is copied',
    board({
      you: { bf: ['Fire Lord Azula'], hand: ['Lightning Bolt'] },
      opp: { bf: [{ name: 'Grizzly Bears', tapped: true }] },
    }),
  ),
  preset(
    'Fire Lord Azula: copies in end of combat, firebending mana lasts',
    board({
      you: { bf: ['Fire Lord Azula'], hand: ['Lightning Bolt'] },
      opp: { bf: [{ name: 'Grizzly Bears', tapped: true }] },
    }),
  ),
  preset(
    'Alania: the first instant is copied if an opponent draws',
    board({
      you: { bf: ['Alania, Divergent Storm', 'Mountain'], hand: ['Shock'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Alania: the second instant isn\'t copied',
    board({
      you: { bf: ['Alania, Divergent Storm', 'Mountain*2'], hand: ['Shock*2'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Alania: the first sorcery is copied',
    board({
      you: { bf: ['Alania, Divergent Storm', 'Island*3'], hand: ['Divination'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Alania: the first Otter is copied as a token',
    board({
      you: { bf: ['Alania, Divergent Storm', 'Mountain*3'], hand: ['Kindlespark Duo'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Alania: the second Otter isn\'t copied',
    board({
      you: { bf: ['Alania, Divergent Storm', 'Mountain*6'], hand: ['Kindlespark Duo*2'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Alania: her own cast isn\'t the first Otter',
    board({
      you: { bf: ['Island*3', 'Mountain*5'], hand: ['Alania, Divergent Storm', 'Kindlespark Duo'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Imodane: damage dealt, not toughness, goes to each opponent',
    board({
      you: { bf: ['Imodane, the Pyrohammer', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Imodane: a spell split between two creatures doesn\'t trigger',
    board({
      you: { bf: ['Imodane, the Pyrohammer', 'Mountain*6'], hand: ['Fireball'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Imodane: a spell at a player doesn\'t trigger',
    board({
      you: { bf: ['Imodane, the Pyrohammer', 'Mountain'], hand: ['Shock'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Imodane: your own creature counts too',
    board({
      you: { bf: ['Imodane, the Pyrohammer', 'Grizzly Bears', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Reflections of Littjara: choosing a creature type',
    board({
      you: { bf: ['Island*5'], hand: ['Reflections of Littjara'] },
    }),
  ),
  preset(
    'Reflections of Littjara: a spell of the chosen type is copied',
    board({
      you: { bf: ['Island*5', 'Forest*2'], hand: ['Reflections of Littjara', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Reflections of Littjara: a changeling is copied',
    board({
      you: { bf: ['Island*5', 'Swamp'], hand: ['Reflections of Littjara', 'Changeling Outcast'] },
    }),
  ),
  preset(
    'Reflections of Littjara: other spells aren\'t copied',
    board({
      you: { bf: ['Island*5', 'Mountain'], hand: ['Reflections of Littjara', 'Shock'] },
    }),
  ),
  preset(
    'Volo: a creature with a new type is copied',
    board({
      you: { bf: ['Volo, Guide to Monsters', 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Volo: a creature sharing a type with yours isn\'t copied',
    board({
      you: { bf: ['Volo, Guide to Monsters', 'Grizzly Bears', 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Volo: a changeling in your graveyard blocks every copy',
    board({
      you: { bf: ['Volo, Guide to Monsters', 'Forest*6'], hand: ['Craw Wurm'], gy: ['Changeling Outcast'] },
    }),
  ),
  preset(
    'Vizier of the Menagerie: creature spells use any type of mana',
    board({
      you: { bf: ['Vizier of the Menagerie', 'Mountain*5'], hand: ['Grizzly Bears', 'Glaring Fleshraker'] },
    }),
  ),
  preset(
    'Vizier of the Menagerie: a noncreature spell still needs its colours',
    board({
      you: { bf: ['Vizier of the Menagerie', 'Mountain*3'], hand: ['Divination'] },
    }),
  ),
  preset(
    'Vizier of the Menagerie: only Murderous Rider\'s creature half',
    board({
      you: { bf: ['Vizier of the Menagerie', 'Forest*3'], hand: ['Murderous Rider'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Chromatic Orrery: Mountains pay for blue',
    board({
      you: { bf: [{ name: 'Chromatic Orrery', tapped: true }, 'Mountain*3'], hand: ['Divination'] },
    }),
  ),
  preset(
    'Chromatic Orrery: a {C} cost still needs colourless mana',
    board({
      you: { bf: [{ name: 'Chromatic Orrery', tapped: true }, 'Mountain*3'], hand: ['Glaring Fleshraker', 'Wastes'] },
    }),
  ),
  preset(
    'Chromatic Orrery: converge counts the colours actually spent',
    board({
      you: { bf: [{ name: 'Chromatic Orrery', tapped: true }, 'Mountain*3'], hand: ['Painful Truths'] },
    }),
  ),
  preset(
    'Grolnok: attacking mills three, permanent cards go to exile',
    board({
      you: { bf: ['Grolnok, the Omnivore'], lib: ['Forest', 'Grizzly Bears', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Grolnok: play lands and cast spells from croak exile',
    board({
      you: { bf: ['Grolnok, the Omnivore', 'Forest*2'], lib: ['Forest', 'Grizzly Bears', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Grolnok: Thought Scour\'s mill triggers it too',
    board({
      you: { bf: ['Grolnok, the Omnivore', 'Island'], hand: ['Thought Scour'], lib: ['Forest', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Grolnok: croak cards can\'t be played without Grolnok',
    board({
      you: {
        bf: ['Grolnok, the Omnivore', 'Forest*3', 'Island*2'],
        hand: ['Unsummon'],
        lib: ['Forest', 'Grizzly Bears', 'Lightning Bolt'],
      },
    }),
  ),
  preset(
    'Pako: exiles every player\'s top card with a fetch counter',
    board({
      you: { bf: ['Haldan, Avid Arcanist', 'Pako, Arcane Retriever', 'Mountain*3'], lib: ['Forest'] },
      opp: { lib: ['Divination'] },
    }),
  ),
  preset(
    'Haldan: cast an opponent\'s spell off any colour',
    board({
      you: { bf: ['Haldan, Avid Arcanist', 'Pako, Arcane Retriever', 'Mountain*3'], lib: ['Forest'] },
      opp: { lib: ['Divination'] },
    }),
  ),
  preset(
    'Haldan: play your own exiled land',
    board({
      you: { bf: ['Haldan, Avid Arcanist', 'Pako, Arcane Retriever', 'Mountain*3'], lib: ['Forest'] },
      opp: { lib: ['Divination'] },
    }),
  ),
  preset(
    'Haldan: a creature card can\'t be cast',
    board({
      you: { bf: ['Haldan, Avid Arcanist', 'Pako, Arcane Retriever', 'Mountain*3'], lib: ['Forest'] },
      opp: { lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Haldan: only Murderous Rider\'s Adventure is offered',
    board({
      you: { bf: ['Haldan, Avid Arcanist', 'Pako, Arcane Retriever', 'Mountain*3'], lib: ['Forest'] },
      opp: { lib: ['Murderous Rider'] },
    }),
  ),
  preset(
    'Pako: without Haldan nothing can be played',
    board({
      you: { bf: ['Pako, Arcane Retriever', 'Mountain*3'], lib: ['Forest'] },
      opp: { lib: ['Divination'] },
    }),
  ),
  preset(
    'Cut Your Losses: casualty offers only power 2 or greater',
    board({ you: { bf: ['Island*6', 'Grizzly Bears', 'Memnite'], hand: ['Cut Your Losses'] } }),
  ),
  preset(
    'Cut Your Losses: paying casualty copies the spell',
    board({ you: { bf: ['Island*6', 'Grizzly Bears'], hand: ['Cut Your Losses'] } }),
  ),
  preset(
    'Cut Your Losses: declining casualty makes no copy',
    board({ you: { bf: ['Island*6', 'Grizzly Bears'], hand: ['Cut Your Losses'] } }),
  ),
  preset(
    'Cut Your Losses: no prompt without a big enough creature',
    board({ you: { bf: ['Island*6', 'Memnite'], hand: ['Cut Your Losses'] } }),
  ),
  preset(
    'Anhelo: two casualty prompts on one spell',
    board({
      you: {
        bf: ['Silverquill, the Disputant', 'Anhelo, the Painter', 'Young Pyromancer*2', 'Grizzly Bears', 'Mountain'],
        hand: ['Lightning Bolt'],
      },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Silverquill: both copies aimed at a new target',
    board({
      you: {
        bf: ['Silverquill, the Disputant', 'Anhelo, the Painter', 'Young Pyromancer*2', 'Grizzly Bears', 'Mountain'],
        hand: ['Lightning Bolt'],
      },
      opp: { bf: ['Serra Angel'], life: 20 },
    }),
  ),
  preset(
    'Silverquill: your second spell gets only Casualty 1',
    board({
      you: {
        bf: ['Silverquill, the Disputant', 'Anhelo, the Painter', 'Young Pyromancer*2', 'Grizzly Bears', 'Mountain*2'],
        hand: ['Lightning Bolt*2'],
      },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Anhelo: Casualty 2 again on the opponent\'s turn',
    board({
      you: { bf: ['Anhelo, the Painter', 'Grizzly Bears', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Mountain'], life: 20 },
      turn: 0,
    }),
  ),
  preset(
    'Anhelo: a spell cast before Anhelo still counts as the first',
    board({
      you: { bf: ['Grizzly Bears', 'Island', 'Swamp', 'Mountain*3'], hand: ['Anhelo, the Painter', 'Lightning Bolt*2'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Venerated Rotpriest: your own spell lets you pick the opponent',
    board({
      you: { bf: ['Venerated Rotpriest', 'Grizzly Bears', 'Forest'], hand: ['Giant Growth'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Venerated Rotpriest: you aim it when an opponent\'s spell triggers it',
    board({
      you: { bf: ['Venerated Rotpriest', 'Grizzly Bears'] },
      opp: [{ human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] }, {}],
    }),
  ),
  preset(
    'Venerated Rotpriest: an equip ability doesn\'t trigger it',
    board({
      you: { bf: ['Venerated Rotpriest', 'Grizzly Bears', 'Swiftfoot Boots', 'Forest'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Mockingbird: copies a creature with mana value up to the mana spent',
    board({
      you: { bf: ['Island*3', 'Llanowar Elves', 'Grizzly Bears', 'Serra Angel', 'Mulldrifter'], hand: ['Mockingbird'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Mockingbird: copy nothing leaves a 1/1 flyer',
    board({
      you: { bf: ['Island*3', 'Grizzly Bears'], hand: ['Mockingbird'] },
    }),
  ),
  preset(
    'Deceptive Frostkite: copies your creatures with power 4 or more',
    board({
      you: { bf: ['Island*2', 'Forest', 'Grizzly Bears', 'Serra Angel', 'Llanowar Elves'], hand: ['Deceptive Frostkite', 'Giant Growth'] },
      opp: { bf: ['Wall of Denial'] },
    }),
  ),
  preset(
    'Malleable Impostor: copies only an opponent\'s creature',
    board({
      you: { bf: ['Island*4', 'Serra Angel'], hand: ['Malleable Impostor'] },
      opp: { bf: ['Grizzly Bears', 'Wall of Denial'] },
      turn: 0,
    }),
  ),
  preset(
    'Glasspool Mimic: copies only your own creature',
    board({
      you: { bf: ['Island*3', 'Grizzly Bears'], hand: ['Glasspool Mimic'] },
      opp: { bf: ['Grizzly Bears', 'Wall of Denial'] },
    }),
  ),
  preset(
    'Glasspool Mimic: the land face asks nothing',
    board({
      you: { bf: ['Grizzly Bears'], hand: ['Glasspool Mimic'] },
    }),
  ),
  preset(
    'Stunt Double: copies any creature and its enter trigger',
    board({
      you: { bf: ['Island*4', 'Mulldrifter', 'Grizzly Bears'], hand: ['Stunt Double'] },
      opp: { bf: ['Grizzly Bears', 'Wall of Denial'] },
    }),
  ),
  preset(
    'Stunt Double: copy nothing leaves a 0/0',
    board({
      you: { bf: ['Island*4', 'Mulldrifter'], hand: ['Stunt Double'] },
    }),
  ),
  preset(
    'Phyrexian Metamorph: copies an artifact or creature from either side',
    board({
      you: { bf: ['Island*3', 'Sol Ring', 'Grizzly Bears', 'Phyrexian Arena'], hand: ['Phyrexian Metamorph'] },
      opp: { bf: ['Craw Wurm', 'Mountain'] },
    }),
  ),
  preset(
    'Clever Impersonator: copies a planeswalker with its printed loyalty',
    board({
      you: { bf: ['Island*4', 'Sol Ring'], hand: ['Clever Impersonator'] },
      opp: { bf: [{ name: 'Nissa, Who Shakes the World', counters: { loyalty: 2 } }, 'Mountain', 'Craw Wurm'] },
    }),
  ),
  preset(
    'Sculpting Steel: copies only artifacts',
    board({
      you: {
        bf: ['Island*3', 'Sol Ring', 'Grizzly Bears', { name: 'Swiftfoot Boots', attach: 'Grizzly Bears' }, 'Phyrexian Arena'],
        hand: ['Sculpting Steel'],
      },
    }),
  ),
  preset(
    'Copy Artifact: the copy is also an enchantment and colourless',
    board({
      you: { bf: ['Island*2', 'Sol Ring'], hand: ['Copy Artifact'] },
    }),
  ),
  preset(
    'Masterwork of Ingenuity: an Equipment copy enters unattached',
    board({
      you: { bf: ['Island', 'Grizzly Bears', { name: 'Swiftfoot Boots', attach: 'Grizzly Bears' }], hand: ['Masterwork of Ingenuity'] },
    }),
  ),
  preset(
    'Vesuva: copies any land and enters tapped',
    board({
      you: { bf: ['Island*2', 'Forest'], hand: ['Vesuva'] },
      opp: { bf: ['Mountain'] },
    }),
  ),
  preset(
    'Vesuva: copy nothing enters untapped with no mana ability',
    board({
      you: { bf: ['Island*2'], hand: ['Vesuva'] },
      opp: { bf: ['Mountain'] },
    }),
  ),
  preset(
    'Copy Enchantment: copying an Aura asks what it enchants',
    board({
      you: { bf: ['Sol Ring', 'Island*3', { name: 'Pacifism', attach: 'Grizzly Bears' }], hand: ['Copy Enchantment'] },
      opp: { bf: ['Grizzly Bears', 'Slippery Bogle'] },
    }),
  ),
  preset(
    'Mirrormade: copies an artifact or enchantment',
    board({
      you: { bf: ['Sol Ring', 'Island*3', { name: 'Pacifism', attach: 'Grizzly Bears' }], hand: ['Mirrormade'] },
      opp: { bf: ['Grizzly Bears', 'Slippery Bogle'] },
    }),
  ),
  preset(
    'Estrid\'s Invocation: copies only your enchantments',
    board({
      you: { bf: ['Phyrexian Arena', 'Island*3'], hand: ["Estrid's Invocation"] },
      opp: { bf: ['Phyrexian Arena'] },
    }),
  ),
  preset(
    'Estrid\'s Invocation: the upkeep blink asks the copy again',
    board({
      you: { bf: ['Phyrexian Arena', 'Island*3'], hand: ["Estrid's Invocation"] },
    }),
  ),
  preset(
    'Estrid\'s Invocation: copying nothing loses the upkeep ability',
    board({
      you: { bf: ['Phyrexian Arena', 'Island*3'], hand: ["Estrid's Invocation"] },
    }),
  ),
  preset(
    'Altered Ego: can\'t be countered',
    board({
      you: { bf: ['Island*3', 'Forest*3'], hand: ['Altered Ego'] },
      opp: { human: true, bf: ['Island*2', 'Grizzly Bears'], hand: ['Counterspell'] },
    }),
  ),
  preset(
    'Altered Ego: copy nothing gets no counters',
    board({
      you: { bf: ['Island*3', 'Forest*3'], hand: ['Altered Ego'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Ghalta and Mavren: the Dinosaur\'s size is read on resolution',
    board({
      you: { bf: ['Ghalta and Mavren', 'Serra Angel', 'Grizzly Bears', 'Plains'], hand: ['Swords to Plowshares'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Ghalta and Mavren: the Dinosaur attacks a player you choose',
    board({
      you: { bf: ['Ghalta and Mavren', 'Serra Angel', 'Grizzly Bears'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Ghalta and Mavren: one Vampire per other attacker',
    board({
      you: { bf: ['Ghalta and Mavren', 'Serra Angel', 'Grizzly Bears'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Ghalta and Mavren: attacking alone makes a 0/0 Dinosaur',
    board({
      you: { bf: ['Ghalta and Mavren'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Auton Soldier: a nonlegendary artifact copy with myriad',
    board({ you: { bf: ['Krenko, Mob Boss', 'Island*6'], hand: ['Auton Soldier'] }, opp: [{}, {}] }),
  ),
  preset(
    'Auton Soldier: myriad copies attack the other opponents',
    board({ you: { bf: ['Krenko, Mob Boss', 'Island*6'], hand: ['Auton Soldier'] }, opp: [{}, {}] }),
  ),
  preset(
    'Karumonix: the enters look offers only Rats',
    board({
      you: {
        bf: ['Swamp*3'],
        hand: ['Karumonix, the Rat King'],
        lib: ['Island', 'Blightbelly Rat', 'Bilious Skulldweller', 'Island', 'Blightbelly Rat'],
      },
    }),
  ),
  preset(
    'Karumonix: granted toxic adds to a Rat\'s own',
    board({
      you: { bf: ['Karumonix, the Rat King', 'Blightbelly Rat'] },
    }),
  ),
  preset(
    'Bilious Skulldweller: a blocked attacker gives no poison',
    board({
      you: { bf: ['Bilious Skulldweller'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Blightbelly Rat: dying proliferates poison',
    board({
      you: { bf: ['Blightbelly Rat', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { poison: 1 },
    }),
  ),
  preset(
    'Contaminant Grafter: toxic from trample, then two proliferates',
    board({
      you: { bf: ['Bloated Contaminator', 'Contaminant Grafter'] },
      opp: { human: true, poison: 1, bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Contaminant Grafter: corrupted end-step draw and land',
    board({
      you: { bf: ['Contaminant Grafter'], hand: ['Forest'] },
      opp: { poison: 3 },
    }),
  ),
  preset(
    'Contaminant Grafter: no end-step trigger under 3 poison',
    board({
      you: { bf: ['Contaminant Grafter'], hand: ['Forest'] },
      opp: { poison: 2 },
    }),
  ),
  preset(
    'Tyrranax Rex: toxic 4 gives exactly 4 poison',
    board({
      you: { bf: ['Tyrranax Rex'] },
    }),
  ),
  preset(
    'Bloodroot Apothecary: you and an opponent each get a Treasure',
    board({
      you: { bf: ['Forest*3'], hand: ['Bloodroot Apothecary'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Bloodroot Apothecary: an opponent\'s Treasure gives them 2 poison',
    board({
      you: { bf: ['Bloodroot Apothecary'] },
      opp: { human: true, bf: ['Forest', 'Treasure Token'], hand: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    'Bloodroot Apothecary: your own Treasure gives nothing',
    board({
      you: { bf: ['Bloodroot Apothecary', 'Treasure Token'] },
    }),
  ),
  preset(
    'Bloodroot Apothecary: a creature token gives nothing',
    board({
      you: { bf: ['Bloodroot Apothecary'] },
      opp: { human: true, bf: ['Soldier Token', 'Viscera Seer'] },
    }),
  ),
  preset(
    'Bloodroot Apothecary: toxic 2 in combat',
    board({
      you: { bf: ['Bloodroot Apothecary'] },
    }),
  ),
  preset(
    'Mirrex: any colour only on the turn it enters',
    board({
      you: { hand: ['Mirrex'] },
    }),
  ),
  preset(
    'White Sun\'s Twilight: X = 5 spares only the new Mites',
    board({
      you: { bf: ['Plains*7', 'Phyrexian Mite Token', 'Grizzly Bears'], hand: ["White Sun's Twilight"] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'White Sun\'s Twilight: X = 4 destroys nothing',
    board({
      you: { bf: ['Plains*6', 'Phyrexian Mite Token', 'Grizzly Bears'], hand: ["White Sun's Twilight"] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Phyrexian Mite: can\'t block',
    board({
      you: { bf: ['Phyrexian Mite Token'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    'Phyrexian Mite: combat damage gives 1 poison',
    board({
      you: { bf: ['Phyrexian Mite Token'] },
    }),
  ),
  preset(
    'Obeka: combat damage adds that many upkeeps',
    board({
      you: { bf: ['Obeka, Splitter of Seconds'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Obeka: Phyrexian Arena triggers in each extra upkeep',
    board({
      you: { bf: ['Obeka, Splitter of Seconds', 'Phyrexian Arena'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Obeka: a suspended spell comes off in an extra upkeep',
    board({
      you: { bf: ['Obeka, Splitter of Seconds', 'Mountain'], hand: ['Rift Bolt'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Obeka: more damage, more upkeeps',
    board({
      you: { bf: ['Obeka, Splitter of Seconds', 'Forest'], hand: ['Giant Growth'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Spark Double: a creature copy isn\'t legendary and gets a counter',
    board({
      you: { bf: ['Island*4', 'Krenko, Mob Boss'], hand: ['Spark Double'] },
    }),
  ),
  preset(
    'Spark Double: a planeswalker copy gets one more loyalty',
    board({
      you: { bf: ['Island*4', 'Nissa, Who Shakes the World'], hand: ['Spark Double'] },
    }),
  ),
  preset(
    'Spark Double: Doubling Season doubles the counter',
    board({
      you: { bf: ['Island*4', 'Krenko, Mob Boss', 'Doubling Season'], hand: ['Spark Double'] },
    }),
  ),
  preset(
    'Clone: a copy of a legend triggers the legend rule',
    board({
      you: { bf: ['Island*4', 'Krenko, Mob Boss'], hand: ['Clone'] },
    }),
  ),
  preset(
    'Sakashima of a Thousand Faces: copies only your other creatures',
    board({
      you: { bf: ['Island*4', 'Krenko, Mob Boss'], hand: ['Sakashima of a Thousand Faces'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Sakashima of a Thousand Faces: your legends ignore the legend rule',
    board({
      you: { bf: ['Island*8', 'Krenko, Mob Boss'], hand: ['Sakashima of a Thousand Faces', 'Clone'] },
    }),
  ),
  preset(
    'Sakashima of a Thousand Faces: the legend rule returns when it leaves',
    board({
      you: { bf: ['Island*8', 'Mountain', 'Krenko, Mob Boss'], hand: ['Sakashima of a Thousand Faces', 'Clone', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Sakashima the Impostor: keeps its own name and gains a return ability',
    board({ you: { bf: ['Island*8', 'Grizzly Bears'], hand: ['Sakashima the Impostor'] } }),
  ),
  preset(
    'Sakashima the Impostor: two copies share a name and the legend rule',
    board({ you: { bf: ['Island*8', 'Grizzly Bears', 'Serra Angel'], hand: ['Sakashima the Impostor*2'] } }),
  ),
  preset(
    'Sakashima the Impostor: a new object doesn\'t return',
    board({ you: { bf: ['Island*13', 'Grizzly Bears'], hand: ['Sakashima the Impostor', 'Unsummon'] } }),
  ),
  preset(
    'Sakashima the Impostor: copy nothing is a plain 3/1',
    board({ you: { bf: ['Island*4', 'Grizzly Bears'], hand: ['Sakashima the Impostor'] } }),
  ),
  preset(
    'Phantasmal Image: targeted by an ability, it\'s sacrificed',
    board({
      you: { bf: ['Serra Angel', 'Swiftfoot Boots', 'Island*3'], hand: ['Phantasmal Image'] },
    }),
  ),
  preset(
    'Clone: a copy of Phantasmal Image is an Illusion too',
    board({
      you: { bf: ['Serra Angel', 'Island*6', 'Forest'], hand: ['Phantasmal Image', 'Clone', 'Giant Growth'] },
    }),
  ),
  preset(
    'Phantasmal Image: an opponent\'s spell sacrifices it too',
    board({
      you: { bf: ['Serra Angel', 'Island*2'], hand: ['Phantasmal Image'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Phantasmal Image: copy nothing is a 0/0 that dies',
    board({
      you: { bf: ['Serra Angel', 'Island*2'], hand: ['Phantasmal Image'] },
    }),
  ),
  preset(
    'Cursed Mirror: a hasty copy that can attack at once',
    board({ you: { bf: ['Mountain*3'], hand: ['Cursed Mirror'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  preset(
    'Cursed Mirror: back to an artifact after the turn',
    board({ you: { bf: ['Mountain*3'], hand: ['Cursed Mirror'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  preset(
    'Clone: a copy of Cursed Mirror stays an Angel',
    board({ you: { bf: ['Mountain*3', 'Island*4'], hand: ['Cursed Mirror', 'Clone'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  preset(
    'Aeve: storm copies count the Oozes already there',
    board({ you: { bf: ['Forest*5', 'Mountain*2'], hand: ['Lightning Bolt*2', 'Aeve, Progenitor Ooze'] } }),
  ),
  preset(
    'Clone: a copy of an Aeve token is legendary',
    board({ you: { bf: ['Forest*5', 'Mountain*2', 'Island*4'], hand: ['Lightning Bolt*2', 'Aeve, Progenitor Ooze', 'Clone'] } }),
  ),
  preset(
    'Prime Speaker Zegana: counters from your creatures only',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*3', 'Island*3'], hand: ['Prime Speaker Zegana'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Prime Speaker Zegana: the draw uses its last power',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*3', 'Island*3', 'Mountain'], hand: ['Prime Speaker Zegana', 'Lightning Bolt'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Tangleweave Armor: counts a commander in the command zone',
    board({ you: { cmd: ['Krenko, Mob Boss'], bf: ['Forest*4'], hand: ['Tangleweave Armor'] } }),
  ),
  preset(
    'Tangleweave Armor: moved to another creature',
    board({ you: { cmd: ['Krenko, Mob Boss'], bf: ['Forest*8', 'Grizzly Bears'], hand: ['Tangleweave Armor'] } }),
  ),
  preset(
    'Tangleweave Armor: with no commander the Germ dies',
    board({ you: { bf: ['Forest*4'], hand: ['Tangleweave Armor'] } }),
  ),
  // --- Sacrifice costs and the Tarkir precons' one-offs (2026-10-03, second round) --------
  preset(
    'Sai, Master Thopterist: casting an artifact makes a Thopter',
    board({ you: { bf: ['Sai, Master Thopterist', 'Island*2'], hand: ['Ornithopter'] } }),
  ),
  preset(
    'Sai, Master Thopterist: sacrifice two artifacts, mana paid first',
    board({ you: { bf: ['Sai, Master Thopterist', 'Island*2', 'Sol Ring', 'Treasure Token*3'] } }),
  ),
  preset(
    'Sai, Master Thopterist: take two from a stacked token tile',
    board({ you: { bf: ['Sai, Master Thopterist', 'Island*2', 'Thopter Token*10'] } }),
  ),
  preset(
    "Sai, Master Thopterist: a Treasure that pays can't also be sacrificed",
    board({ you: { bf: ['Sai, Master Thopterist', 'Island', 'Treasure Token*2'] } }),
  ),
  preset(
    'Sai, Master Thopterist: exactly enough artifacts means no prompt',
    board({ you: { bf: ['Sai, Master Thopterist', 'Island', 'Treasure Token*3'] } }),
  ),
  preset(
    'Jarad, Golgari Lich Lord: returning asks once per land type',
    board({ you: { bf: ['Overgrown Tomb*2', 'Forest'], gy: ['Jarad, Golgari Lich Lord'] } }),
  ),
  preset(
    "Jarad, Golgari Lich Lord: one Overgrown Tomb can't be both lands",
    board({ you: { bf: ['Overgrown Tomb'], gy: ['Jarad, Golgari Lich Lord'] } }),
  ),
  preset(
    'Jarad, Golgari Lich Lord: a Tomb and a Swamp need no prompt',
    board({ you: { bf: ['Overgrown Tomb', 'Swamp'], gy: ['Jarad, Golgari Lich Lord'] } }),
  ),
  preset(
    'Jarad, Golgari Lich Lord: the drain uses the pumped power',
    board({
      you: { bf: ['Jarad, Golgari Lich Lord', 'Hill Giant', 'Swamp*2', 'Forest*2'], hand: ['Giant Growth'], gy: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Metalwork Colossus: cheaper for each noncreature artifact',
    board({ you: { bf: ['Sol Ring', 'Mind Stone', 'Ornithopter', 'Wastes*6'], hand: ['Metalwork Colossus'] } }),
  ),
  preset(
    'Metalwork Colossus: sacrifice two artifacts to return it',
    board({ you: { bf: ['Sol Ring', 'Mind Stone', 'Ornithopter'], gy: ['Metalwork Colossus'] } }),
  ),
  preset(
    'Priest of Forgotten Gods: targets sacrifice in turn order',
    board({
      you: { bf: ['Priest of Forgotten Gods', 'Grizzly Bears', 'Hill Giant', 'Serra Angel'] },
      opp: [{ bf: ['Grizzly Bears', 'Llanowar Elves'] }, { bf: ['Hill Giant', 'Memnite'] }],
      turn: 0,
    }),
  ),
  preset(
    'Priest of Forgotten Gods: a target with no creatures still loses 2',
    board({ you: { bf: ['Priest of Forgotten Gods', 'Grizzly Bears', 'Hill Giant'] }, turn: 0 }),
  ),
  preset(
    'Priest of Forgotten Gods: no targets still gives {B}{B} and a card',
    board({ you: { bf: ['Priest of Forgotten Gods', 'Grizzly Bears', 'Hill Giant'] }, turn: 0 }),
  ),
  preset(
    'Priest of Forgotten Gods: targeting yourself',
    board({ you: { bf: ['Priest of Forgotten Gods', 'Grizzly Bears', 'Hill Giant', 'Serra Angel'] } }),
  ),
  preset(
    'Grim Hireling: X goes up to 3 with a Swamp',
    board({ you: { bf: ['Grim Hireling', 'Swamp', 'Treasure Token*3'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Grim Hireling: without a Swamp X goes up to 2',
    board({ you: { bf: ['Grim Hireling', 'Treasure Token*3'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Grim Hireling: X = 0 sacrifices nothing',
    board({ you: { bf: ['Grim Hireling', 'Swamp', 'Treasure Token*3'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Grim Hireling: sorcery speed only',
    board({ you: { bf: ['Grim Hireling', 'Swamp', 'Treasure Token*3'] }, opp: { bf: ['Hill Giant'] }, turn: 0 }),
  ),
  preset(
    'Grim Hireling: two creatures connecting make 2 Treasures',
    board({ you: { bf: ['Grim Hireling', 'Grizzly Bears'] } }),
  ),
  preset(
    'Magda, Brazen Outlaw: other Dwarves get +1/+0',
    board({ you: { bf: ['Magda, Brazen Outlaw', 'Axgard Cavalry'] } }),
  ),
  preset(
    'Magda, Brazen Outlaw: a Dwarf becoming tapped makes a Treasure',
    board({ you: { bf: ['Magda, Brazen Outlaw', 'Axgard Cavalry'] } }),
  ),
  preset(
    'Magda, Brazen Outlaw: five Treasures fetch an artifact or Dragon',
    board({
      you: { bf: ['Magda, Brazen Outlaw', 'Treasure Token*5'], lib: ['Grizzly Bears', 'Shivan Dragon', 'Sol Ring', 'Forest'] },
    }),
  ),
  preset(
    'Magda, Brazen Outlaw: the search needs five Treasures',
    board({
      you: { bf: ['Magda, Brazen Outlaw', 'Treasure Token*4'], lib: ['Grizzly Bears', 'Shivan Dragon', 'Sol Ring', 'Forest'] },
    }),
  ),
  preset(
    "Ruthless Technomancer: Treasures equal to a pumped creature's power",
    board({ you: { bf: ['Swamp*4', 'Forest', 'Hill Giant', 'Grizzly Bears'], hand: ['Giant Growth', 'Ruthless Technomancer'] } }),
  ),
  preset(
    'Ruthless Technomancer: answering No does nothing',
    board({ you: { bf: ['Swamp*4', 'Hill Giant', 'Grizzly Bears'], hand: ['Ruthless Technomancer'] } }),
  ),
  preset(
    'Ruthless Technomancer: each X brings back power X or less',
    board({
      you: { bf: ['Ruthless Technomancer', 'Swamp*3', 'Treasure Token*3'], gy: ['Grizzly Bears', 'Hill Giant', 'Ornithopter'] },
    }),
  ),
  preset(
    'Stormshriek Feral: an Omen card offers both halves',
    board({
      you: {
        bf: ['Mountain*5', 'Island*6', 'Forest*5'],
        hand: ['Stormshriek Feral', 'Marang River Regent', 'Whirlwing Stormbrood', 'Bloomvine Regent'],
      },
    }),
  ),
  preset(
    'Flush Out: discard, draw two, shuffled into your library',
    board({ you: { bf: ['Mountain*2'], hand: ['Stormshriek Feral', 'Lightning Bolt'] } }),
  ),
  preset(
    'Flush Out: an empty hand draws nothing',
    board({ you: { bf: ['Mountain*2'], hand: ['Stormshriek Feral'] } }),
  ),
  preset(
    'Coil and Catch: a Twincast copy, then the original',
    board({ you: { bf: ['Island*6'], hand: ['Marang River Regent', 'Twincast'] } }),
  ),
  preset(
    'Flush Out: a countered Omen goes to the graveyard',
    board({ you: { bf: ['Mountain*2', 'Island*2'], hand: ['Stormshriek Feral', 'Counterspell', 'Lightning Bolt'] } }),
  ),
  preset(
    'Dynamic Soar: an Omen with no target left goes to the graveyard',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*3', 'Island*2'], hand: ['Whirlwing Stormbrood', 'Run Away Together'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Claim Territory: two Forests, one tapped and one to hand',
    board({ you: { bf: ['Forest*3'], hand: ['Bloomvine Regent'], lib: ['Forest*2'] } }),
  ),
  preset(
    'Bloomvine Regent: the Library page shows the Omen',
    board({ you: { bf: ['Forest*5'], hand: ['Bloomvine Regent'] } }),
  ),
  preset(
    "Glorybringer: exert hits only an opponent's non-Dragon",
    board({
      you: { bf: ['Glorybringer', 'Grizzly Bears'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant', 'Stormbreath Dragon'] },
    }),
  ),
  preset(
    'Glorybringer: one legal target is chosen for you',
    board({ you: { bf: ['Glorybringer'] }, opp: { bf: ['Grizzly Bears', 'Stormbreath Dragon'] } }),
  ),
  preset(
    'Glorybringer: exert with only a Dragon to hit',
    board({ you: { bf: ['Glorybringer'] }, opp: { bf: ['Stormbreath Dragon'] } }),
  ),
  preset(
    'Combat Celebrant: exert untaps the others and adds a combat',
    board({ you: { bf: ['Glorybringer', 'Combat Celebrant', 'Grizzly Bears'] } }),
  ),
  preset(
    'Glorybringer: exerts again in the extra combat',
    board({
      you: { bf: ['Glorybringer', 'Combat Celebrant', 'Grizzly Bears'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Glorybringer: an exerted creature skips your next untap',
    board({ you: { bf: ['Glorybringer'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  preset(
    'Skarrgan Hellkite: riot asks before it enters',
    board({ you: { bf: ['Mountain*9'], hand: ['Skarrgan Hellkite'] }, opp: { bf: ['Grizzly Bears*2'] } }),
  ),
  preset(
    "Skarrgan Hellkite: riot's haste lasts",
    board({ you: { bf: ['Mountain*5'], hand: ['Skarrgan Hellkite'] } }),
  ),
  preset(
    'Skarrgan Hellkite: the counter instead of haste',
    board({ you: { bf: ['Mountain*9'], hand: ['Skarrgan Hellkite'] }, opp: { bf: ['Grizzly Bears*2'] } }),
  ),
  preset(
    'Skarrgan Hellkite: one target takes all 2',
    board({
      you: { bf: [{ name: 'Skarrgan Hellkite', counters: { '+1/+1': 1 } }, 'Mountain*4'] },
      opp: { bf: ['Grizzly Bears*2'] },
    }),
  ),
  preset(
    'Skarrgan Hellkite: two targets split 1 and 1',
    board({
      you: { bf: [{ name: 'Skarrgan Hellkite', counters: { '+1/+1': 1 } }, 'Mountain*4'] },
      opp: { bf: ['Grizzly Bears*2'] },
    }),
  ),
  preset(
    'Skarrgan Hellkite: a target lost in response keeps its share',
    board({
      you: { bf: [{ name: 'Skarrgan Hellkite', counters: { '+1/+1': 1 } }, 'Mountain*5'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Grizzly Bears*2'] },
    }),
  ),
  preset(
    "Dragonlord Atarka: targets only opponents' creatures and planeswalkers",
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*4', 'Forest*4'], hand: ['Dragonlord Atarka'] },
      opp: [{ bf: ['Grizzly Bears', 'Hill Giant', 'Nissa, Who Shakes the World'] }, { bf: ['Craw Wurm'] }],
    }),
  ),
  preset(
    'Dragonlord Atarka: divide 5 between two creatures',
    board({ you: { bf: ['Mountain*4', 'Forest*4'], hand: ['Dragonlord Atarka'] }, opp: { bf: ['Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    'Dragonlord Atarka: a lopsided split lands as assigned',
    board({ you: { bf: ['Mountain*4', 'Forest*4'], hand: ['Dragonlord Atarka'] }, opp: { bf: ['Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    'Dragonlord Atarka: one target takes all 5',
    board({ you: { bf: ['Mountain*4', 'Forest*4'], hand: ['Dragonlord Atarka'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Dragonlord Atarka: a target lost in response loses its share',
    board({
      you: { bf: ['Mountain*5', 'Forest*4'], hand: ['Dragonlord Atarka', 'Lightning Bolt'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Inferno Titan: its attack trigger divides 3 among 1 to 3 targets',
    board({ you: { bf: ['Inferno Titan', 'Grizzly Bears'] }, opp: { bf: ['Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    'Inferno Titan: Cancel in the division step',
    board({ you: { bf: ['Inferno Titan'] }, opp: { bf: ['Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    'Kotis, Sibsig Champion: cast a creature by exiling three others',
    board({
      you: {
        bf: ['Kotis, Sibsig Champion', 'Forest*2', 'Mountain*2'],
        gy: ['Grizzly Bears', 'Hill Giant', 'Forest*4'],
      },
    }),
  ),
  preset(
    'River Kelpie: draws for the Kotis cast, not the creature entering',
    board({
      you: { bf: ['Kotis, Sibsig Champion', 'River Kelpie', 'Forest*2'], gy: ['Grizzly Bears', 'Forest*3'] },
    }),
  ),
  preset(
    'Kotis, Sibsig Champion: once per turn',
    board({
      you: {
        bf: ['Kotis, Sibsig Champion', 'Forest*2', 'Mountain*4'],
        gy: ['Grizzly Bears', 'Hill Giant', 'Forest*6'],
      },
    }),
  ),
  preset(
    'Kotis, Sibsig Champion: needs three other cards',
    board({ you: { bf: ['Kotis, Sibsig Champion', 'Forest*2'], gy: ['Grizzly Bears', 'Forest*2'] } }),
  ),
  preset(
    "Kotis, Sibsig Champion: not on an opponent's turn",
    board({
      you: { bf: ['Kotis, Sibsig Champion', 'Mountain*3'], gy: ['Dualcaster Mage', 'Forest*3'] },
      turn: 0,
    }),
  ),
  preset(
    'Kotis, Sibsig Champion: an Omen card is cast only as the creature',
    board({
      you: { bf: ['Kotis, Sibsig Champion', 'Mountain*5'], gy: ['Stormshriek Feral', 'Forest*3'] },
    }),
  ),
  preset(
    'Necromantic Selection: pick only a creature it destroyed',
    board({
      you: { bf: ['Swamp*7', 'Grizzly Bears'], hand: ['Necromantic Selection'] },
      opp: { bf: ['Serra Angel', 'Soldier Token'], gy: ['Hill Giant'] },
    }),
  ),
  preset(
    'Necromantic Selection: the stolen Angel stays yours',
    board({
      you: { bf: ['Swamp*7', 'Grizzly Bears'], hand: ['Necromantic Selection'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Reunion of the House: total power of 10 or less',
    board({
      you: { bf: ['Plains*7'], hand: ['Reunion of the House'], gy: ['Serra Angel*2', 'Hill Giant', 'Grizzly Bears', 'Ornithopter'] },
    }),
  ),
  preset(
    'Protector of the Wastes: the second target from another player',
    board({
      you: { bf: ['Plains*6', 'Sol Ring'], hand: ['Protector of the Wastes'] },
      opp: [{ bf: ['Sol Ring*2'] }, { bf: ['Phyrexian Arena'] }],
    }),
  ),
  preset(
    'Protector of the Wastes: both targets are optional',
    board({
      you: { bf: ['Plains*6', 'Sol Ring'], hand: ['Protector of the Wastes'] },
      opp: { bf: ['Sol Ring*2'] },
    }),
  ),
  preset(
    'Protector of the Wastes: in a 2-player game your own counts',
    board({
      you: { bf: ['Plains*6', 'Sol Ring'], hand: ['Protector of the Wastes'] },
      opp: { bf: ['Sol Ring*2'] },
    }),
  ),
  preset(
    'Protector of the Wastes: monstrosity exiles again',
    board({
      you: { bf: ['Protector of the Wastes', 'Plains*5'] },
      opp: { bf: ['Sol Ring*2'] },
    }),
  ),
  preset(
    'Run Away Together: the second creature from another player',
    board({
      you: { bf: ['Grizzly Bears', 'Island*2'], hand: ['Run Away Together'] },
      opp: [{ bf: ['Hill Giant', 'Craw Wurm'] }, { bf: ['Memnite'] }],
    }),
  ),
  preset(
    'Run Away Together: not castable when one player has every creature',
    board({ you: { bf: ['Island*2'], hand: ['Run Away Together'] }, opp: { bf: ['Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Eliminate the Competition: sacrifice two to destroy two',
    board({
      you: { bf: ['Swamp*5', 'Grizzly Bears', 'Hill Giant', 'Young Pyromancer'], hand: ['Eliminate the Competition'] },
      opp: { bf: ['Grizzly Bears', 'Serra Angel'] },
    }),
  ),
  preset(
    "Eliminate the Competition: a target you sacrifice isn't destroyed",
    board({
      you: { bf: ['Swamp*5', 'Grizzly Bears', 'Hill Giant', 'Young Pyromancer'], hand: ['Eliminate the Competition'] },
      opp: { bf: ['Grizzly Bears', 'Serra Angel'] },
    }),
  ),
  preset(
    'Eliminate the Competition: a sacrificed Young Pyromancer, no token',
    board({
      you: { bf: ['Swamp*5', 'Grizzly Bears', 'Hill Giant', 'Young Pyromancer'], hand: ['Eliminate the Competition'] },
      opp: { bf: ['Grizzly Bears', 'Serra Angel'] },
    }),
  ),
  preset(
    'Dread Return: the target is chosen before the sacrifice',
    board({
      you: { bf: ['Grizzly Bears*2', 'Hill Giant', 'Llanowar Elves'], gy: ['Dread Return', 'Serra Angel'] },
    }),
  ),
  preset(
    'Dread Return: River Kelpie draws twice',
    board({
      you: { bf: ['River Kelpie', 'Grizzly Bears', 'Hill Giant', 'Llanowar Elves'], gy: ['Dread Return', 'Serra Angel'] },
    }),
  ),
  preset(
    'Dread Return: sacrificing River Kelpie',
    board({
      you: { bf: ['River Kelpie', 'Grizzly Bears', 'Hill Giant', 'Llanowar Elves'], gy: ['Dread Return', 'Serra Angel'] },
    }),
  ),
  preset(
    'Dread Return: exactly three creatures need no prompt',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Llanowar Elves'], gy: ['Dread Return', 'Serra Angel'] },
    }),
  ),
  preset(
    'Westvale Abbey: five creatures die together',
    board({
      you: { bf: ['Westvale Abbey', 'Wastes*5', 'Bastion of Remembrance', 'Human Cleric Token*5'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Westvale Abbey: six creatures ask which five',
    board({
      you: { bf: ['Westvale Abbey', 'Wastes*5', 'Human Cleric Token*5', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Westvale Abbey: Ormendahl arrives untapped and attacks',
    board({ you: { bf: ['Westvale Abbey', 'Wastes*5', 'Human Cleric Token*5'] } }),
  ),
  preset(
    'Mondrak, Glory Dominus: sacrifice two other artifacts or creatures',
    board({ you: { bf: ['Mondrak, Glory Dominus', 'Grizzly Bears', 'Sol Ring', 'Treasure Token', 'Plains*4'] } }),
  ),
  preset(
    'Zopandrel, Hunger Dominus: sacrifice two other creatures',
    board({
      you: { bf: ['Zopandrel, Hunger Dominus', 'Grizzly Bears', 'Hill Giant', 'Llanowar Elves', 'Sol Ring', 'Forest*2'] },
    }),
  ),
  preset(
    'Zopandrel, Hunger Dominus: doubles only your creatures',
    board({ you: { bf: ['Zopandrel, Hunger Dominus', 'Grizzly Bears'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  preset(
    "Zopandrel, Hunger Dominus: triggers in opponents' combats too",
    board({ you: { bf: ['Zopandrel, Hunger Dominus', 'Grizzly Bears'] }, opp: { bf: ['Grizzly Bears'] }, turn: 0 }),
  ),
  preset(
    'Hydra Broodmaster: monstrosity makes X Hydras',
    board({ you: { bf: ['Hydra Broodmaster', 'Forest*5'] } }),
  ),
  preset(
    'Hydra Broodmaster: Mondrak doubles the Hydras',
    board({ you: { bf: ['Hydra Broodmaster', 'Mondrak, Glory Dominus', 'Forest*5'] } }),
  ),
  preset(
    "Whirlwing Stormbrood: what you can cast on an opponent's turn",
    board({
      you: {
        bf: ['Whirlwing Stormbrood', 'Mountain*6', 'Island*4', 'Forest*4', 'Plains*2'],
        hand: ['Glorybringer', 'Grizzly Bears', 'Whirlwing Stormbrood', 'Stormshriek Feral'],
      },
      turn: 0,
    }),
  ),
  preset(
    'Thundermane Dragon: the top card is cast only as the creature',
    board({ you: { bf: ['Thundermane Dragon', 'Island*4', 'Mountain*4'], lib: ['Marang River Regent'] } }),
  ),
  preset(
    "Stormbreath Dragon: monstrosity hits each opponent by their own hand",
    board({
      you: { bf: ['Stormbreath Dragon', 'Mountain*7'] },
      opp: [{ hand: ['Grizzly Bears*2'] }, { hand: ['Grizzly Bears*5'] }],
    }),
  ),
  preset(
    'Stormbreath Dragon: a second monstrosity does nothing',
    board({ you: { bf: ['Stormbreath Dragon', 'Mountain*14'] }, opp: { hand: ['Grizzly Bears*2'] } }),
  ),
  preset(
    'Giggling Skitterspike: targeted by a spell, it deals damage first',
    board({ you: { bf: ['Giggling Skitterspike', 'Mountain*5', 'Forest'], hand: ['Giant Growth'] } }),
  ),
  preset(
    'Giggling Skitterspike: attacking kills a 5-life opponent before blocks',
    board({
      you: { bf: ['Giggling Skitterspike', 'Mountain*5'] },
      opp: [{}, { life: 5, bf: ['Hill Giant'] }],
    }),
  ),
  preset(
    'Giggling Skitterspike: blocking triggers too',
    board({ you: { bf: ['Giggling Skitterspike'] }, opp: { human: true, bf: ['Hill Giant'] }, turn: 0 }),
  ),
  preset(
    'Behind the Scenes: skulk keeps bigger creatures from blocking',
    board({
      you: { bf: ['Behind the Scenes', 'Grizzly Bears'] },
      opp: { human: true, bf: ['Hill Giant', 'Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Sidar Kondo of Jamuraa: only fliers block power 2 or less',
    board({
      you: { bf: ['Sidar Kondo of Jamuraa', 'Grizzly Bears'] },
      opp: { human: true, bf: ['Hill Giant', 'Serra Angel', 'Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Sidar Kondo of Jamuraa: applies when another player attacks',
    board({
      you: { bf: ['Sidar Kondo of Jamuraa'] },
      opp: [{ human: true, bf: ['Grizzly Bears'] }, { human: true, bf: ['Hill Giant', 'Serra Angel'] }],
      turn: 0,
    }),
  ),
  preset(
    'Sidar Kondo of Jamuraa: flanking shrinks a blocker',
    board({
      you: { bf: [{ name: 'Sidar Kondo of Jamuraa', counters: { '+1/+1': 1 } }] },
      opp: { human: true, bf: ['Serra Angel'] },
    }),
  ),
  preset(
    "Behind the Scenes: a power change after blocks doesn't undo a block",
    board({
      you: { bf: ['Behind the Scenes', 'Grizzly Bears', 'Plains*5'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Millikin: mill as the cost, mana on resolution',
    board({ you: { bf: ['Millikin'], lib: ['Hill Giant'] } }),
  ),
  preset(
    'Millikin: not a mana source when paying for a spell',
    board({ you: { bf: ['Millikin', 'Mountain'], hand: ['Sol Ring'] } }),
  ),
  preset(
    'Millikin: not activatable with an empty library',
    board({ you: { bf: ['Millikin'] }, fill: 0 }),
  ),
  preset(
    'Lithoform Engine: copy an activated ability with a new target',
    board({ you: { bf: ['Lithoform Engine', 'Prodigal Sorcerer', 'Island*2'] }, opp: { bf: ['Llanowar Elves'] } }),
  ),
  preset(
    "Lithoform Engine: can't copy an opponent's ability",
    board({
      you: { bf: ['Lithoform Engine', 'Island*2'] },
      opp: { human: true, bf: ['Prodigal Sorcerer'] },
      turn: 0,
    }),
  ),
  preset(
    'Lithoform Engine: copy a triggered ability',
    board({ you: { bf: ['Lithoform Engine', 'Forest*2', 'Island*2'], hand: ['Elvish Visionary'] } }),
  ),
  preset(
    'Lithoform Engine: copy a permanent spell',
    board({ you: { bf: ['Lithoform Engine', 'Forest*2', 'Island*4'], hand: ['Grizzly Bears'] } }),
  ),
  preset(
    'Lithoform Engine: a copied divided trigger keeps its split',
    board({
      you: { bf: ['Lithoform Engine', 'Mountain*6', 'Island*2'], hand: ['Inferno Titan'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant', 'Llanowar Elves'] },
    }),
  ),
  preset(
    "Illusionist's Bracers: copies the equipped creature's ability",
    board({
      you: { bf: ['Prodigal Sorcerer', { name: "Illusionist's Bracers", attach: 'Prodigal Sorcerer' }] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Illusionist's Bracers: a mana ability isn't copied",
    board({ you: { bf: ['Llanowar Elves', { name: "Illusionist's Bracers", attach: 'Llanowar Elves' }] } }),
  ),
  preset(
    "Illusionist's Bracers: no copy once the creature is sacrificed",
    board({ you: { bf: ['Sakura-Tribe Elder', { name: "Illusionist's Bracers", attach: 'Sakura-Tribe Elder' }] } }),
  ),
  preset(
    "Illusionist's Bracers: the copy survives the original being countered",
    board({
      you: {
        bf: ['Prodigal Sorcerer', { name: "Illusionist's Bracers", attach: 'Prodigal Sorcerer' }, 'Island*6'],
        hand: ['Sublime Epiphany'],
      },
    }),
  ),
  preset(
    'Inalla, Archmage Ritualist: eminence from the command zone',
    board({ you: { cmd: ['Inalla, Archmage Ritualist'], bf: ['Island*4'], hand: ['Prodigal Sorcerer'] } }),
  ),
  preset(
    'Inalla, Archmage Ritualist: declining eminence makes nothing',
    board({ you: { cmd: ['Inalla, Archmage Ritualist'], bf: ['Island*4'], hand: ['Prodigal Sorcerer'] } }),
  ),
  preset(
    "Virtue of Knowledge: doesn't double eminence from the command zone",
    board({
      you: { cmd: ['Inalla, Archmage Ritualist'], bf: ['Virtue of Knowledge', 'Island*4'], hand: ['Prodigal Sorcerer'] },
    }),
  ),
  preset(
    'Virtue of Knowledge: doubles eminence with Inalla on the battlefield',
    board({
      you: {
        bf: [{ name: 'Inalla, Archmage Ritualist', commander: true }, 'Virtue of Knowledge', 'Island*5'],
        hand: ['Prodigal Sorcerer'],
      },
    }),
  ),
  preset(
    'Virtue of Knowledge: Elvish Visionary draws 2',
    board({ you: { bf: ['Virtue of Knowledge', 'Forest*2'], hand: ['Elvish Visionary'] } }),
  ),
  preset(
    'Inalla, Archmage Ritualist: tap five Wizards, sick ones included',
    board({
      you: {
        bf: [
          { name: 'Inalla, Archmage Ritualist', commander: true },
          'Prodigal Sorcerer*4',
          { name: 'Prodigal Sorcerer', sick: true },
        ],
      },
    }),
  ),
  preset(
    'Electroduplicate: a copy of its token keeps the extras',
    board({ you: { bf: ['Grizzly Bears', 'Mountain*7'], hand: ['Electroduplicate'] } }),
  ),
  preset(
    "Thousand-Year Storm: creature spells don't count",
    board({
      you: { bf: ['Thousand-Year Storm', 'Island', 'Mountain*2', 'Forest*2'], hand: ['Opt', 'Grizzly Bears', 'Shock'] },
      opp: { bf: ['Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Thousand-Year Storm: each copy gets its own target',
    board({
      you: { bf: ['Thousand-Year Storm', 'Island', 'Mountain*2'], hand: ['Opt', 'Shock', 'Lightning Bolt'] },
      opp: { bf: ['Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Thousand-Year Storm: a countered spell still counts',
    board({
      you: { bf: ['Thousand-Year Storm', 'Island', 'Mountain'], hand: ['Opt', 'Shock'] },
      opp: { human: true, bf: ['Island*2'], hand: ['Counterspell'] },
    }),
  ),
  preset(
    'Thousand-Year Storm: spells cast before it arrived count',
    board({ you: { bf: ['Island*3', 'Mountain*5'], hand: ['Thousand-Year Storm', 'Opt', 'Shock'] } }),
  ),
  preset(
    'Thousand-Year Storm: the count is fixed as it triggers',
    board({ you: { bf: ['Thousand-Year Storm', 'Island', 'Mountain*2'], hand: ['Opt', 'Lightning Bolt', 'Shock'] } }),
  ),
  preset(
    "Brain Freeze: storm counts every player's spells",
    board({
      you: { bf: ['Island*3'], hand: ['Opt', 'Brain Freeze'] },
      opp: { human: true, bf: ['Island*2'], hand: ['Counterspell'] },
    }),
  ),
  preset(
    'Chain of Vapor: the bounced player may copy it back',
    board({
      you: { bf: ['Island*3', 'Grizzly Bears'], hand: ['Chain of Vapor'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Forest*4'] },
    }),
  ),
  preset(
    'Chain of Vapor: no lands, no offer',
    board({ you: { bf: ['Island'], hand: ['Chain of Vapor'] }, opp: { human: true, bf: ['Grizzly Bears'] } }),
  ),
  preset(
    'Chain of Vapor: the controller is asked, not the owner',
    board({
      you: { bf: ['Island*3', 'Mountain*3'], hand: ['Act of Treason', 'Chain of Vapor'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Sink into Stupor: returns a spell on the stack',
    board({
      you: { bf: ['Island*3'], hand: ['Sink into Stupor'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    "Sink into Stupor: works on a spell that can't be countered",
    board({
      you: { bf: ['Island*3', 'Grizzly Bears'], hand: ['Sink into Stupor'] },
      opp: { human: true, bf: ['Forest', 'Swamp'], hand: ['Abrupt Decay'] },
      turn: 0,
    }),
  ),
  preset(
    'Sink into Stupor: returns a creature',
    board({ you: { bf: ['Island*3'], hand: ['Sink into Stupor'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  preset(
    "Sink into Stupor: only an opponent's spells and nonland permanents",
    board({
      you: { bf: ['Island*4', 'Grizzly Bears'], hand: ['Opt', 'Sink into Stupor'] },
      opp: { bf: ['Grizzly Bears', 'Mountain*2'] },
    }),
  ),
  preset(
    'Soporific Springs: pay 3 life to enter untapped',
    board({ you: { hand: ['Sink into Stupor'] } }),
  ),
  preset(
    'Soporific Springs: decline and it enters tapped',
    board({ you: { hand: ['Sink into Stupor'] } }),
  ),
  preset(
    "Wandering Archaic: an opponent who can't pay {2} isn't asked",
    board({
      you: { bf: ['Wandering Archaic', 'Island*3'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Wandering Archaic: unpaid, you copy the spell',
    board({
      you: { bf: ['Wandering Archaic', 'Island*3'] },
      opp: { human: true, bf: ['Mountain*3'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Wandering Archaic: paid, no copy',
    board({
      you: { bf: ['Wandering Archaic', 'Island*3'] },
      opp: { human: true, bf: ['Mountain*3'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Explore the Vastlands: each player picks from their own top five',
    board({
      you: { bf: ['Island*3'], hand: ['Wandering Archaic'], lib: ['Forest', 'Lightning Bolt', 'Grizzly Bears', 'Island', 'Opt'] },
      opp: { human: true, lib: ['Mountain', 'Divination', 'Hill Giant', 'Plains', 'Shock'] },
    }),
  ),
  preset(
    'Explore the Vastlands: taking nothing still gains 3',
    board({
      you: { bf: ['Island*3'], hand: ['Wandering Archaic'], lib: ['Forest', 'Lightning Bolt', 'Grizzly Bears', 'Island', 'Opt'] },
      opp: { human: true, lib: ['Mountain', 'Divination', 'Hill Giant', 'Plains', 'Shock'] },
    }),
  ),
  preset(
    "Thassa's Oracle: devotion 2 against a library of 2 wins",
    board({
      you: { bf: ['Island*2'], hand: ["Thassa's Oracle"], lib: ['Forest', 'Mountain'] },
      opp: [{ lib: ['Mountain*40'] }, { lib: ['Mountain*40'] }],
      fill: 0,
    }),
  ),
  preset(
    "Thassa's Oracle: a library of 5 doesn't win",
    board({
      you: { bf: ['Island*2'], hand: ["Thassa's Oracle"], lib: ['Grizzly Bears', 'Lightning Bolt', 'Forest', 'Island', 'Opt'] },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    "Thassa's Oracle: devotion equal to the library wins",
    board({
      you: { bf: ['Island*2', 'Laboratory Maniac'], hand: ["Thassa's Oracle"], lib: ['Forest', 'Mountain', 'Plains'] },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    "Thassa's Oracle: removed in response, devotion drops",
    board({
      you: { bf: ['Island*2'], hand: ["Thassa's Oracle"], lib: ['Forest', 'Mountain'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'], lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Pact of Negation: pay at your next upkeep',
    board({
      you: { bf: ['Island*5'], hand: ['Pact of Negation'] },
      opp: { human: true, bf: ['Forest*2'], hand: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    "Pact of Negation: can't pay, you lose",
    board({
      you: { bf: ['Island*2'], hand: ['Pact of Negation'] },
      opp: { human: true, bf: ['Forest*2'], hand: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    'Pact of Negation: a countered Pact costs nothing later',
    board({
      you: { bf: ['Island*2'], hand: ['Pact of Negation'] },
      opp: { human: true, bf: ['Forest*2', 'Island*2'], hand: ['Grizzly Bears', 'Counterspell'] },
      turn: 0,
    }),
  ),
  preset(
    'Pact of Negation: against Abrupt Decay you still pay',
    board({
      you: { bf: ['Island*5', 'Grizzly Bears'], hand: ['Pact of Negation'] },
      opp: { human: true, bf: ['Forest', 'Swamp'], hand: ['Abrupt Decay'] },
      turn: 0,
    }),
  ),
  preset(
    "Summoner's Pact: only green creatures",
    board({
      you: { bf: ['Forest*4'], hand: ["Summoner's Pact"], lib: ['Hill Giant', 'Grizzly Bears', 'Craw Wurm', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Mirrodin Besieged: Phyrexian, the 15th artifact makes the target lose',
    board({
      you: { bf: ['Island*3'], hand: ['Mirrodin Besieged', 'Sol Ring'], gy: ['Ornithopter*7', 'Memnite*7'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    "Mirrodin Besieged: destroying it in response doesn't stop it",
    board({
      you: { bf: ['Island*3'], hand: ['Mirrodin Besieged', 'Sol Ring'], gy: ['Ornithopter*7', 'Memnite*7'] },
      opp: [{ human: true, bf: ['Forest', 'Swamp'], hand: ['Abrupt Decay'] }, {}],
    }),
  ),
  preset(
    'Mirrodin Besieged: Mirran makes a Myr',
    board({ you: { bf: ['Island*4'], hand: ['Mirrodin Besieged', 'Sol Ring'] } }),
  ),
  preset(
    'Weaver of Harmony: pumps other enchantment creatures',
    board({ you: { bf: ['Weaver of Harmony*2'] } }),
  ),
  preset(
    'Weaver of Harmony: a copied Banishing Light trigger is linked too',
    board({
      you: { bf: ['Weaver of Harmony', 'Forest', 'Plains*3'], hand: ['Banishing Light'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Llanowar Elves', 'Forest', 'Swamp'], hand: ['Abrupt Decay'] },
    }),
  ),
  preset(
    "Weaver of Harmony: won't copy a creature's ability",
    board({ you: { bf: ['Weaver of Harmony', 'Prodigal Sorcerer', 'Forest'] } }),
  ),
  preset(
    'Weaver of Harmony: judges the source as it last was',
    board({ you: { bf: ['Weaver of Harmony', 'Forest', 'Island*4'], hand: ['Mirrormade'] }, opp: { bf: ['Mind Stone'] } }),
  ),
  preset(
    'Vantress Visions: copy an ability, then cast Virtue later',
    board({ you: { bf: ['Prodigal Sorcerer', 'Island*9'], hand: ['Virtue of Knowledge'] } }),
  ),
  preset(
    'Sword of Wealth and Power: protection from instants',
    board({
      you: { bf: ['Grizzly Bears', { name: 'Sword of Wealth and Power', attach: 'Grizzly Bears' }] },
      opp: { human: true, bf: ['Prodigal Sorcerer', 'Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Sword of Wealth and Power: the next instant is copied once',
    board({
      you: { bf: ['Grizzly Bears', { name: 'Sword of Wealth and Power', attach: 'Grizzly Bears' }, 'Mountain', 'Island'], hand: ['Lightning Bolt', 'Opt'] },
    }),
  ),
  preset(
    "Sword of Wealth and Power: the copy doesn't carry to next turn",
    board({
      you: { bf: ['Grizzly Bears', { name: 'Sword of Wealth and Power', attach: 'Grizzly Bears' }, 'Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Thunderclap Drake: instants and sorceries cost {1} less',
    board({ you: { bf: ['Thunderclap Drake', 'Island*3'], hand: ['Divination', 'Opt'] } }),
  ),
  preset(
    'Thunderclap Drake: no commander casts, no copies',
    board({ you: { cmd: ['Krenko, Mob Boss'], bf: ['Thunderclap Drake', 'Island*3', 'Mountain'], hand: ['Lightning Bolt'] } }),
  ),
  preset(
    'Thunderclap Drake: one copy per commander cast',
    board({ you: { cmd: ['Krenko, Mob Boss'], bf: ['Thunderclap Drake', 'Island*3', 'Mountain*5'], hand: ['Lightning Bolt'] } }),
  ),
  preset(
    'Primal Amulet: decline the flip, then accept it',
    board({ you: { bf: [{ name: 'Primal Amulet', counters: { charge: 3 } }, 'Island', 'Mountain'], hand: ['Opt', 'Lightning Bolt'] } }),
  ),
  preset(
    'Primal Wellspring: a countered Bolt is still copied',
    board({
      you: { bf: [{ name: 'Primal Amulet', counters: { charge: 3 } }, 'Island'], hand: ['Opt', 'Lightning Bolt'] },
      opp: { human: true, bf: ['Island*2'], hand: ['Counterspell'] },
    }),
  ),
  preset(
    'Primal Wellspring: mana spent on a creature copies nothing',
    board({ you: { bf: [{ name: 'Primal Amulet', counters: { charge: 3 } }, 'Island', 'Mountain*3'], hand: ['Opt', 'Hill Giant'] } }),
  ),
  preset(
    "Reverberate: copy an opponent's Bolt at them",
    board({
      you: { bf: ['Mountain*2'], hand: ['Reverberate'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Dualcaster Mage: a copied Divination draws for you',
    board({
      you: { bf: ['Mountain*3'], hand: ['Dualcaster Mage'] },
      opp: { human: true, bf: ['Island*3'], hand: ['Divination'] },
      turn: 0,
    }),
  ),
  preset(
    'Reverberate: a copied Izzet Charm keeps its mode',
    board({
      you: { bf: ['Mountain*2', 'Grizzly Bears'], hand: ['Reverberate'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Mountain', 'Island'], hand: ['Izzet Charm'] },
      turn: 0,
    }),
  ),
  preset(
    'Kitsa, Otterball Elite: copying needs power 3',
    board({ you: { bf: ['Kitsa, Otterball Elite', 'Island*5'], hand: ['Opt', 'Brainstorm'] } }),
  ),
  preset(
    "Kitsa, Otterball Elite: never an opponent's spell",
    board({
      you: { bf: [{ name: 'Kitsa, Otterball Elite', counters: { '+1/+1': 2 } }, 'Island*2'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Jin-Gitaxias, Progress Tyrant: copies your first artifact each turn',
    board({ you: { bf: ['Jin-Gitaxias, Progress Tyrant', 'Island*4'], hand: ['Sol Ring*2', 'Opt'] } }),
  ),
  preset(
    'Jin-Gitaxias, Progress Tyrant: counters once per turn in total',
    board({
      you: { bf: ['Jin-Gitaxias, Progress Tyrant'] },
      opp: [{ human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] }, { human: true, bf: ['Mountain'], hand: ['Shock'] }],
      turn: 0,
    }),
  ),
  preset(
    'Jin-Gitaxias, Progress Tyrant: copying resets each turn',
    board({ you: { bf: ['Jin-Gitaxias, Progress Tyrant', 'Island*2'], hand: ['Sol Ring*2'] } }),
  ),
  preset(
    'Jin-Gitaxias, Progress Tyrant: an artifact cast before it arrived',
    board({ you: { bf: ['Island*7'], hand: ['Sol Ring*2', 'Jin-Gitaxias, Progress Tyrant'] } }),
  ),
  preset(
    'Laboratory Maniac: drawing from an empty library wins',
    board({
      you: { bf: ['Laboratory Maniac', 'Island*3'], hand: ['Divination'], lib: ['Forest'] },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    "Laboratory Maniac: the opponent's Platinum Angel stops the win",
    board({
      you: { bf: ['Laboratory Maniac', 'Island'], hand: ['Opt'] },
      opp: { bf: ['Platinum Angel'], lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Platinum Angel: you stay in at 0 life',
    board({
      you: { life: 1, bf: ['Platinum Angel'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Platinum Angel: you stay in with 10 poison',
    board({ you: { poison: 10, bf: ['Platinum Angel'] } }),
  ),
  preset(
    'Platinum Angel: you lose once it leaves',
    board({
      you: { life: 1, bf: ['Platinum Angel', 'Swamp*2'], hand: ['Doom Blade'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Platinum Angel: conceding still loses',
    board({ you: { bf: ['Platinum Angel'] } }),
  ),
  preset(
    'Herald of Eternal Dawn: flashed in, you stay in at 0 life',
    board({
      you: { life: 1, bf: ['Plains*7'], hand: ['Herald of Eternal Dawn'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    "Notion Thief: an opponent's draws win you the game",
    board({
      you: { bf: ['Laboratory Maniac', 'Notion Thief', 'Island*2'] },
      opp: { human: true, bf: ['Island*3'], hand: ['Divination'], lib: ['Mountain*40'] },
      turn: 0,
      fill: 0,
    }),
  ),
  preset(
    'Jace, Wielder of Mysteries: -8 wins from a library of 5',
    board({
      you: {
        bf: [{ name: 'Jace, Wielder of Mysteries', counters: { loyalty: 8 } }],
        lib: ['Forest', 'Mountain', 'Plains', 'Island', 'Swamp'],
      },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Jace, Wielder of Mysteries: +1 mills, then draws',
    board({
      you: {
        bf: [{ name: 'Jace, Wielder of Mysteries', counters: { loyalty: 8 } }],
        lib: ['Forest', 'Mountain', 'Plains', 'Island', 'Swamp'],
      },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    "Angel's Grace: split second",
    board({
      you: { life: 3, bf: ['Plains*2'], hand: ["Angel's Grace"] },
      opp: { human: true, bf: ['Vampire Nighthawk', 'Serra Angel', 'Mountain*2', 'Swamp*2'], hand: ['Lightning Bolt', 'Sign in Blood'] },
      turn: 0,
      step: 'begin-combat',
    }),
  ),
  preset(
    "Angel's Grace: combat damage stops at 1",
    board({
      you: { life: 3, bf: ['Plains*2'], hand: ["Angel's Grace"] },
      opp: { human: true, bf: ['Vampire Nighthawk', 'Serra Angel'] },
      turn: 0,
      step: 'begin-combat',
    }),
  ),
  preset(
    "Angel's Grace: life loss still goes below 1",
    board({
      you: { life: 1, bf: ['Plains*2'], hand: ["Angel's Grace"] },
      opp: { human: true, bf: ['Swamp*2', 'Mountain'], hand: ['Sign in Blood', 'Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    "Angel's Grace: you lose at cleanup",
    board({
      you: { life: 1, bf: ['Plains*2'], hand: ["Angel's Grace"] },
      opp: { human: true, bf: ['Swamp*2'], hand: ['Sign in Blood'] },
      turn: 0,
    }),
  ),
  preset(
    "Everybody Lives!: Night's Whisper costs no life",
    board({ you: { bf: ['Plains*2', 'Swamp*2'], hand: ['Everybody Lives!', "Night's Whisper"] } }),
  ),
  preset(
    'Everybody Lives!: Toxic Deluge only for X = 0',
    board({ you: { bf: ['Plains*2', 'Swamp*3'], hand: ['Everybody Lives!', 'Toxic Deluge'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Everybody Lives!: Phyrexian mana needs real mana',
    board({ you: { bf: ['Plains*3'], hand: ['Everybody Lives!', 'Dismember'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Everybody Lives!: Steam Vents enters tapped',
    board({ you: { bf: ['Plains*2'], hand: ['Everybody Lives!', 'Steam Vents'] } }),
  ),
  preset(
    "Everybody Lives!: hexproof for the opponent's creatures",
    board({
      you: { bf: ['Plains*2', 'Swamp*3', 'Grizzly Bears'], hand: ['Everybody Lives!', 'Dismember'] },
      opp: { bf: ['Hill Giant', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Everybody Lives!: conceding still loses',
    board({ you: { bf: ['Plains*2'], hand: ['Everybody Lives!'] } }),
  ),
  preset(
    'Toxic Deluge: paying your last life loses before it resolves',
    board({
      you: {
        life: 3,
        bf: ['Swamp*3', 'Grizzly Bears'],
        hand: ['Toxic Deluge', 'Forest*3', 'Island*3', 'Mountain*3'],
      },
      opp: [{ bf: ['Hill Giant'] }, { bf: ['Craw Wurm'] }],
    }),
  ),
  preset(
    'Pact of Negation: losing in your own upkeep',
    board({
      you: { bf: ['Island'], hand: ['Opt', 'Pact of Negation'] },
      opp: [{ bf: ['Hill Giant'] }, { bf: ['Craw Wurm'] }],
    }),
  ),
  preset(
    'Felidar Sovereign: wins at your upkeep at 40 life',
    board({ you: { life: 40, bf: ['Felidar Sovereign'] }, turn: 0, step: 'end' }),
  ),
  preset(
    'Felidar Sovereign: Bolted in response, no win',
    board({
      you: { life: 40, bf: ['Felidar Sovereign'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Triskaidekaphile: wins with exactly 13 in hand',
    board({ you: { bf: ['Triskaidekaphile'], hand: ['Forest*13'] }, turn: 0, step: 'end' }),
  ),
  preset(
    "Triskaidekaphile: 14 in hand doesn't trigger",
    board({ you: { bf: ['Triskaidekaphile'], hand: ['Forest*14'] }, turn: 0, step: 'end' }),
  ),
  preset(
    'Triskaidekaphile: no cleanup discard',
    board({ you: { bf: ['Triskaidekaphile'], hand: ['Forest*14'] } }),
  ),
  preset(
    'Helix Pinnacle: X counters, then a win at 100',
    board({ you: { bf: [{ name: 'Helix Pinnacle', counters: { tower: 99 } }, 'Forest*2'] } }),
  ),
  preset(
    "Helix Pinnacle: Abrupt Decay can't target it",
    board({
      you: { bf: [{ name: 'Helix Pinnacle', counters: { tower: 99 } }] },
      opp: { human: true, bf: ['Forest', 'Swamp'], hand: ['Abrupt Decay'] },
      turn: 0,
    }),
  ),
  preset(
    'Simic Ascendancy: one counter, one growth counter, a win at 20',
    board({ you: { bf: [{ name: 'Simic Ascendancy', counters: { growth: 19 } }, 'Grizzly Bears', 'Forest*2', 'Island'] } }),
  ),
  preset(
    "Revel in Riches: Treasures only for opponents' creatures",
    board({
      you: { bf: ['Revel in Riches', 'Grizzly Bears', 'Mountain*2'], hand: ['Lightning Bolt*2'] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Hellkite Tyrant: takes only the damaged player's artifacts",
    board({ you: { bf: ['Hellkite Tyrant'] }, opp: [{ bf: ['Sol Ring', 'Mind Stone'] }, { bf: ['Sol Ring'] }] }),
  ),
  preset(
    'Knuckles the Echidna: one Treasure per combat damage step',
    board({ you: { bf: ['Knuckles the Echidna', 'Grizzly Bears'] } }),
  ),
  preset(
    'Reliquary Tower: newer than the Toad, no discard',
    board({ you: { bf: ['Twenty-Toed Toad', 'Island*2'], hand: ['Reliquary Tower', 'Forest*24'] } }),
  ),
  preset(
    'Twenty-Toed Toad: newer than the Tower, discard to 20',
    board({ you: { bf: ['Reliquary Tower', 'Island*3', 'Forest*2'], hand: ['Twenty-Toed Toad', 'Forest*24'] } }),
  ),
  preset(
    'Twenty-Toed Toad: order the triggers to win',
    board({ you: { bf: ['Twenty-Toed Toad', 'Grizzly Bears'], hand: ['Forest*19'] } }),
  ),
  preset(
    "Twenty-Toed Toad: the other order doesn't win",
    board({ you: { bf: ['Twenty-Toed Toad', 'Grizzly Bears'], hand: ['Forest*19'] } }),
  ),
  preset(
    'Approach of the Second Sun: the first one goes back in the library',
    board({
      you: {
        bf: ['Plains*7'],
        hand: ['Approach of the Second Sun'],
        lib: ['Forest', 'Mountain', 'Island', 'Swamp', 'Plains', 'Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Opt', 'Shock'],
      },
    }),
  ),
  preset(
    'Approach of the Second Sun: the second one from hand wins',
    board({ you: { bf: ['Plains*14'], hand: ['Approach of the Second Sun*2'] } }),
  ),
  preset(
    'Approach of the Second Sun: a countered first still counts',
    board({
      you: { bf: ['Plains*14'], hand: ['Approach of the Second Sun*2'] },
      opp: { human: true, bf: ['Island*2'], hand: ['Counterspell'] },
    }),
  ),
  preset(
    'Approach of the Second Sun: a short library takes it at the bottom',
    board({
      you: { bf: ['Plains*7'], hand: ['Approach of the Second Sun'], lib: ['Forest', 'Mountain', 'Island'] },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Approach of the Second Sun: the same card recast counts',
    board({
      you: { bf: ['Plains*14', 'Island'], hand: ['Approach of the Second Sun', 'Opt'] },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Approach of the Second Sun: a Reverberate copy just stops existing',
    board({ you: { bf: ['Plains*14', 'Mountain*2'], hand: ['Approach of the Second Sun*2', 'Reverberate'] } }),
  ),
  preset(
    'Vorpal Sword: a player hit loses the game',
    board({
      you: { bf: ['Grizzly Bears', { name: 'Vorpal Sword', attach: 'Grizzly Bears' }, 'Swamp*8'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    "Vorpal Sword: without the activation it's only +2/+0",
    board({
      you: { bf: ['Grizzly Bears', { name: 'Vorpal Sword', attach: 'Grizzly Bears' }] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Vorpal Sword: the ability lasts only that turn',
    board({
      you: { bf: ['Grizzly Bears', { name: 'Vorpal Sword', attach: 'Grizzly Bears' }, 'Swamp*8'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Summon: Primal Odin: chapter II makes a hit player lose',
    board({
      you: { bf: [{ name: 'Summon: Primal Odin', counters: { lore: 1 } }] },
      opp: [{}, {}],
      step: 'upkeep',
    }),
  ),
  preset(
    'Summon: Primal Odin: the trigger works after Odin is gone',
    board({
      you: { bf: [{ name: 'Summon: Primal Odin', counters: { lore: 1 } }, 'Mountain'], hand: ['Lightning Bolt'] },
      opp: [{}, {}],
      step: 'upkeep',
    }),
  ),
  preset(
    "Platinum Angel: Bob doesn't lose to Vorpal Sword",
    board({
      you: { bf: ['Grizzly Bears', { name: 'Vorpal Sword', attach: 'Grizzly Bears' }, 'Swamp*8'] },
      opp: [{ bf: [{ name: 'Platinum Angel', tapped: true }] }, {}],
    }),
  ),
  // --- Mana abilities: colours chosen, lands' types, doubling (2026-10-03, third round) --------
  preset(
    'Nykthos: one menu entry per colour you have devotion to',
    board({
      you: { bf: ['Nykthos, Shrine to Nyx', 'Gray Merchant of Asphodel', 'Deathrite Shaman', 'Kinnan, Bonder Prodigy', 'Island*3'] },
    }),
  ),
  preset(
    'Nykthos: tapping for black',
    board({
      you: { bf: ['Nykthos, Shrine to Nyx', 'Gray Merchant of Asphodel', 'Deathrite Shaman', 'Kinnan, Bonder Prodigy', 'Island*3'] },
    }),
  ),
  preset(
    'Nykthos: pays for a second Gray Merchant',
    board({
      you: {
        bf: ['Nykthos, Shrine to Nyx', 'Gray Merchant of Asphodel', 'Deathrite Shaman', 'Kinnan, Bonder Prodigy', 'Island*3'],
        hand: ['Gray Merchant of Asphodel'],
      },
    }),
  ),
  preset(
    'Nykthos: the menu updates when devotion changes',
    board({
      you: {
        bf: ['Nykthos, Shrine to Nyx', 'Gray Merchant of Asphodel', 'Deathrite Shaman', 'Kinnan, Bonder Prodigy', 'Island*3', 'Forest'],
        hand: ['Llanowar Elves'],
      },
    }),
  ),
  preset(
    'Nyx Lotus: tapped by hand, no {2} to pay',
    board({
      you: { bf: [{ name: 'Nyx Lotus', tapped: false }, 'Gray Merchant of Asphodel', 'Deathrite Shaman'] },
    }),
  ),
  preset(
    'Nyx Lotus: enters tapped',
    board({ you: { bf: ['Island*4'], hand: ['Nyx Lotus'] } }),
  ),
  preset(
    'Nykthos: Mana Reflection doubles the black',
    board({
      you: { bf: ['Nykthos, Shrine to Nyx', 'Gray Merchant of Asphodel', 'Deathrite Shaman', 'Island*2', 'Mana Reflection'] },
    }),
  ),
  preset(
    "Nykthos: Mirari's Wake's extra {B} isn't doubled",
    board({
      you: { bf: ['Nykthos, Shrine to Nyx', 'Gray Merchant of Asphodel', 'Deathrite Shaman', 'Island*2', 'Mana Reflection', "Mirari's Wake"] },
    }),
  ),
  preset(
    'Three Tree City: two mana of any one colour for two Bears',
    board({ you: { bf: ['Grizzly Bears*2', 'Llanowar Elves', 'Swamp*2'], hand: ['Three Tree City'] } }),
  ),
  preset(
    'Three Tree City: no creature of the chosen type',
    board({ you: { bf: ['Llanowar Elves', 'Swamp*2'], hand: ['Three Tree City'] } }),
  ),
  preset(
    'Mox Amber: no mana without a legendary of your own',
    board({
      you: { bf: ['Mox Amber', 'Llanowar Elves', 'Grizzly Bears'] },
      opp: { bf: ['Teysa Karlov'] },
    }),
  ),
  preset(
    "The Grey Havens: an opponent's graveyard doesn't count",
    board({
      you: { bf: ['The Grey Havens'], gy: ['Grizzly Bears'] },
      opp: { gy: ['Kinnan, Bonder Prodigy'] },
    }),
  ),
  preset(
    "Mox Amber: one mana of one of Teysa's colours",
    board({ you: { bf: ['Mox Amber', 'Teysa Karlov'] } }),
  ),
  preset(
    'Plaza of Heroes: mana among your legendary permanents',
    board({ you: { bf: ['Plaza of Heroes', 'Teysa Karlov'] } }),
  ),
  preset(
    'The Grey Havens: a legendary creature card in your graveyard',
    board({ you: { bf: ['The Grey Havens'], gy: ['Teysa Karlov'] } }),
  ),
  preset(
    'Faeburrow Elder: grows with each colour you control',
    board({ you: { bf: ['Faeburrow Elder', 'Plains*2', 'Swamp*2'], hand: ['Teysa Karlov'] } }),
  ),
  preset(
    'Bloom Tender: one mana of each colour, no prompt',
    board({ you: { bf: ['Bloom Tender', 'Teysa Karlov'] } }),
  ),
  preset(
    'Faeburrow Elder: one mana of each colour, no prompt',
    board({ you: { bf: ['Faeburrow Elder', 'Teysa Karlov'] } }),
  ),
  preset(
    'Bloom Tender: alone it makes just {G}',
    board({ you: { bf: ['Bloom Tender'] } }),
  ),
  preset(
    "Plaza of Heroes: legendary-only mana won't cast Lightning Bolt",
    board({ you: { bf: ['Plaza of Heroes'], hand: ['Lightning Bolt'] } }),
  ),
  preset(
    'Plaza of Heroes: legendary-only mana casts a legendary spell',
    board({ you: { bf: ['Plaza of Heroes', 'Mountain*3'], hand: ['Krenko, Mob Boss'] } }),
  ),
  preset(
    'Chrome Mox: what can be imprinted',
    board({ you: { hand: ['Chrome Mox', 'Izzet Charm', 'Sol Ring', 'Forest', "Kozilek's Channeler"] } }),
  ),
  preset(
    'Chrome Mox: an imprinted Izzet Charm gives {U} or {R}',
    board({ you: { hand: ['Chrome Mox', 'Izzet Charm'] } }),
  ),
  preset(
    'Chrome Mox: a recast Mox loses its old imprint',
    board({ you: { bf: ['Island*2'], hand: ['Chrome Mox', 'Izzet Charm', 'Boomerang'] } }),
  ),
  preset(
    'Chrome Mox: a colourless imprint gives no mana',
    board({ you: { hand: ['Chrome Mox', "Kozilek's Channeler"] } }),
  ),
  preset(
    "Mirari's Wake: you pick the extra mana's type",
    board({ you: { bf: ["Mirari's Wake", 'Azorius Chancery'] } }),
  ),
  preset(
    "Mirari's Wake: creatures get +1/+1",
    board({ you: { bf: ["Mirari's Wake", 'Grizzly Bears'] } }),
  ),
  preset(
    "Mirari's Wake: the extra mana isn't creature-only",
    board({ you: { bf: ["Mirari's Wake", 'Ancient Ziggurat'], hand: ['Savannah Lions', 'Swords to Plowshares'] } }),
  ),
  preset(
    'Fertile Ground: one extra mana of any colour',
    board({ you: { bf: ['Forest', { name: 'Fertile Ground', attach: 'Forest' }] } }),
  ),
  preset(
    'Utopia Sprawl: can only enchant a Forest',
    board({ you: { bf: ['Forest*2', 'Plains'], hand: ['Utopia Sprawl'] } }),
  ),
  preset(
    'Utopia Sprawl: the Forest adds {G}{U} with no prompt',
    board({ you: { bf: ['Forest*2'], hand: ['Utopia Sprawl'] } }),
  ),
  preset(
    'Utopia Sprawl: the auto-payer counts the extra mana',
    board({ you: { bf: ['Forest*2'], hand: ['Utopia Sprawl', 'Think Twice'] } }),
  ),
  preset(
    'Zendikar Resurgent: a Forest makes {G}{G}',
    board({ you: { bf: ['Zendikar Resurgent', 'Forest'] } }),
  ),
  preset(
    'Zendikar Resurgent: draws when you cast a creature',
    board({ you: { bf: ['Zendikar Resurgent', 'Forest*2'], hand: ['Grizzly Bears'] } }),
  ),
  preset(
    'Kinnan: lands get no extra mana',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Forest'] } }),
  ),
  preset(
    'Kinnan: Azorius Signet makes three mana',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Azorius Signet', 'Swamp'] } }),
  ),
  preset(
    'Kinnan: a Treasure makes two of one colour',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Treasure Token'] } }),
  ),
  preset(
    'Kinnan: Birds of Paradise makes two of one colour',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Birds of Paradise'] } }),
  ),
  preset(
    'Kinnan: Sol Ring makes three',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Sol Ring'] } }),
  ),
  preset(
    'Kinnan: the look-at-five ability',
    board({
      you: {
        bf: ['Kinnan, Bonder Prodigy', 'Forest*4', 'Island*3'],
        lib: ['Grizzly Bears', 'Forest', 'Akroan Jailer', 'Opt', 'Hill Giant'],
      },
    }),
  ),
  preset(
    'Kinnan: Llanowar Elves alone casts Grizzly Bears',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Llanowar Elves'], hand: ['Grizzly Bears'] } }),
  ),
  preset(
    'Deathrite Shaman: the land ability asks a colour as it resolves',
    board({ you: { bf: ['Deathrite Shaman'] }, opp: { gy: ['Forest'] } }),
  ),
  preset(
    'Deathrite Shaman: no mana if the land is already gone',
    board({ you: { bf: ['Deathrite Shaman*2'] }, opp: { gy: ['Forest'] } }),
  ),
  preset(
    'Deathrite Shaman: the auto-payer never uses it',
    board({ you: { bf: ['Deathrite Shaman', 'Forest'], hand: ['Grizzly Bears'] }, opp: { gy: ['Forest'] } }),
  ),
  preset(
    'Deathrite Shaman: the {B} ability drains',
    board({ you: { bf: ['Deathrite Shaman', 'Swamp'] }, opp: { gy: ['Lightning Bolt'] } }),
  ),
  preset(
    'Deathrite Shaman: the {G} ability gains life',
    board({ you: { bf: ['Deathrite Shaman', 'Forest'] }, opp: { gy: ['Hill Giant'] } }),
  ),
  preset(
    'Culling Ritual: what it destroys and the mana it adds',
    board({
      you: {
        bf: ['Swamp*2', 'Forest*2', 'Llanowar Elves', 'Darksteel Relic', 'Gray Merchant of Asphodel'],
        hand: ['Culling Ritual'],
      },
      opp: { bf: ['Grizzly Bears', 'Soldier Token*2', 'Gray Merchant of Asphodel', 'Plains'] },
    }),
  ),
  preset(
    "Burnt Offering: mana equal to the sacrificed creature's mana value",
    board({ you: { bf: ['Swamp', 'Gray Merchant of Asphodel'], hand: ['Burnt Offering'] } }),
  ),
  preset(
    'Burnt Offering: a token gives no mana',
    board({ you: { bf: ['Swamp', 'Soldier Token'], hand: ['Burnt Offering'] } }),
  ),
  preset(
    'Klauth: X is counted as the trigger resolves',
    board({ you: { bf: ['Klauth, Unrivaled Ancient', 'Grizzly Bears', 'Mountain'], hand: ['Lightning Bolt'] } }),
  ),
  preset(
    'Klauth: the split prompt',
    board({ you: { bf: ['Klauth, Unrivaled Ancient'] } }),
  ),
  preset(
    'Klauth: the mana lasts into the second main phase',
    board({ you: { bf: ['Klauth, Unrivaled Ancient'], hand: ['Opt'] } }),
  ),
  preset(
    "Klauth: the mana can't pay for an ability",
    board({ you: { bf: ['Klauth, Unrivaled Ancient', 'Mind Stone'] } }),
  ),
  preset(
    'Klauth: the mana is gone by the next turn',
    board({ you: { bf: ['Klauth, Unrivaled Ancient'] } }),
  ),
  preset(
    'Gwenna: two mana in any combination',
    board({ you: { bf: ['Gwenna, Eyes of Gaea'] } }),
  ),
  preset(
    "Gwenna: her mana won't cast a noncreature spell",
    board({ you: { bf: ['Gwenna, Eyes of Gaea'], hand: ['Opt'] } }),
  ),
  preset(
    "Gwenna: her mana won't pay a land's ability",
    board({ you: { bf: ['Gwenna, Eyes of Gaea', 'Nykthos, Shrine to Nyx'] } }),
  ),
  preset(
    "Gwenna: her mana pays a creature's ability",
    board({ you: { bf: ['Gwenna, Eyes of Gaea', 'Deathrite Shaman'] }, opp: { gy: ['Lightning Bolt'] } }),
  ),
  preset(
    'Gwenna: a small creature spell does nothing',
    board({ you: { bf: ['Gwenna, Eyes of Gaea', 'Swamp*3'], hand: ['Gray Merchant of Asphodel'] } }),
  ),
  preset(
    'Gwenna: a power-6 creature spell grows and untaps her',
    board({ you: { bf: ['Gwenna, Eyes of Gaea', 'Forest*4'], hand: ['Alpha Tyrranax'] } }),
  ),
  preset(
    'Reflecting Pool: a tapped Forest still counts',
    board({ you: { bf: ['Reflecting Pool', { name: 'Forest', tapped: true }, 'Reliquary Tower'] }, opp: { bf: ['Mountain'] } }),
  ),
  preset(
    'Reflecting Pool: two Pools alone make nothing',
    board({ you: { bf: ['Reflecting Pool*2'] }, opp: { bf: ['Mountain'] } }),
  ),
  preset(
    'Reflecting Pool: reads through Exotic Orchard',
    board({ you: { bf: ['Reflecting Pool', 'Exotic Orchard'] }, opp: { bf: ['Swamp'] } }),
  ),
  preset(
    'Incubation Druid: all five colours from your lands',
    board({ you: { bf: ['Incubation Druid', 'Spire of Industry', 'Vivid Grove', 'Forest', 'Island'] } }),
  ),
  preset(
    'Incubation Druid: after adapt, three of one type',
    board({ you: { bf: ['Incubation Druid', 'Spire of Industry', 'Vivid Grove', 'Forest*3', 'Island*2'] } }),
  ),
  preset(
    'Incubation Druid: adapt with counters does nothing',
    board({ you: { bf: [{ name: 'Incubation Druid', counters: { '+1/+1': 3 } }, 'Forest*3', 'Island*2'] } }),
  ),
  preset(
    'Gond Gate: no Gates, no colour',
    board({ you: { bf: ['Gond Gate', 'Forest'] } }),
  ),
  preset(
    'Gond Gate: another Gate enters untapped and adds its colours',
    board({ you: { bf: ['Gond Gate', 'Forest'], hand: ['Azorius Guildgate'] } }),
  ),
  preset(
    "Cactus Preserve: as big as your commander's mana value",
    board({ you: { cmd: ['Klauth, Unrivaled Ancient'], bf: ['Cactus Preserve', 'Forest*3'] } }),
  ),
  preset(
    'Horizon of Progress: pay 1 life per tap',
    board({ you: { bf: ['Horizon of Progress', 'Forest', 'Reliquary Tower'] } }),
  ),
  preset(
    'Reflecting Pool: tapped for no mana, Wild Growth adds nothing',
    board({ you: { bf: ['Reflecting Pool', { name: 'Wild Growth', attach: 'Reflecting Pool' }, "Mirari's Wake"] } }),
  ),
  preset(
    'The Grey Havens: tapped for no mana, Fertile Ground adds nothing',
    board({ you: { bf: ['The Grey Havens', { name: 'Fertile Ground', attach: 'The Grey Havens' }, "Mirari's Wake"] } }),
  ),
  preset(
    'The Grey Havens: tapped for {C}, Fertile Ground adds a colour',
    board({ you: { bf: ['The Grey Havens', { name: 'Fertile Ground', attach: 'The Grey Havens' }] } }),
  ),
  preset(
    'Kinnan: an empty Chrome Mox gets no extra mana',
    board({ you: { bf: ['Kinnan, Bonder Prodigy', 'Chrome Mox'] } }),
  ),
  preset(
    'Mox Amber: tapped for no mana',
    board({ you: { bf: ['Mox Amber'] } }),
  ),
  preset(
    "Mana Flare: an opponent's Flare doubles your land",
    board({ you: { bf: ['Forest'] }, opp: { bf: ['Mana Flare'] } }),
  ),
  preset(
    'Mana Flare: you pick the extra for a two-mana land',
    board({ you: { bf: ['Azorius Chancery'] }, opp: { bf: ['Mana Flare'] } }),
  ),
  preset(
    'Mana Flare: one Forest casts Grizzly Bears',
    board({ you: { bf: ['Forest'], hand: ['Grizzly Bears'] }, opp: { bf: ['Mana Flare'] } }),
  ),
  preset(
    "Mana Flare: the opponent's land doubles too",
    board({ you: { bf: ['Forest'] }, opp: { human: true, bf: ['Mana Flare', 'Mountain'] }, turn: 0 }),
  ),
  preset(
    "Mana Flare: Cavern of Souls' extra mana isn't restricted",
    board({ you: { bf: ['Grizzly Bears'], hand: ['Cavern of Souls', 'Giant Growth'] }, opp: { bf: ['Mana Flare'] } }),
  ),
  preset(
    "Heartbeat of Spring: an opponent's Heartbeat doubles your land",
    board({ you: { bf: ['Forest'] }, opp: { bf: ['Heartbeat of Spring'] } }),
  ),
  preset(
    "Mana Reflection: Wild Growth's extra isn't doubled",
    board({ you: { bf: ['Mana Reflection', 'Forest', { name: 'Wild Growth', attach: 'Forest' }] } }),
  ),
  preset(
    'Mana Reflection: Birds makes two of one colour',
    board({ you: { bf: ['Mana Reflection', 'Birds of Paradise'] } }),
  ),
  preset(
    'Mana Reflection: Gilded Lotus makes six of one colour',
    board({ you: { bf: ['Mana Reflection', 'Gilded Lotus'] } }),
  ),
  preset(
    "Mana Reflection: both of Ancient Ziggurat's mana are creature-only",
    board({ you: { bf: ['Mana Reflection', 'Ancient Ziggurat'], hand: ['Opt'] } }),
  ),
  preset(
    'Mana Reflection: what one Birds can cast',
    board({ you: { bf: ['Mana Reflection', 'Birds of Paradise'], hand: ['Plated Seastrider', 'Expressive Iteration'] } }),
  ),
  preset(
    'Nyxbloom Ancient: doublers and triplers multiply',
    board({ you: { bf: ['Mana Reflection*2', 'Nyxbloom Ancient', 'Forest'] } }),
  ),
  preset(
    "Mana Reflection: an opponent's Reflection does nothing for you",
    board({ you: { bf: ['Forest'] }, opp: { bf: ['Mana Reflection'] } }),
  ),
  preset(
    'Aragorn: scry 2 keeping both asks their order',
    board({
      you: {
        bf: ['Aragorn, the Uniter', 'Island'],
        hand: ['Opt'],
        lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Llanowar Elves'],
      },
    }),
  ),
  preset(
    'Preordain: sending both to the bottom asks their order',
    board({ you: { bf: ['Island'], hand: ['Preordain'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Llanowar Elves'] } }),
  ),
  preset(
    'Preordain: the draw waits for the order',
    board({ you: { bf: ['Island'], hand: ['Preordain'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Llanowar Elves'] } }),
  ),
  preset(
    'Preordain: one card each way asks no order',
    board({ you: { bf: ['Island'], hand: ['Preordain'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Llanowar Elves'] } }),
  ),
  preset(
    'Doom Whisperer: surveil keeping two asks their order',
    board({ you: { bf: ['Doom Whisperer'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Llanowar Elves'] } }),
  ),
  preset(
    'Aragorn: two copies of one card ask no order',
    board({ you: { bf: ['Aragorn, the Uniter', 'Island'], hand: ['Opt'], lib: ['Grizzly Bears*2', 'Hill Giant'] } }),
  ),
  preset(
    'Stock Up: the rest go to the bottom in your order',
    board({
      you: {
        bf: ['Island*3'],
        hand: ['Stock Up'],
        lib: ['Island', 'Grizzly Bears', 'Craw Wurm', 'Lightning Bolt', 'Opt', 'Hill Giant'],
      },
    }),
  ),
  preset(
    'Dig Through Time: delved cards are exiled as you cast it',
    board({
      you: {
        bf: ['Island*2'],
        hand: ['Dig Through Time'],
        gy: ['Opt*3', 'Shock*3'],
        lib: ['Island', 'Grizzly Bears', 'Craw Wurm', 'Lightning Bolt', 'Opt', 'Hill Giant', 'Llanowar Elves', 'Serra Angel'],
      },
    }),
  ),
  preset(
    'Experimental Augury: proliferate comes after the order',
    board({
      you: {
        bf: ['Island*2', { name: 'Grizzly Bears', counters: { '+1/+1': 1 } }],
        hand: ['Experimental Augury'],
        lib: ['Island', 'Craw Wurm', 'Lightning Bolt', 'Hill Giant'],
      },
    }),
  ),
  preset(
    'Growing Rites: only creature cards can be taken',
    board({ you: { bf: ['Forest*3'], hand: ['Growing Rites of Itlimoc'], lib: ['Island', 'Grizzly Bears', 'Lightning Bolt', 'Craw Wurm'] } }),
  ),
  preset(
    'Growing Rites: taking nothing',
    board({ you: { bf: ['Forest*3'], hand: ['Growing Rites of Itlimoc'], lib: ['Island', 'Grizzly Bears', 'Lightning Bolt', 'Craw Wurm'] } }),
  ),
  preset(
    'Growing Rites: leftovers that are all one card ask no order',
    board({ you: { bf: ['Forest*3'], hand: ['Growing Rites of Itlimoc'], lib: ['Grizzly Bears', 'Opt*3'] } }),
  ),
  preset(
    'Growing Rites: transforms with four creatures',
    board({ you: { bf: ['Growing Rites of Itlimoc', 'Grizzly Bears', 'Llanowar Elves', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Growing Rites: no trigger with three creatures',
    board({ you: { bf: ['Growing Rites of Itlimoc', 'Grizzly Bears', 'Llanowar Elves', 'Hill Giant'] } }),
  ),
  preset(
    'Growing Rites: losing a creature before it resolves',
    board({
      you: { bf: ['Growing Rites of Itlimoc', 'Grizzly Bears', 'Llanowar Elves', 'Hill Giant', 'Craw Wurm', 'Mountain'], hand: ['Shock'] },
    }),
  ),
  preset(
    'Itlimoc: {G} for each creature you control',
    board({ you: { bf: ['Growing Rites of Itlimoc', 'Grizzly Bears', 'Llanowar Elves', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Halimar Depths: put the top three back in your order',
    board({ you: { hand: ['Halimar Depths'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    "Sensei's Divining Top: {1} orders the top three",
    board({ you: { bf: ["Sensei's Divining Top", 'Island'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    "Sensei's Divining Top: {T} draws, then Top goes on top",
    board({ you: { bf: ["Sensei's Divining Top"], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Valakut Awakening: two cards to the bottom, draw three',
    board({ you: { bf: ['Mountain*3'], hand: ['Valakut Awakening', 'Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Valakut Awakening: none to the bottom, draw one',
    board({ you: { bf: ['Mountain*3'], hand: ['Valakut Awakening', 'Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Valakut Stoneforge: the land face',
    board({ you: { hand: ['Valakut Awakening'] } }),
  ),
  preset(
    "Teferi's Puzzle Box: the hand goes to the bottom, then redraw",
    board({ you: { bf: ["Teferi's Puzzle Box"], hand: ['Grizzly Bears', 'Lightning Bolt'] }, turn: 0, step: 'end' }),
  ),
  preset(
    "Teferi's Puzzle Box: an opponent's hand stays hidden",
    board({ you: { bf: ["Teferi's Puzzle Box"] }, opp: { hand: ['Grizzly Bears', 'Lightning Bolt'] }, step: 'end' }),
  ),
  preset(
    "Teferi's Puzzle Box: two Boxes trigger separately",
    board({ you: { bf: ["Teferi's Puzzle Box*2"], hand: ['Grizzly Bears', 'Lightning Bolt'] }, turn: 0, step: 'end' }),
  ),
  preset(
    'Valakut Awakening: your commander can go to the command zone',
    board({ you: { bf: ['Mountain*3'], hand: [{ name: 'Krenko, Mob Boss', commander: true }, 'Hill Giant', 'Valakut Awakening'] } }),
  ),
  preset(
    'Valakut Awakening: your commander can go into the library',
    board({ you: { bf: ['Mountain*3'], hand: [{ name: 'Krenko, Mob Boss', commander: true }, 'Hill Giant', 'Valakut Awakening'] } }),
  ),
  preset(
    'Brainstorm: your commander put back on top',
    board({ you: { bf: ['Island'], hand: [{ name: 'Krenko, Mob Boss', commander: true }, 'Hill Giant', 'Brainstorm'] } }),
  ),
  preset(
    'Brainstorm: your commander to the command zone instead',
    board({ you: { bf: ['Island'], hand: [{ name: 'Krenko, Mob Boss', commander: true }, 'Hill Giant', 'Brainstorm'] } }),
  ),
  preset(
    "Teferi's Puzzle Box: an opponent's commander",
    board({
      you: { bf: ["Teferi's Puzzle Box"] },
      opp: { human: true, hand: [{ name: 'Teysa Karlov', commander: true }, 'Hill Giant'] },
      step: 'end',
    }),
  ),
  preset(
    'Moorland Haunt: exiling a creature card as a cost',
    board({ you: { bf: ['Moorland Haunt', 'Plains', 'Island'], gy: ['Wastes', 'Grizzly Bears', 'Hill Giant', 'Opt'] } }),
  ),
  preset(
    'Moorland Haunt: one creature card is exiled without asking',
    board({ you: { bf: ['Moorland Haunt', 'Plains', 'Island'], gy: ['Wastes', 'Grizzly Bears', 'Opt'] } }),
  ),
  preset(
    'Moorland Haunt: no creature card, no ability',
    board({ you: { bf: ['Moorland Haunt', 'Plains', 'Island'], gy: ['Wastes', 'Opt'] } }),
  ),
  preset(
    'Mines of Moria: three cards for two Treasures',
    board({ you: { bf: ['Mines of Moria', 'Mountain*4'], gy: ['Grizzly Bears', 'Hill Giant', 'Opt', 'Shock'] } }),
  ),
  preset(
    'Varina: two cards for a Zombie',
    board({ you: { bf: ['Varina, Lich Queen', 'Forest*2'], gy: ['Opt', 'Shock', 'Wastes'] } }),
  ),
  preset(
    'Psychic Frog: three cards for flying',
    board({ you: { bf: ['Psychic Frog'], gy: ['Opt', 'Shock', 'Wastes', 'Grizzly Bears'] } }),
  ),
  preset(
    'Drivnod: three creature cards for an indestructible counter',
    board({
      you: {
        bf: ['Drivnod, Carnage Dominus', 'Swamp*2'],
        gy: ['Wastes', 'Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Llanowar Elves', 'Opt'],
      },
    }),
  ),
  preset(
    'Mines of Moria: enters tapped without a legendary creature',
    board({ you: { bf: ['Grizzly Bears'], hand: ['Mines of Moria'] } }),
  ),
  preset(
    'Mines of Moria: enters untapped with a legendary creature',
    board({ you: { bf: ['Varina, Lich Queen'], hand: ['Mines of Moria'] } }),
  ),
  preset(
    'Mines of Moria: a second copy and the legend rule',
    board({ you: { bf: ['Mines of Moria', 'Varina, Lich Queen'], hand: ['Mines of Moria'] } }),
  ),
  preset(
    'Key to the City: up to one target',
    board({ you: { bf: ['Key to the City', 'Grizzly Bears'], hand: ['Opt'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  preset(
    'Key to the City and Pilferer: untap triggers wait for the upkeep',
    board({
      you: { bf: [{ name: 'Key to the City', tapped: true }, { name: 'Ghostly Pilferer', tapped: true }, 'Island*4'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Key to the City: no Yes without {2}',
    board({ you: { bf: [{ name: 'Key to the City', tapped: true }] }, turn: 0, step: 'end' }),
  ),
  preset(
    'Key to the City: untapped by an effect',
    board({ you: { bf: ['Key to the City', 'Voltaic Key', 'Island*3'], hand: ['Opt'] } }),
  ),
  preset(
    'Ghostly Pilferer: discard to be unblockable',
    board({ you: { bf: ['Ghostly Pilferer'], hand: ['Opt'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  preset(
    "Sensei's Divining Top: {T} in response to {1}",
    board({ you: { bf: ["Sensei's Divining Top", 'Island'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    "Sensei's Divining Top: bounced in response, stays in hand",
    board({ you: { bf: ["Sensei's Divining Top", 'Island'], hand: ['Unsummon'], lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'] } }),
  ),
  preset(
    'Psychic Frog: you keep priority after the discard',
    board({ you: { bf: ['Psychic Frog'], hand: ['Opt', 'Shock', 'Forest'] }, turn: 0, step: 'upkeep' }),
  ),
  preset(
    'Moorland Haunt: you keep priority after choosing the card',
    board({ you: { bf: ['Moorland Haunt', 'Plains', 'Island'], gy: ['Grizzly Bears', 'Hill Giant'] }, turn: 0, step: 'upkeep' }),
  ),
  preset(
    'Thrill of Possibility: you keep priority after the discard',
    board({ you: { bf: ['Mountain*2'], hand: ['Thrill of Possibility', 'Opt', 'Shock'] }, turn: 0, step: 'upkeep' }),
  ),
  preset(
    'Mesmeric Orb: the opponent mills in the upkeep, one per token',
    board({
      you: { bf: ['Mesmeric Orb'] },
      opp: { bf: [{ name: 'Forest', n: 3, tapped: true }, { name: 'Soldier Token', n: 5, tapped: true }] },
      step: 'end',
    }),
  ),
  preset(
    'Mesmeric Orb: a land entering untapped mills nothing',
    board({ you: { bf: ['Mesmeric Orb'], hand: ['Steam Vents'] } }),
  ),
  preset(
    'Mesmeric Orb: one token untapped mills one',
    board({ you: { bf: ['Mesmeric Orb', 'Island', { name: 'Soldier Token', n: 5, tapped: true }], hand: ['Twiddle'] } }),
  ),
  preset(
    'Mesmeric Orb: the controller mills, not the owner',
    board({
      you: { bf: ['Mesmeric Orb', 'Mountain*3', 'Island'], hand: ['Act of Treason', 'Unsummon'] },
      opp: { bf: [{ name: 'Grizzly Bears', tapped: true }] },
    }),
  ),
  preset(
    'Aragorn: a red spell deals 3 to the opponent you choose',
    board({ you: { bf: ['Aragorn, the Uniter', 'Mountain'], hand: ['Lightning Bolt'] }, opp: [{}, {}] }),
  ),
  preset(
    "Aragorn: a green spell's +4/+4",
    board({ you: { bf: ['Aragorn, the Uniter', 'Grizzly Bears', 'Forest'], hand: ['Giant Growth'] } }),
  ),
  preset(
    'Aragorn: a red and white spell triggers twice',
    board({ you: { bf: ['Aragorn, the Uniter', 'Mountain', 'Plains'], hand: ['Boros Charm'] } }),
  ),
  preset(
    'Varina: one trigger for all attacking Zombies',
    board({ you: { bf: ['Varina, Lich Queen', 'Cemetery Reaper', 'Grizzly Bears'], hand: ['Forest'] } }),
  ),
  preset(
    'Varina: a Zombie that leaves still counts',
    board({ you: { bf: ['Varina, Lich Queen', 'Cemetery Reaper', 'Mountain'], hand: ['Shock'] } }),
  ),
  preset(
    'Drivnod: death triggers happen twice',
    board({ you: { bf: ['Drivnod, Carnage Dominus', 'Zulaport Cutthroat', 'Blood Artist', 'Viscera Seer', 'Grizzly Bears'] } }),
  ),
  preset(
    'Drivnod: sacrifice triggers happen once',
    board({ you: { bf: ['Drivnod, Carnage Dominus', 'Lightless Evangel', 'Viscera Seer', 'Grizzly Bears'] } }),
  ),
  preset(
    'Nezahal and Pilferer: a spell cast from hand',
    board({
      you: { bf: ['Nezahal, Primal Tide', 'Ghostly Pilferer'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Nezahal and Pilferer: a spell cast by flashback',
    board({
      you: { bf: ['Nezahal, Primal Tide', 'Ghostly Pilferer'] },
      opp: { human: true, bf: ['Mountain*3'], gy: ['Faithless Looting'] },
      turn: 0,
    }),
  ),
  preset(
    'Nezahal and Pilferer: a commander cast from the command zone',
    board({
      you: { bf: ['Nezahal, Primal Tide', 'Ghostly Pilferer'] },
      opp: { human: true, cmd: ['Teysa Karlov'], bf: ['Plains*2', 'Swamp*2'] },
      turn: 0,
    }),
  ),
  preset(
    'Nezahal: the blink returns tapped, without counters',
    board({ you: { bf: [{ name: 'Nezahal, Primal Tide', counters: { '+1/+1': 1 } }], hand: ['Opt', 'Shock', 'Forest', 'Island'] } }),
  ),
  preset(
    'Nezahal: activated in an end step, back next end step',
    board({ you: { bf: ['Nezahal, Primal Tide'], hand: ['Opt', 'Shock', 'Forest'] }, step: 'end' }),
  ),
  // --- Infect, wither, spree and gift (2026-10-03, third round) --------
  preset(
    'Three Steps Ahead: the counter mode is greyed out with no spell',
    board({
      you: {
        bf: ['Island*3', 'Swamp*3', { name: 'Grizzly Bears', tapped: true, counters: { '+1/+1': 1 } }],
        hand: ['Three Steps Ahead', 'Opt'],
      },
    }),
  ),
  preset(
    'Three Steps Ahead: two modes picked grey out the third',
    board({
      you: { bf: ['Island*3', 'Swamp*3', 'Mountain'], hand: ['Three Steps Ahead', 'Shock', 'Opt'] },
    }),
  ),
  preset(
    'Three Steps Ahead: counter and draw resolve in printed order',
    board({
      you: { bf: ['Island*3', 'Swamp*3', 'Mountain'], hand: ['Three Steps Ahead', 'Shock', 'Opt'] },
    }),
  ),
  preset(
    'Three Steps Ahead: the copy is untapped with no counter',
    board({
      you: {
        bf: ['Island*2', 'Swamp*2', { name: 'Grizzly Bears', tapped: true, counters: { '+1/+1': 1 } }],
        hand: ['Three Steps Ahead'],
      },
    }),
  ),
  preset(
    "Three Steps Ahead: one Island can't pay the counter mode",
    board({
      you: { bf: ['Island', 'Swamp*5', 'Mountain'], hand: ['Three Steps Ahead', 'Shock'] },
    }),
  ),
  preset(
    'Insatiable Avarice: the search must find a card',
    board({
      you: {
        bf: ['Swamp*3'],
        hand: ['Insatiable Avarice'],
        lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Serra Angel', 'Shivan Dragon', 'Lightning Bolt', 'Opt', 'Divination', 'Sol Ring', 'Llanowar Elves'],
      },
    }),
  ),
  preset(
    'Insatiable Avarice: the found card is among the three drawn',
    board({
      you: {
        life: 20,
        bf: ['Swamp*5'],
        hand: ['Insatiable Avarice'],
        lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Serra Angel', 'Shivan Dragon', 'Lightning Bolt', 'Opt', 'Divination', 'Sol Ring', 'Llanowar Elves'],
      },
    }),
  ),
  preset(
    "Insatiable Avarice: the opponent doesn't see the found card",
    board({
      you: {
        bf: ['Swamp*3'],
        hand: ['Insatiable Avarice'],
        lib: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm', 'Serra Angel', 'Shivan Dragon', 'Lightning Bolt', 'Opt', 'Divination', 'Sol Ring', 'Llanowar Elves'],
      },
      opp: { human: true },
    }),
  ),
  preset(
    'Insatiable Avarice: the draw mode on the opponent',
    board({
      you: { bf: ['Swamp*3'], hand: ['Insatiable Avarice'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    "Smuggler's Surprise: the mill pick offers only creatures and lands",
    board({
      you: {
        bf: ['Forest*3'],
        hand: ["Smuggler's Surprise"],
        gy: ['Hill Giant'],
        lib: ['Craw Wurm', 'Forest', 'Sol Ring', 'Grizzly Bears'],
      },
    }),
  ),
  preset(
    "Smuggler's Surprise: a milled creature can go onto the battlefield",
    board({
      you: {
        bf: ['Forest*5', 'Island*3'],
        hand: ["Smuggler's Surprise", 'Serra Angel'],
        lib: ['Craw Wurm', 'Forest', 'Sol Ring', 'Grizzly Bears'],
      },
    }),
  ),
  preset(
    "Smuggler's Surprise: only the big creatures get protection",
    board({
      you: {
        bf: ['Forest*5', 'Island*4', 'Grizzly Bears'],
        hand: ["Smuggler's Surprise", 'Serra Angel'],
        lib: ['Craw Wurm', 'Forest', 'Sol Ring', 'Grizzly Bears'],
      },
    }),
  ),
  preset(
    'Requisition Raid: all three modes, targeting yourself',
    board({
      you: { bf: ['Plains*4', 'Grizzly Bears', 'Hill Giant'], hand: ['Requisition Raid'] },
      opp: [{ bf: ['Sol Ring', 'Craw Wurm'] }, { bf: [{ name: 'Pacifism', attach: 'Hill Giant' }, 'Llanowar Elves', 'Serra Angel'] }],
    }),
  ),
  preset(
    "Requisition Raid: counters go on the targeted player's creatures",
    board({
      you: { bf: ['Plains*2', 'Grizzly Bears'], hand: ['Requisition Raid'] },
      opp: [{ bf: ['Craw Wurm'] }, { bf: ['Llanowar Elves', 'Serra Angel'] }],
    }),
  ),
  preset(
    "Dawn's Truce: two cast buttons, the gift costs nothing",
    board({
      you: { bf: ['Plains*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce"] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    "Dawn's Truce: the gift question",
    board({
      you: { bf: ['Plains*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce"] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    "Dawn's Truce: promised, the gift comes first, then indestructible",
    board({
      you: { bf: ['Plains*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce"] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    "Dawn's Truce: promising the gift by clicking a player panel",
    board({
      you: { bf: ['Plains*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce"] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    "Dawn's Truce: a countered spell gives no gift",
    board({
      you: { bf: ['Plains*2', 'Island*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce", 'Counterspell'] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    "Dawn's Truce: unpromised, hexproof only",
    board({
      you: { bf: ['Plains*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce"] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    "Dawn's Truce: no gift question in a 2-player game",
    board({ you: { bf: ['Plains*2', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce"] } }),
  ),
  preset(
    "Dawn's Truce: a player who has lost isn't offered",
    board({
      you: { bf: ['Plains*2', 'Mountain', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce", 'Lightning Bolt'] },
      opp: [{}, { life: 3 }, {}],
    }),
  ),
  preset(
    "Dawn's Truce: a promised player who leaves gets nothing",
    board({
      you: { bf: ['Plains*2', 'Mountain', 'Grizzly Bears', 'Sol Ring'], hand: ["Dawn's Truce", 'Lightning Bolt'] },
      opp: [{}, { life: 3 }, {}],
    }),
  ),
  preset(
    'Into the Flood Maw: only the gift cast with no opposing creature',
    board({
      you: { bf: ['Island'], hand: ['Into the Flood Maw'] },
      opp: { bf: ['Sol Ring', 'Rhystic Study', 'Island'] },
    }),
  ),
  preset(
    'Into the Flood Maw: promised, it bounces a nonland permanent',
    board({
      you: { bf: ['Island'], hand: ['Into the Flood Maw'] },
      opp: { bf: ['Sol Ring', 'Rhystic Study', 'Island'] },
    }),
  ),
  preset(
    "Long River's Pull: only the gift cast counters a noncreature spell",
    board({
      you: { bf: ['Island*3'], hand: ["Long River's Pull", 'Opt'] },
    }),
  ),
  preset(
    'Wear Down: no gift cast with only one target',
    board({
      you: { bf: ['Forest*2'], hand: ['Wear Down'] },
      opp: { bf: ['Sol Ring'] },
    }),
  ),
  preset(
    'Wear Down: promised, it destroys two at once',
    board({
      you: { bf: ['Forest*2'], hand: ['Wear Down'] },
      opp: { bf: ['Sol Ring', 'Rhystic Study'] },
    }),
  ),
  preset(
    'Peerless Recycling: only permanent cards are targets',
    board({
      you: { bf: ['Forest*2'], hand: ['Peerless Recycling'], gy: ['Grizzly Bears', 'Sol Ring', 'Lightning Bolt'] },
    }),
  ),
  preset(
    "Sazacap's Brew: unpromised, it targets only a player",
    board({
      you: { bf: ['Mountain*2'], hand: ["Sazacap's Brew", 'Opt'] },
    }),
  ),
  preset(
    "Sazacap's Brew: promised, it also pumps your creature",
    board({
      you: { bf: ['Mountain*2', 'Grizzly Bears'], hand: ["Sazacap's Brew", 'Opt'] },
    }),
  ),
  preset(
    "Sazacap's Brew: not castable as your only card",
    board({
      you: { bf: ['Mountain*2'], hand: ["Sazacap's Brew"] },
    }),
  ),
  preset(
    'Octomancer: the gift Octopus is copied at your end step',
    board({
      you: { bf: ['Forest*3', 'Island*2'], hand: ['Octomancer'] },
    }),
  ),
  preset(
    "Octomancer: it triggers at the opponent's end step too",
    board({
      you: { bf: ['Octomancer'] },
      opp: { human: true, bf: ['Plains*2'], hand: ['Raise the Alarm'] },
      turn: 0,
    }),
  ),
  preset(
    'Octomancer: no new token, no copy',
    board({
      you: { bf: ['Octomancer'] },
    }),
  ),
  preset(
    'Final Showdown: indestructible outlasts losing all abilities',
    board({
      you: { bf: ['Plains*8', 'Grizzly Bears', 'Doomed Traveler'], hand: ['Final Showdown'] },
      opp: { bf: ['Darksteel Myr', 'Doomed Traveler'] },
    }),
  ),
  preset(
    'Final Showdown: abilities come back next turn',
    board({
      you: { bf: ['Plains*2'], hand: ['Final Showdown'] },
      opp: { bf: ['Darksteel Myr'] },
    }),
  ),
  preset(
    'Parting Gust: unpromised, the creature returns at the end step',
    board({
      you: { bf: ['Plains*2', { name: 'Pacifism', attach: 'Serra Angel' }], hand: ['Parting Gust'] },
      opp: { bf: ['Serra Angel', 'Hill Giant', 'Soldier Token'] },
    }),
  ),
  preset(
    'Parting Gust: your own creature returns and triggers again',
    board({
      you: { bf: ['Plains*2', 'Wall of Omens'], hand: ['Parting Gust'] },
    }),
  ),
  preset(
    'Parting Gust: promised, the exile is for good',
    board({
      you: { bf: ['Plains*2'], hand: ['Parting Gust'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Starfall Invocation: only a creature it killed comes back',
    board({
      you: {
        bf: ['Plains*5', 'Hill Giant', 'Wall of Omens', 'Soldier Token'],
        hand: ['Starfall Invocation'],
        gy: ['Serra Angel'],
      },
      opp: { bf: ['Grizzly Bears', 'Doomed Traveler'] },
    }),
  ),
  preset(
    'Coiling Rebirth: promised, the creature returns with a 1/1 copy',
    board({
      you: { bf: ['Swamp*5'], hand: ['Coiling Rebirth'], gy: ['Wall of Omens'] },
    }),
  ),
  preset(
    'Coiling Rebirth: a legendary creature gets no token',
    board({
      you: { bf: ['Swamp*5'], hand: ['Coiling Rebirth'], gy: ['Skithiryx, the Blight Dragon'] },
    }),
  ),
  preset(
    'Coiling Rebirth: unpromised, it only returns the creature',
    board({
      you: { bf: ['Swamp*5'], hand: ['Coiling Rebirth'], gy: ['Hill Giant'] },
    }),
  ),
  preset(
    'Scrapshooter: promised, two enters triggers you order',
    board({
      you: { bf: ['Forest*3'], hand: ['Scrapshooter'] },
      opp: { bf: ['Sol Ring', 'Rhystic Study', 'Plains'] },
    }),
  ),
  preset(
    "Scrapshooter: the gift is given even if it's exiled",
    board({
      you: { bf: ['Forest*3', 'Plains'], hand: ['Scrapshooter', 'Swords to Plowshares'] },
      opp: { bf: ['Sol Ring', 'Rhystic Study'] },
    }),
  ),
  preset(
    'Scrapshooter: promised with nothing to destroy',
    board({
      you: { bf: ['Forest*3'], hand: ['Scrapshooter'] },
      opp: { bf: ['Plains'] },
    }),
  ),
  preset(
    'Scrapshooter: unpromised, no triggers',
    board({
      you: { bf: ['Forest*3'], hand: ['Scrapshooter'] },
      opp: { bf: ['Sol Ring', 'Rhystic Study'] },
    }),
  ),
  preset(
    'Inkmoth Nexus: animated, a 1/1 flying infect creature land',
    board({
      you: { bf: ['Inkmoth Nexus', 'Island'] },
    }),
  ),
  preset(
    "Inkmoth Nexus: played this turn, it can't attack or tap",
    board({
      you: { bf: ['Island'], hand: ['Inkmoth Nexus'] },
    }),
  ),
  preset(
    'Blighted Agent: combat damage to a player is poison',
    board({
      you: { bf: ['Blighted Agent'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Plague Myr: infect damage to a planeswalker removes loyalty',
    board({
      you: { bf: ['Plague Myr'] },
      opp: { bf: [{ name: 'Ajani, Caller of the Pride', counters: { loyalty: 4 } }] },
    }),
  ),
  preset(
    'Ichorclaw Myr: two blockers, one trigger, -1/-1 counters',
    board({
      you: { bf: ['Ichorclaw Myr'] },
      opp: { human: true, life: 20, bf: ['Wall of Wood', { name: 'Hill Giant', counters: { '+1/+1': 1 } }] },
    }),
  ),
  preset(
    'Phyresis: an infect ping kills through deathtouch',
    board({
      you: {
        bf: [
          'Prodigal Pyromancer',
          { name: 'Phyresis', attach: 'Prodigal Pyromancer' },
          { name: 'Basilisk Collar', attach: 'Prodigal Pyromancer' },
        ],
      },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Phyresis: an infect ping on a player is poison, with lifelink',
    board({
      you: {
        life: 20,
        bf: [
          'Prodigal Pyromancer',
          { name: 'Phyresis', attach: 'Prodigal Pyromancer' },
          { name: 'Basilisk Collar', attach: 'Prodigal Pyromancer' },
        ],
      },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Fling: an infect creature flung deals ordinary damage',
    board({
      you: { bf: ['Grizzly Bears', { name: 'Phyresis', attach: 'Grizzly Bears' }, 'Mountain*2'], hand: ['Fling'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Tainted Strike: the Bears deal poison in combat',
    board({
      you: { bf: ['Grizzly Bears', 'Swamp'], hand: ['Tainted Strike'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Triumph of the Hordes: only your creatures get infect',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4'], hand: ['Triumph of the Hordes'] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    'Triumph of the Hordes: ten poison loses the game',
    board({
      you: { bf: ['Grizzly Bears*2', 'Forest*4'], hand: ['Triumph of the Hordes'] },
      opp: { poison: 6 },
    }),
  ),
  preset(
    'Skithiryx: infect damage still counts as commander damage',
    board({
      you: { cmd: ['Skithiryx, the Blight Dragon'], bf: ['Swamp*6'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Skithiryx: an infect blocker dies and it regenerates',
    board({
      you: { bf: ['Skithiryx, the Blight Dragon', 'Swamp*2'] },
      opp: { human: true, bf: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Massacre Girl: a pinged Elves draws, makes a Snake, returns',
    board({
      you: { bf: ['Massacre Girl, Known Killer', 'Necroskitter', 'Hapatra, Vizier of Poisons', 'Prodigal Pyromancer'] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Massacre Girl: wither doesn't touch players",
    board({
      you: { bf: ['Massacre Girl, Known Killer', 'Prodigal Pyromancer'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Massacre Girl: wither in combat',
    board({
      you: { bf: ['Massacre Girl, Known Killer', 'Grizzly Bears'] },
      opp: { human: true, bf: ['Hill Giant'] },
    }),
  ),
  preset(
    "Necroskitter: a dead token doesn't come back",
    board({
      you: { bf: ['Massacre Girl, Known Killer', 'Necroskitter', 'Prodigal Pyromancer'] },
      opp: { bf: ['Soldier Token'] },
    }),
  ),
  preset(
    'Massacre Girl: a creature with no counters gives nothing',
    board({
      you: { bf: ['Massacre Girl, Known Killer', 'Necroskitter', 'Swamp*2'], hand: ['Doom Blade'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Midnight Banshee: upkeep counters skip black creatures',
    board({
      you: { bf: ['Midnight Banshee', 'Massacre Girl, Known Killer', 'Necroskitter', 'Grizzly Bears'] },
      opp: { bf: ['Hill Giant'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Phyrexian Swarmlord: an Insect per opponent poison counter',
    board({
      you: { poison: 2, bf: ['Phyrexian Swarmlord'] },
      opp: [{ poison: 3 }, { poison: 2 }, {}],
      turn: 2,
      step: 'end',
    }),
  ),
  preset(
    'Phyrexian Swarmlord: each Insect attacks on its own',
    board({
      you: { poison: 2, bf: ['Phyrexian Swarmlord'] },
      opp: [{ poison: 3 }, { poison: 2 }, {}],
      turn: 2,
      step: 'end',
    }),
  ),
  preset(
    'Ichor Rats: both players at ten poison is a draw',
    board({ you: { poison: 9, bf: ['Swamp*3'], hand: ['Ichor Rats'] }, opp: { poison: 9 } }),
  ),
  preset(
    "Strionic Resonator: an activated ability can't be copied",
    board({
      you: { bf: ['Strionic Resonator', 'Prodigal Sorcerer', 'Island*2'] },
    }),
  ),
  preset(
    'Strionic Resonator: copying a trigger with no targets',
    board({
      you: { bf: ['Strionic Resonator', 'Forest*2', 'Island*2'], hand: ['Elvish Visionary'] },
    }),
  ),
  preset(
    'Strionic Resonator: a copied Banishing Light trigger stays linked',
    board({
      you: { bf: ['Strionic Resonator', 'Plains*3', 'Forest*4'], hand: ['Banishing Light', 'Naturalize'] },
      opp: { bf: ['Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Strionic Resonator: a Saga chapter can be copied',
    board({
      you: { bf: ['Strionic Resonator', 'Plains*5'], hand: ['History of Benalia'] },
    }),
  ),
  preset(
    "Strionic Resonator: an opponent's trigger isn't offered",
    board({
      you: { bf: ['Strionic Resonator', 'Plains*2'] },
      opp: { human: true, bf: ['Forest*2'], hand: ['Elvish Visionary'] },
      turn: 0,
    }),
  ),
  preset(
    "Strionic Resonator: the copy asks Flameshadow's payment again",
    board({
      you: { bf: ['Strionic Resonator', 'Flameshadow Conjuring', 'Forest*2', 'Plains*2', 'Mountain*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    "Peter Parker's Camera: enters with three film counters",
    board({
      you: { bf: ['Island'], hand: ["Peter Parker's Camera"] },
    }),
  ),
  preset(
    "Peter Parker's Camera: copying a ping the turn it arrives",
    board({
      you: { bf: ['Prodigal Sorcerer', 'Island*3'], hand: ["Peter Parker's Camera"] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Peter Parker's Camera: a copy is never offered itself",
    board({
      you: {
        bf: [{ name: "Peter Parker's Camera", counters: { film: 2 } }, 'Lithoform Engine', 'Island*3', 'Forest*3'],
        hand: ['Elvish Visionary'],
      },
    }),
  ),
  preset(
    "Peter Parker's Camera: no film counters, no activation",
    board({
      you: { bf: [{ name: "Peter Parker's Camera", counters: { film: 0 } }, 'Prodigal Sorcerer', 'Island*2'] },
    }),
  ),
  preset(
    "Battlemage's Bracers: haste lets a new Sorcerer tap",
    board({
      you: { bf: ["Battlemage's Bracers", 'Island*3', 'Mountain*2'], hand: ['Prodigal Sorcerer'] },
    }),
  ),
  preset(
    "Battlemage's Bracers: pay {1} to copy the ability",
    board({
      you: { bf: ['Prodigal Sorcerer', { name: "Battlemage's Bracers", attach: 'Prodigal Sorcerer' }, 'Mountain*2'] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Battlemage's Bracers: declining copies nothing",
    board({
      you: { bf: ['Prodigal Sorcerer', { name: "Battlemage's Bracers", attach: 'Prodigal Sorcerer' }, 'Mountain*2'] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Battlemage's Bracers: no copy offer without mana",
    board({
      you: { bf: ['Prodigal Sorcerer', { name: "Battlemage's Bracers", attach: 'Prodigal Sorcerer' }] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    "Battlemage's Bracers: equip and mana abilities don't trigger it",
    board({
      you: { bf: ["Battlemage's Bracers", 'Llanowar Elves', 'Mountain*2'] },
    }),
  ),
  preset(
    'Increasing Vengeance: one copy from your hand',
    board({
      you: { bf: ['Mountain*3'], hand: ['Lightning Bolt', 'Increasing Vengeance'] },
      opp: { bf: ['Llanowar Elves'] },
    }),
  ),
  preset(
    'Increasing Vengeance: two copies when flashed back',
    board({
      you: { bf: ['Mountain*6'], hand: ['Lightning Bolt'], gy: ['Increasing Vengeance'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    "Frolicking Familiar: Essence Scatter can't counter the Adventure",
    board({
      you: { bf: ['Mountain', 'Island*2'], hand: ['Frolicking Familiar', 'Essence Scatter'] },
    }),
  ),
  preset(
    'Frolicking Familiar: copying Blow Off Steam',
    board({
      you: { bf: ['Mountain*3'], hand: ['Frolicking Familiar', 'Reverberate'] },
    }),
  ),
  preset(
    "Increasing Vengeance: a creature spell isn't a target",
    board({
      you: { bf: ['Forest*2', 'Mountain*2'], hand: ['Grizzly Bears', 'Increasing Vengeance'] },
    }),
  ),
  preset(
    "Increasing Vengeance: an opponent's spell isn't a target",
    board({
      you: { bf: ['Mountain*2'], hand: ['Increasing Vengeance'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lightning Bolt'] },
      turn: 0,
    }),
  ),
  preset(
    'Reverberate: copying a flashed-back Vengeance makes one copy',
    board({
      you: { bf: ['Mountain*8'], hand: ['Lightning Bolt', 'Reverberate'], gy: ['Increasing Vengeance'] },
    }),
  ),
  preset(
    "Fling: a copy uses the sacrificed creature's power",
    board({
      you: { bf: ['Mountain*4', 'Grizzly Bears'], hand: ['Fling', 'Reverberate'] },
    }),
  ),
  preset(
    'Ixhel: only an opponent with three poison exiles a card',
    board({
      you: { poison: 5, bf: ['Ixhel, Scion of Atraxa'] },
      opp: [
        { poison: 3, lib: ['Lightning Bolt'] },
        { poison: 2, lib: ['Grizzly Bears'] },
      ],
    }),
  ),
  preset(
    'Ixhel: the exiled card is face down to its owner',
    board({
      you: { bf: ['Ixhel, Scion of Atraxa'] },
      opp: { human: true, poison: 3, lib: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Ixhel: cast the exiled card with any colour of mana',
    board({
      you: { bf: ['Ixhel, Scion of Atraxa', 'Plains'] },
      opp: { poison: 3, lib: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Ixhel: toxic in combat, then both opponents exile',
    board({
      you: { bf: ['Ixhel, Scion of Atraxa'] },
      opp: [
        { poison: 3, lib: ['Mountain'] },
        { poison: 2, lib: ['Grizzly Bears'] },
      ],
    }),
  ),
  preset(
    'Ixhel: the cards stay playable after Ixhel leaves',
    board({
      you: { bf: ['Ixhel, Scion of Atraxa', 'Plains*3'], hand: ['Swords to Plowshares'] },
      opp: [
        { poison: 3, lib: ['Mountain'] },
        { poison: 3, lib: ['Grizzly Bears'] },
      ],
    }),
  ),
  preset(
    'Ixhel: an exiled creature card keeps its timing',
    board({
      you: { bf: ['Ixhel, Scion of Atraxa', 'Plains*2'] },
      opp: { poison: 3, lib: ['Grizzly Bears'] },
    }),
  ),
  preset(
    "Ixhel: an owner can't cast their own exiled card",
    board({
      you: { bf: ['Ixhel, Scion of Atraxa'] },
      opp: { human: true, poison: 3, bf: ['Mountain'], lib: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Notion Thief: an upkeep draw goes to you',
    board({
      you: { bf: ['Notion Thief'] },
      opp: { bf: ['Phyrexian Arena'] },
      step: 'end',
    }),
  ),
  preset(
    'Notion Thief: the opponent keeps their first draw-step card',
    board({
      you: { bf: ['Notion Thief'] },
      opp: { bf: ['Howling Mine'] },
      step: 'end',
    }),
  ),
  preset(
    'Notion Thief: Faithless Looting draws for you, Bob discards',
    board({
      you: { bf: ['Notion Thief'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Faithless Looting', 'Opt', 'Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Notion Thief: one Thief each, the drawer keeps the cards',
    board({
      you: { bf: ['Notion Thief'] },
      opp: { human: true, bf: ['Notion Thief', 'Island*3'], hand: ['Divination'] },
      turn: 0,
    }),
  ),
  preset(
    "Notion Thief: your two Thieves beat Bob's one",
    board({
      you: { bf: ['Notion Thief*2'] },
      opp: { human: true, bf: ['Notion Thief', 'Island*3'], hand: ['Divination'] },
      turn: 0,
    }),
  ),
  preset(
    "Notion Thief: Wheel of Fortune's draws all go to you",
    board({
      you: { bf: ['Notion Thief'] },
      opp: { human: true, bf: ['Mountain*3'], hand: ['Wheel of Fortune'] },
      turn: 0,
    }),
  ),
  preset(
    "Notion Thief: your own draws aren't touched",
    board({
      you: { bf: ['Notion Thief'] },
      opp: { bf: ['Howling Mine'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Molten Echoes: the type prompt offers real types only',
    board({
      you: { bf: ['Mountain*4'], hand: ['Molten Echoes'] },
    }),
  ),
  preset(
    'Molten Echoes: an Elf is copied by both enchantments',
    board({
      you: { bf: ['Flameshadow Conjuring', 'Mountain*6', 'Forest*2'], hand: ['Molten Echoes', 'Elvish Visionary'] },
    }),
  ),
  preset(
    'Flameshadow Conjuring: a non-Elf triggers only Flameshadow',
    board({
      you: { bf: ['Flameshadow Conjuring', 'Mountain*6', 'Forest*2'], hand: ['Molten Echoes', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Flameshadow Conjuring: no red, no payment offered',
    board({
      you: { bf: ['Flameshadow Conjuring', 'Mountain*4', 'Forest'], hand: ['Molten Echoes', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Molten Echoes: the token attacks and is exiled at end step',
    board({
      you: { bf: ['Mountain*4', 'Forest*2'], hand: ['Molten Echoes', 'Elvish Visionary'] },
    }),
  ),
  preset(
    'Flameshadow Conjuring: a token made in an end step lasts a turn',
    board({
      you: { bf: ['Flameshadow Conjuring', 'Forest*2', 'Mountain*3'], hand: ['Briarpack Alpha'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    "Boseiju: the channel fizzles when its target's owner loses",
    board({
      you: { bf: ['Forest*2', 'Mountain'], hand: ['Boseiju, Who Endures', 'Lightning Bolt'] },
      opp: [{ bf: ['Tarnished Citadel', 'Hill Giant'] }, { life: 3, bf: ['Tarnished Citadel', 'Grizzly Bears'] }],
    }),
  ),
  preset(
    "Boseiju: a departed player's permanents aren't targets",
    board({
      you: { bf: ['Forest*2', 'Mountain'], hand: ['Boseiju, Who Endures', 'Lightning Bolt'] },
      opp: [{ bf: ['Tarnished Citadel', 'Hill Giant'] }, { life: 3, bf: ['Tarnished Citadel', 'Grizzly Bears'] }],
    }),
  ),
  preset(
    "Lightning Bolt: a departed player's creature isn't a target",
    board({
      you: { bf: ['Mountain*2'], hand: ['Lightning Bolt*2'] },
      opp: [{ bf: ['Hill Giant'] }, { life: 3, bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    "Scavenging Ooze: a departed player's graveyard isn't a target",
    board({
      you: { bf: ['Scavenging Ooze', 'Forest', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: [{ gy: ['Opt'] }, { life: 3, gy: ['Opt'] }],
    }),
  ),
  preset(
    'Mind Control: a stolen creature goes home when its thief leaves',
    board({
      you: { bf: ['Mountain*2'], hand: ['Lightning Bolt*2'] },
      opp: [{ bf: ['Hill Giant'] }, { life: 3, bf: [{ name: 'Mind Control', attach: 'Hill Giant' }] }],
    }),
  ),
  // --- The Tarkir precons, first half: costs, cycling, graveyard statics, edicts (2026-10-03, third round) --------
  preset(
    'Dismantling Wave: each target slot belongs to one opponent',
    board({
      you: { bf: ['Sol Ring', 'Plains*3'], hand: ['Dismantling Wave'] },
      opp: [{ bf: ['Sol Ring', 'Mind Stone', 'Grizzly Bears'] }, { bf: ['Ghostly Prison', 'Island', 'Serra Angel'] }, { bf: ['Craw Wurm'] }],
    }),
  ),
  preset(
    'Dismantling Wave: two picks from one opponent are refused',
    board({
      you: { bf: ['Plains*3'], hand: ['Dismantling Wave'] },
      opp: [{ bf: ['Sol Ring', 'Mind Stone'] }, { bf: ['Ghostly Prison'] }],
    }),
  ),
  preset(
    'Dismantling Wave: the chosen targets are destroyed together',
    board({
      you: { bf: ['Sol Ring', 'Plains*3'], hand: ['Dismantling Wave'] },
      opp: [{ bf: ['Sol Ring', 'Mind Stone'] }, { bf: ['Ghostly Prison'] }, { bf: ['Craw Wurm'] }],
    }),
  ),
  preset(
    "Windgrace's Judgment: lands are never offered",
    board({
      you: { bf: ['Swamp*3', 'Forest*2'], hand: ["Windgrace's Judgment"] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Ghostly Prison', 'Island', 'Serra Angel'] }],
    }),
  ),
  preset(
    'Afterlife from the Loam: one slot per graveyard, creature cards only',
    board({
      you: { bf: ['Swamp*8'], hand: ['Afterlife from the Loam'], gy: ['Grizzly Bears', 'Opt*2', 'Shock*2'] },
      opp: [{ gy: ['Craw Wurm', 'Serra Angel', 'Opt'] }, { gy: ['Giant Spider'] }, {}],
    }),
  ),
  preset(
    'Afterlife from the Loam: two cards from one graveyard are refused',
    board({
      you: { bf: ['Swamp*8'], hand: ['Afterlife from the Loam'], gy: ['Grizzly Bears'] },
      opp: [{ gy: ['Craw Wurm', 'Serra Angel'] }, { gy: ['Giant Spider'] }],
    }),
  ),
  preset(
    'Afterlife from the Loam: the cards come back together as Zombies',
    board({
      you: { bf: ['Swamp*8'], hand: ['Afterlife from the Loam'], gy: ['Grizzly Bears'] },
      opp: [{ gy: ['Craw Wurm', 'Serra Angel'] }, { gy: ['Giant Spider'] }],
    }),
  ),
  preset(
    'The Balrog of Moria: exiling it exiles a creature per opponent',
    board({
      you: { bf: ['The Balrog of Moria', 'Swamp*3'], hand: ['Murder'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Serra Angel'] }],
    }),
  ),
  preset(
    'The Balrog of Moria: saying no exiles nothing',
    board({
      you: { bf: ['The Balrog of Moria', 'Swamp*3'], hand: ['Murder'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Serra Angel'] }],
    }),
  ),
  preset(
    'Dismantling Wave: seats keep their numbers after a player leaves',
    board({
      you: { bf: ['Plains*3'], hand: ['Dismantling Wave'] },
      opp: [{ human: true, bf: ['Sol Ring'] }, { bf: ['Ghostly Prison'] }, { bf: ['Mind Stone'] }],
    }),
  ),
  preset(
    'Fractured Sanity: the cycle trigger resolves before the draw',
    board({
      you: { bf: ['Island*2'], hand: ['Fractured Sanity'] },
    }),
  ),
  preset(
    'Magmakin Artillerist: cycling one beside another deals 2',
    board({
      you: { bf: ['Magmakin Artillerist', 'Mountain*2'], hand: ['Magmakin Artillerist'] },
    }),
  ),
  preset(
    'Agonasaur Rex: cycled, it boosts a target',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*3'], hand: ['Agonasaur Rex'] },
    }),
  ),
  preset(
    'Agonasaur Rex: the cycle target can be skipped',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*3'], hand: ['Agonasaur Rex'] },
    }),
  ),
  preset(
    'Titanoth Rex: a trample counter on your only creature',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*2'], hand: ['Titanoth Rex'] },
    }),
  ),
  preset(
    'Vizier of Tumbling Sands: cycling untaps a land',
    board({
      you: { bf: [{ name: 'Island', tapped: true }, 'Island*2'], hand: ['Vizier of Tumbling Sands'] },
    }),
  ),
  preset(
    "Vizier of Tumbling Sands: its tap ability can't target itself",
    board({
      you: { bf: ['Vizier of Tumbling Sands', { name: 'Island', tapped: true }] },
    }),
  ),
  preset(
    'Decree of Pain: cycled, every creature gets -2/-2',
    board({
      you: { bf: ['Grizzly Bears', 'Swamp*5'], hand: ['Decree of Pain'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Migratory Route: the landcycling search waits on the stack',
    board({
      you: { bf: ['Island*5'], hand: ['Migratory Route', 'Think Twice'] },
    }),
  ),
  preset(
    'Fractured Sanity: no cycling under split second',
    board({
      you: { bf: ['Island*2'], hand: ['Fractured Sanity'] },
      opp: { human: true, bf: ['Plains*2'], hand: ["Angel's Grace"] },
      turn: 0,
    }),
  ),
  preset(
    "Agonasaur Rex: cycling on Grand Abolisher's turn",
    board({
      you: { bf: ['Forest*3'], hand: ['Agonasaur Rex'] },
      opp: { bf: ['Grand Abolisher'] },
      turn: 0,
    }),
  ),
  preset(
    'The Balrog of Moria: cycled, it makes two Treasures',
    board({
      you: { bf: ['Mountain*4'], hand: ['The Balrog of Moria'] },
    }),
  ),
  preset(
    'Dismantling Wave: cycled, it destroys every artifact and enchantment',
    board({
      you: { bf: ['Sol Ring', 'Plains*8'], hand: ['Dismantling Wave'] },
      opp: { bf: ['Ghostly Prison', 'Mind Stone'] },
    }),
  ),
  preset(
    'Hellkite Courser: offers only your own commander',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*6'], hand: ['Hellkite Courser'] },
      opp: { cmd: ['Teysa Karlov'] },
    }),
  ),
  preset(
    'Hellkite Courser: you can leave your commander where it is',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*6'], hand: ['Hellkite Courser'] },
    }),
  ),
  preset(
    'Hellkite Courser: the commander arrives with haste',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*6'], hand: ['Hellkite Courser'] },
    }),
  ),
  preset(
    'Hellkite Courser: the commander goes back at the end step',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*6'], hand: ['Hellkite Courser'] },
    }),
  ),
  preset(
    'Hellkite Courser: a commander that dies first',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*7'], hand: ['Hellkite Courser', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Hellkite Courser: a blinked commander stays',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*6', 'Plains'], hand: ['Hellkite Courser', 'Cloudshift'] },
    }),
  ),
  preset(
    'Hellkite Courser: the commander returns even if Courser dies',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Mountain*6', 'Swamp*3'], hand: ['Hellkite Courser', 'Murder'] },
    }),
  ),
  preset(
    'Command Beacon: commander to hand, cast without tax',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Command Beacon', 'Mountain*10'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Command Beacon: a cast from hand adds no tax',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Command Beacon', 'Mountain*10'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Command Beacon: no commander in the command zone',
    board({
      you: { bf: [{ name: 'Krenko, Mob Boss', commander: true }, 'Command Beacon'] },
    }),
  ),
  preset(
    'Will of the Abzan: both modes while you control a commander',
    board({
      you: { bf: [{ name: 'Krenko, Mob Boss', commander: true }, 'Swamp*4'], hand: ['Will of the Abzan'], gy: ['Serra Angel'] },
      opp: { bf: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Will of the Abzan: one mode without a commander',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Swamp*4'], hand: ['Will of the Abzan'], gy: ['Serra Angel'] },
      opp: { bf: ['Craw Wurm'] },
    }),
  ),
  preset(
    "Will of the Abzan: one opponent can't fill two slots",
    board({
      you: { bf: ['Swamp*4'], hand: ['Will of the Abzan'] },
      opp: [{ bf: ['Craw Wurm'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Will of the Abzan: opponents choose in turn order',
    board({
      you: { bf: ['Swamp*4'], hand: ['Will of the Abzan'] },
      opp: [
        { human: true, bf: ['Craw Wurm', 'Grizzly Bears'] },
        { human: true, bf: ['Craw Wurm*2'] },
      ],
    }),
  ),
  preset(
    'Will of the Abzan: both modes resolve',
    board({
      you: { bf: [{ name: 'Krenko, Mob Boss', commander: true }, 'Swamp*4'], hand: ['Will of the Abzan'], gy: ['Serra Angel'], life: 20 },
      opp: [
        { life: 20, bf: ['Craw Wurm', 'Grizzly Bears'] },
        { life: 20, bf: ['Craw Wurm*2'] },
        { life: 20, bf: ['Serra Angel'] },
      ],
    }),
  ),
  preset(
    'Priest of Forgotten Gods: targeted players lose 2 and sacrifice',
    board({
      you: { bf: ['Priest of Forgotten Gods', 'Grizzly Bears*2'] },
      opp: [{ bf: ['Craw Wurm'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Priest of Forgotten Gods: mana and a card with no targets',
    board({
      you: { bf: ['Priest of Forgotten Gods', 'Grizzly Bears*2'] },
      opp: { bf: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Crackling Doom: each opponent sacrifices their biggest creature',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain', 'Plains', 'Swamp'], hand: ['Crackling Doom'] },
      opp: { human: true, bf: ['Craw Wurm*2', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Soul Shatter: the greatest mana value goes, planeswalker or not',
    board({
      you: { bf: ['Swamp*3'], hand: ['Soul Shatter'] },
      opp: { bf: ['Ajani, Caller of the Pride', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Will of the Mardu: the damage counts the new Warriors',
    board({
      you: { bf: [{ name: 'Krenko, Mob Boss', commander: true }, 'Plains*3'], hand: ['Will of the Mardu'] },
      opp: { bf: ['Hill Giant', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Temple of the Dragon Queen: revealing a Dragon',
    board({ you: { hand: ['Temple of the Dragon Queen', 'Shivan Dragon'] } }),
  ),
  preset(
    'Temple of the Dragon Queen: untapped while you control a Dragon',
    board({ you: { bf: ['Shivan Dragon'], hand: ['Temple of the Dragon Queen'] } }),
  ),
  preset(
    "Temple of the Dragon Queen: tapped when you don't reveal",
    board({ you: { hand: ['Temple of the Dragon Queen', 'Shivan Dragon'] } }),
  ),
  preset(
    'Temple of the Dragon Queen: taps for the chosen colour',
    board({ you: { bf: ['Shivan Dragon'], hand: ['Temple of the Dragon Queen'] } }),
  ),
  preset(
    'Quirion Ranger: one Forest returns without asking',
    board({
      you: { bf: ['Quirion Ranger', { name: 'Grizzly Bears', tapped: true }, 'Forest', 'Mountain'] },
    }),
  ),
  preset(
    'Quirion Ranger: only once each turn',
    board({
      you: { bf: ['Quirion Ranger', { name: 'Grizzly Bears', tapped: true }, 'Forest'] },
    }),
  ),
  preset(
    'Quirion Ranger: choosing between two Forests',
    board({
      you: { bf: ['Quirion Ranger', { name: 'Grizzly Bears', tapped: true }, 'Forest*2', 'Mountain'] },
    }),
  ),
  preset(
    'Quirion Ranger: priority goes back to whoever used it',
    board({
      you: { bf: ['Forest'] },
      opp: { human: true, bf: ['Quirion Ranger', 'Forest*2', { name: 'Grizzly Bears', tapped: true }] },
    }),
  ),
  preset(
    'Mina and Denn, Wildborn: returning the land that paid',
    board({
      you: { bf: ['Mina and Denn, Wildborn', 'Grizzly Bears', 'Forest', 'Mountain'] },
    }),
  ),
  preset(
    'Mina and Denn, Wildborn: two land plays',
    board({
      you: { bf: ['Mina and Denn, Wildborn'], hand: ['Forest', 'Mountain'] },
    }),
  ),
  preset(
    "Multani, Yavimaya's Avatar: its size counts your lands and graveyard",
    board({
      you: { bf: ["Multani, Yavimaya's Avatar", 'Forest', 'Mountain'], gy: ['Mountain'] },
      opp: { gy: ['Forest'] },
    }),
  ),
  preset(
    "Multani, Yavimaya's Avatar: not offered with one land",
    board({
      you: { bf: ['Forest'], gy: ["Multani, Yavimaya's Avatar"] },
    }),
  ),
  preset(
    "Multani, Yavimaya's Avatar: two lands pay and go back",
    board({
      you: { bf: ['Forest', 'Mountain'], gy: ["Multani, Yavimaya's Avatar"] },
    }),
  ),
  preset(
    "Multani, Yavimaya's Avatar: with three lands, you choose which two",
    board({
      you: { bf: ['Forest', 'Mountain', 'Forest'], gy: ["Multani, Yavimaya's Avatar"] },
    }),
  ),
  preset(
    'Myr Battlesphere: four Myr on entering',
    board({ you: { bf: ['Island*7'], hand: ['Myr Battlesphere'] } }),
  ),
  preset(
    'Myr Battlesphere: the tap prompt includes summoning-sick Myr',
    board({
      you: { bf: ['Myr Battlesphere', { name: 'Myr Token', n: 3, sick: true }, { name: 'Myr Token', tapped: true }] },
    }),
  ),
  preset(
    'Myr Battlesphere: tapping three Myr',
    board({ you: { bf: ['Myr Battlesphere', 'Myr Token*4'] } }),
  ),
  preset(
    'Myr Battlesphere: attacking a planeswalker',
    board({ you: { bf: ['Myr Battlesphere', 'Myr Token*4'] }, opp: { bf: ['Ajani, Caller of the Pride'] } }),
  ),
  preset(
    'Myr Battlesphere: tapping no Myr',
    board({ you: { bf: ['Myr Battlesphere', 'Myr Token*4'] } }),
  ),
  preset(
    "Gravecrawler: an opponent's Zombie doesn't count",
    board({
      you: { bf: ['Swamp'], gy: ['Gravecrawler'] },
      opp: { bf: ['Zombie Token'] },
    }),
  ),
  preset(
    'Essence Anchor: not offered before a card leaves your graveyard',
    board({
      you: { bf: ['Essence Anchor'], gy: ['Gravecrawler'] },
    }),
  ),
  preset(
    "Lord of the Forsaken: its mana can't pay for a spell from your hand",
    board({
      you: { life: 20, bf: ['Lord of the Forsaken'], hand: ['Sol Ring'] },
    }),
  ),
  preset(
    'Lord of the Forsaken: its mana pays for flashback',
    board({
      you: { life: 20, bf: ['Lord of the Forsaken', 'Swamp'], hand: ['Opt'], gy: ['Welcome the Dead'] },
    }),
  ),
  preset(
    "Teval's Judgment: a card leaving your graveyard offers all three modes",
    board({
      you: { life: 20, bf: ["Teval's Judgment", 'Swamp*6'], hand: ['Opt'], gy: ['Welcome the Dead'] },
    }),
  ),
  preset(
    'Welcome the Dead: X counts cards put into your graveyard this turn',
    board({
      you: { life: 20, bf: ['Island*2', 'Swamp*6'], hand: ['Fractured Sanity', 'Opt', 'Shock'], gy: ['Welcome the Dead'] },
    }),
  ),
  preset(
    'Gravecrawler: castable from your graveyard with your own Zombie',
    board({
      you: { bf: ['Zombie Token', 'Swamp'], gy: ['Gravecrawler'] },
    }),
  ),
  preset(
    "Teval's Judgment: the second trigger offers only unused modes",
    board({
      you: { bf: ["Teval's Judgment", 'Zombie Token', 'Swamp*2'], gy: ['Gravecrawler*2'] },
    }),
  ),
  preset(
    "Teval's Judgment: no fourth trigger in a turn",
    board({
      you: { bf: ["Teval's Judgment", 'Zombie Token', 'Swamp*4'], gy: ['Gravecrawler*4'] },
    }),
  ),
  preset(
    'Essence Anchor: a Zombie Druid after a card leaves',
    board({
      you: { bf: ['Essence Anchor', 'Zombie Token', 'Swamp'], gy: ['Gravecrawler'] },
    }),
  ),
  preset(
    "Essence Anchor: not on an opponent's turn",
    board({
      you: { bf: ['Essence Anchor', 'Island*3'], gy: ['Think Twice'] },
      turn: 0,
    }),
  ),
  preset(
    'Anger: haste from the graveyard',
    board({
      you: { bf: [{ name: 'Grizzly Bears', sick: true }, 'Mountain'], gy: ['Anger'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Brawn: trample from the graveyard',
    board({
      you: { bf: ['Grizzly Bears', 'Forest'], gy: ['Brawn'] },
    }),
  ),
  preset(
    'Filth: swampwalk from the graveyard',
    board({
      you: { bf: ['Grizzly Bears', 'Swamp'], gy: ['Filth'] },
      opp: { bf: ['Swamp', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Wonder: flying needs an Island',
    board({
      you: { bf: ['Grizzly Bears'], hand: ['Island'], gy: ['Wonder'] },
    }),
  ),
  preset(
    'Wonder: on the battlefield it grants nothing',
    board({
      you: { bf: ['Wonder', 'Grizzly Bears', 'Island'] },
    }),
  ),
  preset(
    'Wonder: dying after Turn to Frog still grants flying',
    board({
      you: { bf: ['Wonder', 'Grizzly Bears', 'Island*2', 'Swamp*2'], hand: ['Turn to Frog', 'Doom Blade'] },
    }),
  ),
  preset(
    'Wonder: Turn to Frog after Wonder dies wins',
    board({
      you: { bf: ['Wonder', 'Grizzly Bears', 'Island*2', 'Swamp*2'], hand: ['Turn to Frog', 'Doom Blade'] },
    }),
  ),
  preset(
    'Legion Warboss: a hasty Goblin at the beginning of combat',
    board({ you: { bf: ['Legion Warboss'] } }),
  ),
  preset(
    'Legion Warboss: the Goblin must attack',
    board({ you: { bf: ['Legion Warboss'] } }),
  ),
  preset(
    'Legion Warboss: mentor can target only the Goblin',
    board({ you: { bf: ['Legion Warboss', 'Ainok Strike Leader'] } }),
  ),
  preset(
    'Ainok Strike Leader: a Goblin attacking each opponent',
    board({ you: { bf: ['Ainok Strike Leader'] }, opp: [{}, {}] }),
  ),
  preset(
    "Within Range: Ainok's Goblins first",
    board({
      you: { life: 20, bf: ['Legion Warboss', 'Ainok Strike Leader', 'Within Range'] },
      opp: [{ life: 20 }, { life: 20 }],
    }),
  ),
  preset(
    "Within Range: before Ainok's Goblins",
    board({
      you: { life: 20, bf: ['Legion Warboss', 'Ainok Strike Leader', 'Within Range'] },
      opp: [{ life: 20 }, { life: 20 }],
    }),
  ),
  preset(
    'Ainok Strike Leader: your commander attacking alone',
    board({ you: { bf: ['Ainok Strike Leader', { name: 'Krenko, Mob Boss', commander: true }, 'Grizzly Bears'] } }),
  ),
  preset(
    'Ainok Strike Leader: no trigger for another creature alone',
    board({ you: { bf: ['Ainok Strike Leader', { name: 'Krenko, Mob Boss', commander: true }, 'Grizzly Bears'] } }),
  ),
  preset(
    'Legion Warboss: the Goblin keeps haste after combat',
    board({ you: { bf: ['Legion Warboss'] } }),
  ),
  preset(
    'Legion Warboss: Ghostly Prison under one opponent',
    board({ you: { bf: ['Legion Warboss'] }, opp: [{ bf: ['Ghostly Prison'] }, {}] }),
  ),
  preset(
    'Legion Warboss: Ghostly Prison under every opponent',
    board({ you: { bf: ['Legion Warboss'] }, opp: [{ bf: ['Ghostly Prison'] }, { bf: ['Ghostly Prison'] }] }),
  ),
  preset(
    'Divine Visitation: Treasures stay Treasures',
    board({ you: { bf: ['Divine Visitation', 'Mountain*4'], hand: ['The Balrog of Moria'] } }),
  ),
  preset(
    "Divine Visitation: Warboss's token is an Angel that must attack",
    board({ you: { bf: ['Divine Visitation', 'Legion Warboss'] } }),
  ),
  preset(
    "Divine Visitation: Ainok's tokens are Angels",
    board({ you: { bf: ['Divine Visitation', 'Ainok Strike Leader'] }, opp: [{}, {}] }),
  ),
  preset(
    'Redoubled Stormsinger: copies every token that entered this turn',
    board({
      you: { bf: ['Divine Visitation', 'Legion Warboss', 'Ainok Strike Leader', 'Redoubled Stormsinger', 'Goblin Token'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    "Redoubled Stormsinger: before Ainok's trigger",
    board({
      you: { bf: ['Divine Visitation', 'Legion Warboss', 'Ainok Strike Leader', 'Redoubled Stormsinger'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Redoubled Stormsinger: copies are sacrificed at the end step',
    board({ you: { bf: ['Divine Visitation', 'Legion Warboss', 'Redoubled Stormsinger'] } }),
  ),
  preset(
    'Legion Warboss: tokens from different turns stack apart',
    board({ you: { bf: ['Legion Warboss', 'Goblin Token'] } }),
  ),
  preset(
    "Divine Visitation: an opponent's Goblin stays a Goblin",
    board({ you: { bf: ['Divine Visitation'] }, opp: { bf: ['Legion Warboss'] }, turn: 0 }),
  ),
  preset(
    'Sarkhan, Soul Aflame: Dragon spells cost 1 less',
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }, 'Mountain*5'], hand: ['Shivan Dragon'] },
    }),
  ),
  preset(
    'Sarkhan, Soul Aflame: becoming a copy of Shivan Dragon',
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }, 'Mountain*6'], hand: ['Shivan Dragon'] },
    }),
  ),
  preset(
    'Sarkhan, Soul Aflame: as a copy, he loses his own abilities',
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }, 'Mountain*10'], hand: ['Shivan Dragon', 'Glorybringer'] },
    }),
  ),
  preset(
    'Sarkhan, Soul Aflame: back to normal in the cleanup step',
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }, 'Mountain*5'], hand: ['Shivan Dragon'] },
    }),
  ),
  preset(
    'Sarkhan, Soul Aflame: copying Lathliss, no legend rule',
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }, 'Mountain*5'], hand: ['Lathliss, Dragon Queen'] },
    }),
  ),
  preset(
    "Sarkhan, Soul Aflame: copying a Dragon that's already gone",
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }, 'Mountain*5', 'Swamp*3'], hand: ['Shivan Dragon', 'Murder'] },
    }),
  ),
  preset(
    "Sarkhan, Soul Aflame: an opponent's Dragon doesn't trigger him",
    board({
      you: { bf: [{ name: 'Sarkhan, Soul Aflame', counters: { '+1/+1': 1 } }] },
      opp: { human: true, bf: ['Mountain*6'], hand: ['Shivan Dragon'] },
      turn: 0,
    }),
  ),
  preset(
    'Decree of Pain: destroys every creature but the indestructible',
    board({
      you: { bf: ['Grizzly Bears', 'Serra Angel', 'Swamp*8'], hand: ['Decree of Pain'] },
      opp: { bf: ['Serra Angel', 'Darksteel Myr'] },
    }),
  ),
  preset(
    "Colfenor's Urn: asks about each of your big creatures",
    board({
      you: {
        bf: ["Colfenor's Urn", 'Serra Angel', 'Craw Wurm', 'Giant Spider', 'Grizzly Bears', 'Swamp*7', 'Forest*2'],
        hand: ['Giant Growth', 'Decree of Pain'],
      },
      opp: { bf: ['Serra Angel', 'Darksteel Myr'] },
    }),
  ),
  preset(
    "Colfenor's Urn: declining leaves the card in the graveyard",
    board({
      you: { bf: ["Colfenor's Urn", 'Serra Angel', 'Swamp*3'], hand: ['Murder'] },
    }),
  ),
  preset(
    "Colfenor's Urn: three cards return at the end step",
    board({
      you: { bf: ["Colfenor's Urn", 'Serra Angel', 'Craw Wurm', 'Giant Spider', 'Swamp*8'], hand: ['Decree of Pain'] },
    }),
  ),
  preset(
    "Colfenor's Urn: the third card on the opponent's turn",
    board({
      you: { bf: ["Colfenor's Urn", 'Serra Angel', 'Craw Wurm', 'Giant Spider', 'Swamp*9'], hand: ['Murder*3'] },
    }),
  ),
  preset(
    "Colfenor's Urn: a token exiles nothing",
    board({
      you: { bf: ["Colfenor's Urn", '4/4 Angel Token', 'Swamp*3'], hand: ['Murder'] },
    }),
  ),
  preset(
    'Wall of Roots: once each turn, even tapped',
    board({ you: { bf: [{ name: 'Wall of Roots', tapped: true, sick: true }] } }),
  ),
  preset(
    "Wall of Roots: again on the next player's turn",
    board({ you: { bf: ['Wall of Roots'] } }),
  ),
  preset(
    "Wall of Roots: used when the lands can't pay",
    board({ you: { bf: ['Wall of Roots', 'Forest'], hand: ['Grizzly Bears'] } }),
  ),
  preset(
    'Wall of Roots: not used when the lands can pay',
    board({ you: { bf: ['Wall of Roots', 'Forest*2'], hand: ['Grizzly Bears'] } }),
  ),
  preset(
    'Devoted Druid: the second untap kills it first',
    board({ you: { bf: ['Devoted Druid'] } }),
  ),
  preset(
    'Tree of Redemption: swapping your life and its toughness',
    board({ you: { life: 7, bf: [{ name: 'Tree of Redemption', counters: { '+1/+1': 2 } }] } }),
  ),
  preset(
    "Tree of Perdition: swapping an opponent's life and its toughness",
    board({ you: { bf: ['Tree of Perdition'] }, opp: { life: 31 } }),
  ),
  preset(
    'Tree of Redemption: The Lord of Pain stops the swap',
    board({ you: { life: 5, bf: ['Tree of Redemption'] }, opp: { bf: ['The Lord of Pain'] } }),
  ),
  preset(
    'Tree of Redemption: The Lord of Pain allows a loss',
    board({ you: { life: 30, bf: ['Tree of Redemption'] }, opp: { bf: ['The Lord of Pain'] } }),
  ),
  preset(
    "Weathered Sentinels: can't attack at first",
    board({ you: { bf: ['Weathered Sentinels'] } }),
  ),
  preset(
    'Weathered Sentinels: only a player who attacked you',
    board({
      you: { bf: ['Weathered Sentinels', 'Ajani, Caller of the Pride'] },
      opp: [{ human: true, bf: ['Grizzly Bears'] }, { human: true, bf: ['Grizzly Bears'] }],
      turn: 0,
    }),
  ),
  preset(
    'Weathered Sentinels: +3/+3 and indestructible when it attacks',
    board({
      you: { bf: ['Weathered Sentinels'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    "Weathered Sentinels: only each player's last turn counts",
    board({
      you: { bf: ['Weathered Sentinels'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    'Tasigur, the Golden Fang: you choose the opponent after the mill',
    board({
      you: { bf: ['Tasigur, the Golden Fang', 'Forest*2', 'Island*2'], gy: ['Hill Giant', 'Grizzly Bears', 'Island'], lib: ['Serra Angel', 'Forest'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Tasigur, the Golden Fang: the opponent picks any nonland card',
    board({
      you: { bf: ['Tasigur, the Golden Fang', 'Forest*2', 'Island*2'], gy: ['Hill Giant', 'Grizzly Bears', 'Island'], lib: ['Serra Angel', 'Forest'] },
      opp: [{}, { human: true }],
    }),
  ),
  preset(
    'Tasigur, the Golden Fang: no opponent question with one opponent',
    board({
      you: { bf: ['Tasigur, the Golden Fang', 'Forest*2', 'Island*2'], gy: ['Hill Giant', 'Grizzly Bears', 'Island'], lib: ['Serra Angel', 'Forest'] },
    }),
  ),
  preset(
    'Colossal Grave-Reaver: one trigger, for the card still there',
    board({
      you: {
        bf: ['Tasigur, the Golden Fang', 'Colossal Grave-Reaver', 'Forest*2', 'Island*2'],
        gy: ['Hill Giant', 'Grizzly Bears', 'Island'],
        lib: ['Serra Angel', 'Craw Wurm'],
      },
      opp: { human: true },
    }),
  ),
  preset(
    "Selvala's Stampede: votes in turn order, no abstaining",
    board({
      you: { bf: ['Forest*6'], hand: ["Selvala's Stampede", 'Serra Angel'], lib: ['Island', 'Grizzly Bears', 'Island', 'Hill Giant', 'Craw Wurm'] },
      opp: [{ human: true }, { human: true }],
    }),
  ),
  preset(
    "Selvala's Stampede: later voters see the earlier votes",
    board({
      you: { bf: ['Forest*6'], hand: ["Selvala's Stampede", 'Serra Angel'], lib: ['Island', 'Grizzly Bears', 'Island', 'Hill Giant', 'Craw Wurm'] },
      opp: [{ human: true }, { human: true }],
    }),
  ),
  preset(
    "Selvala's Stampede: two wild votes and one free",
    board({
      you: { bf: ['Forest*6'], hand: ["Selvala's Stampede", 'Serra Angel', 'Giant Growth'], lib: ['Island', 'Grizzly Bears', 'Island', 'Hill Giant', 'Craw Wurm'] },
      opp: [{ human: true }, { human: true }],
    }),
  ),
  preset(
    "Selvala's Stampede: three free votes",
    board({
      you: { bf: ['Forest*6'], hand: ["Selvala's Stampede", 'Serra Angel', 'Grizzly Bears', 'Hill Giant', 'Giant Growth'] },
      opp: [{ human: true }, { human: true }],
    }),
  ),
  preset(
    'Gix, Yawgmoth Praetor: your creature hits an opponent',
    board({
      you: { life: 20, bf: ['Gix, Yawgmoth Praetor', 'Grizzly Bears'] },
    }),
  ),
  preset(
    "Gix, Yawgmoth Praetor: an opponent's creature hits another opponent",
    board({
      you: { bf: ['Gix, Yawgmoth Praetor'] },
      opp: [{ human: true, bf: ['Grizzly Bears'] }, {}],
      turn: 0,
    }),
  ),
  preset(
    'Gix, Yawgmoth Praetor: nothing when a creature hits you',
    board({
      you: { bf: ['Gix, Yawgmoth Praetor'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    'Gix, Yawgmoth Praetor: an X for a cost with no X',
    board({
      you: { bf: ['Gix, Yawgmoth Praetor', 'Swamp*7'], hand: ['Opt', 'Shock', 'Forest', 'Island'] },
      opp: { lib: ['Grizzly Bears', 'Forest', 'Hill Giant'] },
    }),
  ),
  preset(
    'Gix, Yawgmoth Praetor: playing the exiled cards free',
    board({
      you: { bf: ['Gix, Yawgmoth Praetor', 'Swamp*7'], hand: ['Opt', 'Shock', 'Forest', 'Island'] },
      opp: { lib: ['Grizzly Bears', 'Forest', 'Hill Giant'] },
    }),
  ),
  preset(
    'Gix, Yawgmoth Praetor: no land off your turn',
    board({
      you: { bf: ['Gix, Yawgmoth Praetor', 'Swamp*7'], hand: ['Opt', 'Shock', 'Forest', 'Island'] },
      opp: { lib: ['Grizzly Bears', 'Forest', 'Hill Giant'] },
      turn: 0,
    }),
  ),
  preset(
    "Gix, Yawgmoth Praetor: a card discarded meanwhile isn't offered",
    board({
      you: { bf: ['Gix, Yawgmoth Praetor', 'Rest in Peace', 'Swamp*7'], hand: ['Opt', 'Shock', 'Forest'] },
      opp: { lib: ['Thrill of Possibility', 'Hill Giant'] },
    }),
  ),
  preset(
    'Lethal Scheme: the order prompt names each convoker',
    board({
      you: { bf: ['Swamp*2', 'Grizzly Bears*2'], hand: ['Lethal Scheme', 'Hill Giant', 'Island'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Lethal Scheme: only a nonland discard gives a counter',
    board({
      you: { bf: ['Swamp*2', 'Grizzly Bears*2'], hand: ['Lethal Scheme', 'Hill Giant', 'Island'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Lethal Scheme: a convoker that died still connives',
    board({
      you: { bf: ['Swamp*5', 'Grizzly Bears*2'], hand: ['Lethal Scheme', 'Murder', 'Hill Giant'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Lethal Scheme: a copy connives with the same creatures',
    board({
      you: { bf: ['Swamp*2', 'Island*2', 'Grizzly Bears*2'], hand: ['Lethal Scheme', 'Twincast', 'Hill Giant', 'Opt', 'Shock', 'Craw Wurm'] },
      opp: { bf: ['Serra Angel*2'] },
    }),
  ),
  preset(
    'Necropolis Fiend: X and the cards to exile',
    board({ you: { bf: ['Necropolis Fiend', 'Swamp*2'], gy: ['Grizzly Bears', 'Hill Giant', 'Island'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  preset(
    'Necropolis Fiend: X is limited by your graveyard',
    board({ you: { bf: ['Necropolis Fiend', 'Swamp*3'], gy: ['Grizzly Bears'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  preset(
    'Moorland Haunt: not offered without a creature card',
    board({ you: { bf: ['Moorland Haunt', 'Plains', 'Island'], gy: ['Island'] } }),
  ),
  preset(
    'Moorland Haunt: choosing between two creature cards',
    board({ you: { bf: ['Moorland Haunt', 'Plains', 'Island'], gy: ['Island', 'Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    'Shigeki, Jukai Visionary: returning itself to reveal four',
    board({
      you: { bf: ['Shigeki, Jukai Visionary', 'Forest*2'], lib: ['Forest', 'Grizzly Bears', 'Swamp', 'Hill Giant'] },
    }),
  ),
  preset(
    'Shigeki, Jukai Visionary: channel offered up to X = 2',
    board({
      you: { bf: ['Forest*10'], hand: ['Shigeki, Jukai Visionary'], gy: ['Grizzly Bears', 'Hill Giant', 'Baldin, Century Herdmaster'] },
    }),
  ),
  preset(
    "Shigeki, Jukai Visionary: channel can't target a legendary card",
    board({
      you: { bf: ['Forest*10'], hand: ['Shigeki, Jukai Visionary'], gy: ['Grizzly Bears', 'Hill Giant', 'Baldin, Century Herdmaster'] },
    }),
  ),
  preset(
    'Steward of the Harvest: targets only land cards in your graveyard',
    board({
      you: { bf: ['Forest*4'], hand: ['Steward of the Harvest'], gy: ['Forest', 'Evolving Wilds', 'Island', 'Hill Giant'] },
      opp: { gy: ['Forest'] },
    }),
  ),
  preset(
    "Steward of the Harvest: your creatures get the lands' abilities",
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4'], hand: ['Steward of the Harvest'], gy: ['Forest', 'Evolving Wilds'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    "Steward of the Harvest: summoning-sick creatures can't tap",
    board({
      you: { bf: [{ name: 'Grizzly Bears', sick: true }, 'Forest*4'], hand: ['Steward of the Harvest'], gy: ['Forest', 'Evolving Wilds'] },
    }),
  ),
  preset(
    'Steward of the Harvest: a creature taps for green',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4'], hand: ['Steward of the Harvest', 'Giant Growth'], gy: ['Forest', 'Evolving Wilds'] },
    }),
  ),
  preset(
    'Steward of the Harvest: Evolving Wilds sacrifices the creature',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4'], hand: ['Steward of the Harvest'], gy: ['Forest', 'Evolving Wilds'] },
    }),
  ),
  preset(
    'Steward of the Harvest: the abilities go when it leaves',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4', 'Swamp*3'], hand: ['Steward of the Harvest', 'Murder'], gy: ['Forest', 'Evolving Wilds'] },
    }),
  ),
  preset(
    'Sepulchral Primordial: one target slot per opponent',
    board({
      you: { bf: ['Swamp*7'], hand: ['Sepulchral Primordial'] },
      opp: [{ gy: ['Hill Giant', 'Serra Angel'] }, { gy: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Sepulchral Primordial: putting only some targets onto the battlefield',
    board({
      you: { bf: ['Swamp*7'], hand: ['Sepulchral Primordial'] },
      opp: [{ gy: ['Hill Giant', 'Serra Angel'] }, { gy: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Sepulchral Primordial: two artifacts enter together',
    board({
      you: { bf: ['Swamp*7', 'Ingenious Artillerist'], hand: ['Sepulchral Primordial'] },
      opp: [{ gy: ['Ornithopter'] }, { gy: ['Ornithopter'] }],
    }),
  ),
  preset(
    'Diluvian Primordial: casting both spells in your order',
    board({
      you: { bf: ['Island*7'], hand: ['Diluvian Primordial'] },
      opp: [{ gy: ['Lightning Bolt', 'Hill Giant'] }, { gy: ['Shock', 'Grizzly Bears'] }],
    }),
  ),
  preset(
    'Diluvian Primordial: a declined spell stays in the graveyard',
    board({
      you: { bf: ['Island*7'], hand: ['Diluvian Primordial'] },
      opp: [{ gy: ['Lightning Bolt'] }, { gy: ['Shock'] }],
    }),
  ),
  preset(
    'Combustible Gearhulk: the opponent lets you draw',
    board({
      you: { bf: ['Mountain*6'], hand: ['Combustible Gearhulk'], lib: ['Fireball', 'Grizzly Bears', 'Hill Giant'] },
      opp: { human: true },
    }),
  ),
  preset(
    'Combustible Gearhulk: the opponent chooses the mill',
    board({
      you: { bf: ['Mountain*6'], hand: ['Combustible Gearhulk'], lib: ['Fireball', 'Grizzly Bears', 'Hill Giant'] },
      opp: { human: true },
    }),
  ),
  preset(
    'Combustible Gearhulk: draw three from a two-card library',
    board({
      you: { bf: ['Mountain*6'], hand: ['Combustible Gearhulk'], lib: ['Fireball', 'Grizzly Bears'] },
      opp: { human: true, lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Dauthi Voidwalker: only shadow creatures can block it',
    board({
      you: { bf: ['Dauthi Voidwalker'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Dauthi Voidwalker: it can block only shadow creatures',
    board({
      you: { bf: ['Dauthi Voidwalker'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
      turn: 0,
    }),
  ),
  preset(
    "Dauthi Voidwalker: an opponent's creature gets a void counter",
    board({
      you: { bf: ['Dauthi Voidwalker', 'Swamp*3'], hand: ['Murder'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Dauthi Voidwalker: your own creature still goes to your graveyard',
    board({
      you: { bf: ['Dauthi Voidwalker', 'Grizzly Bears', 'Swamp*3'], hand: ['Murder'] },
    }),
  ),
  preset(
    "Dauthi Voidwalker: an opponent's token still dies",
    board({
      you: { bf: ['Dauthi Voidwalker', 'Swamp*3'], hand: ['Murder'] },
      opp: { bf: ['Goblin Token'] },
    }),
  ),
  preset(
    'Dauthi Voidwalker: a flashback spell gets no void counter',
    board({
      you: { bf: ['Dauthi Voidwalker'] },
      opp: { human: true, bf: ['Island*3'], gy: ['Think Twice'] },
      turn: 0,
    }),
  ),
  preset(
    "Dauthi Voidwalker: an opponent's sorcery gets a void counter",
    board({
      you: { bf: ['Dauthi Voidwalker'] },
      opp: { human: true, bf: ['Mountain'], hand: ['Lava Spike'] },
      turn: 0,
    }),
  ),
  preset(
    "Dauthi Voidwalker: Rest in Peace's exile wins",
    board({
      you: { bf: ['Dauthi Voidwalker', 'Swamp*3'], hand: ['Murder'] },
      opp: { bf: ['Rest in Peace', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Dauthi Voidwalker: playing the only void card',
    board({
      you: { bf: ['Dauthi Voidwalker', 'Swamp*3'], hand: ['Murder'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Dauthi Voidwalker: choosing among void cards',
    board({
      you: { bf: ['Dauthi Voidwalker', 'Swamp*6'], hand: ['Murder*2'] },
      opp: { bf: ['Grizzly Bears', 'Serra Angel'], exile: ['Hill Giant'] },
    }),
  ),
  preset(
    'Territorial Hellkite: a random opponent it must attack',
    board({
      you: { life: 20, bf: ['Territorial Hellkite'] },
      opp: [{ life: 40 }, { life: 20 }],
    }),
  ),
  preset(
    'Scourge of the Throne: attacking the most life adds a combat',
    board({
      you: { life: 20, bf: ['Scourge of the Throne'] },
      opp: [{ life: 40 }, { life: 20 }],
    }),
  ),
  preset(
    'Territorial Hellkite: the other opponent in the extra combat',
    board({
      you: { life: 20, bf: ['Territorial Hellkite', 'Scourge of the Throne'] },
      opp: [{ life: 40 }, { life: 20 }],
    }),
  ),
  preset(
    'Scourge of the Throne: no third combat',
    board({
      you: { life: 20, bf: ['Scourge of the Throne'] },
      opp: [{ life: 40 }, { life: 20 }],
    }),
  ),
  preset(
    "Scourge of the Throne: no extra combat if Bob isn't highest any more",
    board({
      you: { life: 38, bf: ['Scourge of the Throne', 'Plains*2'], hand: ['Revitalize'] },
      opp: [{ life: 40 }, { life: 20 }],
    }),
  ),
  preset(
    'Territorial Hellkite: taps itself with no one to choose',
    board({ you: { bf: ['Territorial Hellkite'] } }),
  ),
  preset(
    'Territorial Hellkite: an attack tax frees it',
    board({ you: { bf: ['Territorial Hellkite'] }, opp: [{ bf: ['Propaganda'] }, {}] }),
  ),
  preset(
    'Opportunistic Dragon: the stolen Human stays stolen',
    board({
      you: { bf: ['Mountain*4'], hand: ['Opportunistic Dragon'] },
      opp: { bf: ['Syr Konrad, the Grim', 'Sol Ring'] },
    }),
  ),
  preset(
    'Opportunistic Dragon: Konrad goes back when the Dragon dies',
    board({
      you: { bf: ['Mountain*4', 'Swamp*3'], hand: ['Opportunistic Dragon', 'Murder'] },
      opp: { bf: ['Syr Konrad, the Grim', 'Sol Ring'] },
    }),
  ),
  preset(
    'Opportunistic Dragon: Konrad pings for the next death',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*4', 'Swamp*6'], hand: ['Opportunistic Dragon', 'Murder*2'] },
      opp: { bf: ['Syr Konrad, the Grim', 'Sol Ring'] },
    }),
  ),
  preset(
    'Opportunistic Dragon: a blink ends the old steal at once',
    board({
      you: { bf: ['Mountain*4', 'Plains'], hand: ['Opportunistic Dragon', 'Cloudshift'] },
      opp: { bf: ['Syr Konrad, the Grim', 'Sol Ring'] },
    }),
  ),
  preset(
    'Opportunistic Dragon: you keep Konrad when the Dragon is stolen',
    board({
      you: { bf: ['Mountain*4'], hand: ['Opportunistic Dragon'] },
      opp: { human: true, bf: ['Syr Konrad, the Grim', 'Sol Ring', 'Mountain*3'], hand: ['Act of Treason'] },
    }),
  ),
  preset(
    'Opportunistic Dragon: killed before its trigger resolves',
    board({
      you: { bf: ['Mountain*4', 'Swamp*3'], hand: ['Opportunistic Dragon', 'Murder'] },
      opp: { bf: ['Syr Konrad, the Grim', 'Sol Ring'] },
    }),
  ),
  preset(
    "Chandra's Ignition: deathtouch and lifelink damage",
    board({
      you: { life: 20, bf: ['Vampire Nighthawk', 'Grizzly Bears', 'Mountain*5'], hand: ["Chandra's Ignition"] },
      opp: { life: 20, bf: ['Serra Angel', 'Craw Wurm'] },
    }),
  ),
  preset(
    "Chandra's Ignition: nothing if the creature is gone",
    board({
      you: { life: 20, bf: ['Vampire Nighthawk', 'Grizzly Bears', 'Mountain*5', 'Swamp*3'], hand: ["Chandra's Ignition", 'Murder'] },
      opp: { life: 20, bf: ['Serra Angel', 'Craw Wurm'] },
    }),
  ),
  preset(
    'Arachnogenesis: counts only creatures attacking you',
    board({
      you: { bf: ['Forest*3'], hand: ['Arachnogenesis'] },
      opp: [{ human: true, bf: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'] }, {}],
      turn: 0,
      step: 'begin-combat',
    }),
  ),
  preset(
    'Arachnogenesis: Spiders still deal combat damage',
    board({
      you: { bf: ['Forest*3'], hand: ['Arachnogenesis'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Hill Giant'] },
      turn: 0,
      step: 'begin-combat',
    }),
  ),
  preset(
    'Baloth Prime: enters tapped with six stun counters',
    board({ you: { bf: ['Forest*4'], hand: ['Baloth Prime'] } }),
  ),
  preset(
    'Baloth Prime: stun counters keep it tapped',
    board({ you: { bf: [{ name: 'Baloth Prime', tapped: true, counters: { stun: 1 } }] } }),
  ),
  preset(
    'Baloth Prime: sacrificing a land makes a Beast',
    board({ you: { bf: [{ name: 'Baloth Prime', tapped: true, counters: { stun: 6 } }, 'Forest*5'] } }),
  ),
  preset(
    'Pugnacious Hammerskull: a stun counter when attacking alone',
    board({ you: { bf: ['Pugnacious Hammerskull'] } }),
  ),
  preset(
    'Pugnacious Hammerskull: no counter beside another Dinosaur',
    board({ you: { bf: ['Pugnacious Hammerskull', 'Ancient Brontodon'] } }),
  ),
  preset(
    "Junk Winder: each token taps an opponent's permanent",
    board({
      you: { bf: ['Junk Winder', 'Plains*2'], hand: ['Raise the Alarm'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant', 'Serra Angel'] },
    }),
  ),
  preset(
    'Neriv, Crackling Vanguard: one card per token name',
    board({
      you: {
        bf: [{ name: 'Neriv, Crackling Vanguard', commander: true }, 'Goblin Token*2', 'Treasure Token', '4/4 Angel Token', '4/4 Vigilant Angel Token'],
      },
      opp: { bf: ['Food Token'] },
    }),
  ),
  preset(
    'Neriv, Crackling Vanguard: playable the turn it attacked',
    board({
      you: {
        bf: [{ name: 'Neriv, Crackling Vanguard', commander: true }, 'Goblin Token*2', 'Treasure Token', '4/4 Angel Token', 'Mountain*3'],
        lib: ['Lightning Bolt', 'Shock', 'Mountain'],
      },
    }),
  ),
  preset(
    'Neriv, Crackling Vanguard: next turn, only after a commander attacks',
    board({
      you: {
        bf: [{ name: 'Neriv, Crackling Vanguard', commander: true }, 'Goblin Token*2', 'Treasure Token', '4/4 Angel Token', 'Mountain*3'],
        lib: ['Lightning Bolt', 'Shock', 'Mountain'],
      },
    }),
  ),
  preset(
    "Neriv, Crackling Vanguard: a non-commander Neriv doesn't count",
    board({
      you: {
        bf: ['Neriv, Crackling Vanguard', { name: 'Krenko, Mob Boss', commander: true }, 'Goblin Token*2', 'Treasure Token', 'Mountain*3'],
        lib: ['Lightning Bolt', 'Shock'],
      },
    }),
  ),
  preset(
    'Neriv, Crackling Vanguard: your commander attacking unlocks them',
    board({
      you: {
        bf: ['Neriv, Crackling Vanguard', { name: 'Krenko, Mob Boss', commander: true }, 'Goblin Token*2', 'Treasure Token', 'Mountain*3'],
        lib: ['Lightning Bolt', 'Shock'],
      },
    }),
  ),
  preset(
    'Living Death: creatures swap between graveyard and battlefield',
    board({
      you: { bf: ['Swamp*5', 'Hill Giant'], hand: ['Living Death'], gy: ['Grizzly Bears'] },
      opp: { bf: ['Serra Angel'], gy: ['Craw Wurm', 'Island'] },
    }),
  ),
  preset(
    'Living Death: a card Rest in Peace exiled stays exiled',
    board({
      you: { bf: ['Swamp*5', 'Hill Giant'], hand: ['Living Death'], gy: ['Grizzly Bears'] },
      opp: { bf: ['Serra Angel', 'Rest in Peace'], gy: ['Craw Wurm', 'Island'] },
    }),
  ),
  // --- Exiling from the top of a library (2026-10-03, animation) --------
  preset(
    'Reckless Impulse: exiled cards peel off the library',
    board({
      you: { bf: ['Mountain*2'], hand: ['Reckless Impulse'] },
    }),
  ),
  preset(
    'Mystic Forge: the peel covers the revealed top card',
    board({
      you: { bf: ['Mystic Forge'] },
    }),
  ),
  preset(
    'Bloodbraid Elf: a cascade\'s exiles read as one run',
    board({
      you: { bf: ['Mountain*2', 'Forest*2'], hand: ['Bloodbraid Elf'], lib: ['Forest', 'Mountain', 'Island', 'Plains', 'Divination'] },
    }),
  ),
  preset(
    'Outrageous Robbery: cards peel off an opponent\'s library',
    board({
      you: { bf: ['Swamp*2', 'Mountain*3'], hand: ['Outrageous Robbery'] },
    }),
  ),
  preset(
    'Watcher for Tomorrow: the hidden card peels off the library',
    board({
      you: { bf: ['Island*2'], hand: ['Watcher for Tomorrow'] },
    }),
  ),
  preset(
    'Ulamog, the Ceaseless Hunger: twenty cards exiled from Bob\'s library',
    board({
      you: { bf: ['Ulamog, the Ceaseless Hunger'] },
    }),
  ),
  preset(
    'Pako, Arcane Retriever: every library\'s top card peels at once',
    board({
      you: { bf: ['Pako, Arcane Retriever'] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    'Reckless Impulse: with Reduce motion on, cards fade in place',
    board({
      you: { bf: ['Mountain*2'], hand: ['Reckless Impulse'] },
    }),
  ),
  preset(
    'Tribute to the World Tree: new Warriors join one tile',
    board({
      you: { bf: ['Warrior Token*10', 'Tribute to the World Tree', 'Plains*4'], hand: ['Secure the Wastes'] },
    }),
  ),
  preset(
    'Tribute to the World Tree: ten new Warriors end on one tile',
    board({
      you: { bf: ['Tribute to the World Tree', 'Plains*11'], hand: ['Secure the Wastes'] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    'Basri\'s Solidarity: one counter per token, counted per token',
    board({
      you: { bf: ['Warrior Token*10', 'Simic Ascendancy', 'Plains*2'], hand: ["Basri's Solidarity"] },
    }),
  ),
  preset(
    'Thalisse, Reverent Medium: one Spirit per token made this turn',
    board({
      you: { bf: ['Thalisse, Reverent Medium', 'Plains*4'], hand: ['Secure the Wastes'] },
    }),
  ),
  preset(
    'Trostani: populate offers only your creature tokens',
    board({
      you: { bf: ["Trostani, Selesnya's Voice", 'Elephant Token', 'Soldier Token', 'Forest*2', 'Plains*2'] },
      opp: { bf: ['Goblin Token'] },
    }),
  ),
  preset(
    'Trostani: populate with one kind of token asks nothing',
    board({
      you: { bf: ["Trostani, Selesnya's Voice", 'Soldier Token*2', 'Forest*2', 'Plains*2'] },
    }),
  ),
  preset(
    'Trostani: gain life equal to an entering creature\'s toughness',
    board({
      you: { bf: ["Trostani, Selesnya's Voice", 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Saruman: amass asks which Army gets the counters',
    board({
      you: {
        bf: ['Saruman, the White Hand', { name: 'Army Token', counters: { '+1/+1': 1 } }, 'Changeling Outcast', 'Island*3'],
        hand: ['Divination'],
      },
    }),
  ),
  preset(
    'Saruman: with one Army, amass asks nothing',
    board({
      you: { bf: ['Saruman, the White Hand', { name: 'Army Token', counters: { '+1/+1': 1 } }, 'Island*3'], hand: ['Divination'] },
    }),
  ),
  preset(
    'Saruman: a creature spell doesn\'t amass',
    board({
      you: { bf: ['Saruman, the White Hand', { name: 'Army Token', counters: { '+1/+1': 1 } }, 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Saruman: your Orc Army has ward {2}',
    board({
      you: { bf: ['Saruman, the White Hand', { name: 'Army Token', counters: { '+1/+1': 1 } }] },
      opp: { human: true, bf: ['Mountain*3'], hand: ['Shock'] },
      turn: 0,
    }),
  ),
  preset(
    'Wick: a Rat entering grows the Snail you pick',
    board({
      you: { bf: ['Wick, the Whorled Mind', 'Snail Token', { name: 'Snail Token', counters: { '+1/+1': 1 } }, 'Swamp'], hand: ['Muck Rats'] },
    }),
  ),
  preset(
    'Wick: a Rat entering with no Snail makes one',
    board({
      you: { bf: ['Wick, the Whorled Mind', 'Swamp'], hand: ['Muck Rats'] },
    }),
  ),
  preset(
    'Wick: sacrificing a 3-power Snail',
    board({
      you: { bf: ['Wick, the Whorled Mind', { name: 'Snail Token', counters: { '+1/+1': 2 } }, 'Island', 'Swamp', 'Mountain'] },
    }),
  ),
  preset(
    'Breena: an attack on the healthier opponent',
    board({
      you: { bf: ['Breena, the Demagogue', 'Hill Giant'] },
      opp: [{ human: true, life: 10, bf: ['Grizzly Bears'] }, { life: 20 }],
      turn: 0,
    }),
  ),
  preset(
    'Breena: no trigger when the attacked player has less life',
    board({
      you: { bf: ['Breena, the Demagogue', 'Hill Giant'] },
      opp: [{ human: true, life: 20, bf: ['Grizzly Bears'] }, { life: 10 }],
      turn: 0,
    }),
  ),
  preset(
    'Abdel Adrian: exile any number of your other nonland permanents',
    board({
      you: { bf: ['Sol Ring', 'Grizzly Bears', 'Plains*5'], hand: ["Abdel Adrian, Gorion's Ward"] },
    }),
  ),
  preset(
    'Abdel Adrian: exiled cards return when he leaves',
    board({
      you: { bf: ['Sol Ring', 'Grizzly Bears', 'Plains*5', 'Swamp*2'], hand: ["Abdel Adrian, Gorion's Ward", 'Doom Blade'] },
    }),
  ),
  preset(
    'Abdel Adrian: an exiled token never returns',
    board({
      you: { bf: ['Elephant Token', 'Plains*5', 'Swamp*2'], hand: ["Abdel Adrian, Gorion's Ward", 'Doom Blade'] },
    }),
  ),
  preset(
    'Ziatora: sacrificing a creature at your end step',
    board({
      you: { bf: ['Ziatora, the Incinerator', { name: 'Grizzly Bears', counters: { '+1/+1': 3 } }] },
      step: 'postcombat-main',
    }),
  ),
  preset(
    'Ziatora: not asked when it\'s your only creature',
    board({
      you: { bf: ['Ziatora, the Incinerator'] },
      step: 'postcombat-main',
    }),
  ),
  preset(
    'Felothar: sacrifice a nonland permanent for counters',
    board({
      you: { bf: ['Sol Ring', 'Grizzly Bears', 'Plains*2', 'Swamp*2', 'Forest*2'], hand: ['Felothar, Dawn of the Abzan'] },
    }),
  ),
  preset(
    'Caesar: sacrifice first, then choose two modes',
    board({
      you: { bf: ["Caesar, Legion's Emperor", 'Grizzly Bears', 'Mountain*5'] },
    }),
  ),
  preset(
    'Caesar: the new Soldiers attack and count for the damage',
    board({
      you: { bf: ["Caesar, Legion's Emperor", 'Grizzly Bears', 'Mountain*5'] },
    }),
  ),
  preset(
    'Caesar: with two opponents, the damage mode asks for a target',
    board({
      you: { bf: ["Caesar, Legion's Emperor", 'Grizzly Bears', 'Mountain*5'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Iron Man: sacrificing Sol Ring finds a 2-mana artifact',
    board({
      you: { bf: ['Iron Man, Titan of Innovation', 'Sol Ring'], lib: ['Grizzly Bears', 'Mind Stone', 'Forest'] },
    }),
  ),
  preset(
    'Iron Man: sacrificing the new Treasure',
    board({
      you: { bf: ['Iron Man, Titan of Innovation'], lib: ['Sol Ring', 'Mind Stone'] },
    }),
  ),
  preset(
    'Iron Man: declining the sacrifice',
    board({
      you: { bf: ['Iron Man, Titan of Innovation', 'Sol Ring'], lib: ['Grizzly Bears', 'Mind Stone', 'Forest'] },
    }),
  ),
  preset(
    'Eddie Brock: returns only a creature of mana value 1 or less',
    board({
      you: { bf: ['Swamp*2', 'Mountain'], hand: ['Eddie Brock'], gy: ['Llanowar Elves', 'Hill Giant'] },
    }),
  ),
  preset(
    'Eddie Brock: transforming into Venom',
    board({
      you: { bf: ['Eddie Brock', 'Swamp*2', 'Mountain*2', 'Forest*2'] },
    }),
  ),
  preset(
    'Venom: sacrificing Hill Giant draws four',
    board({
      you: { bf: ['Eddie Brock', 'Hill Giant', 'Swamp*2', 'Mountain*2', 'Forest*2'], hand: ['Grizzly Bears', 'Craw Wurm'] },
    }),
  ),
  preset(
    'Yuma: costs {1} less per land in your graveyard',
    board({
      you: { bf: ['Desert of the True', 'Mountain', 'Forest*2', 'Plains'], hand: ['Yuma, Proud Protector'], gy: ['Forest', 'Plains', 'Island'] },
    }),
  ),
  preset(
    'Yuma: sacrificing a Desert draws and makes a Plant',
    board({
      you: { bf: ['Desert of the True', 'Mountain', 'Forest*2', 'Plains'], hand: ['Yuma, Proud Protector'], gy: ['Forest', 'Plains', 'Island'] },
    }),
  ),
  preset(
    'Yuma: a milled Desert makes a Plant',
    board({
      you: { bf: ['Yuma, Proud Protector', 'Island'], hand: ['Thought Scour'], lib: ['Desert of the True', 'Forest'] },
    }),
  ),
  preset(
    'Yuma: a discarded Desert makes a Plant',
    board({
      you: { bf: ['Yuma, Proud Protector', 'Plains*2'], hand: ['Desert of the True'] },
    }),
  ),
  preset(
    'Bloodbraid Elf: cascade offers Kolaghan\'s Command\'s full cast',
    board({
      you: { bf: ['Mountain*2', 'Forest*2', 'Swamp'], hand: ['Bloodbraid Elf'], lib: ['Forest', "Kolaghan's Command"] },
      opp: { bf: ['Sol Ring', 'Grizzly Bears'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Bloodbraid Elf: cascade offers Orim\'s Chant kicked or not',
    board({
      you: { bf: ['Mountain*2', 'Forest*2', 'Plains'], hand: ['Bloodbraid Elf'], lib: ["Orim's Chant"] },
    }),
  ),
  preset(
    'Bloodbraid Elf: a card that can\'t be cast isn\'t offered',
    board({
      you: { bf: ['Mountain*2', 'Forest*2'], hand: ['Bloodbraid Elf'], lib: ['Murder'] },
    }),
  ),
  preset(
    'Rift Bolt: cast free from suspend',
    board({
      you: { bf: ['Mountain*2'], hand: ['Rift Bolt'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Rift Bolt: declining the suspend cast',
    board({
      you: { bf: ['Mountain*2'], hand: ['Rift Bolt'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Maelstrom Wanderer: two cascades, one after the other',
    board({
      you: { bf: ['Forest*3', 'Island*3', 'Mountain*3'], hand: ['Maelstrom Wanderer'], lib: ['Opt', 'Lightning Bolt', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'The First Sliver: Sliver spells cascade',
    board({
      you: { bf: ['The First Sliver', 'Forest*2'], hand: ['Metallic Sliver'], lib: ['Memnite'] },
    }),
  ),
  preset(
    'The First Sliver: a non-Sliver spell doesn\'t cascade',
    board({
      you: { bf: ['The First Sliver', 'Forest*2'], hand: ['Grizzly Bears'], lib: ['Memnite'] },
    }),
  ),
  preset(
    'Imoti: a spell of mana value 6 or more cascades',
    board({
      you: { bf: ['Imoti, Celebrant of Bounty', 'Forest*4', 'Island*4'], hand: ['Craw Wurm'], lib: ['Llanowar Elves'] },
    }),
  ),
  preset(
    'Imoti: a smaller spell doesn\'t cascade',
    board({
      you: { bf: ['Imoti, Celebrant of Bounty', 'Forest*4', 'Island*4'], hand: ['Grizzly Bears'], lib: ['Llanowar Elves'] },
    }),
  ),
  preset(
    'Zhulodok: a colorless 7+ spell from hand cascades twice',
    board({
      you: { bf: ['Zhulodok, Void Gorger', 'Wastes*10'], hand: ['Ulamog, the Ceaseless Hunger'], lib: ['Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Yidris: spells cast after combat damage gain cascade',
    board({
      you: { bf: ['Yidris, Maelstrom Wielder', 'Forest*2'], hand: ['Grizzly Bears'], lib: ['Llanowar Elves'] },
    }),
  ),
  preset(
    'Yidris: cascade stays after Yidris leaves',
    board({
      you: { bf: ['Yidris, Maelstrom Wielder', 'Island', 'Forest*2'], hand: ['Unsummon', 'Grizzly Bears'], lib: ['Memnite', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Yidris: no cascade next turn',
    board({
      you: { bf: ['Yidris, Maelstrom Wielder', 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Jodah: a legendary spell from hand finds a lesser legend',
    board({
      you: {
        bf: ['Jodah, the Unifier', 'Mountain*2', 'Plains*2'],
        hand: ['Krenko, Mob Boss'],
        lib: ['Forest', 'Mountain', 'Grizzly Bears', 'Isamaru, Hound of Konda', 'Island'],
      },
    }),
  ),
  preset(
    'Jodah: a declined card stays in exile',
    board({
      you: {
        bf: ['Jodah, the Unifier', 'Mountain*2', 'Plains*2'],
        hand: ['Krenko, Mob Boss'],
        lib: ['Forest', 'Mountain', 'Grizzly Bears', 'Isamaru, Hound of Konda', 'Island'],
      },
    }),
  ),
  preset(
    'Jodah: a nonlegendary spell doesn\'t trigger',
    board({
      you: { bf: ['Jodah, the Unifier', 'Forest*2'], hand: ['Grizzly Bears'], lib: ['Isamaru, Hound of Konda'] },
    }),
  ),
  preset(
    'Jodah: legendary creatures get +X/+X',
    board({
      you: { bf: ['Jodah, the Unifier', 'Isamaru, Hound of Konda'] },
    }),
  ),
  preset(
    'Zenith Festival: harmonize offers only your untapped creature',
    board({
      you: { bf: ['Mountain*3', 'Hill Giant', { name: 'Craw Wurm', tapped: true }], gy: ['Zenith Festival'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Zenith Festival: harmonize tapping Hill Giant at X = 4',
    board({
      you: { bf: ['Mountain*3', 'Hill Giant'], gy: ['Zenith Festival'] },
    }),
  ),
  preset(
    'Nature\'s Rhythm: harmonize searches for mana value X or less',
    board({
      you: { bf: ['Forest*7', 'Hill Giant'], gy: ["Nature's Rhythm"], lib: ['Craw Wurm', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Star Athlete: blitzed, it attacks and is sacrificed at end step',
    board({
      you: { bf: ['Mountain*4'], hand: ['Star Athlete'] },
    }),
  ),
  preset(
    'Star Athlete: the opponent sacrifices the target',
    board({
      you: { bf: ['Mountain*4'], hand: ['Star Athlete'] },
      opp: { human: true, bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Star Athlete: the opponent keeps the target',
    board({
      you: { bf: ['Mountain*4'], hand: ['Star Athlete'] },
      opp: { human: true, bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Star Athlete: cast normally, it has no haste and stays',
    board({
      you: { bf: ['Mountain*3'], hand: ['Star Athlete'] },
    }),
  ),
  preset(
    'Jaxis: copying another creature',
    board({
      you: { bf: ['Jaxis, the Troublemaker', 'Hill Giant', 'Mountain'], hand: ['Forest'] },
    }),
  ),
  preset(
    'Jaxis: blitz from the command zone',
    board({
      you: { cmd: ['Jaxis, the Troublemaker'], bf: ['Mountain*4'] },
    }),
  ),
  preset(
    'Henzie: only a creature of mana value 4+ gets blitz',
    board({
      you: { bf: ['Henzie "Toolbox" Torre', 'Forest*4', 'Mountain*4'], hand: ['Craw Wurm', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Henzie: blitz costs {1} less per commander cast',
    board({
      you: { cmd: ['Krenko, Mob Boss'], bf: ['Henzie "Toolbox" Torre', 'Forest*4', 'Mountain*4', 'Swamp*2'], hand: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Henzie: a blitzed creature',
    board({
      you: { bf: ['Henzie "Toolbox" Torre', 'Forest*4', 'Mountain*2'], hand: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Curse of Opulence: enchanting a player',
    board({
      you: { bf: ['Mountain'], hand: ['Curse of Opulence'] },
      opp: [{}, {}],
    }),
  ),
  preset(
    'Curse of Opulence: attacking the cursed player makes Gold',
    board({
      you: { bf: ['Mountain'], hand: ['Curse of Opulence'] },
      opp: [{ human: true, bf: ['Grizzly Bears*2'] }, {}],
    }),
  ),
  preset(
    'Gold token: sacrifice for mana',
    board({
      you: { bf: ['Gold Token'], hand: ['Opt'] },
    }),
  ),
  preset(
    'Curse of Opulence: attacking someone else doesn\'t trigger',
    board({
      you: { bf: ['Mountain'], hand: ['Curse of Opulence'] },
      opp: [{ human: true, bf: ['Grizzly Bears*2'] }, {}],
    }),
  ),
  preset(
    'Curse of Opulence: attacking only a planeswalker doesn\'t trigger',
    board({
      you: { bf: ['Mountain'], hand: ['Curse of Opulence'] },
      opp: [{ human: true, bf: ['Grizzly Bears*2'] }, { bf: ['Ajani, Caller of the Pride'] }],
    }),
  ),
  preset(
    'Curse of Verbosity: attacking the cursed player draws',
    board({
      you: { bf: ['Island*3'], hand: ['Curse of Verbosity'] },
      opp: [{ human: true, bf: ['Grizzly Bears*2'] }, {}],
    }),
  ),
  preset(
    'Curse of Bounty: attacking the cursed player untaps',
    board({
      you: { bf: ['Forest*2', { name: 'Mind Stone', tapped: true }], hand: ['Curse of Bounty'] },
      opp: [{ human: true, bf: ['Grizzly Bears*2'] }, {}],
    }),
  ),
  preset(
    'Curse of Disturbance: attacking the cursed player makes Zombies',
    board({
      you: { bf: ['Swamp*3'], hand: ['Curse of Disturbance'] },
      opp: [{ human: true, bf: ['Grizzly Bears*2'] }, {}],
    }),
  ),
  preset(
    'Trespasser\'s Curse: a creature entering under Bob drains him',
    board({
      you: { bf: ['Swamp*2'], hand: ["Trespasser's Curse"] },
      opp: { human: true, bf: ['Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Trespasser\'s Curse: your own creature does nothing',
    board({
      you: { bf: ['Swamp*2', 'Forest*2'], hand: ["Trespasser's Curse", 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Trespasser\'s Curse: Bob\'s noncreature permanent does nothing',
    board({
      you: { bf: ['Swamp*2'], hand: ["Trespasser's Curse"] },
      opp: { human: true, bf: ['Forest*2'], hand: ['Mind Stone'] },
    }),
  ),
  preset(
    'Archon of Falling Stars: a returned Curse asks for a player',
    board({
      you: { bf: ['Archon of Falling Stars', 'Swamp*3'], hand: ['Murder'], gy: ['Curse of Verbosity'] },
    }),
  ),
  preset(
    'Transforming Flourish: demonstrate puts two copies on the stack',
    board({
      you: { bf: ['Mountain*3', 'Runeclaw Bear'], hand: ['Transforming Flourish'], lib: ['Forest', 'Hill Giant'] },
      opp: [{ human: true, bf: ['Grizzly Bears'], lib: ['Forest', 'Lightning Bolt'] }, { bf: ['Hill Giant'], lib: ['Swamp', 'Grizzly Bears'] }],
    }),
  ),
  preset(
    'Transforming Flourish: each copy resolves for its own target',
    board({
      you: { bf: ['Mountain*3', 'Runeclaw Bear'], hand: ['Transforming Flourish'], lib: ['Forest', 'Hill Giant'] },
      opp: [{ human: true, bf: ['Grizzly Bears'], lib: ['Forest', 'Lightning Bolt'] }, { bf: ['Hill Giant'], lib: ['Swamp', 'Grizzly Bears'] }],
    }),
  ),
  preset(
    'Transforming Flourish: declining demonstrate makes no copies',
    board({
      you: { bf: ['Mountain*3'], hand: ['Transforming Flourish'] },
      opp: { bf: ['Grizzly Bears'], lib: ['Forest', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Creative Technique: revealed lands go to the bottom',
    board({
      you: { bf: ['Mountain*5'], hand: ['Creative Technique'], lib: ['Forest', 'Mountain', 'Hill Giant'] },
    }),
  ),
  preset(
    'Slaughter the Strong: picking creatures under the power cap',
    board({
      you: { bf: ['Plains*3', 'Hill Giant', 'Grizzly Bears', 'Llanowar Elves'], hand: ['Slaughter the Strong'] },
    }),
  ),
  preset(
    'Slaughter the Strong: each player chooses in turn',
    board({
      you: { bf: ['Plains*3', 'Hill Giant', 'Grizzly Bears', 'Llanowar Elves'], hand: ['Slaughter the Strong'] },
      opp: [{ human: true, bf: ['Serra Angel', 'Craw Wurm'] }, { bf: ['Shivan Dragon', 'Grizzly Bears*2'] }],
    }),
  ),
  preset(
    'Shadrix Silverquill: choose exactly two modes',
    board({
      you: { bf: ['Shadrix Silverquill', 'Grizzly Bears'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Shadrix Silverquill: "Choose none" removes the trigger',
    board({
      you: { bf: ['Shadrix Silverquill', 'Grizzly Bears'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Shadrix Silverquill: the two modes target different players',
    board({
      you: { bf: ['Shadrix Silverquill', 'Grizzly Bears'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Shadrix Silverquill: counters only on the chosen player\'s creatures',
    board({
      you: { bf: ['Shadrix Silverquill', 'Grizzly Bears'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Leyline Tyrant: red mana stays in your pool',
    board({
      you: { bf: ['Leyline Tyrant', 'Mountain*4', 'Forest*2'] },
    }),
  ),
  preset(
    'Leyline Tyrant: paying red mana as it dies',
    board({
      you: { bf: ['Leyline Tyrant', 'Mountain*4', 'Forest*2', 'Swamp*2'], hand: ['Murder'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Life from the Loam: dredge is offered before each draw',
    board({
      you: { bf: ['Island*3'], hand: ['Divination'], gy: ['Life from the Loam'] },
    }),
  ),
  preset(
    'Life from the Loam: no dredge with under three cards in library',
    board({
      you: { bf: ['Island*3'], hand: ['Divination'], gy: ['Life from the Loam'], lib: ['Island*2'] },
      opp: { lib: ['Mountain*40'] },
      fill: 0,
    }),
  ),
  preset(
    'Life from the Loam: dredge is offered at your draw step',
    board({
      you: { gy: ['Life from the Loam'] },
      step: 'upkeep',
    }),
  ),
  preset(
    'Deadpool: the exchange is asked as he enters',
    board({
      you: { bf: ['Swamp*2', 'Mountain*2', 'Soul Warden'], hand: ['Deadpool, Trading Card'] },
      opp: { bf: ['Serra Angel', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Deadpool: exchanging text boxes with Serra Angel',
    board({
      you: { bf: ['Swamp*2', 'Mountain*2'], hand: ['Deadpool, Trading Card'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Deadpool: Bob loses life at his upkeep',
    board({
      you: { bf: ['Swamp*2', 'Mountain*2'], hand: ['Deadpool, Trading Card'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Deadpool: Bob sacrifices the Angel to make you draw',
    board({
      you: { bf: ['Swamp*2', 'Mountain*2'], hand: ['Deadpool, Trading Card'] },
      opp: { human: true, bf: ['Serra Angel', 'Island*3'] },
    }),
  ),
  preset(
    'Reality Shift: your manifested creature, from your seat',
    board({
      you: { bf: ['Island*2', 'Grizzly Bears'], hand: ['Reality Shift'], lib: ['Elvish Visionary'] },
    }),
  ),
  preset(
    'Reality Shift: an opponent\'s manifest hides its name',
    board({
      you: { bf: ['Island*2'], hand: ['Reality Shift'] },
      opp: { bf: ['Grizzly Bears'], lib: ['Elvish Visionary'] },
    }),
  ),
  preset(
    'Reality Shift: turning a manifested creature face up',
    board({
      you: { bf: ['Island*2', 'Forest*2', 'Grizzly Bears'], hand: ['Reality Shift'], lib: ['Elvish Visionary'] },
    }),
  ),
  preset(
    'Reality Shift: a face-down creature is revealed as it dies',
    board({
      you: { bf: ['Island*2', 'Swamp*3', 'Grizzly Bears'], hand: ['Reality Shift', 'Murder'], lib: ['Elvish Visionary'] },
    }),
  ),
  preset(
    'Reality Shift: a face-down land can\'t be turned face up',
    board({
      you: { bf: ['Island*2', 'Forest*2', 'Grizzly Bears'], hand: ['Reality Shift'], lib: ['Forest'] },
    }),
  ),
  preset(
    'Ob Nixilis Reignited: Bob\'s emblem hurts him when he draws',
    board({
      you: { bf: [{ name: 'Ob Nixilis Reignited', counters: { loyalty: 8 } }] },
    }),
  ),
  preset(
    'Ob Nixilis Reignited: Bob loses life when you draw',
    board({
      you: { bf: [{ name: 'Ob Nixilis Reignited', counters: { loyalty: 8 } }, 'Island*3'], hand: ['Divination'] },
    }),
  ),
  preset(
    'Koth: the emblem deals 4 when a Mountain enters',
    board({
      you: { bf: [{ name: 'Koth, Fire of Resistance', counters: { loyalty: 7 } }], hand: ['Mountain'] },
    }),
  ),
  preset(
    'Liliana: Zombies castable from your graveyard',
    board({
      you: { bf: ['Liliana, Untouched by Death', 'Swamp*4'], gy: ['Diregraf Ghoul', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Liliana: a Zombie that reaches the graveyard later is castable too',
    board({
      you: { bf: ['Liliana, Untouched by Death', 'Swamp*4'], hand: ['Diregraf Ghoul', 'Village Rites'] },
    }),
  ),
  preset(
    'Liliana: the permission ends with the turn',
    board({
      you: { bf: ['Liliana, Untouched by Death', 'Swamp*4'], gy: ['Diregraf Ghoul'] },
    }),
  ),
  preset(
    'Cultivator\'s Caravan: crew counts total power',
    board({
      you: { bf: ["Cultivator's Caravan", 'Grizzly Bears', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Smuggler\'s Copter: a summoning-sick creature can crew',
    board({
      you: { bf: ["Smuggler's Copter", { name: 'Hill Giant', sick: true }], lib: ['Island*3'] },
    }),
  ),
  preset(
    'Kotori: Vehicles get crew 2',
    board({
      you: { bf: ["Smuggler's Copter", "Cultivator's Caravan", 'Kotori, Pilot Prodigy', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Smuggler\'s Copter: a crewed Vehicle reverts next turn',
    board({
      you: { bf: ["Smuggler's Copter", 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Claim the Precious: choosing a Ring-bearer',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Swamp*3'], hand: ['Claim the Precious'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'Birthday Escape: a second temptation moves the Ring',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Swamp*3', 'Island'], hand: ['Claim the Precious', 'Birthday Escape'], lib: ['Island*4'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'The Ring: a twice-tempted Ring-bearer loots as it attacks',
    board({
      you: { bf: ['Grizzly Bears', 'Swamp*3', 'Island'], hand: ['Claim the Precious', 'Birthday Escape'], lib: ['Island*4'] },
      opp: { bf: ['Serra Angel'] },
    }),
  ),
  preset(
    'The Ring: no blocks from greater power',
    board({
      you: { bf: ['Grizzly Bears', 'Swamp*3'], hand: ['Claim the Precious'] },
      opp: { human: true, bf: ['Serra Angel', 'Llanowar Elves', 'Hill Giant'] },
    }),
  ),
  preset(
    'Clown Car: rolling four dice',
    board({
      you: { bf: ['Wastes*4'], hand: ['Clown Car'] },
    }),
  ),
  preset(
    'Brazen Dwarf: one damage for the whole roll',
    board({
      you: { bf: ['Brazen Dwarf', 'Wastes*4'], hand: ['Clown Car'] },
    }),
  ),
  preset(
    'Hoarding Ogre: Treasures by the d20 table',
    board({
      you: { bf: ['Hoarding Ogre'] },
    }),
  ),
  preset(
    'Ancient Copper Dragon: Treasures equal to the d20',
    board({
      you: { bf: ['Ancient Copper Dragon'] },
    }),
  ),
  preset(
    'Clown Car: with Reduce motion on, dice appear in place',
    board({
      you: { bf: ['Wastes*2'], hand: ['Clown Car'] },
    }),
  ),
  preset(
    'Isochron Scepter: each activation casts a free Bolt',
    board({
      you: { bf: ['Island*2', 'Wastes*2'], hand: ['Isochron Scepter', 'Lightning Bolt'] },
    }),
  ),
  preset(
    'Mnemonic Deluge: three copies, one declined',
    board({
      you: { bf: ['Island*9'], hand: ['Mnemonic Deluge'], lib: ['Island*6'] },
      opp: { gy: ['Divination'] },
    }),
  ),
  preset(
    'Narset: a copy of Sol Ring becomes a token',
    board({
      you: { bf: ['Narset, Enlightened Exile'] },
      opp: { gy: ['Sol Ring'] },
    }),
  ),
  preset(
    'Ninja of the Deep Hours: no ninjutsu before blockers',
    board({
      you: { bf: ['Grizzly Bears', 'Island*2'], hand: ['Ninja of the Deep Hours'] },
    }),
  ),
  preset(
    'Ninja of the Deep Hours: only an unblocked attacker returns',
    board({
      you: { bf: ['Grizzly Bears', 'Llanowar Elves', 'Island*2'], hand: ['Ninja of the Deep Hours'] },
      opp: { human: true, bf: ['Drift of Phantasms'] },
    }),
  ),
  preset(
    'Ninja of the Deep Hours: two unblocked attackers, you choose',
    board({
      you: { bf: ['Grizzly Bears', 'Llanowar Elves', 'Island*2'], hand: ['Ninja of the Deep Hours'] },
    }),
  ),
  preset(
    'Yuriko: commander ninjutsu from the command zone',
    board({
      you: { bf: ['Grizzly Bears', 'Island', 'Swamp'], cmd: ["Yuriko, the Tiger's Shadow"], lib: ['Hill Giant', 'Island*4'] },
    }),
  ),
  preset(
    'Unholy Annex: a locked Room on the board',
    board({
      you: { bf: ['Unholy Annex // Ritual Chamber', 'Swamp*3'] },
    }),
  ),
  preset(
    'Unholy Annex: unlocking a door',
    board({
      you: { bf: ['Unholy Annex // Ritual Chamber', 'Swamp*3'] },
    }),
  ),
  preset(
    'Unholy Annex: no unlocking during combat',
    board({
      you: { bf: ['Unholy Annex // Ritual Chamber', 'Grizzly Bears', 'Swamp*3'] },
    }),
  ),
  preset(
    'Bottomless Pool: two ways to cast a Room',
    board({
      you: { bf: ['Island*5'], hand: ['Bottomless Pool // Locker Room'] },
    }),
  ),
  preset(
    'Bottomless Pool: its unlock trigger fires as it enters',
    board({
      you: { bf: ['Island'], hand: ['Bottomless Pool // Locker Room'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Ritual Chamber: unlocking makes a Demon',
    board({
      you: { bf: ['Unholy Annex // Ritual Chamber', 'Swamp*5'] },
    }),
  ),
  preset(
    'Unholy Annex: without a Demon it costs you life',
    board({
      you: { bf: ['Unholy Annex // Ritual Chamber', 'Swamp*3'] },
    }),
  ),
  preset(
    'Unholy Annex: with a Demon it drains',
    board({
      you: { bf: ['Unholy Annex // Ritual Chamber', 'Swamp*8'] },
    }),
  ),
  preset(
    'Paladin Class: starts at level 1',
    board({
      you: { bf: ['Paladin Class', 'Grizzly Bears', 'Llanowar Elves', 'Plains*8'] },
    }),
  ),
  preset(
    'Paladin Class: gaining level 2',
    board({
      you: { bf: ['Paladin Class', 'Grizzly Bears', 'Llanowar Elves', 'Plains*3'] },
    }),
  ),
  preset(
    'Paladin Class: no levelling during combat',
    board({
      you: { bf: ['Paladin Class', 'Grizzly Bears', 'Plains*3'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Paladin Class: level 3\'s attack trigger',
    board({
      you: { bf: ['Paladin Class', 'Grizzly Bears', 'Llanowar Elves', 'Plains*8'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  // --- Morph, disguise and manifest dread (2026-10-10) --------
  preset(
    'Den Protector: cast face up or face down',
    board({
      you: { bf: ['Forest*3'], hand: ['Den Protector'] },
    }),
  ),
  preset(
    "Den Protector: a face-down card's name is hidden from Bob",
    board({
      you: { bf: ['Forest*3'], hand: ['Den Protector'] },
      opp: { bf: ['Hill Giant'], human: true },
    }),
  ),
  preset(
    'Trail of Mystery: a face-down creature finds a basic land',
    board({
      you: { bf: ['Trail of Mystery', 'Forest*3'], hand: ['Den Protector'], lib: ['Forest', 'Island*6'] },
    }),
  ),
  preset(
    'Den Protector: turned face up only for its megamorph cost',
    board({
      you: { bf: ['Forest*5'], hand: ['Den Protector'] },
    }),
  ),
  preset(
    'Den Protector: turned face up with Trail of Mystery',
    board({
      you: { bf: ['Trail of Mystery', 'Forest*5'], hand: ['Den Protector'], gy: ['Grizzly Bears'], lib: ['Forest', 'Island*6'] },
    }),
  ),
  preset(
    'Arno Dorian: face down with disguise shows ward {2}',
    board({
      you: { bf: ['Swamp', 'Mountain*2'], hand: ['Arno Dorian'] },
    }),
  ),
  preset(
    'Arno Dorian: turned face up for its disguise cost',
    board({
      you: { bf: ['Swamp*2', 'Mountain*3'], hand: ['Arno Dorian'] },
    }),
  ),
  preset(
    'Unwanted Remake: the creature\'s controller manifests dread',
    board({
      you: { bf: ['Plains'], hand: ['Unwanted Remake'] },
      opp: { bf: ['Hill Giant'], lib: ['Craw Wurm', 'Hill Giant', 'Island*4'] },
    }),
  ),
  preset(
    'They Came from the Pipes: manifest dread twice',
    board({
      you: {
        bf: ['Island*5'],
        hand: ['They Came from the Pipes'],
        lib: ['Craw Wurm', 'Hill Giant', 'Grizzly Bears', 'Centaur Courser', 'Island*4'],
      },
    }),
  ),
  preset(
    'Way of the Pyromancer: a Jace token, and +1: Add {R} for planeswalkers',
    board({
      you: { bf: ['Chandra, Torch of Defiance', 'Mountain*2'], hand: ['Way of the Pyromancer'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Way of the Pyromancer: the granted +1: Add {R} uses the stack',
    board({
      you: { bf: ['Mountain*2'], hand: ['Way of the Pyromancer', 'Lightning Bolt'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Way of the Pyromancer: one loyalty ability per planeswalker a turn',
    board({
      you: { bf: ['Chandra, Torch of Defiance', 'Mountain*2'], hand: ['Way of the Pyromancer'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Studious First-Year: casting its prepared Rampant Growth',
    board({
      you: { bf: ['Studious First-Year', 'Forest*2'], lib: ['Forest', 'Forest', 'Island'] },
    }),
  ),
  preset(
    'Carnivorous Cultivator: enters prepared',
    board({
      you: { bf: ['Forest*3'], hand: ['Carnivorous Cultivator'], lib: ['Forest', 'Forest', 'Island'] },
    }),
  ),
  preset(
    "Studious First-Year: no prepared cast on Bob's turn",
    board({
      you: { bf: ['Studious First-Year', 'Forest*2'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
      turn: 0,
      step: 'precombat-main',
    }),
  ),
  preset(
    'Raphael, the Nightwatcher: no sneak cast before blockers',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*3', 'Swamp'], hand: ['Raphael, the Nightwatcher', "Shredder's Technique"] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Raphael, the Nightwatcher: sneak cast returns the attacker',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*3'], hand: ['Raphael, the Nightwatcher'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    "Shredder's Technique: a sneak sorcery in the declare blockers step",
    board({
      you: { bf: ['Grizzly Bears', 'Swamp'], hand: ["Shredder's Technique"] },
      opp: { bf: ['Glorious Anthem', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Raphael, the Nightwatcher: attacks whoever the returned creature did',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*3'], hand: ['Raphael, the Nightwatcher'] },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    'HULK SMASH!: teamwork needs total power 4',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Mountain*2'], hand: ['HULK SMASH!'] },
      opp: { bf: ['Grizzly Bears', 'Sol Ring', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'HULK SMASH!: with teamwork, both modes',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Mountain*2'], hand: ['HULK SMASH!'] },
      opp: { bf: ['Grizzly Bears', 'Sol Ring', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Too Evil to Stay Dead: without teamwork, only mana value 4 or less',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Swamp*3'], hand: ['Too Evil to Stay Dead'], gy: ['Craw Wurm', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Too Evil to Stay Dead: with teamwork, any creature card',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Swamp*3'], hand: ['Too Evil to Stay Dead'], gy: ['Craw Wurm'] },
    }),
  ),
  preset(
    "Fíli the Pathfinder: two of three isn't an enduring story",
    board({
      you: { bf: ['Fíli the Pathfinder', 'Plains'], hand: ['Sol Ring'] },
    }),
  ),
  preset(
    'Fíli the Pathfinder: the third makes an enduring story',
    board({
      you: { bf: ['Fíli the Pathfinder', 'Mountain*2', 'Plains*3'], hand: ['Sol Ring', 'Bifur, Melodic Rider'] },
    }),
  ),
  preset(
    "Bifur, Melodic Rider: Fíli's Dwarf trigger happens twice",
    board({
      you: { bf: ['Fíli the Pathfinder', 'Mountain*4', 'Plains*4'], hand: ['Sol Ring', 'Bifur, Melodic Rider', "Dáin's Company"] },
    }),
  ),
  preset(
    'Fíli the Pathfinder: the enduring story stays',
    board({
      you: { bf: ['Fíli the Pathfinder', 'Mountain*2', 'Plains*3', 'Island'], hand: ['Sol Ring', 'Bifur, Melodic Rider', 'Unsummon'] },
    }),
  ),
  preset(
    'Gristle Glutton: blight 1 as part of its cost',
    board({
      you: { bf: ['Gristle Glutton', 'Grizzly Bears', 'Hill Giant'], hand: ['Forest'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    "Bogslither's Embrace: blight 1 or pay {3}",
    board({
      you: { bf: ['Grizzly Bears', 'Swamp*5'], hand: ["Bogslither's Embrace"] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Burning Curiosity: blighting exiles three cards',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*3'], hand: ['Burning Curiosity'] },
    }),
  ),
  preset(
    'Burning Curiosity: no blight version without a creature',
    board({
      you: { bf: ['Mountain*3'], hand: ['Burning Curiosity'] },
    }),
  ),
  preset(
    'High Perfect Morcant: each opponent blights their own creature',
    board({
      you: { bf: ['Grizzly Bears', 'Swamp*2', 'Forest*2'], hand: ['High Perfect Morcant'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Champion of the Weird: behold a Goblin from hand or battlefield',
    board({
      you: { bf: ['Gristle Glutton', 'Swamp*4'], hand: ['Champion of the Weird', 'Gristle Glutton'] },
    }),
  ),
  preset(
    'Champion of the Weird: the beheld card comes back when it leaves',
    board({
      you: { bf: ['Swamp*4', 'Island'], hand: ['Champion of the Weird', 'Gristle Glutton', 'Unsummon'] },
    }),
  ),
  preset(
    'Lys Alana Dignitary: behold an Elf from your hand',
    board({
      you: { bf: ['Forest*4'], hand: ['Lys Alana Dignitary', 'Llanowar Elves'] },
    }),
  ),
  preset(
    'Lys Alana Dignitary: Bob sees only the card revealed',
    board({
      you: { bf: ['Forest*4'], hand: ['Lys Alana Dignitary', 'Llanowar Elves', 'High Perfect Morcant'] },
      opp: { human: true },
    }),
  ),
  preset(
    "Theorist's Sanctum: behold a Jace to enter untapped",
    board({
      you: { hand: ["Theorist's Sanctum", 'Jace Beleren'] },
    }),
  ),
  preset(
    "Theorist's Sanctum: no Jace beheld, enters tapped",
    board({
      you: { hand: ["Theorist's Sanctum", 'Jace Beleren'] },
    }),
  ),
  preset(
    'Scarlet Spider, Ben Reilly: web-slinging offers only tapped creatures',
    board({
      you: {
        bf: [{ name: 'Hill Giant', tapped: true }, { name: 'Grizzly Bears', tapped: true }, 'Llanowar Elves', 'Mountain', 'Forest*2'],
        hand: ['Scarlet Spider, Ben Reilly'],
      },
    }),
  ),
  preset(
    'Scarlet Spider, Ben Reilly: web-slinging gives counters',
    board({
      you: { bf: [{ name: 'Hill Giant', tapped: true }, 'Mountain', 'Forest'], hand: ['Scarlet Spider, Ben Reilly'] },
    }),
  ),
  preset(
    'Scarlet Spider, Ben Reilly: cast normally, no counters',
    board({
      you: { bf: [{ name: 'Hill Giant', tapped: true }, 'Mountain', 'Forest*2'], hand: ['Scarlet Spider, Ben Reilly'] },
    }),
  ),
  preset(
    'Spiders-Man, Heroic Horde: web-slinging gives life and Spiders',
    board({
      you: { bf: [{ name: 'Grizzly Bears', tapped: true }, 'Forest*6'], hand: ['Spiders-Man, Heroic Horde'] },
    }),
  ),
  preset(
    'Spiders-Man, Heroic Horde: cast normally, no bonus',
    board({
      you: { bf: [{ name: 'Grizzly Bears', tapped: true }, 'Forest*2'], hand: ['Spiders-Man, Heroic Horde'] },
    }),
  ),
  preset(
    'Geyser Leaper: paying waterbend by tapping artifacts and creatures',
    board({
      you: { bf: ['Geyser Leaper', 'Ornithopter', 'Sol Ring', 'Grizzly Bears', 'Island*4'] },
      opp: { bf: ['Hill Giant', 'Grizzly Bears', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Water Whip: waterbend {5} with lands and taps',
    board({
      you: { bf: ['Ornithopter', 'Sol Ring', 'Grizzly Bears', 'Island*4'], hand: ['Water Whip'] },
      opp: { bf: ['Hill Giant', 'Grizzly Bears', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Airbending Lesson: the owner may cast it from exile for {2}',
    board({
      you: { bf: ['Plains*3'], hand: ['Airbending Lesson'] },
      opp: { bf: ['Craw Wurm', 'Island', 'Swamp', 'Mountain'], human: true },
    }),
  ),
  preset(
    "Avatar's Wrath: airbends every creature but the chosen one",
    board({
      you: { bf: ['Grizzly Bears', 'Plains*4'], hand: ["Avatar's Wrath"] },
      opp: { bf: ['Hill Giant', 'Island', 'Swamp', 'Mountain'] },
    }),
  ),
  preset(
    "Avatar's Wrath: no casting from exile until your next turn",
    board({
      you: { bf: ['Grizzly Bears', 'Plains*4'], hand: ["Avatar's Wrath"] },
      opp: { bf: ['Hill Giant', 'Island', 'Swamp', 'Mountain'], human: true },
    }),
  ),
  preset(
    'Walking Sarcophagus: start your engines shows speed 1',
    board({
      you: { bf: ['Walking Sarcophagus', 'Swamp', 'Mountain'], hand: ['Gastal Thrillseeker'] },
      opp: { bf: ['Plains', 'Island', 'Forest'] },
    }),
  ),
  preset(
    'Gastal Thrillseeker: speed rises only once a turn',
    board({
      you: { bf: ['Walking Sarcophagus', 'Swamp', 'Mountain'], hand: ['Gastal Thrillseeker'] },
      opp: { bf: ['Plains', 'Island', 'Forest'] },
    }),
  ),
  preset(
    'Walking Sarcophagus: max speed',
    board({
      you: { bf: ['Walking Sarcophagus', 'Swamp', 'Mountain'], hand: ['Gastal Thrillseeker'] },
      opp: { bf: ['Plains', 'Island', 'Forest'] },
    }),
  ),
  preset(
    'Venomsac Lagac: saddle needs total power 2',
    board({
      you: { bf: ['Venomsac Lagac', { name: 'Grizzly Bears', sick: true }, 'Llanowar Elves', 'Forest'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Venomsac Lagac: saddled, it gets +0/+3 attacking',
    board({
      you: { bf: ['Venomsac Lagac', { name: 'Grizzly Bears', sick: true }, 'Forest'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    "Venomsac Lagac: no saddling on Bob's turn",
    board({
      you: { bf: ['Venomsac Lagac', 'Grizzly Bears', 'Forest'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
      turn: 0,
      step: 'precombat-main',
    }),
  ),
  preset(
    'Reckoner Bankbuster: what each creature crews for',
    board({
      you: { bf: ['Reckoner Bankbuster', 'Hotshot Mechanic', 'Giant Ox', 'Grizzly Bears', 'Island*3'] },
    }),
  ),
  preset(
    'Hotshot Mechanic: crews Crew 3 alone, power still 2',
    board({
      you: { bf: ['Reckoner Bankbuster', 'Hotshot Mechanic', 'Island*3'] },
    }),
  ),
  preset(
    'Giant Ox: crews with its toughness',
    board({
      you: { bf: ['Reckoner Bankbuster', 'Giant Ox', 'Island*3'] },
    }),
  ),
  preset(
    'Forgotten Ancient: moving its counters at upkeep',
    board({
      you: { bf: [{ name: 'Forgotten Ancient', counters: { '+1/+1': 3 } }, 'Grizzly Bears', 'Llanowar Elves', 'Forest*2'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
      turn: 0,
      step: 'end',
    }),
  ),
  preset(
    'Nesting Grounds: choosing which kind of counter to move',
    board({
      you: { bf: [{ name: 'Hill Giant', counters: { '+1/+1': 1, flying: 1 } }, 'Grizzly Bears', 'Nesting Grounds', 'Forest'] },
    }),
  ),
  preset(
    'Mirage Mirror: a copy until end of turn',
    board({
      you: { bf: ['Mirage Mirror', 'Island*2'] },
      opp: { bf: ['Hill Giant', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Silent Hallcreeper: a mode can\'t be chosen twice',
    board({
      you: { bf: ['Silent Hallcreeper', 'Island*2'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Silent Hallcreeper: becomes a copy for good',
    board({
      you: { bf: ['Silent Hallcreeper', 'Craw Wurm', 'Island*2'] },
      opp: { bf: ['Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Haystack: a phased-out creature and its Equipment',
    board({
      you: { bf: ['Haystack', 'Grizzly Bears', { name: 'Bonesplitter', attach: 'Grizzly Bears' }, 'Plains*2'] },
    }),
  ),
  preset(
    'Haystack: the creature phases back in on your next turn',
    board({
      you: { bf: ['Haystack', 'Grizzly Bears', { name: 'Bonesplitter', attach: 'Grizzly Bears' }, 'Plains*2'] },
    }),
  ),
  preset(
    'Oubliette: the creature stays phased out',
    board({
      you: { bf: ['Swamp*3'], hand: ['Oubliette'] },
      opp: { bf: ['Craw Wurm', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Oubliette: the creature returns tapped when it leaves',
    board({
      you: { bf: ['Swamp*3', 'Plains*2'], hand: ['Oubliette', 'Disenchant'] },
      opp: { bf: ['Craw Wurm', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    "Teferi's Protection: everything you control phases out",
    board({
      you: { bf: ['Haystack', 'Grizzly Bears', 'Hill Giant', 'Plains*3'], hand: ["Teferi's Protection"] },
      opp: { bf: ['Craw Wurm', 'Plains', 'Island', 'Swamp'] },
    }),
  ),
  preset(
    'Nylea, God of the Hunt: not a creature below five devotion',
    board({
      you: { bf: ['Nylea, God of the Hunt', 'Forest*5'] },
    }),
  ),
  preset(
    'Nylea, God of the Hunt: a creature at five devotion',
    board({
      you: { bf: ['Nylea, God of the Hunt', 'Forest*5'], hand: ['Grizzly Bears', 'Leatherback Baloth'] },
    }),
  ),
  preset(
    'Nylea, God of the Hunt: trample even while not a creature',
    board({
      you: { bf: ['Nylea, God of the Hunt', 'Forest*2'], hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Bolt Bend: changing a spell\'s single target',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*5'], hand: ['Lightning Bolt', 'Bolt Bend'] },
      opp: { bf: ['Hill Giant', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Wild Ricochet: new targets, then a copy',
    board({
      you: { bf: ['Grizzly Bears', 'Mountain*5'], hand: ['Lightning Bolt', 'Wild Ricochet'] },
      opp: { bf: ['Hill Giant', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Spellskite: redirects a spell without asking',
    board({
      you: { bf: ['Spellskite', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Duress: choosing from Bob\'s whole hand',
    board({
      you: { bf: ['Swamp'], hand: ['Duress'] },
      opp: { hand: ['Lightning Bolt', 'Grizzly Bears', 'Forest', 'Counterspell'] },
    }),
  ),
  preset(
    'Thoughtseize: any nonland card, and you lose 2',
    board({
      you: { bf: ['Swamp'], hand: ['Thoughtseize'] },
      opp: { hand: ['Lightning Bolt', 'Grizzly Bears', 'Forest', 'Counterspell'] },
    }),
  ),
  preset(
    'Oildeep Gearhulk: look at a hand and decline',
    board({
      you: { bf: ['Swamp*2', 'Island*2'], hand: ['Oildeep Gearhulk'] },
      opp: { hand: ['Lightning Bolt', 'Grizzly Bears', 'Forest', 'Counterspell'] },
    }),
  ),
  preset(
    'Overlord of the Mistmoors: cast for impending',
    board({
      you: { bf: ['Soul Warden', 'Plains*4'], hand: ['Overlord of the Mistmoors'] },
    }),
  ),
  preset(
    'Overlord of the Boilerbilges: impending, and 4 damage',
    board({
      you: { bf: ['Mountain*4'], hand: ['Overlord of the Boilerbilges'] },
    }),
  ),
  preset(
    'Overlord of the Mistmoors: loses a time counter at your end step',
    board({
      you: { bf: ['Plains*4'], hand: ['Overlord of the Mistmoors'] },
    }),
  ),
  preset(
    'Overlord of the Mistmoors: Impending reminder on hover',
    board({
      you: { bf: ['Plains*4'], hand: ['Overlord of the Mistmoors'] },
    }),
  ),
  preset(
    'Heartfire Hero: valiant only the first time each turn',
    board({
      you: { bf: ['Heartfire Hero', 'Forest*2'], hand: ['Giant Growth*2'] },
    }),
  ),
  preset(
    'Eagle Vision: freerunning after an Assassin\'s combat damage',
    board({
      you: { bf: ['Agate-Blade Assassin', 'Island*2'], hand: ['Eagle Vision'] },
    }),
  ),
  preset(
    'Eagle Vision: Freerunning reminder on hover',
    board({
      you: { bf: ['Island*2'], hand: ['Eagle Vision'] },
    }),
  ),
  preset(
    'Treetop Sentries: forage by exiling three cards',
    board({
      you: { bf: ['Food Token', 'Forest*4'], hand: ['Treetop Sentries'], gy: ['Grizzly Bears*3'] },
    }),
  ),
  preset(
    'Treetop Sentries: forage by sacrificing a Food',
    board({
      you: { bf: ['Food Token', 'Forest*4'], hand: ['Treetop Sentries'], gy: ['Grizzly Bears*3'] },
    }),
  ),
  preset(
    'Treetop Sentries: declining to forage draws nothing',
    board({
      you: { bf: ['Food Token', 'Forest*4'], hand: ['Treetop Sentries'], gy: ['Grizzly Bears*3'] },
    }),
  ),
  preset(
    'Treetop Sentries: forage reminder on hover',
    board({
      you: { bf: ['Forest*4'], hand: ['Treetop Sentries'] },
    }),
  ),
  preset(
    'Depth Defiler: kicked, its cast trigger takes both modes',
    board({
      you: { bf: ['Island*5', 'Wastes'], hand: ['Depth Defiler'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Depth Defiler: unkicked, exactly one mode',
    board({
      you: { bf: ['Island*5'], hand: ['Depth Defiler'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Silverquill Lecturer: demonstrate copies for you and Bob',
    board({
      you: { bf: ['Silverquill Lecturer', 'Island*5', 'Wastes'], hand: ['Depth Defiler'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'The One Ring: you can\'t be targeted until your next turn',
    board({
      you: { bf: ['Plains*4'], hand: ['The One Ring'] },
      opp: { bf: ['Mountain*2'], hand: ['Lightning Bolt'], human: true },
    }),
  ),
  preset(
    'The One Ring: damage to you is prevented',
    board({
      you: { bf: ['Plains*4'], hand: ['The One Ring'] },
      opp: { bf: ['Grizzly Bears', 'Mountain*2'], human: true },
    }),
  ),
  preset(
    'The Wandering Emperor: instant speed on the turn she enters',
    board({
      you: { bf: ['Plains*4'], hand: ['The Wandering Emperor'] },
      opp: { bf: ['Grizzly Bears', 'Mountain*2'] },
    }),
  ),
  preset(
    'The Wandering Emperor: back to sorcery speed on your turn',
    board({
      you: { bf: ['Plains*4'], hand: ['The Wandering Emperor'] },
      opp: { bf: ['Grizzly Bears', 'Mountain*2'] },
    }),
  ),
  preset(
    'The One Ring: burden counters draw, then cost life',
    board({
      you: { bf: ['The One Ring', 'Plains*4'] },
    }),
  ),
  preset(
    'Aloe Alchemist: Plot only in your main phase',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*2'], hand: ['Aloe Alchemist'] },
    }),
  ),
  preset(
    'Aloe Alchemist: plotting it triggers',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*2'], hand: ['Aloe Alchemist'] },
    }),
  ),
  preset(
    'Longhorn Sharpshooter: plotting it deals 2 damage',
    board({
      you: { bf: ['Mountain*4'], hand: ['Longhorn Sharpshooter'] },
      opp: { life: 20 },
    }),
  ),
  preset(
    'Aloe Alchemist: Bob sees the plotted card',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*2'], hand: ['Aloe Alchemist'] },
      opp: { human: true },
    }),
  ),
  preset(
    'Aloe Alchemist: not castable from plot the same turn',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*2'], hand: ['Aloe Alchemist'] },
    }),
  ),
  preset(
    'Aloe Alchemist: cast free from plot on a later turn',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*2'], hand: ['Aloe Alchemist'] },
    }),
  ),
  preset(
    'Slickshot Vault-Buster: targeting yourself isn\'t a crime',
    board({
      you: { bf: ['Slickshot Vault-Buster', 'Mountain'], hand: ['Lightning Bolt'] },
    }),
  ),
  preset(
    'Slickshot Vault-Buster: targeting an opponent\'s creature is a crime',
    board({
      you: { bf: ['Slickshot Vault-Buster', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Patrolling Peacemaker: your own crime doesn\'t trigger it',
    board({
      you: { bf: [{ name: 'Patrolling Peacemaker', counters: { '+1/+1': 2 } }, 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Patrolling Peacemaker: one opponent\'s crime against another',
    board({
      you: { bf: [{ name: 'Patrolling Peacemaker', counters: { '+1/+1': 2 } }] },
      opp: [{ bf: ['Mountain'], hand: ['Lightning Bolt'], human: true }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Powder Ganger: one squad cast per number of payments',
    board({
      you: { bf: ['Mountain*7'], hand: ['Powder Ganger'] },
      opp: { bf: ['Mind Stone'] },
    }),
  ),
  preset(
    'Powder Ganger: squad twice makes two copies',
    board({
      you: { bf: ['Mountain*7'], hand: ['Powder Ganger'] },
      opp: { bf: ['Mind Stone'] },
    }),
  ),
  preset(
    'Contaminated Drink: rad counters mill at your precombat main',
    board({
      you: {
        bf: ['Island*2', 'Swamp*2', 'Mountain'],
        hand: ['Contaminated Drink'],
        lib: ['Island*4', 'Grizzly Bears', 'Hill Giant'],
      },
    }),
  ),
  preset(
    'Crimestopper Sprite: collect evidence needs a total of 6',
    board({
      you: { bf: ['Island*3'], hand: ['Crimestopper Sprite'], gy: ['Hill Giant', 'Grizzly Bears*2'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Crimestopper Sprite: no collecting cast below 6',
    board({
      you: { bf: ['Island*3'], hand: ['Crimestopper Sprite'], gy: ['Grizzly Bears*2'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Surveillance Monitor: declining collect evidence makes no Thopter',
    board({
      you: { bf: ['Island*4'], hand: ['Surveillance Monitor'], gy: ['Hill Giant', 'Grizzly Bears*2'] },
    }),
  ),
  preset(
    'Surveillance Monitor: collecting evidence makes a Thopter',
    board({
      you: { bf: ['Island*4'], hand: ['Surveillance Monitor'], gy: ['Hill Giant', 'Grizzly Bears*2'] },
    }),
  ),
  preset(
    'Case of the Crimson Pulse: solved with an empty hand',
    board({
      you: { bf: ['Case of the Crimson Pulse', 'Island*2'] },
    }),
  ),
  preset(
    'Cenote Scout: exploring a nonland card',
    board({
      you: { bf: ['Forest'], hand: ['Cenote Scout'], lib: ['Hill Giant', 'Forest'] },
    }),
  ),
  preset(
    'Spyglass Siren: a Map token makes your creature explore',
    board({
      you: { bf: ['Cenote Scout', 'Island*2'], hand: ['Spyglass Siren'], lib: ['Hill Giant', 'Forest'] },
    }),
  ),
  preset(
    'Map Token: only at sorcery speed',
    board({
      you: { bf: ['Map Token', 'Cenote Scout', 'Island'], lib: ['Hill Giant', 'Forest'] },
    }),
  ),
  preset(
    'Map Token: needs a creature you control',
    board({
      you: { bf: ['Map Token', 'Island'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Merfolk Cave-Diver: exploring makes it unblockable',
    board({
      you: { bf: ['Merfolk Cave-Diver', 'Forest'], hand: ['Cenote Scout'], lib: ['Hill Giant', 'Forest'] },
    }),
  ),
  preset(
    'Geological Appraiser: discover offers a free cast',
    board({
      you: { bf: ['Mountain*4'], hand: ['Geological Appraiser'], lib: ['Forest', 'Grizzly Bears', 'Hill Giant', 'Llanowar Elves'] },
    }),
  ),
  preset(
    "Curator of Sun's Creation: discover again, declined to hand",
    board({
      you: {
        bf: ["Curator of Sun's Creation", 'Mountain*4'],
        hand: ['Geological Appraiser'],
        lib: ['Forest', 'Grizzly Bears', 'Hill Giant', 'Llanowar Elves'],
      },
    }),
  ),
  preset(
    "Curator of Sun's Creation: only once each turn",
    board({
      you: {
        bf: ["Curator of Sun's Creation", 'Mountain*8'],
        hand: ['Geological Appraiser*2'],
        lib: ['Forest', 'Grizzly Bears', 'Hill Giant', 'Llanowar Elves', 'Grizzly Bears', 'Llanowar Elves'],
      },
    }),
  ),
  preset(
    'Oteclan Landmark: crafting with a graveyard artifact',
    board({
      you: { bf: ['Oteclan Landmark', 'Plains*3', 'Treasure Token*2'], gy: ['Ornithopter'] },
    }),
  ),
  preset(
    'Oteclan Landmark: crafting with a Treasure',
    board({
      you: { bf: ['Oteclan Landmark', 'Plains*3', 'Treasure Token*2'], gy: ['Ornithopter'] },
    }),
  ),
  preset(
    'Oteclan Landmark: craft only in a main phase',
    board({
      you: { bf: ['Oteclan Landmark', 'Plains*3', 'Treasure Token*2'], gy: ['Ornithopter'] },
    }),
  ),
  preset(
    'Hakbal of the Surging Soul: choosing the explore order',
    board({
      you: { bf: ['Hakbal of the Surging Soul', 'Cenote Scout'], lib: ['Hill Giant', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Hakbal of the Surging Soul: a land onto the battlefield on attack',
    board({
      you: { bf: ['Hakbal of the Surging Soul'], hand: ['Forest'], lib: ['Hill Giant', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Hakbal of the Surging Soul: no land put down, draw instead',
    board({
      you: { bf: ['Hakbal of the Surging Soul'], hand: ['Forest'], lib: ['Hill Giant', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Ezio Auditore da Firenze: pay {W}{U}{B}{R}{G} to win',
    board({
      you: { bf: ['Ezio Auditore da Firenze', 'Plains', 'Island', 'Swamp', 'Mountain', 'Forest'] },
      opp: { life: 13 },
    }),
  ),
  preset(
    'Ezio Auditore da Firenze: Assassin spells gain freerunning',
    board({
      you: { bf: ['Ezio Auditore da Firenze', 'Swamp*2'], hand: ['Boilerbilges Ripper'] },
    }),
  ),
  preset(
    'The Infamous Cruelclaw: casting by discarding a card',
    board({
      you: {
        bf: ['The Infamous Cruelclaw'],
        hand: ['Grizzly Bears', 'Llanowar Elves'],
        lib: ['Wastes', 'Hill Giant'],
      },
    }),
  ),
  preset(
    'Dargo, the Shipwrecker: choosing how many to sacrifice',
    board({
      you: {
        bf: ['Mountain*3', 'Grizzly Bears', 'Llanowar Elves', 'Ornithopter'],
        hand: ['Dargo, the Shipwrecker'],
      },
    }),
  ),
  preset(
    'Ardenn, Intrepid Archaeologist: target any permanent or player',
    board({
      you: { bf: ['Ardenn, Intrepid Archaeologist', 'Grizzly Bears', { name: 'Bonesplitter', attach: 'Grizzly Bears' }] },
      opp: [{ bf: ['Hill Giant'] }, {}, {}],
    }),
  ),
  preset(
    'Ardenn, Intrepid Archaeologist: a Curse moves, Equipment doesn\'t',
    board({
      you: {
        bf: [
          'Ardenn, Intrepid Archaeologist',
          'Llanowar Elves',
          { name: 'Bonesplitter', attach: 'Llanowar Elves' },
          { name: 'Rancor', attach: 'Llanowar Elves' },
          'Island*3',
        ],
        hand: ['Curse of Verbosity'],
      },
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    'Ardenn, Intrepid Archaeologist: moving Equipment to a creature',
    board({
      you: {
        bf: [
          'Ardenn, Intrepid Archaeologist',
          'Grizzly Bears',
          'Llanowar Elves',
          { name: 'Bonesplitter', attach: 'Llanowar Elves' },
          { name: 'Rancor', attach: 'Llanowar Elves' },
        ],
      },
    }),
  ),
  preset(
    'Archfiend of Depravity: keeping two creatures',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Serra Angel', 'Llanowar Elves'] },
      opp: { bf: ['Archfiend of Depravity'] },
    }),
  ),
  preset(
    'Archfiend of Depravity: keeping none',
    board({
      you: { bf: ['Grizzly Bears', 'Hill Giant', 'Serra Angel', 'Llanowar Elves'] },
      opp: { bf: ['Archfiend of Depravity'] },
    }),
  ),
  // --- Doctor Who: time travel (2026-10-17) --------
  preset(
    'Wibbly-wobbly, Timey-wimey: only your time counters are offered',
    board({
      you: {
        bf: [{ name: 'Four Knocks', counters: { time: 2 } }, { name: 'Rotating Fireplace', counters: { time: 1 } }, 'Island*2', 'Mountain'],
        hand: ['Rift Bolt', 'Wibbly-wobbly, Timey-wimey'],
      },
      opp: { bf: [{ name: 'Four Knocks', counters: { time: 3 } }] },
    }),
  ),
  preset(
    'Wibbly-wobbly, Timey-wimey: adding and removing counters',
    board({
      you: {
        bf: [{ name: 'Four Knocks', counters: { time: 2 } }, { name: 'Rotating Fireplace', counters: { time: 1 } }, 'Island*2'],
        hand: ['Wibbly-wobbly, Timey-wimey'],
      },
    }),
  ),
  preset(
    "Wibbly-wobbly, Timey-wimey: a suspended card's last counter",
    board({
      you: { bf: ['Island*2', 'Mountain'], hand: ['Rift Bolt', 'Wibbly-wobbly, Timey-wimey'] },
    }),
  ),
  preset(
    'Wibbly-wobbly, Timey-wimey: Clear, and Confirm with nothing picked',
    board({
      you: { bf: [{ name: 'Rotating Fireplace', counters: { time: 1 } }, 'Island*2'], hand: ['Wibbly-wobbly, Timey-wimey'] },
    }),
  ),
  preset(
    'Trap the Trespassers: a secret vote, revealed all at once',
    board({
      you: { bf: ['Island*3'], hand: ['Trap the Trespassers'] },
      opp: { bf: ['Grizzly Bears', 'Serra Angel'] },
    }),
  ),
  preset(
    'Plea for Power: Tivit gives you a second vote',
    board({
      you: { bf: ['Island*4', 'Tivit, Seller of Secrets'], hand: ['Plea for Power'] },
    }),
  ),
  preset(
    'Plea for Power: more votes for time gives an extra turn',
    board({
      you: { bf: ['Island*4', 'Tivit, Seller of Secrets'], hand: ['Plea for Power'] },
    }),
  ),
  preset(
    'Plea for Power: a tie draws three cards',
    board({
      you: { bf: ['Island*4'], hand: ['Plea for Power'] },
      opp: { human: true },
    }),
  ),
  preset(
    'Misleading Motes: the owner picks top or bottom',
    board({
      you: { bf: ['Island*4'], hand: ['Misleading Motes'] },
      opp: { human: true, bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Armament Dragon: dividing +1/+1 counters',
    board({
      you: { bf: ['Grizzly Bears', 'Llanowar Elves', 'Plains*2', 'Swamp*2', 'Forest*2'], hand: ['Armament Dragon'] },
    }),
  ),
  preset(
    'Invasion of Lorwyn: choosing the protector, four players',
    board({
      you: { bf: ['Swamp*3', 'Forest*3'], hand: ['Invasion of Lorwyn'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Invasion of Lorwyn: no protector prompt with one opponent',
    board({
      you: { bf: ['Swamp*3', 'Forest*3'], hand: ['Invasion of Lorwyn'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Invasion of Lorwyn: attacking the battle, four players',
    board({
      you: { bf: ['Swamp*3', 'Forest*3', 'Craw Wurm'], hand: ['Invasion of Lorwyn'] },
      opp: [{ bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }, { bf: ['Grizzly Bears'] }],
    }),
  ),
  preset(
    'Invasion of Lorwyn: defeating it casts Winnowing Forces',
    board({
      you: { bf: ['Swamp*3', 'Forest*3', 'Craw Wurm'], hand: ['Invasion of Lorwyn'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Converter Beast: the Incubator token transforms',
    board({
      you: { bf: ['Forest*6'], hand: ['Converter Beast'] },
    }),
  ),
  preset(
    'Aarakocra Sneak: taking the initiative',
    board({
      you: { bf: ['Island*4'], hand: ['Aarakocra Sneak'] },
    }),
  ),
  preset(
    'Aarakocra Sneak: your upkeep ventures again, to a fork',
    board({
      you: { bf: ['Island*4'], hand: ['Aarakocra Sneak'] },
    }),
  ),
  preset(
    'Aarakocra Sneak: View board hides the dungeon map',
    board({
      you: { bf: ['Island*4'], hand: ['Aarakocra Sneak'] },
    }),
  ),
  preset(
    'Aarakocra Sneak: choosing Forge at the fork',
    board({
      you: { bf: ['Island*4'], hand: ['Aarakocra Sneak'] },
    }),
  ),
  preset(
    'Aarakocra Sneak: the initiative passes to a player who hits you',
    board({
      you: { bf: ['Island*4'], hand: ['Aarakocra Sneak'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Forest'] },
    }),
  ),
  preset(
    'Aarakocra Sneak: taking the initiative back',
    board({
      you: { bf: ['Island*4'], hand: ['Aarakocra Sneak'] },
      opp: { human: true, bf: ['Grizzly Bears', 'Forest'] },
    }),
  ),
  preset(
    'Bronzeplate Boar: reconfigure attaches it to a creature',
    board({
      you: { bf: ['Bronzeplate Boar', 'Grizzly Bears', 'Mountain*5'] },
    }),
  ),
  preset(
    'Bronzeplate Boar: reconfigure again to unattach',
    board({
      you: { bf: ['Bronzeplate Boar', 'Grizzly Bears', 'Mountain*10'] },
    }),
  ),
  preset(
    'Acquisition Octopus: attacks as a creature and draws',
    board({
      you: { bf: ['Acquisition Octopus'] },
    }),
  ),
  preset(
    "Alchemist's Retrieval: the normal cast targets only your permanents",
    board({
      you: { bf: ['Memnite', 'Grizzly Bears', 'Island*2'], hand: ["Alchemist's Retrieval"] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    "Alchemist's Retrieval: cleave can return any nonland permanent",
    board({
      you: { bf: ['Memnite', 'Grizzly Bears', 'Island*2'], hand: ["Alchemist's Retrieval"] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Lantern Flare: cleave asks for X',
    board({
      you: { bf: ['Plains*3', 'Mountain*2'], hand: ['Lantern Flare'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Lantern Flare: the normal cast counts your creatures',
    board({
      you: { bf: ['Memnite', 'Grizzly Bears', 'Plains*2'], hand: ['Lantern Flare'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Devoted Druid: Solemnity stops its untap ability',
    board({
      you: { bf: ['Solemnity', 'Devoted Druid'] },
    }),
  ),
  preset(
    'Kitchen Finks: Solemnity lets it persist again and again',
    board({
      you: { bf: ['Solemnity', 'Kitchen Finks', 'Swamp*6'], hand: ['Murder*2'] },
    }),
  ),
  preset(
    'Blighted Agent: Solemnity stops poison counters',
    board({
      you: { bf: ['Solemnity', 'Blighted Agent'] },
    }),
  ),
  preset(
    'Grafted Exoskeleton: the equipped creature gets +2/+2 and infect',
    board({ you: { bf: ['Grafted Exoskeleton', 'Grizzly Bears', 'Wastes*2'] } }),
  ),
  preset(
    'Grafted Exoskeleton: moving it sacrifices the old creature',
    board({ you: { bf: ['Grafted Exoskeleton', 'Grizzly Bears', 'Hill Giant', 'Wastes*4'] } }),
  ),
  preset(
    'Secret Door: choosing which dungeon to venture into',
    board({
      you: { bf: ['Secret Door', 'Island*5'] },
    }),
  ),
  preset(
    "Secret Door: Tomb of Annihilation's Trapped Entry",
    board({
      you: { bf: ['Secret Door', 'Island*5'] },
    }),
  ),
  preset(
    "Secret Door: the Tomb's fork on the map",
    board({
      you: { bf: ['Secret Door', 'Island*10'], hand: ['Grizzly Bears', 'Hill Giant'] },
      opp: { bf: ['Forest'], hand: ['Lightning Bolt', 'Shock'] },
    }),
  ),
  preset(
    'Secret Door: Veils of Fear discards stay hidden until all choose',
    board({
      you: { bf: ['Secret Door', 'Island*10'], hand: ['Grizzly Bears', 'Hill Giant'] },
      opp: { human: true, bf: ['Forest'], hand: ['Lightning Bolt', 'Shock'] },
    }),
  ),
  preset(
    'Secret Door: the dungeon chip shows progress',
    board({
      you: { bf: ['Secret Door', 'Island*10'], hand: ['Grizzly Bears', 'Hill Giant'] },
      opp: { bf: ['Forest'], hand: ['Lightning Bolt', 'Shock'] },
    }),
  ),
  preset(
    'Kitchen Imp: cast for its madness cost',
    board({
      you: { bf: ['Hell Mongrel', 'Swamp'], hand: ['Kitchen Imp'] },
    }),
  ),
  preset(
    'Terminal Agony: declining a madness cast',
    board({
      you: { bf: ['Hell Mongrel', 'Swamp', 'Mountain'], hand: ['Terminal Agony'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Hell Mongrel: +1/+1 for each discard',
    board({
      you: { bf: ['Hell Mongrel'], hand: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Glowstone Recluse: the mutate cast and its targets',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4'], hand: ['Glowstone Recluse'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    'Glowstone Recluse: mutating on top',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4'], hand: ['Glowstone Recluse'] },
    }),
  ),
  preset(
    'Dreamtail Heron: mutating underneath',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4', 'Island*4'], hand: ['Glowstone Recluse', 'Dreamtail Heron'] },
    }),
  ),
  preset(
    'Dreamtail Heron: a mutated creature dies as all its cards',
    board({
      you: { bf: ['Grizzly Bears', 'Forest*4', 'Island*4', 'Swamp*3'], hand: ['Glowstone Recluse', 'Dreamtail Heron', 'Murder'] },
    }),
  ),
  preset(
    'Force of Will: cast by exiling a blue card',
    board({
      you: {
        bf: ['Forest*2'],
        hand: ['Grizzly Bears', 'Force of Will', 'Opt', 'Counterspell', 'Swords to Plowshares'],
      },
    }),
  ),
  preset(
    'Solitude: evoke by exiling a white card',
    board({
      you: { hand: ['Solitude', 'Swords to Plowshares'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    "Dusk Charger: the city's blessing at ten permanents",
    board({
      you: { bf: ['Dusk Charger', 'Island*8'], hand: ['Island'] },
    }),
  ),
  preset(
    'Secrets of the Golden City: ascend as it resolves',
    board({
      you: { bf: ['Island*10'], hand: ['Secrets of the Golden City'] },
    }),
  ),
  preset(
    "Dusk Charger: the city's blessing stays when lands leave",
    board({
      you: { bf: ['Dusk Charger', 'Island*7', 'Strip Mine'], hand: ['Island'] },
    }),
  ),
  preset(
    'Circle of Protection: Red: a spell on the stack as the source',
    board({
      you: { bf: ['Circle of Protection: Red', 'Plains*2', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Raging Goblin'] },
    }),
  ),
  preset(
    'Circle of Protection: Red: the chosen source turns blue',
    board({
      you: { bf: ['Circle of Protection: Red', 'Plains*2', 'Island'], hand: ['Thoughtlace'] },
      opp: { bf: ['Raging Goblin'] },
    }),
  ),
  preset(
    "Ashnod's Battle Gear: asked in your untap step",
    board({
      you: { bf: ["Ashnod's Battle Gear", 'Hill Giant', 'Plains*2'] },
    }),
  ),
  preset(
    "Ashnod's Battle Gear: left tapped, the bonus stays",
    board({
      you: { bf: ["Ashnod's Battle Gear", 'Hill Giant', 'Plains*2'] },
    }),
  ),
  preset(
    "Ashnod's Battle Gear: untapped, the bonus ends",
    board({
      you: { bf: ["Ashnod's Battle Gear", 'Hill Giant', 'Plains*2'] },
    }),
  ),
  preset(
    'Bottomless Vault: remove any number of storage counters for mana',
    board({
      you: { bf: [{ name: 'Bottomless Vault', counters: { storage: 3 } }], hand: ['Hymn to Tourach'] },
    }),
  ),
  preset(
    'Bottomless Vault: X = 0 taps for nothing',
    board({
      you: { bf: [{ name: 'Bottomless Vault', counters: { storage: 3 } }] },
    }),
  ),
  preset(
    "Farrel's Zealot: unblocked, it deals 3 to a creature instead",
    board({
      you: { bf: ["Farrel's Zealot"] },
      opp: { bf: [{ name: 'Craw Wurm', tapped: true }] },
    }),
  ),
  preset(
    "Farrel's Zealot: declining, it hits for 2",
    board({
      you: { bf: ["Farrel's Zealot"] },
      opp: { bf: [{ name: 'Craw Wurm', tapped: true }] },
    }),
  ),
  preset(
    "Necrite: a blocked attacker doesn't trigger",
    board({
      you: { bf: ["Farrel's Zealot", 'Necrite'] },
      opp: { human: true, bf: ['Craw Wurm'] },
    }),
  ),
  preset(
    'Illusionary Wall: paying cumulative upkeep',
    board({
      you: { bf: [{ name: 'Illusionary Wall', counters: { age: 1 } }, 'Island*3'] },
    }),
  ),
  preset(
    'Illusionary Wall: declining cumulative upkeep',
    board({
      you: { bf: [{ name: 'Illusionary Wall', counters: { age: 2 } }, 'Island*3'] },
    }),
  ),
  preset(
    'Dark Depths: the last ice counter triggers once',
    board({
      you: { bf: [{ name: 'Dark Depths', counters: { ice: 1 } }, 'Wastes*3'] },
    }),
  ),
  preset(
    'Vindictive Lich: each mode at a different opponent',
    board({
      you: { bf: ['Vindictive Lich', 'Swamp*3'], hand: ['Murder'] },
      opp: [
        { bf: ['Grizzly Bears'], hand: ['Hill Giant', 'Craw Wurm'] },
        { bf: ['Hill Giant'], hand: ['Grizzly Bears', 'Craw Wurm'] },
      ],
    }),
  ),
  preset(
    "Conqueror's Galleon: attacks and comes back a land",
    board({
      you: { bf: ["Conqueror's Galleon", 'Craw Wurm'] },
    }),
  ),
  preset(
    'Consign // Oblivion: only Consign casts from your hand',
    board({
      you: { bf: ['Island*2'], hand: ['Consign // Oblivion'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Consign // Oblivion: Oblivion casts from the graveyard, then exiles',
    board({
      you: { bf: ['Swamp*5'], gy: ['Consign // Oblivion'] },
      opp: { hand: ['Hill Giant', 'Craw Wurm'] },
    }),
  ),
  preset(
    'Chance: discard two, draw two',
    board({
      you: { bf: ['Mountain*4'], hand: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'], gy: ['Leave // Chance'] },
    }),
  ),
  preset(
    'Chance: discard none, draw none',
    board({
      you: { bf: ['Mountain*4'], hand: ['Grizzly Bears', 'Hill Giant', 'Craw Wurm'], gy: ['Leave // Chance'] },
    }),
  ),
  preset(
    'Reverse Engineer: improvise with artifacts',
    board({
      you: { bf: ['Island*2', 'Darksteel Relic', 'Memnite', 'Ornithopter', 'Grizzly Bears'], hand: ['Reverse Engineer'] },
    }),
  ),
  preset(
    "Lethal Sting: can't be cast while Melira protects your creatures",
    board({
      you: { bf: ['Swamp*3', 'Grizzly Bears', 'Melira, Sylvok Outcast'], hand: ['Lethal Sting'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    "Nissa's Encouragement: may find nothing, though a Forest is in your graveyard",
    board({
      you: { bf: ['Forest*5'], hand: ["Nissa's Encouragement"], gy: ['Forest'], lib: ['Brambleweft Behemoth'] },
    }),
  ),
  preset(
    'Chandra, Fire Artisan: two attackers at once make one trigger',
    board({
      you: { bf: ['Grizzly Bears*2'] },
      opp: { bf: [{ name: 'Chandra, Fire Artisan', counters: { loyalty: 5 } }] },
    }),
  ),
  preset(
    "Priest of Yawgmoth: mana equal to the sacrificed artifact's mana value",
    board({
      you: { bf: ['Priest of Yawgmoth', 'Mind Stone', 'Darksteel Relic'], hand: ["Night's Whisper"] },
    }),
  ),
  preset(
    'Oathsworn Knight: blocked by two creatures, loses one counter',
    board({
      you: { bf: [{ name: 'Oathsworn Knight', counters: { '+1/+1': 4 } }] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'], human: true },
    }),
  ),
  preset(
    'Armadillo Cloak: a trampler blocked triggers once',
    board({
      you: { bf: ['Grizzly Bears', { name: 'Armadillo Cloak', attach: 'Grizzly Bears' }] },
      opp: { bf: ['Grizzly Bears'], human: true },
    }),
  ),
  preset(
    'Relic Vial: your only Cleric dying still drains',
    board({
      you: { bf: ['Relic Vial', 'Abbey Matron', 'Plains*2'] },
    }),
  ),
  preset(
    'Dovin, Grand Arbiter: his +1 counts each creature that connects',
    board({
      you: { bf: [{ name: 'Dovin, Grand Arbiter', counters: { loyalty: 3 } }, 'Grizzly Bears', 'Savannah Lions'] },
    }),
  ),
  preset(
    'Lively Dirge: two creature cards with total mana value 4 or less',
    board({
      you: { bf: ['Swamp*4'], hand: ['Lively Dirge'], gy: ['Hill Giant', 'Grizzly Bears', 'Savannah Lions'] },
    }),
  ),
  preset(
    'Will of the Jeskai: Bob chooses before your hand is discarded',
    board({
      you: { bf: ['Mountain*4'], hand: ['Will of the Jeskai', 'Grizzly Bears'] },
      opp: { human: true },
    }),
  ),
  preset(
    'Fire Covenant: X life, X damage divided',
    board({
      you: { bf: ['Swamp*2', 'Mountain'], hand: ['Fire Covenant'] },
      opp: { bf: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  preset(
    'Dismember: pay its Phyrexian mana with life by choice',
    board({
      you: { bf: ['Swamp*3'], hand: ['Dismember'] },
      opp: { bf: ['Hill Giant'] },
    }),
  ),
  preset(
    "Circle of Protection: Red: a dead creature's trigger as the source",
    board({
      you: { bf: ['Circle of Protection: Red', 'Plains', 'Mountain'], hand: ['Lightning Bolt'] },
      opp: { bf: ['Mudbutton Torchrunner'] },
    }),
  ),
  preset(
    'Lathiel, the Bounteous Dawn: up to that many counters',
    board({
      you: { bf: ['Lathiel, the Bounteous Dawn', 'Grizzly Bears', 'Hill Giant', 'Plains'], hand: ["Chaplain's Blessing"] },
    }),
  ),
  preset(
    'Wretched Gryff: emerge, sacrificing a creature to pay less',
    board({
      you: { bf: ['Island*2', 'Hill Giant', 'Grizzly Bears'], hand: ['Wretched Gryff'] },
    }),
  ),
  preset(
    "Sinuous Vermin: menace once it's monstrous",
    board({
      you: { bf: ['Sinuous Vermin', 'Swamp*5'] },
    }),
  ),
  preset(
    'Hinterland Logger: transforms after a turn with no spells',
    board({
      you: { bf: ['Hinterland Logger', 'Forest'] },
    }),
  ),
  preset(
    'Startled Awake: comes back from the graveyard as Persistent Nightmare',
    board({
      you: { bf: ['Island*5'], gy: ['Startled Awake'] },
    }),
  ),
  preset(
    'Boulder Salvo: its surge cost is offered after you cast another spell',
    board({
      you: { bf: ['Mountain*3'], hand: ['Shock', 'Boulder Salvo'] },
      opp: { bf: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Lava Coil: a creature that survives it is exiled when it dies later that turn',
    board({
      you: { bf: ['Mountain*3'], hand: ['Lava Coil', 'Shock'] },
      opp: { bf: ['Colossal Dreadmaw'] },
    }),
  ),
  preset(
    "Goblin Glory Chaser: menace once it's renowned",
    board({
      you: { bf: ['Goblin Glory Chaser'] },
    }),
  ),
  preset(
    "Aragorn, Hornburg Hero: the hit that makes a creature renowned doesn't double its counters",
    board({
      you: { bf: ['Aragorn, Hornburg Hero', 'Grizzly Bears'] },
    }),
  ),
  preset(
    'Screamreach Brawler: dashed in, it attacks at once and comes back to your hand',
    board({ you: { bf: ['Mountain*3'], hand: ['Screamreach Brawler'] } }),
  ),
  preset(
    'Ragavan, Nimble Pilferer: the command zone offers both ways to cast it',
    board({ you: { cmd: ['Ragavan, Nimble Pilferer'], bf: ['Mountain*2'] } }),
  ),
  preset(
    "Dromoka's Gift: bolster asks only between the creatures tied for least toughness",
    board({ you: { bf: ['Grizzly Bears', 'Grizzly Bears', 'Craw Wurm', 'Forest*5'], hand: ["Dromoka's Gift"] } }),
  ),
  preset(
    'Spinning Wheel Kick: X counts only the creatures it hits',
    board({
      you: { bf: ['Forest*6', 'Hill Giant'], hand: ['Spinning Wheel Kick'] },
      opp: { bf: ['Grizzly Bears', 'Gray Ogre'] },
    }),
  ),
  preset(
    "Gnarled Scarhide: bestowed, it's an Aura, and a creature again once the host dies",
    board({ you: { bf: ['Swamp*7', 'Grizzly Bears'], hand: ['Gnarled Scarhide', 'Murder'] } }),
  ),
  preset(
    'Pharagax Giant: the opponent decides whether to pay tribute',
    board({ you: { bf: ['Mountain*5'], hand: ['Pharagax Giant'] }, opp: { human: true } }),
  ),
  preset(
    'Snake of the Golden Grove: with two opponents, you choose who decides tribute',
    board({ you: { bf: ['Forest*5'], hand: ['Snake of the Golden Grove'] }, opp: [{ human: true }, { human: true }] }),
  ),
  preset(
    "Spider Climb: cast at instant speed, it's sacrificed in the cleanup step",
    board({ you: { bf: ['Forest', 'Grizzly Bears'], hand: ['Spider Climb'] } }),
  ),
  preset(
    'Turn // Burn: cast fused, both halves resolve, left first',
    board({ you: { bf: ['Island*3', 'Mountain*2'], hand: ['Turn // Burn'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Shadow Slice: encoded on a creature, it casts again when that creature hits',
    board({ you: { bf: ['Swamp*5', 'Grizzly Bears'], hand: ['Shadow Slice'] } }),
  ),
  preset(
    'Burn Trail: paying conspire taps two red creatures and copies it',
    board({ you: { bf: ['Mountain*4', 'Raging Goblin', 'Goblin Piker', 'Grizzly Bears'], hand: ['Burn Trail'] } }),
  ),
  preset(
    "Burn Trail: no conspire prompt without two creatures that share its colour",
    board({ you: { bf: ['Mountain*4', 'Raging Goblin', 'Grizzly Bears'], hand: ['Burn Trail'] } }),
  ),
  preset(
    'Wort, the Raidmother: two conspire prompts on Burn Trail',
    board({
      you: { bf: ['Mountain*4', 'Wort, the Raidmother', 'Raging Goblin', 'Goblin Piker', 'Goblin Warrior Token'], hand: ['Burn Trail'] },
    }),
  ),
  preset(
    'Enraging Licid: it becomes an Aura, and you can pay to make it a creature again',
    board({ you: { bf: ['Mountain*3', 'Enraging Licid', 'Grizzly Bears'] } }),
  ),
  preset(
    'Gore-House Chainwalker: unleash asks before it enters, and the counter stops it blocking',
    board({ you: { bf: ['Mountain*2'], hand: ['Gore-House Chainwalker'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  preset(
    "Azorius Arrester: a detained creature can't use its abilities until your next turn",
    board({ you: { bf: ['Plains*2'], hand: ['Azorius Arrester'] }, opp: { bf: ['Prodigal Sorcerer'] } }),
  ),
  preset(
    'Thunderous Wrath: reveal and cast for its miracle cost',
    board({ you: { bf: ['Island*3', 'Mountain'], hand: ['Divination'], lib: ['Thunderous Wrath', 'Island'] } }),
  ),
  preset(
    'Thunderous Wrath: keeping a miracle hidden',
    board({ you: { bf: ['Island*3', 'Mountain'], hand: ['Divination'], lib: ['Thunderous Wrath', 'Island'] } }),
  ),
  preset(
    'Pegasus Stampede: buyback sacrifices a land',
    board({ you: { bf: ['Plains*3'], hand: ['Pegasus Stampede'] } }),
  ),
  preset(
    'Latchkey Faerie: its prowl cost is offered once a Rogue has hit a player',
    board({ you: { bf: ['Island*4', 'Prickly Boggart'], hand: ['Latchkey Faerie'] } }),
  ),
  preset(
    'Waterspout Weavers: kinship reveals the top card at your upkeep',
    board({ you: { bf: ['Waterspout Weavers', 'Grizzly Bears'], lib: ['Merrow Witsniper', 'Island'] } }),
  ),
  preset(
    'Silverblade Paladin: soulbond pairs it with a creature you choose',
    board({ you: { bf: ['Plains*3', 'Grizzly Bears', 'Hill Giant'], hand: ['Silverblade Paladin'] } }),
  ),
  preset(
    "Just Fate: castable only once you've been attacked",
    board({ you: { bf: ['Plains*3'], hand: ['Just Fate'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  preset(
    'Surging Sentinels: ripple casts the copy it reveals for free',
    board({ you: { bf: ['Plains*3'], hand: ['Surging Sentinels'], lib: ['Surging Sentinels', 'Grizzly Bears', 'Hill Giant', 'Island'] } }),
  ),
  preset(
    "Sorcerous Sight: looking at an opponent's hand",
    board({ you: { bf: ['Island'], hand: ['Sorcerous Sight'] }, opp: { hand: ['Grizzly Bears', 'Lightning Bolt', 'Forest'] } }),
  ),
  preset(
    'Discordant Dirge: choose up to as many cards as its verse counters',
    board({
      you: { bf: ['Swamp', { name: 'Discordant Dirge', counters: { verse: 2 } }] },
      opp: { hand: ['Grizzly Bears', 'Lightning Bolt', 'Forest'] },
    }),
  ),
  preset(
    'Endless Swarm: a copy each upkeep, and no more spells',
    board({ you: { bf: ['Forest*9'], hand: ['Endless Swarm', 'Grizzly Bears', 'Forest', 'Forest'] } }),
  ),
  preset(
    'Desperate Ritual: splicing Spiritual Visit onto it',
    board({ you: { bf: ['Mountain*2', 'Plains'], hand: ['Desperate Ritual', 'Spiritual Visit'] } }),
  ),
  preset(
    'Shu Cavalry: only horsemanship blocks it',
    board({
      you: { bf: ['Shu Cavalry', 'Grizzly Bears'] },
      opp: { human: true, bf: ['Serra Angel', 'Wei Scout'] },
    }),
  ),
  preset(
    'Skyscribing: forecast from your hand in your upkeep, once a turn',
    board({ you: { bf: ['Island*6'], hand: ['Skyscribing'] } }),
  ),
  preset(
    'Greater Gargadon: sacrificing to it from exile',
    board({ you: { bf: ['Mountain', 'Grizzly Bears', 'Forest'], hand: ['Greater Gargadon'] } }),
  ),
  // --- Flip cards (2026-10-26, Champions and Betrayers of Kamigawa) --------
  preset(
    'Callow Jushi: flips into Jaraku at the end step',
    board({ you: { bf: [{ name: 'Callow Jushi', counters: { ki: 2 } }, 'Island*3'] } }),
  ),
  preset(
    'Scent of Ivy: reveal green cards from your hand, which stay there',
    board({ you: { bf: ['Forest', 'Grizzly Bears'], hand: ['Scent of Ivy', 'Llanowar Elves', 'Giant Growth', 'Lightning Bolt'] } }),
  ),
  // --- A damage trigger's "that creature" (2026-10-26, Champions of Kamigawa) -
  preset(
    'Matsu-Tribe Sniper: the flier it damages stays tapped',
    board({ you: { bf: ['Matsu-Tribe Sniper'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  // --- Two kicker costs (2026-10-27, Apocalypse) ------------------------------
  preset(
    'Anavolver: kick it with either kicker, or both',
    board({ you: { bf: ['Forest*4', 'Island*2', 'Swamp'], hand: ['Anavolver'] } }),
  ),
  // --- Amplify and provoke (2026-10-27, Legions) ------------------------------
  preset(
    'Glowering Rogon: amplify reveals Beasts from your hand',
    board({ you: { bf: ['Forest*6'], hand: ['Glowering Rogon', 'Krosan Vorine', 'Brontotherium', 'Grizzly Bears'] } }),
  ),
  preset(
    'Goblin Grappler: the provoked creature has to block it',
    board({
      you: { bf: ['Goblin Grappler'] },
      opp: { human: true, bf: [{ name: 'Grizzly Bears', tapped: true }, 'Hill Giant'] },
    }),
  ),
  // --- Discard X cards as a spell's cost (2026-10-27, Torment) ---------------
  preset(
    'Sickening Dreams: choose X, then discard that many',
    board({ you: { bf: ['Swamp*2'], hand: ['Sickening Dreams', 'Wastes', 'Island', 'Mountain'] }, opp: { bf: ['Grizzly Bears'] } }),
  ),
  // --- Protection from the color of your choice (2026-10-28, grant-protection family) -
  preset(
    'Gods Willing: choose the colour as it resolves',
    board({ you: { bf: ['Plains', 'Grizzly Bears'], hand: ['Gods Willing'] } }),
  ),
  preset(
    "Flickering Ward: naming its own colour doesn't knock it off",
    board({ you: { bf: ['Plains*3', 'Grizzly Bears'], hand: ['Flickering Ward', 'Pacifism'] } }),
  ),
  // --- Variable target counts (2026-10-28, variable-target-count family) ----
  preset(
    "Heliod's Intervention: choose the mode, then X, then exactly X targets",
    board({ you: { bf: ['Plains*4'], hand: ["Heliod's Intervention"] }, opp: { bf: ['Sol Ring*3'] } }),
  ),
  preset(
    'Patch Up: only cards that fit under total mana value 3',
    board({ you: { bf: ['Plains*3'], hand: ['Patch Up'], gy: ['Grizzly Bears', 'Savannah Lions', 'Centaur Courser'] } }),
  ),
  preset(
    'Heroic Feast: up to as many targets as the life you gained',
    board({ you: { bf: ['Heroic Feast', 'Food Token', 'Wastes*2', 'Grizzly Bears*4'] } }),
  ),
  // --- Skipping an untap step (2026-10-27, recheck list R5) -----------------
  preset(
    'Avizoa: you skip your next untap step',
    board({ you: { bf: ['Avizoa', { name: 'Island', tapped: true }, { name: 'Island', tapped: true }] } }),
  ),
  // --- Naming a card (2026-10-28, the choose-card-name family) -------------
  preset(
    'Pithing Needle: name a card from the search as it enters',
    board({ you: { bf: ['Wastes'], hand: ['Pithing Needle'] }, opp: { bf: ['Prodigal Sorcerer', 'Mind Stone'] } }),
  ),
  preset(
    "Sorcerous Spyglass: see the opponent's hand before naming",
    board({
      you: { bf: ['Wastes*2'], hand: ['Sorcerous Spyglass'] },
      opp: [{ hand: ['Lightning Bolt', 'Counterspell'] }, { hand: ['Shock'] }],
    }),
  ),
  preset(
    'Alhammarret, High Arbiter: only a revealed nonland card can be named',
    board({
      you: { bf: ['Island*7'], hand: ['Alhammarret, High Arbiter'] },
      opp: { bf: ['Mountain'], hand: ['Lightning Bolt', 'Forest'] },
    }),
  ),
  preset(
    'Brain Pry: the name is chosen as it resolves, nonland only',
    board({ you: { bf: ['Swamp*2'], hand: ['Brain Pry'] }, opp: { hand: ['Lightning Bolt'] } }),
  ),
  // --- Banding (2026-10-28, the banding family) -----------------------------
  preset(
    "Benalish Hero: attack in a band, and divide the blocker's damage",
    board({ you: { bf: ['Benalish Hero', 'Grizzly Bears'] }, opp: { human: true, bf: ['Hill Giant'] } }),
  ),
  preset(
    'Benalish Hero: a band takes only one creature without banding',
    board({ you: { bf: ['Benalish Hero', 'Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    "Benalish Hero: the defender divides a trampler's damage",
    board({ you: { bf: ['Colossal Dreadmaw'] }, opp: { human: true, bf: ['Benalish Hero'] } }),
  ),
  // --- Searching an opponent's zones (2026-10-28, search-opponent-library family) -
  preset(
    "Bribery: take a creature from the opponent's library",
    board({ you: { bf: ['Island*5'], hand: ['Bribery'] }, opp: { lib: ['Hill Giant', 'Lightning Bolt', 'Colossal Dreadmaw'] } }),
  ),
  preset(
    "Cranial Extraction: the graveyard's copies go whatever you pick",
    board({
      you: { bf: ['Swamp*4'], hand: ['Cranial Extraction'] },
      opp: { gy: ['Lightning Bolt'], hand: ['Lightning Bolt'], lib: ['Lightning Bolt'] },
    }),
  ),
  preset(
    "Praetor's Grasp: the exiled card is yours to play, face down to Bob",
    board({ you: { bf: ['Swamp*3', 'Mountain'], hand: ["Praetor's Grasp"] }, opp: { lib: ['Lightning Bolt', 'Hill Giant'] } }),
  ),
  // --- Lost abilities, block limits, chosen types (2026-10-28, B249) ---------
  preset(
    'Two-Headed Giant of Foriys: block two attackers with one creature',
    board({ you: { bf: ['Grizzly Bears*2'] }, opp: { human: true, bf: ['Two-Headed Giant of Foriys'] } }),
  ),
  preset(
    "Lignify: the enchanted creature loses its abilities",
    board({ you: { bf: ['Forest*2'], hand: ['Lignify'] }, opp: { bf: ['Serra Angel'] } }),
  ),
  preset(
    'Mistform Stalker: it becomes the creature type you choose',
    board({ you: { bf: ['Island', 'Mistform Stalker'] } }),
  ),
  // --- Each player chooses, shared graveyards, repeating (2026-10-28, need-keys Phase 2) ---
  preset(
    'Show and Tell: both cards enter together',
    board({
      you: { bf: ['Island*3'], hand: ['Show and Tell', 'Soul Warden'] },
      opp: { hand: ['Grizzly Bears'] },
    }),
  ),
  preset(
    'Harsh Mercy: each player names a creature type',
    board({
      you: { bf: ['Plains*3', 'Grizzly Bears'], hand: ['Harsh Mercy'] },
      opp: { bf: ['Hill Giant', 'Elvish Visionary'] },
    }),
  ),
  preset(
    'Ad Nauseam: you decide after each card',
    board({ you: { bf: ['Swamp*5'], hand: ['Ad Nauseam'], lib: ['Hill Giant', 'Grizzly Bears'] } }),
  ),
  preset(
    "Witness the Future: only the target player's graveyard",
    board({
      you: { bf: ['Island*3'], hand: ['Witness the Future'], gy: ['Lightning Bolt'] },
      opp: { gy: ['Grizzly Bears', 'Hill Giant'] },
    }),
  ),
  // --- Granted statics, land types, exchanging control (2026-10-29, B253) ---
  preset(
    'Tideshaper Mystic: choose a basic land type',
    board({ you: { bf: ['Tideshaper Mystic'] }, opp: { bf: ['Yavimaya Coast'] } }),
  ),
  preset(
    'Blood Moon: nonbasic lands are Mountains',
    board({ you: { bf: ['Mountain*3', 'Yavimaya Coast', 'Forest'], hand: ['Blood Moon'] } }),
  ),
  preset(
    "Ghirapur Guide: small creatures can't block it",
    board({ you: { bf: ['Forest*3', 'Ghirapur Guide'] }, opp: { human: true, bf: ['Grizzly Bears', 'Hill Giant'] } }),
  ),
  preset(
    'Switcheroo: two creatures change hands',
    board({ you: { bf: ['Island*5', 'Grizzly Bears'], hand: ['Switcheroo'] }, opp: { bf: ['Hill Giant'] } }),
  ),
  // --- Counters chosen, modal activations, an Aura's lock (2026-10-29, B254) ---
  preset(
    'Ghave, Guru of Spores: pick the creature that gives up a counter',
    board({
      you: {
        bf: [
          { name: 'Ghave, Guru of Spores', counters: { '+1/+1': 5 } },
          { name: 'Grizzly Bears', counters: { '+1/+1': 1 } },
          'Plains',
        ],
      },
    }),
  ),
  preset(
    'Tayam, Luminous Enigma: three counters from among your creatures',
    board({
      you: {
        bf: [
          { name: 'Tayam, Luminous Enigma', counters: { vigilance: 1 } },
          { name: 'Grizzly Bears', counters: { '+1/+1': 2 } },
          { name: 'Hill Giant', counters: { '-1/-1': 1 } },
          'Plains*3',
        ],
      },
      // A four-player table: the prompt is the same at any size.
      opp: [{}, {}, {}],
    }),
  ),
  preset(
    'Cankerbloom: each mode is its own activation',
    board({ you: { bf: ['Cankerbloom', 'Forest'] }, opp: { bf: ['Sol Ring', 'Glorious Anthem'] } }),
  ),
  preset(
    "Arrest: the enchanted creature's abilities can't be activated",
    board({ you: { bf: ['Plains*3', 'Prodigal Pyromancer'], hand: ['Arrest'] }, opp: { bf: ['Prodigal Pyromancer'] } }),
  ),
]
