/**
 * The game state tree and pure selectors over it.
 *
 * `GameState` is a plain, structurally-cloneable object: no class instances,
 * functions, `Map`s, or `Set`s. The {@link Game} class owns the single mutable
 * instance and is the only thing that writes to it; everything else reads.
 */

import type { KeywordAbilityName } from "./characteristics-patch.js";
import type { Action, CastSpellOffer, CastVia, PlayLandOffer } from "./actions.js";
import type { ActivatedAbility, TriggeredAbility, TriggerSpec } from "./abilities.js";
import type {
  AffectSpec,
  CardType,
  CombatPermanentTax,
  CombatRule,
  Keyword,
  LosableKeyword,
  StaticAbility,
  StaticCondition,
  Supertype,
} from "./cards.js";
import type {
  EffectAmount,
  EffectSpec,
  EnterTypes,
  LookAndChooseLeftoverIf,
  ManaSplitRiders,
  ModesCostSacrifice,
  PileFateWord,
  ResolvedEnterAttacking,
  ResolvedSearchInstead,
  ZoneChoiceSplitCase,
  ZoneSecondPick,
  GraveyardKeyword,
} from "./effects.js";
import type { CardFilter } from "./filter.js";
import type { CardNameAim, CardNameFilter } from "./card-names.js";
import type { Color, ManaProductionRule, ManaType, ManaUnit, SpendAs, SpentMana } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { DelayedStepWatch } from "./delayed-at.js";
import type { Expiry, UntilCast, UntilPoint, WatchExpiry, WhileSource } from "./duration.js";
import type { RollRecord } from "./random-results.js";
import type { ReplacementSpec } from "./replacements.js";
import type { CardPlayPermission, CastNowTerms, EffectPlay, PlayedUnder } from "./play-permission.js";
import type { Journal } from "./journal.js";
import type { ObjectSets, SetMember } from "./object-sets.js";
export type { JournalOrigin, JournalWhat } from "./journal.js";
import type { GameEvent, Vote } from "./events.js";
import type { ResolvedTargets, TargetRef, TargetSpec } from "./target.js";
import type { Step } from "./turn.js";
import { MERGED_PREFIX, MERGED_SEPARATOR } from "./cards/card-registry.js";
import { textChangedKey, type TextChange } from "./text-change.js";
import type { ZoneChoiceTogether } from "./zone-choice-together.js";

export type PrivateZone = "library" | "hand" | "graveyard";
export type SharedZone = "battlefield" | "stack" | "exile" | "command";
/**
 * `"phased-out"` isn't a zone (rule 702.26d: phasing changes no zone and no
 * control) but the status of a permanent that is treated as though it doesn't
 * exist (702.26b). A phased-out permanent keeps its id, `zoneChangeCount`,
 * counters, attachments and the rest, sits in `GameState.phasedOut` rather
 * than the battlefield's list, and has this as its `zone` — so every read of
 * the battlefield, and every "is it still on the battlefield" check, passes
 * it over without being told to. See {@link PhasedOutStatus}.
 */
export type ZoneType = PrivateZone | SharedZone | "phased-out" | "outside";
/*
 * `"outside"` isn't a zone either (rule 400.11: "Outside the game is not a
 * zone"): it is where a card in its owner's sideboard sits (400.11a), kept in
 * `GameState.outside` by owner. Nothing in the game sees or affects it
 * (400.11c) but an effect that brings it in — a search that takes in
 * "outside the game" (`search-library`'s `zones`, rule 701.23j) — and once
 * brought in it stays in the game (400.11b).
 */

/**
 * Why and how a permanent phased out (rule 702.26) — `GameObject.phasedOut`,
 * present exactly while its `zone` is `"phased-out"`.
 */
export interface PhasedOutStatus {
  /** Who controlled it as it phased out: it phases in during that player's
   * untap step (rule 502.1), under whoever controls it then (the rulings —
   * a stolen creature whose control effect ended meanwhile comes back to its
   * owner). */
  readonly controller: PlayerId;
  /** Phased out *indirectly* (rule 702.26g), with the permanent it's attached
   * to: it never phases in by itself, only along with that one. */
  readonly with?: ObjectId;
  /** An Aura or Equipment that phased out *directly*: what it was attached
   * to, in that object's stint — it phases in attached to it if that's still
   * on the battlefield as the same object, else unattached (702.26i). */
  readonly host?: { readonly id: ObjectId; readonly zoneChangeCount: number };
  /** "Phases out until [this] leaves the battlefield" (rule 610.4 — Oubliette):
   * the permanent whose leaving phases it in, in that permanent's stint. Such
   * a permanent doesn't phase in during an untap step (610.4a). `tapped`:
   * "tap that creature as it phases in this way". */
  readonly until?: { readonly source: ObjectId; readonly zoneChangeCount: number; readonly tapped?: boolean };
  /** It phased out under a player who has since left the game, and that
   * player's next turn would have begun: it phases in during the next untap
   * step (rule 702.26n). */
  released?: true;
  /** Its `lastKnown` before it phased out, put back as it phases in: the
   * snapshot taken as it phased out (what it was as it last existed, for an
   * ability that reads a source treated as gone — rule 608.2h) belongs to
   * that absence only. */
  readonly priorLastKnown?: LastKnownInfo;
}

/** One layer-2 control-changing effect on a permanent — see
 * `GameObject.controlEffects`. */
export interface ControlEffect {
  /** Who the effect says controls the permanent. */
  readonly controller: PlayerId;
  /** When the effect was created (`GameState.timestampSeq`) — the latest
   * applicable control effect wins (rule 613.7). */
  readonly timestamp: number;
  /** Act of Treason's "until end of turn" — ends in the cleanup step. */
  readonly untilEndOfTurn: boolean;
  /** The event it was made at — the `"control-effect"` this-way read. */
  readonly madeAtSeq?: number;
  /** Made by "put it onto the battlefield under your control" rather than a
   * control-changing effect: `controller` is then who the permanent entered
   * under, its default controller (rule 110.2). The two differ only once that
   * player leaves the game — an effect giving them control ends, but a
   * permanent they control by default is exiled (rule 800.4a). */
  readonly entered?: boolean;
  /** "For as long as [that permanent] remains on the battlefield"
   * (Opportunistic Dragon): it ends as that permanent, in that stint,
   * leaves. */
  readonly whileSource?: WhileSource;
  /** "Until the end of your next turn" (Stilt-Man, Towering Terror): see
   * `UntilPoint`. */
  readonly untilPoint?: UntilPoint;
}

/**
 * What a card being put onto the battlefield "attached to" something enters
 * attached to, as the effect resolved it:
 *
 * - a permanent — an Aura that can't legally enchant it stays where it is
 *   (rule 303.4i), an Equipment that can't equip it enters unattached
 *   (301.5e), anything else enters unattached (303.4h);
 * - `null` — nothing there (it has left, rule 400.7): an Aura stays, anything
 *   else enters unattached;
 * - `{ player }` — a player (Bitterheart Witch's "a Curse card … attached to
 *   target player"): only an Aura that can enchant that player goes (303.4i);
 *   anything else enters unattached;
 * - `{ among }` — a permanent matching this filter, from the side of the
 *   player it enters under, chosen as it enters (One Last Job's "attached to
 *   a creature you control"; rule 303.4f for an Aura, limited to these). None
 *   it could be attached to: an Aura stays (303.4g), an Equipment enters
 *   unattached.
 */
export type EnterAttachHost =
  | ObjectId
  | null
  | { readonly player: PlayerId }
  | { readonly among: CardFilter };

/** An instance of a card (or token) somewhere in the game. */
export interface GameObject {
  readonly id: ObjectId;
  /** Key into the {@link CardRegistry} for printed characteristics. */
  readonly cardName: string;
  readonly owner: PlayerId;
  controller: PlayerId;
  zone: ZoneType;
  /** Phased out (rule 702.26) — see {@link PhasedOutStatus}. Present exactly
   * while `zone` is `"phased-out"`. */
  phasedOut?: PhasedOutStatus;
  tapped: boolean;
  damageMarked: number;
  /**
   * This permanent's spell was cast kicked — the one piece of `kicked` that
   * survives the stack-to-battlefield move, for a permanent whose kicker
   * rider is an ETB trigger (Verix Bladewing). See `moveObject`.
   */
  enteredKicked?: boolean;
  /** This permanent's spell was cast for its spectacle cost (rule 702.137),
   * kept across the move the way `enteredKicked` is — Rafter Demon's "if its
   * spectacle cost was paid". */
  enteredSpectacle?: boolean;
  /** This permanent's spell was cast for its surge cost (rule 702.117),
   * kept across the move as `enteredSpectacle` is — Reckless Bushwhacker's
   * "if its surge cost was paid". */
  enteredSurge?: boolean;
  /** This permanent's spell was cast for its prowl cost (rule 702.76),
   * kept across the move as `enteredSpectacle` is — Earwig Squad's "if its
   * prowl cost was paid". */
  enteredProwl?: boolean;
  /** Tribute wasn't paid as it entered (rule 702.104b — `tribute-not-paid`):
   * set by the entry, gone with its next move. */
  tributeUnpaid?: true;
  /** How many times its spell was kicked, for a multikicker spell (rule
   * 702.33c) — `timesKicked` carried across the stack-to-battlefield move
   * the way `enteredKicked` is, for "enters with a charge counter on it for
   * each time it was kicked" (Everflowing Chalice). */
  enteredTimesKicked?: number;
  /** The permanents it devoured as it entered this stint, each as it last
   * existed on the battlefield (rule 702.82b: "it devoured" means sacrificed
   * for its devour ability as it entered) — the `{ devoured }` amount and the
   * `self-devoured` condition. Gone with its next move; a copy of it devoured
   * nothing. */
  enteredDevoured?: readonly LastKnownInfo[];
  /** Which of its two kicker costs its spell was kicked with (`kickedWith`),
   * carried across the stack-to-battlefield move the way `enteredTimesKicked`
   * is — "if it was kicked with its {1}{U} kicker" (Anavolver). */
  enteredKickedWith?: number;
  /** The creatures that convoked its spell (`convokedBy`), carried across
   * the stack-to-battlefield move the way `enteredKicked` is — "for each
   * creature that convoked it" (Ancient Imperiosaur), "each creature that
   * convoked it" (Zephyr Singer). Gone with its next move. */
  enteredConvokedBy?: readonly { readonly object: ObjectId; readonly stint: number }[];
  /** How many Phyrexian mana symbols its caster paid life for, set as the
   * spell is cast (rule 702.150a — compleated). Gone with its next move. */
  phyrexianPaidWithLife?: number;
  /** `phyrexianPaidWithLife` carried across the stack-to-battlefield move,
   * like `enteredConvokedBy`. */
  enteredPhyrexianPaidWithLife?: number;
  /** How it came onto the battlefield, this stint — see {@link EntryRecord}.
   * Set by the move onto the battlefield, gone with its next move. */
  entry?: EntryRecord;
  /** The zone this spell was cast from, set as it's cast; what the move
   * onto the battlefield records as `entry.cast.from`. Gone with its next
   * move. */
  castFrom?: ZoneType;
  /**
   * Who put this spell on the stack (rule 112.2), kept once something else
   * comes to control it (Commandeer — its `controlEffects` hold who since,
   * oldest first); absent, its controller did. It's who cast it, and who
   * controls the permanent it becomes by default (rule 110.2b), so read it
   * through {@link spellCaster}. Gone with its next move.
   */
  putOnStackBy?: PlayerId;
  /**
   * A spell that changed controller, whose target `chosenFor` the new controller
   * has no `{ seat }` slot of its own: which slot it waits in, another player's
   * — see `Game.rebindSeatTargets`. Gone with its next move, or a new target there.
   */
  seatTargetWaiting?: { readonly slot: number; readonly chosenFor: PlayerId };
  /** The creatures that convoked this spell (rule 702.51a), each as the
   * battlefield stint it tapped from, in the order they were tapped — "each
   * creature that convoked this spell" (Lethal Scheme). Gone with its next
   * move. */
  convokedBy?: readonly { readonly object: ObjectId; readonly stint: number }[];
  /**
   * This card is in exile because of an "exile until ~ leaves the
   * battlefield" ability, and this is the id of the permanent that did it
   * (rule 610.3 — Banishing Light). Set *after* the move to exile, since
   * `moveObject` clears zone-scoped state on the way.
   */
  exiledBy?: ObjectId;
  /**
   * Exiled "until [source] leaves the battlefield" (rule 610.3 — Banishing
   * Light): the source and the stint it was in. When that source leaves the
   * battlefield in that stint, the card returns at once, under its owner's
   * control — a one-shot effect right after the event, not a triggered
   * ability (`returnUntilLeft`). Cleared by any move, like `exiledBy`. The
   * object it waits on needn't be what exiled it (Calix's "until target
   * enchantment you control leaves"). `returnTo: "hand"` is the zone a card
   * exiled from a hand goes back to (rule 610.3's "previous zone" — Kitesail
   * Freebooter), its owner's.
   */
  exiledUntil?: { readonly source: ObjectId; readonly zoneChangeCount: number; readonly returnTo?: "hand" | "graveyard" };
  /**
   * Exiled "until an opponent becomes the monarch" (Palace Jailer, rule
   * 610.3): an opponent of this player, the effect's controller. It returns,
   * under its owner's control, right after any of them next becomes the
   * monarch, whatever has become of what exiled it (`returnUntilMonarch`). An
   * opponent being the monarch already doesn't count. Cleared by any move.
   */
  exiledUntilMonarch?: PlayerId;
  /**
   * The player whose effect put this card into exile — what "cards **you
   * exiled**" means (Haldan, Avid Arcanist's `playFromExile.exiledByYou`).
   * Set by an `exile` or `exile-from-library` effect after its move, and
   * cleared by `moveObject` like `exiledBy`, so a card that leaves exile is
   * no longer one anybody exiled.
   */
  exiledByPlayer?: PlayerId;
  /**
   * Haunt (rule 702.55b): this card is in exile haunting this creature — the
   * one its haunt ability targeted, in that battlefield stint — and its
   * "when the creature it haunts dies" ability watches for it (the
   * `haunted-dies` trigger). Set by an `exile` effect's `haunting` after its
   * move, and cleared by `moveObject` like `exiledByPlayer`.
   */
  haunting?: { readonly object: ObjectId; readonly zoneChangeCount: number };
  /**
   * This card is in exile because of a `flicker` whose return is delayed
   * (Norin the Wary), and this names that particular exile — the key its
   * `return-flickered` delayed trigger looks for (rule 610.3). Cleared by
   * `moveObject` like `exiledBy`, so a card that leaves exile before the
   * return, even only to come straight back, is a new object and stays put.
   */
  flickerLink?: string;
  /** What this permanent's play permissions have spent this turn, for
   * `PlayTerms.oncePerTurn` and `perType`, and `StaticPlay.landAndSpell`'s
   * `land` and `spell`: a stale `turn` is nothing spent,
   * and `moveObject` clears it, a new object having a fresh set (rule 400.7).
   * Rule state, not history: it says what's left. */
  playUses?: {
    readonly turn: number;
    readonly once?: true;
    readonly types?: readonly CardType[];
    readonly land?: true;
    readonly spell?: true;
  };
  /** A permission to play this one card from where it is (exile or a
   * graveyard): it belongs to the card, not to whatever gave it, so it outlives
   * its source, and it ends with any move (rule 400.7). See `play-permission.ts`. */
  playPermission?: CardPlayPermission;
  /** This spell was cast under a permission that exiles it instead of letting
   * it reach a graveyard (Kess, Dissident Mage — `castFromGraveyard
   * .exileAfterwards`). Consulted by `moveObject` for the move off the
   * stack, and cleared by any move after that. */
  exileIfWouldGoToGraveyard?: boolean;
  /** "Return ~ to its owner's hand" in this spell's own text, as it
   * resolves (Release the Ants): it goes to its owner's hand instead of
   * their graveyard as the final part of its resolution (rule 608.2n), as
   * a bought-back spell does. Set by `return-to-hand` on the resolving
   * spell itself; cleared by any move. */
  returnToHandAsItResolves?: boolean;
  /** This spell is to be exiled instead of put into `player`'s graveyard as
   * it resolves, and, with `returnAtNextEndStep`, returned to their hand at
   * the beginning of the next end step — Feather, the Redeemed (`source`),
   * the `exile-spell-as-it-resolves` effect. Read only as the spell
   * resolves (`Game.leaveStackAfterResolving`); cleared by any move. */
  exileAsItResolves?: {
    readonly player: PlayerId;
    readonly source: ObjectId;
    readonly returnAtNextEndStep?: true;
    /** The exiled card becomes plotted (rule 702.170 — Lilah). */
    readonly plotted?: true;
    /** It's exiled with this many time counters, and has suspend (Gandalf of
     * the Secret Fire). */
    readonly timeCounters?: number;
    /** It's exiled with these counters on it (Goliath Daydreamer's dream
     * counter). */
    readonly counters?: { readonly kind: string; readonly amount: number };
    /** "You may exile that spell instead" (Forger's Foundry): this player is
     * asked, as it resolves, whether to. */
    readonly mayDecline?: PlayerId;
    /** It's exiled with `source`, in this stint of it (rule 607.2a — River
     * Song's Diary). */
    readonly link?: { readonly source: ObjectId; readonly zoneChangeCount: number };
  };
  /** This spell is to be put into its owner's hand instead of `player`'s
   * graveyard as it resolves — Soulfire Grand Master (`source`), a
   * `grant-spells-this-turn`'s `intoHandAsItResolves`. Read only as the spell
   * resolves (`Game.leaveStackAfterResolving`); cleared by any move. */
  intoHandAsItResolves?: { readonly player: PlayerId; readonly source?: ObjectId };
  /** True once dealt damage by a deathtouch source since state-based actions
   * were last checked (rule 704.5h): each check clears it, as do regeneration,
   * cleanup and a zone change. So an indestructible creature that survived
   * it isn't destroyed by losing indestructible later in the turn. */
  markedByDeathtouch: boolean;
  /**
   * Regeneration shields on this permanent (rule 701.15a): each replaces the
   * next time it would be destroyed this turn — by an effect, or by lethal
   * or deathtouch damage (704.5g-h) — with removing all damage from it,
   * tapping it and removing it from combat. Gone at cleanup (514.2) and when
   * it changes zones (400.7). For a token stack, each token in it has this
   * many.
   */
  regenerationShields?: number;
  /** "It can't be regenerated this turn" (the `prohibit` effect's
   * `regeneration` — rule 701.19c): the turn number it was said on. While
   * `state.turn.number` still equals it, its regeneration shields aren't
   * applied (they stay, and still end at cleanup); a zone change clears it
   * (rule 400.7). Not an ability, so a loss of abilities doesn't end it. */
  cantBeRegeneratedTurn?: number;
  /** Turn number this object last entered the battlefield; `null` otherwise. */
  enteredBattlefieldOnTurn: number | null;
  /**
   * The turn this card was put into the graveyard it's in, and the zone it
   * came from — milled or surveilled (`"library"`), discarded (`"hand"`),
   * died or otherwise put there from the battlefield (`"battlefield"`), a
   * resolved or countered spell (`"stack"`). Read by the filter clauses
   * "a card … that was put there from a library this turn" (Captain
   * N'ghathrod), "… from the battlefield this turn" (Grim Return) and "… from
   * anywhere this turn" (Night Nurse). Compared against `turn.number` rather
   * than cleared at end of turn, so a card put there on an earlier turn
   * simply doesn't match. `moveObject` rewrites it on every zone change: a
   * card that leaves the graveyard and comes back is a new object (rule
   * 400.7), put there from wherever it came from this time.
   */
  putIntoGraveyardOn?: { readonly turn: number; readonly from: ZoneType };
  /**
   * The turn this card was discarded on — set as the discard is announced
   * (`cards-discarded`), read by mayhem's "as long as you discarded this card
   * this turn" (rule 702.187b). Compared against `turn.number`; cleared on
   * any zone change (a card that leaves the graveyard is a new object, rule
   * 400.7).
   */
  discardedOnTurn?: number;
  /**
   * The turn this card was milled on (rule 701.17) — set as the mill is
   * announced (`cards-milled`), where the mill put it; read by "a land card
   * in a graveyard that was milled this turn" (Tato Farmer). Unlike
   * `putIntoGraveyardOn`'s `"library"`, a surveilled card isn't milled.
   * Compared against `turn.number`; cleared on any zone change (400.7).
   */
  milledOnTurn?: number;
  /** What the creature returned to pay this spell's sneak cost was attacking
   * (rule 702.190b) — the permanent it becomes enters tapped and attacking
   * that. Set as the cost is paid; cleared by any zone change. */
  sneakAttacking?: PlayerId | ObjectId;
  /** The mana value of the creature returned to pay this spell's
   * web-slinging cost, as it last existed on the battlefield (rule
   * 702.188a; Scarlet Spider, Ben Reilly's ruling). Set as the cost is
   * paid; kept by the permanent the spell becomes, as `xValue` and
   * `castVia` are, for an `enters-battlefield` replacement's
   * `"web-slinging-mana-value"`; cleared by any move off the battlefield. */
  webSlingingManaValue?: number;
  /**
   * True while the creature has not been under its controller's control since
   * the start of that player's most recent turn (rule 302.6). Set on entering
   * the battlefield, cleared in the controller's untap step. A permanent of
   * any type has it, and `CardFilter.controlledContinuously` reads it.
   */
  summoningSick: boolean;
  /**
   * `GameState.timestampSeq` when this permanent last came under its current
   * controller's control — as it entered the battlefield, or as its control
   * changed. Read by echo's "if this permanent came under your control since
   * the beginning of your last upkeep" (rule 702.30a), against the
   * controller's `PlayerState.previousUpkeepSeq`.
   */
  controlSinceSeq?: number;
  /** The card this permanent last chose with `choose-exiled-card`, in the stint
   * it had then (Koh, the Face Stealer's "the last chosen card"). Not the same
   * object once it leaves exile (rule 400.7). Cleared on any zone change. */
  chosenExiledCard?: { readonly card: ObjectId; readonly stint: number };
  /** Indices of this object's exhaust abilities already activated — once
   * each for as long as the object exists (see `ActivatedAbility.exhaust`).
   * Cleared by any zone change. */
  exhaustedAbilities?: number[];
  /** True once this permanent has been declared as an attacker this turn —
   * the "attacked this turn" half of Boast (rule 702.142a), and the
   * `attackedThisTurn` filter clause. Reset as each turn begins, and by any
   * change of zone (the permanent that comes back never attacked). */
  attackedThisTurn?: boolean;
  /** How many times it has been declared as an attacker this turn (Moraug, Fury
   * of Akoum: `grantPtPerCount.ofAffected`). Reset with `attackedThisTurn`. */
  attacksThisTurn?: number;
  /** The turns this permanent was declared an attacker on, in this
   * battlefield stint — "attacked during their controller's last turn" (Halls
   * of Mist), which an extra combat this turn mustn't overwrite. Pruned as each
   * turn begins to the turns that may still be someone's last. */
  attackedOnTurns?: number[];
  /** The combat this permanent was last declared an attacker in, and the
   * player it attacked then (`null` for a planeswalker) — "that this
   * creature didn't attack during your last combat" (Territorial Hellkite).
   * Gone with any change of zone. */
  lastAttack?: { readonly combat: CombatId; readonly player: PlayerId | null };
  /** The players this object has attacked this turn, not their planeswalkers:
   * "can't attack a player it has already attacked this turn" (Port Razer).
   * Reset as each turn begins, and by any zone change, like `attackedThisTurn`. */
  attackedPlayersThisTurn?: PlayerId[];
  /** True once this permanent has been declared as an attacker attacking a
   * battle this turn (rule 506.3) — War Historian's "as long as it attacked
   * a battle this turn", which holds from that declaration for the rest of
   * the turn whatever then happens to the battle. Reset as each turn begins,
   * and by any zone change, like `attackedThisTurn`. */
  attackedBattleThisTurn?: true;
  /** The combat phase (`TurnState.combatPhases`) of a turn in which a creature
   * that was blocking it was removed from combat: False Orders' "blocked by only
   * that creature this combat" reads it, as `blockedBy` no longer holds it. */
  lostBlockerIn?: { readonly turn: number; readonly combat: number };
  /** What damaged this permanent this turn — see {@link DamageHistory}.
   * Only this stint's (a zone change makes a new object, rule 400.7), and
   * only this turn's: a record from an earlier turn is stale. */
  damageThisTurn?: DamageHistory;
  /** The turn it last dealt damage to another creature (Wolverine's "if
   * it dealt damage to another creature this turn"). */
  dealtDamageToCreatureOnTurn?: number;
  /** The damage it has dealt, to anything, this stint — see
   * {@link DealtDamageRecord}. Absent: it hasn't dealt any yet. */
  dealtDamage?: DealtDamageRecord;
  /**
   * Players who have goaded this creature (rule 701.15) with a one-shot goad
   * — "goad target creature", "goad each creature target player controls".
   * While it lasts the creature "attacks each combat if able and attacks a
   * player other than [the goader] if able" (701.15b).
   *
   * Cleared for a given goader as *their* next turn begins, which is exactly
   * how long such a goad lasts (701.15a). A creature can be goaded by several
   * players at once, hence a list; the same player goading it again adds
   * nothing (701.15d). Goaded is a designation of this object, so a zone
   * change ends it (rule 400.7). This is one of three ways to be goaded —
   * `goadedForGameBy` and a static goad are the others — so ask `goadersOf`
   * (`goad.ts`), never this field, whether a creature is goaded.
   */
  goadedBy?: PlayerId[];
  /**
   * The player whose **Ring-bearer** this permanent is (rule 701.54a-b): a
   * designation, not a copiable value. It lasts until another creature
   * becomes that player's Ring-bearer or another player gains control of it
   * (cleared on the control change, even if control comes back), and a
   * zone change ends it (rule 400.7). Ask `isRingBearer` (`ring.ts`), which
   * also checks who controls it now, rather than this field.
   */
  ringBearer?: PlayerId;
  /**
   * Players who have goaded this creature **for the rest of the game** — Jon
   * Irenicus's "it's goaded for the rest of the game", the tokens Rendmaw,
   * Creaking Nest makes. Never lapses; only leaving the battlefield ends it
   * (rule 400.7), as for `goadedBy`.
   */
  goadedForGameBy?: PlayerId[];
  /**
   * The permanent is **suspected** (rule 701.60): `GameState.timestampSeq` as
   * it became so. While suspected it has menace and "This creature can't
   * block" (701.60c) — folded into its characteristics in layer 6, where an
   * ability-removing effect with a later timestamp takes both away though it
   * stays suspected (the ruling). A suspected permanent can't become
   * suspected again (701.60d), so the timestamp is the first one. Neither an
   * ability nor a copiable value (701.60b); a zone change ends it (701.60a).
   */
  suspectedAt?: number;
  /**
   * The permanent is **monstrous** (rule 701.37b): a designation the
   * `monstrosity` effect gives it, which the monstrosity action reads ("if
   * this permanent isn't monstrous") and a `becomes-monstrous` trigger
   * watches for. Neither an ability nor a copiable value, so losing its
   * abilities or a copy effect leaves it be; it lasts until the permanent
   * leaves the battlefield (`moveObject` clears it).
   */
  monstrous?: true;
  /**
   * The permanent is **harnessed** (rule 701.64b): a designation the `harness`
   * effect gives it, which an Infinity card's "∞ — [ability]" reads (rule
   * 702.186b — a static's `condition: { kind: "source", filter: { harnessed:
   * true } }`). Neither an ability nor a copiable value, so a copy of a
   * harnessed permanent isn't harnessed; it lasts until the permanent leaves
   * the battlefield (`moveObject` clears it).
   */
  harnessed?: true;
  /**
   * The permanent is **renowned** (rule 702.112b): a designation the `renown`
   * effect gives it, which renown's own trigger reads ("if it isn't
   * renowned"), "as long as this creature is renowned" statics read (the
   * `renowned` filter clause) and a `becomes-renowned` trigger watches for.
   * Like monstrous, neither an ability nor a copiable value; it lasts until
   * the permanent leaves the battlefield (`moveObject` clears it).
   */
  renowned?: true;
  /**
   * The permanent is **saddled** (rule 702.171b): a designation a saddle
   * ability's effect (or Kolodin's, Guidelight Matrix's…) gives it, which
   * "attacks while saddled" and "if this creature is saddled" read (the
   * `saddled` filter clause). Neither an ability nor a copiable value, so a
   * copy of a saddled Mount isn't saddled; it lasts until the turn ends
   * (cleared in the cleanup step, rule 514.2) or the permanent leaves the
   * battlefield (`moveObject` clears it).
   */
  saddled?: true;
  /** Solved (rule 719.3b): a Case's "To solve —" trigger made it so. A
   * designation, neither an ability nor copiable, that "Solved —" abilities
   * read (the `solved` condition); it lasts until the permanent leaves the
   * battlefield (`moveObject` clears it). */
  solved?: true;
  /**
   * The permanents this creature **saddled** this turn (rule 702.171c: it
   * did as it was tapped to pay one's saddle cost), each with the
   * `zoneChangeCount` that permanent had then — "a creature that saddled it
   * this turn" (`CardFilter.saddledSource`). Kept on the creature rather than
   * the Mount so the Mount leaving doesn't erase it (Fortune, Loyal Steed's
   * ruling); a zone change of the creature clears it (rule 400.7), and so
   * does the cleanup step.
   */
  saddledThisTurn?: { readonly mount: ObjectId; readonly stint: number }[];
  /**
   * The Vehicles this creature **crewed** this turn (rule 702.122b: it did as
   * it was tapped to pay one's crew cost), each with the `zoneChangeCount`
   * that Vehicle had then — "a creature that crewed it this turn"
   * (`CardFilter.crewedSource`, 702.122c) and "a Vehicle crewed by ~ this
   * turn" (`CardFilter.crewedBySource`). Kept on the creature, as
   * `saddledThisTurn` is, so the Vehicle leaving doesn't erase it; a zone
   * change of the creature clears it (rule 400.7), and so does the cleanup
   * step.
   */
  crewedThisTurn?: { readonly vehicle: ObjectId; readonly stint: number }[];
  /**
   * Exerted (rule 701.43a): it won't untap during this player's next untap
   * step — the player who exerted it, whoever controls it then (a creature
   * borrowed until end of turn and exerted still untaps in its owner's untap
   * step, the ruling). Cleared as that untap step happens, whether or not it
   * was tapped, and by any change of zone.
   */
  exertedBy?: PlayerId;
  /** The turn it was last exerted — Combat Celebrant's "if this creature
   * hasn't been exerted this turn". Gone with any change of zone. */
  exertedOnTurn?: number;
  /** The combat in which it last **enlisted** a creature (rule 702.154c —
   * it tapped one to pay its enlist cost as it attacked): the
   * `enlistedThisCombat` filter clause. Gone with any change of zone. */
  enlistedIn?: CombatId;
  /**
   * "It doesn't untap during its controller's next untap step" (Junk
   * Winder; the `tap` effect's `doesntUntapNext`): the next untap step of
   * whoever controls it then passes it by. The effect tracks the permanent,
   * not its controller (the rulings — Icy Blast, Grip of the Roil): one that
   * changes hands first stays tapped through its new controller's next untap
   * step instead. Another player's untap step it untaps in (Seedborn Muse)
   * isn't its controller's. Cleared as that untap step happens, whether or
   * not it was tapped, and by any change of zone.
   */
  skipsNextUntap?: true;
  /**
   * With `skipsNextUntap`: how many more of its controllers' untap steps pass
   * it by after that next one — "its controller's next **two** untap steps"
   * (Telekinesis) is 1. Counted whoever controls it during each (its ruling).
   */
  skipsFurtherUntaps?: number;
  /**
   * "Those creatures don't untap during **that player's** next untap step"
   * (Sleep), "this creature doesn't untap during **your** next untap step"
   * (Reveka): the skip is tied to that player's untap step, not to whoever
   * controls the permanent then — one that changes hands first untaps in its
   * new controller's untap step as usual. One entry a player, each with how
   * many of that player's untap steps are left. Spent as that player's untap
   * step happens, and all gone with any change of zone.
   */
  skipsUntapOf?: readonly { readonly player: PlayerId; readonly steps: number }[];
  /**
   * This object as it last existed on the battlefield — last-known
   * information (rules 603.10a, 608.2h). See {@link LastKnownInfo}.
   *
   * Taken by the move that takes it off the battlefield, before that move
   * resets control, counters, modifiers and any copy effect, and **kept**
   * through later moves until the next departure from the battlefield
   * replaces it: a dies trigger still reads its creature's power after the
   * card has been exiled from the graveyard in response. Nothing reads it
   * without saying which departure it means — see {@link LastKnownRefs}.
   */
  lastKnown?: LastKnownInfo;
  /** The snapshots `lastKnown` held before, newest first, a few kept: a
   * permanent that left, came back and left again before an ability
   * referring to its first departure resolved is still read as it was then. */
  earlierLastKnown?: LastKnownInfo[];
  /**
   * For a spell or ability object: which battlefield stint of the objects it
   * refers to it means, for last-known information. See
   * {@link LastKnownRefs}.
   */
  lastKnownRefs?: LastKnownRefs;
  /** The turn a `oncePerTurn` `alternativeCostForSpells` of this permanent was
   * last used (Demon of Fate's Design). Cleared on any zone change, as
   * `playUses` is (rule 400.7). */
  altCostGrantOnTurn?: number;
  /**
   * Players this permanent has dealt combat damage to this turn — Steel
   * Hellkite's "whose controller was dealt combat damage by this creature
   * this turn". Reset at the start of each turn, and by `moveObject` like
   * every other per-permanent flag: a creature that left and came back is a
   * new object and has damaged nobody.
   */
  combatDamagedPlayersThisTurn?: PlayerId[];
  /**
   * This stack object is a delayed triggered ability that has fired (rule
   * 603.7) — the whole record, because there is no card ability for
   * `stackAbilityOf` to look up by index. Only ever set on an `"ability"`
   * object on the stack.
   */
  delayedTrigger?: DelayedTrigger;
  /** For an ability object: the `eventSeq` as it was put on the stack. An
   * ability of a permanent transforms that permanent only if it hasn't
   * transformed since (rule 701.28f — see `transformedAtSeq`). */
  stackedAtSeq?: number;
  /** The `eventSeq` this permanent last transformed at (rule 701.28f).
   * Cleared as it changes zones — entering transformed isn't transforming. */
  transformedAtSeq?: number;
  /** The `eventSeq` this card was put into its hand at, from another zone
   * and not by being drawn — a search's find, a look's pick, a return. What
   * the `"put-into-hand"` this-way kind reads: Adventure Awaits' "if you
   * didn't put a card into your hand this way". Cleared as it changes zones
   * again. */
  handArrivalSeq?: number;
  /** The turn this card was drawn on, for as long as it stays where the draw
   * put it (`CardFilter.drawnThisTurn` — Sylvan Library's "cards in your hand
   * drawn this turn"). Only a real draw sets it: a card a replacement gave
   * instead wasn't drawn (the ruling), and a tutor's isn't. Cleared as it
   * changes zones again (rule 400.7). */
  drawnOnTurn?: number;
  /** This stack object is a reflexive triggered ability (rule 603.12) — the
   * whole record, for the same reason as `delayedTrigger`. Only ever set on
   * an `"ability"` object on the stack. */
  reflexiveTrigger?: ReflexiveTrigger;
  /** Chosen targets while this is a spell/ability on the stack; `null` otherwise. */
  /** A hole (`undefined`) marks an optional target slot the caster chose to
   * leave empty — see `ResolvedTargets`. */
  targets: (TargetRef | undefined)[] | null;
  /**
   * This spell can't be countered because of *how it was paid for* — Cavern
   * of Souls' "and that spell can't be countered". Distinct from
   * `CardDefinition.cantBeCountered`, which is printed on the spell itself;
   * this is a property one particular casting picked up from the mana.
   * Cleared by `moveObject` with every other per-object flag.
   */
  uncounterable?: boolean;
  /** True when one of `controlEffects` is a temporary one (Act of Treason)
   * that cleanup has yet to end. Cleared by cleanup and by `moveObject` on any
   * zone change. */
  controlEndsAtCleanup: boolean;
  /**
   * The control-changing effects (layer 2) that came from a resolved spell or
   * ability rather than an attached Aura — a `gain-control` (Act of Treason,
   * Sliver Overlord), or "put it onto the battlefield under your control"
   * (Gravespawn Sovereign). Each carries the timestamp it was created at
   * (rule 613.7b); `Game.recomputeControl` weighs them against every attached
   * control-granting Aura (whose timestamp is when it became attached, rule
   * 613.7e) and the latest one wins, else the owner. An `untilEndOfTurn` one
   * is dropped in cleanup. Absent on almost every permanent; cleared by
   * `moveObject` on any zone change, since a new object has no history
   * (rule 400.7).
   */
  controlEffects?: ControlEffect[];
  /** The name of the card this permanent is currently a *copy* of (rule 707 /
   * layer 1), or `null` when it is just itself. Every characteristic read —
   * P/T, types, abilities, the client's card face — resolves through
   * `printedCardName`, which returns this when set. Cleared on any zone change
   * (a Clone that dies and returns is a Clone again). */
  copyOf: string | null;
  /** The card whose rules text this permanent has (layer 3, rule 612.5): an
   * exchange of text boxes (Deadpool, Trading Card) gave it another
   * permanent's text as it then was — every ability, keyword and static —
   * while its name, mana cost, colors, types and P/T stay its own. Its
   * abilities are read through {@link rulesTextName}. Cleared on any zone
   * change, with `copyOf`. */
  textFrom?: string;
  /**
   * A merged permanent (rule 730 — mutate, 702.140): the cards and tokens
   * that represent it, topmost first. One entry is `{ self: true }`, this
   * object's own card or token; the others are what merged with it, each
   * by the name it was (`printedCardName`), its owner and whether it was a
   * token. Its characteristics are the topmost component's (730.2a — a
   * copiable effect, so {@link printedCardName} returns it) and its
   * abilities every component's (702.140e — {@link rulesTextName} names a
   * combined definition the registry builds, see {@link mergedTextName}).
   * It stays the same object (730.2c). As it leaves the battlefield the
   * other components go to the same zone as cards of their own, a token
   * ceasing to exist (730.3). `timesMutated` is "the number of times this
   * creature has mutated". Cleared on any zone change.
   */
  merged?: {
    readonly components: readonly MergedComponent[];
    readonly timesMutated: number;
  };
  /**
   * A melded permanent (rules 701.42, 712.4): one object represented by two
   * cards of a meld pair — this object's own card and `with`'s — put onto
   * the battlefield combined, their back faces up (712.14c). It has only the
   * characteristics of the combined back face `into` (712.8g — a registered
   * definition whose `meldOf` names the pair; {@link faceName} returns it),
   * and its mana value is its front faces' summed (202.3c). As it leaves the
   * battlefield one permanent leaves and both cards go to the new zone
   * (712.21), `with` as a card of its own. Set as it enters
   * (`Game.meldPair`), cleared as it leaves.
   */
  melded?: MeldedInfo;
  /**
   * The other cards a merged or melded permanent became as it left the
   * battlefield (rules 712.21, 730.3), each put into the zone this object
   * went to: what "that card" also finds (730.3c; the meld ruling — "if an
   * effect moves a melded permanent to a new zone and then affects 'that
   * card,' it affects both cards"). Set by the move that scattered them,
   * cleared on this object's next zone change.
   */
  leftWith?: readonly ObjectId[];
  /**
   * The copy effects with a duration that apply to it, oldest first —
   * entering as a copy until end of turn (Cursed Mirror), a `become-copy`
   * until end of turn (Mirage Mirror), until the next end step (Niko, Light
   * of Hope) or until its controller's next turn (Taskmaster, Mercenary
   * Mimic). Copy effects apply in timestamp order and each sets every
   * copiable value (rules 613.2, 613.7a, 707.2), so the last one is what it
   * is — its `copyOf` and copiable modifiers are that one's — and under them
   * all it is {@link copyBase}. As one ends it's dropped, and it is the
   * latest left again, else its base (`Game.endTemporaryCopies`). A copy
   * effect without a duration that applies later is later than every one of
   * them, so it replaces them all. Cleared on any zone change.
   */
  temporaryCopies?: TemporaryCopy[];
  /** What it is under every one of {@link temporaryCopies}: set as the first
   * begins, cleared with the last. Cleared on any zone change. */
  copyBase?: CopyValues;
  /** The creature type chosen as this permanent entered (Urza's Incubator —
   * needed-cards P14, rule 601.2f-adjacent — an ETB choice, not a cast-time
   * one). Absent for a permanent with no such choice; cleared on any zone
   * change (a fresh entry chooses again). */
  chosenCreatureType?: string | null;
  /**
   * The word chosen as this permanent entered, for "as this enters, choose a
   * colour / choose Khans or Dragons" (Heraldic Banner, Frontier Siege).
   *
   * Separate from `chosenCreatureType`, which feeds a cost-matching check and
   * nothing else; this one is read by static abilities, mana abilities and
   * trigger conditions, so it stays a bare label the card's own text
   * interprets.
   */
  chosenOnEnter?: string | null;
  /**
   * The card names chosen for this permanent (rule 201.4), oldest first: one
   * chosen as it entered (Pithing Needle, Meddling Mage —
   * `CardDefinition.chooseCardNameOnEnter`), or each one an ability of it
   * chose and kept (`choose-card-name { remember }` — Petrified Hamlet's
   * enters trigger, Day of the Moon's "a name chosen for this enchantment").
   * What a `chosenName` filter reads off its source. Cleared on any zone
   * change: a fresh entry chooses again (rule 400.7).
   */
  chosenNames?: string[];
  /** "The chosen player": the player chosen as this permanent entered
   * (`CardDefinition.choosePlayerOnEnter` — Black Vise, Saskia the
   * Unyielding), or the last one an ability of it chose and kept
   * (`choose-opponent { remember }` — Triarch Stalker's "the last chosen
   * player"). What a `"chosen-player"` scope, trigger subject or filter
   * reads off its source. Cleared on any zone change (rule 400.7). */
  chosenPlayer?: PlayerId;
  /** The second of the two players chosen as this permanent entered
   * (`CardDefinition.chooseTwoPlayersOnEnter` — Sower of Discord), beside
   * `chosenPlayer`, the first: what the `"chosen-players"` damage recipient
   * and the `"other-chosen-player"` scope read. Cleared on any zone change
   * (rule 400.7). */
  otherChosenPlayer?: PlayerId;
  /** What was chosen for this permanent (`chosenPlayer`, `chosenCreatureType`)
   * was chosen **secretly** — "secretly choose an opponent" (Stalking Leonin,
   * Guardian Archon), "secretly choose Human, Merfolk, or Goblin" (A Killer
   * Among Us). `by` is who chose: while it isn't `revealed` only they see it
   * (`viewFor` leaves it out of every other seat's view, spectators included,
   * and nothing in the log names it), and only they can pay a "reveal the
   * player you chose" cost (`AbilityCost.revealChosen`) — a player who gains
   * control of the permanent didn't choose anything. Cleared on any zone
   * change, with the choice (rule 400.7). */
  secretChoice?: { readonly by: PlayerId; readonly revealed?: true };
  /** "The chosen creature": the permanent chosen as this one entered
   * (`CardDefinition.choosePermanentOnEnter` — Tyrannical Pitlord, Dauntless
   * Bodyguard; rules 614.1c, 607.2d), with the stint it was chosen in
   * (`zoneChangeCount`) — once it leaves the battlefield it's a new object
   * the choice no longer names (rule 400.7). What the `"chosen"`
   * {@link ObjectRef} and a static's `{ scope: "chosen" }` read.
   * Cleared on any zone change of this one. */
  chosenPermanent?: { readonly id: ObjectId; readonly stint: number };
  /** A battle's protector (rule 310.9): the player who defends it — chosen
   * as it entered (310.9a; for a Siege, one of its controller's opponents,
   * 310.12a). It's the defending player of any creature attacking it, and
   * the only one who may block those attackers (310.9c-d); it can never
   * attack it (310.9b). Unchanged by a change of control or of what it is
   * (310.9g); a protector who can't be one any more is replaced or the
   * battle goes (310.11). */
  protector?: PlayerId;
  /**
   * "As this enters" choices (rule 614.12) made while it was still on its way:
   * a Clone's copy (`copyOf`, `null` for none — rule 707.9), a chosen
   * creature type or word (`chosen`), and what an Aura enchants (`enchant` —
   * its target, for an Aura spell, or its controller's choice, rule 303.4f;
   * `null` when there's nothing it could enchant, and then it doesn't enter,
   * 303.4g). They're asked before it moves, so the replacements that apply
   * as it enters and the triggers that see it arrive both see it as chosen;
   * `moveObject` applies them as it enters and clears them on any move. See
   * `Game.askEnterChoice`.
   */
  enterChoice?: {
    /** The effect putting it there says it "has no abilities" (Xu-Ifit,
     * Osteoharmonist — `EnterTypes.loseAbilities`): it will have none on the
     * battlefield, so it makes none of its own "as this enters" choices
     * (rule 614.12, the ruling). Set before they're asked. */
    readonly withoutAbilities?: true;
    /** The effect putting it there puts it there transformed: its back face
     * is up as it enters (rule 712.14a), so its choices are that face's. Set
     * before they're asked. */
    readonly transformed?: true;
    readonly copyOf?: string | null;
    /** The cards its `CopyOnEnter.exileFirst` exiled, once they're chosen:
     * what it copies one of, and whose others' power its
     * `"other-exiled-power"` counters count. */
    readonly copyExiled?: readonly ObjectId[];
    /** The copied permanent's copy exceptions (its `copiable` modifiers),
     * which the copy takes too (rule 707.9b), then this copy effect's own
     * (`CopyOnEnter.except`). */
    readonly copyModifiers?: readonly PtModifier[];
    /** It's a copy by another permanent's or a resolved effect's "enter as
     * a copy of" (`OthersEnterReplacement.asCopyOf` — `Game.enterAsCopyAsked`),
     * not its own: checked once (`false` when none applied). `shields` are
     * the "next time" ones that applied (their `source` and `madeIn`),
     * spent by the event it enters in. */
    readonly copyBy?: false | { readonly shields: readonly { readonly source: ObjectId; readonly madeIn?: number }[] };
    /** What copying adds to how it enters, beyond what it copies (rule
     * 707.9e — `CopyOnEnter.tapped` / `counters`): tapped, and counters,
     * each `ifType` judged once it's the copy. */
    readonly copyEnter?: {
      readonly tapped?: true;
      readonly counters?: readonly { readonly kind: string; readonly amount: number; readonly ifType?: CardType }[];
      /** The copy lasts until end of turn (`CopyOnEnter.untilEndOfTurn`). */
      readonly untilEndOfTurn?: true;
      /** The copy lasts until it's turned face down
       * (`CopyOnEnter.untilTurnedFaceDown`). */
      readonly untilTurnedFaceDown?: true;
      /** "When you do, …" (`CopyOnEnter.whenYouDo`, rules 603.11, 707.9g): the
       * ability, with what it copied as it was chosen — its trigger object,
       * by stint (rule 400.7). */
      readonly whenYouDo?: {
        readonly effect: EffectSpec;
        readonly text: string;
        readonly copied: ObjectId;
        readonly copiedStint: number;
      };
    };
    readonly chosen?: string;
    /** The card name chosen as it was about to enter
     * (`CardDefinition.chooseCardNameOnEnter`), or `null` when none could be
     * (Alhammarret, High Arbiter with no nonland card revealed). */
    readonly chosenName?: string | null;
    /** The opponent whose hand its controller looks at before naming a card
     * (Sorcerous Spyglass's "look at an opponent's hand") — chosen first,
     * among two or more. */
    readonly lookAt?: PlayerId;
    readonly enchant?: ObjectId | null;
    /** The player an "Enchant player" Aura enters attached to — its spell's
     * target, or its controller's choice (303.4f). Answers what `enchant`
     * would otherwise ask, and then `enchant` stays unset. */
    readonly enchantPlayer?: PlayerId;
    /** The card a reveal land's controller revealed from hand, or `null`
     * for none (it enters tapped) — or what a behold land's controller
     * beheld (`tappedUnlessBehold`, rule 701.4a), a card or a permanent. */
    readonly reveal?: ObjectId | null;
    /** Riot's choices (rule 702.136a), one for each instance (702.136b): an
     * additional +1/+1 counter, or haste. */
    readonly riot?: readonly ("counter" | "haste")[];
    /** Unleash's choice (rule 702.98a): whether it enters with the
     * additional +1/+1 counter. */
    readonly unleash?: boolean;
    /** Its controller's answer to "you may have this land enter tapped"
     * (`EntersBattlefieldReplacement.mayEnterTapped`). */
    readonly enterTapped?: boolean;
    /** The permanent it exchanges text boxes with as it enters
     * (`CardDefinition.exchangeTextOnEnter` — Deadpool), or `null` when its
     * controller declined or there was none. */
    readonly exchangeText?: ObjectId | null;
    /** How many permanents it devoured as it was about to enter (rule
     * 702.82a — `CardDefinition.devour`): sacrificed then, and counted for
     * its +1/+1 counters as it enters. */
    readonly devoured?: number;
    /** What it devoured, each as it last existed on the battlefield: becomes
     * `enteredDevoured` as it enters. */
    readonly devouredWhat?: readonly LastKnownInfo[];
    /** Whether what an `EnterInstead` asks of it was done as it was about to
     * enter: `false`, and it goes to its owner's graveyard instead
     * (`moveObject`). */
    readonly insteadDone?: boolean;
    /** With `insteadDone: false`: exile it, not the graveyard (`EnterInstead`'s
     * `exileUnless`). */
    readonly insteadExile?: true;
    /** Another permanent's `exileInstead` (Containment Priest) applies to it
     * entering: `true` once it's applied before its own "as this enters"
     * actions (rule 616.1e), so none is asked and `moveObject` exiles it;
     * `false` once its own come first, or there's nothing to order. */
    readonly exileInsteadFirst?: boolean;
    /** How many cards its `AsEntersAction` exiled or returned as it was about to
     * enter, once that's settled: what its `"done-as-enters"` counters count. */
    readonly asEntersDone?: number;
    /** The cards its `AsEntersAction` exiled: linked to it as it enters (rule
     * 607.2a), for its stint there. */
    readonly asEntersExiled?: readonly ObjectId[];
    /** A commander its `AsEntersAction` is returning, waiting on its owner's
     * choice of the command zone instead (rule 903.9b). */
    readonly asEntersReturning?: ObjectId;
    /** The counter kind picked for each card exiled (`counterForEach`), or
     * the keyword counters its `discard` earned (`keywordCounters`). */
    readonly asEntersCounters?: readonly string[];
    /** How many cards its controller revealed for its amplify as it was
     * about to enter (rule 702.38a — `CardDefinition.amplify`), counted for
     * its +1/+1 counters as it enters. */
    readonly amplified?: number;
    /** The protector its controller chose for it as it was about to enter
     * (rule 310.9a — a Siege's, among their opponents, 310.12a). */
    readonly protector?: PlayerId;
    /** Tribute (rule 702.104a): the opponent its controller chose as it was
     * about to enter (`null` with none to choose), then whether that player
     * put the counters on it. */
    readonly tributeFrom?: PlayerId | null;
    readonly tributePaid?: boolean;
    /** The player chosen for it as it was about to enter
     * (`CardDefinition.choosePlayerOnEnter`), or `null` with nobody to
     * choose. Lands on `GameObject.chosenPlayer`. */
    readonly chosenPlayer?: PlayerId | null;
    /** The second of two players chosen as it was about to enter
     * (`CardDefinition.chooseTwoPlayersOnEnter`), or `null` with nobody
     * else to choose. Lands on `GameObject.otherChosenPlayer`. */
    readonly otherChosenPlayer?: PlayerId | null;
    /** `chosenPlayer` was chosen secretly, by this player
     * (`CardDefinition.secretChoiceOnEnter`). Lands on
     * `GameObject.secretChoice`. */
    readonly chosenSecretlyBy?: PlayerId;
    /** The permanent chosen for it as it was about to enter
     * (`CardDefinition.choosePermanentOnEnter`), or `null` for none. Lands
     * on `GameObject.chosenPermanent`. */
    readonly chosenPermanent?: ObjectId | null;
    /** What it's being put onto the battlefield attached to is chosen as it
     * enters, among the permanents matching this from its controller's side
     * — `EnterAttachHost`'s `among` (One Last Job's "attached to a creature
     * you control"). An Aura's choice is its `enchant` (rule 303.4f, limited
     * to these); an Equipment's is `attachHost`. */
    readonly attachAmong?: CardFilter;
    /** The permanent an Equipment entering with `attachAmong` was chosen to
     * enter attached to, or `null` for none it could equip (it enters
     * unattached — rule 301.5e). */
    readonly attachHost?: ObjectId | null;
  };
  /** The faces of a multi-face card (rule 712 — ROADMAP Phase 10), by name,
   * front first — copied from `CardDefinition.faces` when the object is
   * created. Absent for a single-faced card. */
  faces?: readonly string[];
  /** Which face of a multi-face card is up (index into `faces`). `0` / absent
   * = the front face. Set by the cast/play face choice; a transform effect
   * toggles it in place; reset to `0` on a move to a hidden zone (rule 712 —
   * a DFC has only its front face's characteristics while not on the
   * battlefield or stack). */
  face?: number;
  /** The flipped status (rules 110.5, 710): set by a `flip` effect, one way
   * (710.4), and kept through copy effects (110.5c); gone when the permanent
   * leaves the battlefield. It matters only while its copiable values are a
   * flip card's — then {@link flippedName} says which half it shows. */
  flipped?: true;
  /** While {@link flipped} and its copiable values are a flip card (its own,
   * a copy effect's or a merged topmost card's), that card's alternative
   * half (rule 710.1b; 707.3 — a copy's values are modified by the copy's
   * own status). Recomputed by `Game` whenever it flips or its copiable
   * values change; {@link printedCardName} reads it first. */
  flippedName?: string;
  /** The value chosen for `{X}` when this spell was cast (rule 601.2b). Set on
   * the stack object and preserved onto the permanent it becomes, because the
   * permanent's own enters-the-battlefield replacement ("enters with X
   * counters") and triggered abilities use it (rule 107.3m) — the latter via
   * `PendingTrigger.x`, which copies it onto the ability object. Nothing else
   * reads it off a permanent: for everything else the permanent's X is 0
   * (a filter's mana value only counts it on the stack). `null` when the
   * cost had no `{X}` or the permanent entered without being cast. Cleared by
   * `moveObject` on any later zone change, so a flickered permanent comes
   * back as a new object with no X. On an ability object it is the X that
   * ability resolves with (`ctx.x`). */
  xValue: number | null;
  /** For a triggered-ability object on the stack: a numeric quantity from the
   * triggering event (the entering / attacking creature's power, or the combat
   * damage a creature dealt), snapshotted at trigger time — read by
   * `EffectAmount` `{ triggerValue: true }` (Terror of the Peaks, Old
   * Gnawbone). ROADMAP P4b. */
  triggerValue?: number;
  /** For a triggered-ability object on the stack: the object whose entering /
   * attacking / etc. fired the trigger, snapshotted at trigger time — read by
   * a `create-token-copy` effect with `of: "trigger-object"` (Miirym, Sentinel
   * Wyrm — needed-cards P5b). */
  triggerObject?: ObjectId;
  /** For a triggered-ability object on the stack fired by a `becomes-target`
   * trigger: the spell or ability that targeted — see {@link TargetedBy}. */
  targetedBy?: TargetedBy;
  /** For a triggered-ability object on the stack: how many real, independent
   * firings this one stack-object represents — the ability's own source's
   * `stackCount` (a `stackCount`-carrying token's ability fired once but
   * stands for that many identical creatures each triggering separately,
   * rule 603.3d) times the triggering event's own `count`, if any. Read by
   * `applyEffectSpec`'s `create-token` / `create-token-copy` cases to scale
   * `count` — the only effect kinds proven safe to multiply this way (no
   * per-firing choice or target). `1` outside a scaled resolution; a
   * multiplier > 1 is only ever produced for a *non-targeted* ability whose
   * whole effect is safe to scale (see `Game.isCountScalableEffect`) —
   * anything else is fired once per real instance instead, at full cost, so
   * this never changes another card's observable behaviour. Pure engine
   * resource-safety optimization, not derived from any rule. */
  stackMultiplier?: number;
  /** The modes chosen for a targeted modal spell as it was cast (rule 700.2 —
   * ROADMAP Phase 11 EG-2), sorted ascending — indices into
   * `CardDefinition.castModal.modes`. `resolveTopOfStack` applies each with its
   * own slice of `targets`. Absent for a non-modal spell; cleared on any zone
   * change. */
  chosenModes?: readonly number[];
  /** The opponent who chose some of this spell's or ability's targets, or
   * its modes, as it was cast or activated (rules 601.2c, 700.2e —
   * `CardDefinition.opponentChoosesTargets`, `CastModalSpec.chosenBy`):
   * what a target filter's `controlledBy: "chooser"` reads as its targets
   * are checked again (608.2b), and "that player" of modes they chose.
   * Cleared on any zone change. */
  otherChooser?: PlayerId;
  /** How a spell's divided amount was split among its group's targets as it
   * was cast (rule 601.2d — `CardDefinition.divided`), one per target in
   * order. Cleared on any zone change. */
  division?: readonly number[];
  /** The turn this permanent was last turned face up on (rule 701.40b), for
   * "that was turned face up this turn" (`turnedFaceUpThisTurn`); cleared on
   * any zone change. */
  turnedFaceUpOnTurn?: number;
  /** What `CardDefinition.asCast` read as this spell finished being cast (rule
   * 601.2i), by index: a count, or 1 or 0 for a condition. Never copied to a
   * copy of it, which wasn't cast; cleared on any zone change. */
  asCastFacts?: readonly number[];
  /** This spell was kicked as it was cast (rule 702.33 — needed-cards P8): its
   * kicker cost was paid, so `resolveTopOfStack` applies the kicked `effect`.
   * Absent for an unkicked or unkickable spell; cleared on any zone change. */
  kicked?: boolean;
  /** With `kicked`: this spell is kicked only because its caster controlled
   * a `kicker.orControls` permanent as it was cast (Dragons of Tarkir's "or
   * controlled a Dragon as you cast this spell"), nothing revealed. A copy
   * of it wasn't cast, so it isn't kicked (the Draconic Roar ruling).
   * Cleared with `kicked`. */
  kickedByControl?: true;
  /** The cards spliced onto this spell as it was cast (rule 702.47), by
   * name, in order: their targets follow the spell's own and their effects
   * are followed after its own (702.47b). Copied to a copy of the spell;
   * cleared on any zone change (702.47e). */
  spliced?: readonly string[];
  /** How many times a multikicker cost was paid as this spell was cast
   * (rule 702.33c–d) — set with `kicked` on a multikicker spell, cleared
   * with it. */
  timesKicked?: number;
  /** Which of a two-kicker card's kicker costs were paid as this spell was
   * cast (rule 702.33b, f — `kicker.second`): 1 the first, 2 the second, 3
   * both. Set with `kicked`, cleared with it; `timesKicked` counts them. */
  kickedWith?: number;
  /** A granted offspring cost was paid as this spell was cast (Zinnia): the
   * permanent it becomes gets offspring's trigger as it enters. Cleared on
   * any zone change after that. */
  offspringGrantPaid?: boolean;
  /** The madness cost a `grantsToHand` static gave this card as it was
   * discarded (rule 702.35a): the keyword's trigger reads it in exile, where
   * the grant doesn't reach. Cleared on any zone change after that. */
  madnessCostGiven?: string;
  /** Gift (rule 702.174): the opponent this spell's gift was promised to —
   * chosen as its gift cost was paid (`GiftAsk`), copied to a copy of it
   * (the ruling). Cleared on any zone change; a permanent spell carries it
   * onto the battlefield as `enteredGiftTo`. */
  giftTo?: PlayerId;
  /** The opponent the gift of this permanent's spell was promised to, for
   * its "when this permanent enters, if its gift cost was paid" ability
   * (rule 702.174b). Gone with its next move; a copy of the permanent
   * doesn't have it (the ruling). */
  enteredGiftTo?: PlayerId;
  /** This spell was cast for its evoke cost (rule 702.74): the permanent it
   * becomes gets evoke's sacrifice trigger as it enters. Cleared on any
   * zone change after that. */
  evokePaid?: boolean;
  /** This spell was cast by its own "as though it had flash" when a sorcery
   * couldn't have been (`CardDefinition.flashThenSacrifice`): the permanent
   * it becomes is sacrificed at the beginning of the next cleanup step. Not
   * carried by a copy (it wasn't cast). Cleared on any zone change after
   * that. */
  flashSacrificeOwed?: boolean;
  /** This spell was cast for its spectacle cost (rule 702.137 — the
   * `alternativeCost` with `keyword: "spectacle"`), for "if its spectacle
   * cost was paid" (`self-spectacle-paid`). A copy has it too (707.10). */
  spectaclePaid?: boolean;
  /** This spell was cast for its surge cost (rule 702.117 — the
   * `alternativeCost` with `keyword: "surge"`), for "if its surge cost was
   * paid" (`self-surge-paid`). A copy has it too (707.10). */
  surgePaid?: boolean;
  /** This spell was cast for its prowl cost (rule 702.76 — the
   * `alternativeCost` with `keyword: "prowl"`), for "if its prowl cost was
   * paid" (`self-prowl-paid`). A copy has it too (707.10). */
  prowlPaid?: boolean;
  /** This spell was cast for its own alternative cost (rule 118.9, the card's
   * `alternativeCost`) or its madness cost (702.35b), for the
   * `self-alternative-cost-paid` condition. A copy has it too (707.10). */
  alternativeCostPaid?: "printed" | "madness";
  /** This spell was cast for its overload cost (rule 702.126 — Cyclonic
   * Rift): its overload cost was paid instead of its mana cost, with no
   * targets, so `resolveTopOfStack` applies `CardDefinition.overload.effect`.
   * Absent otherwise; cleared on any zone change. */
  overloaded?: boolean;
  /** Cast bestowed (rule 702.103b — `CardDefinition.bestow`): a bestowed
   * Aura spell, and then the bestowed Aura it resolves into — its
   * characteristics `bestowedDefinition`'s, not a creature. Kept from the
   * stack onto the battlefield and cleared by every other zone change; and
   * cleared when it becomes unattached or is attached to something it can't
   * enchant (702.103f — a creature again, where it is), or when its target
   * is illegal as it begins resolving (702.103e — it resolves as a creature
   * spell). A copy of the spell has it too (702.103c). */
  bestowed?: boolean;
  /** The alternative permission this spell was cast under while it's on the
   * stack (ROADMAP Phase 6). `"flashback"` (rule 702.34) additionally means it
   * is exiled instead of going anywhere else from the stack. `null` / absent
   * for a normally-cast spell. Cleared by `moveObject` on any zone change. */
  castVia?: CastVia | null;
  /** A temporary "this instant/sorcery card in a graveyard has flashback"
   * grant (Snapcaster Mage — ROADMAP Phase 6b). Read alongside
   * `CardDefinition.flashback`. Cleared on any zone change and (when
   * `untilEndOfTurn`) in cleanup. `by` is the source of the effect that gave
   * it (Past in Flames), which names this flashback beside the card's own. */
  grantedFlashback?: {
    cost: string;
    untilEndOfTurn: boolean;
    by?: ObjectId;
    /** "Equal to its mana cost" (Snapcaster Mage): the face being cast's,
     * read then — a split card's half's (rule 709.3). */
    ownManaCost?: true;
  } | null;
  /** Keyword abilities a one-shot effect gave this card in a graveyard until
   * end of turn (`grant-graveyard-keyword` — Cursecloth Wrappings' embalm,
   * Ghost Ark's unearth), each with its cost as a string (`""` for retrace,
   * which has none) and the effect's source. Ends on any zone change and in
   * cleanup, as `grantedFlashback` does. */
  grantedGraveyardKeywords?: readonly {
    keyword: GraveyardKeyword;
    cost: string;
    by: ObjectId;
    /** An escape's "plus exile N other cards" (rule 702.138a). */
    exileCount?: number;
    /** The cost is "its mana cost": of the face being cast. */
    manaCost?: true;
  }[];
  /** The other cards a spell's own escape exiled as it was cast, for the ability
   * it escapes with (`CardDefinition.escape.exileLinked`): linked to the permanent
   * it becomes (rule 607.2a). Only on the stack. */
  escapeExiled?: readonly ObjectId[];
  /** A foretell cost the card was given besides any printed on it (rule
   * 702.143d): its mana cost, of the face being cast, reduced by this much
   * generic mana — "its foretell cost is its mana cost reduced by {2}"
   * (`grantsForetellInHand`, Dream Devourer; `become-foretold`, Ethereal
   * Valkyrie). It keeps it whatever becomes of what gave it. Ends on any zone
   * change. */
  foretoldReducedBy?: number;
  /** True while this card is suspended — exiled with time counters (rule
   * 702.62 — ROADMAP Phase 6b). A turn-based action removes one time counter
   * at the owner's upkeep; at zero it's cast for free. Cleared on any zone
   * change. */
  suspended?: boolean;
  /** True on a card in exile that gained "When the last time counter is removed
   * from this card, if it's exiled, you may cast it without paying its mana
   * cost" with no suspend of its own (Alaundo the Seer): no upkeep takes its
   * counters off, and it isn't suspended (rule 702.62b). Cleared on any zone
   * change. */
  timeCast?: boolean;
  /** The name a static ability gives this permanent — Witness Protection's
   * "named Legitimate Businessperson" — and that ability's timestamp. Layer 1
   * has the copy effects' names on `modifiers`; this one, like who controls a
   * permanent (layer 2), is a stored field, kept right by `refreshStaticNames`
   * at each state-based check, and it's read through {@link nameOf}. */
  staticName?: { readonly name: string; readonly timestamp: number };
  /** True on a permanent cast from suspend (or another "has haste until it
   * leaves" grant) — `hasSummoningSickness` returns false for it. Cleared on
   * any zone change. */
  hastyUntilItLeaves?: boolean;
  /** True on a token copy that must be exiled at the beginning of the next end
   * step (Miirym, Sentinel Wyrm — rule 707 / needed-cards P5b). Swept in
   * `endStepActions`. */
  exileAtEndStep?: boolean;
  /** True on a token that must be *sacrificed* at the beginning of the next
   * end step (Encore — rule 702.141). Distinct from `exileAtEndStep`: a
   * sacrifice sees dies-triggers, an exile doesn't. */
  sacrificeAtEndStep?: boolean;
  /** "If it would leave the battlefield, exile it instead of putting it
   * anywhere else" (rule 614 — Whip of Erebos, Necromancy): a replacement
   * that follows this one object, not a static on some permanent. Set by the
   * effect that put it onto the battlefield (`put-onto-battlefield
   * { exileIfItWouldLeave }`), read by `moveObject` on the way out, and
   * cleared by that same move — the card that lands in exile is a new object
   * the replacement no longer applies to (rule 400.7). */
  exileIfItWouldLeave?: boolean;
  /** "If that creature would die this turn, exile it instead" (Lava Coil —
   * rule 614.1a): the turn number it was said on. `moveObject` exiles the
   * permanent instead of putting it into a graveyard from the battlefield
   * while `state.turn.number` still equals it — "this turn" ends with the
   * turn, so no sweep clears it — and any zone change clears it (rule
   * 400.7). */
  exileIfDiesTurn?: number;
  /** "The next time [it] adapts this turn, it adapts as though it had no
   * +1/+1 counters on it" (Biomancer's Familiar): the turn number it was
   * said on, while its next adapt hasn't used it up. Stale past that turn;
   * any zone change clears it (rule 400.7). */
  adaptAsThoughNoCountersTurn?: number;
  /** True while this card is foretold — exiled face-down for `{2}`, castable
   * later for its foretell cost (rule 702.143 — ROADMAP Phase 6b).
   * `foretoldOnTurn` is the turn it was foretold (can't be cast the same
   * turn). Both cleared on any zone change. */
  foretold?: boolean;
  foretoldOnTurn?: number | null;
  /** Set while this card is **plotted** (rule 702.170): the turn it became
   * plotted, by its plot special action or an effect ("it becomes
   * plotted"). Its owner may cast it from exile without paying its mana
   * cost, as a sorcery, on any later turn (702.170d — the `"plot"` cast),
   * whether or not it has plot (702.170d). Set only on a card in exile;
   * cleared on any zone change. */
  plottedOnTurn?: number;
  /** True while this card is in exile because it was **airbended** (rule
   * 701.65a): for as long as it remains exiled, its *owner* — whoever
   * airbended it — may cast it by paying {2} rather than its mana cost (the
   * `"airbend"` cast). Set only on a card (a token exiled has ceased to
   * exist, rule 111.7); cleared on any zone change, which ends "for as long
   * as it remains exiled". */
  airbended?: boolean;
  /** Exiled **face down** (rule 406.3): nobody may look at it but these
   * players — the one an instruction let look at it ("look at the top card
   * of that player's library, then exile it face down" — Edward Kenway), who
   * may go on looking for as long as it stays exiled. Its owner isn't one
   * unless named. Cleared on any zone change: it's turned face up as it
   * leaves exile. `group` says which cards were exiled face down by the same
   * instruction at the same time (the event sequence number it began at):
   * a processor choosing a face-down card chooses one of these groups and
   * takes a card from it at random (the processors' ruling — see
   * {@link faceDownExileGroup}). `lookersOnly`: an `exile-from-library`'s:
   * these players and no others, whoever comes to control a source it's
   * linked to, as a hideaway's controller wouldn't be (Kayla's Music Box's
   * ruling). */
  exiledFaceDown?: { readonly lookers: readonly PlayerId[]; readonly group?: number; readonly lookersOnly?: true };
  /** A **face-down permanent** (rule 708): manifested (701.40) or cloaked
   * (701.58). It has no characteristics but a face-down 2/2's — no name, no
   * text, no subtypes, no mana cost, and ward {2} if cloaked (708.2a) — which
   * are its copiable values, so {@link printedCardName} reads it as one of
   * the internal {@link FACE_DOWN_CARDS} definitions and every
   * characteristic and ability read follows. Only its controller may look at
   * it (708.5). Cleared on any zone change, where it's revealed (708.9);
   * turned face up as a special action (701.40b). `as` is the
   * characteristics the effect that put or turned it face down listed in
   * place of the 2/2's (rule 708.2 — "It's a 2/2 Cyberman artifact
   * creature"), read through {@link FACE_DOWN_AS_CARDS}. */
  faceDown?: { readonly kind: FaceDownKind; readonly as?: FaceDownAs };
  /**
   * A **Room**'s unlocked designations (rule 709.5c — a split permanent with
   * a shared type line): which of its doors, the card's left and right
   * halves, are unlocked. On the battlefield only; it enters with the door
   * that was cast unlocked and with neither otherwise (709.5d), and a door is
   * unlocked by its unlock cost (a special action, 709.5e) or an effect
   * (709.5f). A locked door's name, mana cost and rules text aren't the
   * permanent's (709.5): with one door unlocked it is that half (`face` 1 or
   * 2), with both the whole card (`face` 0), and with neither the internal
   * {@link LOCKED_ROOM} definition that {@link printedCardName} reads.
   * Cleared on any zone change.
   */
  doors?: { readonly left: boolean; readonly right: boolean };
  /** The timestamp a Room's door got as it was unlocked on the battlefield
   * (rules 709.5e, f): what that door's static abilities apply by when it's
   * later than the Room's own (`staticTimestamp`, rule 613.7a — Steaming
   * Sauna's ruling). None for a door the Room entered with unlocked, whose
   * abilities have the Room's timestamp. Dropped as the door is locked again
   * and, with `doors`, on any zone change. */
  doorUnlockedAt?: { readonly left?: number; readonly right?: number };
  /** A **Class**'s level (rule 716.2b) — a designation, not a copiable
   * value, which the permanent keeps even if it stops being a Class; none
   * is level 1 (716.2d). Set by a level bar (`gain-class-level`), cleared
   * on any zone change. */
  classLevel?: number;
  /**
   * The permanent this card was exiled with, in the battlefield stint it was
   * in then — what a linked ability of that object means by "the exiled
   * card" (rule 607.2a — hideaway, rule 702.75). Only that object's abilities
   * reach it: the permanent back from a blink is a new object (rule 400.7).
   * While the card stays exiled face down, whoever controls that permanent
   * may look at it (702.75a), and goes on being able to (406.3). Cleared on
   * any zone change.
   */
  exiledWith?: { readonly source: ObjectId; readonly zoneChangeCount: number };
  /**
   * The cards this token's ability means by "the exiled card" (rule 607.2a —
   * Hofri Ghostforge's Spirit, Timothar, Baron of Bats's Bat), each as the
   * object it is in exile (rule 400.7): the `link-exiled-to-created` effect's
   * record. On the token, not the card, so each of several tokens made
   * together has it (their rulings: any of them returns the card) and a token
   * split off a stack keeps it; a copy of the token doesn't (the rulings).
   */
  linkedExile?: readonly { readonly object: ObjectId; readonly zoneChangeCount: number }[];
  /**
   * The permanent this token was created with, in the battlefield stint that
   * created it (rule 400.7) — "exile all tokens created with it" (Arcane
   * Artisan), "each token knows which Saproling Burst it came from" (its
   * ruling). Set only by an effect that says so (`create-token`'s and
   * `create-token-copy`'s `linkedToSource`), on every token that effect makes,
   * a Doubling Season's extra ones and a replacement's Angels too. A token split
   * off a stack keeps it; a copy of the token doesn't have it (Arcane Artisan's
   * ruling). Read by the filter clause `createdWithSource` and the count
   * `countersOnMaker`.
   */
  createdWith?: TokenLink;
  /**
   * The cards encoded on this permanent (rule 702.99b — cipher), each with
   * the exile stint it was encoded in. One still exiled in that stint gives
   * it the cipher trigger (`Game.effectiveTriggeredEntries`), whoever
   * controls it now; one that has left exile is encoded on nothing (702.99c).
   * Cleared on any zone change.
   */
  encodedCards?: readonly {
    readonly card: ObjectId;
    readonly zoneChangeCount: number;
    /** When it was encoded: the timestamp of the ability it grants (rule
     * 613.7), which a loss of all abilities before then doesn't remove. */
    readonly timestamp: number;
  }[];
  /**
   * How many cards have been exiled *with* this permanent (an `exile {
   * linked }` — rule 607.2a) in its battlefield stint `stint`, ever — a card
   * that has left exile since still counts (the Colfenor's Urn ruling: "over
   * the course of the entire game"). A different stint is a different
   * object (rule 400.7) with none. Read by the `exiled-with-source`
   * condition.
   */
  exiledWithCount?: { readonly stint: number; readonly count: number };
  /** True while this adventure card sits in exile after its adventure resolved
   * (rule 715.3 — ROADMAP Phase 10): its owner may cast the creature half from
   * exile. Cleared on any zone change. */
  onAdventure?: boolean;
  /**
   * The prepared designation (rule 722.3a) on a permanent with a prepare
   * spell, and the copy of that spell it made in exile as it gained it
   * (722.3c) — what its controller may cast. Cleared on any zone change, and
   * as the copy is cast (601.2i) or an effect unprepares it (722.3b).
   */
  prepared?: { readonly copy: ObjectId };
  /** On that copy in exile: the permanent it belongs to, in its battlefield
   * stint — the copy stays in exile only while that permanent is still on
   * the battlefield and prepared (rule 722.3c, an exception to 704.5e), and
   * only that permanent's controller may cast it. */
  preparedFor?: { readonly permanent: ObjectId; readonly stint: number };
  /** A spell cast as a prepared copy (rule 722.3c) — "a prepared spell" to
   * Codie, Ravenous Codex. A copy of it is one too (722.3d). */
  preparedSpell?: boolean;
  /** What this creature is attacking — a player, or an opponent's planeswalker
   * (rule 508.1) — or `null` if not attacking. */
  attacking: PlayerId | ObjectId | null;
  /** The planeswalker or battle this creature is attacking stopped being one,
   * and so was removed from combat (rule 506.4): it's still an attacking
   * creature and may be blocked, but it attacks nothing and, unblocked, deals
   * no combat damage (506.4c). It doesn't rejoin if the permanent becomes a
   * planeswalker again. Gone when it leaves combat. */
  attackingNothing?: true;
  /** The attacker this creature is blocking, or `null` if not blocking —
   * the one it was declared blocking. */
  blocking: ObjectId | null;
  /** The other attackers it blocks: the rest of a band it blocked (rule
   * 702.22h). Absent for a creature blocking one attacker, which is every
   * other block. `blockedAttackersOf` reads both. */
  blockingAlso?: ObjectId[];
  /** The band this attacker is in (rule 702.22c), as the id of its first
   * declared member — a label only: the creatures banded with it are the
   * other attackers with the same `band`. Lasts the rest of combat (702.22e)
   * and goes as it leaves combat (702.22f). */
  band?: ObjectId;
  /** Blockers assigned to this attacker, in damage-assignment order. */
  blockedBy: ObjectId[];
  /** True once this attacker has been blocked (even if the blockers later die). */
  blocked: boolean;
  /** `"card"` for a real card/token; `"ability"` for an ability on the stack;
   * `"emblem"` for an emblem with abilities (`EmblemState.object` — rule 114:
   * in the command zone, in no zone list, never moving). */
  kind: "card" | "ability" | "emblem";
  /** For an ability object: `"activated"` or `"triggered"`. */
  abilityKind: "activated" | "triggered" | "chapter" | null;
  /** For an activated ability on the stack: it is a loyalty ability — its
   * cost has a loyalty symbol (rule 606.2). Read by a `{ kind: "ability",
   * loyalty: true }` target (Verdant Command). */
  loyaltyAbility?: true;
  /** For an ability object: the permanent whose ability this is. */
  sourceObjectId: ObjectId | null;
  /** For an ability object: index into the source's `activated`/`triggered` list. */
  abilityIndex: number | null;
  /** For a spell or ability on the stack: where each of its object targets
   * was when it was targeted (`null` for a player or an empty slot). An
   * object that has left that zone is read by last-known information (rule
   * 608.2h) — for a spell, as it last existed on the stack. A delayed
   * trigger carries its creator's zones forward. */
  targetZones?: (ZoneType | null)[];
  /** For a spell or ability on the stack: each object target's
   * `zoneChangeCount` when it was targeted (`null` for a player or an empty
   * slot). One that has changed zones since is a new object (rule 400.7) —
   * no longer the one meant — so it counts as gone when this resolves. A
   * delayed trigger, which chose no targets of its own, carries its
   * creator's as they were when it was created (`DelayedTrigger.targetStints`):
   * it acts on none that has changed zones since, while what it reads of
   * them still comes from last-known information (rule 608.2h — Mana
   * Drain's "that spell's mana value"). */
  targetStints?: (number | null)[];
  /** A spell's counters to enter the battlefield with — the
   * `enters-with-counters` effect. Cleared by any zone change but its own
   * resolution onto the battlefield. `amountAsItEnters` (mana spent on it —
   * `add-mana`'s `spellEntersWith`) is read then, in place of `amount`. */
  entersWithCounters?: {
    readonly kind: string;
    readonly amount: number;
    readonly condition?: StaticCondition;
    readonly amountAsItEnters?: EffectAmount;
  }[];
  /** A card's mana value as it last existed on the stack, {X} included (rule
   * 202.3e), set each time it leaves the stack. Read only through a target
   * that was a spell — see `targetZones` — so it needn't be cleared when the
   * card moves on (a countered spell exiled from the graveyard was still
   * that spell). */
  lastStackManaValue?: number;
  /** The mana spent to cast it as it last left the stack (`manaSpent`) — the
   * `{ manaSpentOf: "trigger-object" }` of a cast trigger whose spell was
   * countered in response (Aetherflux Conduit; Magmablood Archaic's ruling).
   * Kept like `lastStackManaValue`. */
  lastStackManaSpent?: readonly SpentMana[];
  /** Who controlled it as it last left the stack — "**its controller's**"
   * graveyard, hand and library of a spell just countered (Counterbore's
   * ruling: a spell cast by someone else's effect is countered into its
   * owner's graveyard, and its controller's zones are searched). Kept like
   * `lastStackManaValue`. */
  lastStackController?: PlayerId;
  /** This spell as it last existed on the stack, set each time it leaves:
   * what a copy of it copies once it has gone (rule 707.10 — Shiko and
   * Narset, Unified copies "that spell" even after it was countered in
   * response). Kept through later moves like `lastStackManaValue`; its
   * `zoneChangeCount` says which stint on the stack it describes. */
  lastOnStack?: SpellSnapshot;
  /** The mana spent to cast this spell, one entry per unit paid, read through
   * `spentManaCount` — the `{ manaSpentOf }` amount and the `manaSpent` filter
   * clause. Set as it's cast (empty for a free cast), kept by the permanent it
   * resolves into, and cleared by any other zone change. An activated
   * ability's is on `lastKnownRefs.manaSpent`, for "this ability". */
  manaSpent?: readonly SpentMana[];
  /** The player who helped pay for this spell through assist (rule
   * 702.132a), when they paid any of it — "if another player spent mana to
   * cast it" (Yume, Chronicler of Valor). Set, or cleared, each time it's
   * cast, so a trigger reads it after the spell has left the stack. */
  assistedBy?: PlayerId;
  /** For a triggered ability object: the target slots its triggering event
   * filled rather than its controller choosing — a saboteur's "that player"
   * (Hypnotic Specter's discard). Those aren't targets (rule 115.1), so
   * hexproof and protection don't stop them; resolution still checks that
   * the slot can hold what's in it. */
  autoTargetSlots?: number[];
  /** For an ability object: its source's `timestamp` when the ability was put
   * on the stack. A permanent that leaves and returns gets a new timestamp,
   * which is how "the Nth time this ability has resolved this turn" tells the
   * two objects apart (see `GameState.abilityResolutionsThisTurn`). */
  sourceTimestamp?: number;
  /** For an ability object: its source's `zoneChangeCount` as it went on
   * the stack (for a delayed trigger, as it was created). If the source has
   * moved since, it is a new object (rule 400.7), and the ability's
   * `"source"` names nothing to act on — "put a +1/+1 counter on ~" on a
   * creature flickered in response puts none — while a read of it ("its
   * power") uses last-known information. */
  sourceZoneChangeCount?: number;
  /** A crew ability on the stack (rule 702.122): the creatures tapped to pay
   * its cost, as they were tapped — "whenever this Vehicle becomes crewed"
   * (702.122e) is announced with them as it resolves. */
  crewedWith?: readonly ObjectId[];
  /** How many times this object has changed zones — bumped by every
   * `moveObject`. Object ids survive zone changes in this engine (a commander
   * keeps its id), so this is what tells the card an ability was activated
   * from apart from the same card after a round trip. Absent means 0. */
  zoneChangeCount?: number;
  /** For an ability object whose ability was *granted* rather than printed:
   * where it came from, so it still resolves once the grant is gone (see
   * {@link GrantedAbilityRef}). Absent for a printed ability. */
  grantedAbility?: GrantedAbilityRef;
  /** Counters on this object, e.g. `{ "+1/+1": 2 }`. Cleared on any zone change. */
  counters: Record<string, number>;
  /** When each kind of keyword counter was last put on it (rule 613.7c — every
   * counter of a kind takes the newest one's timestamp), for ordering the
   * keyword it gives against a loss of all abilities in layer 6. A kind
   * missing here was on it as it entered, and has its timestamp. Cleared with
   * the counters. */
  counterTimestamps?: Record<string, number>;
  /** Temporary modifiers (P/T and/or granted keywords). `untilEndOfTurn` ones expire in cleanup. */
  modifiers: PtModifier[];
  /** Order this object entered the battlefield (rule 613.7 timestamp); 0 if never. */
  timestamp: number;
  /**
   * What this permanent has done since it entered the battlefield: life its
   * controller's opponents lost to it (`lifeTaken`: damage it dealt them, in
   * combat or by an ability of its own, and life one of its abilities made
   * them lose -- Ob Nixilis, the Fallen's drain counts as much as a hit),
   * and cards its controller drew while one of its
   * abilities resolved. Public — every part of it is in the event log — and
   * read only by the bots (`bot/features.ts`'s `trackRecordOf`), to spot a
   * proven engine the printed stats undersell. Cleared when it leaves the
   * battlefield: back, it's a new object (rule 400.7). Absent until it has
   * done either.
   *
   * `thisTurn` is the current turn's share of the totals (stale once its
   * `turn` has passed — see {@link settledTally}): a bot reads only what was
   * done in earlier turns, so nothing its own search simulates this turn can
   * add to the record it is judging by.
   */
  tally?: {
    lifeTaken: number;
    cardsDrawn: number;
    thisTurn: { turn: number; lifeTaken: number; cardsDrawn: number };
  };
  /** True for a token (rule 111): ceases to exist as an SBA once it leaves the battlefield. */
  isToken: boolean;
  /**
   * A pure engine resource-safety optimization, **not derived from any
   * rule**: when set (> 1), this one `GameObject` stands in for `stackCount`
   * fully interchangeable, still-pristine token copies — e.g. a self-copying
   * token generator (Scute Swarm) that would otherwise mint one real object
   * per copy and blow up exponentially over a long game. Only ever set on a
   * freshly-minted, untouched token batch with no activated ability (see
   * `Game.isStackableTokenName`); the moment anything singles one out
   * (targeted, attacked/blocked, damaged, given a counter, attached to,
   * sacrificed, destroyed, tapped alone, copied) that one is split off into
   * its own ordinary object first (`Game.splitOneFromStack`) — a stacked
   * object's fields besides this one and `id`/`timestamp` are always exactly
   * the shared "just entered" state every member has. A *uniform* action
   * (destroy-all, damage-all, untap-all, or the stack lapsing as a whole —
   * rule 707/111 apply the same to every member) mutates or removes the
   * whole object directly, no split needed. Absent/`1` = an ordinary single
   * permanent — the overwhelmingly common case, entirely unaffected. A token
   * split off goes back into a stack once nothing tells it apart any more
   * (`Game.refoldSplitTokens`, `Game.recompactTokens`).
   *
   * On an ability on the stack it means the same thing: `stackCount`
   * identical copies of a triggered ability that chooses no targets, put on
   * the stack together (`PendingTrigger.copies`). Each resolves on its own,
   * one at a time with priority between, taking one off the count; a spell
   * or ability that targets one of them (Stifle) splits it off first.
   */
  stackCount?: number;
  /**
   * This single token was part of a token stack and was split off it
   * (`Game.splitOneFromStack`) — or was the last of one, the rest split off.
   * Bookkeeping, not a characteristic: it marks the tokens worth folding back
   * together once they're identical again, during the turn as soon as nothing
   * is waiting (`Game.refoldSplitTokens`), and at cleanup even when fewer than
   * a fresh batch's stacking threshold (`Game.recompactTokens`). Cleared as
   * the token absorbs others into a stack; left out of every comparison
   * (`tokenFoldKey`, `exactTokenShape`).
   */
  splitFromStack?: true;
  /** The stack a token was split off (`splitFromStack`'s own, not the
   * drained stack's). Bookkeeping for the client only: a leave names it
   * (`permanent-left-battlefield`'s `stack`), so the stack's tile is drawn
   * going down rather than the token leaving from nowhere. Left out of every
   * comparison and of what names an object (`referencedObjectIds`). */
  splitFrom?: ObjectId;
  /** True for a copy of a spell on the stack (rule 707.10 — storm, Twincast).
   * `cardName` is the copied spell's name; the copy ceases to exist instead of
   * moving to any zone other than the stack. ROADMAP Phase 8. Also a copy of
   * a *card* made to be cast (rule 707.12 — Isochron Scepter, a `cast-now`'s
   * `copies`), which ceases to exist if it's still outside the stack and
   * the battlefield at the next state-based check (704.5e). */
  isCopy?: boolean;
  /** A copy made by epic, "except for its epic ability" (rule 702.50a): its
   * `epic` effect does nothing, and so does a copy of it. */
  withoutEpic?: true;
  /** Spells (by any player) cast this turn *before* this spell — captured when
   * it's cast, read by a `storm` effect on it (rule 702.40a). ROADMAP Phase 8. */
  stormCount?: number;
  /** The permanent this Aura/Equipment is attached to, or `null`. */
  attachedTo: ObjectId | null;
  /** An Equipment with reconfigure attached to this creature at this
   * timestamp (rule 702.151b): it isn't a creature until it becomes
   * unattached from that creature — for as long as `attachedTo` is still
   * `reconfiguredOnto`, whatever happens to its abilities meanwhile. */
  reconfiguredOnto?: ObjectId;
  reconfiguredAt?: number;
  /** A Licid that became an Aura (its `licid: true` ability):
   * from `at` it is an Aura enchantment with enchant creature, not a
   * creature, and has lost that ability, until `controller` pays `endCost`
   * to end the effect (a special action, rule 116.2c — `end-licid-effect`)
   * or it leaves the battlefield. */
  licid?: { readonly controller: PlayerId; readonly endCost: string; readonly at: number };
  /** An enchant ability an effect gave it (the `swap-enchant` effect): from
   * `at`, what this permanent may enchant is `put` — "enchant creature put
   * onto the battlefield with this Aura" (Animate Dead's swap, Necromancy):
   * that one object, in its battlefield stint `stint` (rule 400.7), while
   * it's a creature, nothing at all when `object` is null — or else `spec`,
   * read as an Aura's target slot is but without targeting ("it becomes an
   * Aura with enchant creature" — Cloudform). `becameAura`: from `at` it's
   * an Aura too (layer 4 at that timestamp, rule 613.7). Ends when it leaves. */
  enchantSwap?: {
    readonly at: number;
    readonly becameAura?: true;
    readonly put?: { readonly object: ObjectId | null; readonly stint: number };
    readonly spec?: TargetSpec;
  };
  /** The player this Aura is attached to — a Curse's "Enchant player" (rule
   * 303.4: an Aura can be attached to a player). Set instead of
   * `attachedTo`, never with it; cleared on any zone change. */
  attachedToPlayer?: PlayerId;
  /**
   * The creature this one is paired with by soulbond (rule 702.95b), set on
   * both, each naming the other. Cleared on any zone change; the state-based
   * check (`unpairBrokenPairs`) clears both halves once 702.95e ends the
   * pairing. Ask `pairedPartner` (`characteristics.ts`), never this field.
   */
  pairedWith?: ObjectId;
  /**
   * True for a player's designated commander (intrinsic, like `isToken` —
   * never reset by `moveObject`). Lets it be cast from the command zone
   * (rule 903.4, with tax) and redirects it back to the command zone
   * instead of hand/library/graveyard/exile (rule 903.9a, "commander
   * replacement" — applied automatically here, with no opt-out).
   */
  isCommander: boolean;
}

/**
 * A spell's copiable state on the stack (rule 707.10): its characteristics
 * and every choice made as it was cast — modes, targets, {X}, the additional
 * and alternative costs paid. What a copy of it starts from, read off the
 * live spell or, once it has left the stack, off `GameObject.lastOnStack`.
 */
export interface SpellSnapshot {
  /** The spell's `zoneChangeCount` on the stack, matched against
   * `LastKnownRefs.triggerSpell`. */
  readonly zoneChangeCount: number;
  /** `printedCardName` — the face or half that was cast. */
  readonly cardName: string;
  /** Who controlled it: whose seats its `{ seat }` slots count from. */
  readonly controller: PlayerId;
  readonly seatTargetWaiting?: GameObject["seatTargetWaiting"];
  readonly targets: readonly (TargetRef | undefined)[] | null;
  readonly targetZones?: readonly (ZoneType | null)[];
  readonly targetStints?: readonly (number | null)[];
  readonly autoTargetSlots?: readonly number[];
  readonly xValue: number | null;
  readonly chosenModes?: readonly number[];
  /** See `GameObject.otherChooser` — a copy's targets were chosen by them too. */
  readonly otherChooser?: PlayerId;
  readonly division?: readonly number[];
  readonly kicked?: boolean;
  readonly kickedByControl?: true;
  readonly timesKicked?: number;
  readonly kickedWith?: number;
  readonly spliced?: readonly string[];
  readonly overloaded?: boolean;
  readonly bestowed?: boolean;
  readonly evokePaid?: boolean;
  readonly spectaclePaid?: boolean;
  readonly surgePaid?: boolean;
  readonly prowlPaid?: boolean;
  readonly alternativeCostPaid?: "printed" | "madness";
  readonly offspringGrantPaid?: boolean;
  /** Who its gift was promised to — a copy's is promised to them too. */
  readonly giftTo?: PlayerId;
  /** The creatures that convoked it (`GameObject.convokedBy`): a copy's
   * "each creature that convoked this spell" means the original's — an
   * effect of a copy that refers to objects used to pay its costs uses
   * those that paid the original's (rule 707.10). */
  readonly convokedBy?: readonly { readonly object: ObjectId; readonly stint: number }[];
  /** The objects its cost took (`LastKnownRefs.sets.paid`): a copy's "the
   * exiled card" or "the creature tapped to pay this spell's additional
   * cost" is the original's, as `convokedBy` is (rule 707.10, Swallow
   * Whole's ruling). */
  readonly paidCost?: ObjectSets["paid"];
  /** Its copiable modifiers (a prototyped spell's — rule 718.3c). */
  readonly modifiers: readonly PtModifier[];
  /** A copy without its epic ability (`GameObject.withoutEpic`). */
  readonly withoutEpic?: true;
}

/** A permanent's copiable values as a copy effect sets them (rule 707.2):
 * what it's a copy of (`null` for itself), its copiable modifiers (the copy
 * exceptions, rule 707.9b) and a token copy's "isn't legendary"
 * (`GameObject.notLegendary`). */
export interface CopyValues {
  readonly copyOf: string | null;
  readonly modifiers: readonly PtModifier[];
}

/** When a copy effect with a duration ends: in the cleanup step ("until end
 * of turn", rule 514.2), as the next end step begins ("until the next end
 * step"), or as `turnOf`'s next turn begins ("until your next turn" — or as
 * it would have, once they've left the game, rule 800.4m); or, with
 * `whileSource`, as a "for as long as" stops being true (rule 611.2b): a
 * permanent leaving (Secret Invasion), untapping (Zygon Infiltrator), or
 * coming off what it was attached to (Blade of Shared Souls). */
export type CopyEnds =
  | "end-of-turn"
  | "next-end-step"
  /** "Until this creature is turned face down" (Vesuvan Shapeshifter): as
   * it's turned face down, however (`Game.turnFaceDown`). */
  | "turned-face-down"
  | { readonly turnOf: PlayerId }
  | { readonly whileSource: WhileSource };

/** One of `GameObject.temporaryCopies`: the values that copy effect gives it,
 * and when it ends. */
export interface TemporaryCopy extends CopyValues {
  readonly copyOf: string;
  readonly ends: CopyEnds;
}

export interface PtModifier {
  power: number;
  toughness: number;
  keywords: Keyword[];
  /** Keywords it takes away, in layer 6 at its timestamp — "target creature
   * loses flying until end of turn" (rule 613.7): from what had them before,
   * printed or granted earlier; a later grant gives one back. `"protection"`
   * and `"ward"` take every instance of those (`LosableKeyword`). */
  loseKeywords?: LosableKeyword[];
  /** Keywords it can't have while this lasts — Arcane Lighthouse's "lose
   * hexproof and shroud and can't have hexproof or shroud" — whatever would
   * give them and whatever the timestamps (`StaticAbility.cantHaveKeywords`). */
  cantHaveKeywords?: Keyword[];
  /** Toxic N it grants (rule 702.164b — the `grant-toxic` effect): one
   * more instance, added to the total, gone with a later loss of all
   * abilities like a granted keyword. */
  toxic?: number;
  /** Layer 6 — protection it grants (rule 702.16 — the `grant-protection`
   * effect): the same three clauses as `StaticAbility.protection`, gone with
   * a later loss of all abilities like a granted keyword (613.7). */
  protection?: {
    readonly colors?: readonly Color[];
    readonly types?: readonly CardType[];
    readonly filter?: CardFilter;
    /** Protection from these players (rule 702.16k), fixed as it resolved
     * (`ProtectionQualities.fromPlayers`). */
    readonly fromPlayers?: "opponents" | readonly PlayerId[];
  };
  /** Layer 6 — hexproof from a quality it grants (rule 702.11d — a
   * `grant-protection` with `asHexproof`), gone with a later loss of all
   * abilities or of hexproof (702.11e). */
  hexproofFrom?: {
    readonly colors?: readonly Color[];
    readonly types?: readonly CardType[];
    readonly filter?: CardFilter;
  };
  /** Combat restrictions this modifier imposes, with it — "target creature
   * can't block this turn", "~ must be blocked each combat this turn if
   * able" (the `restrict` effect). */
  restrictions?: CombatRule[];
  /** Restrictions that only start later: during `player`'s next turn (`at:
   * "turn"`, Wall of Dust's "can't attack during its controller's next turn"),
   * or their next combat phase (`"combat"`, Trench Behemoth's "attacks during
   * its controller's next combat phase if able"), not one under way as it was
   * made. Nothing until then; a modifier for that turn or combat once it comes,
   * under whoever `player` is as the effect resolved. */
  restrictionsLater?: { readonly player: PlayerId; readonly at: "turn" | "combat"; readonly restrictions: readonly CombatRule[] };
  /** Layer 6 — static abilities this modifier grants: "it gains 'This
   * creature can't be blocked by more than one creature' until end of turn"
   * (Full Steam Ahead), Earthbind's "this Aura gains 'Enchanted creature
   * loses flying'" (the `grant-static` effect). Each works from this
   * permanent as its own static would — its `affects` read from here — and,
   * like any granted ability, a later loss of all abilities takes it away
   * (rule 613.7). Read through `grantedStatics`. A layer-4 part isn't
   * applied (no card grants one). */
  grantsStatic?: StaticAbility[];
  /** Layer 4 — card types this modifier adds (a man-land's "becomes a …
   * creature. It's still a land." keeps the printed types and adds these). */
  addTypes?: CardType[];
  /** Layer 4 — it loses all its creature types and keeps its other subtypes
   * (Nameless Inversion). */
  loseCreatureTypes?: true;
  /** Layer 4 — it loses all its land types (Ultima, Origin of Oblivion's
   * blight); its other subtypes, card types and supertypes stay. */
  loseLandTypes?: true;
  /** Layer 4 — card types this modifier *replaces* them with (Myrkul, Lord
   * of Bones's copy: "it's an enchantment and loses all other card types").
   * A subtype tied to a card type it no longer has goes too (rule 205.1a).
   * Applied before `addTypes`. */
  setTypes?: CardType[];
  /** Layer 4 — card types taken away, with every subtype that went only with
   * them (rule 205.1a): `become`' `removeTypes`, and reconfigure's "while
   * attached, this isn't a creature", folded in as one at its attachment's
   * timestamp (`reconfiguredModifier`). */
  removeTypes?: CardType[];
  /** Layer 4 — subtypes taken away, its types left: `become`'
   * `removeSubtypes` ("it isn't an Equipment" — Dancing Sword). */
  removeSubtypes?: string[];
  /** Layer 4 — subtypes this modifier adds (e.g. `["Blinkmoth"]`). */
  addSubtypes?: string[];
  /** Layer 4 — subtypes this modifier *replaces* them with (Turn to Frog:
   * "becomes a … Frog"): each replaces the existing subtypes of its own kind
   * (rule 205.1a — a Frog loses its creature types, not an Equipment's
   * artifact type). Applied before `addSubtypes`. */
  setSubtypes?: string[];
  /** Layer 5 — colours this modifier adds ("becomes red in addition to its
   * other colours"). */
  addColors?: Color[];
  /** Layer 5 — colours this modifier *sets* (Turn to Frog: "becomes … blue").
   * Applied before `addColors`; the latest such modifier wins. */
  setColors?: Color[];
  /** Layer 6 — this permanent loses all of its abilities (Turn to Frog): its
   * own keywords and activated, triggered and static abilities, and what
   * was granted it before this modifier's `timestamp` — by an anthem, an
   * Aura or Equipment, a keyword counter or a one-shot grant. What's granted
   * after (including by this same modifier's `keywords`) it has (rule
   * 613.7). */
  loseAbilities?: boolean;
  /** Layer 7b — a "becomes a N/N" that *sets* base P/T rather than adding to
   * it. Applied after a CDA, before counters (7c) and +N/+N bonuses (7d);
   * the latest such modifier wins. */
  setPt?: [number, number];
  /** Layer 7b — sets base toughness alone, ordered with `setPt` by
   * timestamp: an exchange of a life total with a toughness (rule 701.12g —
   * Tree of Redemption's "exchange your life total with this creature's
   * toughness"), which leaves its power as it was, or an `become` with only
   * a `toughness` (Chariot of the Sun's "has base toughness 1"). */
  setToughness?: number;
  /** Layer 7b — sets base power alone, ordered with `setPt` by timestamp:
   * an `become` with only a `power` ("target creature with flying has base
   * power 0 until end of turn" — Island of Wak-Wak; Riptide Mangler's "base
   * power becomes equal to target creature's power"). Its toughness stays as
   * it was. An `become` with only a `toughness` sets `setToughness`. */
  setPower?: number;
  /** Layer 7d — "switch its power and toughness" (rule 613.4d, the
   * `switch-pt` effect): applied after every other P/T effect and counter,
   * its power becomes its toughness and its toughness its power. Two
   * switches undo each other. Not an ability, so a loss of abilities leaves
   * it. */
  switchPt?: true;
  /** Layer 6 — triggered abilities this modifier grants, for a one-shot
   * "gains '[trigger]' until end of turn" (Hunter's Prowess, Hunter's
   * Insight). The ongoing, static equivalent is
   * `StaticAbility.grantsTriggered`. */
  grantsTriggered?: TriggeredAbility[];
  /** Keywords printed as abilities that it loses (`CharacteristicsPatch.loseKeywordAbilities`). */
  loseKeywordAbilities?: readonly KeywordAbilityName[];
  /** Layer 6 — the ability "If this creature would leave the battlefield,
   * exile it instead of putting it anywhere else", granted by an effect that
   * says it **gains** it (Geth, Thane of Contracts — `put-onto-battlefield
   * { exileIfItWouldLeave: "ability" }`). Unlike the replacement effect
   * `GameObject.exileIfItWouldLeave`, losing all abilities later in
   * timestamp order removes it (rule 613.1f) — `hasExileIfLeavesAbility`. */
  grantsExileIfLeaves?: true;
  /** Layer 6 — activated abilities this modifier grants: a copy exception's
   * "and it has '{2}, {T}, Sacrifice this token: You gain 3 life.'"
   * (Brenard, Ginger Sculptor). Seen by `legalActions`, activation and the
   * mana payer like any granted activated ability. */
  grantsActivated?: ActivatedAbility[];
  /** "Until your next turn": it ends as this player's next turn begins, or
   * as it would have begun once they've left the game (rule 800.4m). */
  untilTurnOf?: PlayerId;
  /** "Until your next upkeep" and the like: see `UntilPoint`. */
  untilPoint?: UntilPoint;
  /** Goaded by this player for as long as this modifier lasts (rule 701.15):
   * "for as long as this Saga remains on the battlefield" (The War Games),
   * "for as long as they control it" (Vislor Turlough), "for as long as it has
   * a duty counter" (Immortal Obligation) — a goad whose end is one of the
   * durations a modifier already has. Not an ability, so a loss of abilities
   * leaves it; `goadersOf` reads it. */
  goadedBy?: PlayerId;
  /** "Until end of combat" / "this combat" (rules 500.5a, 511.2): it ends as
   * the combat phase does — Legion Warboss's token "attacks this combat if
   * able", which a later combat that turn doesn't bind. Set with
   * `untilEndOfTurn` too, so a turn with no combat after it still ends it. */
  untilEndOfCombat?: true;
  /** "For as long as it has a [kind] counter on it" (rule 611.2b): it ends
   * as the last one is removed, and a new one doesn't bring it back. */
  whileCounter?: string;
  /** "For as long as [that permanent] remains on the battlefield"
   * (Opportunistic Dragon): it ends as that permanent, in that stint,
   * leaves — once everything leaving with it has left, so what it took away
   * stays away for that event's look back (rule 603.10a). */
  whileSource?: WhileSource;
  /** "Until this card is cast from exile" (Glamorous Outlaw): ends when that
   * card, in that stint, has been cast. */
  untilCast?: UntilCast;
  /** It can attack as though it didn't have defender (the
   * `attack-despite-defender` effect). A rule about it, not an ability it
   * has, so a loss of abilities doesn't end it. */
  canAttackAsThoughNoDefender?: true;
  /** Its activated abilities — mana abilities included — can't be activated
   * (detain, rule 701.35a — the `detain` effect). A rule about it, not an
   * ability, so a loss of abilities doesn't end it. */
  abilitiesCantBeActivated?: true;
  /** It assigns combat damage equal to its toughness rather than its power
   * (the `damage-by-toughness` effect, rule 510.1a). Like the above, not an
   * ability. */
  combatDamageByToughness?: true;
  /** It assigns no combat damage (the `assigns-no-combat-damage` effect —
   * Farrel's Zealot's "this creature assigns no combat damage this turn",
   * rule 510.1a). Like the above, a rule about it, not an ability. */
  assignsNoCombatDamage?: true;
  /** It assigns its combat damage this turn as though it weren't blocked
   * (the `assign-as-though-unblocked` effect): `"may"`, its controller's
   * choice as damage is assigned (Gurzigost), or `"must"` (Outmaneuver).
   * Like the above, a rule about it, not an ability. */
  assignAsThoughUnblocked?: "may" | "must";
  /** Layer 6 — it gains "This creature can't be sacrificed" (the
   * `"cant-be-sacrificed"` effect). The static equivalent is
   * `StaticAbility.cantBeSacrificed`. */
  cantBeSacrificed?: boolean;
  /** This player can't sacrifice it (the `"cant-be-sacrificed"` effect's
   * `by` — Call for Aid's "you can't sacrifice those creatures this turn").
   * A rule about it and that player, not an ability: it holds through a loss
   * of abilities, and nobody else is bound. See `Game.canBeSacrificed`. */
  cantBeSacrificedBy?: PlayerId;
  /** A mark, not an effect, and not copiable: this token was created by an
   * embalm ability (rule 702.128a — `create-token-copy`'s `embalmed`). What
   * "if this creature was embalmed" asks as it enters (Vizier of Many Faces'
   * `CopyOnEnter.exceptIfEmbalmed`); a later copy of the token wasn't. */
  embalmed?: true;
  /** Its loyalty abilities may be activated this many times a turn while this
   * lasts (the `loyalty-activations` effect — Kaito, Dancing Shadow's "twice
   * this turn rather than only once", rule 606.3). A rule about it, not an
   * ability. See `Game.loyaltyActivationsAllowed`. */
  loyaltyActivations?: 2;
  /** Its printed loyalty abilities may be activated this many **more**
   * times this turn, on top of whatever else allows (the `loyalty-activations`
   * effect's `{ more }` — Comet, Stellar Pup's "two more times", rule 606.3).
   * Each such modifier adds its own. */
  loyaltyActivationsMore?: number;
  /** Layer 6 — it "can block an additional creature" (or `"any"` number of
   * creatures) for the duration (the `block-additional` effect —
   * `StaticAbility.blockAdditional` is the static form). */
  blockAdditional?: number | "any";
  /** Part of the object's **copiable values** (rule 707.9b): an exception a
   * copy effect made ("except it's a 3/3 black Zombie creature in addition
   * to its other types"). Anything that copies this object copies these
   * too — a token copy, a Clone. Timestamped under every other effect. */
  copiable?: true;
  /** Its name — a copy exception's "except its name is Mishra's Warform", or,
   * not `copiable`, an effect's "it becomes … named Vitu-Ghazi" (Awakening of
   * Vitu-Ghazi: a copy of it doesn't have that name). Read through
   * {@link nameOf}. */
  setName?: string;
  /** Supertypes it no longer has: a copy exception's "and it isn't
   * legendary" (Spark Double, read through `supertypesOf` and copied onward),
   * an effect's "is no longer snow" (Thermal Flux, layer 4 in timestamp order). */
  removeSupertypes?: Supertype[];
  /** Supertypes it has in addition — a copy exception's "it's legendary in
   * addition to its other types" (Sakashima the Impostor). Read through
   * `supertypesOf`. */
  addSupertypes?: Supertype[];
  /** Layer 6 — it has "the 'legend rule' doesn't apply to [these
   * permanents]", scoped from its own side: a copy exception's "it has
   * Sakashima's other abilities" (Sakashima of a Thousand Faces). The static
   * form is `StaticAbility.legendRuleOff`; both are read by
   * `exemptFromLegendRule`. */
  legendRuleOff?: AffectSpec;
  /** It has no mana cost — eternalize's and embalm's "a copy of it, except
   * … with no mana cost" (rules 702.128a, 702.129a): mana value 0. Read
   * through {@link manaCostOverride}. */
  noManaCost?: true;
  /** Its starting loyalty is this — a copy exception's "except its starting
   * loyalty is 1" (Jace, Mirror Mage): a copiable value (rule 707.9b), so a
   * copy of the copy has it too. Read through
   * {@link startingLoyaltyOverride} as it enters (306.5b). */
  startingLoyalty?: number;
  /** Its mana cost is this instead — a prototyped spell's or permanent's
   * (rule 718.3b). Read through {@link manaCostOverride}. */
  setManaCost?: string;
  /** The prototype characteristics of a spell cast prototyped (rule 718):
   * kept from the stack onto the battlefield, gone on any other move. */
  prototype?: true;
  /** An effect the spell got for how it was cast, which goes on applying to
   * the permanent it becomes (rules 400.7b, 400.7h, 611.3d) — Thundermane Dragon's
   * "if you cast a creature spell this way, it gains haste until end of
   * turn" — or that a spell or ability gave it on the stack (400.7a — a
   * spell copy's "the copy gains haste", `copy-spell`'s `gains`). Kept from
   * the stack onto the battlefield like `prototype`. */
  castRider?: true;
  /** "Perpetually" — MTG Arena's, which the Comprehensive Rules don't have
   * (the user's call, 2026-11-12, for Pearl Collector): the change stays with
   * the card through every zone change for the rest of the game, kept by
   * `moveObject` where every other modifier ends. Not a copiable value. */
  perpetual?: true;
  /** Layer 3 — a text-changing effect (rule 612.1): every instance of one
   * colour word or basic land type in its text becomes another (the
   * `change-text` effect — Sleight of Mind, Magical Hack). Read through
   * `rulesTextName`, which names its changed definition, and
   * `characteristics.ts`'s `printedSubtypes` for its type line. */
  textChange?: TextChange;
  untilEndOfTurn: boolean;
  /**
   * `GameState.timestampSeq` when the modifier was applied, for ordering its
   * layer-4 and layer-7b parts against static abilities' (rule 613.7): it
   * sorts after a static whose source has this timestamp or an earlier one.
   * Absent (the modifiers that change no types and set no P/T) sorts after
   * every static. A copy exception's base P/T (Saw in Half) is `-1`: it's a
   * copiable value, under every other effect. In layer 6 it orders what the
   * modifier grants against a loss of all abilities, where absent counts as
   * the earliest — so every modifier that grants something carries one.
   */
  timestamp?: number;
}

/**
 * Where a granted ability came from — a `grantsActivated` / `grantsTriggered`
 * static (Presence of Gond, Staggering Insight), or a one-shot modifier's
 * `grantsTriggered` (Hunter's Prowess).
 *
 * An ability on the stack exists independently of its source (rule 113.7a),
 * but a granted one can't be found again by index once the grant ends: the
 * Aura that granted it goes to the graveyard alongside the creature it was on,
 * and the index now points past the end of the creature's printed abilities.
 * Recorded when the ability is activated or triggers, and read back instead of
 * re-deriving it.
 */
export type GrantedAbilityRef =
  | {
      readonly kind: "static";
      /** The granting card's printed name, and where in its definition. */
      readonly cardName: string;
      readonly staticIndex: number;
      /** `"spell-triggered"`: a `grantsToSpells` static's `triggered`. */
      readonly list: "activated" | "triggered" | "spell-triggered";
      readonly index: number;
      /** The permanent whose static granted it, and its battlefield stint,
       * as the ability was activated or triggered — what the granted text's
       * "Ninja's Kunai" names (rule 201.5a), the `"granter"` reference.
       * Absent on a ref read only to find the ability's definition. */
      readonly granter?: ObjectId;
      readonly granterStint?: number;
    }
  | { readonly kind: "modifier"; readonly ability: TriggeredAbility }
  /** An activated ability a modifier grants (`PtModifier.grantsActivated`). */
  | { readonly kind: "modifier-activated"; readonly ability: ActivatedAbility }
  /** A land's intrinsic mana ability from a basic land type it wasn't
   * printed with (rule 305.6 — `intrinsicManaColors`). */
  | { readonly kind: "intrinsic"; readonly color: Color }
  /** A card's cycling ability (rule 702.29a: "[Cost], Discard this card:
   * Draw a card", or landcycling's search), on the stack once it's been
   * cycled — `cyclingAbility` of the card named. */
  | { readonly kind: "cycling"; readonly cardName: string }
  /** Another card's own printed activated ability, at `index` — granted by
   * a `grantsActivatedOf` static (Steward of the Harvest gives a creature an
   * exiled land card's abilities). `from`: under an `onceEach` grant, the card
   * it was read from, whose ability it is for that limit (Mairsil). */
  | { readonly kind: "card-activated"; readonly cardName: string; readonly index: number; readonly from?: ObjectId }
  /** Another card's own printed triggered ability, at `index`: a permanent
   * whose text box came from that card (`GameObject.textFrom`, rule 612.5),
   * so the trigger resolves as that text however its source changes. */
  | { readonly kind: "card-triggered"; readonly cardName: string; readonly index: number };

/** A permanent attached to another, in the stint (`zoneChangeCount`) it was
 * attached in (rule 400.7) — `LastKnownInfo.attachments`. */
export interface AttachmentRecord {
  readonly object: ObjectId;
  readonly stint: number;
}

/**
 * A permanent as it last existed on the battlefield (rules 603.10a, 608.2h):
 * its *computed* characteristics — layers, counters, anthems and copy effects
 * folded in — and the per-permanent state a leaves-the-battlefield trigger or
 * a resolving ability may ask about once it has gone.
 *
 * Plain data, taken by `moveObject` as the permanent leaves (`GameObject
 * .lastKnown`). The permanents of one simultaneous event (a wrath, a sweep of
 * state-based actions) are all snapshotted before the first of them moves, so
 * a creature and the lord it dies beside each keep the other's bonus. A token
 * that ceases to exist keeps its snapshot in `GameState.ceasedTokens` for the
 * rest of the turn.
 */
export interface LastKnownInfo {
  /** Read in a zone other than the battlefield: a card, so rule 208.3's "a
   * noncreature permanent has no power or toughness" doesn't touch it (a
   * Vehicle card's power in a graveyard). */
  readonly offBattlefield?: true;
  /** How many times it had mutated (`GameObject.merged.timesMutated`). */
  readonly timesMutated?: number;
  /** A token's `GameObject.linkedExile`: what its leaves-the-battlefield
   * ability still means once it has ceased to exist. */
  readonly linkedExile?: GameObject["linkedExile"];
  /** The permanent's `zoneChangeCount` while it was on the battlefield — which
   * of its stints there this describes. A reference to the permanent names
   * the stint it means the same way (see {@link LastKnownRefs}), so a card
   * that has since come back and left again isn't read through the wrong
   * snapshot. */
  readonly zoneChangeCount: number;
  /** Its Class level (`GameObject.classLevel`), if it had one. */
  readonly classLevel?: number;
  /** The name its characteristics came from (`printedCardName`): the card it
   * was a copy of, or the face that was up. Its abilities are read off this,
   * unless `textName` says otherwise. */
  readonly name: string;
  /** The card whose rules text it had (`GameObject.textFrom`, rule 612.5),
   * when an exchange of text boxes gave it another's: its abilities are read
   * off this. Absent when they're `name`'s. */
  readonly textName?: string;
  readonly owner: PlayerId;
  readonly controller: PlayerId;
  readonly power: number;
  readonly toughness: number;
  /** Its base power and toughness (`Characteristics.basePower`). */
  readonly basePower: number;
  readonly baseToughness: number;
  readonly types: readonly CardType[];
  /** Computed subtypes — a changeling's with its every-creature-type marker
   * (`subtypes.ts`), so ask through `hasSubtype`. */
  readonly subtypes: readonly string[];
  readonly supertypes: readonly Supertype[];
  readonly colors: readonly Color[];
  readonly keywords: readonly Keyword[];
  /** Whether it had a mana ability (`characteristics.ts`'s `hasManaAbility`)
   * and any ability at all (`hasAnyAbility`), its granted ones included. */
  readonly hasManaAbility: boolean;
  readonly hasAbilities: boolean;
  readonly counters: Readonly<Record<string, number>>;
  /** Printed mana value of what it was (a copy effect's, a transformed card's
   * front face's); `{X}` is 0 off the stack (rule 202.3e). */
  readonly manaValue: number;
  /** Its mana cost (`printedManaCost`): what the chroma reads count the symbols
   * of, once it has gone. Absent or `null`, none. */
  readonly manaCost?: string | null;
  /** The mana spent to cast it, if it was cast (`GameObject.manaSpent`). */
  readonly manaSpent?: readonly SpentMana[];
  readonly isToken: boolean;
  readonly isCommander: boolean;
  readonly tapped: boolean;
  /** Its spell was cast kicked (or its offspring cost paid) — `enteredKicked`,
   * so "if it was kicked" still answers once it has left. */
  readonly enteredKicked?: boolean;
  /** Its spell was cast for its spectacle cost — `enteredSpectacle`. */
  readonly enteredSpectacle?: boolean;
  /** Its spell was cast for its surge cost — `enteredSurge`. */
  readonly enteredSurge?: boolean;
  /** Its spell was cast for its prowl cost — `enteredProwl`. */
  readonly enteredProwl?: boolean;
  /** Tribute wasn't paid as it entered — `tributeUnpaid`. */
  readonly tributeUnpaid?: true;
  /** How many times its spell's multikicker or squad cost was paid —
   * `enteredTimesKicked`, so squad's copies are still made once it has left
   * (rule 702.157a). */
  readonly enteredTimesKicked?: number;
  /** `GameObject.enteredDevoured`: "for each creature it devoured" read after
   * it has left. */
  readonly enteredDevoured?: readonly LastKnownInfo[];
  /** `enteredKickedWith`, so "if it was kicked with its [A] kicker" still
   * answers once it has left. */
  readonly enteredKickedWith?: number;
  /** Who its spell's gift was promised to — `enteredGiftTo` — so the gift
   * is still given once it has left. */
  readonly enteredGiftTo?: PlayerId;
  /** The turn it entered the battlefield on, and the turn it attacked on if
   * it did — for the `enteredThisTurn` / `attackedThisTurn` filter clauses. */
  readonly enteredOnTurn?: number;
  /** The turn it was last turned face up on — `turnedFaceUpThisTurn`. */
  readonly turnedFaceUpOnTurn?: number;
  /** It was monstrous (rule 701.37b) — the `monstrous` filter clause. */
  readonly monstrous?: true;
  /** It was harnessed (rule 701.64b) — the `harnessed` filter clause. */
  readonly harnessed?: true;
  /** It was renowned (rule 702.112b) — the `renowned` filter clause. */
  readonly renowned?: true;
  /** How it had entered — `GameObject.entry`. */
  readonly entry?: EntryRecord;
  readonly attackedOnTurn?: number;
  /** `GameObject.attackedPlayersThisTurn`, `.lastAttack` and `.attackedOnTurns`
   * as it left — the `attackedYouThisTurn`, `attackedThisCombat` and
   * `attackedDuringControllersLastTurn` clauses. */
  readonly attackedPlayers?: readonly PlayerId[];
  readonly lastAttack?: GameObject["lastAttack"];
  readonly attackedOnTurns?: readonly number[];
  /** The turn it attacked a battle on, if it did — `attackedBattleThisTurn`. */
  readonly attackedBattleOnTurn?: number;
  /** `GameObject.damageThisTurn` and `dealtDamageToCreatureOnTurn` as it
   * left: a creature that died of it was still dealt it this turn. */
  readonly damageThisTurn?: DamageHistory;
  readonly dealtDamageToCreatureOnTurn?: number;
  readonly dealtDamage?: DealtDamageRecord;
  readonly attacking: boolean;
  readonly blocking: boolean;
  /** The attackers it was blocking as it left (`blockedAttackersOf`), and
   * the creatures blocking it — so "target creature it's blocking" and
   * "creatures blocking it" still find them once it has gone (rules 608.2b,
   * 608.2h; `CardFilter.blockingRelation`). Absent for none. */
  readonly blockedAttackers?: readonly ObjectId[];
  readonly blockers?: readonly ObjectId[];
  readonly equipped: boolean;
  readonly enchanted: boolean;
  /** The permanents attached to it as it left, each in its stint then —
   * Zack Fair's "an Equipment that was attached to Zack Fair" (`CardFilter
   * .wasAttachedTo`). Absent for none. */
  readonly attachments?: readonly AttachmentRecord[];
  /** It was face down (rule 708) — a face-down spell as cast, or a face-down
   * permanent as it left: the `faceDown` filter's "a face-down creature
   * spell" (Kadena's first each turn). */
  readonly faceDown?: boolean;
  /** What it was attached to, if it was an Equipment or Aura on something —
   * so an "equipped creature dies" trigger still knows its host when both
   * left together. */
  readonly attachedTo?: ObjectId;
  /** Which battlefield stint of `attachedTo` it was on (its
   * `zoneChangeCount` then): a host that has left and come back since is a
   * new object (rule 400.7), so "enchanted creature" no longer finds it. */
  readonly attachedToStint?: number;
  /** The player it was attached to, if it was a Curse on one — so an
   * "enchanted player" trigger still knows them once it has left. */
  readonly attachedToPlayer?: PlayerId;
  /** Enchanted by an Aura its own controller controlled — rule 700.9's
   * "modified". */
  readonly enchantedByController: boolean;
  /** The controllers of the Auras on it, when there were any — the filter's
   * `enchantedBy`. */
  readonly enchantedBy?: readonly PlayerId[];
  /** Every player who had goaded it, whichever way (`goadersOf` — a one-shot
   * goad, one for the rest of the game, a static one), for the `goaded`
   * filter clause: "whenever a goaded attacking or blocking creature dies"
   * (Baeloth Barrityl, Entertainer). Absent when none had. */
  readonly goaders?: readonly PlayerId[];
  /** It was suspected (rule 701.60). */
  readonly suspected?: boolean;
  /** It was saddled (rule 702.171b) — Caustic Bronco's "if this creature
   * isn't saddled", read as it last existed once it has left (its ruling). */
  readonly saddled?: boolean;
  /** The combat it last enlisted a creature in (rule 702.154c —
   * `GameObject.enlistedIn`): Aradesh, the Founder's "if it enlisted a
   * creature this combat", asked again of an attacker that has left. */
  readonly enlistedIn?: CombatId;
  /** It had lost all its abilities (layer 6 — Turn to Frog), so none of its
   * own leaves-the-battlefield abilities trigger. */
  readonly lostAbilities: boolean;
  /** The name a copy exception gave it, where that isn't its card's
   * (`name`, which stays the registry key) — see {@link nameOf}. */
  readonly renamed?: string;
  /** Its copy exceptions (`copiable` modifiers) and whether one made it not
   * legendary: with `name` — the card it was a copy of, or the face that
   * was up — its last copiable values, which a copy of it made once it has
   * left copies (rule 608.2h — Ratadrabik of Urborg's "a copy of that
   * creature"). Absent when it had none. */
  readonly copiable?: readonly PtModifier[];
  /** The creature type chosen as it entered, if one was — what an ability
   * of it that resolves after it left reads for "of the chosen type" (rule
   * 608.2h: Herald's Horn's upkeep look). */
  readonly chosenCreatureType?: string;
  /** `GameObject.chosenOnEnter` as it left — which of a Siege's abilities it
   * had, for a leaves-the-battlefield trigger that looks back at it leaving
   * along with the creatures (rule 603.10a: Outpost Siege's "Dragons"). */
  readonly chosenOnEnter?: string;
  /** `GameObject.chosenNames` as it left — "the chosen name" for an ability
   * of it that resolves after it has gone (rule 608.2h). */
  readonly chosenNames?: readonly string[];
  /** `GameObject.chosenPlayer` as it left — "the chosen player" for an
   * ability of it that resolves after it has gone (rule 608.2h). */
  readonly chosenPlayer?: PlayerId;
  /** `GameObject.otherChosenPlayer` as it left (Sower of Discord's "the
   * other chosen player", resolving after it has died — its ruling). */
  readonly otherChosenPlayer?: PlayerId;
  /** `GameObject.chosenPermanent` as it left — "the chosen creature" for an
   * ability of it that resolves after it has gone (rule 608.2h: Tyrannical
   * Pitlord's leaves trigger, Dauntless Bodyguard sacrificed for its cost). */
  readonly chosenPermanent?: { readonly id: ObjectId; readonly stint: number };
  /** The triggered abilities it had been *granted* — by another permanent's
   * static or a one-shot modifier — in the order `effectiveTriggered` lists
   * them after its printed ones; with `lostAbilities`, only those granted
   * after the loss (rule 613.7). A granted dies trigger fires even when its
   * grantor is gone by the time the death is matched. Absent when none. */
  readonly grantedTriggers?: readonly GrantedAbilityRef[];
  /** The `doubleTriggers` statics it had been granted (The Masamune's
   * equipped creature's), read by a death at the same time looking back at
   * the doublers that left with it (Teysa Karlov's ruling, for a granted
   * one). Absent when none. */
  readonly grantedDoublers?: readonly StaticAbility[];
}

/**
 * A spell as it was cast (rule 601.2i): its last-known snapshot as it
 * reached the stack — characteristics as cast, mana value counting its {X}
 * (rule 202.3e). What it has become since doesn't change what was cast: an
 * Adventure cast as its instant half is a creature card in exile a moment
 * later, and a creature spell's permanent can change type.
 */
/**
 * What a resolved `grant-spells-this-turn` gave its controller's spells for
 * the rest of the turn (`GameState.spellGrantsThisTurn`): abilities and
 * properties the matching spells have as they're cast and while they're on
 * the stack. With `next`, only the next matching spell `player` casts: the
 * one that used it up is `usedBy` (that spell, in that stint on the stack),
 * set as it becomes cast (rule 601.2i).
 */
export interface SpellGrantThisTurn {
  readonly player: PlayerId;
  readonly castFrom?: readonly ZoneType[];
  readonly filter?: CardFilter;
  readonly next?: true;
  readonly triggered: readonly TriggeredAbility[];
  readonly cantBeCountered?: true;
  /** Can't be countered by spells matching this — see
   * `grant-spells-this-turn`'s `cantBeCounteredBy`. */
  readonly cantBeCounteredBy?: CardFilter;
  readonly convoke?: true;
  readonly improvise?: true;
  /** Into its owner's hand instead of their graveyard as it resolves — see
   * `grant-spells-this-turn`. Goes on the spell as `intoHandAsItResolves`. */
  readonly intoHandAsItResolves?: true;
  /** The permanent the grant came from, for the 616.1 choice's words. */
  readonly source?: ObjectId;
  readonly entersWithCounters?: { readonly counter: string; readonly amount: number };
  /** The matching spell costs this much generic mana less to cast — fixed as
   * the grant was made. See `Game.costModificationFor`. */
  readonly reduceGeneric?: number;
  /** The matching spell has affinity for these (rule 702.41a): {1} less for
   * each its caster controls as it's cast. */
  readonly affinityFor?: CardFilter;
  /** The matching spell may be cast by paying life equal to its mana value
   * rather than its mana cost (Marshland Bloodcaster). */
  /** "…can be cast without paying its mana cost" (World War Hulk). */
  readonly free?: true;
  readonly payLifeManaValue?: true;
  usedBy?: { readonly id: ObjectId; readonly zoneChangeCount: number };
}

export interface CastSpellRecord {
  readonly id: ObjectId;
  /** The spell's snapshot on the stack. Its `entry.cast` is how it was cast
   * — by whom, from where, under which permission — so the filter's `cast`,
   * `castBy`, `castFrom` and `castVia` clauses answer for it as they do for a
   * live spell: "if a spell was warped this turn" (void, rule 702.185c) is
   * `{ castVia: "warp" }` over every player's records. */
  readonly spell: LastKnownInfo;
}

/** A `choose-permanents` effect's resolution, for its `then`, which runs once
 * the choice is answered (`Game.applyChoosePermanents`): the trigger it reads
 * and where each kept target was (rule 608.2h). */
export interface ChoosePermanentsResolution {
  readonly triggerValue: number;
  readonly triggerObject?: ObjectId;
  readonly targetZones: readonly (ZoneType | null)[];
  readonly lastKnownRefs: LastKnownRefs;
}

/**
 * Which battlefield stint of the objects a spell or ability refers to it
 * means, for last-known information (rule 608.2h). Each is the referred
 * object's `zoneChangeCount` while it was on the battlefield: recorded when
 * the ability triggered or was activated (the source and the triggering
 * object), or when the permanent was sacrificed. A reference that names a
 * stint reads that stint's {@link LastKnownInfo} once the permanent has left
 * — and nothing, rather than a later stint's, once it has come back and left
 * again. A missing entry means the object wasn't a permanent when referred
 * to (a spell, a card in a hand, graveyard or the command zone), and it is
 * read as it is now.
 *
 * Targets need no entry: `GameObject.targetZones` already says which were
 * permanents.
 */
export interface LastKnownRefs {
  /** For an activated ability: the mana spent to activate it (rule 602.2b),
   * "if mana from a Treasure was spent to activate this ability". It goes
   * with the refs so a resolution parked on a decision still has it. */
  readonly manaSpent?: readonly SpentMana[];
  /** For a triggered ability on a roll: that roll, so "those results" are
   * still its own if another is rolled before it resolves. */
  readonly roll?: RollRecord;
  readonly source?: number;
  /** For a fired delayed ability: which stint of its source its effect reads
   * information from (`DelayedTrigger.sourceWas`, rule 608.2h). Not `source`,
   * which says what the ability can act on: "return this card" finds the card
   * in the graveyard it went to, in a later stint. */
  readonly sourceWas?: number;
  readonly triggerObject?: number;
  /** For a fired delayed ability: the resolution that set it up
   * (`DelayedTrigger.madeIn`). */
  readonly madeIn?: number;
  /** For an activated ability whose cost returned an attacking creature to
   * its owner's hand (`AbilityCost.returnToHand`): what that creature was
   * attacking as the cost was paid — the player, planeswalker or battle a
   * ninja put onto the battlefield attacks (rule 702.49c). */
  readonly returnedAttacking?: PlayerId | ObjectId;
  /** For a trigger fired by a spell — its casting (Baral and Kari Zev's
   * "your first instant or sorcery spell each turn"): the spell's
   * `zoneChangeCount` on the stack. Once it has left the stack (countered in
   * response), "that spell's mana value" is read as it last was there, its
   * {X} included (`GameObject.lastStackManaValue` — rule 608.2h). */
  readonly triggerSpell?: number;
  /** With `triggerSpell`: who controlled that spell as the ability triggered
   * — "that player" of "whenever a player casts a spell" (`trigger-controller`
   * — Forced Fruition, Spellshock), still them once the spell is countered
   * and its card is in its owner's graveyard. */
  readonly triggerSpellController?: PlayerId;
  /** With `triggerSpell`: the objects that spell targeted as the ability
   * triggered, each in its stint then — what `{ targetsOf: "trigger-object" }`
   * reads, so "that creature" of "a spell that targets only a single
   * creature" is the original target whatever the spell's becomes, and
   * still it once the spell is countered (the Vesuvan Duplimancy rulings). */
  readonly triggerSpellTargets?: readonly SetMember[];
  /**
   * The sets of objects this spell or ability refers to (`object-sets.ts`):
   * - `paid`: what its cost took, each kind as it was paid — "the sacrificed
   *   creature" (Dina, Soul Steeper; also what a `sacrifice-source` step
   *   earlier in the resolution sacrificed), "the discarded card" (in its
   *   stint where the discard put it), "the exiled card", "the revealed
   *   card" (with `was`, what it was in the hand — "use its power as it last
   *   existed in your hand"), "the tapped creature". Recorded as each is
   *   paid, which for a chosen one is once its decision is answered (rule
   *   602.2b).
   * - `batch`: the objects of the batch a "one or more" trigger fired on —
   *   the attackers that counted for `attacks-batch`, `attack-with` or
   *   `attacks-player` (each in its battlefield stint, read as it resolves
   *   whatever it has become since: "even if the creature is … no longer a
   *   Phyrexian"), the permanents of a batched entry (with how many tokens
   *   each stood for — Kambal's "for each of them"), the cards of a batched
   *   arrival in a graveyard (each as the object it became there), the
   *   sources of a batched damage trigger (Tamiyo, Upriser Crowned).
   * - `remembered`: what a delayed or reflexive trigger captured as it was
   *   made (`remember`).
   */
  readonly sets?: ObjectSets;
  /** For a trigger fired by attackers being declared (`attack-with`): each
   * attacker, its battlefield stint and what it was attacking then — what an
   * "if two or more of those creatures are attacking you" re-reads as it
   * resolves (Mangara, the Diplomat — rule 603.4). */
  readonly attackers?: readonly {
    readonly object: ObjectId;
    readonly zoneChangeCount: number;
    readonly at: PlayerId | ObjectId | null;
  }[];
  /** For a `deals-damage-batch` trigger fired once for the whole damage
   * event (`once: "per-event"`): every player its sources dealt damage to in
   * it, in turn order — "those opponents" (Breeches, Brazen Plunderer), the
   * `"damaged-players"` scope. */
  readonly damagedPlayers?: readonly PlayerId[];
  /** For a "whenever players finish voting" trigger: the votes of the vote
   * that fired it (Erestor of the Council). */
  readonly votes?: readonly Vote[];
  /**
   * For a trigger fired by its triggering object *leaving* the battlefield (a
   * dies trigger, a delayed "when it dies or is exiled") or arriving in a
   * graveyard (`put-into-graveyard`): that object's `zoneChangeCount` in the
   * zone the event put it in. "Return it to the
   * battlefield" follows it there and no further — a card that has moved
   * again since (exiled from the graveyard in response) is a new object the
   * ability can't find (rule 400.7). What `ResolutionContext
   * .triggerObjectLost` is worked out from; reads of it ("its power") are
   * last-known information and don't care.
   */
  readonly triggerObjectAfterLeaving?: number;
  /** For an ability a permanent's static granted another ("Equipped
   * creature has '…, Sacrifice Ninja's Kunai: Ninja's Kunai deals 3
   * damage …'"): the granting permanent and its battlefield stint as the
   * ability was activated or triggered (rule 201.5a) — the `"granter"`
   * reference. */
  readonly granter?: { readonly object: ObjectId; readonly zoneChangeCount: number };
  /**
   * What the triggering event was aimed at, for a trigger whose event has a
   * recipient — the permanent or player a `damage-dealt` event hit
   * (`deals-damage`, `dealt-damage`, `deals-combat-damage-to-player`), or
   * the player or planeswalker an attacker is attacking (`attacks`,
   * `becomes-blocked`, `attacks-alone`, `attacks-unblocked` — Mage Slayer's
   * and Rakdos Roustabout's "the player or planeswalker it's attacking").
   * `zoneChangeCount` is a permanent recipient's battlefield stint: "that
   * permanent" is gone, rather than read as it last was, once it has left
   * (Ghyrson Starn's 2 damage to a creature that has since died hits
   * nothing). What a `damage` effect's `toTriggerRecipient` hits and an
   * `ObjectRef` `"trigger-recipient"` names; a delayed trigger the
   * ability makes keeps it (`DelayedTrigger.recipient`).
   */
  readonly recipient?: { readonly target: TargetRef; readonly zoneChangeCount?: number };
  /**
   * The player the triggering event names — "that player": the player dealt
   * damage (or the controller of the permanent dealt damage), the defending
   * player of an attack. What the `"trigger-player"` and
   * `"each-other-opponent"` scopes read.
   */
  readonly player?: PlayerId;
  /** For a trigger fired by counters being put on something: what went on,
   * kind by kind — "the same number and kind of counters" (Captain Marvel,
   * Apex Avenger; `put-counters-of`'s `"trigger-placement"`). Several kinds
   * put on a permanent at once are one event for it (rule 603.2c), so one
   * trigger carries them all. */
  readonly counters?: readonly { readonly kind: string; readonly amount: number }[];
  /** This triggered ability triggered because its own source attacked — the
   * attack declaration named it (rule 508.1, the events Isshin's `"attacks"`
   * cause reads): "a creature you control attacking causes a triggered
   * ability of that creature to trigger" (Firebender Ascension). Carried
   * onto its `ability-triggered` event. */
  readonly byOwnAttack?: true;
  /** Likewise, because its own source, a creature, entered the battlefield
   * just now:
   * "a creature entering under an opponent's control causes a triggered
   * ability of that creature to trigger" (Aboleth Spawn). */
  readonly byOwnEntry?: true;
}

/**
 * The spell or ability whose targeting fired a "becomes the target"
 * trigger (rule 115.7), recorded as it triggers: ward's "counter **that
 * spell or ability** unless **that player** pays" (rule 702.21a) needs both.
 * `zoneChangeCount` is the spell's as it was targeting, so a spell that has
 * since left the stack (and come back as a new object — rule 400.7) isn't
 * the one ward counters. An ability object is never reused, so its count is
 * always 0.
 */
export interface TargetedBy {
  readonly object: ObjectId;
  readonly player: PlayerId;
  readonly zoneChangeCount: number;
}

/** A triggered ability waiting to be put on the stack (rule 603.3). */
export interface PendingTrigger {
  readonly sourceObjectId: ObjectId;
  readonly cardName: string;
  readonly abilityIndex: number;
  readonly controller: PlayerId;
  /** Its ability's `stackFirst`: placed before its controller's others. */
  readonly stackFirst?: boolean;
  /** Its controller has chosen where it goes among their simultaneous
   * triggers (the `order-triggers` decision): placed as it stands in
   * `pendingTriggers`, not re-sorted, and not asked about again. */
  readonly ordered?: boolean;
  /** A target the triggering *event* determines (not chosen) — e.g. the
   * player a saboteur just dealt combat damage to. Fills the ability's target
   * slots in order, ahead of any `chooseTargets` prompt. */
  readonly autoTargets?: readonly TargetRef[];
  /** A numeric quantity from the triggering event (the entering / attacking
   * creature's power, or the combat damage a creature dealt a player),
   * snapshotted when the trigger was detected — for an `EffectAmount`
   * `{ triggerValue: true }` (Terror of the Peaks, Old Gnawbone). ROADMAP P4b. */
  readonly triggerValue?: number;
  /** The object whose entering / attacking / etc. fired this trigger,
   * snapshotted when it was detected — for a `create-token-copy` effect with
   * `of: "trigger-object"` (Miirym, Sentinel Wyrm — needed-cards P5b). */
  readonly triggerObject?: ObjectId;
  /** For a `becomes-target` trigger: the spell or ability that did the
   * targeting — see {@link TargetedBy}. */
  readonly targetedBy?: TargetedBy;
  /** The X the source was cast with, for its own enters-the-battlefield
   * ability (rule 107.3m) — snapshotted as the trigger is detected, since the
   * permanent may be gone (a 0/0 that entered with X=0) or a new object (it
   * was flickered) by the time the ability is put on the stack. Becomes the
   * ability object's `xValue`, so the ability reads it as `ctx.x`. Absent for
   * every other trigger, and for a permanent that entered without being cast:
   * X is 0 then. */
  readonly x?: number;
  /** See {@link GameObject.stackMultiplier} — how many real firings this one
   * queued trigger represents. `undefined`/`1` outside a scaled resolution. */
  readonly multiplier?: number;
  /** How many identical copies of this trigger — one that chooses no targets,
   * fired once per token of a token stack (Authority of the Consuls seeing
   * an opponent's Scute Swarms enter) — go on the stack as one object
   * standing for them all (`GameObject.stackCount`). Unlike `multiplier`,
   * each copy is its own resolution, one at a time, with priority between;
   * this only spares minting hundreds of identical objects. */
  readonly copies?: number;
  /** True for a Saga chapter ability (rule 714) — `abilityIndex` indexes
   * `def.chapters` rather than `def.triggered`. ROADMAP Phase 10. */
  readonly chapter?: boolean;
  /** Set when the ability was granted — see {@link GrantedAbilityRef}. */
  readonly grantedAbility?: GrantedAbilityRef;
  /** Which battlefield stint of its source and triggering object the ability
   * refers to, recorded as it triggers — see {@link LastKnownRefs}. */
  readonly lastKnownRefs?: LastKnownRefs;
  /** Miracle's trigger (rule 702.94a), its card's `zoneChangeCount` in hand
   * as it was drawn: the ability can cast only that object (400.7 —
   * `sourceLost` once it has left the hand). `revealed` is false until its
   * owner has chosen to reveal it (the `miracle-reveal` decision, asked as
   * it would be placed); declined, the trigger is dropped. */
  readonly miracle?: { readonly stint: number; readonly revealed: boolean };
  /**
   * A whole ability record rather than an index into a card's `triggered`
   * list — a mana-spend rider (Path of Ancestry), which is an ability of no
   * card's ability list at all: it rides on a unit of mana. Carried the same
   * way `GameObject.delayedTrigger` carries one, and placed by the same
   * minting code, so it resolves through the existing path.
   *
   * It queues here rather than going straight onto the stack because the
   * mana is spent *during* casting, before this engine has moved the card to
   * the stack. Minting immediately would put the rider underneath the spell
   * and resolve it second; queueing lets `prepareForPriority` place it when
   * a player would next get priority, which is both rule 603.3b and the
   * right order.
   */
  readonly delayed?: DelayedTrigger;
  /** A mana-spend rider's `triggerObject` is the spell the mana paid for,
   * still being cast as the rider fires: its `lastKnownRefs.triggerSpell` —
   * which stint on the stack "that spell" is — is read as the rider is
   * placed, by when the spell is there. */
  readonly triggerSpellOnPlacement?: true;
  /** A mana-spend rider fired by mana paying an activated ability's cost
   * (Sunken Palace): the mana is paid before the ability is put on the
   * stack here, so its `triggerObject` — "that ability" — is filled in once
   * it is (`Game.bindManaRidersToAbility`), and this flag dropped. Never
   * left set past the activation. */
  readonly awaitsActivation?: true;
  /** A reflexive triggered ability — see {@link ReflexiveTrigger}. Placed
   * like a card's own triggered ability, choosing its targets as it goes on
   * the stack, from this record's specs rather than a card's list. */
  readonly reflexive?: ReflexiveTrigger;
  /** A modal ability's modes ("Choose one —"), announced as it goes on the
   * stack (rules 603.3c, 700.2b) — set once its controller has answered the
   * `choose-modes` it paused for, in printed order. See the `modal`
   * effect's `announced`. */
  readonly modes?: readonly number[];
}

/**
 * A reflexive triggered ability (rule 603.12): "you may pay {2}. **When you
 * do**, return target creature card …" (Terra, Herald of Hope). A resolving
 * spell or ability creates it once the optional or conditional action has
 * happened, and it goes on the stack the next time a player would receive
 * priority — after that spell or ability has finished resolving — choosing
 * its targets then. It belongs to no card's ability list, so it carries its
 * own targets and effect, as a {@link DelayedTrigger} does; its source and
 * controller are the resolving spell's or ability's.
 */
/** One of the triggered abilities an `order-triggers` decision orders. */
export interface TriggerOrderEntry {
  /** The object whose ability it is. */
  readonly source: ObjectId;
  readonly cardName: string;
  /** The ability's text, to tell two abilities of one card apart. */
  readonly text: string;
  /** How many identical copies it stands for (`PendingTrigger.copies`). */
  readonly copies: number;
}

export interface ReflexiveTrigger {
  readonly targets: readonly TargetSpec[];
  readonly effect: EffectSpec;
  readonly text: string;
  /** "When you do, it deals 7 damage divided as you choose among one or two
   * targets" (Death to Our Enemies): an amount divided among its group, as a
   * triggered ability's `divided` — announced as it's put on the stack
   * (rules 603.12, 603.3d, 601.2d), after the creating resolution is done. */
  readonly divided?: TriggeredAbility["divided"];
}

/** A kind of counter a player can have (rule 122.1), apart from energy — see
 * `PlayerState.counters`. */
/** `"contract"`: Miss Highwater's ("they … get a contract counter"), which
 * does nothing of itself — her lasting effect reads it. */
export type PlayerCounterKind = "poison" | "experience" | "rad" | "contract";

/** A permanent that left the battlefield, and where to. */
export interface LeftBattlefield {
  readonly object: ObjectId;
  readonly to: "graveyard" | "exile" | "hand" | "library" | "command";
}

/** A counter a player can be asked how many of: energy too ("where X is the
 * amount of {E} you have" — Razorfield Ripper), which `PlayerState.energy` holds
 * and only its own effects change. */
export type HeldPlayerCounter = PlayerCounterKind | "energy";

/** How many `kind` counters `player` has (rule 122.1), energy included. */
export function playerCountersHeld(state: GameState, player: PlayerId, kind: HeldPlayerCounter): number {
  const ps = state.players[player];
  if (ps === undefined) return 0;
  return kind === "energy" ? ps.energy : (ps.counters[kind] ?? 0);
}

/** How many poison counters make a player lose (rule 704.5c). */
export const POISON_LETHAL = 10;

export interface PlayerState {
  readonly id: PlayerId;
  life: number;
  /**
   * `GameState.timestampSeq` as this player's most recent upkeep began, and
   * as the one before it began — echo's "since the beginning of your last
   * upkeep" (rule 702.30a), asked during an upkeep, means the one before.
   * Absent until they've had one (two).
   */
  lastUpkeepSeq?: number;
  previousUpkeepSeq?: number;
  /** How many times the Ring has tempted this player this game (rule
   * 701.54c) — what the Ring emblem's later abilities are gated on. Absent
   * until it first does. */
  ringTemptations?: number;
  /** The creature chosen as Ring-bearer by the temptation under way, between
   * its choice and its completion — what "whenever the Ring tempts you"
   * names. Cleared as the temptation completes. */
  ringChosen?: ObjectId;
  /** The enduring story designation (rule 702.195b): had for the rest of
   * the game once this player controls a permanent with storied and three or
   * more artifacts, Sagas and/or legendary permanents (`Game.grantEnduringStories`). */
  enduringStory?: boolean;
  /** The city's blessing (rule 702.131c): had for the rest of the game once
   * this player controls ten or more permanents as a spell with ascend
   * resolves or while they control a permanent with ascend
   * (`Game.grantCitysBlessings`). */
  citysBlessing?: boolean;
  /**
   * This player's speed (rule 702.179): absent while they have none (rule
   * 702.179b — a player has no speed until a rule or effect sets it), then
   * 1 to 4. Controlling a permanent with start your engines! makes it 1, a
   * state-based action (704.5aa — `Game.startEngines`); the inherent
   * triggered ability `speedAbility` raises it once a turn; and nothing
   * lowers it — losing the permanents changes nothing (the rulings). Read as
   * 0 while absent (702.179f): the `speed` amount and condition, "max speed"
   * at 4 (702.179e).
   */
  speed?: number;
  /**
   * The object carrying the inherent triggered ability of a player with
   * speed (rule 702.179d: "Whenever one or more opponents lose life during
   * your turn, if your speed is less than 4, your speed increases by 1.
   * This ability triggers only once each turn."), made as their speed is
   * first set. The ability has no source in the rules; the engine still
   * needs an object for it to trigger from and go on the stack as — this
   * one, in the command zone but in no zone list, like an emblem's
   * (`Game.createEmblem`): no player can see, target or move it, and it is
   * read only by the trigger scan. Its definition is `cards/speed.ts`'s.
   */
  speedAbility?: ObjectId;
  /** The object carrying the inherent triggered ability of this player's
   * rad counters (rule 728.1: "at the beginning of each player's precombat
   * main phase, if that player has one or more rad counters, …"), made the
   * first time they get one and kept all game, like `speedAbility` — no
   * source in the rules, an object here to trigger from. Its definition is
   * `cards/rad.ts`'s. */
  radAbility?: ObjectId;
  /** The dungeon this player is in (rule 309): its object in the command
   * zone (in no zone list, like an emblem's — it can't be cast and never
   * moves, 309.2c), its name (`cards/dungeons.ts`) and the room their venture
   * marker is on, by index. Absent while they own no dungeon there. */
  dungeon?: { readonly object: ObjectId; readonly name: string; readonly room: number };
  /** The dungeons this player has completed (rule 309.7), oldest first — a
   * name once per completion. What "if you've completed a dungeon" reads.
   * Absent until the first. */
  completedDungeons?: string[];
  /** Mana floating in this player's pool, as individual units rather than a
   * count per colour — a unit may be restricted in what it pays for, may
   * survive the end of a step, or may carry a rider that fires when it's
   * spent, and none of that survives being added up. `poolCounts` gives the
   * totals. Usually empty: the engine auto-pays, so mana is normally made and
   * spent without ever landing here. */
  manaPool: ManaUnit[];
  maxHandSize: number;
  /** Extra land drops an effect granted this turn — Explore's "You may play
   * an additional land this turn". Reset as each turn begins; the ongoing
   * kind (Azusa) is a static, `extraLandsPerTurn`. */
  extraLandsThisTurn?: number;
  /** The names of the spells with paradigm this player has controlled as one
   * resolved (rule 702.192a: only the first with a name sets it up). */
  paradigmResolved?: readonly string[];
  hasLost: boolean;
  lossReason: string | null;
  /**
   * Set when the player tried to draw from an empty library. Checked and
   * cleared by state-based actions (rule 704.5c).
   */
  attemptedDrawFromEmptyLibrary: boolean;
  /** Times this player has cast each commander from the command zone, keyed by
   * card name — each cast adds {2} generic to *that* commander's cost next
   * time (rule 903.8 — the tax is per-commander, so Partner pairs are tracked
   * separately). */
  commanderCastCounts: Record<string, number>;
  /** Cumulative combat damage taken from each commander since the game
   * began, keyed by that commander's object id. 21+ from the same commander
   * is a loss (rule 903.10a / SBA 704.5m).
   *
   * Per *commander*, not per opponent: two Partner commanders are counted
   * separately, and damage from a commander someone else has taken control
   * of still counts toward that same commander — the rule is about the card,
   * not who's attacking with it. A commander keeps its object id through
   * every zone change, so the count follows it to the command zone and back. */
  commanderDamageTaken: Record<ObjectId, number>;
  /** Spells *this player* has cast this turn — read by "your first spell each
   * turn" triggers. (Storm counts *all* players' spells — see
   * `GameState.spellsCastThisTurn`.) Reset in `beginTurn`. ROADMAP Phase 8. */
  spellsCastThisTurn: number;
  /** True once this player has lost life this turn — Theater of Horrors's
   * "if an opponent lost life this turn". Reset in `beginTurn`. */
  /**
   * The creature types of the sources this player controlled that dealt
   * combat damage to a player this turn, each read as it dealt the damage —
   * a changeling's as its every-creature-type marker (`hasSubtype`). Prowl's
   * "if you dealt combat damage to a player this turn with a Goblin or
   * Rogue" (rule 702.76a — the `prowl` condition). Reset in `beginTurn`;
   * absent is none.
   */
  combatDamageCreatureTypesThisTurn?: string[];
  /** Whether this player has drawn a card during their own draw step this
   * turn — so the next one isn't "the first one they draw in each of their
   * draw steps" (Xyris, the Writhing Storm; Orcish Bowmasters). Reset in
   * `beginTurn`. Optional so an older snapshot still loads. */
  drewInDrawStepThisTurn?: boolean;
  /** How many times this player would have drawn a card this turn — each
   * single draw event, before any replacement (rule 614.11), the
   * turn-based draw included: `all` of them, and `exceptDrawStepFirst` those
   * that weren't the first card they'd draw in their own draw step. What a
   * `would-draw` replacement's "the first time you would draw a card each
   * turn" reads (Reed Richards, Smartest Man; Scion of Halaster) — history,
   * so one that arrives after the turn's first draw doesn't apply that turn.
   * Reset in `beginTurn`. */
  wouldDrawThisTurn?: { all: number; exceptDrawStepFirst: number };
  /** The spells this player has cast this turn, in order, each as it was
   * cast — see {@link CastSpellRecord}. What "your first enchantment spell
   * each turn" counts (Tuvasa: a cast trigger with a `filter` counts
   * first/Nth among the ones that match), "the first spell you cast with {X}
   * each turn" (Zimone's `costModification.firstEachTurn`) and "if you've
   * cast a creature spell and a noncreature spell this turn" (Eshki
   * Dragonclaw, the `cast-this-turn` condition) read. Reset in
   * `beginTurn`. */
  spellsCastThisTurnAs?: CastSpellRecord[];
  /** How many spells this player has cast this game, by the name each had as
   * it was cast — Approach of the Second Sun's "you've cast another spell
   * named Approach of the Second Sun this game" (the `spells-cast-this-game`
   * condition). Only casts count: a copy of a spell isn't cast (rule 707.10).
   * Never reset; absent until their first spell. Kept on the player rather
   * than read off the event log, which a simulation starts empty. */
  spellNamesCastThisGame?: Record<string, number>;
  /** The last turn this player declared a commander — anyone's — as an
   * attacker: "during any turn you attacked with a commander" (Neriv,
   * Crackling Vanguard). */
  attackedWithCommanderOnTurn?: number;
  /** This player cast a spell from a graveyard, or activated an ability of a
   * card in a graveyard, this turn (Laboratory Drudge). */
  usedGraveyardThisTurn: boolean;
  /** "Lands you control don't untap during your next untap step" (Kefnet's
   * Last Word): during this player's next untap step, no permanent they
   * control then that matches one of these untaps — those that came under
   * their control since included (the rulings). Cleared by that untap step.
   * Absent with none. See the `skip-next-untap` effect. */
  untapSkips?: readonly CardFilter[];
  /** "That player skips their next untap step" (Brine Elemental, Dovin,
   * Architect of Law — rule 614.10): how many of this player's untap steps
   * are still to be skipped whole — no phasing, no day/night check, nothing
   * untapping — each effect satisfied by one (614.10a: two skip the next
   * two). Anything waiting for "their next untap step" (`untapSkips`, a
   * permanent that doesn't untap during it, an exert) waits for the first one
   * that isn't skipped. Absent with none. See the `skip-untap-step` effect. */
  untapStepsToSkip?: number;
  /** "You skip your next turn" (Meditate — rules 500.11, 614.10): how many of
   * this player's turns are still to be skipped, extra turns included, each
   * effect satisfied by one (614.10a: two skip the next two). A skipped turn
   * never begins, so whatever waits for "their next turn" waits for the first
   * one that isn't skipped. Absent with none. See the `skip-turn` effect. */
  turnsToSkip?: number;
  /** "[That player] skips their next draw step" (Fatigue, Molten Firebird —
   * rule 614.10) and the same for an upkeep step: how many of each are still
   * to be skipped, each effect satisfied by one (614.10a). A step a static
   * already skips (`skipsSteps`) doesn't count: what's scheduled for the
   * "next" one waits for the first that isn't skipped. Absent with none. See
   * the `skip-step` effect. `combat` is the same for a whole combat phase of
   * this player's turn (Stonehorn Dignitary). */
  stepsToSkip?: { upkeep?: number; draw?: number; combat?: number };
  /** "[That player] skips all combat phases of their next turn" (False Peace):
   * set until that turn begins, when it becomes `TurnState.noCombat`. A turn
   * that's skipped never begins, so this waits for the first that isn't. */
  noCombatNextTurn?: true;
  /** Energy counters this player has (rule 122 / {E} — ROADMAP Phase 10). A
   * player resource, not tied to any permanent; spent by a `payEnergy` ability
   * cost, gained by a `get-energy` effect. Kept apart from `counters`, which
   * came later, because the bots' evaluation reads it as a feature. */
  energy: number;
  /**
   * Every other kind of counter this player has (rule 122.1) — poison
   * (ten or more lose the game, rule 704.5c) and experience. Given by an
   * `add-player-counters` effect, read by the `playerCounters` amount, count
   * and cost reduction and the `player-counters` condition, and grown by
   * proliferate. A kind the player has none of is absent.
   */
  counters: Partial<Record<PlayerCounterKind, number>>;
  /**
   * The last turn each opponent attacked this player or a planeswalker they
   * control, by attacking player — public, since every attack is announced.
   * Rules never read it; the bots' evaluation does (`bot/features.ts`'s
   * `threat`): whoever swung at you last round is likelier to again, and by
   * the end of a turn — where a search scores a move — nothing is attacking
   * any more. Absent until someone attacks.
   */
  lastAttackedBy?: Partial<Record<PlayerId, number>>;
  /**
   * The last turn each player declared a creature attacking **this player**
   * — the player, not a planeswalker of theirs, and never a creature put
   * onto the battlefield attacking (the O-Kagachi, Vengeful Kami ruling on
   * "attacked you"). With `lastTurnTaken`, what "players who attacked you
   * during their last turn" reads (Weathered Sentinels — see
   * `attackedYouDuringTheirLastTurn`). Absent until someone does.
   */
  attackedByOnTurn?: Partial<Record<PlayerId, number>>;
  /** The turn and combat phase (`TurnState.combatPhases`) in which a creature
   * was last declared attacking this player — the player, not a planeswalker
   * of theirs (rule 508.3b). Portal's "only if you've been attacked this
   * step" (the `attacked-this-step` condition). Absent until it happens. */
  attackedInCombat?: { readonly turn: number; readonly combat: number };
  /** The number of the most recent turn this player took, the one under way
   * included — "their last turn". Set as each of their turns begins, and as
   * they declare attackers (so a first turn counts). */
  lastTurnTaken?: number;
  /** The number of the turn this player took before `lastTurnTaken` — while
   * it's their turn, "their last turn" (`controllersLastTurn`). */
  turnTakenBefore?: number;
  /** How many turns this player has taken this game, the one under way
   * included: extra turns count, a skipped one was never taken (rule 614.10),
   * and whichever player controlled it, the turn was still this player's
   * (rule 723). "Your first, second, or third turn" (`turns-taken`). */
  turnsTaken?: number;
  /** The combat phase of this player's turns under way or most recently
   * begun (`turn`, and `phase` — `TurnState.combatPhases` then), and the
   * one before it — "your last combat" as a new combat begins (Territorial
   * Hellkite). Set as each beginning of combat step of their turn starts. */
  currentCombat?: CombatId;
  previousCombat?: CombatId;
  /** The players this player declared a creature attacking in combat
   * `combat` (a planeswalker isn't its controller) — melee's "each opponent
   * you attacked with a creature this combat" (rule 702.121a), which an
   * attacker leaving combat afterwards doesn't undo, and a creature put onto
   * the battlefield attacking never adds to. */
  attackedThisCombat?: { readonly combat: CombatId; readonly players: readonly PlayerId[] };
  /**
   * Which printing of each card this player brought, keyed by card name — a
   * Scryfall reference in the same shapes {@link CardDefinition.art} accepts
   * (see `DeckList.printings`). Purely cosmetic: nothing in the rules engine
   * reads it, and `viewFor` is the only consumer, handing it to the client
   * in place of the definition's own `art`.
   *
   * It lives on the player rather than on each `GameObject` because it's a
   * fact about the physical cards someone owns, not about any game state —
   * so it survives every zone change, copy and control change for free,
   * where a per-object field would have to be threaded through `moveObject`
   * (which deliberately resets per-object state) without being reset.
   */
  printings: Record<string, string>;
  /**
   * The colours in this player's commanders' colour identity (rule 903.4 —
   * both, for a pair), fixed by the deck at setup: what "one mana of any
   * color in your commander's color identity" (Command Tower, Arcane
   * Signet) may make. Empty for a player with no commander, or a colourless
   * one — and then it makes nothing (the rulings).
   */
  commanderIdentity?: readonly Color[];
  /**
   * How many cards this player's starting deck had — its library and its
   * commanders, as dealt at setup (rule 103.1): what "if you had 200 or more
   * cards in your starting deck" (Whtz, the Bibliophile) reads. Absent on a
   * board built by hand, whose decks are nobody's starting deck.
   */
  startingDeckSize?: number;
}

export interface GameRules {
  startingLife: number;
  openingHandSize: number;
  maxHandSize: number;
  maxLandsPerTurn: number;
  /** In a two-player game the player who goes first skips their first draw. */
  skipFirstDraw: boolean;
  /** The traditional Commander mulligan rule: a player's first mulligan each
   * game doesn't require putting a card on the bottom of their library —
   * only the second and later mulligans do (London mulligan otherwise).
   * Default false; the server turns this on for its Commander rooms. */
  freeFirstMulligan: boolean;
}

export const DEFAULT_RULES: GameRules = {
  startingLife: 20,
  openingHandSize: 7,
  maxHandSize: 7,
  maxLandsPerTurn: 1,
  skipFirstDraw: true,
  freeFirstMulligan: false,
};

/**
 * A game's configured rules. `freeFirstMulligan` may also be `"multiplayer"`:
 * rule 103.5c's own terms, on only in a multiplayer game (a game that begins
 * with more than two players, rule 100.1b). `Game.create` settles it.
 */
export type GameRulesConfig = Omit<Partial<GameRules>, "freeFirstMulligan"> & {
  readonly freeFirstMulligan?: boolean | "multiplayer";
};

/**
 * The rules a live Commander room plays under (rule 903.7: 40 starting life),
 * shared so the server's rooms and the bot benchmark (`scripts/tune-bot.mjs`)
 * can't drift apart — weights tuned at 20 life are tuned for a game nobody
 * plays.
 */
export const COMMANDER_RULES: GameRulesConfig = {
  startingLife: 40,
  freeFirstMulligan: "multiplayer",
};

/**
 * Gift (rule 702.174a): "as an additional cost to cast this spell, you may
 * choose an opponent". Promising it is a cast variant — the kicker machinery
 * under the keyword `gift` — and the opponent is chosen as the cost is paid
 * (601.2h, after the targets), queued in `GameState.pendingGifts` as the
 * spell is cast and asked before anyone gets priority. With one opponent
 * there's nothing to ask; with more, the caster picks one (a `choose-modes`
 * with a mode per opponent). See {@link CasualtyAsk} for the same shape.
 */
export interface GiftAsk {
  readonly spell: ObjectId;
  /** The caster, who promised it. */
  readonly player: PlayerId;
  /** The opponents it may go to, in turn order from the caster's left —
   * a raised decision's modes, in this order. */
  readonly candidates: readonly PlayerId[];
  readonly priorityTo: PlayerId;
  /** Not a gift but the same question, "which opponent?": "An opponent gains
   * 5 life" as a cost (Roar of Jukai's splice — `KickerAlsoCost`). That much
   * for whoever is picked. */
  readonly gainLife?: number;
}

/**
 * One non-mana part of a keyword's cost still to be paid as its spell is cast
 * (rule 601.2h): a kicker's or squad's `also`, a spliced card's. Queued in
 * `GameState.pendingAlsoCosts`, since several spliced cards can each owe one,
 * and paid one at a time before anyone gets priority, the spell on the stack.
 * Exactly one part is set.
 */
export interface AlsoCostAsk {
  readonly spell: ObjectId;
  /** The caster, who pays. */
  readonly player: PlayerId;
  readonly priorityTo: PlayerId;
  readonly discard?: { readonly count: number; readonly atRandom?: boolean };
  readonly returnToHand?: { readonly count: number; readonly filter: CardFilter };
  readonly exileFromGraveyard?: { readonly count: number; readonly filter?: CardFilter };
  /** An action as the cost (`KickerAlsoCost.do`, or an ability's `AbilityCost.do`
   * paid after its other parts, 601.2h). */
  readonly do?: EffectSpec;
  /** The ability's source, when `spell` is the ability on the stack. */
  readonly source?: ObjectId;
}

/**
 * A cast waiting on its assisting player (rule 702.132a): the player its
 * caster chose may pay any amount of the generic mana in its total cost
 * before the caster pays the rest, asked as a `choose-number` from 0 to the
 * most their mana pays. `cast` is the caster's whole cast, its `assist`
 * naming that player, carried out once they answer — or reversed if the
 * caster can't pay what's left (rule 733.1), the caster keeping priority
 * (733.2). `need` is the least the caster's own mana leaves to be paid, for
 * the prompt.
 */
/** What a `cast-now` offers — to whom, which cards, on what terms: the
 * `cast-now` {@link EffectSpec}'s {@link PlayTerms}, with what it adds. */
export interface CastNowAsk extends Omit<CastNowTerms, "free" | "exileAfter" | "play"> {
  readonly player: PlayerId;
  readonly cards: readonly ObjectId[];
  readonly free: boolean;
  /** The madness cost paid rather than the mana cost (rule 702.35a). */
  readonly madness?: string;
  /** The miracle cost paid rather than the mana cost (rule 702.94a). */
  readonly miracle?: string;
  /** Each card's own suspend cost paid rather than its mana cost — the
   * `cast-now` effect's `suspendCost`. */
  readonly suspendCost?: true;
  readonly exileAfter: boolean | "instants-and-sorceries";
  readonly freeCastOf?: "cascade" | "suspend";
}

/**
 * A cast or activation waiting on the opponent its caster named
 * (`otherChooser`) to choose some of its targets (rule 601.2c —
 * `CardDefinition.opponentChoosesTargets`, `ActivatedAbility
 * .opponentChoosesTargets`), asked as a `choose-targets` for those `slots`,
 * or its modes (rule 700.2e — `CastModalSpec.chosenBy`), asked as a
 * `choose-modes`. `action` is the caster's whole action — its `targets`
 * only the slots that are theirs — carried out once the opponent answers,
 * or reversed if their answer leaves it impossible (rule 733.1).
 * `castNow` is the `cast-now` offer it was cast under, for a spell cast as
 * something resolves.
 */
export interface OtherChoiceAsk {
  readonly action: Extract<Action, { type: "cast-spell" }> | Extract<Action, { type: "activate-ability" }>;
  readonly slots: readonly number[];
  readonly castNow?: CastNowAsk;
}

export interface AssistAsk {
  readonly cast: Extract<Action, { type: "cast-spell" }>;
  readonly need: number;
  readonly castNow?: CastNowAsk;
}

/**
 * A spell's casualty costs being offered as it's cast (rule 702.153a): its
 * caster may sacrifice a creature with power N or greater, asked as a
 * `choose-permanents` of up to one. Each instance of casualty is its own
 * optional cost (702.153b), asked one after another. Once they're all
 * answered, `priorityTo` gets priority — the caster, as after any cast (rule
 * 117.3c), or the active player for a spell cast while something resolved.
 * Queued in `GameState.pendingCasualty` as the spell is cast and asked the
 * next time a player would get priority, before any trigger goes on the
 * stack.
 */
export interface CasualtyAsk {
  readonly spell: ObjectId;
  /** The caster, who pays. */
  readonly player: PlayerId;
  /** The N of each instance still to ask about, in order; the first is the
   * one a raised decision is asking about. */
  readonly amounts: readonly number[];
  readonly priorityTo: PlayerId;
}

/**
 * A spell's conspire costs being offered as it's cast (rule 702.78a): its
 * caster may tap two untapped creatures they control that each share a
 * colour with it — asked first as a `choose-modes` of one mode or none
 * (`conspireAsk`), then, if they pay, as a `choose-permanents` of exactly
 * two (`conspire`). Each instance is its own optional cost (702.78b), asked
 * one after another, as {@link CasualtyAsk}'s are. Queued in
 * `GameState.pendingConspire`.
 */
export interface ConspireAsk {
  readonly spell: ObjectId;
  /** The caster, who pays. */
  readonly player: PlayerId;
  /** How many instances are still to ask about, this one included. */
  readonly instances: number;
  readonly priorityTo: PlayerId;
}

/** A phase an effect added straight after the combat phase under way — see
 * `GameState.phasesAfterThisCombat`. */
export type AddedPhase =
  | {
      readonly kind: "combat";
      readonly withMain: boolean;
      /** What must attack in this combat phase, each in the stint it was in, and
       * who it can't attack (`"additional-combat"`'s `forcedAttackers`). */
      readonly forced?: {
        readonly objects: readonly { readonly object: ObjectId; readonly zoneChangeCount: number }[];
        readonly avoid?: PlayerId;
      };
      /** "Only land creatures can attack during that combat phase" (Bumi,
       * Unleashed — `"additional-combat"`'s `onlyAttackers`): as the phase
       * begins, a `PlayerEffect.onlyAttackers` of `you`'s, ending with it. */
      readonly onlyAttackers?: { readonly filter: CardFilter; readonly you: PlayerId };
      /** This phase's mark, for a delayed ability "at the beginning of that
       * combat" (`DelayedTrigger.at`'s `thatCombat`). */
      readonly mark?: number;
      /** The turn's own combat phase, put behind the additional ones made in the
       * main phase before it (rule 500.8), each of which comes first. */
      readonly regular?: true;
    }
  | { readonly kind: "upkeep" }
  /** A whole additional beginning phase — untap, upkeep and draw steps
   * (Sphinx of the Second Sun — rules 500.8, 501.1) — made in the phase
   * `after` names: once it's over the turn goes on to what followed that
   * phase (`TurnState.addedBeginning`). */
  | { readonly kind: "beginning"; readonly after: "main" | "combat" }
  /** The additional main phase of a `withMain` combat, directly after it
   * (rule 500.8) with more phases still to come behind it. */
  | { readonly kind: "main" };

export interface TurnState {
  number: number;
  /** `GameState.timestampSeq` as this turn began: what came under a player's
   * control from then on has a `controlSinceSeq` no lower than this
   * (`CardFilter.controlledSinceTurnBegan`). */
  beganAtSeq?: number;
  /** The round under way: each player's turn once, from the starting
   * player's seat round to it again, is one round — so at a four-player
   * table turn 37 is round 10. No rule defines it; it's how the client says
   * how far a game has gone. An extra turn belongs to the round it's taken
   * in, and a seat that has left the game is passed over without ending one.
   * Absent before the first turn (and on a state saved before it existed). */
  round?: number;
  activePlayerIndex: number;
  step: Step;
  /** The `"upkeep"` step under way is the only step of an additional
   * beginning phase (rules 500.10, 500.11 — an `AddedPhase` of kind
   * `"upkeep"`): when it ends, the turn goes on to whatever followed the
   * combat phase it came after, never to a draw step. */
  addedUpkeep?: boolean;
  /** The beginning phase under way is an additional one (an `AddedPhase` of
   * kind `"beginning"`), made in a main phase or a combat phase: when its
   * draw step ends, the turn goes on to what followed that phase — the
   * ending phase, or the main phase after combat — never to a main phase of
   * its own. Its untap step isn't the turn beginning: summoning sickness and
   * the turn's records don't reset (rule 302.6). */
  addedBeginning?: "main" | "combat";
  /** The `"postcombat-main"` step under way is an `AddedPhase` of kind
   * `"main"`: a combat queued behind it doesn't end the turn, whose own
   * main phase is still to come. */
  addedMain?: boolean;
  /** The combat phase under way was added after the main phase that follows
   * combat (Grim Reaper's Sprint cast there): when it ends, the turn goes on
   * to the end step rather than to another main phase. */
  endsAfterAddedCombat?: boolean;
  /** A player got priority in the cleanup step under way (rule 514.3a: state-
   * based actions were performed, or triggered abilities were waiting, once
   * its turn-based actions were done): when it ends, another cleanup step
   * begins rather than the next turn. */
  cleanupHadPriority?: boolean;
  /** "You skip your draw step this turn" (Elfhame Sanctuary — the
   * `skip-step` effect's `thisTurn`): the active player's steps of these
   * kinds this turn are skipped, and none of a later turn. `"combat"` is a
   * whole combat phase (Moment of Silence), one for each. */
  skipsThisTurn?: ("upkeep" | "draw" | "combat")[];
  /** "The player skips **each instance** of the chosen step or phase this
   * turn" (Fatespinner — the `skip-step` effect's `eachThisTurn`): every one
   * of the active player's steps or phases of these kinds for the rest of
   * this turn, ones added later too. `"main"` is both main phases and any
   * additional one (rule 505.1). Every combat phase is `noCombat`. */
  skipsEachThisTurn?: ("upkeep" | "draw" | "main")[];
  /** Every combat phase of this turn is skipped — see
   * `PlayerState.noCombatNextTurn`. */
  noCombat?: true;
  /** True when this turn was taken via an extra-turn effect (Time Warp) rather
   * than the normal rotation — ROADMAP Phase 7. */
  isExtra: boolean;
  /** The seat of the last turn taken in the normal rotation, which an extra
   * turn doesn't move: an extra turn is added directly after a turn (rule
   * 500.7), so the turn after it is the one that would have come next anyway
   * — Bob's extra turn from Alice's Time Warp is followed by Bob's own turn.
   * Absent until an extra turn is first taken, when it's the active seat. */
  rotationIndex?: number;
  /** How many combat and main phases have begun this turn — the one under
   * way included — for "if it's the first combat phase of the turn"
   * (Karlach) and "your second main phase". Reset as each turn begins. */
  combatPhases?: number;
  mainPhases?: number;
  /** How many end steps have begun this turn, the one under way included —
   * for "if it's the first end step of the turn" (Y'shtola Rhul) and for a
   * delayed "next end step" made during one of them. Reset as each turn
   * begins. */
  endSteps?: number;
  /** Additional end steps owed straight after the end step under way (rule
   * 500.9 — the `additional-end-step` effect). */
  extraEndSteps?: number;
  /** How many upkeep steps have begun this turn, the one under way included
   * — "enchanted player's **first** upkeep each turn" (Paradox Haze), the
   * `step-begins` trigger's `firstTimeEachTurn`. Reset as each turn begins. */
  upkeepSteps?: number;
  /** Additional upkeep steps owed straight after the upkeep step under way
   * (rule 500.10 — the `additional-upkeep-step` effect). */
  extraUpkeepSteps?: number;
  /** The mark of the additional combat phase under way, if it has one — see
   * `AddedPhase.mark`. */
  addedCombat?: number;
}

export interface PriorityState {
  active: boolean;
  holder: PlayerId | null;
  /** Players who have passed since priority was last granted, in order. */
  passed: PlayerId[];
}

export interface GameResult {
  over: boolean;
  winner: PlayerId | null;
  reason: string | null;
}

/** One player's state within the parallel mulligan phase. */
export interface MulliganHandState {
  /** Mulligans taken so far (0 = first hand). */
  readonly taken: number;
  /** `"decide"` — still choosing keep-or-mulligan-again; `"bottom"` — kept,
   * now owes `taken` cards to the bottom of the library (London mulligan). */
  readonly step: "decide" | "bottom";
  /** Hands replaced by a card's ability while deciding (rule 103.5b — Serum
   * Powder), which is no mulligan and so isn't in `taken`. Absent means 0.
   * Only the client reads it, to tell a hand it's still dealing from the one
   * it asked about. */
  readonly redraws?: number;
}

/**
 * A decision the rules are waiting on. While this is set, the named player's
 * only legal action is the matching declaration.
 */
/** One creature put onto the battlefield attacking, and what it may attack
 * (rule 508.4) — see the `enter-attacking` decision. */
export interface EnterAttackingChoice {
  readonly object: ObjectId;
  readonly options: readonly (PlayerId | ObjectId)[];
  /** It's already attacking `options[0]`, and this is a reselection of what it
   * attacks (rule 508.7), not a creature entering attacking. */
  readonly reselect?: true;
}

/** A resolving spell or ability paused on a choice made partway through
 * ("choose a card name / a colour / a number, then …"): what its rest needs
 * to carry on as the same resolution — its controller, targets, X, trigger
 * value and object, and the stints and zones its last-known reads use. */
export interface ResolutionResume {
  readonly controller: PlayerId;
  readonly targets: ResolvedTargets;
  readonly x: number;
  readonly triggerValue: number;
  readonly triggerObject?: ObjectId;
  readonly targetZones: readonly (ZoneType | null)[];
  readonly refs: LastKnownRefs;
}

/** The choice over the cards a `discard-chosen`'s `reveals` shows: `chooser`
 * picks `picks` of them (`filter` read from their side, `optional` allowing
 * none), for the hand's owner to discard or to go to `destination`. */
export interface RevealedHandChoice {
  readonly chooser: PlayerId;
  readonly source: ObjectId;
  readonly picks: number;
  readonly filter?: CardFilter;
  readonly optional?: true;
  readonly destination?: "exile" | "library-top" | "library-bottom" | "battlefield";
  readonly exileLink?: { readonly source: ObjectId; readonly zoneChangeCount: number };
}

/**
 * One player controlling another (rule 723): `controller` makes `controlled`'s
 * decisions. Only that: every object stays with its controller and `controlled`
 * stays the active player (723.3), so the engine's rules read nothing here.
 * Who answers an action is the one thing it changes (`player-control.ts`).
 */
export interface PlayerControl {
  readonly controlled: PlayerId;
  readonly controller: PlayerId;
  /** Which of `controlled`'s turns or combat phases: the next they actually
   * take (723.1, 723.1b). `"search"`: while they search their library (rule
   * 723.2 — Opposition Agent), from the search's choice being raised to its
   * being answered. */
  readonly during: "next-turn" | "next-combat" | "search";
  /** The timestamp it was created at, against which a `"search"` control takes
   * its place: the last created works (723.1a), and Opposition Agent's control
   * was created as it entered, however late its search. */
  readonly createdAt?: number;
  /** The turn it began working, absent while it waits. It works until the next
   * turn begins, the whole of this one (723.1); `next-combat`, until that
   * combat phase ends. */
  began?: number;
  /** "After that turn, that player takes an extra turn" (Emrakul), whichever
   * effect ended up working that turn. */
  readonly extraTurnAfter?: true;
}

/** "You choose which creatures attack / block this turn" (the `choose-combat`
 * effect). */
export interface CombatChoice {
  readonly chooser: PlayerId;
  readonly attackers?: true;
  /** Whose creatures' blocks: everyone's (Master Warcraft), or the chooser's
   * opponents' (Brutal Hordechief). */
  readonly blocks?: "all" | "opponents";
  /** And those creatures block this turn if able. */
  readonly blockIfAble?: true;
  /** Only for the combat it's made in: "you choose which creatures block
   * this combat" (Odric, Master Tactician) — gone as that combat ends (rule
   * 511.3), not with the turn. */
  readonly thisCombat?: true;
}

/** One effect a player can apply first (rule 616.1): named by the card that
 * makes it. `key` says which, and is what an answer records. */
export interface ReplacementOrderOption {
  readonly key: string;
  /** The card or ability making the effect. */
  readonly name: string;
  /** What it does here: "doubles it", "prevents 3 of it". */
  readonly text: string;
  /** What comes of applying it first, when that can be said in a few words. */
  readonly result?: string;
  /** The permanent making it, where one is there to point at. */
  readonly object?: ObjectId;
  /** The player `text` ends by naming, where options differ by that (two
   * players' Notion Thieves: who ends up with the card). */
  readonly who?: PlayerId;
}

/** Where a game goes on once a `replacement-order` question is answered. */
export type ReplacementOrderResume =
  /** The resolving effect, which parked itself and asks again or goes on. */
  | { readonly site: "effect" }
  /** Combat damage, dealt once nothing more is to be asked. */
  | { readonly site: "combat-damage" }
  /** The draw that asked, made again with the answer. */
  | { readonly site: "draw"; readonly player: PlayerId }
  /** A resolved spell leaving the stack, tried again with the answer. */
  | { readonly site: "leave-stack"; readonly spell: ObjectId };

export type AwaitingDecision =
  | {
      /**
       * Which of several replacement or prevention effects applies first
       * (rule 616.1), asked of the affected player or the affected object's
       * controller, and only when the order can change what happens. Answered
       * one at a time, as 616.1f has it.
       */
      readonly kind: "replacement-order";
      readonly player: PlayerId;
      /** The event being replaced, in words. */
      readonly event: string;
      readonly options: readonly ReplacementOrderOption[];
      /** The option the engine would take: a bot's answer. */
      readonly best: number;
      /** `GameState.replacementAnswers`' key for this event. */
      readonly answers: string;
      readonly resume: ReplacementOrderResume;
    }
  | {
      readonly kind: "attackers";
      readonly player: PlayerId;
      /** "You choose which creatures attack this turn" (Master Warcraft), its
       * second step: the group that player chose, which the active player now
       * sends (its 2008 ruling; `player-control.ts`). Absent otherwise. */
      readonly group?: readonly ObjectId[];
    }
  | { readonly kind: "blockers"; readonly player: PlayerId }
  | {
      readonly kind: "discard";
      readonly player: PlayerId;
      /** How many cards must be discarded. */
      readonly count: number;
      /** True when a spell/ability caused this discard (Mind Rot), as opposed
       * to the cleanup step's max-hand-size discard. Changes what happens
       * after: an effect-discard just resumes the game, cleanup runs the rest
       * of the cleanup step. */
      readonly fromEffect?: boolean;
      /** Only these cards may be discarded — a cost that names a kind of
       * card ("Discard a creature card": Tortured Existence). Absent, any
       * card in hand. */
      readonly eligible?: readonly ObjectId[];
      /** "…unless they discard a land card" (Compulsive Research): any one
       * of these on its own is an answer, instead of `count` cards. */
      readonly orOneOf?: readonly ObjectId[];
      /** The kind of card `orOneOf` names, when it's one card type ("land",
       * "artifact"), for the prompt; absent for a richer filter. */
      readonly orOneKind?: string;
      /** "Discard any number of cards" (the `discard` effect's `anyNumber`):
       * any number up to `count` — none included. */
      readonly upTo?: true;
      /** A cost's discard (a spell's additional cost, an activated
       * ability's): who gets priority once it's answered — who cast or
       * activated (rule 117.3c), whoever's turn it is. Absent: the active
       * player, as after a resolution's discard. */
      readonly priorityTo?: PlayerId;
      /** A cost's discard: the spell or ability on the stack it pays for,
       * which remembers the cards discarded (`LastKnownRefs.discarded` —
       * "the discarded card's mana value"). */
      readonly forCost?: ObjectId;
      /** A mana ability's discard (Skirge Familiar's "Discard a card: Add
       * {B}"), as `choose-from-zone`'s: what adds its mana once it's answered. */
      readonly thenManaAbility?: {
        readonly source: ObjectId;
        readonly abilityIndex: number;
        readonly x: number;
        readonly manaColors?: readonly ManaType[];
      };
    }
  | {
      /**
       * Separate `objects` into two piles (rule 700.3) — a resolving
       * `separate-into-piles`. Each object goes into exactly one pile, and
       * either may be empty (700.3a, 700.3d). `chooser` then chooses a pile,
       * and `fates` say what happens to it and to the other. With
       * `faceDown` the first pile is face down and the second face up.
       * The answer waits in `GameState.pilesAnswer` for the effect to resume.
       */
      readonly kind: "separate-piles";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly objects: readonly ObjectId[];
      readonly chooser: PlayerId;
      /** `chooser` only stands in for an opponent to be named once the piles
       * are made ("an opponent chooses one of those piles"). */
      readonly anOpponentChooses?: true;
      readonly faceDown?: true;
      readonly fates: { readonly chosen: PileFateWord; readonly rest?: PileFateWord };
    }
  | {
      /**
       * Choose one of `piles` (rule 700.3) — the second half of a
       * `separate-into-piles`. With `faceDown`, pile 0 is face down: only
       * `lookers` (who looked at the cards) see what's in it. The answer
       * waits in `GameState.pilesAnswer`.
       */
      readonly kind: "choose-pile";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly piles: readonly (readonly ObjectId[])[];
      readonly separator: PlayerId;
      readonly faceDown?: true;
      readonly lookers: readonly PlayerId[];
      readonly fates: { readonly chosen: PileFateWord; readonly rest?: PileFateWord };
    }
  | {
      readonly kind: "choose-from-zone";
      readonly player: PlayerId;
      /** Whose the cards are when `player` chooses for someone else — an
       * opponent picking the card from your graveyard that goes to your hand
       * (Tasigur, the Golden Fang). Only what the chooser is told. */
      readonly forPlayer?: PlayerId;
      /** A search of several players' libraries at once (`search-library`'s
       * `eachLibrary` — Jace, Architect of Thought's −8): with `leftover:
       * "shuffle"`, each of these libraries is shuffled, not the chooser's. */
      readonly shufflesLibraries?: readonly PlayerId[];
      /** A search whose finds an Opposition Agent exiles: the rest of the
       * instruction can't see them there, and goes on (`then` with nothing
       * found, `GameState.unseenFinds`). */
      readonly findsUnseen?: true;
      /** A search whose finds are being exiled for several players, each of
       * whom might be the one to play them (Opposition Agent, of two players):
       * once they're in exile, `chooser` says which for each (rule 616.1, the
       * ruling). `impulseGrant` has the first meanwhile. */
      readonly searchExileChoice?: {
        readonly chooser: PlayerId;
        readonly source: ObjectId;
        readonly players: readonly PlayerId[];
        readonly spendAs?: SpendAs;
      };
      /** A search of a library that "can't" be searched (`cantSearchLibraries`):
       * with nothing else found there's nothing to look at or answer, so it's
       * answered for them (`forcedZoneChoice`). */
      readonly searchForbidden?: true;
      /** A search whose library is shuffled later (`search-library`'s
       * `shufflesLater`): `leftover` says "stay", but what's chosen is a
       * search's find, and waits as one while choices are held. */
      readonly shufflesLater?: true;
      /** Candidates already revealed to `player`, in their original zone order. */
      readonly ids: readonly ObjectId[];
      /** The subset of `ids` that may actually be chosen — narrower than
       * `ids` when the effect restricts the choice (e.g. only a Dragon card),
       * equal to `ids` when it doesn't. Everything in `ids` is revealed
       * either way; this only bounds the choice itself. */
      readonly eligible: readonly ObjectId[];
      readonly min: number;
      readonly max: number;
      /** `"library-top"` — a tutor-to-top (Vampiric Tutor): the chosen cards
       * never leave the library, they are moved to the top after the search's
       * own shuffle. `"library-top"` and `"library-bottom"` both place the
       * chosen cards in the order chosen, the first chosen nearest the top
       * (rule 401.4). `"exile"`: exiled face up — an activated ability's
       * "Exile two cards from your graveyard" cost (`AbilityCost.exileFromGraveyard`),
       * or imprint's "exile a card from your hand" (Chrome Mox), linked to its
       * source through `exileLink`. */
      readonly destination:
        | "battlefield"
        | "hand"
        | "exile"
        | "exile-playable"
        | "exile-face-down"
        | "manifest"
        | "cloak"
        | "library-top"
        | "library-bottom"
        | "graveyard"
        | "behold"
        /** The chosen cards are revealed (rule 701.20a) and stay in the hand
         * — `look-and-choose`'s `"reveal"` (the Scents). */
        | "reveal"
        /** The hand's owner (`forPlayer`) discards the chosen cards — the
         * `discard-chosen` effect (Duress). */
        | "discard"
        /** The chosen cards don't move; `then` acts on them where they are —
         * a `search-library`'s `"stay"` (Knowledge Exploitation). */
        | "stay";
      /** What the choice is for, shown instead of what `destination` says —
       * see the offer's `prompt`. */
      readonly prompt?: string;
      /** The `ids` are a discard waiting on {@link DiscardToLibraryReplacement}:
       * the chosen cards go on top of the library, the first nearest the top
       * (rule 401.4), the rest as a discard otherwise would, one
       * `cards-discarded` for them all. `reveal`: Nephalia Academy's. */
      readonly discardToLibrary?: { readonly cause?: PlayerId; readonly reveal?: true };
      /** The cards picked are at stake — see the offer's `givesUp`. */
      readonly givesUp?: true;
      /** Set for a `choose-among-targets` choice (Barrin's Spite, Wake to
       * Slaughter) among cards in a graveyard: nothing moves by
       * `destination` (`"stay"`); what's picked is collected in
       * `GameState.keptByChoice` for the resolving effect, which resumes
       * once it's answered — as a `choose-permanents`' `keepChoice` is. */
      readonly keepChoice?: true;
      /** Cards that go with the chosen ones whatever is picked — a
       * `search-library`'s `all`: the matches in a graveyard, a public zone,
       * which must be found (rule 701.23b), while the hidden zones' are
       * `eligible`. Not in `ids`. */
      readonly alsoTaken?: readonly ObjectId[];
      /** "That player" of `then` (`LastKnownRefs.player`): whose zones a
       * `search-library` with `whose` searched, or the player a
       * `for-each-player` around a `look-and-choose` is about. */
      readonly thenPlayer?: PlayerId;
      /**
       * A behold (rule 701.4a — `Game.beginBehold`): `ids` are cards in
       * `player`'s hand and permanents they control, both at once, and the
       * answer is carried out by `Game.applyBehold` rather than moved by
       * `destination` — `"behold"`, or `"exile"` for "behold … and exile it"
       * (linked through `exileLink`, rule 607.2q). A card chosen from the
       * hand is revealed to every player. `then` (the first beheld object
       * its target 0, applied from `source` with `x`) follows; `enterOf` is
       * the land whose "you may behold" as it enters this asks
       * (`tappedUnlessBehold`), which records the answer instead.
       */
      readonly behold?: {
        readonly source: ObjectId;
        readonly x: number;
        readonly then?: EffectSpec;
        readonly enterOf?: ObjectId;
        /** A pitch cost's "exile a blue card from your hand" (`BeholdSpec.fromHand`):
         * hand cards only, nothing revealed, and asked as a plain exile. */
        readonly fromHand?: true;
        /** The spell or ability on the stack whose cost this is: it
         * remembers the cards revealed from the hand
         * (`LastKnownRefs.revealed` — "the revealed card's power"). */
        readonly forCost?: ObjectId;
      };
      /** A collect evidence N (rule 701.59a — `Game.beginCollectEvidence`):
       * the chosen graveyard cards are exiled by `destination` and, if any
       * were, an `evidence-collected` event follows (before `then`). */
      readonly collectEvidence?: number;
      /** That collecting can't be declined (the `collect-evidence` effect's
       * `required`): the event follows even with nothing exiled, which is
       * collecting evidence 0 (Incinerator of the Guilty's ruling). */
      readonly collectEvidenceRequired?: true;
      /**
       * Only an **order** is asked: every card in `ids` is picked, and the
       * order picked is where each goes (rule 401.4 — the owner arranges
       * cards put into a library at the same time). Raised by
       * `Game.beginLibraryOrder` for "the rest on the bottom of your library
       * in any order" (a `look-and-choose`'s `"bottom-any-order"`) and a
       * scry's or surveil's cards kept on top or put on the bottom (rules
       * 701.22a, 701.25a). Nothing is taken, so no `cards-chosen-from-zone`.
       */
      readonly order?: true;
      /** With `order` and `destination: "library-top"`: the cards go **Nth
       * from the top** instead, the first chosen there and the rest beneath
       * it in order (Riptide Gearhulk's "third from the top", several of one
       * owner's at once — rule 401.4). */
      readonly libraryFromTop?: number;
      /** An `order` over cards in `player`'s own graveyard, which stay there:
       * rule 404.3's "the owner of those cards may arrange them in any order",
       * or Fossil Find's "reorder your graveyard as you choose". The first
       * picked goes on top (`Game.arrangeGraveyard`). */
      readonly arrangesGraveyard?: true;
      /** Cards to ask the order of once this choice is carried out — a scry
       * that both keeps cards on top and puts cards on the bottom orders the
       * two groups one after the other (rule 701.22a). */
      readonly thenOrder?: { readonly cards: readonly ObjectId[]; readonly position: "top" | "bottom" };
      /** A cost's choice (`AbilityCost.exileFromGraveyard`): who gets
       * priority once it's paid — the player who activated the ability (rule
       * 117.3c), whoever's turn it is. Absent: the active player, as after a
       * resolution's choice. */
      readonly priorityTo?: PlayerId;
      /** A cost's exile: the spell or ability on the stack this pays for,
       * which remembers the cards (`LastKnownRefs.sets.paid.exiled`). */
      readonly costExileFor?: ObjectId;
      /** A mana ability's cost (Cadaverous Bloom's "Exile a card from your
       * hand"), which never goes on the stack (rule 605.3b): what's needed to
       * add its mana once this is answered. */
      readonly thenManaAbility?: {
        readonly source: ObjectId;
        readonly abilityIndex: number;
        readonly x: number;
        readonly manaColors?: readonly ManaType[];
        /** This choice is the mana ability's own first step, a reveal from
         * the hand (`add-mana`'s `first` — Metalworker's "Reveal any number
         * of artifact cards in your hand"), not a cost: the `eventSeq` it
         * was asked at, from which its mana reads "revealed this way". */
        readonly revealSince?: number;
      };
      /** For `destination: "exile-face-down"` (hideaway — rule 702.75a) and
       * `"exile"` (imprint, face up): the permanent, in the stint it's in,
       * the chosen cards are exiled with (rule 607.2a — `GameObject.exiledWith`). */
      readonly exileLink?: { readonly source: ObjectId; readonly zoneChangeCount: number };
      /** For `destination: "exile-face-down"`: see `look-and-choose`'s
       * `faceDownLooks`. */
      readonly faceDownLooks?: "chooser" | "nobody";
      /** A look they close at face-down permanents (`ids`, nothing to pick —
       * the `look-at-face-down` effect): the chooser is shown what they are
       * until they close it, and only then (rule 708.5; Smoke Teller's ruling:
       * "it doesn't let you look at it later"). */
      readonly looksAtFaceDown?: true;
      /** For a `choose-exiled-card`: nothing moves (`"stay"`); the card picked
       * is what this permanent has now chosen (`GameObject.chosenExiledCard`). */
      readonly rememberExiledOn?: ObjectId;
      /** For `destination: "exile"`: counters the chosen card gets there —
       * Mairsil, the Pretender's "and put a cage counter on it". */
      readonly exileWithCounters?: { readonly kind: string; readonly amount: number };
      /** For `destination: "exile"`: "exile that card **until this creature
       * leaves the battlefield**" (Kitesail Freebooter) — `exiledUntil` for
       * the chosen card. */
      readonly exileUntil?: NonNullable<GameObject["exiledUntil"]>;
      /** For `destination: "exile-playable"` — the permission to stamp on
       * the chosen cards, which stay in exile either way (Tectonic Giant:
       * "exile the top two, choose one of them"). */
      readonly playGrant?: CardPlayPermission;
      /** What happens to any candidate not chosen: shuffled to the bottom of
       * the library; left exactly where it already was (nothing was ever
       * moved just to look at it — the graveyard-search case); the whole
       * library is shuffled (a library *search* / tutor — rule 701.23); or
       * put into the chooser's hand (Genesis Ultimatum — needed-cards P19).
       * `"bottom-any-order"`: on the bottom in an order the chooser picks
       * next (`Game.beginLibraryOrder`); `"top-any-order"`: left on top, in an
       * order the chooser picks next. */
      readonly leftover:
        | "bottom-random"
        | "bottom-any-order"
        | "top-any-order"
        | "stay"
        | "shuffle"
        | "hand"
        | "graveyard"
        /** Exiled face up, linked to nothing (Clear the Land's "and exiles
         * the rest"). */
        | "exile"
        | "exile-playable";
      /** For `leftover: "exile"`: counters each card left over gets there —
       * the `look-and-choose` effect's `leftoverCounters`. */
      readonly leftoverCounters?: { readonly kind: string; readonly amount: number };
      /** Where the rest go instead when a condition holds once the chosen
       * cards have moved — the `look-and-choose` effect's `leftoverIf`, asked
       * of `thenSource`. */
      readonly leftoverIf?: LookAndChooseLeftoverIf;
      /** A second choice over the cards this one leaves, asked once this
       * one's cards have moved; `leftover` waits for it (the
       * `look-and-choose` effect's `secondPick`). */
      readonly secondPick?: ZoneSecondPick;
      /** A library-search result that enters the battlefield does so tapped
       * (Rampant Growth). Only meaningful with `destination: "battlefield"`. */
      readonly enterTapped?: boolean;
      /** …and attacking (rule 508.4 — a `look-and-choose`'s `attacking`):
       * Kaalia of the Vast, Winota. Only meaningful with `destination:
       * "battlefield"`. */
      readonly enterAttacking?: ResolvedEnterAttacking;
      /** Battlefield-bound cards enter under this player's control — a
       * `look-and-choose` over every graveyard (Necromantic Selection). */
      readonly enterUnder?: PlayerId;
      /**
       * Face-down cards in exile among the candidates (rule 406.3), grouped
       * by what exiled them face down and when (`faceDownExileGroup`): a
       * processor's "put a card an opponent owns from exile into that
       * player's graveyard" may take one, but choosing one is choosing its
       * group, and the card is then taken from that group **at random** (the
       * processors' ruling). Each group's cards are all in `eligible`, hidden
       * from a chooser who may not look at them; a pick of any of them is
       * carried out on a random card of its group not already taken
       * (`Game.applyChooseFromZone`).
       */
      readonly faceDownGroups?: readonly (readonly ObjectId[])[];
      /** Battlefield-bound cards enter attached to this — a
       * `search-library`'s `attachedToSource` (Light-Paws, Emperor's Voice)
       * or `attachedTo`, a `look-and-choose`'s `attachedTo`: see
       * {@link EnterAttachHost}. An Aura that can't be attached to it stays
       * where it is; `null`, nothing can (the source has left). */
      readonly enterAttachedTo?: EnterAttachHost;
      /** Cards that enter with this choice's finds, in one event, whatever is
       * found: a `search-library`'s `alongExiledThisWay`. */
      readonly enterAlong?: readonly ObjectId[];
      /** …with these types and colours in addition to their own, in place as
       * they enter (a `look-and-choose`'s `enterAs`). */
      readonly enterAs?: EnterTypes;
      /** Counters each card put onto the battlefield enters with — a
       * `return-from-graveyard`'s `withCounters`. */
      readonly enterWithCounters?: { readonly kind: string; readonly amount: number };
      /** The chosen cards are shown to every player ("search your library for
       * an artifact card, **reveal it**, …" — Enlightened Tutor). */
      readonly reveal?: boolean;
      /** Applied once the choice is answered, with the chosen cards as its
       * targets — see the `look-and-choose` effect's `then`. `thenSource` and
       * `thenX` rebuild the resolution context, since the spell that set this
       * up has finished resolving by then. */
      readonly then?: EffectSpec;
      readonly thenSource?: ObjectId;
      readonly thenX?: number;
      /** The battlefield stint of `thenSource` the resolution referred to
       * (`LastKnownRefs.source`), so a `then` reading the source after it has
       * left reads it as it last was there (rule 608.2h — Caustic Bronco's
       * "if this creature isn't saddled"). */
      readonly thenSourceStint?: number;
      /** Where every *chosen* card after the first goes, when a tutor splits
       * its finds across two zones (Cultivate: "put one onto the battlefield
       * tapped and the other into your hand"). Absent means every chosen card
       * goes to `destination`. Distinct from `leftover`, which is about cards
       * that were **not** chosen. */
      readonly restDestination?: "battlefield" | "hand";
      /** A search's `inAnyOrder`: its finds, on top of the library once this
       * is answered, have their order asked next. */
      readonly findsInAnyOrder?: true;
      /** A library search whose finds go card by card (`search-library`'s
       * `instead`): this choice only picks them — `destination` is
       * `"stay"` and nothing is shuffled yet — and its answer raises the
       * second choice, over the finds, of which go to `instead`'s
       * destination (`searchRest` on it). `to`/`toTapped`: where the others
       * go, the search's own destination; `shuffle`: whose library to
       * shuffle once they've moved (none for a graveyard alone). */
      readonly searchInstead?: ResolvedSearchInstead & {
        readonly to: "battlefield" | "hand" | "graveyard";
        readonly toTapped?: true;
        readonly shuffle: PlayerId | null;
        readonly x: number;
      };
      /** That second choice: the cards picked go to `destination`, every
       * other card of `ids` to `searchRest.destination` (entering tapped
       * with `enterTapped`, under their owner's control), and then
       * `shuffle`'s library is shuffled (rule 701.24a). The picks were
       * announced by the first choice. */
      readonly searchRest?: {
        readonly destination: "battlefield" | "hand" | "graveyard";
        readonly enterTapped?: true;
        readonly shuffle: PlayerId | null;
      };
      /** A rule the chosen cards must obey as a set — a `search-library`'s
       * `together` (Myriad Landscape's "that share a land type"). */
      readonly together?: ZoneChoiceTogether;
      /** Where each chosen card goes by what it is — a `look-and-choose`'s
       * `split` (Zimone's Experiment), read as the cards move. */
      readonly split?: readonly ZoneChoiceSplitCase[];
      /** Before turn 1 (rule 103.6a — `Game.beginOpeningHandActions`): which
       * of `player`'s opening-hand cards that may begin the game on the
       * battlefield do — or, with `destination` `"reveal"`, which to reveal
       * for their delayed abilities (`CardDefinition.openingHandReveal`), or,
       * with `"exile"`, which card a begun card's "if you do, exile a card
       * from your hand" takes (Gemstone Caverns).
       * `next` is the next question, counted two a player from the starting
       * player. */
      readonly openingHand?: { readonly next: number };
      /** Before the opening hands (rule 103.2b — `Game.beginCompanionReveals`):
       * which of `player`'s cards from outside the game to reveal as their
       * companion, none or one. `next` is the next player to ask, counted from
       * the starting player (the rulings); `opening` is how the hands are dealt
       * after the last, or `null` for a board that's asking outside a game's
       * start (the scenario builder). */
      readonly companion?: { readonly next: number; readonly opening: "mulligans" | "hands" | null };
      /** An entering permanent's amplify (rule 702.38a —
       * `CardDefinition.amplify`): `ids` are the cards in `player`'s hand
       * that share a creature type with it, and the answer is how many are
       * revealed (`destination: "reveal"`), recorded on it
       * (`enterChoice.amplified`) for its counters as it enters. */
      readonly amplifyOf?: ObjectId;
      /** The permanent about to enter as a copy of a card in a graveyard or
       * exile (`CopyOnEnter.from`, rule 707.9): `ids` are the cards it may
       * copy, nothing moves, and the answer — up to one, none being "copy
       * nothing" — is recorded on it (`enterChoice.copyOf`) as a `choose-copy`
       * would be, for a client to pick from a popup rather than the board. */
      readonly copyOnEnterOf?: ObjectId;
      /** The permanent about to enter whose `CopyOnEnter.exileFirst` asks
       * which cards to exile before it copies one of them (The Mimeoplasm):
       * `max` of them are exiled now, fewer declining, and recorded on it
       * (`enterChoice.copyExiled`). */
      readonly copyExileOf?: ObjectId;
      /** The permanent about to enter whose `EnterInstead` asks for a discard
       * (Mox Diamond): `ids` are the cards in `player`'s hand that may be
       * discarded, and choosing none is declining, recorded on it
       * (`enterChoice.insteadDone`). */
      readonly insteadOfEnteringOf?: ObjectId;
      /** The permanent about to enter whose `AsEntersAction` exiles cards from
       * a graveyard: what's chosen is exiled now, and linked to it as it enters.
       * With `destination: "discard"`, its `discard`: what's chosen is
       * discarded now. */
      readonly asEntersOf?: ObjectId;
      /** A `discard-chosen`'s `reveals` — "target player reveals three cards
       * from their hand and you choose one of them" (Blackmail): `player`
       * picks which cards of their hand to show (`destination: "reveal"`,
       * exactly that many), and this is the choice that follows over the
       * cards revealed (`Game.beginRevealedChoice`). */
      readonly thenChooseFromRevealed?: RevealedHandChoice;
    }
  | {
      /**
       * The pre-turn-1 mulligan phase (London style). Unlike every other
       * decision this one is **parallel** — every player in `hands` may act
       * right now, in any order, not turn order (rule 103.4 — players don't
       * wait on each other). `player` is just the lowest-turn-order player
       * still to act, for generic `awaiting.player` consumers. A player is
       * removed from `hands` once they've kept (and bottomed, if they took
       * any mulligans); the phase ends and turn 1 begins when `hands` is
       * empty.
       */
      readonly kind: "mulligan";
      readonly player: PlayerId;
      readonly hands: Readonly<Record<string, MulliganHandState>>;
    }
  | {
      /**
       * A commander's owner may put it into the command zone (rule 903.9).
       * `intendedZone` is where it stays, or goes, if they don't:
       * - `"graveyard"` / `"exile"`: it's already there. Rule 903.9a makes
       *   this a state-based action, so it died (or was exiled) first, and
       *   everything that sees a creature die saw it.
       * - `"hand"` / `"library"`: it hasn't moved yet. Rule 903.9b is a
       *   replacement effect, so it waits where it was — on the battlefield,
       *   or for a return to hand, on the stack or in a graveyard or exile —
       *   until this is answered. `fromCommandZone`: it's in the command
       *   zone itself ("from anywhere" — Command Beacon, Campfire), and
       *   choosing the command zone leaves it there, no zone change.
       */
      readonly kind: "commander-replacement";
      readonly player: PlayerId;
      readonly commander: ObjectId;
      readonly intendedZone: CommanderReplacementZone;
      readonly fromCommandZone?: true;
    }
  | {
      /** A "shock land" (rule 614.13) just entered: its controller may pay
       * `life` life to have it enter untapped, otherwise it stays tapped. The
       * land is already on the battlefield (tapped) — answering yes untaps it
       * and deducts the life. */
      readonly kind: "pay-life-for-untapped";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly life: number;
    }
  | {
      /** Miracle (rule 702.94a): `player` drew `source`, a card with
       * miracle, as the first card they drew this turn — reveal it, so its
       * trigger goes on the stack and may cast it for `cost`? Asked as the
       * trigger would be placed (`decisions/miracle-reveal.ts`). */
      readonly kind: "miracle-reveal";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly cost: string;
    }
  | {
      /** A "reveal land" (Port Town: "As this land enters, you may reveal a
       * Plains or Island card from your hand. If you don't, this land enters
       * tapped") is about to enter; its controller picks which of `options`,
       * the qualifying cards in their hand, to reveal, or none. Asked before
       * it moves (`Game.askEnterChoice`, rule 614.12). */
      readonly kind: "reveal-for-untapped";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly options: readonly ObjectId[];
    }
  | {
      /** A Clone-style permanent is about to enter; its controller chooses
       * what (if anything) it enters as a copy of (rule 707.9) — asked before
       * it moves, see `Game.askEnterChoice`. */
      readonly kind: "choose-copy";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly options: readonly ObjectId[];
      /** Asked as the face-down `source` is turned face up, not as it enters
       * (`CopyOnEnter.orTurnedFaceUp`, rule 708.11): it's turned once this is
       * answered, as `Game.becomeFaceUp` was asked to turn it — `player` the
       * one turning it, `megamorph` and `x` its cost's, `priorityTo` who has
       * priority after. */
      readonly faceUp?: {
        readonly player: PlayerId;
        readonly megamorph: boolean;
        readonly x: number;
        readonly priorityTo?: PlayerId;
      };
    }
  | {
      /** An Aura is about to enter the battlefield other than by resolving
       * as an Aura spell, with nothing saying what it enchants: the player
       * it's entering under chooses, from `options` — every permanent it
       * could legally enchant (rule 303.4f). Asked before it moves, see
       * `Game.askEnterChoice`; with nothing to choose from it isn't asked,
       * and the Aura stays where it was (303.4g). */
      readonly kind: "choose-enchant";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly options: readonly ObjectId[];
      /** The players an "Enchant player" Aura could enchant instead (rule
       * 303.4f — a Curse returned to the battlefield). Absent when none. */
      readonly players?: readonly PlayerId[];
    }
  | {
      /** The legend rule (704.5j): `player` controls two or more legendary
       * permanents named `name` — `options`, the one they've controlled
       * longest first — and chooses the one to keep; the rest are put into
       * their owners' graveyards. Asked by the state-based check before
       * anything moves, which performs every move it finds once each such
       * choice is made (704.3). */
      readonly kind: "legend-rule";
      readonly player: PlayerId;
      readonly name: string;
      readonly options: readonly ObjectId[];
    }
  | {
      /** Rule 603.3b: `player` puts their simultaneous triggered abilities
       * on the stack in any order they choose. Asked only of a player who
       * orders their own (`GameState.ordersOwnTriggers`), and only when two
       * or more of theirs are waiting and they aren't all the same ability;
       * otherwise the engine's own order stands. `triggers` is that order,
       * the one that would resolve first first. */
      readonly kind: "order-triggers";
      readonly player: PlayerId;
      readonly triggers: readonly TriggerOrderEntry[];
    }
  | {
      /**
       * Choose one of `options`. Two quite different uses share this shape:
       *
       * - A **creature type** (`catalog: true`, `options` is every creature
       *   type — rule 205.3m). Either as a permanent enters (Urza's
       *   Incubator: `source`'s `chosenCreatureType` is set) or as a spell
       *   resolves (Crippling Fear: `then` is applied with the answer
       *   substituted in, against `targets` and `x`).
       * - A **short fixed menu** (`catalog: false`) for "as this enters,
       *   choose …" — Heraldic Banner's colours, Frontier Siege's
       *   Khans/Dragons. Recorded on `source.chosenOnEnter`.
       *
       * `catalog` is what lets a client offer a searchable picker for the one
       * and plain buttons for the other.
       */
      readonly kind: "choose-creature-type";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly options: readonly string[];
      readonly catalog: boolean;
      /** The hand the chooser looked at for this choice (Arachne, Psionic
       * Weaver's "look at an opponent's hand, then choose a card type" —
       * `CardDefinition.chooseOnEnterLook`): visible to them alone, like a
       * `choose-card-name`'s. */
      readonly looked?: readonly ObjectId[];
      /** Riot's "+1/+1 counter or haste" as `source` is about to enter (rule
       * 702.136a): the answer is recorded as its riot choice rather than as
       * a chosen word. */
      readonly riot?: true;
      /** Unleash's "you may have it enter with an additional +1/+1 counter"
       * as `source` is about to enter (rule 702.98a): the first option takes
       * the counter. */
      readonly unleash?: true;
      /** "You may have this land enter tapped. If you do, …" as `source` is
       * about to enter (`EntersBattlefieldReplacement.mayEnterTapped`): the
       * second option has it enter tapped. `prompt` is the ability's text. */
      readonly enterTapped?: true;
      /** The kind of counter it enters with for one card its `AsEntersAction`
       * exiled (`counterForEach` — Frankenstein's Monster). */
      readonly asEntersCounter?: true;
      /** A battle's protector, chosen as `source` is about to enter (rule
       * 310.9a) — `options` are the players who may be, and the answer is
       * recorded as its protector (or, with `protectorFor` set, a battle
       * already on the battlefield gets a new one — 310.11). */
      readonly protector?: true;
      readonly protectorFor?: ObjectId;
      /** Tribute as `source` is about to enter (rule 702.104a): `"opponent"`
       * — its controller chooses the opponent among `options`; `"pay"` —
       * that opponent answers whether to put the counters on it (the first
       * option pays). */
      readonly tribute?: "opponent" | "pay";
      /** The opponent whose hand `source`'s controller looks at before
       * naming a card as it enters (`CardNameOnEnter.look`) — `options` are
       * the opponents. */
      readonly lookAt?: true;
      /** "As this enters, choose a player / an opponent"
       * (`CardDefinition.choosePlayerOnEnter`) — `options` are the players
       * who may be chosen, recorded as `enterChoice.chosenPlayer`. */
      readonly choosePlayer?: true;
      /** With `choosePlayer`: the **second** of "choose two players"
       * (`CardDefinition.chooseTwoPlayersOnEnter`), recorded as
       * `enterChoice.otherChosenPlayer`. */
      readonly secondPlayer?: true;
      /** "**Secretly** choose …": the answer stays out of the log (a
       * `secret-choice-made` event names who chose, not what) and, with
       * `remember` or `choosePlayer`, is marked `GameObject.secretChoice`. */
      readonly secret?: true;
      /** A resolving effect's answer is kept on `source` while it's still the
       * permanent that asked (`stint` — rule 400.7): as
       * `GameObject.chosenPlayer`, or as its `chosenCreatureType`. */
      readonly remember?: { readonly stint: number; readonly as: "player" | "creature-type" };
      /** What a turn about to begin comes to (rule 614.10 — `Game.askTurnBegin`):
       * this source's "you may skip that turn" (Time Vault), the first option
       * taking the turn; or, with `owed`, whether the skip this player owes is
       * used on a turn this source skips anyway (rule 616.1), the first option
       * using it. `occurrence` counts the turns that would begin from now. */
      readonly turnSkip?: { readonly occurrence: number; readonly owed?: true };
      /** What the choice is, in words, for a menu that needs saying. */
      readonly prompt?: string;
      readonly then?: EffectSpec;
      readonly targets?: ResolvedTargets;
      readonly x?: number;
      /** A `choose-value` effect's colour, card type or counter kind: the
       * placeholder the answer replaces in `then` (`CHOSEN_COLOR`,
       * `CHOSEN_CARD_TYPE`, `CHOSEN_COUNTER`), and the whole resolution to
       * resume — `targets` and `x` above are left unset. */
      readonly value?: {
        readonly sentinel: string;
        readonly resume: ResolutionResume;
        /** The number each option stands for, which `then` reads as its `"x"`
         * rather than through `sentinel` (`choose-value`'s
         * `"commander-mana-value"`). */
        readonly xByOption?: Readonly<Record<string, number>>;
      };
      /** The placeholder the answer goes into in `then`, when it isn't
       * `CHOSEN_CREATURE_TYPE`: a choice with a second nested inside it (Vision
       * Charm). */
      readonly sentinel?: string;
    }
  | ({
      /**
       * Choose a number as a spell or ability resolves (a `choose-value`
       * effect of `value: "number"` — Void's "choose a number", Squee's
       * Revenge): any whole number from `min`, up to `max` when there is one.
       * Resolution resumes with `then`, the answer read there as `"x"`.
       *
       * Or, with `assist`, how much of a spell's generic mana the player its
       * caster chose pays (rule 702.132a): `source` is the spell, from 0 up
       * to `max`, and the cast goes on with that much paid for its caster.
       *
       * Or, with `placeCopy`, where an additional copy of a spell goes among
       * the others its instruction made (the Twinning Staff rulings): `source`
       * is the additional copy, and the answer is how many of them it goes
       * under.
       */
      readonly kind: "choose-number";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly min: number;
      readonly max?: number;
      readonly prompt?: string;
    } & (
      | {
          readonly then: EffectSpec;
          readonly resume: ResolutionResume;
          readonly assist?: undefined;
          readonly placeCopy?: undefined;
          /** Keep the answer on `source` too, while it's still the permanent
           * of this stint (`GameObject.chosenOnEnter`) — Shapeshifter. */
          readonly remember?: { readonly stint: number };
        }
      | {
          readonly assist: AssistAsk;
          readonly then?: undefined;
          readonly resume?: undefined;
          readonly placeCopy?: undefined;
          readonly remember?: undefined;
        }
      | {
          /** The other copies, still on the stack as this is asked. */
          readonly placeCopy: { readonly among: readonly ObjectId[] };
          readonly assist?: undefined;
          readonly then?: undefined;
          readonly resume?: undefined;
          readonly remember?: undefined;
        }
    ))
  | {
      /**
       * Choose a card name (rule 201.4): any name the registry has that
       * `filter` allows (`nameableCardNames`), or, with `options`, one of
       * those alone (Alhammarret, High Arbiter's "the name of a nonland card
       * revealed this way"). The catalogue is worked out for the chooser in
       * `legalActions`, never stored here, where every seat would receive it.
       *
       * Either as `source` is about to enter (`onEnter` — Pithing Needle: the
       * answer waits on it as `enterChoice.chosenName`), or as a spell or
       * ability resolves (`then`, with `CHOSEN_CARD_NAME` substituted in,
       * against `targets` and `x`; `remember` also keeps the name on
       * `source` — Petrified Hamlet's enters trigger).
       */
      readonly kind: "choose-card-name";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly filter?: CardNameFilter;
      readonly options?: readonly string[];
      readonly aim: CardNameAim;
      /** The cards the chooser looked at for this choice (Sorcerous
       * Spyglass's "look at an opponent's hand"): visible to them alone,
       * like a `choose-from-zone`'s, and suggested first. */
      readonly looked?: readonly ObjectId[];
      readonly onEnter?: true;
      readonly then?: EffectSpec;
      /** Keep the name on `source` too, while it's still the permanent of
       * this stint (`GameObject.chosenNames`). */
      readonly remember?: { readonly stint: number };
      /** The resolution `then` carries on: its controller (who may not be
       * the chooser — Vexing Arcanix's target player names the card), targets,
       * X and the rest of what it read. */
      readonly resume?: ResolutionResume;
    }
  | {
      /** A scry / surveil (rule 701.18 / 701.43): `player` has looked at the
       * top `cards` of their library and chooses which to move away — to the
       * bottom (scry) or the graveyard (surveil); the rest stay on top in
       * their current order (the "reorder the ones you keep" clause isn't
       * modeled). `then`, if set, is applied afterwards (Preordain's draw). */
      readonly kind: "scry";
      readonly player: PlayerId;
      readonly cards: readonly ObjectId[];
      readonly mode: "scry" | "surveil";
      readonly then: EffectSpec | null;
      readonly source: ObjectId;
      readonly x: number;
    }
  | {
      /** A sacrifice *effect* (Diabolic Edict, Fleshbag Marauder) — `player`
       * chooses `count` of `eligible` permanents they control to sacrifice
       * (rule 701.16). Only raised when there's an actual choice (they
       * control more than `count` matches). */
      readonly kind: "sacrifice";
      readonly player: PlayerId;
      readonly count: number;
      readonly eligible: readonly ObjectId[];
      /** The creature whose exploit ability asked (rule 702.110b) — see
       * `pendingSacrifices`. */
      readonly exploitedBy?: ObjectId;
    }
  | {
      /**
       * Proliferate (rule 701.27): `player` chooses **any number** of
       * permanents and/or players that have counters on them, and each chosen
       * one gets another counter of each kind already there.
       *
       * "Any number" is the whole decision and the reason this is a decision
       * at all. The engine used to proliferate every permanent on the
       * battlefield, which grew opponents' creatures and topped up their
       * planeswalkers — not a simplification of the card but a different and
       * often worse one. Choosing nothing is a legal answer.
       *
       * `eligible` is everything with at least one counter *right now*,
       * permanents in battlefield order followed by any player holding energy
       * counters (rule 122 — energy is a counter a player has, and
       * proliferate does reach it).
       */
      readonly kind: "proliferate";
      readonly player: PlayerId;
      readonly eligible: readonly TargetRef[];
      /** How many more times they proliferate after this one (Tekuthal's
       * `would-proliferate`), `then` waiting until the last. */
      readonly more?: number;
      /** Applied once answered — Contentious Plan's "Proliferate. Draw a
       * card." `source`/`x` rebuild the resolution context, exactly as
       * `scry`'s `then` does, because the spell that set this up has finished
       * resolving by the time the choice comes back. */
      readonly then: EffectSpec | null;
      readonly source: ObjectId;
      readonly x: number;
    }
  | {
      /**
       * Time travel (rule 701.56a): `player` looks at each permanent they
       * control with a time counter on it and each suspended card they own
       * with one, and for each chooses to put a time counter on it, remove
       * one, or neither — then the changes all happen at once (the
       * rulings). One decision for all of them, so nothing happens between
       * the choices. The rest of a resolving instruction ("Time travel.
       * Draw a card.") waits as a suspended resolution does.
       */
      readonly kind: "time-travel";
      readonly player: PlayerId;
      readonly eligible: readonly ObjectId[];
      readonly source: ObjectId;
    }
  | {
      /**
       * Which counters to remove, and from what — "Remove a +1/+1 counter
       * from a creature you control" (Ghave, Guru of Spores), "Remove three
       * counters from among creatures you control" (Tayam), "remove up to
       * four charge counters from target artifact" (Gremlin Mine). Asked as a
       * cost is paid (`AbilityCost.removeCounter` with `from` or a kind of
       * `"any"` — rules 602.2b, 601.2h: the ability is on the stack, nobody
       * has priority, `priorityTo` gets it once it's answered) or as a
       * `remove-counters` effect resolves (the rest of the resolution waits,
       * as a suspended one does).
       *
       * The answer removes between `min` and `max` counters in all, each of
       * a kind in `kinds` (`null`: any kind) from one of `eligible`, no more
       * of a kind from an object than it has; `single` puts them all on one
       * object ("from a creature"), `perObject` caps each object's share
       * (Garnet's "a lore counter from each of any number of Sagas").
       */
      readonly kind: "remove-counters";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly eligible: readonly ObjectId[];
      readonly kinds: readonly string[] | null;
      readonly min: number;
      readonly max: number;
      readonly single?: true;
      readonly perObject?: number;
      readonly prompt: string;
      /** Set when it pays a cost: who gets priority once it's answered. */
      readonly priorityTo?: PlayerId;
    }
  | {
      /**
       * A venture's choice (rule 701.49): which dungeon to enter (`dungeons`
       * — 701.49a, c), or, at a fork, which room to move into (`rooms`, by
       * index into `dungeon`'s rooms, from room `from` — 701.49b). Exactly
       * one of the two is set. `source` is the spell or ability that made
       * `player` venture. The rest of a resolution waits on it as a
       * suspended one does.
       */
      readonly kind: "venture";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly dungeons?: readonly string[];
      readonly dungeon?: string;
      readonly from?: number;
      readonly rooms?: readonly number[];
    }
  | {
      /**
       * "Add N mana in any combination of …" with too many splits to list as
       * modes (Klauth, Unrivaled Ancient's power-sized attack trigger):
       * `player` says how many of each of `colors`, summing to `amount` —
       * one decision, where each unit's colour used to be asked in turn
       * (`effects.ts`' `addManaChoice`; rule 608.2d, chosen as it's added).
       */
      readonly kind: "split-mana";
      readonly player: PlayerId;
      readonly colors: readonly ManaType[];
      readonly amount: number;
      /** What every colour's share carries: a spend restriction, `persists`
       * (`ManaSplitRiders`). */
      readonly riders: ManaSplitRiders;
      /** The rest of the instruction, applied once answered, in a context
       * rebuilt from `source`/`x` as `proliferate`'s `then` is. */
      readonly then: EffectSpec | null;
      readonly source: ObjectId;
      readonly x: number;
    }
  | {
      /**
       * Permanents chosen as an effect resolves, with no targeting — "untap
       * up to two lands" (the `choose-permanents` effect: Snap, Frantic
       * Search). `player` picks from `min` to `max` of `eligible`, and
       * `then` is applied to each one picked, as target 0, in the order
       * picked; `source`/`x` rebuild the resolution context for it, as
       * `proliferate`'s do. A compacted token stack is one entry that may be
       * named up to its size.
       */
      /** Creatures this player put onto the battlefield attacking, each with
       * a choice of what it attacks (rule 508.4): a defending player, or a
       * planeswalker one controls — unless the effect named the player, when
       * it's that player or their planeswalkers. Asked only where there's a
       * real choice; each is attacking its first option until answered. */
      readonly kind: "enter-attacking";
      readonly player: PlayerId;
      readonly creatures: readonly EnterAttackingChoice[];
    }
  | {
      readonly kind: "choose-permanents";
      readonly player: PlayerId;
      readonly eligible: readonly ObjectId[];
      readonly min: number;
      readonly max: number;
      /** What the choice is for, as a prompt — "Untap up to two lands". */
      readonly prompt: string;
      readonly then: EffectSpec;
      readonly source: ObjectId;
      readonly x: number;
      /** What the picks must be as a set — "with different powers", each
       * eligible permanent's tags read as the choice is raised. */
      readonly together?: ZoneChoiceTogether;
      /** Set when the choice is of a source of damage (rule 609.7a —
       * `prevent-damage-from-chosen-source`): a spell on the stack may be
       * chosen as well as a permanent. */
      readonly damageSource?: true;
      /** Set when the choice is the untap step's "you may choose not to
       * untap" (rule 502.3): every permanent about to untap, the picks among
       * them staying tapped. `then` is unused. */
      readonly untapStep?: readonly ObjectId[];
      /** With `untapStep`: the choice is instead which of `eligible` untap
       * under an `untapLimit` (rule 502.3), the ones not picked staying
       * tapped — a token stack's tokens one by one. */
      readonly untapLimit?: true;
      /** With `untapStep`: how many `untapOnlyChosenType` questions this step
       * has already asked (see the `choose-modes` kind's `untapTypes`). */
      readonly untapTypesAsked?: number;
      /** Set when the choice is a spell's casualty cost being paid as it's
       * cast, rather than an effect resolving — see {@link CasualtyAsk}.
       * `then` is unused. */
      readonly casualty?: CasualtyAsk;
      /** Set when the choice is the two creatures tapped for a spell's
       * conspire cost (see {@link ConspireAsk}). `then` is unused. */
      readonly conspire?: ConspireAsk;
      /** Set when the choice is the creature an attacker enlists as it
       * attacks (rule 702.154a — see `GameState.pendingEnlist`): `source`
       * is the attacker. `then` is unused. */
      readonly enlist?: true;
      /** Set when the choice is what a cost to attack returns to its owner's
       * hand (rule 508.1h — see `GameState.pendingAttackCost`). `then` is
       * unused. */
      readonly attackCost?: true;
      /** Set when the choice pays an activated ability's cost (its
       * `returnToHand`), not an effect resolving: the player who activated
       * it, who gets priority once it's made (rule 117.3c). */
      readonly priorityTo?: PlayerId;
      /** A `choose-permanents` effect's `keepTargets`: the resolution's own
       * targets, which `then` reads from slot 1 (Crush Underfoot). */
      readonly thenTargets?: readonly (TargetRef | undefined)[];
      /** What `then` reads of the resolution that asked. */
      readonly thenResolution?: ChoosePermanentsResolution;
      /** A `choose-permanents` effect's `thenTogether`: `then` runs once, every
       * permanent chosen in the target slots from 0 (Expose the Culprit). */
      readonly thenTogether?: true;
      /** Set for a `keep-total-power` choice (Slaughter the Strong): what's
       * picked is kept, and its total power — a negative power subtracting
       * (the ruling) — may be at most this. `then` is unused; the picks are
       * collected in `GameState.keptByChoice`. */
      readonly maxTotalPower?: number;
      /** Set for a `sacrifice-all-but` choice (Archfiend of Depravity,
       * Planetary Annihilation): what's picked is kept, collected in
       * `GameState.keptByChoice` as a `keep-total-power` pick is. */
      readonly keepChoice?: true;
      /** Set when the choice is an entering permanent's "you may exchange its
       * text box and another creature's" (`CardDefinition
       * .exchangeTextOnEnter`): `source` is the permanent about to enter,
       * and what's picked (or nothing) is what it exchanges with as it
       * enters. `then` is unused. */
      readonly exchangeText?: true;
      /** Set when the choice is an entering permanent's "as this enters,
       * choose a [permanent]" (`CardDefinition.choosePermanentOnEnter`):
       * `source` is the permanent about to enter, and what's picked (or
       * nothing) is its chosen permanent as it enters. `then` is unused. */
      readonly permanentOnEnter?: true;
      /** Set when the choice is what an Equipment put onto the battlefield
       * "attached to a creature you control" enters attached to
       * (`EnterAttachHost`'s `among`): `source` is the Equipment about to
       * enter, and what's picked is its `enterChoice.attachHost`. `then` is
       * unused. */
      readonly attachOnEnter?: true;
      /** Set when the choice is an entering permanent's devour (rule
       * 702.82a — `CardDefinition.devour`): `source` is the permanent about
       * to enter, and what's picked is sacrificed now, before it enters with
       * the counters. `then` is unused. */
      readonly devour?: true;
      /** Set when the choice is which permanents an entering permanent's
       * `EnterInstead` sacrifices: `source` is the permanent about to enter,
       * and what's picked is sacrificed now, as one event, before it enters.
       * `then` is unused. */
      readonly insteadOfEntering?: true;
      /** Set when the choice is what an entering permanent's `AsEntersAction`
       * returns to its owner's hand: `source` is the permanent about to enter.
       * `then` is unused. */
      readonly asEntersReturn?: true;
      /** Set when the choice is which permanents an entering permanent's
       * `AsEntersAction.removeCounters` takes every counter off: `source` is
       * the permanent about to enter, and how many counters came off is its
       * `enterChoice.asEntersDone`. `then` is unused. */
      readonly asEntersRemoveCounters?: true;
      /** Set when the choice pays an activated ability's `returnToHand`
       * cost: that ability on the stack, which records what the returned
       * creature was attacking (`LastKnownRefs.returnedAttacking`). */
      readonly costOf?: ObjectId;
      /** Set when the choice is which creature blights this many (rule
       * 701.68a — `Game.beginBlight`): exactly one of the player's
       * creatures, singled out of a token stack, and `then` puts the
       * counters on it. */
      readonly blight?: number;
      /** Set when the choice is which of the least-toughness creatures
       * bolsters this many (rule 701.39a — `Game.beginBolster`): exactly one,
       * singled out of a token stack, and `then` puts the counters on it. */
      readonly bolster?: number;
      /** Set when the choice is the creature a resolving cipher spell is
       * encoded on (rule 702.99a): up to one of its controller's creatures.
       * `source` is the spell, waiting on the stack for the answer, which
       * then leaves it — exiled encoded on the creature picked, or as usual
       * with none. `then` is unused. */
      readonly cipher?: true;
    }
  | {
      /**
       * One permanent **or player** chosen as an effect resolves, with no
       * targeting — Comet, Stellar Pup's "deals damage … to a creature or
       * player" (the ruling: "None of Comet's abilities require a target. All
       * choices … are made as the abilities resolve"; rule 608.2c). `player`
       * picks exactly one of `eligible` (permanents and players), and `then`
       * is applied to it as target 0; `source`/`x`/`thenResolution` rebuild
       * the resolution context, as `choose-permanents`' do. A choice made
       * this way ignores hexproof, shroud and protection (they're about
       * targets, rule 702.11b, 702.18a, 702.16b).
       */
      readonly kind: "choose-permanent-or-player";
      readonly player: PlayerId;
      readonly eligible: readonly TargetRef[];
      /** What the choice is for — "Comet deals 5 damage to a creature or player". */
      readonly prompt: string;
      readonly then: EffectSpec;
      readonly source: ObjectId;
      readonly x: number;
      readonly thenResolution?: ChoosePermanentsResolution;
    }
  | {
      /** A modal spell/ability is resolving (rule 700.2), or a "you may"
       * clause (rule 601.3e). The controller picks between `minModes` and
       * `maxModes` distinct modes; their effects apply after. */
      readonly kind: "choose-modes";
      readonly player: PlayerId;
      /** The player the question is about — see the offer's `about`. */
      readonly about?: PlayerId;
      /** The permanent the question is about — see the offer's `aboutObject`. */
      readonly aboutObject?: ObjectId;
      /** The card the question is about — see the offer's `aboutCard`. */
      readonly aboutCard?: ObjectId;
      /** No mode at all is also an answer, besides `minModes` to `maxModes`
       * — an announced modal's `optional` ("you may choose two"). */
      readonly orNone?: true;
      /** A draw `player` is about to make, with dredge cards in their
       * graveyard (rule 702.52): mode 0 draws it, mode i dredges `cards[i-1]`
       * instead. Answered by the engine itself; the modes' effects are
       * unused. */
      readonly dredgeFor?: { readonly cards: readonly ObjectId[] };
      /** Which replacement applies to a draw of `player`'s (rule 616.1, the
       * Words cycle): mode i is `effects[i]`, an index into `activeReplacements`
       * (a resolved "next time" one), or `null` for their printed "if you would draw"
       * (Underrealm Lich). `{ printed }` is that permanent's optional "you may
       * instead" (Abundance), and `"draw"` declines it: the draw happens.
       * `event` is the draw. Answered by the engine itself; the modes'
       * effects are unused. */
      /** A would-create-token replacement's "you may instead": the first mode
       * is the original effect, under this source, controller, targets and
       * X; the other the replacement's. Answered by the engine itself. */
      readonly replacedFor?: {
        readonly source: ObjectId;
        readonly controller: PlayerId;
        readonly targets: readonly (TargetRef | undefined)[];
        readonly x: number;
        /** What the replacement's tokens copy: the replacement's option runs
         * as the replaced effect, with this after its targets, so what that
         * effect says of its tokens still reads as it did. */
        readonly copyHost?: ObjectId;
        /** Per mode, a token the effect's own tokens are made as instead
         * (Jinnie Fay's Cats or Dogs): that mode is the original effect, run
         * as the first is, with this one `tokensInstead` in its event. */
        readonly tokensInstead?: readonly (string | null)[];
      };
      readonly nextDrawFor?: {
        readonly effects: readonly (number | null | "draw" | { readonly printed: ObjectId })[];
        readonly event: { readonly firstInDrawStep: boolean; readonly before: { readonly all: number; readonly exceptDrawStepFirst: number } };
      };
      /** Storage Matrix's question in the untap step (rule 502.3 —
       * `untapOnlyChosenType`): mode i keeps only `types[i]` among `untapping`,
       * the permanents about to untap, and the step carries on with `asked`
       * such questions asked. Answered by the engine itself; the modes'
       * effects are unused. */
      readonly untapTypes?: {
        readonly untapping: readonly ObjectId[];
        readonly types: readonly CardType[];
        readonly asked: number;
      };
      /** The permanent (for an ability) or spell object the effect belongs to
       * — used to build the resolution context for the chosen modes. */
      readonly source: ObjectId;
      /** The modes of a triggered ability going on the stack
       * (`GameState.pendingModalTrigger`), not ones chosen as something
       * resolves: the answer is recorded on the ability, not applied. */
      readonly announcing?: true;
      readonly minModes: number;
      readonly maxModes: number;
      /** The modes, in order — text for the chooser, effect to apply. Plain
       * data (an `EffectSpec` carries no functions), captured here so the
       * modes can be applied after the source has left the stack. */
      readonly modes: readonly { readonly text: string; readonly effect: EffectSpec }[];
      /** `{X}` from the resolving spell/ability, forwarded to the modes. */
      readonly x: number;
      /**
       * The triggering event's numeric value and object, forwarded to the
       * modes the same way `x` and `targets` are.
       *
       * A `may` inside a triggered ability *suspends* resolution — the modes
       * are applied later, from this record, with a freshly built resolution
       * context. Without these, an `EffectAmount` `{ triggerValue: true }`
       * read 0 and a `trigger-object` condition read nothing: "you may have
       * it deal **that much** damage" silently dealt none.
       */
      readonly triggerValue?: number;
      readonly triggerObject?: ObjectId;
      /** The resolving spell's or ability's last-known references and where
       * its targets were, forwarded the same way, so a mode still reads a
       * source or target that has left the battlefield as it last existed
       * there. See {@link LastKnownRefs}. */
      readonly lastKnownRefs?: LastKnownRefs;
      readonly targetZones?: readonly (ZoneType | null)[];
      /** A `may` effect's `else` — applied instead when zero modes are
       * chosen. `undefined` for an ordinary `modal` effect (declining a
       * modal spell/ability entirely isn't a legal answer, so it never
       * reaches zero chosen). needed-cards P19. */
      readonly onDecline?: EffectSpec;
      /** Whose effect `onDecline` is, when that isn't the chooser's. An
       * `unless` punisher asks someone else whether to pay, but what happens
       * when they won't is still its controller's effect: an opponent who
       * declines Rhystic Study's {1} lets *you* draw. Omitted = the chooser. */
      readonly declineController?: PlayerId;
      /** Whose effect the chosen modes are, when that isn't the chooser's —
       * a villainous choice's options ("you draw a card", "that player
       * discards a card") are its controller's, with the chooser as
       * `"that-player"`. Omitted = the chooser's. */
      readonly modesController?: PlayerId;
      /** Set when these are a spell's modes an opponent chooses as it's
       * cast (rule 700.2e — see {@link OtherChoiceAsk}): nothing is applied;
       * the cast goes on with them. */
      readonly otherCast?: OtherChoiceAsk;
      /** A secret vote's question (rule 701.38 — secret council): the answer
       * is kept out of the event log, so no other player learns it before
       * the votes are revealed together. */
      readonly secret?: boolean;
      /** The enclosing ability's own already-chosen targets, forwarded to the
       * modes (and to `onDecline`) — a `may`/`modal` effect doesn't choose
       * new targets itself, so a mode referencing `target: 0` means "the
       * ability's own target 0" (Ob Nixilis, the Fallen: "you may have
       * *target player* lose 3 life"). Empty for the ordinary case where
       * nothing outside the modal choice was targeted. needed-cards P19. */
      readonly targets: ResolvedTargets;
      /** A mana cost the chooser must pay to pick a mode (`may.cost` — "you
       * may pay {B}. If you do, …"). Only offered when it's payable, so
       * declining by choice and being unable to pay both land on `onDecline`. */
      readonly cost?: string;
      /** The colour `cost`'s X is paid in — a `may`'s `xColor` ("pay any
       * amount of {R}"). */
      readonly xColor?: Color;
      /** `cost` was written with `{X}`, already a number by now — Condescend's
       * "pays {X}": what "spend this mana only on costs that contain {X}"
       * reads (Rosheen Meanderer's ruling). */
      readonly costHasX?: true;
      /** What "spend this mana only to …" reads `cost` as: `UnlessOption.paysFor`. */
      readonly costFor?: "cumulative-upkeep";
      /** `cost` is a waterbend cost (rule 701.67a — an `"unless"` option's
       * `waterbend`): each generic mana in it may be paid by tapping an
       * untapped artifact or creature the chooser controls. */
      readonly costWaterbend?: true;
      /** The most `cost`'s X may be — a `may`'s `maxX` ("X can't be greater
       * than the amount of life you lost this turn"). With `energyX`, the
       * most energy the chooser can pay (what they have, under `maxX`). */
      readonly maxX?: number;
      /** `cost` is paid X times over, X from 1 — a `may`'s `costTimes`
       * ("you may pay {1}{G} any number of times"). */
      readonly costTimes?: true;
      /** X is an amount of energy, not mana — a `may`'s `costEnergyX`: from
       * 1 (`"one-or-more"`) or from 0 (`"any"`, where choosing no mode is
       * paying 0 and the mode still applies) up to `maxX`. */
      readonly energyX?: "one-or-more" | "any";
      /** Set when this is a ward payment (rule 702.21a): the one mode pays
       * the ward cost of `warded`, declining counters `spell` (also the
       * decision's target 0). Choosing to pay logs `ward-paid`. */
      readonly ward?: { readonly warded: ObjectId; readonly spell: ObjectId };
      /** Set when this is a gift being promised (rule 702.174a — see
       * {@link GiftAsk}): mode i promises it to candidate i (each an
       * `about-player`, so it reads as a choice of player). Its modes'
       * effects are unused. */
      readonly giftAsk?: GiftAsk;
      /** Set when this asks whether to pay a spell's conspire cost (rule
       * 702.78a — see {@link ConspireAsk}): its one mode pays it. The mode's
       * effect is unused. */
      readonly conspireAsk?: ConspireAsk;
      /** The life and energy parts of a `may`'s cost — see `may.costLife`
       * and `may.costEnergy` — paid alongside `cost` as the choice is made. */
      readonly costLife?: number;
      readonly costEnergy?: number;
      /** A sacrifice in a `may`'s cost — see `may.costSacrifice`: saying yes
       * pays `cost` with these permanents reached for last, and only while
       * that many are left to sacrifice (rule 118.3). */
      readonly costSacrifice?: ModesCostSacrifice;
      /** The ability's source had become a new object by the time it
       * resolved (rule 400.7 — `ResolutionContext.sourceLost`), so "~" in
       * the modes finds nothing: a Bloodghast exiled and put back in the
       * graveyard in response isn't returned by the "you may" of its first
       * self. */
      readonly sourceLost?: true;
      /** Which ability is choosing (`ResolutionContext.abilityKey`), so a
       * mode's effect resolves as part of it. */
      readonly abilityKey?: string;
      /** "That hasn't been chosen this turn": which of the ability's modes
       * each offered one is, recorded in `GameState.modesChosenThisTurn`
       * once chosen — or in `GameState.modesChosenEver`, with `chosenEver`
       * ("that hasn't been chosen"). */
      readonly notChosenThisTurn?: readonly number[];
      readonly chosenEver?: true;
      /** Announcing (`announcing`) out of fewer than all of the ability's
       * modes — one needing a target it can't have can't be chosen (rule
       * 603.3c): which of its own modes each offered one is. */
      readonly announcedFrom?: readonly number[];
      /**
       * A triggered ability's "you may" being asked as it resolves: the
       * ability object, what makes another trigger the *same* one
       * (`Game.triggerSignature`), and the identical triggers still on the
       * stack under it — `alikeCount` counts each copy a stack object stands
       * for (`stackCount`). With any there, the chooser may answer for all of
       * them at once (`choose-modes`' `forAll` — a shortcut, rule 732.2a).
       * Also a resolving trigger's choice among several modes, unless it's
       * asked once per player or card (`about`). Absent for a spell, a ward
       * payment, a vote or an amount of energy.
       */
      readonly trigger?: {
        readonly object: ObjectId;
        readonly signature: string;
        readonly alike: readonly ObjectId[];
        readonly alikeCount: number;
      };
    }
  | {
      /** A triggered ability (or a suspended spell coming off suspend) needs
       * targets and its controller has a real choice (rule 603.3d / 601.2c —
       * ROADMAP Phase 11 EG-1). `specs[i]` / `options[i]` are the spec and the
       * legal `TargetRef`s for the i-th slot still to be chosen (auto-filled
       * slots — a saboteur's victim — aren't listed). The answer supplies one
       * `TargetRef` per spec, in order. */
      readonly kind: "choose-targets";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly cardName: string;
      readonly specs: readonly TargetSpec[];
      readonly options: readonly (readonly TargetRef[])[];
      /**
       * Choosing new targets for a copy of a spell (rule 707.10c —
       * `GameState.pendingCopyTargets`): the target each slot has now, which
       * is `options[i][0]` and may be kept even if it's no longer legal. Any
       * other answer for a slot must be a legal target for it.
       */
      readonly current?: readonly TargetRef[];
      /** A triggered ability that divides an amount among the targets of its
       * `divided` group (rule 603.3d — Dragonlord Atarka): `total` shared by
       * the answer's targets from `slot` on (an index into the answer, not
       * the ability's own slots), split as the answer's `division` says. */
      readonly divide?: { readonly total: number; readonly slot: number; readonly of?: string; readonly upTo?: true };
      /** What's being asked, when it isn't a copy's or a trigger's targets —
       * "Change the target of Lightning Bolt" (`GameState.pendingRetarget`). */
      readonly prompt?: string;
      /** "Change a target" (rule 115.7b): exactly one slot's answer differs
       * from `current` (Spellskite). */
      readonly changeOne?: true;
      /** Whose targets these are, when not the chooser's: a spell's targets
       * are legal or not as its controller would choose them, whoever is
       * changing them (`GameState.pendingRetarget`). */
      readonly targetsFor?: PlayerId;
      /** Set when these are an opponent's targets for a spell being cast or
       * an ability being activated (rule 601.2c — see {@link
       * OtherChoiceAsk}): the cast goes on once they're chosen. `source` is
       * the card (or the ability's source). */
      readonly otherCast?: OtherChoiceAsk;
    }
  | {
      /**
       * "You may cast [a card]" while a spell or ability resolves (the
       * `cast-now` effect — Chandra, Acolyte of Flame's −2, Baral's
       * Expertise): `player` casts one of `cards` now, following the casting
       * rules in full (601.2 — modes, X, kicker, targets, costs) but ignoring
       * timing (608.2g), or declines. `offers` are the cards' cast variants,
       * worked out as this was raised (the board can't change while it's
       * asked); the answer names one, or nothing. `source` is what's
       * resolving.
       */
      readonly kind: "cast-now";
      readonly player: PlayerId;
      readonly source: ObjectId;
      /** The cards on offer, each with at least one way in `offers`. */
      readonly cards: readonly ObjectId[];
      /** Cards `player` looks at to choose among — the top of their library
       * (Velomachus Lorehold) — castable or not; revealed to them alone. */
      readonly looked?: readonly ObjectId[];
      readonly offers: readonly CastSpellOffer[];
      /** "You may **play**": the land cards on offer, each as the face it'd
       * be played as (rules 305.2a, 305.3) — see the `cast-now` effect's
       * `play`. */
      readonly lands?: readonly PlayLandOffer[];
      /** The terms the cast is on, as `Game.castNowOffer` reads them. */
      readonly ask: CastNowAsk;
      /** "If able", and it can't lawfully be got out of: no declining — see
       * the effect's `mustCast` and `Game.castNowForced`. */
      readonly mustCast?: true;
      /** With `mustCast`: a whole cast found legal as this was raised — the proof
       * that a player held to it can make it. */
      readonly forcedCast?: Extract<Action, { type: "cast-spell" }>;
      /** "Up to N": how many more spells this may be, this one included. */
      readonly castsLeft?: number;
      /** "Total mana value N or less": how much is left. `spell` already
       * holds an offer to it; this is for the prompt. */
      readonly manaValueLeft?: number;
    }
  | {
      /** A blocked attacker's controller assigns its combat damage among the
       * blockers (and, with trample, the defender) — rule 510.1c / ROADMAP
       * Phase 11 EG-4a. Only raised when there's a real choice (2+ blockers,
       * or trample with room to divide). The answer is one amount per blocker
       * in `blockers` order; `power − sum` (must be ≥ 0, and 0 unless
       * `trample`) is dealt to the defending player / planeswalker. */
      readonly kind: "assign-combat-damage";
      readonly player: PlayerId;
      readonly attacker: ObjectId;
      readonly blockers: readonly ObjectId[];
      /** How much combat damage the attacker assigns (`combatDamageOf`): its
       * power, or its toughness under a `combatDamageByToughness` static. */
      readonly power: number;
      /** Lethal damage per blocker (toughness − damage already marked, or 1
       * from a deathtouch source). Any division is legal; every blocker must
       * have its lethal before any damage tramples over (702.19b). */
      readonly lethal: readonly number[];
      readonly trample: boolean;
      /** Per blocker: lethal damage won't destroy it. The default split
       * (`standardAssignment`) spends damage on these last. */
      readonly indestructible: readonly boolean[];
      /** How many attackers pending after this one are in the same situation
       * (`Game.damageSituation`), which an answer's `forAll` covers. */
      readonly alike?: number;
      /** The creature dividing its damage is a **blocker** blocking several
       * attackers — a band (rules 510.1d, 702.22h): `attacker` names the
       * blocker and `blockers` the attackers it's blocking. Never tramples. */
      readonly blocking?: true;
      /** `player` doesn't control the creature: banding hands the division
       * to the other side (rules 702.22j-k). */
      readonly forOpponent?: true;
      /** `player` may instead have the attacker assign all its combat damage
       * as though it weren't blocked, to what it's attacking (a
       * `assignAsThoughUnblocked` permission — Thorn Elemental): the answer's
       * `asThoughUnblocked`. */
      readonly mayUnblocked?: true;
      /** With `mayUnblocked`: that's the whole question — the division, if
       * declined, is the other side's (banding) and asked of them next. */
      readonly unblockedOnly?: true;
    };

/** See `GameState.extraTurnRiders`. */
export interface ExtraTurnRider {
  /** The turn's index in `GameState.extraTurns`. */
  readonly at: number;
  /** "During that turn, damage can't be prevented" (rule 615.12). */
  readonly damageCantBePrevented?: true;
  /** "During that turn, power-up abilities can't be activated" (Kang the
   * Conqueror), for the turn this rider's taken up. */
  readonly noPowerUps?: true;
  /** "At the beginning of that turn's end step, …": the delayed ability
   * (rule 603.7) that turn sets up, as its effect's controller made it. */
  readonly atEndStep?: {
    readonly source: ObjectId;
    readonly controller: PlayerId;
    readonly effect: EffectSpec;
    readonly text: string;
  };
}

/** Which combat phase: the turn's number, and which of that turn's combat
 * phases (`TurnState.combatPhases` as it began — 1 for the first). */
export interface CombatId {
  readonly turn: number;
  readonly phase: number;
}

/** One attacker of a declaration (rule 508.1a) as it tapped: what it
 * attacks and whether attacking tapped it (no vigilance — 508.1f). Announced together once every cost to
 * attack is paid (508.1k) — see `GameState.pendingEnlist`. */
export interface DeclaredAttacker {
  readonly id: ObjectId;
  readonly defender: PlayerId | ObjectId;
  readonly taps: boolean;
  /** It was under a requirement to attack as it was declared (rule 508.1d —
   * `mustAttack`): "if that creature had to attack this combat" (Firkraag,
   * Cunning Instigator), recorded on its journal entry. */
  readonly required?: true;
}

/** What a declared attack owes besides its enlists (rules 508.1h-j): mana,
 * life, and parts in permanents. */
export interface AttackCostDue {
  readonly mana: string;
  readonly life: number;
  readonly phyrexianLife?: number;
  readonly parts: readonly AttackCostPart[];
}

/** `count` of one kind of permanent a declaration owes to attack, the taxes
 * asking for the same kind added up — see `GameState.pendingAttackCost`.
 * `source` is the permanent whose static first asked it. */
export interface AttackCostPart {
  readonly tax: CombatPermanentTax;
  readonly count: number;
  readonly source: ObjectId;
}

/** Where a permanent can go when it leaves the battlefield. */
export type LeaveDestination = "graveyard" | "exile" | "hand" | "library" | "command";

/**
 * A delayed trigger keyed to one permanent leaving the battlefield rather
 * than to a step (rule 603.7) — earthbend's "when it dies or is exiled,
 * return it to the battlefield tapped", Kelsien, the Plague's "when that
 * creature dies this turn". It fires the first time that permanent leaves
 * for one of `to`, as a triggered ability whose trigger object is the
 * permanent, and is gone once it leaves for anywhere: whatever comes back is
 * a new object (rule 400.7) it never knew.
 */
export interface DelayedLeaveWatch {
  readonly leaves: ObjectId;
  /** The permanent's `zoneChangeCount` on the battlefield as the trigger was
   * made — which stint of it this watches. */
  readonly stint: number;
  /** `["graveyard"]` is "dies"; `["graveyard", "exile"]` "dies or is
   * exiled". */
  readonly to: readonly LeaveDestination[];
  /** "…this turn": it lapses as the next turn begins. */
  readonly thisTurn?: boolean;
}

/** A delayed trigger waiting for its controller's next spell this turn
 * matching `nextSpell` — see `DelayedNextSpell`. */
/** A delayed trigger waiting on a permanent attacking and not being blocked
 * this turn — see `DelayedUnblocked`. Fires each time (a second combat);
 * lapses with the turn. */
export interface DelayedUnblockedWatch {
  readonly attacksUnblocked: ObjectId;
  /** Which stint of it on the battlefield. */
  readonly stint: number;
  readonly turn: number;
}

/** A delayed trigger with a duration matching any event a trigger can name
 * — see `DelayedWhenever`. Fires each time, until `until` ends it. */
export interface DelayedWheneverWatch {
  readonly whenever: TriggerSpec;
  /** Targets it chooses each time it triggers — absent, it reads the
   * creating ability's. */
  readonly targets?: readonly TargetSpec[];
  /** How long it lasts: `DelayedWhenever.until`, `"end-of-turn"` if that was
   * omitted. */
  readonly until: WatchExpiry;
  /** Whose next turn `"until-end-of-your-next-turn"` means, when it isn't
   * its controller's — `DelayedWhenever.until`'s `{ throughTurnOf }`. */
  readonly turnOf?: PlayerId;
  /** `"until-end-of-your-next-turn"`: that turn has begun and is this one, so
   * the next turn to begin ends it. */
  readonly inLastTurn?: true;
  /** Only damage dealt to this player — `DelayedWhenever.toPlayer` — or only
   * what this player does (a spell they cast) — `DelayedWhenever.byPlayer`. */
  readonly player?: PlayerId;
  /** What `"self"` in `whenever` reads as, each in its stint on the
   * battlefield, instead of the object that set it up —
   * `DelayedWhenever.watching`. */
  readonly watching?: readonly { readonly object: ObjectId; readonly stint: number }[];
  /** Used up as it fires (rule 603.7b) — `DelayedWhenever.once`. */
  readonly once?: true;
  /** This permanent leaving its controller's control fires it too —
   * `DelayedWhenever.orLosesControl`. */
  readonly orLosesControl?: { readonly object: ObjectId; readonly stint: number };
  /** The turn it was made on. */
  readonly turn: number;
}

/** A delayed trigger waiting for its controller to lose control of one
 * permanent — see `DelayedLosesControl`. Used up as it fires (rule 603.7b)
 * unless it's `thisTurn`'s, which lapses as the next turn begins. */
export interface DelayedLoseControlWatch {
  readonly losesControl: ObjectId;
  /** Which stint of it on the battlefield. */
  readonly stint: number;
  readonly thisTurn?: true;
}

export interface DelayedCastWatch {
  readonly nextSpell: CardFilter;
  /** Or the next ability its controller activates with {X} in its
   * activation cost, or the next loyalty ability —
   * `DelayedNextSpell.orNextAbility`. */
  readonly orNextAbility?: { readonly xInCost: true } | { readonly loyalty: true };
  /** The turn it was made on: it lapses as the next begins. */
  readonly turn: number;
}

/**
 * A delayed triggered ability (rule 603.7): created by a resolving spell or
 * ability, waiting on one future step — or on one permanent leaving the
 * battlefield ({@link DelayedLeaveWatch}) — then gone. It isn't an ability
 * *of* any permanent — it exists on its own here, which is exactly why
 * `detectTriggers`' scan over battlefield permanents can't see it: `enterStep`
 * fires the step-keyed ones directly, and a leave event checks the watchers.
 */
export interface DelayedTrigger {
  readonly id: string;
  /** Who controls it when it fires (rule 603.7d). Usually whoever created it,
   * but not always — Arcane Denial's draw belongs to the countered spell's
   * controller. */
  readonly controller: PlayerId;
  /** The step it waits for, the permanent whose leaving it waits for, or
   * the spell its controller casts next. */
  readonly at:
    | DelayedStepWatch
    | DelayedLeaveWatch
    | DelayedCastWatch
    | DelayedUnblockedWatch
    | DelayedWheneverWatch
    | DelayedLoseControlWatch
    /** "At the beginning of that combat" (`additional-combat`'s `atBeginning`):
     * the additional combat phase with this mark (`TurnState.addedCombat`),
     * this turn only. */
    | { readonly thatCombat: number };
  /** Its intervening "if" (rule 603.4), asked as it would trigger and again
   * as it resolves: the `delayed-trigger` effect's `if`. */
  readonly if?: StaticCondition;
  /** The creating ability's trigger object, and its `zoneChangeCount` then
   * — "return **that card** to the battlefield" (Shirei, Shizo's Caretaker).
   * It's the delayed ability's trigger object too, as long as it's still that
   * object (rule 400.7). */
  readonly triggerObject?: ObjectId;
  readonly triggerObjectStint?: number;
  readonly triggerObjectRefs?: LastKnownRefs;
  /** The creating ability's recipient (`LastKnownRefs.recipient`) — "whenever
   * this creature deals combat damage to a creature, destroy **that
   * creature** at end of combat" (Ohran Viper). The delayed ability's too
   * (603.7c), as long as it's still that permanent (rule 400.7). */
  readonly recipient?: LastKnownRefs["recipient"];
  /** The turn it was created on, so "the next end step" can't mean one the
   * game is already in. */
  readonly createdOnTurn: number;
  /** Created during that turn's end step (or cleanup) — so "the next end
   * step" means the *following* turn's, not the one it was made in. */
  readonly createdDuringEndStep: boolean;
  /** Made during an end step: which of the turn's end steps
   * (`TurnState.endSteps`), so an additional end step that begins after it
   * is "the next end step" (Y'shtola Rhul's ruling). */
  readonly createdInEndStep?: number;
  /** The object whose ability this is — `ctx.source` on resolution, and what
   * the log names it after. May well have left the battlefield by then; that
   * is normal and fine (rule 603.7e). */
  readonly source: ObjectId;
  readonly sourceName: string;
  /** A copy of a spell as it set up a `whenever` delayed ability: the copy
   * ceases to exist as it leaves the stack (rule 707.10a) and is still this
   * ability's source (603.7d), with its stated duration still to run. What
   * the ability reads its source's side from once there's nothing at `source`.
   * Twincast on Glimpse of Nature; every prepare spell is such a copy. */
  readonly sourceCopy?: GameObject;
  /**
   * Targets captured when it was created. A delayed ability doesn't choose
   * new targets — its text doesn't say "target" (rules 115.1d, 115.10a) —
   * so these are fixed here and `effect` refers to
   * them by slot index exactly like any other effect.
   */
  readonly targets: ResolvedTargets;
  /** Where those targets were when the creating spell or ability targeted
   * them — see `GameObject.targetZones`. */
  readonly targetZones?: readonly (ZoneType | null)[];
  /** Which object each target was as this was created (its
   * `zoneChangeCount` then; `null` for a player). "Exile it at the
   * beginning of the next end step" does nothing to one that has changed
   * zones since, as it's a new object (rule 400.7), though what the ability
   * reads of it still comes from last-known information. */
  readonly targetStints?: readonly (number | null)[];
  /** The source's `zoneChangeCount` as this was created, when the source was
   * a card or permanent rather than a spell: "return **it** to its owner's
   * hand at the beginning of the next end step" (The Locust God) finds
   * nothing once it has changed zones again (rule 400.7). */
  readonly sourceStint?: number;
  /** The permanent its creator meant by its source, by battlefield stint:
   * what "this creature's power" reads, as it last existed there, once it has
   * left (rule 608.2h). Unlike `sourceStint` it stays that stint when the
   * ability that made this sacrificed the source first. */
  readonly sourceWas?: number;
  /** The `eventSeq` it was created at: it transforms its source only if the
   * source hasn't transformed since (rule 701.28f). */
  readonly createdAtSeq?: number;
  /** The resolution that set it up (its `resolutionSince`) — what its own
   * "damage prevented this way" means (`LastKnownRefs.madeIn`). */
  readonly madeIn?: number;
  /** What else its creator knew, which the delayed ability keeps (theme 15's
   * captured context): the creator's X ("where X is …" no longer reads 0
   * once its spell is gone), "that player" (`LastKnownRefs.player`), and the
   * sets it was told to remember (`remember` — "the creatures exiled this
   * way", plain members, each acted on only in its stint: rule 603.7c). */
  readonly x?: number;
  readonly player?: PlayerId;
  readonly remembered?: { readonly [name: string]: readonly SetMember[] };
  readonly effect: EffectSpec;
  readonly text: string;
}

/** The zones a commander's owner is offered the command zone from: a
 * graveyard or exile once it's there (rule 903.9a), a hand or library in
 * place of going there (903.9b). */
export type CommanderReplacementZone = "graveyard" | "exile" | "hand" | "library";
/** Where a commander waits while its 903.9 choice is pending, other than the
 * battlefield (see `GameState.deferredCommanderMove`): the graveyard or exile
 * it was put into (903.9a), or for a return to hand, the zone it's leaving;
 * or the hand a `choose-from-zone` is putting it into a library from
 * (`heldByZoneChoice`). `"command"`: the command zone itself, where it stays
 * if its owner chooses it over the hand or library (rule 903.9b's "from
 * anywhere"). */
export type CommanderMoveOrigin = "stack" | "graveyard" | "exile" | "hand" | "command";
/** Where in its owner's library a commander's deferred 903.9b move puts it
 * if its owner declines the command zone: where the move was putting it
 * (Noxious Revival's top, Chaos Warp's shuffle). A plain move to a library
 * puts a card on the bottom. `randomlyAmong` is "on the bottom in a random
 * order" with these other cards (Endurance): a random place among those of them
 * already there, or the bottom with none, which one card after another makes a
 * random order, the commander's answer coming after the rest included. */
export type CommanderLibraryPlacement =
  | "top"
  | "bottom"
  | "shuffle"
  | { readonly fromTop: number }
  | { readonly randomlyAmong: readonly ObjectId[] };

/**
 * What caused the decision on {@link GameState.awaiting} — the resolving
 * spell or the permanent whose ability is resolving. Carries `cardName`
 * alongside the id because the object is often no longer anywhere the
 * deciding player can see it by the time they answer: a sorcery that ordered
 * a sacrifice has already gone to its controller's graveyard, and an ability
 * object is deleted off the stack the moment it finishes resolving.
 */
export interface DecisionSource {
  readonly object: ObjectId;
  readonly cardName: string;
  /** Who controlled it as it began — the spell or ability that "causes"
   * what its resolution or cost does (a discard's `cause`). */
  readonly controller?: PlayerId;
}

/** One source that dealt a permanent damage, as that source was as it
 * dealt it: whose it was and what it was — "dealt damage this turn by a
 * Spider you controlled" (Shelob, Child of Ungoliant) reads the past. */
export interface DamageSourceRecord {
  readonly source: ObjectId;
  /** Which stint of the source it was (rule 400.7): "dealt damage by this
   * creature this turn" is this object, not one it was before it last left
   * the battlefield. Absent for a source with no battlefield stint — a spell. */
  readonly sourceZoneChangeCount?: number;
  readonly controller: PlayerId;
  readonly types: readonly CardType[];
  readonly subtypes: readonly string[];
  /** It was a spell as it dealt the damage (Aegar, the Freezing Flame's
   * "a Giant, Wizard, or spell you controlled"). */
  readonly spell?: true;
}

/**
 * What damaged a permanent during turn `turn`: every source that dealt it
 * damage (`by`), and whether any of it was **excess damage** (rule 120.4a
 * — more than the lethal damage it needed then: toughness less damage
 * already marked, or 1 from a deathtouch source; for a planeswalker, more
 * than its loyalty) — Maarika, Brutal Gladiator's "if that creature was
 * dealt excess damage this turn".
 */
export interface DamageHistory {
  readonly turn: number;
  readonly by: readonly DamageSourceRecord[];
  readonly excess?: true;
}

/**
 * The damage a permanent has dealt in this stint on the battlefield (a zone
 * change makes a new object, rule 400.7): the other side of
 * {@link DamageHistory}. Only damage dealt, so none that was prevented (rule
 * 615). Per object, so tokens with different records don't fold together.
 */
export interface DealtDamageRecord {
  /** Some of it was combat damage: Ruric Thar's "hasn't dealt combat damage
   * yet". */
  readonly combat: boolean;
  /** This turn's, cleared as the next turn begins. Absent: none this turn. */
  readonly thisTurn?: {
    readonly turn: number;
    /** The players it dealt damage to this turn, any one of them once. */
    readonly players: readonly PlayerId[];
    /** …and combat damage to. */
    readonly combatPlayers: readonly PlayerId[];
  };
}

/**
 * How a permanent came onto the battlefield, this stint — read by the filter
 * clauses `enteredFrom`, `cast`, `castBy`, `castFrom` and
 * `putThereBySource`.
 */
export interface EntryRecord {
  /** The zone it came from: "enters from exile" (Fire Lord Zuko), "came
   * from a graveyard". A permanent spell comes from the stack. */
  readonly from: ZoneType;
  /** It got here as a spell that was cast and resolved: who cast it and
   * from which zone — "if you cast it" (Anti-Venom, Rocco, Tiamat), "cast
   * from a graveyard". A copy of a spell was never cast. */
  readonly cast?: {
    readonly by: PlayerId;
    readonly from: ZoneType;
    /** The permission it was cast under, if not a normal cast from hand
     * (`GameObject.castVia`) — Uro's "unless it escaped". */
    readonly via?: CastVia;
  };
  /** The source of the ability that put it here, with that source's
   * timestamp then — Kodama of the East Tree's "if it wasn't put onto the
   * battlefield with this ability". */
  readonly by?: { readonly source: ObjectId; readonly timestamp: number };
  /** It's a land that was played (rule 305.1) — Deep Gnome Terramancer's
   * "enter … without being played" is the filter's `played: false`. */
  readonly played?: true;
}

/**
 * A resolution that stopped partway to ask someone something — see
 * {@link GameState.suspendedResolutions}. Either what is left of it (a
 * {@link ParkedSteps}), or, once nothing is left, just a note that it isn't
 * over until its last decision has been answered — or, with `enter`, a
 * permanent waiting on its "as this enters" choice to finish entering; or,
 * with `leaveStack`, an instant, a sorcery or an ability whose instructions are done,
 * leaving the stack as the final part of its resolution (rule 608.2n) once
 * the steps it parked above this are: a spell it lets its controller cast
 * as it resolves is cast while it's still on the stack (608.2g).
 */
export type SuspendedResolution =
  | ParkedSteps
  | {
      readonly effect: null;
      readonly enter?: PendingEntry;
      readonly leaveStack?: ObjectId;
      /** A mana ability waiting on what its `do` cost asks (605.3b). */
      readonly manaAbility?: {
        readonly source: ObjectId;
        readonly abilityIndex: number;
        readonly player: PlayerId;
        readonly x: number;
        readonly manaColors?: readonly ManaType[];
      };
    };

/**
 * A permanent part of the way onto the battlefield, stopped to make an "as
 * this enters" choice (rule 614.12 — `Game.askEnterChoice`) before it moves:
 * a permanent spell still resolving, or a land being played. It finishes
 * entering once that's answered. An effect putting something onto the
 * battlefield needs none of this — it parks itself, and runs again.
 */
export type PendingEntry =
  | { readonly kind: "spell"; readonly object: ObjectId }
  | {
      readonly kind: "land";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly from: ZoneType;
      /** "Each land played this way enters tapped" — the permission it's
       * played under (`GameObject.playPermission`), read before anything moved. */
      readonly tapped?: true;
      /** "If you do, it gains '[trigger]'" — the permission's
       * `gainsTriggered`, the land's from the moment it enters. */
      readonly gainsTriggered?: readonly TriggeredAbility[];
      /** The permanent whose permission it's played under, for the
       * `land-played` event. */
      readonly permission?: PlayedUnder;
    }
  | {
      /** The answer to a `choose-from-zone` decision, not yet carried out
       * because a card it puts onto the battlefield had to choose first (a
       * tutored Cavern of Souls). */
      readonly kind: "zone-choice";
      readonly awaiting: Extract<AwaitingDecision, { kind: "choose-from-zone" }>;
      readonly player: PlayerId;
      readonly chosen: readonly ObjectId[];
      /** Or because a chosen card is its owner's commander, bound from their
       * hand for their library, whose owner may put it into the command zone
       * instead (rule 903.9b): each one's answer, once given — `true` for the
       * command zone. */
      readonly commanderAnswers?: Readonly<Record<string, boolean>>;
    }
  | {
      /** Cards exiled "until" a permanent leaves, coming back because its
       * owner left the game (rules 610.3, 800.4a — `Game.leaveGame`), waiting
       * on one of them's "as this enters" choice. */
      readonly kind: "exiled-return";
      readonly objects: readonly ObjectId[];
    }
  | {
      /** Cards a player chose to begin the game with on the battlefield from
       * their opening hand (rule 103.6a — the Leylines), waiting on one's "as
       * this enters" choice (Leyline of Transformation's creature type);
       * `next` and `destination` are `Game.applyOpeningHand`'s. */
      readonly kind: "opening-hand";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
      readonly next: number;
      readonly destination: string;
    }
  | {
      /** Cards players chose to put from their hands onto the battlefield
       * while their choices were held (rule 101.4 — Show and Tell), entering
       * together once each has made its "as this enters" choices. */
      readonly kind: "held-entries";
      readonly objects: readonly ObjectId[];
      /** Who a card enters under when not its owner (Dredge the Mire). */
      readonly under?: Readonly<Record<string, PlayerId>>;
      /** Counters a card enters with (a discarded Dodecapod's). */
      readonly withCounters?: Readonly<Record<string, { readonly kind: string; readonly amount: number }>>;
      /** What a card enters as (Ghouls' Night Out's "they're black Zombies"). */
      readonly enterAs?: Readonly<Record<string, EnterTypes>>;
      /** The cards that enter tapped (New Frontiers). */
      readonly tapped?: readonly ObjectId[];
      /** The libraries to shuffle once they have entered (`heldChoices`). */
      readonly shuffles?: readonly PlayerId[];
    }
  | {
      /** Token copies an effect is creating, not on the battlefield yet,
       * until each has made its "as this enters" choices (rule 614.12a —
       * `Game.createTokenCopy`). One group per copied object, all of them
       * entering together. */
      readonly kind: "token-copies";
      readonly groups: readonly EnteringTokenCopies[];
    };

/**
 * One copied object's tokens on their way onto the battlefield: `tokens`
 * exist only as answers wait on them (`zone: "outside"`, in no zone's list, so
 * nothing in the game can see or affect them), then enter under `controller`.
 * The rest is what the effect still has to do with them.
 */
/** A token's link to the permanent that made it: `GameObject.createdWith`. */
export interface TokenLink {
  readonly source: ObjectId;
  readonly zoneChangeCount: number;
}

export interface EnteringTokenCopies {
  readonly tokens: readonly ObjectId[];
  /** Plain tokens of the named definition, not copies of anything — a token
   * with devour stops to ask as it enters just as a copy does (rule 702.82a). */
  readonly created?: true;
  /** What they're created with — see `GameObject.createdWith`. */
  readonly createdWith?: TokenLink;
  readonly controller: PlayerId;
  /** What a would-create-token replacement made instead of some of them
   * (Divine Visitation's Angels), with what the effect does to those. */
  readonly replaced: readonly { readonly name: string; readonly count: number; readonly inPlace?: number }[];
  readonly riders: readonly PtModifier[];
  readonly tapped: boolean;
  /** "The tokens are goaded for the rest of the game", by this player. */
  readonly goadedForGameBy?: PlayerId;
  readonly exileAtEndStep: boolean;
  readonly sacrificeAtEndStep: boolean;
  readonly atYourNextEndStep: boolean;
  readonly exileAtEndOfCombat: boolean;
  readonly sacrificeAtEndOfCombat: boolean;
  readonly attacking?: ResolvedEnterAttacking;
  readonly source?: ObjectId;
  readonly effectController?: PlayerId;
  /** Counters the effect's controller puts on each once they're made. */
  readonly thenCounters?: { readonly kind: string; readonly amount: number };
  /** Counters each enters with (`create-token-copy`'s `withCounters`). */
  readonly withCounters?: { readonly kind: string; readonly amount: number };
  /** What each is created attached to (`create-token-copy`'s `attachedTo`):
   * an Aura that can't enchant it was never created, an Equipment that can't
   * equip it enters unattached (`Game.readyToEnterAttached`). */
  readonly attachTo?: EnterAttachHost;
}

/**
 * The steps of a resolution still to apply, with everything its resolution
 * context was built from, so they resume as the same spell or ability: its
 * source and controller, its targets and where they were, its X, the
 * triggering event's value and object, and which battlefield stints it
 * refers to (last-known information).
 */
export interface ParkedSteps {
  readonly effect: EffectSpec;
  readonly source: ObjectId;
  readonly controller: PlayerId;
  readonly targets: ResolvedTargets;
  readonly targetZones: readonly (ZoneType | null)[];
  /** See `ResolutionContext.illegalTargets`: found as the resolution began,
   * so the steps after a decision still know. */
  readonly illegalTargets?: readonly number[];
  readonly x: number;
  readonly triggerValue: number;
  readonly triggerObject?: ObjectId;
  readonly stackMultiplier: number;
  readonly resolutionCount: number;
  readonly lastKnownRefs: LastKnownRefs;
  /** See `ResolutionContext.sourceLost`. */
  readonly sourceLost?: boolean;
  /** See `ResolutionContext.abilityKey`. */
  readonly abilityKey?: string;
  /** The `eventSeq` after which its source transforming stops the ability
   * transforming it (rule 701.28f) — see `GameObject.stackedAtSeq`. */
  readonly transformSince?: number;
  /** See `ResolutionContext.division`: the split chosen as it went on the
   * stack, so a divided amount after a decision still deals its shares. */
  readonly division?: readonly number[];
  /** The timestamp the source had when the ability went on the stack, so
   * "exile ~" still skips a source that has become a new object. */
  readonly sourceTimestamp?: number;
  /** What the resolution's decisions are said to come from — restored while
   * the rest runs, so a decision it raises still names its card. */
  readonly decisionSource: DecisionSource | null;
  /** The triggered ability resolving (`Game.triggerSignature`), restored
   * while the rest runs: a "you may" asked after another decision in the
   * same resolution still offers "the same for all" (`standingModeAnswers`). */
  readonly resolvingTrigger?: { readonly object: ObjectId; readonly signature: string };
}


/** See {@link GameState.standingModeAnswers}. */
export interface StandingModeAnswer {
  readonly player: PlayerId;
  readonly signature: string;
  /** The identical triggers it answers for. */
  readonly objects: readonly ObjectId[];
  /** The stack as it was answered. */
  readonly stack: readonly ObjectId[];
  /** The question it answered, which a later one must match. */
  readonly modeTexts: readonly string[];
  readonly modes: readonly number[];
  readonly xValue?: number;
}

/**
 * A resolved spell's or ability's replacement or prevention effect, for as
 * long as it lasts (rules 611.2c, 614, 615): the one record they're kept in.
 * See `docs/plans/need-key-themes.md`, theme 9.
 *
 * `next` and `left` make it a shield: `next` is "the next time" (615.8), gone
 * once it has applied to one event; `left` is "the next N" (615.7), counting
 * down. With neither it applies for as long as `expires` says (615.3).
 *
 * The rest is what its references fixed as it resolved, each an object in its
 * stint (rule 400.7). They narrow it beside what `replacement` says.
 */
export interface ActiveReplacement {
  /** What it replaces and with what, the same words a static's says. */
  readonly replacement: ReplacementSpec;
  /** The effect's controller, its "you". */
  readonly owner: PlayerId;
  /** The spell or ability's source. */
  readonly source: ObjectId;
  /** How long it lasts, for the shared expiry pass. */
  readonly expires: Expiry;
  /** The next time, then it's spent (615.8). */
  readonly next?: true;
  /** The next N damage still to absorb (615.7); gone at 0. */
  left?: number;
  /** The targets its ability was activated with, each in its stint: what its
   * `instead` reads (`targetStints`, rule 115.1b). */
  readonly targets?: readonly (TargetRef | null | undefined)[];
  readonly targetStints?: readonly (number | null | undefined)[];
  /** The ability's X, for its `instead`. */
  readonly x?: number;
  /** Only these players' events ("if target player would draw a card", "…to
   * that player or a permanent that player controls"). */
  readonly onlyPlayers?: readonly PlayerId[];
  /** With `onlyPlayers`, a permanent one of them controls counts too. */
  readonly playersPermanents?: true;
  /** The player or object it protects, or (for an event on one object) the
   * object it's about. */
  readonly target?: TargetRef;
  /** For an object target: the stint it was made for (rule 400.7) — once
   * that object has changed zones it's a new object the shield doesn't
   * cover. Absent on a state saved before it was recorded. */
  readonly zoneChangeCount?: number;
  /** Only damage from this source (rule 609.7 — "a source of your choice",
   * `prevent-damage-from-chosen-source`): that object in the stint it was
   * chosen in, or — chosen as a permanent spell — the permanent it became
   * (`orBecomes`, 609.7a). `filter` is rechecked from `you`'s side when the
   * damage would be dealt: a red source that's turned blue isn't stopped,
   * and the shield isn't used up (609.7b). */
  readonly from?: {
    readonly object: ObjectId;
    readonly zoneChangeCount: number;
    readonly orBecomes?: true;
    readonly filter?: CardFilter;
    readonly you: PlayerId;
  };
  /** Reverse Damage: this player gains life equal to the damage it prevents. */
  readonly gainLife?: PlayerId;
  /** Only damage from a source matching this, from `gainLife`'s side, as the
   * damage would be dealt, gains the life (Shadowbane's "from a black
   * source"). */
  readonly gainLifeFrom?: CardFilter;
  /** A redirection effect (rule 614.9 — the en-Kor creatures' "the next 1
   * damage that would be dealt to this creature this turn is dealt to target
   * creature you control instead"): what it takes is dealt to `to` instead
   * of prevented, by the same source. An object `to` is the one in the stint
   * it had then (`zoneChangeCount`); while it's off the battlefield, no
   * longer a creature, planeswalker or battle, or a player `to` has left the
   * game, the shield does nothing (614.9) and isn't used up. */
  readonly redirect?: { readonly to: TargetRef; readonly zoneChangeCount?: number };
  /** A redirection to the damage's own source (Shield Dancer's "that
   * creature deals that damage to itself", `"itself"`) or to that source's
   * controller (Reflect Damage, Mirror Strike, `"controller"`), worked out as
   * the damage would be dealt; `redirect` is unused. */
  readonly redirectToSource?: "itself" | "controller";
  /** Instead of `target`, every recipient in a set — a `damage-rule`'s
   * "you and permanents you control", "creatures", "players": `players`
   * (from `you`'s side) or a permanent on the battlefield matching
   * `permanents` from `you`'s side, as the damage would be dealt (rule
   * 615.1), but `except` that object. With neither `target` nor this, any
   * recipient (Reflect Damage). */
  readonly recipients?: {
    readonly players?: "you" | "each" | "opponents";
    readonly permanents?: CardFilter;
    readonly except?: { readonly object: ObjectId; readonly zoneChangeCount: number };
    readonly you: PlayerId;
  };
  /** Only damage from sources matching `filter` from `you`'s side, asked as
   * the damage would be dealt (rule 615.1 — Ethereal Haze's "by creatures"),
   * but not `except` (Terrifying Presence's "creatures other than target
   * creature"). Beside `from`, which names one source. */
  readonly byFilter?: {
    readonly filter: CardFilter;
    readonly you: PlayerId;
    /** The permanent whose ability made it, for a filter that reads it
     * ("of the chosen type" — Circle of Solace). */
    readonly origin?: ObjectId;
    readonly except?: { readonly object: ObjectId; readonly zoneChangeCount: number };
  };
  /** Prevention's additional effect (rule 615.5 — Deflecting Palm's "if
   * damage is prevented this way, … deals that much damage to that source's
   * controller", Temper's counters): applied right after, as `controller`'s
   * effect from `by`, with `"x"` the damage this shield prevented, the
   * spell's own `targets`, and the damage's source as the trigger object
   * (`"trigger-object"`, `who: "trigger-controller"`). Not with a
   * redirection. */
  readonly then?: {
    readonly spec: EffectSpec;
    readonly by: ObjectId;
    readonly controller: PlayerId;
    readonly targets: readonly (TargetRef | null)[];
    /** `"x"` is the damage even when it can't be prevented and so isn't
     * (rule 615.12 — Gatta and Luzzu's ruling): the `replacement-effect`'s
     * `thenCountsUnprevented`. */
    readonly countsUnprevented?: true;
  };
  /** The resolution that made it (its `resolutionSince`), which its
   * `damage-prevented` events name — the `damagePreventedThisWay` amount's
   * read. */
  readonly madeIn?: number;
  /** A shield's option text, for the player choosing among replacements. */
  readonly text?: string;
}

/**
 * The combat-damage step in progress (rule 510 — ROADMAP Phase 11 EG-4).
 * `"single"` = no first/double striker in combat, one pass; `"first"` = the
 * first-strike sub-pass (510.5); `"regular"` = the main sub-pass. `regularOwed`
 * is true only during `"first"`, and drives `endStep` to start the regular
 * sub-pass (with a priority window between — 510.4) rather than leaving combat.
 */
export interface CombatDamageState {
  readonly pass: "single" | "first" | "regular";
  readonly regularOwed: boolean;
  /** Blocked attackers dealing damage this sub-pass whose controller still
   * owes an `assign-combat-damage` choice (multiple blockers, or trample with
   * slack). Drained one at a time. */
  readonly pendingAssignments: readonly ObjectId[];
  /** Damage-assignment choices already made this sub-pass: attacker id → the
   * amount dealt to each of its blockers, in `blockedBy` order (leftover, if
   * trample, goes to the defender). */
  readonly assigned: Readonly<Record<string, readonly number[]>>;
  /** Blocked attackers whose controller chose this sub-pass to have them
   * assign their combat damage as though they weren't blocked — all of it
   * to what they're attacking (rule 510.1b; `unblockedAssignmentOf`). */
  readonly asThoughUnblocked?: readonly ObjectId[];
  /** Blocked attackers whose controller has been asked that and declined,
   * where the division itself is the other side's (banding, 702.22j): the
   * next question about them is the division. */
  readonly unblockedDeclined?: readonly ObjectId[];
  /** The attackers and blockers that had first strike or double strike as the
   * first-strike step began (rule 510.4), id → battlefield timestamp then —
   * the second step's roster is everyone *not* here plus whoever has double
   * strike by then. Empty for a `"single"` step. Lives and dies with this
   * record, so it's gone by end of combat. */
  readonly firstStepStrikers: Readonly<Record<string, number>>;
}

/** An emblem (rule 114 — ROADMAP Phase 10): a player-owned object carrying one
 * ability, with no zone and no way to be removed. Currently only a
 * `"creatures-you-control"` anthem `static` is modeled (the common
 * planeswalker-ultimate emblem) — folded in by the layer system. `text` is for
 * the log / client. */
/** A timed static waiting for "during that player's next turn" (rule 611.2c):
 * it starts as that turn begins and lasts through its cleanup. */
export interface LaterTimedStatic {
  readonly owner: PlayerId;
  readonly timedStatic: StaticAbility;
}

/**
 * A continuous effect a resolved spell or ability gave a player for a while
 * — an emblem that expires. See the `player-effect` EffectSpec.
 */
export interface PlayerEffect {
  readonly owner: PlayerId;
  /** When it ends, as `resolvePlayerDuration` read the effect's `Duration`:
   * this turn's cleanup, the end of combat, as a player's next turn begins
   * (Teferi's Reproach's "until **that player's** next turn"), an
   * `UntilPoint` of theirs (Single Combat's "until the end of your next
   * turn"), or `"permanent"` — the rest of the game. Ended by
   * `Game.expirePlayerEffects`. */
  readonly expires: Expiry;
  /** These players have no maximum hand size (rule 402.2) — applied at its
   * `timestamp`, as every effect on the rules of the game is (rule 613.11). */
  readonly noMaxHandSize?: readonly PlayerId[];
  readonly timestamp?: number;
  /** Matching spells `owner` casts cost this much generic mana less — the
   * amount read as the effect was created (rule 611.2b). */
  readonly reduceSpells?: {
    readonly applies: CardFilter;
    readonly reduceGeneric: number;
    /** Every player's matching spells, not only `owner`'s. */
    readonly allCasters?: true;
  };
  /** `owner` may cast matching spells from their hand without paying their
   * mana costs. */
  readonly castFromHandFree?: { readonly filter?: CardFilter };
  /** `owner` may cast spells matching `filter` (every spell without one) as
   * though they had flash (rule 601.3b) — "you may cast spells this turn as
   * though they had flash" (Borne Upon a Wind). With `next`, only the next
   * matching spell `owner` casts: the first one cast after this effect began
   * ends it, whenever and however it's cast (Quicken's ruling — "even if you
   * cast that sorcery at a time you normally could"), and several such
   * effects all end on that one spell. See `Game.castsAsThoughFlash`. */
  readonly castAsThoughFlash?: { readonly filter?: CardFilter; readonly next?: true };
  /** A rule for a while: `owner` may play cards from `from` on these terms
   * (rules 601.3, 611.2c). See `play-permission.ts`. */
  readonly mayPlay?: EffectPlay;
  /** These players play with their hands revealed while this lasts (Sen
   * Triplets), to every player, as a `visibility` static has them do. */
  readonly handsRevealed?: readonly PlayerId[];
  /** `owner` doesn't lose unspent mana of these types as steps and phases
   * end (rule 500.5 — The Last Agni Kai's "until end of turn, you don't lose
   * unspent red mana"). See `Game.keptManaTypes`. */
  readonly keepsUnspentMana?: readonly ManaType[];
  /** `owner` paid to ignore this permanent's static effect until end of turn
   * (rule 116.2d — Leonin Arbiter's "any player may pay {2} for that player to
   * ignore this effect"): the permanent, in the stint it was paid for. */
  readonly ignoresStatic?: { readonly source: ObjectId; readonly stint: number };
  /** "Damage that would reduce your life total to less than `floor` reduces
   * it to `floor` instead" (Angel's Grace, `floor: 1`) — for damage dealt to
   * one of `players`. Only damage, and only a total at or above the floor:
   * a player already below it loses life to damage as normal (the ruling).
   * The damage itself is still dealt in full. */
  readonly damageLifeFloor?: { readonly players: readonly PlayerId[]; readonly floor: number };
  /** "Each token that would be created under an opponent's control this turn
   * is created under your control instead" (Crafty Cutpurse): see
   * `Game.tokenCreatorAfterRedirects`. */
  readonly tokensComeToOwner?: true;
  readonly looksAtOwnLibraryTop?: true;
  /** `owner` may look at the top card of these players' libraries any time
   * while this lasts (Xanathar, Guild Kingpin — rule 401.5), in their own
   * view. */
  readonly looksAtLibraryTopOf?: readonly PlayerId[];
  /** One more loyalty activation of each permanent `owner` controls (The
   * Chain Veil): see the `player-effect` spec's. */
  readonly extraLoyaltyActivation?: true;
  /** "Lands you control enter tapped this turn" (Nahiri's Lithoforming —
   * rule 614.1d): a permanent matching this as it would enter, from
   * `owner`'s side, enters tapped while this lasts. */
  readonly entersTapped?: CardFilter;
  /** "Until end of turn, if you tap a land you control for mana, it produces
   * {U} instead of any other type" (Deep Water), "if a player taps a nonbasic
   * land for mana" (Pale Moon): one rule of what a tapped permanent makes
   * (rules 106.12b, 614.1a), with "you" being `owner`. See
   * `Game.manaProductionRules`. */
  readonly manaProduction?: ManaProductionRule;
  /** "You gain protection from everything" (rule 702.16j): these players
   * can't be the target of spells or abilities, can't be enchanted by Auras
   * (a Curse on one goes, 704.5m), and all damage that would be dealt to them
   * is prevented. See `playerHasProtectionFromEverything`. */
  readonly protectionFromEverything?: readonly PlayerId[];
  /** "You … gain protection from the chosen player" (rule 702.16k — Guardian
   * Archon): `who` can't be the target of spells or abilities `from` controls,
   * can't be enchanted by Auras they control, and damage from sources they
   * control is prevented. See `playerProtectionBlocks`. */
  readonly protectionFromPlayers?: { readonly who: readonly PlayerId[]; readonly from: readonly PlayerId[] };
  /** "Until your next turn, creatures can't attack you or planeswalkers you
   * control unless their controller pays {2} for each of those creatures"
   * (Forbidding Spirit): the `attackTax` static's cost to attack (rule
   * 508.1h) for a while, its amounts read as the effect was created (rule
   * 611.2b). `covers` as there, "you" being `owner`, or `"all"`: every attack
   * by anyone on anything (War Tax). See `Game.attackTaxOn`. */
  readonly attackTax?: {
    readonly generic: number;
    readonly life: number;
    readonly covers: "you" | "you-and-planeswalkers" | "planeswalkers" | "all";
  };
  /** "This turn, creatures can't block unless their controller pays {X} for
   * each blocking creature they control" (War Cadence): a cost on every
   * block by anyone (rule 509.1d), read as the effect was created (611.2b). */
  readonly blockTax?: { readonly generic: number; readonly life: number };
  /** Combat rules over the game for as long as this lasts, reaching creatures
   * that arrive later (rule 611.2c — the `restrict` effect's `filter` form).
   * `filter` is read from `side`'s side, usually the owner's; "creatures
   * **target player** controls" is that player's, `controlledBy` the
   * "controlled by" a filter can't say as it's read from one side. `except`
   * is the one permanent left out, by its stint (rule 400.7). */
  readonly combat?: {
    readonly rules: readonly CombatRule[];
    readonly filter: CardFilter;
    readonly side: PlayerId;
    readonly controlledBy?: PlayerId;
    readonly except?: { readonly object: ObjectId; readonly zoneChangeCount: number };
  };
}


/**
 * A stretch of the game during which every player knew what an object was:
 * from the event it became public (`from`, an `eventSeq`) until knowledge of
 * it was lost (`until`, exclusive — absent while it still holds). It becomes
 * public by entering a public zone or being revealed — a token or a copy of a
 * spell as it comes into being, so a line still names it after it has ceased
 * to exist (rule 111.7). It stays known when it
 * goes from there into a hand or library (a bounced card is still known to be
 * that card), and stops being known when it moves on from a hidden zone, when
 * its library is shuffled, or when it's turned face down (foretold). The
 * history names an event's objects by the stint covering that event, so a
 * line keeps the name it had when it happened. `name` is the face it showed
 * last while public.
 */
export interface PublicStint {
  from: number;
  until?: number;
  name: string;
}

/** The name `id` was publicly known by when the event numbered `seq`
 * happened, or `undefined` if nobody but its holder knew what it was then —
 * the {@link PublicStint} covering that moment. */
export function publicNameAt(
  stints: Readonly<Record<string, readonly PublicStint[]>>,
  id: string,
  seq: number,
): string | undefined {
  const list = stints[id];
  if (list === undefined) return undefined;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const s = list[i];
    if (s.from <= seq && (s.until === undefined || seq < s.until)) return s.name;
  }
  return undefined;
}

export interface EmblemState {
  readonly id: string;
  readonly owner: PlayerId;
  readonly text: string;
  /** The name of the card whose effect created it ("Elspeth, Knight-Errant"),
   * for a player reading their emblems. `undefined` in a state saved before
   * it was recorded. */
  readonly sourceName?: string;
  /** Timestamp (rule 613.7) for ordering this emblem's anthem among others. */
  readonly timestamp: number;
  readonly static: StaticAbility | null;
  /** Its other static abilities, when it has several (Saheeli, Filigree
   * Master's). Read through `staticsOfEmblem`. */
  readonly moreStatics?: readonly StaticAbility[];
  /** The emblem's object, when it has abilities — the source its statics and
   * triggers come from (kind `"emblem"`, triggers on its modifiers). */
  readonly object?: ObjectId;
  /** Who controlled the effect that made it, when that wasn't its owner —
   * Ob Nixilis Reignited gives an opponent a punishing emblem, which is no
   * asset of theirs. */
  readonly createdBy?: PlayerId;
  /** The Ring (rule 701.54c): one per player, its text growing with the
   * temptations — `ring.ts`. */
  readonly ring?: true;
  /** A **timed static** (the `timed-static` effect), not an emblem at all:
   * a resolved spell or ability's rule-changing effect for a while ("players
   * can't gain life this turn" — Skullcrack; rule 611.2c, it reaches what
   * comes later), riding the emblem machinery so every reader of emblem
   * statics sees it. Ends with this `Expiry` (`Game.expirePlayerEffects`);
   * not shown or counted as an emblem. */
  readonly expires?: Expiry;
}

export interface GameState {
  seed: number;
  /** Current PRNG position; rebuild the stream with `createRng(rngState)`. */
  rngState: number;
  rules: GameRules;
  /** Seating order, also the order priority passes. */
  turnOrder: PlayerId[];
  startingPlayer: PlayerId;
  players: Record<PlayerId, PlayerState>;
  objects: Record<ObjectId, GameObject>;
  zones: {
    perPlayer: Record<PlayerId, Record<PrivateZone, ObjectId[]>>;
    shared: Record<SharedZone, ObjectId[]>;
  };
  /**
   * The phased-out permanents (rule 702.26), in the order they phased out —
   * each with `zone: "phased-out"` and a `phasedOut` status. Out of the
   * battlefield's list, so nothing that reads the battlefield sees them
   * (702.26b). Absent while none is.
   */
  phasedOut?: ObjectId[];
  /**
   * Each player's cards outside the game — their sideboard (rule 400.11a),
   * `DeckList.sideboard` — each with `zone: "outside"`, in the order the
   * deck listed them. Seen by their owner alone. Absent while nobody has one.
   */
  outside?: Record<PlayerId, ObjectId[]>;
  /**
   * Each player's revealed companion (rule 103.2b), one of their `outside`
   * cards, there for anyone to see. Gone once its owner takes the special action
   * that puts it into their hand (116.2g); a wish that finds it first (a
   * constructed game's sideboard) leaves it here, no longer `zone: "outside"`,
   * and no one reads it again. Absent while nobody has revealed one.
   */
  companions?: Record<PlayerId, ObjectId>;
  turn: TurnState;
  priority: PriorityState;
  result: GameResult;
  /**
   * Cards revealed to all players this turn (rule 701.16), so `viewFor` can
   * put their identity in *every* seat's view — a reveal is momentary, but a
   * client only ever sees whole frames, so the identity has to outlive the
   * instant or the event names a card nobody can draw.
   *
   * Turn-scoped, cleared as the next turn begins: a card revealed and then
   * drawn on the same turn stays visible, which is right (everyone did just
   * see it), while one revealed and drawn later does not.
   */
  revealedThisTurn: ObjectId[];
  /** When each object's identity was known to every player — see
   * {@link PublicStint}. Absent until the first object becomes public. */
  publicStints?: Record<ObjectId, PublicStint[]>;
  /**
   * The {@link GameObject.lastKnown} of each token that ceased to exist this
   * turn (rule 111.7), keyed by its old id: the object is deleted, but an
   * ability on the stack may still read it by last-known information —
   * Clement, the Worrywort's "lesser mana value" after a token copy that
   * entered was killed in response, a Saproling's dies trigger. A copy of a
   * spell that left the stack (rule 707.10a) is kept here too, as it was on
   * the stack, while something names it (`Game.ceaseSpellCopy`): Deekah's
   * "that spell's mana value" for a copy countered in response. Each is
   * forgotten as the next turn begins unless a delayed ability still names it
   * ("the next end step" may be a later turn's — Esoteric Duplicator); absent
   * when no such token is remembered.
   */
  ceasedTokens?: Record<ObjectId, LastKnownInfo>;
  /**
   * Tokens `moveObject` has taken off the battlefield since the last
   * state-based check, which deletes them (rule 111.7, 704.5d) and empties
   * this. The check used to walk every object in the game — each library
   * card included — on every pass to find them.
   */
  tokensLeftBattlefield?: ObjectId[];
  /** The modes each ability has had chosen, never cleared — for "choose one
   * that hasn't been chosen" (this turn's are the journal's `did` entries)
   * (`modal`'s `notChosenBefore` — Silent Hallcreeper). The key carries the
   * permanent's timestamp, which it gets as it enters, so a permanent that
   * leaves and comes back is a new object with none chosen (rule 400.7). */
  modesChosenEver?: Record<string, number[]>;
  /**
   * "The same for all of them": a player's answer to one trigger's "you
   * may" or choice of modes — the controller's, or another player's asked
   * by an "each player may" — standing for the identical triggers that were
   * under it on the stack (`choose-modes`' `forAll`). Each is answered with it as it
   * resolves, so long as nothing new has gone on the stack since (`stack`
   * is the stack as it was answered: anything added — a response, a new
   * trigger — ends the shortcut, rule 732.2b) and the question is still the
   * same one. Dropped once none of its triggers is left. Never in a view.
   */
  standingModeAnswers?: StandingModeAnswer[];
  /**
   * Players in a loop that keeps going round through their optional choices
   * (rules 732.2c, 732.3): they must now choose differently, so their next
   * "you may" in it is a no, whoever (or whatever bot) answers it. Set by
   * `Game.noteMandatoryResolution` when the loop's cycle has repeated; gone
   * once anyone does anything but answer inside the chain.
   */
  loopBreak?: PlayerId[];
  /** A declaration the engine is waiting for, or `null`. */
  awaiting: AwaitingDecision | null;
  /**
   * Delayed triggered abilities still waiting to fire (rule 603.7) — see
   * {@link DelayedTrigger}. Drained by `enterStep`, which is the only place
   * that can see them: they belong to no permanent, so the `detectTriggers`
   * battlefield scan never matches one.
   */
  delayedTriggers: DelayedTrigger[];
  /**
   * The spell or permanent whose resolution raised `awaiting` — what a client
   * shows the deciding player so a forced sacrifice or discard isn't a prompt
   * out of nowhere. Only meaningful while `awaiting` is set *and*
   * `decisions/registry.ts`'s `decisionHasSource` accepts it; cleared whenever priority is handed
   * off with nothing pending.
   *
   * It is tracked separately from the decision itself because the two are
   * raised in different places: the resolving object is known at the top of
   * `resolveTopOfStack`/`resolveAbility`, while the decision can surface
   * several layers down inside an effect (or, for a sacrifice effect, a whole
   * fixpoint iteration later, out of `pendingSacrifices`).
   */
  decisionSource: DecisionSource | null;
  /**
   * Defending players (3+ player games can have more than one) still owed a
   * "declare-blockers" turn this combat, in the order they'll be asked.
   * Drained one `declare-blockers` action at a time.
   */
  pendingBlockerDeclarations: PlayerId[];
  /** Triggered abilities that have fired but not yet been put on the stack. */
  pendingTriggers: PendingTrigger[];
  /**
   * A fired trigger (or Saga chapter) parked mid-placement while its controller
   * chooses targets (ROADMAP Phase 11 EG-1). The corresponding `choose-targets`
   * decision is on `awaiting`; `applyChooseTargets` mints the ability onto the
   * stack with the assembled targets, then resumes placing the rest of
   * `pendingTriggers`. `null` when no such choice is pending.
   */
  pendingTargetedTrigger: {
    readonly sourceObjectId: ObjectId;
    readonly cardName: string;
    readonly abilityKind: "triggered" | "chapter";
    readonly abilityIndex: number;
    readonly controller: PlayerId;
    /** One entry per target slot, in order: an `auto`-filled slot (a saboteur's
     * victim) or a `spec` slot whose `TargetRef` comes from the answer. */
    readonly slots: readonly (
      | { readonly auto: TargetRef }
      | { readonly spec: TargetSpec }
      /** An "up to one" or "any number of" slot with nothing to point at:
       * left empty — a hole, or for a group no slot at all. */
      | { readonly skip: true }
    )[];
    /** See {@link PendingTrigger.triggerValue}. */
    readonly triggerValue?: number;
    /** See {@link PendingTrigger.triggerObject}. */
    readonly triggerObject?: ObjectId;
    /** See {@link PendingTrigger.x}. */
    readonly x?: number;
    /** See {@link PendingTrigger.grantedAbility}. */
    readonly grantedAbility?: GrantedAbilityRef;
    /** See {@link PendingTrigger.lastKnownRefs}. */
    readonly lastKnownRefs?: LastKnownRefs;
    /** See {@link PendingTrigger.targetedBy}. */
    readonly targetedBy?: TargetedBy;
    /** See {@link PendingTrigger.reflexive}. */
    readonly reflexive?: ReflexiveTrigger;
    /** See {@link PendingTrigger.modes}. */
    readonly modes?: readonly number[];
  } | null;
  /**
   * A fired modal trigger ("Choose one —") parked as it goes on the stack
   * while its controller announces its modes (rules 603.3c, 700.2b): the
   * `choose-modes` on `awaiting` is marked `announcing`, and answering it
   * places this trigger again with its `modes` — on to its targets, if it
   * has any. Absent when none is.
   */
  pendingModalTrigger?: PendingTrigger;
  /**
   * A copy of a spell on the stack whose controller is choosing new targets
   * for it (rule 707.10c — "you may choose new targets for the copy"): the
   * `choose-targets` on `awaiting` carries `current`, and `slots` maps its
   * answers back onto the copy's target slots. Absent when none is.
   */
  pendingCopyTargets?: { readonly copy: ObjectId; readonly slots: readonly number[] } | null;
  /**
   * A spell or ability on the stack whose targets an effect is changing (rule
   * 115.7 — the `change-targets` effect): the `choose-targets` on `awaiting`
   * carries `current`, and `slots` maps its answers back onto `object`'s
   * target slots. Absent when none is.
   */
  pendingRetarget?: { readonly object: ObjectId; readonly slots: readonly number[] } | null;
  /** Copies made while another decision was up — storm's several — waiting
   * to be asked about their new targets, oldest first. Drained one at a time
   * in the `prepareForPriority` fixpoint. Absent when empty. */
  copyTargetsQueue?: ObjectId[];
  /** Additional copies of a spell (`would-copy-spell`), once their new targets
   * are chosen, whose controller may place them among the copies `among` that
   * couldn't take new targets (the Twinning Staff rulings), oldest first.
   * Drained one at a time in the `prepareForPriority` fixpoint, after
   * `copyTargetsQueue`. Absent when empty. */
  spellCopyPlacements?: { readonly copy: ObjectId; readonly among: readonly ObjectId[] }[];
  /** Ability objects that left the stack while a triggered ability waiting
   * on it named one as its trigger object, as they last were there — what
   * Illusionist's Bracers' "copy that ability" copies once the ability has
   * been countered in response (rule 707.10, as Rings of Brighthearth's
   * ruling has it). Emptied as each turn begins. Absent when empty. */
  departedAbilities?: Record<ObjectId, GameObject>;
  /**
   * Battlefield permanents a mass-destroy effect (Wrath of God) still has to
   * destroy. `drainPendingDestruction` destroys them all at once, as one leave
   * batch (rule 603.10a) — a commander among them waits for its 903.9a
   * choice without holding up the rest — but only once nothing else is being
   * asked: a wipe that began while another decision was pending waits here
   * for the `prepareForPriority` fixpoint.
   */
  pendingDestruction: ObjectId[];
  /** The members of `pendingDestruction` that "can't be regenerated" (rule
   * 701.15c — Wrath of God). */
  pendingDestructionNoRegen?: ObjectId[];
  /**
   * Players still owed a "discard N cards" decision from a *scoped* discard
   * effect ("each opponent discards a card") — one player's choice is asked
   * at a time, so the rest wait here. Drained one at a time by
   * `promptNextDiscard` in the `prepareForPriority` fixpoint, APNAP-ordered.
   * A player with no real choice (a hand no bigger than what's owed)
   * discards straight away and never waits here. Any effect discard raised
   * while another decision is up waits here too, rather than overwriting it.
   */
  pendingDiscards: {
    readonly player: PlayerId;
    readonly count: number;
    /** What ordered the discard — see `pendingSacrifices`' `source`. */
    readonly source?: DecisionSource;
    /** Only cards matching this may go — see the `discard` decision's
     * `eligible`. */
    readonly filter?: CardFilter;
    /** See the `discard` effect's `unlessOne`. */
    readonly unlessOne?: CardFilter;
    /** See the `discard` effect's `anyNumber`. */
    readonly upTo?: true;
    /** See the `discard` decision's `forCost`. */
    readonly forCost?: ObjectId;
  }[];
  /**
   * Discards a `would-discard` replacement offers to their player, the cards
   * still in hand until they answer: asked one at a time, `Game.raiseNextDiscardToLibrary`.
   * Optional so a snapshot saved before it existed still loads.
   */
  pendingDiscardsToLibrary?: {
    readonly player: PlayerId;
    readonly objects: readonly ObjectId[];
    readonly cause?: PlayerId;
    readonly source?: DecisionSource;
  }[];
  /**
   * Attackers just declared whose "you may exert this creature as it
   * attacks" (rule 701.43d, an optional cost to attack — 508.1g) is still to
   * be asked: queued by the declaration and asked one at a time, as a
   * `choose-modes`, by `promptNextExert` in the `prepareForPriority`
   * fixpoint — before anything that triggered on the attack goes on the
   * stack. Optional so a snapshot saved before it existed still loads.
   */
  pendingExerts?: ObjectId[];
  /**
   * An attack being declared whose attackers' enlist costs (rule 702.154a —
   * optional costs to attack, 508.1g) are still being asked: the attackers
   * have tapped and nothing else is paid yet, and none is announced as
   * attacking yet (508.1k), so nothing has triggered on the attack. `queue`
   * is the attackers with enlist still to ask, once per instance, one at a time
   * (`Game.promptNextEnlist`); `declared` is the declaration, announced
   * once the last is answered (`Game.announceAttackers`). Optional so a
   * snapshot saved before it existed still loads.
   */
  pendingEnlist?: {
    readonly player: PlayerId;
    readonly queue: readonly ObjectId[];
    readonly declared: readonly DeclaredAttacker[];
    /** What else the attack owes, paid once every enlist is answered (508.1j)
     * — unset on a snapshot saved before it was paid after them. */
    readonly cost?: AttackCostDue;
  };
  /**
   * A declaration's costs to attack paid in permanents (rule 508.1h —
   * `CombatPermanentTax`, Exalted Dragon), its mana and life paid and the
   * attackers tapped (508.1f): `parts` is what's still to choose, one kind at a
   * time (`Game.continueAttackCosts`), and `sacrificed` and `returned` what's
   * been chosen. All of it is paid together once the last is chosen
   * (508.1j), and only then is the attack announced (508.1k). Optional so a
   * snapshot saved before it existed still loads.
   */
  pendingAttackCost?: {
    readonly player: PlayerId;
    readonly parts: readonly AttackCostPart[];
    readonly sacrificed: readonly ObjectId[];
    readonly returned: readonly ObjectId[];
    readonly declared: readonly DeclaredAttacker[];
  };
  /**
   * Creatures put onto the battlefield attacking whose controller still owes
   * the choice of what each attacks (rule 508.4) — queued as they enter and
   * asked, one batch per player, by `promptNextEnterAttacking` in the
   * `prepareForPriority` fixpoint (see `Game.putIntoAttack`). Each is already
   * attacking its first option meanwhile; the answer only re-points it.
   * Optional so a snapshot saved before it existed still loads.
   */
  /** What the players asked by a resolving `keep-total-power` effect have
   * chosen to keep so far (a token stack once per member kept), read and
   * cleared as the effect resumes. */
  keptByChoice?: ObjectId[];
  /** The answers to `replacement-order` questions for what's happening now:
   * by event, the keys of the effects chosen so far, in order (rule 616.1).
   * Read as the event happens, cleared once nothing is waiting on anyone. */
  replacementAnswers?: Record<string, readonly string[]>;
  /** A resolving `separate-into-piles`'s answers, read and cleared as the
   * effect resumes: the piles the separator made, then the pile chosen. */
  pilesAnswer?: { piles?: ObjectId[][]; chosen?: number };
  /** Votes being cast in a resolving `vote` (rule 701.38), by the source
   * whose spell or ability holds it, until every one is in and the
   * `votes-finished` event shows them. Not in any player's view, so a secret
   * vote stays secret until then. `choice`: an "each player chooses"
   * (rule 101.4), not a vote. */
  voting?: Record<ObjectId, { readonly secret: boolean; readonly votes: readonly Vote[]; readonly choice?: true }>;
  /** Draws waiting behind a dredge question (rule 702.52): the rest of an
   * instruction's draws, each made — and offered dredge again — one at a
   * time once the question before it is answered (the ruling). */
  pendingDraws?: { readonly player: PlayerId; readonly count: number }[];
  /** Cards put into one player's graveyard at the same time, still to be
   * arranged by that player (rule 404.3) — queued only while something in the
   * game reads a graveyard's order (`Game.graveyardOrderIsRead`). Each is the
   * card and the stint it arrived in. */
  pendingGraveyardOrders?: {
    readonly player: PlayerId;
    readonly cards: readonly { readonly object: ObjectId; readonly stint: number }[];
  }[];
  pendingEnterAttacking?: {
    readonly player: PlayerId;
    readonly creatures: readonly EnterAttackingChoice[];
    /** What put them there — see `pendingSacrifices`' `source`. */
    readonly source?: DecisionSource;
  }[];
  /**
   * Players still owed a "choose N permanents to sacrifice" decision from a
   * sacrifice *effect* (Diabolic Edict, Fleshbag Marauder). Drained one at a
   * time by `promptNextSacrifice`, APNAP-ordered.
   */
  pendingSacrifices: {
    readonly player: PlayerId;
    readonly filter: CardFilter;
    readonly count: number;
    /** A permanent to exclude — "sacrifice **another** permanent" (Korvold). */
    readonly exceptId?: ObjectId;
    /** What ordered the sacrifice, carried across the deferral so the
     * decision can still say where it came from — see {@link
     * GameState.decisionSource}. The spell has usually left the stack by the
     * time the prompt is raised. */
    readonly source?: DecisionSource;
    /** An exploit ability's sacrifice (rule 702.110b): the creature with
     * exploit "exploits" what's sacrificed — `permanent-sacrificed`'s
     * `exploitedBy`, which an `exploits` trigger watches. */
    readonly exploitedBy?: ObjectId;
    /** The parts of the same sacrifice still to come after this one — a
     * `sacrifice` effect's `andEach` ("a creature, an artifact, and a
     * land"): this part is offered only what leaves the most of them still
     * sacrificeable, each by a different permanent. */
    readonly rest?: readonly CardFilter[];
  }[];
  /**
   * Specific permanents (chosen, or auto-selected when there was no choice)
   * still to be moved to the graveyard as a sacrifice. Drained only once
   * every player owed a choice has made it, and then all at once as one
   * leave batch (rule 101.4 — the players choose in turn, then sacrifice
   * simultaneously; rule 603.10a) — `drainPendingSacrificeVictims`.
   */
  pendingSacrificeVictims: { readonly player: PlayerId; readonly object: ObjectId; readonly exploitedBy?: ObjectId }[];
  /**
   * Rule 101.4: set while an `each-player-may` (or a scoped `discard`)
   * asks its players in turn — every player makes their choices, *then* the
   * actions happen at once. What a player chose to discard waits here, still
   * in their hand and so still hidden from the players after them (101.4a);
   * so does a card they chose to put from their hand onto the battlefield
   * (`entries` — Show and Tell); sacrifice victims wait in
   * `pendingSacrificeVictims`, not drained. `Game.releaseHeldChoices` then
   * discards, sacrifices and puts onto the battlefield all of it at once.
   * Absent otherwise.
   */
  heldChoices?: {
    /** `cause`: who controlled the spell or ability that made them choose
     * — the discard's cause once it happens (`cards-discarded`). */
    readonly discards: readonly { readonly player: PlayerId; readonly objects: readonly ObjectId[]; readonly cause?: PlayerId }[];
    /** Opened by an "each player discards … at random" (Burning Inquiry):
     * random picks are held too, to be discarded together. Any other hold
     * (an `each-player-may` — Apathy's "may discard a card at random. If the
     * player does …") lets a random discard happen at once. */
    readonly randomDiscards?: true;
    readonly entries?: readonly {
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
      readonly under?: PlayerId;
      readonly enterAs?: EnterTypes;
      /** They enter tapped (New Frontiers). */
      readonly tapped?: true;
    }[];
    /** Permanents to go back to their owners' hands — `return-to-hand`'s
     * `atRelease`. */
    readonly returns?: readonly ObjectId[];
    /** The libraries of those who searched together (an `each-player-may`'s
     * search): shuffled once what they found has entered. */
    readonly shuffles?: readonly PlayerId[];
  };
  /**
   * The players a `search-library`'s `shufflesLater` left owing their library
   * a shuffle, for a `shuffle-library` of `searchers` to pay (Tempt with
   * Discovery's "then each player who searched a library this way shuffles").
   * Absent otherwise.
   */
  searchShufflesOwed?: readonly PlayerId[];
  /**
   * A sacrifice *cost* of several permanents being paid (rules 601.2h, 602.2b
   * — Sai, Master Thopterist's "Sacrifice two artifacts", Jarad, Golgari Lich
   * Lord's "a Swamp and a Forest"): the ability is on the stack and the rest
   * of its cost paid. `parts` are still to be chosen, a `sacrifice` decision
   * each (none when there's no choice), and `picked` holds what's chosen so
   * far — still on the battlefield, a token named out of a stack already
   * split off it — all sacrificed together once the last part is chosen.
   * Nobody gets priority and no state-based action is checked until then
   * (rule 704.3). Optional so a snapshot saved before it existed still loads.
   */
  pendingCostSacrifice?: {
    readonly player: PlayerId;
    /** The stack object what's sacrificed goes on, as `{ paid: "sacrificed" }`. */
    readonly onto?: ObjectId;
    /** The card whose cost it is, named in the prompt. */
    readonly source: ObjectId;
    readonly parts: readonly { readonly filter: CardFilter; readonly count: number; readonly differentNames?: true }[];
    /** "Sacrifice two **other** creatures": the source can't pay. */
    readonly except?: ObjectId;
    readonly picked: readonly ObjectId[];
    /** Who gets priority once it's paid: the player who activated it. */
    readonly priorityTo: PlayerId;
    /** The cost is a mana ability's (Springjack Pasture's "Sacrifice X
     * Goats"), which never goes on the stack (rule 605.3b): nothing has
     * resolved yet, and this is what's needed to add its mana once the last
     * permanent is chosen — that ability of `source`, its X, and the colours
     * picked as it was activated. */
    readonly manaAbility?: {
      readonly abilityIndex: number;
      readonly x: number;
      readonly manaColors?: readonly ManaType[];
    };
  };
  /**
   * A face-down permanent whose turn-face-up cost is paid but for a choice
   * still being answered (a morph cost's "Sacrifice another creature", a
   * discard, a reveal): it turns face up once that's answered (rule 702.37e —
   * "pay that cost, then turn the permanent face up"), before any state-based
   * action is checked or anyone gets priority. `megamorph`: it gets its
   * +1/+1 counter (702.37b); `x`: the X paid. Absent otherwise.
   */
  pendingTurnFaceUp?: {
    readonly object: ObjectId;
    /** Its `zoneChangeCount` then: one that left since isn't turned (400.7). */
    readonly stint: number;
    readonly player: PlayerId;
    readonly megamorph: boolean;
    readonly x: number;
  };
  /**
   * Permanents just turned face up whose card says something else happens "as
   * this is turned face up" (`CardDefinition.asTurnedFaceUp`'s `effect` — Gift
   * of Doom's "you may attach it to a creature"), still to be done: each the
   * next time priority is looked at, before the state-based actions, its
   * choice answered before they're checked (rule 704.3). `priorityTo`: the
   * player whose special action turned it, who has priority after that
   * choice (116.3); absent when an effect turned it. Absent otherwise.
   */
  pendingAsTurnedFaceUp?: readonly {
    readonly object: ObjectId;
    readonly stint: number;
    readonly x: number;
    readonly priorityTo?: PlayerId;
    /** Its choice is being answered: done with once that's answered. Listed
     * until then, an Aura here isn't put into a graveyard for being
     * unattached (704.5m). */
    readonly asked?: true;
  }[];
  /**
   * Permanents just attached whose card says something happens "as this
   * becomes attached" (`CardDefinition.asBecomesAttached` — Psychic Paper's
   * choice of a name and a creature type), still to be done, in the order
   * they were attached: each the next time priority is looked at, before the
   * state-based actions, as `pendingAsTurnedFaceUp` is. `asked`: its choice
   * is up. Absent otherwise.
   */
  pendingAsBecomesAttached?: readonly {
    readonly object: ObjectId;
    readonly stint: number;
    readonly asked?: true;
  }[];
  /**
   * The commander whose owner is being asked whether to put it into the
   * command zone (rule 903.9), or `null`. Either it's in the graveyard or
   * exile it was put into, and this is the state-based action of 903.9a; or
   * it's *about to* be put into a hand or library, 903.9b's replacement, and
   * `moveObject` hasn't moved it yet. `applyCommanderChoice` does whichever
   * move the answer calls for.
   *
   * The `commander-replacement` decision is normally on `awaiting` while this
   * is set, but not always: a later step of the same resolution can raise a
   * decision of its own over a 903.9b question. The question is asked again
   * once that one is answered — `raiseNextCommanderChoice`.
   */
  deferredCommanderMove: {
    readonly commander: ObjectId;
    /** Where it stays (903.9a) or goes (903.9b) if its owner declines. */
    readonly intendedZone: CommanderReplacementZone;
    /** A 903.9a offer's: the zone-change count it arrived with, so it's asked
     * about only while it's still that object (rule 400.7). */
    readonly stint?: number;
    /** The permanents that left the battlefield in the same simultaneous
     * event as this commander's deferred move (a wrath, one state-based
     * sweep). Its move is carried out later, once its owner answers, but it
     * still happened at the same time as theirs, so their leaves-the-
     * battlefield abilities look back at it and it at them (rule 603.10a).
     * See `Game.withLeaveBatch`. */
    readonly leftWith?: readonly ObjectId[];
    /** That event's permanents already off the battlefield, and where to:
     * "whenever one or more … leave" waits on the last answer (`permanents-left`). */
    readonly leftMoved?: readonly LeftBattlefield[];
    /** Where it waits meanwhile — the battlefield when absent. A 903.9a
     * offer waits in the graveyard or exile it's in. A commander put into
     * its owner's hand or library *from anywhere* is asked too (rule
     * 903.9b): a spell countered into its owner's hand (Remand) or returned
     * there from the stack (Unsubstantiate), an Omen shuffled away as it
     * resolves, or a card from a graveyard or exile (Noxious Revival), each
     * of which waits where it is. */
    readonly from?: CommanderMoveOrigin;
    /** A move to a library: where in it the commander goes if its owner
     * declines (absent: the bottom). */
    readonly libraryPlacement?: CommanderLibraryPlacement;
    /** A commander a `choose-from-zone` answer is putting from its owner's
     * hand into their library (Brainstorm, Valakut Awakening, Teferi's
     * Puzzle Box — rule 903.9b): the answer is only *recorded* (the parked
     * `PendingEntry`'s `commanderAnswers`), and the choice carries out the
     * move with the rest of its cards, in the order picked. */
    readonly heldByZoneChoice?: true;
  } | null;
  /**
   * Commanders whose owner is owed the choice on `deferredCommanderMove` and
   * hasn't been asked yet, in the order they'll be asked: every 903.9a offer
   * one state-based check found (in APNAP order of their owners, rule
   * 101.4), and every 903.9b move that came while another decision was on
   * `awaiting`, which waits where it is until `prepareForPriority` asks.
   *
   * Without this a move went ahead unasked: an overloaded Cyclonic Rift asked
   * about the first opponent's commander and bounced the rest silently.
   */
  pendingCommanderMoves: {
    readonly commander: ObjectId;
    readonly intendedZone: CommanderReplacementZone;
    readonly stint?: number;
    readonly leftWith?: readonly ObjectId[];
    /** That event's permanents already off the battlefield, and where to:
     * "whenever one or more … leave" waits on the last answer (`permanents-left`). */
    readonly leftMoved?: readonly LeftBattlefield[];
    readonly from?: CommanderMoveOrigin;
    readonly libraryPlacement?: CommanderLibraryPlacement;
    readonly heldByZoneChoice?: true;
  }[];
  /**
   * Commanders put into a graveyard or exile since state-based actions were
   * last checked, each with the zone-change count it arrived with. Rule
   * 903.9a: the next check offers each one that's still there its owner's
   * choice of the command zone (`offerArrivedCommanders`), and the list
   * starts again. One that moved on before the check isn't offered for the
   * zone it left, only for where it is now if that's a graveyard or exile.
   */
  commanderArrivals: { readonly commander: ObjectId; readonly stint: number }[];
  /**
   * Shock lands ("you may pay 2 life; if you don't, it enters tapped" — rule
   * 614.13) that entered while another decision was on `awaiting`. Each is on
   * the battlefield tapped, as if its controller had declined, until
   * `prepareForPriority` offers the payment in turn.
   *
   * Without this the offer was dropped, and the tap with it: a fetch land put
   * Watery Grave onto the battlefield while its own search was still being
   * answered, and the land came in untapped for free.
   */
  pendingPayLifeForUntapped: {
    readonly player: PlayerId;
    /** The land that entered. */
    readonly source: ObjectId;
    readonly life: number;
  }[];
  /**
   * Resolutions waiting on a decision one of their own steps raised, most
   * recent last (rule 608.2c: a spell's instructions are followed in order,
   * so "each opponent sacrifices a creature, then you draw a card" can't
   * draw before the sacrifices are chosen).
   *
   * A `sequence` step that leaves a decision to answer parks the steps after
   * it here, and a resolution that ends with one still unanswered parks an
   * empty remainder. `prepareForPriority` resumes the newest once nothing is
   * awaited and no queued prompt is left, so a remainder nested inside a
   * chosen mode finishes before the steps after that mode. While any is
   * parked the resolution is still under way: no state-based actions are
   * performed (rule 704.3 — they are checked only as a player would receive
   * priority) and no triggered ability is put on the stack (rule 603.3).
   */
  suspendedResolutions: SuspendedResolution[];
  /** The permanents players have chosen to keep under the legend rule in the
   * state-based check under way (the `legend-rule` decision); spent once that
   * check performs its moves. */
  legendRuleKeeps?: ObjectId[];
  /** Players who order their own simultaneous triggered abilities (rule
   * 603.3b, the `order-triggers` decision) rather than leave it to the
   * engine — a preference set from outside (`Game.setOrdersOwnTriggers`),
   * off for everyone by default. */
  ordersOwnTriggers?: PlayerId[];
  /**
   * The `eventSeq` the spell or ability now resolving began at — what "this
   * way" reads (the `thisWay` amount and the `this-way` condition): every
   * event since is its own, because nothing else happens while it resolves,
   * across the decisions it waits on too. Set as it begins, cleared once it
   * and everything it parked have finished; absent between resolutions.
   */
  resolutionSince?: number;
  /** The objects this resolution has named by something other than a target
   * slot ("exile **it**"), each with its zone-change count then. A slot still
   * holding one that has since moved no longer means it (rule 400.7), so
   * "exile it, then return target card" doesn't return it from exile
   * (`ResolutionContext.slotStillMeant`). */
  namedOffSlot?: Record<ObjectId, number>;
  /**
   * The `eventSeq` the `repeat` now under way began at (each of its passes
   * moves `resolutionSince` to its own start): what a `this-way` condition's
   * `acrossPasses` reads. Absent outside a `repeat`.
   */
  repeatSince?: number;
  /** Which pass of that `repeat` is under way (1 for the first): the
   * `{ repeatPass }` amount — Game of Chaos's stakes, doubled each flip.
   * Absent outside a `repeat`. */
  repeatPass?: number;
  /** While an ability resolves (across the decisions it waits on, like
   * `resolutionSince`): its source and that source's timestamp then — what
   * a permanent it puts onto the battlefield records as `entry.by`. Absent
   * while a spell resolves, and between resolutions. */
  resolvingSource?: { readonly source: ObjectId; readonly timestamp: number };
  /** While a spell or ability resolves (across the decisions it waits on, like
   * `resolutionSince`): who controls it — not whoever part of it is being done
   * by, a "that player may search" running in that player's name. */
  resolvingController?: PlayerId;
  /** While a triggered ability resolves (a chapter ability included, rule
   * 714.2b), with `resolvingController`: what The Master, Multiplied's
   * "triggered abilities you control can't cause you to …" reads. */
  resolvingTriggered?: true;
  /**
   * An effect has ended the turn or the combat phase (rule 724): every trigger
   * waiting has ceased to exist and the stack has been exiled, and what's left
   * of the process — state-based actions with no one getting priority, then
   * the skip to the cleanup step or the next phase (724.1c-d, 724.2c-d) — is
   * owed. `prepareForPriority` carries it out once nothing is waiting on a
   * decision. Absent otherwise.
   */
  endingPhase?: "turn" | "combat";
  /** "`player` can't block with more than `most` creatures this combat" (Mirri,
   * Weatherlight Duelist — the `limit-blockers` effect): in the combat phase
   * `combat` of this turn (`TurnState.combatPhases`), gone with the turn. */
  combatBlockLimits?: { readonly player: PlayerId; readonly most: number; readonly combat: number | undefined }[];
  /** Player-level continuous effects that expire (the `player-effect`
   * effect) — see {@link PlayerEffect}. */
  playerEffects?: PlayerEffect[];
  /** Player effects that apply only *during* a player's next turn
   * (`Duration`'s `"during-your-next-turn"`, `{ duringTurnOf }` — "that
   * player can't attack you during their next turn", Willie Lumpkin,
   * Postman): each waits here, doing nothing, until `turnOf`'s next turn
   * after turn `after` begins, then holds through that turn's cleanup. One
   * whose player has left the game never begins (rule 800.4m). */
  laterPlayerEffects?: { readonly turnOf: PlayerId; readonly after: number; readonly effect: PlayerEffect | LaterTimedStatic }[];
  /** The permanents some effect lasts "for as long as [it] remains on the
   * battlefield" for (a modifier's or control effect's `whileSource`) — so a
   * permanent leaving looks for effects to end only when it's one of these. */
  whileSourceIds?: ObjectId[];
  /** Rule 723, oldest first: "you control target player during that player's
   * next turn" (`control-player`), waiting for that turn and then working
   * through it. Read through `player-control.ts`. */
  playerControl?: PlayerControl[];
  /** "You choose which creatures attack / block this turn" (`choose-combat`),
   * oldest first; the last that covers a player works. Turn-scoped, and a rule
   * over the turn rather than over any creature, so one arriving later counts
   * too (Brutal Hordechief's ruling). Read through `player-control.ts`. */
  combatChoices?: readonly CombatChoice[];
  /** Creatures whose controller, asked to send them, wouldn't pay what it costs
   * (`attackers`' second step): the chooser proposes again without them. Lasts
   * until this combat's attackers are declared. */
  attackChoiceRefused?: readonly ObjectId[];
  /** "Creatures you control with defender can attack this turn as though
   * they didn't have defender" (the `attack-despite-defender` effect's
   * `filter` form — Wakestone Gargoyle): every permanent matching `filter`
   * from `you`'s side, including ones that arrive later. Read through
   * `canAttackDespiteDefender`. Turn-scoped. */
  turnDefenderAttacks?: { readonly filter: CardFilter; readonly you: PlayerId }[];
  /** "You may have creatures you control assign their combat damage this
   * turn as though they weren't blocked" (the `assign-as-though-unblocked`
   * effect's `filter` form — Predatory Focus): a rule about how they assign
   * damage, not a characteristic, so it binds whatever matches it from
   * `you`'s side as damage is assigned, a creature that arrives later too
   * (611.2c doesn't lock it in). Read through `unblockedAssignmentOf`.
   * Turn-scoped. */
  turnUnblockedAssignments?: { readonly filter: CardFilter; readonly you: PlayerId; readonly must?: true }[];
  /** Phases owed straight after the combat phase under way, the next one
   * first — each is added directly after the phase it was made in, so the
   * most recently created goes first (rule 500.8). An additional combat
   * phase ("after this phase, there is an additional combat phase"), maybe
   * "followed by an additional main phase"; or an additional beginning phase
   * holding only an upkeep step (Obeka, Splitter of Seconds' "you get that
   * many additional upkeep steps after this phase" — rules 500.10, 500.11:
   * its untap and draw steps are skipped). Turn-scoped. */
  phasesAfterThisCombat?: AddedPhase[];
  /** Spells just cast whose casualty costs (rule 702.153a) are still to be
   * offered — see {@link CasualtyAsk}. Absent when there are none. */
  pendingCasualty?: CasualtyAsk[];
  /** Spells just cast whose conspire costs (rule 702.78a) are still to be
   * offered — see {@link ConspireAsk}. Absent when there are none. */
  pendingConspire?: ConspireAsk[];
  /** Spells just cast with their gift promised whose opponent is still to
   * be chosen — see {@link GiftAsk}. Absent when there are none. */
  pendingGifts?: GiftAsk[];
  /** Non-mana parts of a keyword's cost still to be paid — see
   * {@link AlsoCostAsk}. Absent when there are none. */
  pendingAlsoCosts?: AlsoCostAsk[];
  /** Additional main phases owed after the postcombat main phase under way
   * (a `withMain` combat's). Turn-scoped. */
  extraMainPhases?: number;
  /**
   * Players with hexproof until end of turn (Lazotep Plating: "**You** and
   * permanents you control gain hexproof"). Turn-scoped rather than a
   * per-player flag: there's no permanent to hang it on. Cleared as each turn begins.
   */
  hexproofPlayers: PlayerId[];
  /** What an Opposition Agent has just exiled from a search: no "this way" read
   * begun by event `at` or before sees these cards (`thisWayEntries`; its ruling:
   * the spell's other effects can't see them in exile). Ends with the turn at
   * the latest. Absent when empty. */
  unseenFinds?: { readonly at: number; readonly objects: readonly ObjectId[] };
  /** Players with hexproof from a quality until end of turn (rule 702.11d —
   * Veil of Summer: "**You** and permanents you control gain hexproof from
   * blue and from black"), one entry per grant. Ends with `hexproofPlayers`.
   * Absent when empty. See `playerHexproofFromBlocks`. */
  hexproofFromPlayers?: {
    readonly player: PlayerId;
    readonly from: { readonly colors?: readonly Color[]; readonly types?: readonly CardType[]; readonly filter?: CardFilter };
  }[];
  /** Abilities each player's spells gain as they're cast for the rest of the
   * turn (`grant-spells-this-turn` — Yidris, Maelstrom Wielder's cascade),
   * one entry per resolution. Ends with the turn. Absent when empty. */
  spellGrantsThisTurn?: SpellGrantThisTurn[];
  /** One-shot damage-prevention shields (Healing Salve — rule 614.9 / ROADMAP
   * Phase 11 EG-6). Each absorbs up to `amount` damage aimed at `target`;
   * consumed (and shrunk / removed) in `dealDamage` before the hit lands.
   * Cleared at the start of the next turn, but for one lasting until a
   * player's next turn (`untilTurnOf`) or while an object stays (`whileOn`). */
  activeReplacements: ActiveReplacement[];
  /** "Damage can't be prevented this turn" (Skullcrack — rule 615.12): set by
   * the `damage-cant-be-prevented` effect, cleared as the next turn begins. */
  /** The player a cost's last decision hands priority back to (117.3c: its
   * payer, who may not be the active player). Used by the next grant of priority. */
  costPriorityTo?: PlayerId;
  /** See `ExtraTurnRider.noPowerUps`: while set, no power-up ability can be
   * activated. Cleared as the turn ends. */
  powerUpsBarredThisTurn?: true;
  damageUnpreventableThisTurn?: true;
  /** Extra turns still owed, in the order they'll be taken (rule 500.7 —
   * ROADMAP Phase 7). `beginTurn` shifts the front instead of advancing the
   * active-player rotation. Time Warp pushes the caster. */
  extraTurns: PlayerId[];
  /** The extra turns whose untap step is skipped (Savor the Moment: "Take an
   * extra turn after this one. Skip the untap step of that turn.") — each the
   * index in `extraTurns` its turn was queued at, which a stack's push and
   * pop keep. Absent with none. */
  extraTurnsSkippingUntap?: number[];
  /** The answers given about the turn that would begin next (rule 614.10 —
   * `Game.askTurnBegin`), until one does. `declined` is `source:occurrence` for
   * a "you may skip" turned down, `owedAgainst` the occurrences a skip owed is
   * used on though another effect skips them anyway; `answered` every
   * occurrence asked that of. Absent with none. */
  turnBeginAnswers?: {
    declined: string[];
    answered: number[];
    owedAgainst: number[];
  };
  /** Permanents to untap as the next turn to actually occur begins, the first
   * thing that happens in it (rule 614.10b — Time Vault), each in the stint it
   * was skipped for. Absent with none. */
  untapAsNextTurnBegins?: { readonly object: ObjectId; readonly stint: number }[];
  /** What the effect that queued an extra turn said about that turn ("during
   * that turn, …", "at the beginning of that turn's end step, …"): each with
   * the index in `extraTurns` its turn was queued at, as
   * `extraTurnsSkippingUntap` keeps it. Taken up as that turn begins; lost
   * with a turn that's skipped or never begins (rule 614.10a). Absent with
   * none. */
  extraTurnRiders?: ExtraTurnRider[];
  /** Additional combat phases still owed *this turn* (Aggravated Assault —
   * ROADMAP Phase 7). When the postcombat main phase ends with this > 0,
   * `endStep` decrements it and re-enters `begin-combat` (a combat phase then
   * another main phase) instead of moving to the end step. */
  extraCombats: number;
  /** Beside `extraCombats`, the marks of those owed (see `AddedPhase.mark`,
   * `null` for none), oldest first, the newest going first (rule 500.8). Only
   * once one has a mark, so it may be shorter: those below it have none. */
  extraCombatMarks?: (number | null)[];
  /** Spells cast this turn by *any* player — the Storm count (rule 702.40a).
   * Reset in `beginTurn`. `PlayerState.spellsCastThisTurn` is the per-player
   * count for "your first spell each turn" triggers. ROADMAP Phase 8. */
  spellsCastThisTurn: number;
  /** The turn before this one's spells, as `beginTurn` found them: how many
   * were cast in all, and the most any one player cast — the
   * `spells-cast-last-turn` condition (the werewolves' transforms). Nothing
   * on the game's first turn, which had none before it. */
  spellsCastLastTurn?: { readonly total: number; readonly mostByOnePlayer: number };
  /** The day/night designation (rule 726 — ROADMAP Phase 10b). `null` until a
   * card or effect first makes it day or night. `beginTurn` then flips it per
   * 726.3/726.4 (day → night if the previous turn's player cast no spells;
   * night → day if they cast two or more). Daybound/nightbound permanents
   * transform when it changes. */
  dayNight: "day" | "night" | null;
  /** The monarch (rule 725 — ROADMAP Phase 10), or `null` when no player is the
   * monarch. The monarch draws a card at the beginning of their end step,
   * and a creature dealing combat damage to the monarch makes its controller
   * the monarch — triggered abilities that use the stack (725.2), carried by
   * `monarchAbility`. */
  monarch: PlayerId | null;
  /** The `eventSeq` each player last became the monarch at: an "until an
   * opponent becomes the monarch" whose event came after its ability went on
   * the stack exiles nothing (rule 610.3b). */
  monarchBecameAt?: Partial<Record<PlayerId, number>>;
  /** The object the monarch's two inherent triggered abilities ride on (rule
   * 725.2 — `cards/monarch.ts`): made the first time anyone becomes the
   * monarch, in the command zone but in no zone list, kind `"emblem"`, its
   * controller always the current monarch (`Game.setMonarch`). Absent until
   * then, and in a state saved before it existed. */
  monarchAbility?: ObjectId;
  /** The player who has the initiative (rule 726), or `null`/absent when no
   * player does — there is no initiative until an effect makes someone take
   * it (726.1). */
  initiative?: PlayerId | null;
  /** The object the initiative's three inherent triggered abilities ride on
   * (rule 726.2 — `cards/initiative.ts`), as `monarchAbility` does the
   * monarch's: made the first time anyone takes it, its controller always
   * the player who has it. */
  initiativeAbility?: ObjectId;
  /** Emblems in the game (rule 114 — ROADMAP Phase 10). An emblem is a
   * player-owned object with one ability and no other characteristics; it has
   * no zone and can't be removed. Its `ability` is applied by the layer system
   * (a `"creatures-you-control"` anthem) and/or `detectTriggers`. */
  emblems: EmblemState[];
  /** The combat-damage step in progress (rule 510 — ROADMAP Phase 11 EG-4).
   * Tracks which sub-pass is running (first strike / regular), whether a
   * regular sub-pass is still owed, and any blocked attackers whose
   * controller still owes a damage-assignment choice. `null` outside the
   * combat-damage step. */
  combatDamage: CombatDamageState | null;
  /** Monotonic source for battlefield-entry timestamps. */
  timestampSeq: number;
  /**
   * Plays shared among the cards one effect gave a permission: "until end of
   * turn, you may cast **a spell from among** those cards" (Locke, Treasure
   * Hunter), "you may play **one of** those cards" (Unlucky Witness), "**up to
   * two** of those cards" — `left` plays to go between them, whichever
   * zones they're in (a milled card exiled instead, rule 701.17c). Each card's
   * own permission (`GameObject.graveyardCastPermission.group`,
   * `GameObject.impulse.group`) names its entry; one card played under it
   * spends one for them all, and at none left none of them may be. An entry
   * no permission names any more goes as a turn begins.
   *
   * `types`: a `perType` group's card types not yet spent — "for each
   * nonland card type, you may cast a spell of that type from among the
   * exiled cards" (Aminatou's Augury): a card is playable under it while it
   * has one of them, and playing it spends the one its caster names (a
   * multi-typed card as either type — the ruling). `left` is unused then.
   */
  permissionGroups?: { readonly id: number; readonly left: number; readonly types?: readonly CardType[] }[];
  /** What has happened this round and this game: the one record every "this
   * turn", "last turn" and "this game" read asks (`journal.ts`). State, not
   * `eventLog`, because bot simulations empty the log. Absent until something
   * is recorded. */
  journal?: Journal;
  eventLog: GameEvent[];
  eventSeq: number;
  nextObjectSeq: number;
}

/**
 * A player's sideboard: their cards outside the game that a wish can find and
 * that they count as a sideboard (rules 400.11a, 701.23j). None for a player
 * with a commander, whatever `GameState.outside` holds: "Commander games do not
 * use sideboards" (903.5e), and all that can be out there is a companion, which
 * enters only by its special action (702.139d).
 */
export function sideboardOf(state: GameState, player: PlayerId): readonly ObjectId[] {
  const outside = state.outside?.[player] ?? [];
  if (outside.length === 0) return outside;
  return hasCommander(state, player) ? [] : outside;
}

/** Whether `player` has a commander (rule 903.3). `PlayerState.commanderIdentity`
 * can't tell: it's empty both with none and with a colourless one, and rule
 * 903.4f makes those two different ("that quality is undefined if that player
 * doesn't have a commander"). */
export function hasCommander(state: GameState, player: PlayerId): boolean {
  return Object.values(state.objects).some((o) => o.owner === player && o.isCommander === true);
}

/** A player's revealed companion while it's still outside the game, or `null`:
 * a wish can have brought it in first, and then it's a card like any other. */
export function revealedCompanion(state: GameState, player: PlayerId): ObjectId | null {
  const card = state.companions?.[player];
  return card !== undefined && state.objects[card]?.zone === "outside" ? card : null;
}

export function createPlayerState(id: PlayerId, rules: GameRules): PlayerState {
  return {
    id,
    life: rules.startingLife,
    manaPool: [],
    maxHandSize: rules.maxHandSize,
    hasLost: false,
    lossReason: null,
    attemptedDrawFromEmptyLibrary: false,
    commanderCastCounts: {},
    commanderDamageTaken: {},
    spellsCastThisTurn: 0,
    usedGraveyardThisTurn: false,
    energy: 0,
    counters: {},
    printings: {},
  };
}

/**
 * Deep-copy a `GameState` — a drop-in replacement for `structuredClone`,
 * several times faster because it can assume what `GameState` guarantees: a
 * plain tree of objects, arrays and primitives (no class instances, `Map`/
 * `Set`, `Date`, typed arrays, cycles or functions). Bot search clones a
 * whole state per simulated candidate (and, for v3, per sampled world), so
 * this is directly on the "how many candidates fit in the decision budget"
 * path.
 *
 * An object's snapshots — `lastKnown`, `earlierLastKnown`, `lastOnStack` —
 * are shared, not copied: they're history, only ever replaced whole (a new
 * departure, a new stint on the stack), never written into, so a copy that
 * points at the same one can't see it change. On a turn-54 four-player board
 * they were 18% of everything copied (2026-10-14).
 * `setFreezeSharedSnapshots(true)` freezes each one it shares, so that a
 * write into one throws — the fuzzer's check that the rule holds.
 */
export function cloneGameState(state: GameState): GameState {
  return clonePlainTree(state) as GameState;
}

let freezeShared = false;

/** Freeze every snapshot {@link cloneGameState} shares, so a write into one
 * throws (fuzzing only: `MTG_FREEZE_SNAPSHOTS=1`). */
export function setFreezeSharedSnapshots(on: boolean): void {
  freezeShared = on;
}

function deepFreeze(value: unknown): void {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return;
  Object.freeze(value);
  for (const key in value) deepFreeze((value as Record<string, unknown>)[key]);
}

/** Deep-copy one piece of a `GameState` — an object of it, say — under the
 * same guarantees as {@link cloneGameState}. */
export function clonePlain<T>(value: T): T {
  return clonePlainTree(value) as T;
}

function clonePlainTree(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    const out = new Array(value.length);
    for (let i = 0; i < value.length; i += 1) out[i] = clonePlainTree(value[i]);
    return out;
  }
  const out: Record<string, unknown> = {};
  for (const key in value) {
    const field = (value as Record<string, unknown>)[key];
    if (
      field !== null &&
      typeof field === "object" &&
      (key === "lastKnown" || key === "earlierLastKnown" || key === "lastOnStack")
    ) {
      // A snapshot: shared — see `cloneGameState`.
      if (freezeShared) deepFreeze(field);
      out[key] = field;
    } else {
      out[key] = clonePlainTree(field);
    }
  }
  return out;
}

// --- selectors -------------------------------------------------------------

/** The name of the face of a multi-face card that is currently up (rule 712) —
 * its front face's name (`object.cardName`) unless a different face was chosen
 * / it was transformed. */
export const faceName = (object: GameObject): string => {
  // A melded permanent's up face is its pair's combined back face (712.8g).
  if (object.melded !== undefined) return object.melded.into;
  const faces = object.faces;
  if (faces === undefined || faces.length < 2) return object.cardName;
  return faces[object.face ?? 0] ?? object.cardName;
};

/** The card name whose printed characteristics this object currently has — a
 * flipped flip card's alternative half (rule 710.1b), else the one it's a copy
 * of (rule 707 / layer 1), else its up face (rule 712), else its own. Every `registry.get` for an object's name, cost, colors, types or
 * P/T goes through this; one for its abilities goes through
 * {@link rulesTextName}. */
export const printedCardName = (object: GameObject): string =>
  object.faceDown !== undefined
    ? faceDownCardName(object.faceDown)
    : object.doors !== undefined && !object.doors.left && !object.doors.right
      ? LOCKED_ROOM
      : (object.flippedName ?? mergedTopName(object) ?? object.copyOf ?? faceName(object));

/** Who put the spell `object` on the stack, cast it if it was cast: its
 * controller, unless something has changed that since (rule 112.2). "You" on
 * the spell is its controller; "a spell you cast" and "if you cast it" are this. */
export const spellCaster = (object: GameObject): PlayerId => object.putOnStackBy ?? object.controller;

/** A merged permanent's topmost component's name, when that isn't its own
 * card (rule 730.2a). */
const mergedTopName = (object: GameObject): string | undefined => {
  const top = object.merged?.components[0];
  return top === undefined || "self" in top ? undefined : top.cardName;
};

/** The registry name of a Room with both doors locked (rule 709.5): an
 * enchantment — Room with no name, mana cost or rules text — an internal
 * definition, like {@link FACE_DOWN_CARDS}, registered by
 * `createDefaultRegistry` (`cards/locked-room.ts`). */
export const LOCKED_ROOM = "Room (Both Doors Locked)";

/** The face a Room's doors give it (`GameObject.doors`): the whole card with
 * both unlocked, one half with one, and 0 with neither (when
 * {@link printedCardName} reads {@link LOCKED_ROOM} instead). */
export const doorsFace = (doors: { readonly left: boolean; readonly right: boolean }): number =>
  doors.left && doors.right ? 0 : doors.left ? 1 : doors.right ? 2 : 0;

/** How a permanent (or spell) came to be face down: manifested (rule
 * 701.40), cloaked (701.58, a manifest with ward {2}), cast face down
 * with morph or megamorph (702.37c) or disguise (702.168a, ward {2}), or
 * `"effect"` — put onto the battlefield face down or turned face down by
 * an effect that neither manifests nor cloaks it (rule 708.2a: Cyber
 * Conversion, Ashcloud Phoenix, Yedora). That one is turned face up only
 * by its morph or disguise cost (702.37e, 702.168d) or by an effect, never
 * for its mana cost (701.40b is manifest's alone). */
export type FaceDownKind = "manifest" | "cloak" | "morph" | "disguise" | "effect";

/** The characteristics an effect lists for what it puts or turns face down,
 * in place of the plain 2/2's (rule 708.2): "They're 2/2 Cyberman artifact
 * creatures" (Cybership, Missy, Cyber Conversion), "They're 2/2 Horror
 * creatures" (Illithid Harvester), "They're 5/5 artifact
 * creatures" (Tezzeret, Cruel Machinist), "It's a Forest land" (Yedora,
 * Grave Gardener — a land with Forest's intrinsic "{T}: Add {G}", rule
 * 305.6, and nothing else). Each is an internal definition
 * (`cards/face-down.ts`), named in {@link FACE_DOWN_AS_CARDS}; a new set of
 * listed characteristics is a new member and a new definition. */
export type FaceDownAs = "2/2 Cyberman artifact creature" | "2/2 Horror creature" | "5/5 artifact creature" | "Forest land";

/** The registry names of the {@link FaceDownAs} definitions. */
export const FACE_DOWN_AS_CARDS: Readonly<Record<FaceDownAs, string>> = {
  "2/2 Cyberman artifact creature": "Face-Down Cyberman (2/2 Artifact Creature)",
  "2/2 Horror creature": "Face-Down Horror (2/2 Creature)",
  "5/5 artifact creature": "Face-Down Artifact Creature (5/5)",
  "Forest land": "Face-Down Forest Land",
};

/** The registry name of what a face-down object is (rule 708.2): the
 * characteristics its effect listed, else its kind's 2/2. */
export const faceDownCardName = (faceDown: { readonly kind: FaceDownKind; readonly as?: FaceDownAs }): string =>
  faceDown.as !== undefined ? FACE_DOWN_AS_CARDS[faceDown.as] : FACE_DOWN_CARDS[faceDown.kind];

/** The registry names of the face-down 2/2s (rule 708.2a): internal
 * definitions, not cards — `cards/face-down.ts` defines them, and
 * `createDefaultRegistry` registers them beside the pool. A face-down
 * permanent's {@link printedCardName} is one of these, so it has its
 * characteristics as its copiable values (708.2): a face-down permanent that
 * becomes a copy stays a face-down 2/2 (708.10, since this is read before
 * `copyOf`), and a Clone copying one copies the 2/2. */
export const FACE_DOWN_CARDS: Readonly<Record<FaceDownKind, string>> = {
  manifest: "Face-Down Creature",
  cloak: "Face-Down Creature (Ward {2})",
  // A morph's face-down 2/2 is manifest's (702.37c); a disguise's has ward
  // {2}, as a cloak's (702.168a).
  morph: "Face-Down Creature",
  disguise: "Face-Down Creature (Ward {2})",
  // Put or turned face down by an effect listing nothing (708.2a).
  effect: "Face-Down Creature",
};

/** Whether a permanent is a token (rule 111.1): a merged permanent is one
 * only if its topmost component is (730.2d), whatever the object it is was —
 * a card mutated onto a token is no token, a token mutated onto a card is
 * one. Leaving the battlefield goes by each component's own (730.3). */
export const isTokenNow = (object: Pick<GameObject, "isToken" | "merged">): boolean => {
  const top = object.merged?.components[0];
  return top === undefined || "self" in top ? object.isToken : top.token;
};

/** What makes a permanent a melded one (`GameObject.melded`): the combined
 * back face it has, and the other card of its pair, by name and owner. */
export interface MeldedInfo {
  readonly into: string;
  readonly with: readonly { readonly cardName: string; readonly owner: PlayerId }[];
}

/** One card or token of a merged permanent (`GameObject.merged`). */
export type MergedComponent =
  | { readonly self: true }
  | { readonly cardName: string; readonly owner: PlayerId; readonly token: boolean };


/** A merged permanent's combined definition's key: the components'
 * names, topmost first. `undefined` for an object that isn't merged. */
export const mergedTextName = (object: GameObject): string | undefined => {
  if (object.merged === undefined || object.merged.components.length < 2) return undefined;
  const own = object.copyOf ?? faceName(object);
  return MERGED_PREFIX + object.merged.components.map((c) => ("self" in c ? own : c.cardName)).join(MERGED_SEPARATOR);
};

/** The card whose rules text this object has (layer 3): another's, once an
 * exchange of text boxes gave it that (`GameObject.textFrom`, rule 612.5),
 * else its {@link printedCardName}. Every read of an object's *abilities* —
 * keywords, statics, triggered and activated abilities, anything else its
 * text says — goes through this; its name, mana cost, colors, types and P/T
 * still come from `printedCardName`. */
export const rulesTextName = (object: GameObject): string => {
  const base = object.textFrom ?? mergedTextName(object) ?? printedCardName(object);
  const changes = textChangesOf(object);
  return changes === undefined ? base : textChangedKey(base, changes);
};

/** The text changes that apply to `object` (rule 612, layer 3), in
 * timestamp order (613.7) — `PtModifier.textChange` — or `undefined` for
 * none. Its rules text is its base definition's with these applied
 * ({@link rulesTextName}). */
export const textChangesOf = (object: GameObject): readonly TextChange[] | undefined => {
  let changes: { readonly change: TextChange; readonly at: number }[] | undefined;
  for (const m of object.modifiers) {
    if (m.textChange !== undefined) (changes ??= []).push({ change: m.textChange, at: m.timestamp ?? 0 });
  }
  if (changes === undefined) return undefined;
  return changes.sort((a, b) => a.at - b.at).map((c) => c.change);
};

/** The card name its abilities come from when that isn't its own
 * {@link printedCardName}: another card's text box (rule 612.5), a merged
 * permanent's combined definition (702.140e), or either changed by a
 * text-changing effect (612.1). A triggered or activated ability is found by
 * this name and its index. `undefined` otherwise. */
export const textNameOf = (object: GameObject): string | undefined => {
  const base = object.textFrom ?? mergedTextName(object);
  const changes = textChangesOf(object);
  if (changes === undefined) return base;
  return textChangedKey(base ?? printedCardName(object), changes);
};

/** The name `object` has (rule 201.2): one a copy exception gave it
 * ("except its name is Mishra's Warform" — a copiable `setName`, the latest
 * such), else its card's ({@link printedCardName}). What the legend rule and
 * every "named …" read; the registry stays keyed by `printedCardName`. */
/** The mana cost a copiable value gives it in place of its printed one: a
 * prototyped spell's (`setManaCost`, rule 718.3b), or none at all
 * (`noManaCost` — eternalize, embalm: mana value 0, rule 202.1b). The
 * latest wins; `undefined` when nothing replaces the printed cost. */
export const manaCostOverride = (object: GameObject): string | null | undefined => {
  for (let i = object.modifiers.length - 1; i >= 0; i -= 1) {
    const m = object.modifiers[i];
    if (m.copiable !== true) continue;
    if (m.noManaCost === true) return null;
    if (m.setManaCost !== undefined) return m.setManaCost;
  }
  return undefined;
};

/** The starting loyalty a copiable value gives it in place of its printed
 * one (`startingLoyalty` — "except its starting loyalty is 1"), the latest
 * such; `undefined` when it has its printed loyalty. */
export const startingLoyaltyOverride = (object: GameObject): number | undefined =>
  object.modifiers.findLast((m) => m.copiable === true && m.startingLoyalty !== undefined)?.startingLoyalty;

export const nameOf = (object: GameObject): string => {
  // An effect that names it (Awakening of Vitu-Ghazi, Witness Protection) beats
  // anything its copiable values say, even face down: the latest wins (613.7).
  let named = object.staticName;
  for (let i = object.modifiers.length - 1; i >= 0; i -= 1) {
    const m = object.modifiers[i];
    if (m.copiable === true || m.setName === undefined) continue;
    const timestamp = m.timestamp ?? 0;
    if (named === undefined || timestamp > named.timestamp) named = { name: m.setName, timestamp };
    break;
  }
  if (named !== undefined) return named.name;
  // A face-down permanent has no name at all (rule 708.2a), whatever a copy
  // effect's exception would have named it: its registry key stands in. So
  // does a Room with both doors locked (709.5).
  if (object.faceDown !== undefined || printedCardName(object) === LOCKED_ROOM) return printedCardName(object);
  for (let i = object.modifiers.length - 1; i >= 0; i -= 1) {
    const m = object.modifiers[i];
    if (m.copiable === true && m.setName !== undefined) return m.setName;
  }
  return printedCardName(object);
};

/**
 * How many permanents `ids` stand for: a compacted token stack is every token
 * in it (`GameObject.stackCount`), not one object. Anything that counts
 * permanents — "for each Goblin you control", "three or more artifacts" — has
 * to count this way, or a board of stacked tokens reads as a handful.
 *
 * One known gap: an "other"/"another" count leaves out its source object
 * whole, so a stacked token whose *own* ability counts "each other X" misses
 * its stack-mates. Asking whether they match would mean asking whether the
 * source matches, which can recurse into that same ability. No stackable
 * token has such an ability today.
 */
export const permanentCount = (state: GameState, ids: readonly ObjectId[]): number =>
  ids.reduce((n, id) => n + (state.objects[id]?.stackCount ?? 1), 0);

/** The phased-out permanents (rule 702.26) — see `GameState.phasedOut`. Read
 * only by what the rules say sees them: the untap step's phasing, cleanup's
 * damage removal and end of "until end of turn" effects (514.2), effects
 * expiring (702.26f), a player leaving (702.26k), and a view. */
export const phasedOutIds = (state: GameState): readonly ObjectId[] => state.phasedOut ?? [];

/** "Doesn't untap during **that player's** next untap step" still holds this
 * permanent through `player`'s (`GameObject.skipsUntapOf`). */
export const heldThroughUntapStepOf = (object: GameObject, player: PlayerId): boolean =>
  object.skipsUntapOf?.some((hold) => hold.player === player) === true;

/** Every attacker `blockerId` blocks that is still attacking and still
 * blocked by it: the one it was declared blocking and the rest of that
 * attacker's band (rule 702.22h). An attacker removed from combat leaves it
 * blocking nothing there (506.4), though it stays a blocking creature. */
export function blockedAttackersOf(state: GameState, blockerId: ObjectId): ObjectId[] {
  const blocker = state.objects[blockerId];
  if (blocker === undefined || blocker.blocking === null) return [];
  return [blocker.blocking, ...(blocker.blockingAlso ?? [])].filter((id) => {
    const attacker = state.objects[id];
    return attacker?.zone === "battlefield" && attacker.attacking !== null && attacker.blockedBy.includes(blockerId);
  });
}

export const activePlayerOf = (state: GameState): PlayerId =>
  state.turnOrder[state.turn.activePlayerIndex];

/** Max speed (rule 702.179e): a player has it while their speed is 4. */
export const MAX_SPEED = 4;

/** A player's speed for anything that reads it (rule 702.179f): 0 while
 * they have none. See `PlayerState.speed`. */
export const speedOf = (state: GameState, player: PlayerId): number => state.players[player]?.speed ?? 0;

/**
 * Whether `them` attacked `you` during their last turn — the most recent
 * turn they took (Weathered Sentinels' "players who attacked you during
 * their last turn"): declared a creature attacking `you` then, not only a
 * planeswalker of yours (the O-Kagachi, Vengeful Kami ruling). See
 * `PlayerState.attackedByOnTurn`.
 */
export function attackedYouDuringTheirLastTurn(state: GameState, you: PlayerId, them: PlayerId): boolean {
  const last = state.players[them]?.lastTurnTaken;
  return last !== undefined && state.players[you]?.attackedByOnTurn?.[them] === last;
}

/**
 * The number of `player`'s last turn as "their controller's last turn" means
 * it (Halls of Mist, Tangle Kelp): on their own turn, the one before it, not
 * the one under way; on another's, the most recent they took. `undefined` if
 * they've had none.
 */
export function controllersLastTurn(state: GameState, player: PlayerId): number | undefined {
  const seat = state.players[player];
  if (seat === undefined) return undefined;
  return activePlayerOf(state) === player ? seat.turnTakenBefore : seat.lastTurnTaken;
}

/**
 * Everything two tokens must share to be folded into one stack, as one
 * string — `Game`'s `findMergeableStack` compares a new batch against it and
 * `recompactTokens` groups on it, and the bots use it to tell twin targets
 * apart (`bot/twins.ts`). Anything that tells one token from another belongs
 * here — whose it is (owner as well as controller: a token someone stole for
 * good isn't one of the thief's own), its state, what's been done to it
 * (counters, modifiers, a goad, a control effect, a transformed face, a choice
 * made as it entered), what's still due to happen to it, and the turn it
 * entered — "each creature token you control that entered this turn"
 * (Redoubled Stormsinger) tells tokens made today from yesterday's twins.
 */
export function tokenFoldKey(o: GameObject): string {
  return JSON.stringify([
    o.cardName,
    o.copyOf,
    // A merged permanent is its components (rule 730.2) — never one of a stack.
    o.merged ?? null,
    o.temporaryCopies ?? null,
    o.copyBase ?? null,
    o.owner,
    o.controller,
    o.tapped,
    o.summoningSick,
    o.enteredBattlefieldOnTurn,
    o.attackedOnTurns ?? null,
    o.face ?? 0,
    o.exileAtEndStep ?? false,
    o.sacrificeAtEndStep ?? false,
    o.goadedBy ?? [],
    o.goadedForGameBy ?? [],
    o.suspectedAt ?? null,
    o.monstrous ?? false,
    o.harnessed ?? false,
    o.renowned ?? false,
    o.saddled ?? false,
    o.saddledThisTurn ?? null,
    o.crewedThisTurn ?? null,
    o.enlistedIn ?? null,
    o.exertedBy ?? null,
    o.exertedOnTurn ?? null,
    o.skipsNextUntap ?? false,
    o.skipsFurtherUntaps ?? null,
    o.skipsUntapOf ?? null,
    o.controlEffects ?? null,
    o.controlEndsAtCleanup,
    o.chosenOnEnter ?? null,
    o.chosenCreatureType ?? null,
    o.chosenNames ?? null,
    o.chosenPlayer ?? null,
    o.secretChoice ?? null,
    o.chosenPermanent ?? null,
    o.linkedExile ?? null,
    o.createdWith ?? null,
    o.counters,
    o.counterTimestamps ?? null,
    o.modifiers,
    o.regenerationShields ?? 0,
    o.cantBeRegeneratedTurn ?? null,
    o.exileIfDiesTurn ?? null,
    o.adaptAsThoughNoCountersTurn ?? null,
  ]);
}

/** `object`'s `tally` up to the end of the turn before `turn`: what it had
 * done before the turn now being played. */
export function settledTally(
  object: GameObject,
  turn: number,
): { readonly lifeTaken: number; readonly cardsDrawn: number } {
  const tally = object.tally;
  if (tally === undefined) return { lifeTaken: 0, cardsDrawn: 0 };
  if (tally.thisTurn.turn !== turn) return tally;
  return {
    lifeTaken: tally.lifeTaken - tally.thisTurn.lifeTaken,
    cardsDrawn: tally.cardsDrawn - tally.thisTurn.cardsDrawn,
  };
}
