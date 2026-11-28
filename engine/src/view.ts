/**
 * A redacted, self-contained snapshot of the game from one player's seat.
 *
 * Hidden information stays hidden: you see your own hand in full, an
 * opponent's hand only as ids (so a client can render face-down cards —
 * accurate in count and slot, but not identity), and library contents are
 * never exposed except where something specific reveals them (the top card,
 * or a look-and-choose effect's candidates). Battlefield and stack objects
 * carry their **computed** characteristics, so a client never needs the card
 * registry or the layer system to render a board.
 */

import type { CardRegistry, CardType, CombatWord, Keyword, Supertype } from "./cards.js";
import {
  abilitiesLostAt,
  computeCharacteristics,
  extraIntrinsicManaColors,
  grantedStatics,
  hasLostAbilities,
  manaAbilitiesLostAt,
  inactiveStandIn,
  intrinsicManaColors,
  modifierGrantApplies,
  pairedPartner,
  restrictionsOf,
  effectiveSupertypes,
  staticConditionMet,
  withComputedCache,
} from "./characteristics.js";
import { protectionLabel } from "./effects.js";
import { isManaAbility } from "./abilities.js";
import type { GameEvent } from "./events.js";
import { journalTotal } from "./journal.js";
import type { Color, ManaPool } from "./mana.js";
import { poolCounts } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type {
  AwaitingDecision,
  DecisionSource,
  GameObject,
  GameResult,
  GameState,
  PlayerCounterKind,
  PriorityState,
  PublicStint,
  Sector,
  TurnState,
  ZoneType,
} from "./state.js";
import { decisionHasSource } from "./decisions/registry.js";
import type { DungeonMap, UnavailableAbility } from "./actions.js";
import { dungeonMap } from "./cards/dungeons.js";
import { goadersOf } from "./goad.js";
import { hasRingBearerDesignation } from "./ring.js";
import {
  activePlayerOf,
  faceName,
  isTokenNow,
  libraryTopHolds,
  manaCostOverride,
  nameOf,
  phasedOutIds,
  printedCardName,
  revealedCompanion,
  rulesTextName,
  sideboardOf,
} from "./state.js";
import {
  answeringPlayer,
  askedPlayer,
  controlOf,
  decidingPlayer,
  perspectiveOf,
  playersControlledBy,
} from "./player-control.js";
import { EVERY_CREATURE_TYPE, withoutTypeMarkers } from "./subtypes.js";
import { stickerSheetsView } from "./stickers.js";
import { takeBackTurns, whyCannotTakeBack } from "./take-back.js";
import type { TargetRef } from "./target.js";
import { isStepWatch } from "./delayed-at.js";
import type { Expiry } from "./duration.js";
import type { DelayedStep, DelayedWhich } from "./delayed-at.js";

export interface PublicPlayerInfo {
  readonly id: PlayerId;
  readonly life: number;
  readonly manaPool: ManaPool;
  readonly handSize: number;
  readonly librarySize: number;
  readonly graveyardSize: number;
  /** How many cards they have outside the game — their sideboard (rule
   * 400.11a). What those are, only their owner's view says (`zones.sideboard`). */
  readonly sideboardSize: number;
  /** Their revealed companion while it's still outside the game (rules 103.2b,
   * 702.139a), for everyone to see: its object is in `objects` for every seat.
   * `null` for a player with none, or once it's in the game. */
  readonly companion: ObjectId | null;
  readonly landsPlayedThisTurn: number;
  /** How many lands this player may play this turn — the rules' one, plus
   * extra land drops (Oracle of Mul Daya, Explore). */
  readonly maxLandsThisTurn: number;
  readonly hasLost: boolean;
  readonly lossReason: string | null;
  /** Combat damage this player has taken from each commander so far, one
   * entry per commander that has dealt any (rule 903.10a — 21 from one
   * commander loses the game). */
  readonly commanderDamageTaken: readonly CommanderDamage[];
  /** Times this player has cast each commander (by name) from the command
   * zone — each adds {2} generic to that commander's cost next time (rule
   * 903.8). */
  readonly commanderCastCounts: Readonly<Record<string, number>>;
  /** Energy counters this player has ({E} — rule 122 / ROADMAP Phase 10). */
  readonly energy: number;
  /** The other counters this player has — poison, experience (rule 122.1;
   * see `PlayerState.counters`). A kind they have none of is absent. Ten
   * poison counters lose the game (`POISON_LETHAL`). */
  readonly counters: Readonly<Partial<Record<PlayerCounterKind, number>>>;
  /** The enduring story designation (rule 702.195b — storied), for the rest
   * of the game once had. */
  readonly enduringStory: boolean;
  /** The city's blessing (rule 702.131 — ascend), for the rest of the game
   * once had. */
  readonly citysBlessing: boolean;
  /** Their speed (rule 702.179), 1 to 4 — max speed at 4 — or `null` while
   * they have none (702.179b). Public: each player tracks it openly. */
  readonly speed: number | null;
  /** The dungeon they're in (rule 309 — public: the command zone), the room
   * their venture marker is on (an index into `map.rooms`), and the map to
   * draw it by; `null` in none. */
  readonly dungeon: { readonly name: string; readonly room: number; readonly map: DungeonMap } | null;
  /** The dungeons they've completed (rule 309.7), oldest first. */
  readonly completedDungeons: readonly string[];
  /** How many cards are in their Attraction deck (rule 717.2), face down in
   * the command zone: its size is public, its cards and order hidden from
   * everyone, its owner too. `0` for a player who has none. */
  readonly attractionDeckSize: number;
  /** Their junkyard (rule 717.6a): the Attraction cards that went to the
   * command zone instead of a graveyard, hand or library, oldest first —
   * face up and public, each in `objects` for every seat (with its `lights`). */
  readonly junkyard: readonly ObjectId[];
  /** The sticker sheets they have access to (rules 103.2d, 123.2c),
   * revealed to everyone: each with its name stickers and whether each is on
   * an object they own now (123.3). Empty for a player who plays without
   * stickers. */
  readonly stickerSheets: readonly {
    readonly name: string;
    readonly names: readonly { readonly text: string; readonly used: boolean }[];
  }[];
}

/** Combat damage one commander has dealt one player. */
export interface CommanderDamage {
  readonly commander: ObjectId;
  /** The commander's name — also given for a commander that isn't visible to
   * this viewer right now (tucked into a library, say). */
  readonly name: string;
  readonly owner: PlayerId;
  /** Its owner's chosen printing, as on `VisibleObject.art`. */
  readonly art: string | null;
  readonly amount: number;
}

/** The damage needed from one commander to lose (rule 903.10a). */
export const COMMANDER_DAMAGE_LETHAL = 21;

export interface VisibleObject {
  readonly id: ObjectId;
  /** This permanent's true identity ("Clone"). Render the *face* from
   * `copyOf ?? cardName`, but name it in the log by `cardName`. */
  readonly cardName: string;
  /** The name this permanent is a copy of (rule 707), or `null`. Its
   * mana cost / text / computed P/T already reflect the copy. */
  readonly copyOf: string | null;
  /** The name of the multi-face card's up face (rule 712 — ROADMAP Phase 10);
   * `= cardName` for a single-faced card. The client renders the face from
   * `copyOf ?? faceName`. `faces` lists all of them (front first) or is `null`. */
  readonly faceName: string;
  /** The name a copy exception gave it ("except its name is Mishra's
   * Warform"), when that isn't its card's — the name to show, while
   * `copyOf ?? faceName` still says which card's face to draw. */
  readonly name?: string;
  readonly faces: readonly string[] | null;
  /**
   * An adventurer card's Adventure or an omen card's Omen — the spell half
   * that shares its creature's frame (rules 715, 719) — while the card shows
   * its creature face anywhere but the battlefield, so a hand or a graveyard
   * can show both halves as the printed card does. Also a preparation card's
   * prepare spell (rule 722.2, the inset frame of its one face), in every
   * zone and on a copy of it: on the battlefield it's the spell a prepared
   * permanent's controller casts a copy of. Absent otherwise.
   */
  readonly spellFace?: {
    readonly name: string;
    readonly manaCost: string | null;
    readonly types: readonly string[];
    readonly subtypes: readonly string[];
    readonly text: string;
  };
  /** A split card shown whole, off the battlefield (rule 709.4): each
   * half's mana cost, left then right, so it can be drawn with two costs
   * as the printed card is rather than their sum. Absent otherwise. */
  readonly splitCosts?: readonly [string | null, string | null];
  /** A Scryfall link pinning this card's art (its up face's / copied card's),
   * or `null` for the by-name lookup. See `CardDefinition.art`. Carries the
   * printing this card's owner brought when they chose one (`DeckList.printings`). */
  readonly art: string | null;
  /** The up face is the card's *second printed image* — a transforming DFC
   * turned over, or an MDFC's other face; false for an adventure's spell
   * half, which shares one image with its creature. A client needs this to
   * ask for the right side of a printing named by card id. */
  readonly faceIsBack: boolean;
  readonly owner: PlayerId;
  readonly controller: PlayerId;
  /** A battle's protector (rule 310.9) — who defends it when it's attacked. */
  readonly protector?: PlayerId;
  readonly zone: ZoneType;
  readonly manaCost: string | null;
  /**
   * What this card *actually* costs right now, when that differs from the
   * printed `manaCost` — Blasphemous Act at {1}{R} with nine creatures out,
   * a commander carrying tax, a spell being taxed by Thalia.
   *
   * Absent when nothing has changed the cost, so a client can render
   * `manaCost` and only reach for this when it's there. Only ever set for
   * cards in the **viewer's own** hand or command zone: it's the cost *they*
   * would pay, and computing it for another seat's cards would be both
   * meaningless and a small information leak.
   *
   * Only the generic portion is rewritten, because that is the only part any
   * cost modification touches — which keeps this exact rather than a
   * re-serialisation of a parsed cost that could get hybrid or Phyrexian
   * pips wrong.
   */
  readonly effectiveManaCost?: string;
  /**
   * A commander in the command zone: the commander tax (rule 903.8) its
   * owner still owes on a cast from there now, which a client draws as its
   * own "+N" beside `effectiveManaCost`. Less than 2 per previous cast when
   * a reduction outran the printed generic part and came off the tax too
   * (rule 601.2f — the tax is added, then reductions apply: affinity on a
   * commander), and 0 once reductions cover it all. Absent when there's no
   * tax (no previous cast, or it's paid in life — Liesa).
   */
  readonly commanderTax?: number;
  readonly text: string;
  readonly types: readonly CardType[];
  /** "Legendary", "Basic", "Snow", "World" as they apply now (rule 205.4):
   * a copy made "not legendary" isn't, and one a static makes legendary is
   * (`effectiveSupertypes`). */
  readonly supertypes: readonly Supertype[];
  readonly subtypes: readonly string[];
  /** It is every creature type (changeling, rule 702.73a, or an effect that
   * says so): `subtypes` lists only the printed words. */
  readonly everyCreatureType?: true;
  /** Computed power/toughness; `null` for objects that are not creatures. */
  readonly power: number | null;
  readonly toughness: number | null;
  /** A planeswalker's loyalty — its `counters.loyalty` on the battlefield,
   * its printed loyalty anywhere else — or `null` for anything else. */
  readonly loyalty: number | null;
  /** A card in a hand that every player knows (it went there from a public
   * zone — a bounce, a regrowth — or was revealed into or in that hand, and
   * hasn't been hidden since): shown face up to everyone, and marked in its
   * owner's hand so they know the table knows it. Absent otherwise. */
  readonly knownToAll?: true;
  readonly keywords: readonly Keyword[];
  /** Its total toxic value (rule 702.164b): every toxic ability it has, a
   * printed one and each one granted ("Other Rats you control have toxic
   * 1"), summed; 0 for none. Not among `keywords`, being a number. */
  readonly toxic: number;
  /** Combat restrictions from static abilities (`"cant-attack"` from a
   * Pacifism, `"must-attack"` from Juggernaut). */
  readonly restrictions: readonly CombatWord[];
  /** Computed colours (rule 105 / layer 5) — e.g. `["U"]` for a Turn-to-
   * Frogged permanent, `[]` for something colourless. */
  readonly colors: readonly Color[];
  readonly tapped: boolean;
  readonly damageMarked: number;
  /** Regeneration shields waiting to replace its next destruction this turn
   * (rule 701.19) — public, like the damage they'd answer. */
  readonly regenerationShields: number;
  readonly counters: Readonly<Record<string, number>>;
  /** An Attraction card's lit-up numbers (rule 717.1), ascending — the
   * printing its owner brought. Absent on anything else. */
  readonly lights?: readonly number[];
  readonly summoningSick: boolean;
  /** A player, or an opponent's planeswalker (an `ObjectId`), or `null`. */
  readonly attacking: PlayerId | ObjectId | null;
  /** Put onto the battlefield attacking, with what it attacks still to be
   * chosen by its controller (rule 508.4 — the `enter-attacking` decision,
   * asked or queued): `attacking` holds only a placeholder until then, so no
   * arrow is drawn for it. */
  readonly attackingUndecided?: true;
  readonly blocking: ObjectId | null;
  /** The rest of a band it blocks (rule 702.22h) beyond `blocking`. */
  readonly blockingAlso?: readonly ObjectId[];
  /** The band it attacks in (rule 702.22c): the label its band mates share. */
  readonly band?: ObjectId;
  /** An attacker that has been blocked this combat — and stays blocked
   * after its blockers leave (rule 509.1h), which no blocker's `blocking`
   * can show. Lets a board tile standing for several attacking tokens say
   * how many of them are blocked. */
  readonly blocked: boolean;
  readonly kind: "card" | "ability" | "emblem";
  readonly sourceObjectId: ObjectId | null;
  readonly abilityIndex: number | null;
  readonly targets: readonly TargetRef[] | null;
  /** The value chosen for `{X}` if this is an X spell/permanent, else `null`. */
  readonly xValue: number | null;
  readonly isToken: boolean;
  /**
   * How many identical tokens this one object stands for (`GameObject.
   * stackCount`), or `null` for the ordinary one-object-one-permanent case.
   * A purely internal resource-safety compaction — but the board would
   * otherwise show one 1/1 where the player really has thousands, so the
   * client renders it as a `×N` badge.
   */
  readonly stackCount: number | null;
  /** A copy of a spell on the stack (storm / Twincast) — ROADMAP Phase 8. */
  readonly isCopy: boolean;
  /** Suspended in exile with time counters (`counters.time`) — ROADMAP Phase 6b. */
  readonly suspended: boolean;
  /** Foretold — face-down in exile, castable later for its foretell cost.
   * Only ever `true` in the owner's own view (opponents don't see the id's
   * entry in `objects` at all). */
  readonly foretold: boolean;
  /** Plotted in exile (rule 702.170), face up: its owner may cast it free,
   * as a sorcery, on a later turn. Absent when not. */
  readonly plotted?: true;
  /** A face-down permanent (rule 708 — manifested, cloaked, cast face down,
   * or put or turned face down by an effect, `"effect"`): everything else
   * here is what it is face down (`cardName` is its internal name — the 2/2,
   * or the characteristics its effect listed, rule 708.2 — no art), and
   * `card` — the card it really is — is in its controller's view only, who
   * may look at it (708.5). */
  readonly faceDown?: { readonly kind: "manifest" | "cloak" | "morph" | "disguise" | "effect"; readonly card?: string };
  /** A Room on the battlefield (rule 709.5): its two doors — the card's
   * left and right halves, each with its name, mana cost and rules text —
   * and whether each is unlocked. The rest of this object is what the
   * permanent has: only the unlocked doors' text, a locked Room no name. */
  /** A Class on the battlefield's level (rule 716.2b) — 1 without one
   * (716.2d); absent for anything that isn't a Class there. */
  readonly classLevel?: number;
  readonly doors?: readonly {
    readonly door: "left" | "right";
    readonly name: string;
    readonly manaCost: string | null;
    readonly text: string;
    readonly unlocked: boolean;
  }[];
  /** The permanent this Aura/Equipment is attached to, or `null`. */
  readonly attachedTo: ObjectId | null;
  /** The player this Aura is attached to — a Curse's "Enchant player" —
   * or `null`. Never set alongside `attachedTo`. */
  readonly attachedToPlayer: PlayerId | null;
  /** Is this its owner's designated commander (rule 903)? */
  readonly isCommander: boolean;
  /** Every player who has goaded this creature (rule 701.15), however —
   * a one-shot goad, one for the rest of the game, or a static one (`goad.ts`'s
   * `goadersOf`). Empty off the battlefield or when it isn't goaded. A
   * designation, not an ability, so nothing else in the view shows it. */
  readonly goadedBy: readonly PlayerId[];
  /** Phased out (rule 702.26): on the battlefield (`zone` says so) but
   * treated as though it doesn't exist until it phases in — listed in
   * `zones.phasedOut`, never in `zones.battlefield`. What it shows (P/T,
   * keywords, types, colours) is what it was as it phased out. */
  readonly phasedOut?: true;
  /** Suspected (rule 701.60). Its menace and can't-block already show among
   * `keywords` and `restrictions`; this is the designation itself. */
  readonly suspected: boolean;
  /** Its sector designation (rule 702.158b — space sculptor), if it has one. */
  readonly sector?: Sector;
  /** Saddled until end of turn (rule 702.171b) — a designation, which
   * "attacks while saddled" abilities read. */
  readonly saddled: boolean;
  /** A Case with the solved designation (rule 719.3b). Absent when not. */
  readonly solved?: true;
  /** Harnessed (rule 701.64b): its ∞ abilities work. Absent when not. */
  readonly harnessed?: true;
  /** Its controller's Ring-bearer (rule 701.54) — a designation; the Ring
   * emblem says what that gives it. */
  readonly ringBearer: boolean;
  /** The creature it's paired with by soulbond (rule 702.95b). Absent when
   * it's unpaired. */
  readonly pairedWith?: ObjectId;
  /** On a permanent: it's prepared (rule 722.3a) — its controller may cast
   * `preparedSpell`, its prepare spell's copy in exile (722.3c). On that
   * copy in exile: `preparedBy`, the permanent it belongs to. */
  readonly preparedSpell?: ObjectId;
  readonly preparedBy?: ObjectId;
  /** On a permanent: the cards in exile linked to it — what an O-Ring holds
   * until it leaves (rule 610.3 — Banishing Light), or cards exiled with it
   * that it lets someone play (Theater of Horrors, Maralen), or exiled with
   * it (rule 607.2a — a hideaway card, Mosswort Bridge's). Ids only: a
   * card exiled face down (rule 406.3) is in the list, but its identity
   * stays out of `objects` for a seat that can't look at it, so a client
   * draws a card back. Absent when it holds nothing. */
  readonly holding?: readonly ObjectId[];
  /** On a permanent: what was chosen as it entered (rule 614.12) — a word
   * (Frostcliff Siege's "Jeskai" or "Temur"), a colour letter (Heraldic
   * Banner's `"U"`), a number, a creature type (Urza's Incubator), or the
   * card names chosen for it (Pithing Needle — comma-separated). Public:
   * the choice is announced. Absent when it had nothing to choose. */
  readonly chosen?: string;
  /** On a permanent: "the chosen player" (`GameObject.chosenPlayer` —
   * Black Vise's opponent, Triarch Stalker's last chosen). Public, unless it
   * was chosen secretly. */
  readonly chosenPlayer?: PlayerId;
  /** On a permanent with a secret choice not yet revealed
   * (`GameObject.secretChoice`): `"hidden"` to everyone but the player who made
   * it, whose view leaves out `chosen` and `chosenPlayer`; `"yours"` to that
   * player, who sees them. Absent once it's revealed. */
  readonly secretChoice?: "hidden" | "yours";
  /** On a permanent: the die results stored on it, oldest first (Centaur of
   * Attention — `GameObject.storedResults`). Public. Absent with none. */
  readonly storedResults?: readonly number[];
  /** The words of the name stickers on it, oldest first (rule 123.6) —
   * public, like the name they make (`name`). Absent with none. */
  readonly nameStickers?: readonly string[];
}

export interface PlayerView {
  readonly turnOrder: readonly PlayerId[];
  /** The table's seating once the turn order has been reversed (Aeon Engine
   * — `GameState.seating`): where each player sits and the colour their
   * seat has don't move. Absent while it's the turn order; read with
   * `seatingOf`. */
  readonly seating?: readonly PlayerId[];
  /** Who the "highroll" (or a configured `startingPlayer`) chose to go
   * first — fixed for the life of the game, unlike `activePlayer`. */
  readonly startingPlayer: PlayerId;
  /** How many times the game has restarted (rule 727 — Karn Liberated),
   * absent before the first: a client starts its game screen afresh on a
   * new value, as on a new game in the room. */
  readonly restarts?: number;
  readonly activePlayer: PlayerId;
  readonly turn: TurnState;
  readonly priority: PriorityState;
  readonly awaiting: AwaitingDecision | null;
  /**
   * The card behind `awaiting` — what a client shows so a forced sacrifice or
   * discard isn't a prompt out of nowhere. `null` when nothing is pending, or
   * when the decision isn't any one card's doing (combat declarations, the
   * cleanup discard, the mulligan).
   *
   * The named object is usually in `objects` (a sorcery asking as it
   * resolves is still on the stack, an ability's source on the battlefield),
   * but not always — a spell that exiled itself, or a face-down foretold card
   * — so `cardName` stands on its own and a client must tolerate a missing
   * `objects[object]`.
   */
  readonly decisionSource: DecisionSource | null;
  readonly result: GameResult;
  readonly players: Readonly<Record<PlayerId, PublicPlayerInfo>>;
  readonly objects: Readonly<Record<ObjectId, VisibleObject>>;
  readonly zones: {
    readonly battlefield: readonly ObjectId[];
    /** The phased-out permanents (rule 702.26) — on the battlefield, but
     * treated as though they don't exist, so never in `battlefield`. Each
     * object's `phasedOut` says so too; a client draws them apart (dimmed)
     * with their controller's permanents. */
    readonly phasedOut: readonly ObjectId[];
    readonly stack: readonly ObjectId[];
    /** Single shared zones — each object's `owner` says whose card it is. */
    readonly exile: readonly ObjectId[];
    /** Whose card each exiled id is, for every one of them: whose a
     * face-down card is stays public (rule 406.3 hides only its face), and
     * a hidden one has no entry in `objects` to say so. */
    readonly exileOwners: Readonly<Record<ObjectId, PlayerId>>;
    readonly command: readonly ObjectId[];
    /** Every hand's ids are here regardless of whose it is (so an opponent's
     * hand can render as N face-down cards) — but `objects` below only
     * carries the identity of your own hand's cards, of any card that was
     * revealed, and of a hand played revealed (`StaticAbility.visibility`). */
    readonly hands: Readonly<Record<PlayerId, readonly ObjectId[]>>;
    readonly graveyards: Readonly<Record<PlayerId, readonly ObjectId[]>>;
    /** The viewer's own cards outside the game — their sideboard (rule
     * 400.11a), which they may look at and nobody else sees. Empty for a
     * player with none, and always in a Commander game (903.5e). */
    readonly sideboard: readonly ObjectId[];
  };
  /** Each player's top library card, if some permanent they control makes it
   * public knowledge (e.g. Oracle of Mul Daya), or any permanent does (Wizened
   * Snitches' "players play with …") — `null` otherwise. The
   * viewer's own also when a permanent of theirs lets them look at it any
   * time (Glarb, Calamity's Augur), which no one else's view shows. */
  readonly revealedLibraryTop: Readonly<Record<PlayerId, ObjectId | null>>;
  /** The day/night designation (rule 726 — ROADMAP Phase 10b), or `null` until
   * a card first makes it day or night. */
  readonly dayNight: "day" | "night" | null;
  /** The monarch (rule 725 — ROADMAP Phase 10), or `null`. */
  readonly monarch: PlayerId | null;
  /** The take-back house rule, in a game that allows it (`take-back.ts`):
   * how many each player gets, how many each has used, the turns the viewer
   * could take the game back to the start of now (oldest first, each with
   * whose turn it is), and why they can't take anything back (`null`: they
   * can). */
  readonly takeBacks?: {
    readonly limit: number | "unlimited";
    readonly used: Readonly<Record<PlayerId, number>>;
    readonly turns: readonly { readonly turn: number; readonly player: PlayerId }[];
    readonly cannot: string | null;
  };
  /** The player who has the initiative (rule 726), or `null`. */
  readonly initiative: PlayerId | null;
  /** Emblems in the game (rule 114 — ROADMAP Phase 10), owner + text only. */
  /** `source` is the name of the card that created the emblem, or `null`.
   * `object` is the emblem's object when it has activated abilities — the
   * `source` its owner's `activate-ability` offers name (Karn, Living
   * Legacy's emblem). */
  readonly emblems: readonly {
    readonly owner: PlayerId;
    readonly text: string;
    readonly source: string | null;
    readonly object?: ObjectId;
  }[];
  /** The delayed triggered abilities waiting to trigger (rule 603.7), public
   * as the spells and abilities that made them were: "return it at the
   * beginning of the next end step", rebound's cast at its next upkeep. Each
   * with its controller, the name of the source that made it, its text, the
   * step it waits for (`at` — `null` for one that waits on an event: a
   * permanent leaving, the next spell cast), and the cards it acts on that
   * this viewer can see. The client lists them beside each player's emblems.
   * Absent from a hand-built view. */
  readonly delayedTriggers?: readonly DelayedTriggerView[];
  /** The effects a resolved spell or ability left on a player or on the game
   * for a while (rule 611.2): "players can't gain life this turn" (a timed
   * static), "you have protection from everything until your next turn"
   * (a player effect), "prevent all combat damage this turn" (a replacement
   * that isn't on one permanent), and what can be read off the state itself
   * (hexproof this turn, extra turns and combats, damage that can't be
   * prevented). Each with the player whose panel lists it, what made it, its
   * words and when it ends. Effects on a permanent show on that permanent.
   * Absent from a hand-built view. */
  readonly lastingEffects?: readonly LastingEffectView[];
  readonly events: readonly GameEvent[];
  /** When each object was public knowledge, and as what (`PublicStint`): how
   * the history names an object in a line from a time it was known, after it
   * has gone somewhere this viewer can't see. */
  readonly publicStints: Readonly<Record<string, readonly PublicStint[]>>;
  /** Rule 723: which players are being controlled now, and by whom. Public: the
   * effects that did it are. Absent when nobody is. */
  readonly playerControl?: readonly {
    readonly controlled: PlayerId;
    readonly controller: PlayerId;
    readonly during: "next-turn" | "next-combat" | "search";
  }[];
  /** The player this seat should draw the table as, when it isn't its own: the
   * one whose decision it's making now, or the one it controls while it waits
   * (`perspectiveOf`). The server's `actions` are that player's when they're
   * asked, and name them. */
  readonly perspective?: PlayerId;
  /** Who the game is waiting on, when it isn't the player being asked: who
   * controls them or chooses for them. */
  readonly answering?: PlayerId;
  /** The abilities of the viewer's hand cards that work from the hand and
   * can't be activated now, each with why (`Game.unavailableHandAbilities`):
   * drawn greyed out beside the ones on offer. Added by `Game.viewFor`, and
   * only while the viewer holds priority; absent when there are none. */
  readonly unavailableHandAbilities?: readonly UnavailableAbility[];
}

export interface ViewOptions {
  /**
   * What `cardId` costs `caster` right now, or `null` when it is the
   * printed cost. Supplied by `Game.viewFor`, because working it out needs
   * commander tax and the battlefield's cost-modification statics — a
   * capability handed in rather than logic duplicated here, the same shape
   * `DecisionReadCtx` and `ManaPlanningView` use.
   */
  readonly effectiveCost?: (cardId: ObjectId, caster: PlayerId) => string | null;
  /** The commander tax `caster` still owes on casting `cardId` from the
   * command zone (`VisibleObject.commanderTax`), or `null` for none. From
   * `Game.viewFor`, as `effectiveCost` is. */
  readonly commanderTax?: (cardId: ObjectId, caster: PlayerId) => number | null;
  /** How many lands `player` may play this turn. Supplied by `Game.viewFor`
   * for the same reason: an extra land drop is a static whose condition only
   * `Game` can evaluate. Without it, the rules' base limit plus any one-shot
   * extra land drops. */
  readonly maxLands?: (player: PlayerId) => number;
}

/**
 * The card behind the pending decision — see `PlayerView.decisionSource`.
 *
 * A decision variant that names its own `source` is preferred over
 * `state.decisionSource`: it's exact, and it's still right for the decisions
 * raised outside a resolution (a shock land's "pay 2 life?" is asked as the
 * land enters, not as anything resolves).
 */
function decisionSourceFor(state: GameState): DecisionSource | null {
  const awaiting = state.awaiting;
  if (awaiting === null || !decisionHasSource(awaiting)) return null;
  const own = "source" in awaiting ? awaiting.source : undefined;
  if (own !== undefined) {
    const object = state.objects[own];
    if (object !== undefined) {
      return { object: own, cardName: printedCardName(object) };
    }
  }
  // The card alone: who controlled it is the engine's (a discard's cause).
  const source = state.decisionSource;
  return source === null ? null : { object: source.object, cardName: source.cardName };
}

/** See `VisibleObject.chosen`. Read off a permanent only: both fields are
 * cleared on a zone change, but a card on its way in can carry a stale one. */
/** `id` was put onto the battlefield attacking and its controller hasn't yet
 * chosen what it attacks (rule 508.4): it's in the `enter-attacking`
 * decision being asked, or one queued behind it. */
function attackChoicePending(state: GameState, id: ObjectId): boolean {
  const awaiting = state.awaiting;
  if (awaiting?.kind === "enter-attacking" && awaiting.creatures.some((c) => c.object === id)) return true;
  return (state.pendingEnterAttacking ?? []).some((q) => q.creatures.some((c) => c.object === id));
}

function chosenOf(state: GameState, object: GameObject): string | null {
  if (object.zone !== "battlefield" && object.zone !== "phased-out") return null;
  return (
    object.chosenOnEnter ??
    object.chosenCreatureType ??
    (object.chosenNames?.join(", ") || null) ??
    chosenPermanentName(state, object)
  );
}

/** The name of a permanent's chosen permanent (`GameObject.chosenPermanent`
 * — Tyrannical Pitlord's creature) while it's still that object, or `null`.
 * A face-down one is named only as that (rule 708.5). */
function chosenPermanentName(state: GameState, object: GameObject): string | null {
  const chosen = object.chosenPermanent;
  const on = chosen !== undefined ? state.objects[chosen.id] : undefined;
  if (on === undefined || on.zone !== "battlefield" || (on.zoneChangeCount ?? 0) !== chosen?.stint) return null;
  return on.faceDown !== undefined ? "a face-down creature" : printedCardName(on);
}

function visible(
  state: GameState,
  registry: CardRegistry,
  id: ObjectId,
  viewer?: PlayerId,
  /** `Sight.faceDownCreatures`: `viewer` may look at the face-down creatures
   * they don't control. */
  looksAtFaceDownCreatures = false,
): VisibleObject {
  const object = state.objects[id];
  // A phased-out permanent (rule 702.26) is still on the battlefield, and is
  // shown as it was as it phased out — its `lastKnown`, taken then.
  const phased = object.zone === "phased-out" ? object.lastKnown : undefined;
  const zone = object.zone === "phased-out" ? "battlefield" : object.zone;
  // A face-down permanent — or a face-down spell, cast with morph or
  // disguise (708.4) — shows only a face-down 2/2 (rule 708.2a), and which
  // card it is only to its controller (708.5), phased out or not.
  const faceDown = zone === "battlefield" || zone === "stack" ? object.faceDown : undefined;
  const printedName = printedCardName(object);
  const def = registry.get(printedName);
  // A Room on the battlefield is drawn as its whole card — both doors are
  // public, locked or not — with what each door is in `doors`; the rest
  // here is what it has (rule 709.5: a locked door's name, cost and text
  // aren't the permanent's).
  const roomDoors = zone === "battlefield" ? object.doors : undefined;
  const cardDef = roomDoors !== undefined ? registry.get(object.cardName) : def;
  const chosen = chosenOf(state, object);
  const secret: "hidden" | "yours" | null =
    object.secretChoice === undefined || object.secretChoice.revealed === true
      ? null
      : object.secretChoice.by === viewer
        ? "yours"
        : "hidden";
  const live = computeCharacteristics(state, registry, id);
  const computed =
    phased === undefined
      ? live
      : {
          ...live,
          power: phased.power,
          toughness: phased.toughness,
          types: phased.types,
          subtypes: phased.subtypes,
          colors: new Set(phased.colors),
          keywords: new Set(phased.keywords),
        };
  // The printing this card's *owner* brought (see `PlayerState.printings`)
  // stands in for the pool's default illustration. Keyed by the card's front
  // face, which is the name a decklist (and so the printings map) uses — a
  // turned-over permanent is still the same physical card.
  const printing = state.players[object.owner]?.printings[cardDef.faces?.[0] ?? printedName];
  // Whether the up face is the card's *second printed image* — a
  // transforming DFC turned over, or an MDFC's other face. An adventure has
  // the same two-entry `faces` shape but only one printed image, so it is
  // never true there. The client needs this to ask Scryfall for the right
  // side of a chosen printing (`face=back`), which a card id alone can't
  // say; it can't work it out itself without the card registry.
  // A split card's halves share its one image too, and an omen card's.
  const faceIsBack =
    (object.faces === undefined ? 0 : (object.face ?? 0)) > 0 && !def.adventure && !def.omen && !def.split;
  // Computed, not printed — a man-land currently animated (layer 4) is a
  // creature and should carry a P/T; a land again next turn and it won't.
  const isCreature = computed.types.includes("creature");
  // A permanent that lost its abilities (layer 6 — Turn to Frog) shows no
  // rules text; its keywords are already gone from `computed`.
  const onBattlefield = zone === "battlefield";
  const lostAbilities = onBattlefield && hasLostAbilities(state, registry, object);
  // Its text box, which an exchange (rule 612.5 — Deadpool) may have made
  // another card's.
  // A spell's text too, once a text-changing effect has changed it (rule 612).
  let text = lostAbilities
    ? // A loss "except mana abilities" (Blood Sun) leaves those lines.
      manaAbilitiesLostAt(state, registry, object) === null
      ? registry
          .get(rulesTextName(object))
          .activated.filter(isManaAbility)
          .map((ability) => ability.text)
          .join("\n")
      : ""
    : onBattlefield || (zone === "stack" && object.kind === "card")
      ? registry.get(rulesTextName(object)).text
      : def.text;
  // An emblem's triggered ability on the stack (rule 114.4): its source, the
  // emblem object, is in no zone a player sees, so the entry carries the
  // ability's own text and no source to look up — it reads "Emblem's
  // ability" with what it does. Who has the emblem is `PlayerView.emblems`.
  const fromEmblem =
    object.kind === "ability" &&
    object.sourceObjectId !== null &&
    state.objects[object.sourceObjectId]?.kind === "emblem";
  // Its own activated ability (Karn, Living Legacy's) reads the same way.
  if (fromEmblem && (object.grantedAbility?.kind === "modifier" || object.grantedAbility?.kind === "modifier-activated")) {
    text = object.grantedAbility.ability.text;
  }
  // The same for the inherent abilities that ride an emblem-kind object of
  // their own (the monarch's, the initiative's, speed's, rad counters') and a
  // dungeon's room abilities: the one ability's text — a room's record, or
  // the definition's ability by index — not the whole object's.
  else if (fromEmblem && object.reflexiveTrigger !== undefined) text = object.reflexiveTrigger.text;
  else if (fromEmblem && object.delayedTrigger !== undefined) text = object.delayedTrigger.text;
  else if (fromEmblem && object.abilityKind === "triggered" && object.abilityIndex !== null) {
    const own = registry.get(printedCardName(object)).triggered[object.abilityIndex];
    if (own !== undefined) text = own.text;
  }
  // Abilities an effect gave it read with its own: a copy exception's "and
  // it has '…'" (rule 707.9b — Brenard's Food Golems), a one-shot's
  // granted trigger. Only those it still has (rule 613.7).
  if (onBattlefield) {
    // Its basic land types' mana abilities (rule 305.6), written as a typed
    // land's reminder is: a type it gained adds its line, and once a printed
    // type has gone (rule 305.7) the printed line gives way to one for the
    // types it has now.
    const lapsed = def.activated.some((_, i) => inactiveStandIn(state, registry, object, i));
    if (lapsed) {
      text = text
        .split("\n")
        .filter((line) => !/^\(?\{T\}: Add [^()]*\.\)?$/.test(line))
        .join("\n");
    }
    const extra = lapsed
      ? intrinsicManaColors(state, registry, object)
      : extraIntrinsicManaColors(state, registry, object);
    if (extra.length > 0) {
      const symbols = extra.map((c) => `{${c}}`);
      const list =
        symbols.length <= 2 ? symbols.join(" or ") : `${symbols.slice(0, -1).join(", ")}, or ${symbols.at(-1)}`;
      const reminder = `({T}: Add ${list}.)`;
      text = text.length > 0 ? `${text}\n${reminder}` : reminder;
    }
    const lostAt = abilitiesLostAt(state, registry, object);
    for (const m of object.modifiers) {
      if (!modifierGrantApplies(m, lostAt)) continue;
      for (const ability of [...(m.grantsActivated ?? []), ...(m.grantsTriggered ?? [])]) {
        text = text.length > 0 ? `${text}\n${ability.text}` : ability.text;
      }
      // Protection granted for a while (`grant-protection`), in words.
      const quality = m.protection ?? m.hexproofFrom;
      if (quality !== undefined) {
        const label = protectionLabel(
          quality,
          m.protection !== undefined ? "protection" : "hexproof",
          state.turnOrder.filter((p) => p !== object.controller && !state.players[p].hasLost),
        );
        const until =
          m.untilPoint !== undefined
            ? {
                "upkeep-begins": " until your next upkeep",
                "upkeep-ends": " until the end of your next upkeep",
                "this-upkeep-ends": " until the end of this upkeep",
                "turn-ends": " until the end of your next turn",
                "end-step-begins": " until your next end step",
                "next-combat-ends": " until the end of your next combat",
                "controllers-untap-begins": " until its controller's next untap step",
                "next-turn-ends": " until the end of next turn",
              }[m.untilPoint.point]
            : m.untilTurnOf !== undefined
              ? " until your next turn"
              : m.untilEndOfTurn
                ? " until end of turn"
                : "";
        const line = `${label.charAt(0).toUpperCase()}${label.slice(1)}${until}`;
        text = text.length > 0 ? `${text}\n${line}` : line;
      }
    }
  }
  return {
    id: object.id,
    // The permanent's true identity ("Clone"); `copyOf` carries the copied
    // card's name (rule 707) and the client renders that face.
    cardName: faceDown !== undefined ? printedName : object.cardName,
    // A merged permanent shows its topmost card (rule 730.2a), drawn as a
    // copy's face is when that isn't its own.
    copyOf:
      faceDown !== undefined
        ? null
        : object.merged !== undefined && printedName !== (object.copyOf ?? faceName(object))
          ? printedName
          : object.copyOf !== null && object.flippedName !== undefined
            ? object.flippedName
            : object.copyOf,
    // A flipped flip card shows its alternative half (rule 710.1b).
    faceName:
      faceDown !== undefined
        ? printedName
        : roomDoors !== undefined
          ? object.cardName
          : object.copyOf === null && object.merged === undefined && object.flippedName !== undefined
            ? object.flippedName
            : faceName(object),
    ...(nameOf(object) !== printedCardName(object) ? { name: nameOf(object) } : {}),
    faces: object.faces === undefined || faceDown !== undefined ? null : [...object.faces],
    ...(faceDown !== undefined ? {} : spellFaceOf(registry, object)),
    ...(faceDown !== undefined ? {} : splitCostsOf(registry, object)),
    art: faceDown !== undefined ? null : (printing ?? cardDef.art),
    faceIsBack: faceDown !== undefined ? false : faceIsBack,
    ...(onBattlefield && computed.subtypes.includes("Class") ? { classLevel: object.classLevel ?? 1 } : {}),
    ...(roomDoors !== undefined
      ? {
          doors: (["left", "right"] as const).map((door) => {
            const half = registry.get(cardDef.faces?.[door === "left" ? 1 : 2] ?? object.cardName);
            return { door, name: half.name, manaCost: half.manaCost, text: half.text, unlocked: roomDoors[door] };
          }),
        }
      : {}),
    ...(faceDown !== undefined
      ? {
          faceDown: {
            kind: faceDown.kind,
            // Revealed to everyone once the game is over (rule 708.9). A
            // creature on the battlefield also to one who may look at it
            // (Keeper of the Lens — not a spell, the rulings).
            ...(viewer === object.controller ||
            state.result.over ||
            // A look at it they haven't closed (`look-at-face-down`).
            (state.awaiting?.kind === "choose-from-zone" &&
              state.awaiting.looksAtFaceDown === true &&
              state.awaiting.player === viewer &&
              state.awaiting.ids.includes(object.id)) ||
            (looksAtFaceDownCreatures && object.zone === "battlefield" && computed.types.includes("creature"))
              ? { card: object.cardName }
              : {}),
          },
        }
      : {}),
    owner: object.owner,
    controller: object.controller,
    ...(object.protector !== undefined ? { protector: object.protector } : {}),
    zone,
    ...(object.zone === "phased-out" ? { phasedOut: true as const } : {}),
    manaCost: manaCostOverride(object) !== undefined ? (manaCostOverride(object) ?? null) : def.manaCost,
    text,
    types: computed.types,
    supertypes: effectiveSupertypes(state, registry, object),
    // The subtypes a type line shows: a changeling's "every creature type"
    // is an engine marker (`subtypes.ts`), not a word on the card — its
    // changeling keyword says so instead.
    subtypes: withoutTypeMarkers(computed.subtypes),
    // …but not every source of it is the keyword (Maskwood Nexus), and a
    // client narrowing "shares a creature type" needs to know.
    ...(computed.subtypes.includes(EVERY_CREATURE_TYPE) ? { everyCreatureType: true as const } : {}),
    power: isCreature ? computed.power : null,
    toughness: isCreature ? computed.toughness : null,
    // On the battlefield, its loyalty counters; anywhere else, the loyalty
    // printed on the card (rule 306.5a), as the card shows it in a hand.
    loyalty: computed.types.includes("planeswalker")
      ? zone === "battlefield"
        ? (object.counters.loyalty ?? 0)
        : def.loyalty
      : null,
    keywords: [...computed.keywords],
    toxic: computed.toxic,
    // Including a turn-wide "can't block this turn" rule it falls under.
    restrictions: [...restrictionsOf(state, registry, id)],
    colors: [...computed.colors],
    tapped: object.tapped,
    damageMarked: object.damageMarked,
    regenerationShields: object.regenerationShields ?? 0,
    ...(chosen !== null && secret !== "hidden" ? { chosen } : {}),
    ...(object.chosenPlayer !== undefined &&
    secret !== "hidden" &&
    (object.zone === "battlefield" || object.zone === "phased-out")
      ? { chosenPlayer: object.chosenPlayer }
      : {}),
    ...(secret !== null ? { secretChoice: secret } : {}),
    ...(zone === "battlefield" && object.storedResults !== undefined && object.storedResults.length > 0
      ? { storedResults: object.storedResults.map((s) => s.result) }
      : {}),
    ...(object.stickers !== undefined && object.stickers.length > 0
      ? { nameStickers: object.stickers.filter((s) => s.kind === "name").map((s) => s.text) }
      : {}),
    counters: { ...object.counters },
    summoningSick: object.summoningSick,
    attacking: object.attacking,
    ...(object.attacking !== null && attackChoicePending(state, id) ? { attackingUndecided: true as const } : {}),
    blocking: object.blocking,
    ...(object.blockingAlso !== undefined && object.blockingAlso.length > 0 ? { blockingAlso: [...object.blockingAlso] } : {}),
    ...(object.band !== undefined && object.attacking !== null ? { band: object.band } : {}),
    blocked: object.attacking !== null && object.blocked,
    kind: object.kind,
    sourceObjectId: fromEmblem ? null : object.sourceObjectId,
    abilityIndex: object.abilityIndex,
    // A hole is a skipped optional slot; the view shows only real targets.
    targets:
      object.targets === null
        ? null
        : object.targets.filter((t): t is TargetRef => t !== undefined),
    xValue: object.xValue,
    isToken: isTokenNow(object),
    stackCount: object.stackCount ?? null,
    isCopy: object.isCopy ?? false,
    suspended: object.suspended ?? false,
    foretold: object.foretold ?? false,
    ...(zone === "exile" && object.plottedOnTurn !== undefined ? { plotted: true as const } : {}),
    attachedTo: object.attachedTo,
    attachedToPlayer: object.attachedToPlayer ?? null,
    // A face-down commander is a commander only to the one who may look.
    isCommander: object.isCommander && (faceDown === undefined || viewer === object.controller),
    goadedBy: [...goadersOf(state, registry, id)],
    suspected: zone === "battlefield" && object.suspectedAt !== undefined,
    ...(zone === "battlefield" && object.sector !== undefined ? { sector: object.sector } : {}),
    saddled: zone === "battlefield" && object.saddled === true,
    ...(zone === "battlefield" && object.solved === true ? { solved: true as const } : {}),
    ...(zone === "battlefield" && object.harnessed === true ? { harnessed: true as const } : {}),
    ringBearer: hasRingBearerDesignation(object),
    ...(pairedPartner(state, object) !== undefined ? { pairedWith: pairedPartner(state, object)!.id } : {}),
    ...(zone === "battlefield" && object.prepared !== undefined ? { preparedSpell: object.prepared.copy } : {}),
    ...(object.zone === "exile" && object.preparedFor !== undefined ? { preparedBy: object.preparedFor.permanent } : {}),
    ...(object.lights !== undefined && faceDown === undefined ? { lights: [...object.lights] } : {}),
  };
}

/** One card to load the art of ahead of time — see {@link artManifest}. */
export interface ArtManifestEntry {
  /** The front face's name: what a tile asks Scryfall for. */
  readonly name: string;
  /** Its owner's chosen printing, or the pool's pinned art — a tile's `art`. */
  readonly art?: string;
}

/**
 * Every card every player brought — library, hand, command zone, wherever
 * it is now — as the art a tile would ask for, once each. For a client to
 * load quietly at the start of a game so no card's art waits on the network
 * the first time it's seen (the server's `artManifest`). Not redacted: it
 * names the cards in every deck, which is accepted for games among friends.
 * What it must not say is which card is which: it is sorted by name, never
 * in the objects' own order, which with the ids in a hand would name the
 * cards in it (the 2026-11-18 review; `Game.setup` salts the ids too).
 * Tokens aren't anyone's deck, and are left out.
 */
export function artManifest(state: GameState, registry: CardRegistry): ArtManifestEntry[] {
  const seen = new Set<string>();
  const out: ArtManifestEntry[] = [];
  for (const object of Object.values(state.objects)) {
    if (object.kind !== "card" || object.isToken) continue;
    const printed = printedCardName(object);
    if (!registry.has(printed)) continue;
    const def = registry.get(printed);
    const name = def.faces?.[0] ?? printed;
    const art = state.players[object.owner]?.printings[name] ?? def.art;
    const key = `${name} ${art ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(art === undefined || art === null ? { name } : { name, art });
  }
  const sortKey = (entry: ArtManifestEntry): string => `${entry.name}\n${entry.art ?? ""}`;
  return out.sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : sortKey(a) > sortKey(b) ? 1 : 0));
}

/** `VisibleObject.spellFace` for `object`, as a spread: its card's Adventure
 * or Omen half while it shows its creature face off the battlefield, or its
 * prepare spell wherever it is. */
function spellFaceOf(registry: CardRegistry, object: GameObject): { spellFace?: VisibleObject["spellFace"] } {
  // A preparation card's prepare spell (rule 722.2), read as
  // `Game.becomePrepared` reads it: by the printed card, so a copy has it
  // too, a token among them (722.2b). The battlefield as well, unlike an
  // Adventure: it's what the permanent's controller casts a copy of while
  // it's prepared.
  const printed = printedCardName(object);
  const prepare = registry.has(printed) ? registry.get(printed).prepareSpell : null;
  if (prepare !== null && registry.has(prepare)) {
    const spell = registry.get(prepare);
    return {
      spellFace: {
        name: spell.name,
        manaCost: spell.manaCost,
        types: [...spell.types],
        subtypes: [...spell.subtypes],
        text: spell.text,
      },
    };
  }
  if (object.zone === "battlefield" || object.zone === "phased-out") return {};
  if (object.kind !== "card" || (object.face ?? 0) !== 0) return {};
  const front = object.faces?.[0];
  const back = object.faces?.[1];
  if (front === undefined || back === undefined || !registry.has(front) || !registry.has(back)) return {};
  const def = registry.get(front);
  if (def.adventure !== true && def.omen !== true) return {};
  const half = registry.get(back);
  return {
    spellFace: {
      name: half.name,
      manaCost: half.manaCost,
      types: [...half.types],
      subtypes: [...half.subtypes],
      text: half.text,
    },
  };
}

/** `VisibleObject.splitCosts` for `object`, as a spread: a split card's two
 * halves' costs while it's the whole card (rule 709.4) — in a hand, a
 * library, a graveyard, exile. A half cast is that half alone (709.3), and a
 * Room on the battlefield shows its doors instead (`doors`). */
function splitCostsOf(registry: CardRegistry, object: GameObject): { splitCosts?: VisibleObject["splitCosts"] } {
  if (object.zone === "battlefield" || object.zone === "phased-out") return {};
  if (object.kind !== "card" || (object.face ?? 0) !== 0) return {};
  const [whole, left, right] = object.faces ?? [];
  if (whole === undefined || left === undefined || right === undefined) return {};
  if (!registry.has(whole) || !registry.has(left) || !registry.has(right) || !registry.get(whole).split) return {};
  return { splitCosts: [registry.get(left).manaCost, registry.get(right).manaCost] };
}

/**
 * Each battlefield permanent's linked exile — see `VisibleObject.holding`.
 * A link counts only while its permanent is on the battlefield: an O-Ring's
 * `exiledBy`, an impulse permission's source (`source`, and only while
 * it's still the same object — rule 400.7; or a `while-source` expiry), or
 * the source a card was exiled with (`exiledWith`, the same stint only).
 */
function exileHoldings(state: GameState): Map<ObjectId, ObjectId[]> {
  const whileSourceOf = (object: GameObject): ObjectId | undefined => {
    const expiry = object.playPermission?.expiry;
    return typeof expiry === "object" && "whileSource" in expiry ? expiry.whileSource?.id : undefined;
  };
  const out = new Map<ObjectId, ObjectId[]>();
  const onBattlefield = (id: ObjectId): boolean => state.objects[id]?.zone === "battlefield";
  for (const id of state.zones.shared.exile) {
    const object = state.objects[id];
    if (object === undefined) continue;
    const linked = object.playPermission?.source;
    const sameStint = (link: { readonly id: ObjectId; readonly zoneChangeCount: number } | undefined): boolean =>
      link !== undefined &&
      onBattlefield(link.id) &&
      (state.objects[link.id].zoneChangeCount ?? 0) === link.zoneChangeCount;
    const exiledWith =
      object.exiledWith === undefined
        ? undefined
        : { id: object.exiledWith.source, zoneChangeCount: object.exiledWith.zoneChangeCount };
    const holder =
      object.exiledBy !== undefined && onBattlefield(object.exiledBy)
        ? object.exiledBy
        : linked !== undefined && sameStint(linked)
          ? linked.id
          : whileSourceOf(object) !== undefined && onBattlefield(whileSourceOf(object)!)
            ? whileSourceOf(object)
            : // "Exiled with" it (rule 607.2a): a hideaway card (Mosswort
              // Bridge — face down, so by id only to a seat that can't look),
              // an imprinted one, Arcane Bombardment's — while it's the same
              // object that exiled them.
              exiledWith !== undefined && sameStint(exiledWith)
              ? exiledWith.id
              : undefined;
    if (holder === undefined) continue;
    const list = out.get(holder);
    if (list === undefined) out.set(holder, [id]);
    else list.push(id);
  }
  return out;
}

/** A viewer who isn't a player (a spectator watching a room): sees what's
 * public — the battlefield, stack, graveyards, exile, every card a reveal
 * shows everyone — and no hand, no library and nothing face down.
 * `viewFor(state, registry, SPECTATOR)`. */
export const SPECTATOR = "spectator" as PlayerId;

/** What the battlefield's `StaticAbility.visibility` statics show `viewer`,
 * past what any player sees anyway. */
interface Sight {
  /** The players whose hands are revealed, to every player. */
  readonly hands: ReadonlySet<PlayerId>;
  /** The players whose libraries' top cards are revealed, to every player. */
  readonly libraryTops: ReadonlySet<PlayerId>;
  /** `viewer` may look at face-down creatures they don't control. */
  readonly faceDownCreatures: boolean;
  /** `viewer` may look at the top card of their own library. */
  readonly ownLibraryTop: boolean;
}

/** Whether `player` plays with the top card of their library revealed, to
 * every player (Courser of Kruphix, Lantern of Insight). Whose sight it is
 * read from doesn't matter: `Sight.libraryTops` is the same for all. */
function topRevealed(state: GameState, registry: CardRegistry, player: PlayerId, sight: Sight): boolean {
  return (
    sight.libraryTops.has(player) ||
    state.zones.shared.battlefield.some((id) => {
      const object = state.objects[id];
      return object.controller === player && registry.get(rulesTextName(object)).revealsOwnLibraryTop;
    })
  );
}

/**
 * Whether the top card of `player`'s library is revealed to every player
 * right now (rule 401.5's "play with the top card of their library
 * revealed"), as against one player alone being let to look at it. What
 * `Game.moveObject` asks as a card leaves a library for a hand: everyone saw
 * that card, so it stays seen for the turn (`GameState.revealedThisTurn`).
 */
export function libraryTopRevealedToAll(state: GameState, registry: CardRegistry, player: PlayerId): boolean {
  return topRevealed(state, registry, player, sightOf(state, registry, player));
}

/** The card on top of `player`'s library, if `viewer` can see it, else
 * `null`: revealed to everyone, or one `viewer` alone may look at. */
function seenLibraryTop(
  state: GameState,
  registry: CardRegistry,
  viewer: PlayerId,
  player: PlayerId,
  sight: Sight,
): ObjectId | null {
  const revealsTop = topRevealed(state, registry, player, sight);
  // "You may look at the top card of your library any time" (Glarb,
  // Calamity's Augur — rule 401.5): shown in its owner's own view only.
  // "You may look at the top card of their library any time" (Xanathar,
  // Guild Kingpin): another player's, in the looker's view alone.
  const looksAtTheirs =
    player !== viewer &&
    (state.playerEffects ?? []).some((e) => e.owner === viewer && e.looksAtLibraryTopOf?.includes(player) === true);
  const looksAtTop =
    looksAtTheirs ||
    (player === viewer &&
      (sight.ownLibraryTop ||
        // For a while, from a resolved effect (The Belligerent).
        (state.playerEffects ?? []).some((e) => e.owner === player && e.looksAtOwnLibraryTop === true) ||
        state.zones.shared.battlefield.some((id) => {
          const object = state.objects[id];
          return (
            object.controller === player &&
            !hasLostAbilities(state, registry, object) &&
            registry.get(rulesTextName(object)).looksAtOwnLibraryTop
          );
        })));
  return revealsTop || looksAtTop ? (state.zones.perPlayer[player]?.library[0] ?? null) : null;
}

/**
 * The card on top of `player`'s own library when they can see it (a
 * permanent revealing it, or letting them look: Oracle of Mul Daya, Future
 * Sight, Glarb), else `null`. What `viewFor(player).revealedLibraryTop`
 * holds for their own library, without building the view: a bot plans with
 * the card it can see there, and with no other card of its library.
 */
export function ownLibraryTopSeen(state: GameState, registry: CardRegistry, player: PlayerId): ObjectId | null {
  return seenLibraryTop(state, registry, player, player, sightOf(state, registry, player));
}

/**
 * The card on top of `owner`'s library when `viewer` can see it — revealed to
 * everyone, or one `viewer` alone may look at (their own, or another
 * player's: Xanathar) — else `null`. All a bot may know of a library's order
 * (`bot/determinize.ts`'s `withHiddenCards`).
 */
export function libraryTopSeenBy(
  state: GameState,
  registry: CardRegistry,
  owner: PlayerId,
  viewer: PlayerId,
): ObjectId | null {
  return seenLibraryTop(state, registry, viewer, owner, sightOf(state, registry, viewer));
}

/** `libraryTopSeenBy` for every player's library at once, the viewer's sight
 * worked out a single time: a bot asks at every decision. */
export function libraryTopsSeenBy(
  state: GameState,
  registry: CardRegistry,
  viewer: PlayerId,
): Record<PlayerId, ObjectId | null> {
  const sight = sightOf(state, registry, viewer);
  const tops: Record<PlayerId, ObjectId | null> = {};
  for (const owner of state.turnOrder) tops[owner] = seenLibraryTop(state, registry, viewer, owner, sight);
  return tops;
}

/**
 * What of the hidden zones the board itself shows `viewer`: each library's
 * top card where they can see it (`libraryTopSeenBy`), and the players whose
 * hands are played revealed (`handsPlayedRevealed`). Both at once, the
 * viewer's sight worked out a single time: a bot asks at every decision.
 */
export function hiddenCardsInSight(
  state: GameState,
  registry: CardRegistry,
  viewer: PlayerId,
): { readonly tops: Record<PlayerId, ObjectId | null>; readonly hands: ReadonlySet<PlayerId> } {
  const sight = sightOf(state, registry, viewer);
  const tops: Record<PlayerId, ObjectId | null> = {};
  for (const owner of state.turnOrder) tops[owner] = seenLibraryTop(state, registry, viewer, owner, sight);
  return { tops, hands: sight.hands };
}

function sightOf(state: GameState, registry: CardRegistry, viewer: PlayerId): Sight {
  const hands = new Set<PlayerId>();
  const libraryTops = new Set<PlayerId>();
  let faceDownCreatures = false;
  let ownLibraryTop = false;
  const among = (who: "you" | "opponents" | "each-player", you: PlayerId): readonly PlayerId[] =>
    who === "you"
      ? [you]
      : who === "opponents"
        ? state.turnOrder.filter((player) => player !== you)
        : state.turnOrder;
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (state.players[object.controller]?.hasLost !== false) continue;
    const own = registry.get(rulesTextName(object)).static.filter((a) => a.visibility !== undefined);
    const abilities = [
      ...grantedStatics(state, registry, object, (a) => a.visibility !== undefined).filter((a) => a.visibility !== undefined),
      ...(own.length > 0 && !hasLostAbilities(state, registry, object) ? own : []),
    ];
    for (const ability of abilities) {
      const sees = ability.visibility;
      if (sees === undefined) continue;
      if (ability.condition !== undefined && !staticConditionMet(state, registry, object, ability.condition)) continue;
      if (sees.handsRevealed !== undefined) {
        for (const player of among(sees.handsRevealed, object.controller)) hands.add(player);
      }
      if (sees.libraryTopRevealed !== undefined) {
        for (const player of among(sees.libraryTopRevealed, object.controller)) libraryTops.add(player);
      }
      if (object.controller === viewer) {
        if (sees.looksAtFaceDownCreatures === true) faceDownCreatures = true;
        if (sees.looksAtOwnLibraryTop === true) ownLibraryTop = true;
      }
    }
  }
  // "…and plays with their hand revealed" for a turn (Sen Triplets).
  for (const effect of state.playerEffects ?? []) {
    for (const player of effect.handsRevealed ?? []) hands.add(player);
    // "Play with the top card of your library revealed" for a while
    // (Temporal Aperture), while what it lasts for holds.
    if (
      effect.libraryTopRevealed === true &&
      (effect.whileOnTop === undefined || libraryTopHolds(state, effect.owner, effect.whileOnTop))
    ) {
      libraryTops.add(effect.owner);
    }
  }
  return { hands, libraryTops, faceDownCreatures, ownLibraryTop };
}

/** The players a battlefield static has playing with their hands revealed, to
 * every player (`StaticAbility.visibility` — Telepathy, Wandering Eye). */
export function handsPlayedRevealed(state: GameState, registry: CardRegistry, viewer: PlayerId): ReadonlySet<PlayerId> {
  return sightOf(state, registry, viewer).hands;
}

/** A target that is a card exiled face down the viewer isn't shown. */
function isHiddenExile(state: GameState, shown: Readonly<Record<ObjectId, VisibleObject>>, target: TargetRef): boolean {
  return target.kind === "object" && shown[target.object] === undefined && state.objects[target.object]?.exiledFaceDown !== undefined;
}

export function viewFor(
  state: GameState,
  registry: CardRegistry,
  viewer: PlayerId,
  options: ViewOptions = {},
): PlayerView {
  // A pure read over one settled state, computing characteristics for every
  // visible object — cache them for the duration.
  return withComputedCache(() => {
    const own = viewForUncached(state, registry, viewer, options);
    // Nobody answers for anyone else: no control, no "you choose" effect, and
    // no declaration of blockers a static has the attacking player make
    // (Invasion Plans' `chosenBy`).
    if (
      state.playerControl === undefined &&
      state.combatChoices === undefined &&
      (state.awaiting?.kind !== "blockers" || state.awaiting.chosenBy === undefined)
    ) {
      return own;
    }
    const controlled = playersControlledBy(state, viewer).map((player) => ({
      player,
      view: viewForUncached(state, registry, player, options),
    }));
    const seen = controlled.reduce((view, other) => withControlledSight(state, view, other.player, other.view), own);
    const perspective = perspectiveOf(state, viewer);
    const asked = askedPlayer(state);
    const answering = asked === null ? asked : answeringPlayer(state, asked);
    const control = (state.playerControl ?? [])
      .filter((c) => c.began !== undefined && controlOf(state, c.controlled) === c)
      .map((c) => ({ controlled: c.controlled, controller: decidingPlayer(state, c.controlled), during: c.during }));
    return {
      ...seen,
      ...(perspective !== viewer ? { perspective } : {}),
      ...(answering !== asked && answering !== null ? { answering } : {}),
      ...(control.length > 0 ? { playerControl: control } : {}),
    };
  });
}

/**
 * `view`, with what `controlled` can see too (rule 723.4): every object that
 * player's view shows, the way it shows it for what they control (a face-down
 * creature's face), their library's looked-at top, and the decision as they're
 * asked it. But not "cards outside the game": their sideboard stays theirs.
 */
function withControlledSight(
  state: GameState,
  view: PlayerView,
  controlled: PlayerId,
  theirs: PlayerView,
): PlayerView {
  const objects = { ...view.objects };
  for (const [id, object] of Object.entries(theirs.objects) as [ObjectId, VisibleObject][]) {
    if (state.objects[id]?.zone === "outside") continue;
    if (objects[id] === undefined || state.objects[id]?.controller === controlled) objects[id] = object;
  }
  const asked = state.awaiting !== null && state.awaiting.kind !== "mulligan" && state.awaiting.player === controlled;
  return {
    ...view,
    objects,
    revealedLibraryTop: {
      ...view.revealedLibraryTop,
      [controlled]: theirs.revealedLibraryTop[controlled] ?? view.revealedLibraryTop[controlled] ?? null,
    },
    awaiting: asked ? theirs.awaiting : view.awaiting,
  };
}

/**
 * The cards the decision being asked shows `viewer`, past what they see
 * anyway: the cards of a look, a scry, a pile, a spell being cast for another
 * player to finish. What `viewFor` adds to a seat's view while the decision
 * waits, and what a bot may remember having seen (`bot/seat-memory.ts`).
 */
export function awaitedCardsShownTo(state: GameState, viewer: PlayerId): ObjectId[] {
  const shown: ObjectId[] = [];
  // A pending "look at N cards, choose some" decision reveals its candidates
  // to the choosing player only — this is the only place library cards ever
  // become visible (graveyard candidates are already public via `graveyards`
  // in the view, but naming them again here is harmless).
  if (state.awaiting?.kind === "choose-from-zone" && state.awaiting.player === viewer) {
    // A face-down card in exile a processor may take stays hidden from a
    // chooser who may not look at it (rule 406.3): it's picked by its group,
    // as a face-down back.
    const hidden = new Set((state.awaiting.faceDownGroups ?? []).flat());
    shown.push(
      ...state.awaiting.ids.filter((id) => {
        if (!hidden.has(id)) return true;
        const object = state.objects[id];
        if (object?.exiledFaceDown !== undefined) return object.exiledFaceDown.lookers.includes(viewer);
        return object?.foretold !== true || object.owner === viewer;
      }),
    );
  }
  // Objects being separated into piles are seen by the separator (rule
  // 700.3: they looked at them, or they were revealed); a face-down pile, by
  // the players who looked at its cards.
  if (state.awaiting?.kind === "separate-piles" && state.awaiting.player === viewer) {
    shown.push(...state.awaiting.objects);
  }
  if (state.awaiting?.kind === "choose-pile" && state.awaiting.lookers.includes(viewer)) {
    shown.push(...state.awaiting.piles.flat());
  }
  // A scry / surveil reveals the looked-at top cards to that player only.
  if (state.awaiting?.kind === "scry" && state.awaiting.player === viewer) {
    shown.push(...state.awaiting.cards);
  }
  // So does a `cast-now` that has its player look at the top of their
  // library to choose a spell from among (Velomachus Lorehold).
  if (state.awaiting?.kind === "cast-now" && state.awaiting.player === viewer) {
    shown.push(...(state.awaiting.looked ?? []));
  }
  // A spell waiting on its assisting player (rule 702.132a) is one being
  // cast — on the stack for everyone to see (601.2a) — though it waits in
  // its caster's hand here until the cast is done.
  if (state.awaiting?.kind === "choose-number" && state.awaiting.assist !== undefined) {
    shown.push(state.awaiting.assist.cast.card);
  }
  // So is one waiting on the opponent its caster named to choose some of
  // its targets or its modes (rules 601.2c, 700.2e).
  if (
    (state.awaiting?.kind === "choose-targets" || state.awaiting?.kind === "choose-modes") &&
    state.awaiting.otherCast?.action.type === "cast-spell"
  ) {
    shown.push(state.awaiting.otherCast.action.card);
  }
  // And a hand looked at before naming a card (Sorcerous Spyglass).
  if (state.awaiting?.kind === "choose-card-name" && state.awaiting.player === viewer) {
    shown.push(...(state.awaiting.looked ?? []));
  }
  // Or before choosing anything else as it enters (Arachne, Psionic Weaver).
  if (state.awaiting?.kind === "choose-creature-type" && state.awaiting.player === viewer) {
    shown.push(...(state.awaiting.looked ?? []));
  }
  return shown;
}

function viewForUncached(
  state: GameState,
  registry: CardRegistry,
  viewer: PlayerId,
  options: ViewOptions = {},
): PlayerView {
  const players: Record<PlayerId, PublicPlayerInfo> = {};
  const hands: Record<PlayerId, readonly ObjectId[]> = {};
  const graveyards: Record<PlayerId, readonly ObjectId[]> = {};
  const revealedLibraryTop: Record<PlayerId, ObjectId | null> = {};
  const sight = sightOf(state, registry, viewer);
  const visibleIds: ObjectId[] = [
    ...state.zones.shared.battlefield,
    ...phasedOutIds(state),
    ...state.zones.shared.stack,
    // A foretold card is face-down in exile — its identity is hidden from
    // everyone but its owner (ROADMAP Phase 6b); a card exiled face down by
    // an effect, from everyone but the players it lets look (rule 406.3 —
    // Edward Kenway). The id still appears in the `exile` zone list, so a
    // client renders a face-down back for it.
    ...state.zones.shared.exile.filter((id) => {
      const object = state.objects[id];
      if (object?.exiledFaceDown !== undefined) return object.exiledFaceDown.lookers.includes(viewer);
      return object?.foretold !== true || object.owner === viewer;
    }),
    ...state.zones.shared.command,
  ];
  visibleIds.push(...awaitedCardsShownTo(state, viewer));
  // A real reveal (rule 701.16) is to *everyone*, which is the whole point —
  // this is the only path that puts a card another player owns, and that is
  // sitting in a hidden zone, into your view. Turn-scoped, so it stops being
  // a window into their hand once the turn is over (see `revealedThisTurn`).
  visibleIds.push(...state.revealedThisTurn);

  for (const player of state.turnOrder) {
    const zones = state.zones.perPlayer[player];
    const playerState = state.players[player];
    players[player] = {
      id: player,
      life: playerState.life,
      manaPool: poolCounts(playerState.manaPool),
      handSize: zones.hand.length,
      librarySize: zones.library.length,
      graveyardSize: zones.graveyard.length,
      sideboardSize: sideboardOf(state, player).length,
      companion: revealedCompanion(state, player),
      landsPlayedThisTurn: journalTotal(state, "land-played", playerState.id, "count"),
      maxLandsThisTurn:
        options.maxLands?.(player) ??
        state.rules.maxLandsPerTurn + (playerState.extraLandsThisTurn ?? 0),
      hasLost: playerState.hasLost,
      lossReason: playerState.lossReason,
      commanderDamageTaken: Object.entries(playerState.commanderDamageTaken)
        .filter(([id, amount]) => amount > 0 && state.objects[id as ObjectId] !== undefined)
        .map(([id, amount]): CommanderDamage => {
          const commander = state.objects[id as ObjectId];
          const name = printedCardName(commander);
          const def = registry.get(name);
          return {
            commander: id as ObjectId,
            name: def.faces?.[0] ?? name,
            owner: commander.owner,
            art: state.players[commander.owner]?.printings[def.faces?.[0] ?? name] ?? def.art,
            amount,
          };
        }),
      commanderCastCounts: { ...playerState.commanderCastCounts },
      energy: playerState.energy,
      counters: { ...playerState.counters },
      enduringStory: playerState.enduringStory === true,
      citysBlessing: playerState.citysBlessing === true,
      speed: playerState.speed ?? null,
      dungeon: (() => {
        const current = playerState.dungeon;
        const map = current === undefined ? undefined : dungeonMap(current.name);
        return current === undefined || map === undefined ? null : { name: current.name, room: current.room, map };
      })(),
      completedDungeons: [...(playerState.completedDungeons ?? [])],
      attractionDeckSize: playerState.attractionDeck?.length ?? 0,
      junkyard: [...(playerState.junkyard ?? [])],
      stickerSheets: stickerSheetsView(state, player),
    };
    graveyards[player] = [...zones.graveyard];
    visibleIds.push(...zones.graveyard);
    // A junkyard is face up in the command zone (rule 717.6a): everyone's.
    visibleIds.push(...(playerState.junkyard ?? []));

    const topCard = seenLibraryTop(state, registry, viewer, player, sight);
    revealedLibraryTop[player] = topCard;
    if (topCard !== null) visibleIds.push(topCard);

    // The *ids* are public — how many cards, and which slot is which — so a
    // client can render a face-down back per card (and later swap one to its
    // real face if something reveals it, e.g. Gitaxian Probe). Only the
    // *identity* (the object's entry in `objects` below) stays hidden unless
    // it's your own hand or the card was actually revealed.
    hands[player] = [...zones.hand];
    // A card everyone saw go into this hand — bounced, returned from a
    // graveyard, exile or the stack, revealed by the tutor that put it there
    // or revealed from the hand since — is still known to everyone while it
    // stays (its public stint is open: `knownToAll`).
    if (player !== viewer) visibleIds.push(...zones.hand.filter((id) => knownToAll(state, id)));
    // "Your opponents play with their hands revealed" (Telepathy): to everyone.
    if (player !== viewer && sight.hands.has(player)) visibleIds.push(...zones.hand);
    if (player === viewer) {
      visibleIds.push(...zones.hand);
      // Their own sideboard, which they may look at (rule 400.11a).
      visibleIds.push(...(state.outside?.[player] ?? []));
    }
    // A revealed companion stays revealed outside the game (rule 103.2b).
    const companion = revealedCompanion(state, player);
    if (companion !== null) visibleIds.push(companion);
  }
  // Token copies waiting on their "as this enters" choices: what's being
  // created is public, so the choices made for them can be named.
  for (const parked of state.suspendedResolutions) {
    if (parked.effect !== null || parked.enter?.kind !== "token-copies") continue;
    for (const group of parked.enter.groups) visibleIds.push(...group.tokens);
  }

  const holdings = exileHoldings(state);
  const objects: Record<ObjectId, VisibleObject> = {};
  // Who could cast each card whose cost is shown, priced for them: the
  // viewer's own hand, and every commander in the command zone, by its owner.
  // The command zone is public, and so is what a commander costs its owner —
  // the tax and the permanents that change it are in plain view (a bug
  // report, 2026-10-08: reductions on opponents' commanders didn't show). An
  // opponent's hand stays the viewer's to not know.
  const casterOf = new Map<ObjectId, PlayerId>([
    ...(state.zones.perPlayer[viewer]?.hand ?? []).map((id): [ObjectId, PlayerId] => [id, viewer]),
    ...state.zones.shared.command.flatMap((id): [ObjectId, PlayerId][] => {
      const owner = state.objects[id]?.owner;
      return owner === undefined ? [] : [[id, owner]];
    }),
  ]);
  for (const id of visibleIds) {
    if (state.objects[id] !== undefined) {
      const base = visible(state, registry, id, viewer, sight.faceDownCreatures);
      const caster = casterOf.get(id);
      const cost =
        options.effectiveCost !== undefined && caster !== undefined
          ? options.effectiveCost(id, caster)
          : null;
      const tax =
        options.commanderTax !== undefined && caster !== undefined && state.objects[id].zone === "command"
          ? options.commanderTax(id, caster)
          : null;
      const held = holdings.get(id);
      const withHeld = held === undefined ? base : { ...base, holding: held };
      const withCost = cost === null ? withHeld : { ...withHeld, effectiveManaCost: cost };
      objects[id] = tax === null ? withCost : { ...withCost, commanderTax: tax };
    }
  }
  // A hand card every player knows says so, for its owner's client to mark.
  for (const player of state.turnOrder) {
    for (const id of state.zones.perPlayer[player]?.hand ?? []) {
      const object = objects[id];
      if (object !== undefined && knownToAll(state, id)) objects[id] = { ...object, knownToAll: true };
    }
  }
  // "Return those cards": what an ability on the stack acts on is shown as its
  // targets, but a card exiled face down isn't this viewer's to know of by that
  // (rule 406.3) — it's a face-down back in exile, not a name on the stack.
  for (const id of state.zones.shared.stack) {
    const object = objects[id];
    if (object?.targets?.some((t) => isHiddenExile(state, objects, t))) {
      objects[id] = { ...object, targets: object.targets.filter((t) => !isHiddenExile(state, objects, t)) };
    }
  }

  return {
    turnOrder: [...state.turnOrder],
    ...(state.seating !== undefined ? { seating: [...state.seating] } : {}),
    startingPlayer: state.startingPlayer,
    ...(state.restarts !== undefined ? { restarts: state.restarts } : {}),
    activePlayer: activePlayerOf(state),
    turn: { ...state.turn },
    priority: { ...state.priority, passed: [...state.priority.passed] },
    // Which hand cards may pay a "discard a creature card" cost says what
    // kind of card each is: only the player asked sees it.
    awaiting:
      state.awaiting?.kind === "choose-card-name" && state.awaiting.looked !== undefined && state.awaiting.player !== viewer
        ? (({ looked: _looked, ...rest }) => rest)(state.awaiting)
        : state.awaiting?.kind === "choose-creature-type" && state.awaiting.looked !== undefined && state.awaiting.player !== viewer
        ? (({ looked: _looked, ...rest }) => rest)(state.awaiting)
        : state.awaiting?.kind === "discard" && state.awaiting.eligible !== undefined && state.awaiting.player !== viewer
        ? (({ eligible: _hidden, ...rest }) => rest)(state.awaiting)
        : // What a `cast-now` offers can be cards in its player's hand or
          // library: to anyone else, only that they're deciding.
          state.awaiting?.kind === "cast-now" && state.awaiting.player !== viewer
          ? (({ looked: _looked, ...rest }) => ({ ...rest, cards: [], offers: [] }))(state.awaiting)
          : // Which hand cards a reveal land could show says what they are,
            // until one is actually revealed.
            state.awaiting?.kind === "reveal-for-untapped" && state.awaiting.player !== viewer
            ? { ...state.awaiting, options: [] }
            : // A miracle not yet revealed is a hidden card (rule 702.94a):
              // its cost would say which.
              state.awaiting?.kind === "miracle-reveal" && state.awaiting.player !== viewer
              ? { ...state.awaiting, cost: "" }
              : // A search's set rule tags each library card with its land
              // types: only the searcher sees them.
              state.awaiting?.kind === "choose-from-zone" &&
                state.awaiting.together !== undefined &&
                state.awaiting.player !== viewer
              ? { ...state.awaiting, together: { ...state.awaiting.together, tags: {} } }
              : // Which hand cards a behold could reveal says what they are
                // (rule 701.4a), until one is: the others see only the
                // permanents it could choose. So too a choice across zones
                // (`exile-from-zones`): its hand cards are the chooser's.
                state.awaiting?.kind === "choose-from-zone" &&
                  (state.awaiting.behold !== undefined ||
                    state.awaiting.acrossZones === true ||
                    state.awaiting.handKeep === true) &&
                  state.awaiting.player !== viewer
                ? {
                    ...state.awaiting,
                    ids: state.awaiting.ids.filter((id) => state.objects[id]?.zone !== "hand"),
                    eligible: state.awaiting.eligible.filter((id) => state.objects[id]?.zone !== "hand"),
                  }
                : // An opening hand's Leylines (rule 103.6a) are hand cards
                  // until they're put onto the battlefield.
                  // A companion being chosen is outside the game until it's
                  // revealed (rule 103.2b).
                  state.awaiting?.kind === "choose-from-zone" &&
                    (state.awaiting.openingHand !== undefined || state.awaiting.companion !== undefined) &&
                    state.awaiting.player !== viewer
                  ? { ...state.awaiting, ids: [], eligible: [] }
                  : state.awaiting,
    decisionSource: decisionSourceFor(state),
    result: { ...state.result },
    players,
    objects,
    zones: {
      battlefield: [...state.zones.shared.battlefield],
      phasedOut: [...phasedOutIds(state)],
      stack: [...state.zones.shared.stack],
      // A face-down pile's order is as hidden as its cards (rule 406.3 —
      // Parallel Thoughts' shuffled pile, whose top card is the next one
      // taken): the cards this viewer can't see come after the rest, in id
      // order, so the list can't say which is on top.
      exile: [
        ...state.zones.shared.exile.filter((id) => objects[id] !== undefined),
        ...state.zones.shared.exile.filter((id) => objects[id] === undefined).sort(),
      ],
      exileOwners: Object.fromEntries(
        state.zones.shared.exile.flatMap((id) => {
          const owner = state.objects[id]?.owner;
          return owner === undefined ? [] : [[id, owner]];
        }),
      ),
      command: [...state.zones.shared.command],
      hands,
      graveyards,
      sideboard: [...sideboardOf(state, viewer)],
    },
    revealedLibraryTop,
    dayNight: state.dayNight,
    monarch: state.monarch,
    initiative: state.initiative ?? null,
    ...(state.takeBacks !== undefined
      ? {
          takeBacks: {
            limit: state.takeBacks.limit,
            used: state.takeBacks.used,
            turns: takeBackTurns(state, viewer).map(({ turn, player }) => ({ turn, player })),
            cannot: whyCannotTakeBack(state, viewer),
          },
        }
      : {}),
    emblems: state.emblems
      .filter((e) => e.expires === undefined)
      .map((e) => ({
        owner: e.owner,
        text: e.text,
        source: e.sourceName ?? null,
        ...(e.object !== undefined && state.objects[e.object]?.modifiers.some((m) => (m.grantsActivated?.length ?? 0) > 0) === true
          ? { object: e.object }
          : {}),
      })),
    delayedTriggers: delayedTriggersSeen(state, objects),
    lastingEffects: lastingEffectsOf(state),
    events: hiddenHandPicksLeftOut(state, objects, viewer),
    publicStints: state.publicStints ?? {},
  };
}

/**
 * The event log as `viewer` is told it: a card another player chose and left
 * in their hand (a `look-and-choose` of it with `destination: "stay"` —
 * Stronghold Gambit's "each player chooses a card in their hand", Master of
 * Predicaments' hidden card) is left out of that `cards-chosen-from-zone`
 * while `viewer` can't see it, counted in `fromHand` instead, so the face-down
 * slot chosen isn't given away before the card is revealed (rule 400.2: a
 * hand is hidden). The log itself, which the game reads ("chosen this way"),
 * keeps every id; nothing is copied when nothing is hidden.
 */
function hiddenHandPicksLeftOut(
  state: GameState,
  objects: Readonly<Record<ObjectId, VisibleObject>>,
  viewer: PlayerId,
): readonly GameEvent[] {
  const log = state.eventLog;
  let told: GameEvent[] | undefined;
  for (let i = 0; i < log.length; i += 1) {
    const event = log[i];
    if (event.type !== "cards-chosen-from-zone" || event.chosenOnly !== true || event.player === viewer) continue;
    const hidden = event.objects.filter((id) => objects[id] === undefined && state.objects[id]?.zone === "hand");
    if (hidden.length === 0) continue;
    told ??= [...log];
    told[i] = {
      ...event,
      objects: event.objects.filter((id) => !hidden.includes(id)),
      fromHand: (event.fromHand ?? 0) + hidden.length,
    };
  }
  return told ?? log;
}

/** One {@link PlayerView.delayedTriggers} entry. */
export interface DelayedTriggerView {
  readonly controller: PlayerId;
  readonly source: string;
  readonly text: string;
  readonly at: { readonly step: DelayedStep; readonly whose: PlayerId | "any"; readonly which: DelayedWhich } | null;
  /** The cards it acts on — its targets and its trigger object, as they
   * were when it was made — that the viewer can see, each only while it is
   * still that object (rule 400.7): "return **that card**" names the card. */
  readonly objects: readonly ObjectId[];
}

/** When a {@link LastingEffectView} ends, read off its `Expiry`: this turn,
 * this combat, as a player's next turn begins, as a player's next turn ends,
 * never, or `"later"` for any other point (a source leaving, a counter gone,
 * an extra turn still to come). */
export type LastingEnds =
  | "end-of-turn"
  | "end-of-combat"
  | "permanent"
  | "later"
  | { readonly untilTurnOf: PlayerId }
  | { readonly untilEndOfTurnOf: PlayerId }
  /** Held for later (`laterPlayerEffects`): it starts as that player's next
   * turn begins and lasts through it. */
  | { readonly duringTurnOf: PlayerId };

/** One {@link PlayerView.lastingEffects} entry. `player` is whose panel lists
 * it: the player it's on or protects, else the controller of what made it.
 * `source` is that card's name, `null` where the state doesn't record it. */
export interface LastingEffectView {
  readonly player: PlayerId;
  readonly source: string | null;
  readonly text: string;
  readonly ends: LastingEnds;
}

function lastingEnds(expires: Expiry): LastingEnds {
  if (expires === "end-of-turn" || expires === "permanent") return expires;
  if ("untilTurnOf" in expires) return { untilTurnOf: expires.untilTurnOf };
  if ("untilEndOfCombat" in expires) return "end-of-combat";
  if ("untilPoint" in expires && expires.untilPoint.point === "turn-ends") return { untilEndOfTurnOf: expires.untilPoint.player };
  return "later";
}

/** Every player's and the game's lasting effects, as `PlayerView.lastingEffects`
 * lists them — public, as the spells and abilities that made them were. One
 * resolution can leave several records worded the same (Teferi's Protection's
 * three): those are listed once. */
function lastingEffectsOf(state: GameState): LastingEffectView[] {
  const out: LastingEffectView[] = [];
  const seen = new Set<string>();
  const add = (entry: LastingEffectView): void => {
    const key = JSON.stringify(entry);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  };
  // A timed static ("players can't gain life this turn") rides the emblems.
  for (const e of state.emblems) {
    if (e.expires === undefined || e.ring === true) continue;
    add({ player: e.createdBy ?? e.owner, source: e.sourceName ?? null, text: e.text, ends: lastingEnds(e.expires) });
  }
  for (const p of state.playerEffects ?? []) {
    if (p.madeBy === undefined) continue;
    add({ player: p.owner, source: p.madeBy.name, text: p.madeBy.text, ends: lastingEnds(p.expires) });
  }
  // Held for a later turn ("that player can't attack you during their next
  // turn"): nothing yet, then all of that turn.
  for (const later of state.laterPlayerEffects ?? []) {
    const madeBy = later.effect.madeBy;
    if (madeBy === undefined) continue;
    add({ player: later.effect.owner, source: madeBy.name, text: madeBy.text, ends: { duringTurnOf: later.turnOf } });
  }
  // A replacement on one permanent is that permanent's to show.
  for (const r of state.activeReplacements) {
    if (r.madeBy === undefined || r.target?.kind === "object") continue;
    const player = r.target?.kind === "player" ? r.target.player : r.owner;
    add({ player, source: r.madeBy.name, text: r.madeBy.text, ends: lastingEnds(r.expires) });
  }
  const active = activePlayerOf(state);
  for (const player of state.hexproofPlayers) {
    add({ player, source: null, text: "Hexproof: this player can't be the target of spells or abilities their opponents control.", ends: "end-of-turn" });
  }
  if (state.damageUnpreventableThisTurn === true) {
    add({ player: active, source: null, text: "Damage can't be prevented this turn.", ends: "end-of-turn" });
  }
  if (state.extraCombats > 0) {
    const n = state.extraCombats;
    add({ player: active, source: null, text: `${n === 1 ? "An additional combat phase" : `${n} additional combat phases`} this turn.`, ends: "end-of-turn" });
  }
  const extraTurns = new Map<PlayerId, number>();
  for (const player of state.extraTurns) extraTurns.set(player, (extraTurns.get(player) ?? 0) + 1);
  for (const [player, n] of extraTurns) {
    add({ player, source: null, text: n === 1 ? "Takes an extra turn after this one." : `Takes ${n} extra turns after this one.`, ends: "later" });
  }
  // A record with no words of its own (a timed static some paths make with an
  // empty text) goes where another from the same source and ending says it.
  const sameAs = (a: LastingEffectView, b: LastingEffectView): boolean =>
    a.player === b.player && a.source === b.source && JSON.stringify(a.ends) === JSON.stringify(b.ends);
  return out.filter((e) => e.text.length > 0 || !out.some((o) => o !== e && o.text.length > 0 && sameAs(o, e)));
}

/** Whether every player knows what card `id` is now: its last public stint
 * (`GameState.publicStints`) is still open. A card keeps one into a hand when
 * it went there from a public zone, or was revealed by the resolution that
 * put it there; drawing, a move between hidden zones or a shuffle closes it. */
function knownToAll(state: GameState, id: ObjectId): boolean {
  const stints = state.publicStints?.[id];
  const last = stints?.[stints.length - 1];
  return last !== undefined && last.until === undefined;
}

/** The flicker links (`GameObject.flickerLink`) a delayed ability's effect
 * returns cards by: its `return-flickered` steps, however deep in a sequence. */
function flickerLinksOf(spec: unknown, found: string[] = []): string[] {
  if (Array.isArray(spec)) {
    for (const each of spec) flickerLinksOf(each, found);
  } else if (typeof spec === "object" && spec !== null) {
    const record = spec as { readonly kind?: unknown; readonly link?: unknown; readonly effects?: unknown };
    if (record.kind === "return-flickered" && typeof record.link === "string") found.push(record.link);
    if (record.effects !== undefined) flickerLinksOf(record.effects, found);
  }
  return found;
}

/** The delayed triggered abilities waiting to trigger, as `viewer` sees
 * them: every one (the spell or ability that made each was public), naming
 * only the cards `objects` (the view's) shows. */
function delayedTriggersSeen(state: GameState, objects: Readonly<Record<ObjectId, VisibleObject>>): DelayedTriggerView[] {
  return state.delayedTriggers.map((d) => {
    const ids: ObjectId[] = [];
    const note = (id: ObjectId, stint: number | null | undefined): void => {
      const object = state.objects[id];
      if (object === undefined || objects[id] === undefined || ids.includes(id)) return;
      if (stint != null && (object.zoneChangeCount ?? 0) !== stint) return;
      ids.push(id);
    };
    d.targets.forEach((t, i) => {
      if (t?.kind === "object") note(t.object, d.targetStints?.[i]);
    });
    if (d.triggerObject !== undefined) note(d.triggerObject, d.triggerObjectStint);
    // A flicker's return finds its cards by their link, not as targets: the
    // exiled card is a new object (rule 400.7), marked `flickerLink`.
    const links = flickerLinksOf(d.effect);
    if (links.length > 0) {
      for (const id of state.zones.shared.exile) {
        const link = state.objects[id]?.flickerLink;
        if (link !== undefined && links.includes(link)) note(id, null);
      }
    }
    return {
      controller: d.controller,
      source: d.sourceName,
      text: d.text,
      at: isStepWatch(d.at) ? { step: d.at.step, whose: d.at.whose, which: d.at.which } : null,
      objects: ids,
    };
  });
}
