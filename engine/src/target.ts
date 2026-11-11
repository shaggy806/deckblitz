/** Reference types for spell / ability targets. Pure data, no logic. */

import type { CardType, TurnStat } from "./cards.js";
import type { EffectAmount } from "./effects.js";
import type { CardFilter, SpellTargetsFilter } from "./filter.js";
import type { Color } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";

export type TargetRef =
  | { readonly kind: "player"; readonly player: PlayerId }
  | { readonly kind: "object"; readonly object: ObjectId };

/** What a target slot is allowed to point at. */
/** What a {@link TargetSpec} `opponent-compared` compares between players:
 * life, creatures or lands controlled, cards in hand, creature cards in the
 * graveyard. */
export type PlayerStat = "life" | "creatures" | "lands" | "cards-in-hand" | "creature-cards-in-graveyard";

export type TargetSpec =
  | "any-target"
  | "creature"
  /** A creature whose current (computed, layer 5) colours don't include black
   * — Doom Blade / Terror. */
  | "nonblack-creature"
  | "creature-you-control"
  | "creature-an-opponent-controls"
  | "player"
  /** A player other than the one choosing the target ("target opponent" —
   * Iridescent Vinelasher). */
  | "opponent"
  /** An opponent who is the active player — The Beamtown Bullies' "target
   * opponent whose turn it is". There is none on your own turn, so an
   * ability with this slot can only be activated on an opponent's. */
  | "opponent-whose-turn-it-is"
  | "creature-or-player"
  /** An opponent, or any planeswalker (Theater of Horrors' "target opponent
   * or planeswalker"). */
  | "opponent-or-planeswalker"
  /** *Any* player — yourself included — or any planeswalker (Clan Defiance's
   * "target player or planeswalker"). A different printed wording from
   * `opponent-or-planeswalker`, not a synonym. */
  | "player-or-planeswalker"
  /** Any player, yourself included, or any permanent (Ardenn, Intrepid
   * Archaeologist's "target permanent or player"). */
  | "permanent-or-player"
  | "permanent"
  | "nonland-permanent"
  | "land"
  /** A land whose controller is the one choosing — the Karoo lands' "return a
   * land you control to its owner's hand". Modelled as a target because the
   * engine has no "choose a permanent you control" for a return; the
   * divergence (targeting vs choosing) only shows on a land with hexproof or
   * shroud, of which the pool has none. */
  | "land-you-control"
  | "artifact"
  /** An artifact an opponent controls (Vandalblast: "target artifact you
   * don't control"). */
  | "artifact-an-opponent-controls"
  | "artifact-or-enchantment"
  | "creature-or-enchantment"
  /** Putrefy, Bedevil — a single slot that takes either type. */
  | "artifact-or-creature"
  /** Go for the Throat. "Nonartifact" is a restriction on the creature, not a
   * second type, so it can't be expressed by the pair above. */
  | "nonartifact-creature"
  /** A bare enchantment (Aura Mutation: "target enchantment"). */
  | "enchantment"
  /** A creature or enchantment an opponent controls (Feed the Swarm). */
  | "creature-or-enchantment-an-opponent-controls"
  /** A nonland permanent an opponent controls (Cyclonic Rift's unkicked
   * mode: "target nonland permanent you don't control"). */
  | "nonland-permanent-an-opponent-controls"
  /** A creature currently attacking or blocking (Eiganjo, Seat of the
   * Empire's Channel — "target attacking or blocking creature"). */
  | "attacking-or-blocking-creature"
  /** A creature attacking *the targeting player* or a planeswalker they
   * control (Soul Snare). Narrower than `attacking-or-blocking-creature`:
   * at a 3-4 player table someone else's attacker is not your problem. */
  | "creature-attacking-you"
  /**
   * A creature controlled by the player *this ability's source is attacking*
   * — Tyrant's Familiar's "target creature defending player controls".
   *
   * Needs `TargetSource.object` to know which creature is attacking, and so
   * only means anything on an ability whose source is an attacker. In a
   * two-player game this coincides with "a creature an opponent controls";
   * at a 3-4 player table it does not, which is why it isn't spelled that way.
   */
  | "creature-defending-player-controls"
  /** An artifact, enchantment, or nonbasic land an opponent controls
   * (Boseiju, Who Endures's Channel). */
  | "artifact-enchantment-or-nonbasic-land-an-opponent-controls"
  /** A spell on the stack (a card, not an ability). */
  | "spell"
  | "creature-spell"
  | "noncreature-spell"
  /** An instant or sorcery spell on the stack (Twincast). */
  | "instant-or-sorcery-spell"
  /** Swan Song — the three types it can counter. */
  | "enchantment-instant-or-sorcery-spell"
  /** An activated or triggered ability on the stack (Sublime Epiphany's
   * "counter target activated or triggered ability"). A mana ability never
   * is one (rule 605.3b); a Saga chapter is a triggered ability (714.2b). */
  | "activated-or-triggered-ability"
  /** An instant spell, a sorcery spell, or a triggered ability on the stack,
   * in one slot (Spider-Sense). A Saga chapter, a delayed or reflexive
   * trigger and a ward trigger are triggered abilities (rules 714.2b, 603.7,
   * 603.12, 702.21a); an activated ability isn't one. */
  | "instant-or-sorcery-spell-or-triggered-ability"
  /** An instant or sorcery card in the targeting player's graveyard
   * (Snapcaster Mage — ROADMAP Phase 6b). */
  | "instant-or-sorcery-in-your-graveyard"
  /**
   * A permanent on the battlefield matching an arbitrary `CardFilter` — the
   * general form, for the shapes that aren't worth their own literal.
   *
   * "Target creature with flying" / "without flying" (Clan Defiance), "target
   * Dragon you control", "target creature with power 4 or greater": these
   * multiply combinatorially, the way graveyard targeting does, so the string
   * literals above stop converging. The literals stay for the common shapes —
   * they read better at the call site and most of the pool already uses them.
   *
   * `whose` defaults to `"any"`. `"trigger-player"` is "that player" of a
   * triggered ability — the player its event names (`TargetSource.triggerPlayer`
   * — Alela, Cunning Conqueror's "goad target creature **that player**
   * controls", the player her Faeries dealt combat damage to).
   * `"defending-player"` is the player the ability's source is attacking, as
   * for `"creature-defending-player-controls"` (Kogla, the Titan Ape's
   * "target artifact or enchantment defending player controls") — or, once
   * it has left combat, the player it was attacking this combat (rule 508.5:
   * Armix, Filigree Thrasher's reflexive target with Armix gone).
   * `{ seat }` is one player, `seat` places after the spell's or ability's
   * controller in turn order (see {@link playerAtSeat}) — a slot bound to
   * "that player": Dismantling Wave's "for each opponent, destroy up to one
   * target artifact or enchantment that player controls" is one optional
   * slot per seat 1–3. A target that has come under anyone else's control
   * since is illegal as it resolves, as it is for the printed card. A spell
   * that changes controller has its targets moved to their players' new
   * slots (`Game.rebindSeatTargets`).
   */
  | {
      readonly kind: "permanent";
      readonly whose?: "any" | "you" | "opponent" | "trigger-player" | "defending-player" | TargetSeat;
      readonly filter: CardFilter;
      /** "…that's **attacking that player**" (Echoing Assault's "target
       * nontoken creature that's attacking that player", the player a
       * `attacks-player` trigger names): attacking that player itself — not
       * a planeswalker they control, which is a different thing to attack
       * (rules 506.3, 509.1a). Needs `TargetSource.triggerPlayer`. */
      readonly attacking?: "trigger-player";
      /** "…**or opponent**" / "…**or player**": a player is a legal target
       * of this slot too — Price of Betrayal's "target artifact, creature,
       * planeswalker, or opponent", Etched Slith's "another target permanent
       * or opponent" (`"opponent"`: a player other than the one choosing;
       * `"any"`: any player). `whose` and `filter` are only the permanent's, so
       * each part has its own: "any target that isn't a Dragon" (rule 115.4) is
       * `typesAnyOf` of creature, planeswalker and battle with `notSubtypes`,
       * every player still legal; "target creature token, player, or
       * planeswalker" (Coalborn Entity) is a `filter.anyOf`; "target opponent,
       * creature an opponent controls, or planeswalker an opponent controls"
       * (Nicol Bolas, God-Pharaoh) is `whose: "opponent"` with `"opponent"`. */
      readonly orPlayer?: "opponent" | "any";
      /** What the player part asks of a player, as `filter` asks of a
       * permanent: only one whose `turnStat` this turn is above 0. "Any target
       * **that was dealt damage this turn**" (Needle Drop) is the three
       * permanent types with `damagedThisTurnBy: {}`, `orPlayer: "any"` and
       * `{ turnStat: "damage-taken" }`. Part of the targeting requirement:
       * read as the target is chosen and again as it resolves (rule 608.2b). */
      readonly playerWith?: { readonly turnStat: TurnStat };
    }
  /**
   * "Target opponent who has **more life than you do** as you activate this
   * ability" — the Keepers' "…who controls more creatures than you do",
   * "…who has at least two more cards in hand than you do". `stat` is
   * compared with the targeting player's own: the opponent's must be at
   * least `by` more (`1` is "more", `2` "at least two more"; a negative `by`
   * is "at least that many fewer"). Creatures and lands count a token
   * stack as every token in it. "As you activate this ability": the
   * comparison is judged only as the target is chosen — as the ability
   * resolves, any opponent still in the game is a legal target
   * ({@link resolvingTargetSpec}).
   */
  | {
      readonly kind: "opponent-compared";
      readonly stat: PlayerStat;
      readonly by: number;
      /** "At least `by` **fewer**" (Keeper of the Dead), against the player's own. */
      readonly fewer?: true;
      /** The Oaths' "that player chooses target player who controls more
       * creatures than they do and is their opponent", at each player's
       * upkeep (with `targetsChosenBy: "active-player"`): the active player's
       * own is what's compared, and the target is their opponent, its
       * ability's controller possibly among them. Part of the targeting
       * requirement, not "as you activate": as it resolves, a target for whom
       * it's no longer true is illegal (rule 608.2b; the Oaths' rulings). */
      readonly comparedTo?: "active-player";
    }
  /**
   * A card in a graveyard — the general form for a graveyard the way
   * `permanent` is for the battlefield.
   *
   * Every other spec is a string literal because the set of "permanent on the
   * battlefield" shapes is small and enumerable. Graveyard targeting isn't:
   * cards differ on *whose* graveyard and on an arbitrary card filter
   * (Withered Wretch takes any card in any graveyard; Cemetery Reaper a
   * creature card; Haven of the Spirit Dragon a Dragon creature card in
   * **your** graveyard), and spelling each combination as its own literal
   * would not converge.
   *
   * `whose` defaults to `"any"`. `filter` is matched against the card's
   * printed characteristics — layer effects don't reach a graveyard.
   */
  | {
      readonly kind: "card-in-graveyard";
      /** `"defending-player"` reads the graveyard of whoever the ability's
       * source is currently attacking (Rakshasa Debaser), and so needs
       * `TargetSource.object` — the same way
       * `"creature-defending-player-controls"` does. `{ seat }` is one
       * player's graveyard, as for `permanent` — Afterlife from the Loam's
       * "for each player, choose up to one target creature card in that
       * player's graveyard" is one optional slot per seat 0–3.
       * `"trigger-player"` is "that player's graveyard" of a trigger naming a
       * player (Skullsnatcher's "whenever this creature deals combat damage
       * to a player, exile up to two target cards from that player's
       * graveyard"), as for `permanent`. */
      readonly whose?: "any" | "you" | "opponent" | "defending-player" | "trigger-player" | TargetSeat;
      readonly filter?: CardFilter;
    }
  /**
   * A card in exile (rule 406) — Pull from Eternity's "target **face-up**
   * exiled card", Runic Repetition's "target exiled card with flashback **you
   * own**" (`whose` is its owner), Gelatinous Cube's "target creature card
   * with mana value X **exiled with this creature**" (`linked`: rule 607.2a,
   * the cards linked to the source's battlefield stint — `exiledWith`, or
   * exiled until it leaves, `exiledUntil`).
   *
   * A card exiled face down has no characteristics (rule 406.3a), so a
   * `filter` never matches one, and `faceUp` leaves them out even with no
   * filter. `filter` reads the card's printed characteristics.
   */
  | {
      readonly kind: "card-in-exile";
      /** Its owner, as `card-in-graveyard` reads it: `"trigger-player"` is
       * "target face-up card **they own** in exile" of a trigger naming a
       * player (Time Reaper). */
      readonly whose?: "any" | "you" | "opponent" | "trigger-player";
      readonly linked?: true;
      readonly faceUp?: true;
      readonly filter?: CardFilter;
      /**
       * On a `reflexive-trigger`'s slot: "when you do, choose up to one target
       * creature card **exiled this way**" (Espers to Magicite). The cards a
       * resolution exiled are known only while it resolves and the reflexive
       * ability chooses its targets after it's done (rule 603.12), so they're
       * read as it triggers and the slot is rewritten with `among`.
       */
      readonly thisWay?: "exiled";
      /** Never authored: the cards `thisWay` named as the ability triggered. */
      readonly among?: readonly ObjectId[];
    }
  /**
   * A spell on the stack matching a filter — Red Elemental Blast's "counter
   * target **blue** spell", Mental Misstep's "target spell **with mana value
   * 1**". The filter reads the spell as it is on the stack: its printed
   * colours and types, and a mana value that counts its chosen {X} (rule
   * 202.3e). The string specs above stay for the unfiltered shapes.
   */
  | {
      readonly kind: "spell";
      /** Whose spell: "target instant or sorcery spell **you control**".
       * Defaults to `"any"`. */
      readonly whose?: "any" | "you" | "opponent";
      readonly filter: CardFilter;
    }
  /**
   * A spell on the stack **or** a permanent on the battlefield, in one slot
   * — "return target spell or nonland permanent an opponent controls to its
   * owner's hand" (Sink into Stupor). `whose` is the spell's or the
   * permanent's controller: "an opponent controls" reads on both nouns, as
   * in "target creature or planeswalker an opponent controls". `filter` is
   * matched against whichever it is — a spell is never a land, so
   * `notTypes: ["land"]` narrows only the permanents.
   */
  | {
      readonly kind: "spell-or-permanent";
      readonly whose?: "any" | "you" | "opponent";
      readonly filter?: CardFilter;
    }
  /**
   * An activated or triggered ability on the stack, narrowed — the general
   * form of `"activated-or-triggered-ability"`: "target activated or
   * triggered ability **you control**" (Lithoform Engine, Vantress Visions),
   * "… you control **from an enchantment source**" (Weaver of Harmony),
   * "target **triggered** ability you control" (Strionic Resonator). A
   * mana ability never is one (rule 605.3b); a Saga chapter is a triggered
   * ability (714.2b).
   */
  | {
      readonly kind: "ability";
      /** Whose ability: its controller. Defaults to `"any"`. `"opponent"` is
       * also "you don't control" (Nimble Obstructionist): everyone else at the
       * table is an opponent. */
      readonly whose?: "any" | "you" | "opponent";
      /** Only an activated or only a triggered ability — a Saga's chapter
       * ability, a delayed or reflexive trigger and a ward trigger are all
       * triggered (rules 714.2b, 603.7, 603.12, 702.21a). Either when
       * absent. */
      readonly abilityKind?: "activated" | "triggered";
      /** Only a loyalty ability: an activated ability with a loyalty symbol
       * in its cost (rule 606.2), whatever its source is now — "target
       * loyalty ability of a planeswalker" (Verdant Command) adds
       * `sourceTypes: ["planeswalker"]`. */
      readonly loyalty?: true;
      /** Its source has one of these card types — as it is, or as it last
       * existed on the battlefield if it has left there since the ability
       * went on the stack; a card in another zone (a channel ability's) by
       * its printed types. */
      readonly sourceTypes?: readonly CardType[];
      /** Its source matches this filter, read the same way as `sourceTypes`
       * (the object while it's still the one the ability came from, else as
       * it last existed on the battlefield — rule 113.7a): "from a
       * **colorless** source" (Abstruse Archaic, `{ colorless: true }`),
       * "from another **legendary** source **that's not a commander**" (The
       * Peregrine Dynamo, `{ supertype: "legendary", isCommander: false }`).
       * An ability with no source (the monarch's) never matches. */
      readonly sourceFilter?: CardFilter;
      /** "From **another** … source" (The Peregrine Dynamo): not an ability
       * of the permanent whose ability is choosing this target. */
      readonly otherSource?: true;
    }
  /**
   * A spell or an ability on the stack, in one slot — "target spell or
   * ability" (Deflecting Swat), "target instant spell, sorcery spell,
   * activated ability, or triggered ability" (Return the Favor), "target
   * spell or ability **with a single target**" (Bolt Bend). A mana ability
   * never is one (rule 605.3b); a Saga chapter, a delayed or reflexive trigger
   * and a ward trigger are triggered abilities.
   */
  | {
      readonly kind: "stack";
      /** Which spells: every one, only instants and sorceries, or none. */
      readonly spells: "any" | "instant-or-sorcery" | "none";
      /** Activated and triggered abilities too. */
      readonly abilities: boolean;
      /** "With a single target": exactly one target chosen as it went on the
       * stack (rule 115.9a — the same object twice is two), however many of
       * them are still legal. A slot its own rules filled isn't a target. */
      readonly singleTarget?: true;
      /** "…an opponent controls" (Teferi's Response): its controller. */
      readonly whose?: "any" | "you" | "opponent";
      /** "…that targets a land you control" (Teferi's Response): what it
       * targets now, as a spell filter's `targets` reads it. */
      readonly targeting?: SpellTargetsFilter;
    }
  /**
   * A slot that may be left empty — "up to one target creature" (Ajani,
   * Caller of the Pride), "up to two target creatures you don't control"
   * (Hate Mirage), "fights up to one target creature" (Primal Might).
   *
   * "Up to N" is spelled as N optional slots rather than a variable count, so
   * the shape of `targets` still matches the shape of the spec list and every
   * effect's `target:` index stays a fixed position. A skipped slot travels
   * as `null` in `Action.targets` and arrives at resolution as `undefined`,
   * which is what an effect reading `ctx.targets[i]` already checks for.
   */
  | { readonly kind: "optional"; readonly of: TargetSpec }
  /**
   * One slot over several kinds of object, each part with its own filter and
   * zone — "return target **spell or creature** to its owner's hand"
   * (Unsubstantiate), "target instant or sorcery card **from your graveyard or
   * exiled card with flashback you own**" (Sorceress's Schemes), "target
   * artifact card **in a graveyard or artifact on the battlefield**" (Daretti,
   * Ingenious Iconoclast), "target permanent **or suspended card**" (Shivan
   * Sand-Mage). A target is legal when any part accepts it. A part is a plain
   * spec: `optional`, `other` and `any-number` wrap the whole slot, not a part.
   * An effect on such a slot says what happens in each zone, as with
   * `spell-or-permanent`: a `sequence` of a return from each zone, of which
   * only the one from the zone the target is in does anything.
   */
  | { readonly kind: "one-of"; readonly of: readonly TargetSpec[] }
  /**
   * "**another** target …" / "target … **other than** …": whatever `of`
   * accepts, less one object or player — see {@link OtherThan}. Ezuri, Claw
   * of Progress's "another target creature you control" is `{ kind: "other",
   * of: "creature-you-control" }`. Nests either way round with `optional`
   * ("up to one other target creature").
   */
  | {
      readonly kind: "other";
      readonly of: TargetSpec;
      readonly than?: OtherThan;
      /** "…controlled by different players" (Protector of the Wastes): not
       * only another object than the earlier slots `than` names, but one
       * whose controller is none of theirs. Only with a slot relation. As
       * the spell or ability resolves, two such targets controlled by one
       * player are both illegal — one already illegal still lends its
       * controller, as it last existed, to that check (the Run Away Together
       * rulings). Needs {@link TargetFacts}. */
      readonly differentController?: true;
      /** "…**that player** controls" / "…controlled by **the same**
       * player": the slot's player is that of every slot `than` names —
       * Mutiny's "another target creature that player controls", Goblin
       * Welder's "target artifact card in that player's graveyard",
       * Incriminate's "two target creatures controlled by the same player".
       * A slot's player is the player itself for a player target, the
       * controller of a permanent, and the owner of a card anywhere else
       * (whose graveyard it's in). Only with a slot relation. As the spell
       * or ability resolves, a slot whose player is no longer the other's is
       * illegal (rule 608.2b); one already illegal still lends its player, as
       * it last existed. Needs {@link TargetFacts}. */
      readonly sameController?: true;
      /** With `sameController`: not "another", only the same player's — the
       * slot may name the very object slot `than` names. "Target player or
       * planeswalker and … target creature that player or that planeswalker's
       * controller controls" (Searing Blaze) uses the word "target" twice, so
       * a planeswalker that's also a creature may be chosen for both (rule
       * 115.3). Mutiny's "**another** target creature" stays without it. */
      readonly sameObjectAllowed?: true;
      /** "…that **share** a card type" / "…a creature type" / "…share
       * **no** creature types": the slot shares a type of that kind with
       * every slot `than` names (see {@link TargetShare}) — Shifting
       * Loyalties' "two target permanents that share a card type",
       * Legerdemain's "another target permanent that shares one of those
       * types with it", Rivals' Duel's "two target creatures that share no
       * creature types". Only with a slot relation. Checked as targets are
       * chosen (rule 601.2c) and again as the spell or ability resolves
       * (608.2b): a pair that no longer keeps it are both illegal; one
       * already illegal is read as it last existed (Secret Tunnel's and
       * Unbury's rulings). Needs {@link TargetFacts}' `shareTypes`. */
      readonly shares?: TargetShare;
      /** "…target Equipment **attached to that creature**" (Fiery
       * Annihilation): the slot is attached to the permanent of every slot
       * `than` names. Only with a slot relation. As it resolves, the slot is
       * illegal if it's no longer attached to it, or if that slot is
       * illegal (the rulings; rule 608.2b) — the host stays legal either
       * way. Needs {@link TargetFacts}' `attachedTo`. */
      readonly attachedToThan?: true;
    }
  /**
   * "Any number of target …" (rule 601.2c: none, one, or as many distinct
   * ones as there are) — Eerie Interlude's "exile any number of target
   * creatures you control". A *group*: always the last slot of its list, and
   * at most one per list. An offer lists it as one slot with `of`'s
   * options; a choice fills it with as many distinct targets as the player
   * picks, each one slot of the flat target list from the group's index on,
   * so the slots before it keep their positions. The count chosen is fixed
   * as the spell or ability goes on the stack — see
   * {@link concreteTargetSpecs}, which every check of a choice goes through.
   * An effect reaches the members with `for-each-target` (one at a time,
   * each bound to the group's slot) or a `{ from }` slot list.
   */
  | {
      readonly kind: "any-number";
      readonly of: TargetSpec;
      /** At most this many — Magma Opus's "4 damage divided as you choose
       * among any number of targets", where each target needs at least 1.
       * `"x"` is the spell's own X: "destroy **up to X** target artifacts"
       * (Pest Infestation). X is announced before targets are chosen (rule
       * 601.2b–c), so a choice is judged at the X it was cast with — see
       * {@link specsAtX}. Only on a spell or activated ability whose group
       * is its only slot (Shigeki, Jukai Visionary's channel). A whole
       * multiple of X is `{ product: ["x", 2] }` — "exile **up to twice X**
       * target cards from graveyards" (Erebos's Intervention), judged the
       * same way ({@link xMultiple}).
       *
       * On a spell another {@link EffectAmount} is read as it's cast, the
       * kicks already announced (rules 601.2b–c): "choose another target for
       * each time this spell was kicked" (Comet Storm: `min` and `max` one
       * plus `{ timesKicked: "source" }`), "up to X target creatures, where X
       * is … as you cast this spell" (Aether Burst).
       *
       * On a triggered or activated ability any {@link EffectAmount} will do
       * — "up to X target artifacts, where X is the number of Vampires you
       * control" (Midnight Arsonist), "up to that many" (a reflexive
       * ability's `{ triggerValue: true }`), and `"x"` the ability's own X
       * (a permanent's enters ability reads the X it was cast with). It is
       * read once, as the targets are chosen: as the ability is put on the
       * stack (rule 603.3d), or as it is activated, before its costs are
       * paid (601.2c, 602.2b — Serra's Liturgy counts its verse counters
       * before it's sacrificed). The count is fixed from then on, like any
       * group's ({@link concreteTargetSpecs}); see {@link specsWithAmounts}. */
      readonly max?: EffectAmount;
      /** At least this many: `"x"` with `max: "x"` is exactly X — Curse of
       * the Swine's "exile **X** target creatures"; on an ability, any
       * amount, as `max` (Lost in the Maze's "tap X target creatures"). */
      readonly min?: EffectAmount;
      /** "…with total power N or less" (Reunion of the House): the members'
       * powers, as they are where they're targeted, add up to at most this.
       * Checked as they're chosen and again as the spell resolves, when a
       * total over it makes every member illegal (the ruling). Needs
       * {@link TargetFacts}. */
      readonly maxTotalPower?: number;
      /** "…with total mana value N or less" (Patch Up, March from the
       * Tomb): as `maxTotalPower`, over the members' mana values. An
       * amount on an ability, read with its bounds (Orcus, Prince of
       * Undeath's "total mana value X or less"; Ancient Brass Dragon's
       * die roll, a reflexive ability's `{ triggerValue: true }`); `"x"`
       * on a spell is its X. Needs {@link TargetFacts}' `manaValueOf`. */
      readonly maxTotalManaValue?: EffectAmount;
      /** "…that each have a **different** mana value" (Agadeem's
       * Awakening): no two members share one. Checked as they're chosen
       * and again as it resolves, as the totals are. */
      readonly differentManaValues?: true;
      /** "…target creatures **with equal toughness**" (V.A.T.S.): every
       * member's toughness is the first one's. Checked as they're chosen
       * and again as it resolves, over the members still legal then: no
       * longer all equal, every member is illegal (the ruling — "none of
       * the chosen creatures will be destroyed"); a lone one never breaks
       * it. Needs {@link TargetFacts}' `toughnessOf`. */
      readonly equalToughness?: true;
      /** "…target creature cards **with different names**" (Behold the
       * Sinister Six!): no two members share a name. Checked as
       * `differentManaValues` is. Needs {@link TargetFacts}' `nameOf`. */
      readonly differentNames?: true;
      /** Every member's player is the same — "up to two target cards **from
       * a single graveyard**" (Decompose), "two target cards from **an
       * opponent's** graveyard" (Nullmage Advocate: one opponent's) — or,
       * `{ slot }`, the player of that earlier slot: "target player shuffles
       * up to four target cards **from their graveyard**" (Witness the
       * Future). Each member is an `other` slot with `sameController` (see
       * it) — {@link concreteTargetSpecs}. Needs {@link TargetFacts}. */
      readonly sameController?: true | { readonly slot: number };
      /** No two members share a controller — "any number of target tapped
       * creatures **with different controllers**" (Cloud's Limit Break). Each
       * member past the first is an `other` slot with `differentController`
       * (see it) — {@link concreteTargetSpecs} — so as it resolves, two
       * members one player controls by then are both illegal (rule 608.2b).
       * Needs {@link TargetFacts}. */
      readonly differentControllers?: true;
    };

/**
 * What a relation among targets needs to know about one that the reference
 * alone can't say — who controls it, its power — supplied by whoever holds
 * the board: the engine from the state, a client from its view. A chooser
 * without them narrows nothing by these relations (the engine still refuses
 * a choice that breaks one).
 */
export interface TargetFacts {
  readonly controllerOf: (ref: TargetRef) => PlayerId | undefined;
  readonly powerOf: (ref: TargetRef) => number;
  /** Its mana value where it is — for a group's `maxTotalManaValue` and
   * `differentManaValues`. Without it those narrow nothing. */
  readonly manaValueOf?: (ref: TargetRef) => number;
  /** Its toughness where it is — for a group's `equalToughness`. Without
   * it that narrows nothing. */
  readonly toughnessOf?: (ref: TargetRef) => number;
  /** Its name — for a group's `differentNames`. Without it that narrows
   * nothing. */
  readonly nameOf?: (ref: TargetRef) => string;
  /** Do `a` and `b` share a type of `share`'s kind (see
   * {@link TargetShare})? `none` isn't this one's to read: the relation
   * negates the answer. Without it an `other` slot's `shares` narrows
   * nothing. */
  readonly shareTypes?: (a: TargetRef, b: TargetRef, share: TargetShare) => boolean;
  /** The permanent it's attached to, if any — for an `other` slot's
   * `attachedToThan`. Without it that narrows nothing. */
  readonly attachedTo?: (ref: TargetRef) => ObjectId | undefined;
  /** How many tokens it is, for a compacted stack on the battlefield (else
   * 1). Each token is another object, so "another target" may name a stack
   * once per token (601.2c, `lockInTargets` then gives each slot its own).
   * Without it a stack is one object: the bots' `targetCombos` search. */
  readonly stackSize?: (ref: TargetRef) => number;
}

/** How many of `ref`'s tokens `picked` hasn't yet named: 0 for anything but
 * a compacted stack with some left, so what's already picked stays out. */
function tokensLeft(
  ref: TargetRef,
  picked: readonly (TargetRef | null | undefined)[],
  facts: TargetFacts | undefined,
): number {
  const size = facts?.stackSize?.(ref) ?? 1;
  if (size <= 1) return 0;
  return Math.max(0, size - picked.filter((p) => p !== null && p !== undefined && sameTarget(ref, p)).length);
}

/** How many different objects `refs` are between them, a stack each of its
 * tokens: what an "another target" group can be filled from. */
export function targetUnits(refs: readonly TargetRef[], facts: TargetFacts | undefined): number {
  return refs.reduce((n, ref) => n + (facts?.stackSize?.(ref) ?? 1), 0);
}

/** Must slot `spec` be attached to the slots its relation names
 * (`attachedToThan`)? Looked for through an `optional` wrapper. */
export function attachedToThanOf(spec: TargetSpec): boolean {
  if (typeof spec !== "object") return false;
  if (spec.kind === "other") return spec.attachedToThan === true;
  if (spec.kind === "optional") return attachedToThanOf(spec.of);
  return false;
}

/** Is target `ref` attached to target `host` — `undefined` when the facts
 * can't tell. */
export function attachedHolds(ref: TargetRef, host: TargetRef, facts: TargetFacts): boolean | undefined {
  if (facts.attachedTo === undefined) return undefined;
  return host.kind === "object" && facts.attachedTo(ref) === host.object;
}

/**
 * A relation of shared types between two targets — `other`'s `shares`.
 * `kind` is which types count: `"card"` the card types (rule 205.2a —
 * artifact, battle, creature, enchantment, kindred, land, planeswalker,
 * and instant and sorcery off the battlefield), `"creature"` the creature
 * types (205.3m — a changeling has every one, 702.73a; one with none shares
 * none). `among` narrows the card types that count to these — "shares
 * **one of those types** with it" after "target artifact, creature, or
 * land" (Gauntlets of Chaos). `none` turns it round: "share **no**
 * creature types" (Rivals' Duel).
 */
export interface TargetShare {
  readonly kind: "card" | "creature";
  readonly among?: readonly CardType[];
  readonly none?: true;
}

/** Slot `spec`'s shared-types relation with the slots its relation names,
 * if it has one — through an `optional` wrapper. */
export function sharesOf(spec: TargetSpec): TargetShare | undefined {
  if (typeof spec !== "object") return undefined;
  if (spec.kind === "other") return spec.shares;
  if (spec.kind === "optional") return sharesOf(spec.of);
  return undefined;
}

/** Do targets `a` and `b` keep a `shares` relation — `undefined` when the
 * facts can't tell (a chooser without `shareTypes`). */
export function sharesHold(
  a: TargetRef,
  b: TargetRef,
  share: TargetShare,
  facts: TargetFacts,
): boolean | undefined {
  if (facts.shareTypes === undefined) return undefined;
  const shared = facts.shareTypes(a, b, share);
  return share.none === true ? !shared : shared;
}

/** Is slot `spec` "…controlled by different players" from the slots its
 * relation names? Looked for through an `optional` wrapper. */
export function differentControllerOf(spec: TargetSpec): boolean {
  if (typeof spec !== "object") return false;
  if (spec.kind === "other") return spec.differentController === true;
  if (spec.kind === "optional") return differentControllerOf(spec.of);
  return false;
}

/** Must slot `spec` share its player with the slots its relation names
 * (`sameController`)? Looked for through an `optional` wrapper. */
export function sameControllerOf(spec: TargetSpec): boolean {
  if (typeof spec !== "object") return false;
  if (spec.kind === "other") return spec.sameController === true;
  if (spec.kind === "optional") return sameControllerOf(spec.of);
  return false;
}

/** May slot `spec` name the very object its relation names — two instances of
 * the word "target" (`sameObjectAllowed`, rule 115.3)? Looked for through an
 * `optional` wrapper. */
export function sameObjectAllowedOf(spec: TargetSpec): boolean {
  if (typeof spec !== "object") return false;
  if (spec.kind === "other") return spec.sameObjectAllowed === true;
  if (spec.kind === "optional") return sameObjectAllowedOf(spec.of);
  return false;
}

/** The player a target is about, for a `sameController` relation: a player
 * target's own, an object's controller (a card off the battlefield: its
 * owner, which {@link TargetFacts} answers). */
export function playerOfTarget(ref: TargetRef, facts: TargetFacts): PlayerId | undefined {
  return ref.kind === "player" ? ref.player : facts.controllerOf(ref);
}

/** A group's "total power N or less", if it has one. */
export function groupMaxTotalPower(spec: TargetSpec | undefined): number | undefined {
  return typeof spec === "object" && spec.kind === "any-number" ? spec.maxTotalPower : undefined;
}

/** A group's "total mana value N or less", once fixed at a number — an
 * unread amount caps nothing yet ({@link specsWithAmounts}). */
export function groupMaxTotalManaValue(spec: TargetSpec | undefined): number | undefined {
  return typeof spec === "object" && spec.kind === "any-number" && typeof spec.maxTotalManaValue === "number"
    ? spec.maxTotalManaValue
    : undefined;
}

/** Does this list have an "any number of target …" group whose size is tied
 * to the spell's X (`min` or `max` of `"x"`)? */
export function groupReadsX(specs: readonly TargetSpec[]): boolean {
  const spec = specs[anyNumberSlot(specs)];
  return (
    typeof spec === "object" &&
    spec.kind === "any-number" &&
    (xMultiple(spec.max) !== undefined || xMultiple(spec.min) !== undefined)
  );
}

/** How many times the spell's own X a group's bound is, when it is nothing
 * else: 1 for `"x"`, 2 for "twice X" (`{ product: ["x", 2] }`, either order,
 * a whole number of times). `undefined` for a number or any other amount. */
export function xMultiple(amount: EffectAmount | undefined): number | undefined {
  if (amount === "x") return 1;
  if (typeof amount !== "object" || !("product" in amount) || amount.product.length !== 2) return undefined;
  const [a, b] = amount.product;
  const times = a === "x" ? b : b === "x" ? a : undefined;
  return typeof times === "number" && Number.isInteger(times) && times >= 1 ? times : undefined;
}

/** `specs` with an "any number of target …" group's `"x"` bounds (and a
 * `"x"` total mana value) fixed at `x` — what a choice made at that X is
 * judged against (rule 601.2c). */
export function specsAtX(specs: readonly TargetSpec[], x: number): readonly TargetSpec[] {
  const spec = specs[anyNumberSlot(specs)];
  if (!groupReadsX(specs) && !(typeof spec === "object" && spec.kind === "any-number" && spec.maxTotalManaValue === "x")) {
    return specs;
  }
  return specs.map((spec) =>
    typeof spec === "object" && spec.kind === "any-number"
      ? {
          ...spec,
          ...(xMultiple(spec.max) !== undefined ? { max: x * (xMultiple(spec.max) ?? 1) } : {}),
          ...(xMultiple(spec.min) !== undefined ? { min: x * (xMultiple(spec.min) ?? 1) } : {}),
          ...(spec.maxTotalManaValue === "x" ? { maxTotalManaValue: x } : {}),
        }
      : spec,
  );
}

/** Does this list's "any number of target …" group have a bound or a total
 * that isn't a number yet — an amount (or `"x"`) an ability reads as its
 * targets are chosen? */
export function groupReadsAmount(specs: readonly TargetSpec[]): boolean {
  const spec = specs[anyNumberSlot(specs)];
  return (
    typeof spec === "object" &&
    spec.kind === "any-number" &&
    [spec.max, spec.min, spec.maxTotalManaValue].some((a) => a !== undefined && typeof a !== "number")
  );
}

/** Does this list's group have a bound or a total that's an amount other
 * than a spell's `"x"`, which a spell reads as it's cast? */
export function groupReadsCastAmount(specs: readonly TargetSpec[]): boolean {
  const spec = specs[anyNumberSlot(specs)];
  return (
    typeof spec === "object" &&
    spec.kind === "any-number" &&
    [spec.max, spec.min, spec.maxTotalManaValue].some(
      (a) => a !== undefined && typeof a !== "number" && xMultiple(a) === undefined,
    )
  );
}

/**
 * `specs` with every amount in its "any number of target …" group — `max`,
 * `min`, `maxTotalManaValue` — read by `value` into a number: a triggered
 * ability's as it's put on the stack, an activated one's as it's activated
 * (see the group's `max`). Everything from there judges a choice against the
 * numbers, and the ability on the stack keeps the count it was given. An
 * amount `value` answers `undefined` for stays as it is.
 */
export function specsWithAmounts(
  specs: readonly TargetSpec[],
  value: (amount: EffectAmount) => number | undefined,
): readonly TargetSpec[] {
  if (!groupReadsAmount(specs)) return specs;
  // `undefined` from `value` leaves that amount unread.
  const read = (a: EffectAmount | undefined) => (a === undefined || typeof a === "number" ? a : (value(a) ?? a));
  return specs.map((spec) => {
    if (typeof spec !== "object" || spec.kind !== "any-number") return spec;
    const max = read(spec.max);
    const min = read(spec.min);
    const total = read(spec.maxTotalManaValue);
    return {
      ...spec,
      ...(max !== undefined ? { max } : {}),
      ...(min !== undefined ? { min } : {}),
      ...(total !== undefined ? { maxTotalManaValue: total } : {}),
    };
  });
}

/** A group's numeric bounds; an unfixed `"x"` bounds nothing. */
export function groupBounds(spec: TargetSpec): { readonly min: number; readonly max: number } {
  if (typeof spec !== "object" || spec.kind !== "any-number") return { min: 0, max: Number.POSITIVE_INFINITY };
  return {
    min: typeof spec.min === "number" ? spec.min : 0,
    max: typeof spec.max === "number" ? spec.max : Number.POSITIVE_INFINITY,
  };
}

/** Where a list's "any number of target …" group is (see the `any-number`
 * {@link TargetSpec}), or -1 for a list without one. */
export function anyNumberSlot(specs: readonly TargetSpec[]): number {
  return specs.findIndex((spec) => typeof spec === "object" && spec.kind === "any-number");
}

/**
 * A spec list as `count` chosen targets fill it: the slots before an
 * "any number of target …" group as declared, then one slot per member of
 * the group — each of its `of` spec, and each after the first "other than"
 * the members before it, since one instance of the word "target" names an
 * object once (rule 601.2c). A list without a group comes back as it is.
 *
 * The count is the length of the chosen target list — at a cast, an
 * activation or a trigger's choice, and again as it resolves, from the
 * targets it went on the stack with — so every check of a choice judges it
 * against specs of its own shape, and a resolution never re-derives its
 * shape from the board.
 */
export function concreteTargetSpecs(specs: readonly TargetSpec[], count: number): readonly TargetSpec[] {
  const group = anyNumberSlot(specs);
  if (group < 0) return specs;
  const spec = specs[group];
  if (typeof spec !== "object" || spec.kind !== "any-number") return specs;
  const out: TargetSpec[] = specs.slice(0, group);
  // "From a single graveyard": each member shares its player with the ones
  // before it — and, tied to a slot, with that slot's.
  const same = spec.sameController;
  const anchor = typeof same === "object" ? [same.slot] : [];
  // A group `other` than an earlier slot ("…and up to one other target
  // creature", Graceful Takedown): every member differs from that slot too,
  // in the one `than` a slot's relation is read from.
  const tiedTo = otherThan(spec.of);
  const tied = typeof tiedTo === "object" ? otherThanSlots(tiedTo) : [];
  for (let member = 0; member < Math.max(0, count - group); member += 1) {
    const before = Array.from({ length: member }, (_unused, i) => group + i);
    const than = [...anchor, ...(anchor.length + before.length > 0 ? tied : []), ...before];
    out.push(
      than.length === 0
        ? spec.of
        : {
            kind: "other",
            of: spec.of,
            than: { slots: than },
            ...(same !== undefined ? { sameController: true } : {}),
            // "With different controllers": none controlled by an earlier
            // member's controller.
            ...(spec.differentControllers === true ? { differentController: true } : {}),
          },
    );
  }
  return out;
}

/** A target slot bound to one player by where they sit — see
 * {@link playerAtSeat}. */
export interface TargetSeat {
  readonly seat: number;
}

/**
 * The player `seat` places after `player` in turn order — 0 is `player`
 * themself, 1 the next player, and so on — or `undefined` past the table.
 * What a `{ seat }` target spec is bound to. Turn order keeps a player who
 * has left the game in it, so the others' seats don't shift (a departed
 * player has nothing left to target). A game seats at most four, so seats
 * 1–3 are every opponent and 0–3 every player.
 */
/** The spec a target is judged by as its spell or ability resolves: the
 * same, except that an `opponent-compared` slot's comparison was only "as
 * you activate this ability" — then any opponent will do. */
export function resolvingTargetSpec(spec: TargetSpec): TargetSpec {
  return typeof spec === "object" && spec.kind === "opponent-compared" && spec.comparedTo === undefined ? "opponent" : spec;
}

export function playerAtSeat(
  turnOrder: readonly PlayerId[],
  player: PlayerId,
  seat: number,
): PlayerId | undefined {
  const at = turnOrder.indexOf(player);
  if (at < 0 || seat < 0 || seat >= turnOrder.length) return undefined;
  return turnOrder[(at + seat) % turnOrder.length];
}

/** The seat a target spec's slot is bound to, through its `optional`: a
 * `{ seat }` permanent or graveyard card; undefined for any other. */
export function seatOfTargetSpec(spec: TargetSpec): number | undefined {
  const inner = typeof spec === "object" && spec.kind === "optional" ? spec.of : spec;
  if (typeof inner !== "object" || (inner.kind !== "permanent" && inner.kind !== "card-in-graveyard")) return undefined;
  return typeof inner.whose === "object" ? inner.whose.seat : undefined;
}

/** How a `{ seat }` spec names its player in a prompt. */
function seatWords(seat: number, possessive: boolean): string {
  if (seat === 0) return possessive ? "your" : "you";
  const who = seat === 1 ? "the next opponent" : `the opponent ${seat} seats on`;
  return possessive ? `${who}'s` : who;
}

/**
 * What an `other` slot must differ from:
 * - `"source"` (the default) — the spell's or ability's own source, the
 *   usual "another target …" (Brash Taunter's "fights another target
 *   creature").
 * - `"trigger-object"` — the object whose event fired the trigger ("target
 *   creature other than that creature").
 * - `"trigger-player"` — the player the triggering event names (The Lord of
 *   Pain's "another target player": other than the one who cast the spell).
 * - `{ slot }` — the target chosen for an earlier slot of the same spell or
 *   ability (Ulvenwald Tracker's "target creature you control fights
 *   **another** target creature"). A relation between two slots, so each
 *   slot's options still list everything and the pair is checked together;
 *   choosers narrow a slot's options by what they already picked
 *   (`slotOptions`). Not for a trigger whose slots the event fills.
 * - `{ slots }` — every one of several earlier slots. "Two target lands" is
 *   one instance of the word "target", and the same object can be chosen
 *   only once for it (rule 601.2c): each slot after the first differs from
 *   all the slots before it. The `distinctTargets` card helper builds them.
 */
export type OtherThan =
  | "source"
  | "trigger-object"
  | "trigger-player"
  /** The permanent the source is attached to — Pain for All's "any **other**
   * target" of its enchanted creature's damage. */
  | "host"
  | { readonly slot: number }
  | { readonly slots: readonly number[] };

/** The earlier slots an `other` relation names — none for one that is about
 * the source, the trigger object or the trigger player. */
export function otherThanSlots(than: OtherThan): readonly number[] {
  if (typeof than !== "object") return [];
  return "slot" in than ? [than.slot] : than.slots;
}

/**
 * `spec` with its "other than slot n" relation renumbered through `kept`
 * (old slot → new) — for a choice offered over only some of a spell's slots,
 * a copy's new targets (rule 707.10c). A slot left out isn't offered, so the
 * relation to it goes; with none left, the plain spec it wraps.
 */
export function renumberOtherSlots(spec: TargetSpec, kept: ReadonlyMap<number, number>): TargetSpec {
  if (typeof spec !== "object") return spec;
  if (spec.kind === "optional") return { ...spec, of: renumberOtherSlots(spec.of, kept) };
  if (spec.kind !== "other" || spec.than === undefined || typeof spec.than !== "object") return spec;
  const slots = otherThanSlots(spec.than).flatMap((slot) => {
    const to = kept.get(slot);
    return to === undefined ? [] : [to];
  });
  return slots.length === 0 ? spec.of : { ...spec, than: { slots } };
}

/**
 * `spec` with every slot it relates to moved `by` places on — the `than`
 * slots of an `other` relation and a group's `sameController: { slot }`,
 * through `optional`, `other` and `any-number` wrappers. A mode's slot
 * numbers are its own (Amazing Acrobatics' second mode "other than slot 0"
 * is its own first slot), so each mode's specs are moved by where its
 * slots begin in the chosen modes' list (`concatModeSpecs`).
 */
export function offsetSlotRelations(spec: TargetSpec, by: number): TargetSpec {
  if (by === 0 || typeof spec !== "object") return spec;
  if (spec.kind === "optional") return { ...spec, of: offsetSlotRelations(spec.of, by) };
  if (spec.kind === "any-number") {
    const same = spec.sameController;
    return {
      ...spec,
      of: offsetSlotRelations(spec.of, by),
      ...(typeof same === "object" ? { sameController: { slot: same.slot + by } } : {}),
    };
  }
  if (spec.kind !== "other") return spec;
  const of = offsetSlotRelations(spec.of, by);
  const than = spec.than;
  if (than === undefined || typeof than !== "object") return { ...spec, of };
  return { ...spec, of, than: "slot" in than ? { slot: than.slot + by } : { slots: than.slots.map((s) => s + by) } };
}

/** The slots of several modes (or a base list then modes) as one list, each
 * part's slot relations moved to where its slots now sit
 * ({@link offsetSlotRelations}). */
export function concatModeSpecs(parts: readonly (readonly TargetSpec[])[]): readonly TargetSpec[] {
  const out: TargetSpec[] = [];
  for (const part of parts) {
    const at = out.length;
    for (const spec of part) out.push(offsetSlotRelations(spec, at));
  }
  return out;
}

/**
 * Targets as the engine carries them internally, once a dispatched action has
 * been normalized: a **hole** (`undefined`) where an optional slot was
 * skipped. `undefined` rather than `null` on purpose — every effect already
 * guards `ctx.targets[i]` with an `undefined` check, because an out-of-range
 * index reads that way, so skipped slots need no new handling anywhere.
 */
export type ResolvedTargets = readonly (TargetRef | undefined)[];

/**
 * An amount "divided as you choose" among the targets of a group (rule
 * 601.2d, for a spell; 602.2b for an activated ability, 603.3d for a
 * triggered one): the targets from `divided.slot` on share `divided.total`.
 * Announced as the spell or ability goes on the stack — `chosen`, checked:
 * one share per target of the group, each a whole number of at least 1, all
 * of `total` — or, when its controller didn't say, as evenly as it goes with
 * the earlier targets taking the remainder (the only split there is when the
 * total leaves no choice: 2 among two targets). No targets in the group
 * divide nothing. A string says what's wrong.
 */
export function divisionOf(
  divided: { readonly total: number; readonly slot: number; readonly upTo?: true },
  targets: ResolvedTargets,
  chosen: readonly number[] | undefined,
): readonly number[] | string {
  const members = targets.slice(divided.slot).filter((t) => t !== undefined).length;
  if (members === 0) return chosen === undefined || chosen.length === 0 ? [] : "no targets to divide among";
  if (members > divided.total) return `${divided.total} can't be divided among ${members} targets`;
  if (chosen === undefined) {
    const base = Math.floor(divided.total / members);
    return Array.from({ length: members }, (_unused, i) => base + (i < divided.total % members ? 1 : 0));
  }
  if (chosen.length !== members) return `the division names ${chosen.length} shares for ${members} targets`;
  if (chosen.some((n) => !Number.isInteger(n) || n < 1)) return "each target must get at least 1";
  const sum = chosen.reduce((a, b) => a + b, 0);
  if (divided.upTo === true ? sum > divided.total : sum !== divided.total) {
    return divided.upTo === true ? `the division may total at most ${divided.total}` : `the division must total ${divided.total}`;
  }
  return [...chosen];
}

/**
 * `specs` with the divided group at `divide.slot` capped at `divide.total`
 * members: each target gets at least 1 of what's divided (rule 601.2d), so
 * no more targets than there is to divide — Volcanic Wind's "any number of
 * target creatures" with three creatures on the battlefield is three at
 * most. A bound that is a number already keeps the smaller; one that isn't
 * a number yet (an unread `"x"`) is left as it is.
 */
export function specsCappedByDivision(
  specs: readonly TargetSpec[],
  divide: { readonly total: number; readonly slot: number },
): readonly TargetSpec[] {
  const spec = specs[divide.slot];
  if (typeof spec !== "object" || spec.kind !== "any-number") return specs;
  if (spec.max !== undefined && typeof spec.max !== "number") return specs;
  const max = Math.min(spec.max ?? Number.POSITIVE_INFINITY, divide.total);
  if (max === spec.max) return specs;
  return specs.map((s, i) => (i === divide.slot ? { ...spec, max } : s));
}

/** Whether two target references name the same player or object. */
export function sameTargetRef(a: TargetRef, b: TargetRef): boolean {
  return a.kind === "player"
    ? b.kind === "player" && a.player === b.player
    : b.kind === "object" && a.object === b.object;
}

/** Turn a dispatched action's `null` holes into `undefined` ones. */
export function normalizeTargets(
  chosen: readonly (TargetRef | null)[] | undefined,
): ResolvedTargets {
  return (chosen ?? []).map((ref) => ref ?? undefined);
}

/** The underlying spec a (possibly optional) slot accepts — for an "any
 * number of target …" group, what each of its members accepts. */
export function requiredSpec(spec: TargetSpec): TargetSpec {
  if (typeof spec !== "object") return spec;
  if (spec.kind === "optional" || spec.kind === "any-number") return requiredSpec(spec.of);
  if (spec.kind === "other") return { ...spec, of: requiredSpec(spec.of) };
  return spec;
}

/** May this slot be left empty? An "any number of target …" group may:
 * none is a number. */
export function isOptionalSpec(spec: TargetSpec): boolean {
  if (typeof spec !== "object") return false;
  if (spec.kind === "optional" || spec.kind === "any-number") return true;
  return spec.kind === "other" && isOptionalSpec(spec.of);
}

/** What this slot must differ from, if it's an "another …" slot — looked for
 * through an `optional` wrapper too. See {@link OtherThan}. */
export function otherThan(spec: TargetSpec): OtherThan | undefined {
  if (typeof spec !== "object") return undefined;
  if (spec.kind === "other") return spec.than ?? "source";
  if (spec.kind === "optional") return otherThan(spec.of);
  return undefined;
}

const sameTarget = (a: TargetRef, b: TargetRef): boolean =>
  a.kind === "player"
    ? b.kind === "player" && a.player === b.player
    : b.kind === "object" && a.object === b.object;

/**
 * Slot `i`'s options once an "other than slot n" relation (see
 * {@link OtherThan}) has been applied against the targets already `picked`
 * for the slots before it — what a chooser filling the slots in order should
 * offer. Every other slot's options come back as they are.
 */
export function slotOptions(
  specs: readonly TargetSpec[],
  options: readonly (readonly TargetRef[])[],
  i: number,
  picked: readonly (TargetRef | null | undefined)[],
  facts?: TargetFacts,
): readonly TargetRef[] {
  // Past an "any number of target …" group's start, every pick is another
  // member of that one group: its options, less what it has already named.
  const group = anyNumberSlot(specs);
  if (group >= 0 && i >= group) {
    const taken = picked
      .slice(group)
      .filter((ref): ref is TargetRef => ref !== null && ref !== undefined);
    // A group already at its `max` takes no more.
    const spec = specs[group];
    if (taken.length >= groupBounds(spec).max) {
      return [];
    }
    let left = (options[group] ?? []).filter(
      (ref) => !taken.some((t) => sameTarget(ref, t)) || tokensLeft(ref, picked, facts) > 0,
    );
    // A group `other` than an earlier slot offers nothing that slot named
    // (rule 601.2c): its member's spec, judged as a plain slot over what's left.
    if (typeof spec === "object" && spec.kind === "any-number" && typeof otherThan(spec.of) === "object") {
      left = [...slotOptions([...specs.slice(0, group), spec.of], [...options.slice(0, group), left], group, picked, facts)];
    }
    if (facts === undefined) return left;
    // "From a single graveyard": the player of the first member (or of the
    // slot the group is tied to) is every member's.
    const same = typeof spec === "object" && spec.kind === "any-number" ? spec.sameController : undefined;
    if (same !== undefined) {
      const anchorRef = typeof same === "object" ? picked[same.slot] : taken[0];
      const player = anchorRef === null || anchorRef === undefined ? undefined : playerOfTarget(anchorRef, facts);
      if (anchorRef !== null && anchorRef !== undefined) {
        left = left.filter((ref) => player !== undefined && playerOfTarget(ref, facts) === player);
      }
    }
    // "With different controllers": none whose controller a member has.
    if (typeof spec === "object" && spec.kind === "any-number" && spec.differentControllers === true) {
      const controllers = new Set(taken.map((t) => facts.controllerOf(t)));
      left = left.filter((ref) => !controllers.has(facts.controllerOf(ref)));
    }
    // "With total power 10 or less": only what still fits.
    const most = groupMaxTotalPower(spec);
    if (most !== undefined) {
      const budget = most - taken.reduce((n, t) => n + facts.powerOf(t), 0);
      left = left.filter((ref) => facts.powerOf(ref) <= budget);
    }
    // "With equal toughness": only the first member's; "with different
    // names": none already named.
    if (typeof spec === "object" && spec.kind === "any-number") {
      const toughnessOf = facts.toughnessOf;
      if (spec.equalToughness === true && toughnessOf !== undefined && taken.length > 0) {
        const toughness = toughnessOf(taken[0]);
        left = left.filter((ref) => toughnessOf(ref) === toughness);
      }
      const nameOf = facts.nameOf;
      if (spec.differentNames === true && nameOf !== undefined) {
        const used = new Set(taken.map(nameOf));
        left = left.filter((ref) => !used.has(nameOf(ref)));
      }
    }
    // So for "total mana value 3 or less", and "each a different mana value".
    const manaValueOf = facts.manaValueOf;
    if (manaValueOf === undefined) return left;
    const mostMv = groupMaxTotalManaValue(spec);
    if (mostMv !== undefined) {
      const budget = mostMv - taken.reduce((n, t) => n + manaValueOf(t), 0);
      left = left.filter((ref) => manaValueOf(ref) <= budget);
    }
    if (typeof spec === "object" && spec.kind === "any-number" && spec.differentManaValues === true) {
      const used = new Set(taken.map(manaValueOf));
      left = left.filter((ref) => !used.has(manaValueOf(ref)));
    }
    return left;
  }
  const all = options[i] ?? [];
  const than = specs[i] === undefined ? undefined : otherThan(specs[i]);
  if (than === undefined) return all;
  const earlier = otherThanSlots(than)
    .map((slot) => picked[slot])
    .filter((ref): ref is TargetRef => ref !== null && ref !== undefined);
  if (earlier.length === 0) return all;
  const mayRepeat = specs[i] !== undefined && sameObjectAllowedOf(specs[i]);
  let distinct = mayRepeat
    ? all
    : all.filter((ref) => !earlier.some((e) => sameTarget(ref, e)) || tokensLeft(ref, picked, facts) > 0);
  if (facts === undefined || specs[i] === undefined) return distinct;
  // "…that share a card type", "…share no creature types": only those
  // keeping it with every earlier one.
  const share = sharesOf(specs[i]);
  if (share !== undefined) {
    distinct = distinct.filter((ref) => earlier.every((e) => sharesHold(ref, e, share, facts) !== false));
  }
  // "…attached to that creature": only what's attached to it.
  if (attachedToThanOf(specs[i])) {
    distinct = distinct.filter((ref) => earlier.every((e) => attachedHolds(ref, e, facts) !== false));
  }
  // "…that player controls": only those whose player is every earlier one's.
  if (sameControllerOf(specs[i])) {
    const players = new Set(earlier.map((e) => playerOfTarget(e, facts)));
    return distinct.filter((ref) => {
      const player = playerOfTarget(ref, facts);
      return player !== undefined && players.size === 1 && players.has(player);
    });
  }
  // "…controlled by different players": none whose controller is taken.
  if (!differentControllerOf(specs[i])) return distinct;
  const controllers = new Set(earlier.map((e) => facts.controllerOf(e)));
  return distinct.filter((ref) => !controllers.has(facts.controllerOf(ref)));
}

/**
 * Can every required slot be filled at once, from `options`, with every
 * "other than slot n" relation kept — given the targets already `picked` for
 * the slots before `from`? Each slot having an option on its own isn't enough:
 * "target creature you control fights another target creature you control"
 * lists your one creature in both slots (Wayta, Trainer Prodigy with nothing
 * else out), and no legal choice fills both (rule 601.2c).
 *
 * A search over the slots in order; slot counts are a handful, so this is
 * cheap — and it stops at the first complete assignment.
 */
export function targetsFillable(
  specs: readonly TargetSpec[],
  options: readonly (readonly TargetRef[])[],
  picked: readonly (TargetRef | null)[] = [],
  from = picked.length,
  facts?: TargetFacts,
): boolean {
  const group = anyNumberSlot(specs);
  // At or partway through an "any number of" group with a floor: the members
  // so far and what's still offered must reach it — "two target cards from an
  // opponent's graveyard" with one picked from a graveyard holding no other,
  // or a group `other` than a slot that just took one of its few candidates.
  if (group >= 0 && from >= group && facts !== undefined) {
    const spec = specs[group];
    const { min } = spec === undefined ? { min: 0 } : groupBounds(spec);
    const taken = picked.slice(group).filter((ref) => ref !== null).length;
    if (taken < min) {
      // A stack counts each token not yet named.
      const left = slotOptions(specs, options, from, picked, facts).reduce(
        (n, ref) => n + Math.max(1, tokensLeft(ref, picked, facts)),
        0,
      );
      if (taken + left < min) return false;
    }
  }
  if (from >= options.length) return true;
  // The cheap answers first: a required slot with nothing at all, or no
  // relation between slots to get in the way.
  for (let i = from; i < options.length; i += 1) {
    if (options[i].length === 0 && !isOptionalSpec(specs[i] ?? "creature")) return false;
  }
  // An "any number of" group with a floor — "X target cards" at a fixed X,
  // "one, two, or three targets" — needs that many distinct to pick from.
  if (group >= from && group < options.length) {
    const spec = specs[group];
    const min = spec === undefined ? 0 : groupBounds(spec).min;
    if (spec !== undefined && targetUnits(options[group], facts) < min) return false;
    // "From a single graveyard": that many in one player's — or, tied to a
    // slot, in the graveyard of a player that slot could be.
    const same = typeof spec === "object" && spec.kind === "any-number" ? spec.sameController : undefined;
    if (same !== undefined && min > 1 && facts !== undefined) {
      const counts = new Map<PlayerId | undefined, number>();
      for (const ref of options[group]) {
        const player = playerOfTarget(ref, facts);
        counts.set(player, (counts.get(player) ?? 0) + (facts.stackSize?.(ref) ?? 1));
      }
      const enough = (player: PlayerId | undefined): boolean => player !== undefined && (counts.get(player) ?? 0) >= min;
      if (same === true && ![...counts.keys()].some(enough)) return false;
      if (typeof same === "object") {
        const anchor = same.slot < from ? picked[same.slot] : undefined;
        const anchors = anchor !== undefined && anchor !== null ? [anchor] : (options[same.slot] ?? []);
        if (!anchors.some((ref) => enough(playerOfTarget(ref, facts)))) return false;
      }
    }
  }
  const related = (s: TargetSpec): boolean =>
    typeof otherThan(typeof s === "object" && s.kind === "any-number" ? s.of : s) === "object";
  if (!specs.some((s, i) => i >= from && related(s))) return true;
  const chosen = [...picked.slice(0, from)];
  for (const ref of slotOptions(specs, options, from, chosen, facts)) {
    if (targetsFillable(specs, options, [...chosen, ref], from + 1, facts)) return true;
  }
  return (
    isOptionalSpec(specs[from] ?? "creature") && targetsFillable(specs, options, [...chosen, null], from + 1, facts)
  );
}

/** The first pair of slots whose "other than slot n" relation `chosen`
 * breaks — the later slot and the one it must differ from — or `null`. */
export function otherSlotConflict(
  specs: readonly TargetSpec[],
  chosen: readonly (TargetRef | null | undefined)[],
  facts?: TargetFacts,
): { readonly slot: number; readonly than: number } | null {
  for (let i = 0; i < specs.length; i += 1) {
    const than = otherThan(specs[i]);
    if (than === undefined) continue;
    const mine = chosen[i];
    if (mine === null || mine === undefined) continue;
    const byController = facts !== undefined && differentControllerOf(specs[i]);
    const sharing = facts !== undefined && sameControllerOf(specs[i]);
    const share = sharesOf(specs[i]);
    for (const slot of otherThanSlots(than)) {
      const theirs = chosen[slot];
      if (theirs === null || theirs === undefined) continue;
      if (sameTarget(mine, theirs) && !sameObjectAllowedOf(specs[i])) {
        // One token of a stack each, while it has that many (601.2c).
        if (tokensLeft(mine, chosen.slice(0, i), facts) === 0) return { slot: i, than: slot };
      }
      // "…that share a card type" (Shifting Loyalties, Rivals' Duel).
      if (share !== undefined && facts !== undefined && sharesHold(mine, theirs, share, facts) === false) {
        return { slot: i, than: slot };
      }
      // "…attached to that creature" (Fiery Annihilation).
      if (facts !== undefined && attachedToThanOf(specs[i]) && attachedHolds(mine, theirs, facts) === false) {
        return { slot: i, than: slot };
      }
      // "…controlled by different players" (Protector of the Wastes).
      if (byController && facts.controllerOf(mine) === facts.controllerOf(theirs)) return { slot: i, than: slot };
      // "…that player controls", "from a single graveyard" (Mutiny, Decompose).
      if (sharing) {
        const player = playerOfTarget(mine, facts);
        if (player === undefined || player !== playerOfTarget(theirs, facts)) return { slot: i, than: slot };
      }
    }
  }
  return null;
}

/** Whether `chosen`'s "any number of target …" group breaks its "total
 * power N or less" (Reunion of the House) — always `false` without one, or
 * without the facts to tell. */
export function groupPowerExceeded(
  specs: readonly TargetSpec[],
  chosen: readonly (TargetRef | null | undefined)[],
  facts?: TargetFacts,
): boolean {
  const group = anyNumberSlot(specs);
  if (group < 0 || facts === undefined) return false;
  const members = chosen.slice(group).filter((ref): ref is TargetRef => ref !== null && ref !== undefined);
  const most = groupMaxTotalPower(specs[group]);
  if (most !== undefined && members.reduce((n, ref) => n + facts.powerOf(ref), 0) > most) return true;
  return groupManaValueBroken(specs, chosen, facts) || groupRelationBroken(specs, chosen, facts);
}

/** Whether `chosen`'s group breaks its "with equal toughness" (V.A.T.S.)
 * or its "with different names" (Behold the Sinister Six!) — `false`
 * without either, or without the facts to tell. Holes are left out: as it
 * resolves, only the members still legal count (V.A.T.S.'s ruling). */
export function groupRelationBroken(
  specs: readonly TargetSpec[],
  chosen: readonly (TargetRef | null | undefined)[],
  facts?: TargetFacts,
): boolean {
  const group = anyNumberSlot(specs);
  const spec = specs[group];
  if (group < 0 || facts === undefined || typeof spec !== "object" || spec.kind !== "any-number") return false;
  const members = chosen.slice(group).filter((ref): ref is TargetRef => ref !== null && ref !== undefined);
  const toughnessOf = facts.toughnessOf;
  if (spec.equalToughness === true && toughnessOf !== undefined && new Set(members.map(toughnessOf)).size > 1) {
    return true;
  }
  const nameOf = facts.nameOf;
  return spec.differentNames === true && nameOf !== undefined && new Set(members.map(nameOf)).size < members.length;
}

/** Whether `chosen`'s group breaks its "total mana value N or less" (Patch
 * Up) or its "each a different mana value" (Agadeem's Awakening) — `false`
 * without either, or without the facts to tell. */
export function groupManaValueBroken(
  specs: readonly TargetSpec[],
  chosen: readonly (TargetRef | null | undefined)[],
  facts?: TargetFacts,
): boolean {
  const group = anyNumberSlot(specs);
  const manaValueOf = facts?.manaValueOf;
  if (group < 0 || manaValueOf === undefined) return false;
  const spec = specs[group];
  const values = chosen
    .slice(group)
    .filter((ref): ref is TargetRef => ref !== null && ref !== undefined)
    .map(manaValueOf);
  const most = groupMaxTotalManaValue(spec);
  if (most !== undefined && values.reduce((n, v) => n + v, 0) > most) return true;
  const distinct = typeof spec === "object" && spec.kind === "any-number" && spec.differentManaValues === true;
  return distinct && new Set(values).size < values.length;
}

/** The nouns a target label is built from: the word a count makes plural. */
const TARGET_NOUNS = new Set([
  "creature", "permanent", "artifact", "enchantment", "land", "planeswalker", "battle", "spell", "card",
  "player", "opponent", "token", "ability", "source", "target", "commander",
]);

/** Where a label's noun phrase ends and what narrows it begins: "creature |
 * you control", "card | in a graveyard", "opponent | with more life than you". */
const LABEL_TAIL = / (?:you |an opponent |that |with |without |in |from |of |other than |\().*$/;

const pluralWord = (word: string): string =>
  /(?:s|x|ch|sh)$/.test(word) ? `${word}es` : /[^aeiou]y$/.test(word) ? `${word.slice(0, -1)}ies` : `${word}s`;

/**
 * A target label for several of them: "creatures you control", "artifacts or
 * creatures", "instant or sorcery spells", "other creatures". The noun
 * phrase's last word takes the plural, and so does each alternative before
 * it that ends in a noun ("creature or planeswalker"), where "instant or
 * sorcery spell" keeps its two adjectives.
 */
export function pluralTargetLabel(label: string): string {
  if (label.startsWith("another ")) return `other ${pluralTargetLabel(label.slice("another ".length))}`;
  const tail = LABEL_TAIL.exec(label)?.[0] ?? "";
  const head = tail === "" ? label : label.slice(0, label.length - tail.length);
  const parts = head.split(" or ");
  const plural = parts.map((part, i) => {
    const words = part.split(" ");
    const last = words[words.length - 1];
    if (i < parts.length - 1 && !TARGET_NOUNS.has(last)) return part;
    return [...words.slice(0, -1), pluralWord(last)].join(" ");
  });
  return `${plural.join(" or ")}${tail}`;
}

/**
 * A short human label for a target slot, for a UI prompt ("choose a
 * creature"). The string specs are already their own label; the structured
 * one needs building.
 */
export function describeTargetSpec(spec: TargetSpec | string): string {
  // A named spec reads as words: "any target", "creature you control".
  if (typeof spec === "string") return spec.replace(/-/g, " ");
  if (spec.kind === "optional") return `${describeTargetSpec(spec.of)} (optional)`;
  if (spec.kind === "one-of") return spec.of.map((part) => describeTargetSpec(part)).join(" or ");
  if (spec.kind === "any-number") {
    // Fireball's "any number of targets", not "any number of any target".
    const times = xMultiple(spec.max) ?? 1;
    const many =
      times > 1
        ? `up to ${times === 2 ? "twice" : `${times} times`} X`
        : spec.max === "x"
        ? spec.min === "x"
          ? "X"
          : "up to X"
        : typeof spec.max === "number"
          ? spec.min === spec.max
            ? `${spec.max}`
            : `up to ${spec.max}`
          : spec.max !== undefined
            ? "up to X"
            : "any number of";
    if (spec.of !== "any-target") {
      const one = many === "1" || many === "up to 1";
      return `${many} ${one ? describeTargetSpec(spec.of) : pluralTargetLabel(describeTargetSpec(spec.of))}`;
    }
    return many === "1" || many === "up to 1" ? `${many} target` : `${many} targets`;
  }
  if (spec.kind === "other") {
    const than = spec.than ?? "source";
    const inner = describeTargetSpec(spec.of);
    if (typeof than === "object") {
      const slots = otherThanSlots(than).map((slot) => slot + 1);
      return `${inner} other than target${slots.length > 1 ? "s" : ""} ${slots.join(" and ")}`;
    }
    return than === "source"
      ? `another ${inner}`
      : than === "trigger-object"
        ? `${inner} other than that one`
        : than === "host"
          ? `${inner} other than the one it's attached to`
          : `${inner} other than that player`;
  }
  if (spec.kind === "opponent-compared") {
    const what = {
      life: "life",
      creatures: "creatures",
      lands: "lands",
      "cards-in-hand": "cards in hand",
      "creature-cards-in-graveyard": "creature cards in their graveyard",
    }[spec.stat];
    const more = spec.by < 0 ? "fewer" : "more";
    const n = Math.abs(spec.by);
    if (spec.comparedTo === "active-player") {
      return `opponent of the active player with ${n > 1 ? `at least ${n} ` : ""}${more} ${what} than them`;
    }
    return `opponent with ${n > 1 ? `at least ${n} ` : ""}${more} ${what} than you`;
  }
  if (spec.kind === "spell-or-permanent") {
    const nonland = spec.filter?.notTypes?.includes("land") === true ? "nonland " : "";
    const whose = spec.whose === "you" ? " you control" : spec.whose === "opponent" ? " an opponent controls" : "";
    return `spell or ${nonland}permanent${whose}`;
  }
  if (spec.kind === "stack") {
    const spells =
      spec.spells === "none" ? null : spec.spells === "instant-or-sorcery" ? "instant or sorcery spell" : "spell";
    const nouns = [spells, spec.abilities ? "ability" : null].filter((n) => n !== null).join(" or ");
    const whose = spec.whose === "you" ? " you control" : spec.whose === "opponent" ? " an opponent controls" : "";
    return `${nouns}${whose}${spec.singleTarget === true ? " with a single target" : ""}`;
  }
  if (spec.kind === "ability") {
    const from = spec.sourceTypes === undefined ? "" : ` from ${spec.sourceTypes.join(" or ")} source`;
    const noun = spec.abilityKind === undefined ? "activated or triggered" : spec.abilityKind;
    const whose = spec.whose === "you" ? " you control" : spec.whose === "opponent" ? " an opponent controls" : "";
    return `${noun} ability${whose}${from}`;
  }
  if (spec.kind === "spell") {
    const colour = spec.filter.colors?.length === 1 ? `${COLOUR_WORD[spec.filter.colors[0]]} ` : "";
    const type = spec.filter.type === undefined ? "" : `${spec.filter.type} `;
    const mv = spec.filter.manaValue;
    const withMv = mv?.op === "eq" && typeof mv.n === "number" ? ` with mana value ${mv.n}` : "";
    return `${colour}${type}spell${withMv}`;
  }
  if (spec.kind === "permanent") {
    const nounOf = (filter: CardFilter): string =>
      filter.subtype !== undefined && filter.type !== undefined
        ? `${filter.subtype} ${filter.type}`
        : (filter.type ??
          filter.subtype ??
          filter.typesAnyOf?.join(" or ") ??
          filter.anyOf?.map(nounOf).join(" or ") ??
          "permanent");
    const noun = nounOf(spec.filter);
    const owned =
      typeof spec.whose === "object"
        ? spec.whose.seat === 0
          ? `${noun} you control`
          : `${noun} ${seatWords(spec.whose.seat, false)} controls`
        : spec.whose === "you"
          ? `${noun} you control`
          : spec.whose === "opponent"
            ? `${noun} an opponent controls`
            : spec.whose === "defending-player"
              ? `${noun} defending player controls`
              : noun;
    // "…, or opponent" / "…, or player", whichever permanents those are.
    const either = spec.orPlayer === undefined ? owned : `${owned} or ${spec.orPlayer === "opponent" ? "opponent" : "player"}`;
    return spec.playerWith?.turnStat === "damage-taken" && spec.filter.damagedThisTurnBy !== undefined
      ? `${either} that was dealt damage this turn`
      : either;
  }
  if (spec.kind === "card-in-exile") {
    const what = spec.filter?.type === undefined ? "card" : `${spec.filter.type} card`;
    const up = spec.faceUp === true ? "face-up " : "";
    if (spec.linked === true) return `${up}${what} exiled with this`;
    return `${up}exiled ${what}${spec.whose === "you" ? " you own" : spec.whose === "opponent" ? " an opponent owns" : ""}`;
  }
  const whose =
    typeof spec.whose === "object"
      ? `${seatWords(spec.whose.seat, true)} graveyard`
      : spec.whose === "you"
        ? "your graveyard"
        : spec.whose === "opponent"
          ? "an opponent's graveyard"
          : spec.whose === "trigger-player"
            ? "that player's graveyard"
            : "a graveyard";
  const what = spec.filter?.type ?? "card";
  return `${what} in ${whose}`;
}

const COLOUR_WORD: Readonly<Record<Color, string>> = {
  W: "white",
  U: "blue",
  B: "black",
  R: "red",
  G: "green",
};
