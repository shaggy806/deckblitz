/**
 * Shared building blocks for card files — the `{T}: Add {C}` mana ability every
 * basic land carries, and the `basicLand` constructor itself. Imported by files
 * under `pool/` and `tokens/`.
 */

import type { ActivatedAbility, CraftMaterials, TriggeredAbility, TriggerSpec } from "../abilities.js";
import { wardCostText, type BoundUnlessOption, type EffectAmount, type EffectSpec, type GiftKind, type UnlessOption, type WardCost } from "../effects.js";
import type { CardFilter } from "../filter.js";
import type { Color, ManaType } from "../mana.js";
import type { TargetSpec } from "../target.js";
import { defineCard, type CardDefinition, type Keyword, type StaticAbility, type StaticCondition } from "./define.js";

/** The placeholder for "the chosen creature type" inside a
 * `choose-creature-type` effect's `then` — re-exported here because card files
 * import only from `define` and `helpers`. */
export { CHOSEN_CREATURE_TYPE } from "../effects.js";

/**
 * "Two target lands", "up to two target creatures": one instance of the word
 * "target" spread over `n` slots, so the same object or player can be chosen
 * for only one of them (rule 601.2c). Each slot after the first is `other`
 * than every slot of the group before it. `optional` makes every slot "up
 * to"; `from` is the group's first slot when other slots come before it, and
 * `otherThan` names earlier slots outside the group that every slot must also
 * differ from — Drakuseth's "each of up to two **other** targets" is
 * `distinctTargets(2, "any-target", { optional: true, from: 1, otherThan: [0] })`.
 */
export const distinctTargets = (
  n: number,
  spec: TargetSpec,
  opts: { readonly optional?: boolean; readonly from?: number; readonly otherThan?: readonly number[] } = {},
): TargetSpec[] => {
  const from = opts.from ?? 0;
  return Array.from({ length: n }, (_, i) => {
    const earlier = [...(opts.otherThan ?? []), ...Array.from({ length: i }, (__, j) => from + j)];
    const slot: TargetSpec = earlier.length === 0 ? spec : { kind: "other", of: spec, than: { slots: earlier } };
    return opts.optional === true ? { kind: "optional", of: slot } : slot;
  });
};

/**
 * "Whenever **this creature or another** X enters / dies / leaves …" as the
 * two triggers it is: one for the source itself, whatever it is by then, and
 * one for every *other* X (`otherOnly`). Written as one trigger requiring the
 * object to be an X, it missed the source's own entry or death whenever the
 * source wasn't one — a copy, a type or colour change, a token copy of a
 * "nontoken" one — though the text names it outright. Théoden and Thorn
 * Mammoth spell the same two triggers out by hand.
 *
 * `ability` is the "another X" half, written as one trigger with its `who`
 * and `filter` (no `otherOnly`); the source's half keeps every other field of
 * its trigger and has `who: "self"` and `self` as its filter — what the
 * source's own event still has to be ("this creature or another creature
 * enters **from your graveyard**"), nothing if absent.
 */
export const thisOrAnother = (ability: TriggeredAbility, self?: CardFilter): TriggeredAbility[] => {
  const { who: _who, filter: _filter, ...rest } = ability.trigger as Extract<
    TriggerSpec,
    { readonly on: "enters-battlefield" | "dies" | "leaves-battlefield" | "deals-combat-damage-to-player" }
  >;
  return [
    { ...ability, trigger: { ...rest, who: "self", ...(self !== undefined ? { filter: self } : {}) } as TriggerSpec },
    { ...ability, trigger: { ...ability.trigger, otherOnly: true } as TriggerSpec },
  ];
};

/**
 * Void (an ability word, rule 207.2c — Edge of Eternities): "if a nonland
 * permanent left the battlefield this turn or a spell was warped this turn".
 * Anyone's permanent, however it left, a token too (the `left` turn history,
 * read as it last existed — rule 603.10a); anyone's spell cast for its warp
 * cost, countered since or not (rule 702.185c and its ruling).
 */
export const VOID_CONDITION: StaticCondition = {
  kind: "any",
  of: [
    { kind: "turn-history", what: "left", who: "any-player", filter: { notTypes: ["land"] } },
    { kind: "cast-this-turn", who: "any", filter: { castVia: "warp" } },
  ],
};

/**
 * Revolt (an ability word, Aether Revolt) and disappear (TMNT): "if a
 * permanent left the battlefield under your control this turn" — one you
 * controlled as it left, for anywhere, a token too.
 */
export const REVOLT_CONDITION: StaticCondition = { kind: "turn-history", what: "left" };

/**
 * Celebration (an ability word, Wilds of Eldraine — rule 207.2c gives it no
 * meaning of its own): "if / as long as two or more nonland permanents
 * entered the battlefield under your control this turn". The `entered` turn
 * history: each one under its controller as it entered, read as it entered
 * (a land is left out by what it was then), a token stack as every token in
 * it — counted though it has left or changed control since (the rulings:
 * "checking for past events, not the current game state"), and a permanent
 * that left and came back twice, as the two objects it was (rule 400.7).
 */
export const CELEBRATION_CONDITION: StaticCondition = {
  kind: "turn-history",
  what: "entered",
  filter: { notTypes: ["land"] },
  atLeast: 2,
};

/**
 * Ward (rule 702.21a): "Whenever this permanent becomes the target of a spell
 * or ability an opponent controls, counter that spell or ability unless that
 * player pays [cost]." A real triggered ability, so each instance triggers
 * on its own (702.21b), losing abilities removes it, and a static can grant
 * it to other permanents through `grantsTriggered` ("Goblins and Orcs you
 * control have ward {2}" is `grantsTriggered: [ward({ mana: "{2}" })]`).
 *
 * `ward({ mana: "{2}" })` is "Ward {2}"; `ward({ mana: "{2}", payLife: 2 })`
 * is "Ward—{2}, Pay 2 life." — one compound cost, paid all together. Put the
 * printed line in the card's `text` as well; this is the ability's own.
 */
export const ward = (cost: WardCost): TriggeredAbility => ({
  trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
  targets: [],
  effect: { kind: "ward", cost },
  resolve: null,
  text: `Ward${wardCostText(cost)}`,
});

/**
 * Forage (rule 701.61a): "exile three cards from your graveyard or sacrifice
 * a Food" — the two ways, as an `each-player-may`'s `options`, each offered
 * only to a player who can do it (a forage they can't complete isn't
 * offered, the rulings), and each announcing the forage for "whenever you
 * forage". "You may forage. If you do, …" is `{ kind: "each-player-may", who:
 * "you", options: forageOptions(), ifDid: … }`; "when you do" puts a
 * `reflexive-trigger` in `ifDid`.
 */
export const forageOptions = (): readonly BoundUnlessOption[] => [
  { exileFromGraveyard: 3, forage: true, text: "Exile three cards from your graveyard" },
  { sacrifice: { subtype: "Food" }, forage: true, text: "Sacrifice a Food" },
];

/**
 * Valiant (an ability word — Heartfire Hero): "Whenever this creature becomes
 * the target of a spell or ability you control for the first time each turn,
 * [effect]." The first time this turn its controller's spell or ability
 * targets it, in this battlefield stint — a target changed onto it or a copy
 * targeting it counts too, if it's the first (the rulings). `text` is the
 * whole printed line, "Valiant — …" included.
 */
export const valiant = (effect: EffectSpec, text: string): TriggeredAbility => ({
  trigger: { on: "becomes-target", who: "self", byControllerOnly: true, firstTimeEachTurn: true },
  targets: [],
  effect,
  resolve: null,
  text,
});

/**
 * Impending's two abilities on the battlefield (rule 702.176a): "As long as
 * this permanent's impending cost was paid and it has a time counter on it,
 * it's not a creature" and "At the beginning of your end step, if this
 * permanent's impending cost was paid and it has a time counter on it,
 * remove a time counter from it." Spread into the card beside its
 * `impending: { count, cost }` (which offers the cast and puts the counters
 * on): `static: [...impendingAbilities().static]`, `triggered:
 * [...impendingAbilities().triggered]`.
 */
export const impendingAbilities = (): {
  readonly static: readonly StaticAbility[];
  readonly triggered: readonly TriggeredAbility[];
} => ({
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "impending" },
      removeTypes: ["creature"],
      text: "As long as this permanent's impending cost was paid and it has a time counter on it, it isn't a creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "impending" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "At the beginning of your end step, if this permanent's impending cost was paid and it has a time counter on it, remove a time counter from it.",
    },
  ],
});

/** A Siege's reminder line (rule 310.12): put it first in the card's `text`. */
export const SIEGE_REMINDER =
  "(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)";

/**
 * A Siege's intrinsic ability (rule 310.12b): "When the last defense counter
 * is removed from this permanent, exile it, then you may cast it transformed
 * without paying its mana cost." The battle also needs `defense` (310.4b —
 * it enters with that many defense counters), `faces` and `transform: true`
 * with its back face's file; its protector is chosen as it enters (310.12a)
 * and a 0-defense Siege waits in play for this to resolve (310.7). Spread
 * into the card: `triggered: [siege(), …]`.
 */
export const siege = (): TriggeredAbility => ({
  trigger: { on: "counters-removed", who: "self", counter: "defense", last: true },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: "source" },
      { kind: "cast-now", from: "source-exiled-this-way", free: true, transformed: true },
    ],
  },
  resolve: null,
  text: "When the last defense counter is removed from this permanent, exile it, then you may cast it transformed without paying its mana cost.",
});

/**
 * Backup N (rule 702.165a): "When this creature enters, put N +1/+1 counters
 * on target creature. If that's another creature, it also gains the
 * non-backup abilities of this creature printed below this one until end of
 * turn." `grants` are those abilities as printed below the backup line — the
 * same ones the card has itself (702.165c: never one only granted to it), so
 * fixed as the ability goes on the stack (702.165d): keywords, and triggered
 * and activated abilities. Put "Backup N" in `text` as well.
 */
export const backup = (
  n: number,
  grants: {
    readonly keywords?: readonly Keyword[];
    readonly triggered?: readonly TriggeredAbility[];
    readonly activated?: readonly ActivatedAbility[];
  } = {},
): TriggeredAbility => {
  const gains: EffectSpec[] = [
    ...(grants.keywords ?? []).map(
      (keyword): EffectSpec => ({ kind: "grant-keyword", target: 0, keyword, duration: "end-of-turn" }),
    ),
    ...(grants.triggered ?? []).map(
      (ability): EffectSpec => ({ kind: "grant-triggered", target: 0, ability, duration: "end-of-turn" }),
    ),
    ...(grants.activated ?? []).map(
      (ability): EffectSpec => ({ kind: "grant-activated", target: 0, ability, duration: "end-of-turn" }),
    ),
  ];
  return {
    trigger: { on: "enters-battlefield", who: "self" },
    targets: ["creature"],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "add-counter", target: 0, counter: "+1/+1", amount: n },
        ...(gains.length === 0
          ? []
          : [
              {
                kind: "conditional",
                condition: { kind: "not", of: { kind: "target-is-source", index: 0 } },
                then: { kind: "sequence", effects: gains },
              } satisfies EffectSpec,
            ]),
      ],
    },
    resolve: null,
    text: `Backup ${n}`,
  };
};

/**
 * Vanishing N (rule 702.63a): "This permanent enters with N time counters on
 * it," "At the beginning of your upkeep, if this permanent has a time counter
 * on it, remove a time counter from it," and "When the last time counter is
 * removed from this permanent, sacrifice it." Real abilities: the upkeep one
 * is an intervening if (603.4) on the stack, and the sacrifice triggers on
 * *any* removal of the last one (`counters-removed`'s `last` — time travel,
 * Regenerations Restored). Each instance works separately (702.63c). Spread
 * into the card: `static: [...vanishing(4).static]`, `triggered:
 * [...vanishing(4).triggered]`. Without N (702.63b) there's no counter to
 * enter with. Put "Vanishing N" in `text` as well.
 */
export const vanishing = (
  n?: number,
): { readonly static: readonly StaticAbility[]; readonly triggered: readonly TriggeredAbility[] } => ({
  static:
    n === undefined
      ? []
      : [
          {
            affects: { scope: "self" },
            replacement: { event: "enters-battlefield", counters: { kind: "time", amount: n } },
            text: `Vanishing ${n} (This permanent enters with ${n} time counters on it.)`,
          },
        ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, if this permanent has a time counter on it, remove a time counter from it.",
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When the last time counter is removed from this permanent, sacrifice it.",
    },
  ],
});

/**
 * Undying (rule 702.93): "When this permanent dies, if it had no +1/+1
 * counters on it, return it to the battlefield under its owner's control with
 * a +1/+1 counter on it." A real triggered ability — the "if" is an
 * intervening-if read from last-known information — so a static can grant it
 * (Mikaeus, the Unhallowed's "other non-Human creatures you control … have
 * undying" is `grantsTriggered: [undying()]`). Put "Undying" in `text` as well.
 */
export const undying = (): TriggeredAbility => ({
  trigger: { on: "dies", who: "self" },
  condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
  targets: [],
  effect: { kind: "put-onto-battlefield", target: "trigger-object", withCounters: { kind: "+1/+1", amount: 1 } },
  resolve: null,
  text: "Undying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
});

/**
 * Demonstrate (rule 702.144a): "When you cast this spell, you may copy it and
 * you may choose new targets for the copy. If you copy the spell, choose an
 * opponent. That player copies the spell and may choose new targets for that
 * copy." Your copy goes on the stack above the spell and theirs above yours,
 * so theirs resolves first (the rulings); declining, nobody copies it. Made
 * from the spell as it last was on the stack if it has left (countered in
 * response), as storm's copies are. Put the reminder text in `text` as well.
 */
export const demonstrate = (): TriggeredAbility => ({
  trigger: { on: "this-cast" },
  targets: [],
  effect: {
    kind: "may",
    prompt: "Demonstrate: copy this spell? If you do, an opponent you choose copies it too.",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "copy-spell", target: "trigger-spell", newTargets: true },
        {
          kind: "choose-opponent",
          then: { kind: "copy-spell", target: "trigger-spell", newTargets: true, controller: "that-player" },
        },
      ],
    },
  },
  resolve: null,
  text: "Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it.)",
});

/**
 * The Commander 2017 Curses' trigger (Curse of Opulence, Verbosity, Bounty,
 * Disturbance): "Whenever enchanted player is attacked, [effect]. Each
 * opponent attacking that player does the same." Once per declaration,
 * however many creatures attack them, and not for an attack on only their
 * planeswalkers (the rulings) — `attacks-player` with the Curse's own
 * player as `defender`. `effect` reads the
 * `"you-and-opponents-attacking-trigger-player"` scope for who does it.
 */
export const curseWhenAttacked = (effect: EffectSpec, text: string): TriggeredAbility => ({
  trigger: { on: "attacks-player", who: "any", defender: "attached" },
  targets: [],
  effect,
  resolve: null,
  text,
});

/**
 * Persist (rule 702.79): "When this permanent dies, if it had no -1/-1
 * counters on it, return it to the battlefield under its owner's control with
 * a -1/-1 counter on it." Undying's mirror image. Put "Persist" in `text` as
 * well.
 */
export const persist = (): TriggeredAbility => ({
  trigger: { on: "dies", who: "self" },
  condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "eq", n: 0 } },
  targets: [],
  effect: { kind: "put-onto-battlefield", target: "trigger-object", withCounters: { kind: "-1/-1", amount: 1 } },
  resolve: null,
  text: "Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
});

/**
 * Afterlife N (rule 702.135a): "When this permanent dies, create N 1/1 white
 * and black Spirit creature tokens with flying." Each instance triggers on
 * its own (702.135b). Put "Afterlife N" in `text` as well.
 */
export const afterlife = (n: number): TriggeredAbility => ({
  trigger: { on: "dies", who: "self" },
  targets: [],
  effect: { kind: "create-token", token: "Spirit Token (White-Black)", count: n },
  resolve: null,
  text: `Afterlife ${n} (When this creature dies, create ${n === 1 ? "a" : String(n)} 1/1 white and black Spirit creature token${n === 1 ? "" : "s"} with flying.)`,
});

/**
 * Rampage N (rule 702.23a): "Whenever this creature becomes blocked, it gets
 * +N/+N until end of turn for each creature blocking it beyond the first" —
 * counted once, as the trigger resolves (702.23b). Each instance triggers on
 * its own (702.23c). Put "Rampage N" in `text` as well.
 */
export const rampage = (n: number): TriggeredAbility => {
  const bonus = { product: [n, { difference: [{ blockersOf: "source" }, 1] }] } as const;
  return {
    trigger: { on: "becomes-blocked", who: "self" },
    targets: [],
    effect: { kind: "modify-pt", target: "source", power: bonus, toughness: bonus, duration: "end-of-turn" },
    resolve: null,
    text: `Rampage ${n} (Whenever this creature becomes blocked, it gets +${n}/+${n} until end of turn for each creature blocking it beyond the first.)`,
  };
};

/**
 * Cumulative upkeep [cost] (rule 702.24a): "At the beginning of your upkeep,
 * if this permanent is on the battlefield, put an age counter on this
 * permanent. Then you may pay [cost] for each age counter on it. If you
 * don't, sacrifice it." `cost` is a mana cost (`"{U}"`), life (`{ life: 1 }`)
 * or a sacrifice (`{ sacrifice: { type: "land" }, text: "Sacrifice a land" }`),
 * paid once per age counter as it resolves — all of it or none (no partial
 * payments). Each instance triggers on its own and counts every age counter
 * (702.24b). Put the keyword line in `text` as well.
 */
export const cumulativeUpkeep = (
  cost: string | { readonly life: number } | { readonly sacrifice: CardFilter; readonly text: string },
): TriggeredAbility => {
  const ages = { countersOn: "source", counter: "age" } as const;
  const label = typeof cost === "string" ? cost : "life" in cost ? `—Pay ${cost.life} life` : `—${cost.text}`;
  const option: UnlessOption =
    typeof cost === "string"
      ? { pay: cost, times: ages, text: `Pay ${cost} for each age counter` }
      : "life" in cost
        ? { payLife: cost.life, times: ages, text: `Pay ${cost.life} life for each age counter` }
        : { sacrifice: cost.sacrifice, times: ages, text: cost.text };
  return {
    trigger: { on: "step-begins", step: "upkeep", who: "you" },
    targets: [],
    effect: {
      kind: "conditional",
      condition: { kind: "source-on-battlefield" },
      then: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "age", amount: 1 },
          { kind: "unless", chooser: "you", options: [option], otherwise: { kind: "sacrifice-source" } },
        ],
      },
    },
    resolve: null,
    text: `Cumulative upkeep${typeof cost === "string" ? " " : ""}${label} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)`,
  };
};

/**
 * Mentor (rule 702.134a): "Whenever this creature attacks, put a +1/+1
 * counter on target attacking creature with lesser power" — the power
 * compared as the target is chosen and again as it resolves (Legion
 * Warboss). Put "Mentor" in `text` as well.
 */
export const mentor = (): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self" },
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", attacking: true, power: { op: "lt", n: { amount: { powerOf: "source" } } } },
    },
  ],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
  resolve: null,
  text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)",
});

/**
 * Spectacle [cost] (rule 702.137a): "You may cast this spell for its
 * spectacle cost rather than its mana cost if an opponent lost life this
 * turn" — the card's `alternativeCost`. A spell cast this way answers
 * `self-spectacle-paid` ("if its spectacle cost was paid"). Put "Spectacle
 * [cost]" in `text` as well.
 */
export const spectacle = (mana: string): NonNullable<CardDefinition["alternativeCost"]> => ({
  mana,
  keyword: "spectacle",
  condition: { kind: "turn-stat", stat: "life-lost", who: "opponent", atLeast: 1 },
});

/**
 * Surge [cost] (rule 702.117a): "You may cast this spell for its surge cost
 * if you or a teammate has cast another spell this turn" — the card's
 * `alternativeCost`. The condition is read as the spell is proposed (rule
 * 601.2b), before this spell counts as cast, so one spell cast this turn is
 * "another". There are no teammates in a free-for-all. A spell cast this way
 * answers `self-surge-paid` ("if its surge cost was paid"). Put "Surge
 * [cost]" in `text` as well.
 */
export const surge = (mana: string): NonNullable<CardDefinition["alternativeCost"]> => ({
  mana,
  keyword: "surge",
  condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
});

/**
 * Awaken N—[cost] (rule 702.113a): "If you cast this spell for [cost], also
 * put N +1/+1 counters on target land you control and it becomes a 0/0
 * Elemental creature with haste. It's still a land." — the card's
 * `overload`, `keyword: "awaken"`: cast for `cost` rather than the mana cost,
 * with the printed `targets` and then the land, and the printed `effect` and
 * then the land's. Pass the spell's own `targets` and `effect` (the card's
 * fields too). The land is the last target, so an illegal land skips only
 * its part, and a spell with no other target doesn't resolve without it (the
 * rulings). The animation is permanent and gives no color (the ruling). Put
 * the "Awaken N—[cost]" line in `text` as well.
 */
export const awaken = (
  n: number,
  cost: string,
  spell: { readonly targets?: readonly TargetSpec[]; readonly effect: EffectSpec },
): NonNullable<CardDefinition["overload"]> => {
  const targets = spell.targets ?? [];
  const land = targets.length;
  const steps = spell.effect.kind === "sequence" && spell.effect.simultaneous !== true ? spell.effect.effects : [spell.effect];
  return {
    cost,
    keyword: "awaken",
    targets: [...targets, "land-you-control"],
    effect: {
      kind: "sequence",
      effects: [
        ...steps,
        { kind: "add-counter", target: land, counter: "+1/+1", amount: n },
        {
          kind: "animate",
          target: land,
          power: 0,
          toughness: 0,
          addTypes: ["creature"],
          addSubtypes: ["Elemental"],
          keywords: ["haste"],
          duration: "permanent",
        },
      ],
    },
  };
};

/**
 * Melee (rule 702.121):"Whenever this creature attacks, it gets +1/+1 until
 * end of turn for each opponent you attacked with a creature this combat."
 * Each instance triggers on its own. Put "Melee" in `text` as well.
 */
export const melee = (): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: {
    kind: "modify-pt",
    target: "source",
    power: { opponentsAttacked: true },
    toughness: { opponentsAttacked: true },
    duration: "end-of-turn",
  },
  resolve: null,
  text: "Melee",
});

/**
 * Flanking (rule 702.25a): "Whenever this creature becomes blocked by a
 * creature without flanking, the blocking creature gets -1/-1 until end of
 * turn" — once per such blocker, each instance on its own (702.25b). Put
 * `"flanking"` in the card's `keywords` as well: the keyword is what another
 * creature's flanking asks about.
 */
export const flanking = (): TriggeredAbility => ({
  trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
  targets: [],
  effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: -1, duration: "end-of-turn" },
  resolve: null,
  text: "Flanking",
});

/**
 * Afflict N (rule 702.130a): "Whenever this creature becomes blocked,
 * defending player loses N life" — once however many creatures block it,
 * the defending player being the one who blocked (`becomes-blocked`'s
 * trigger player). Each instance triggers on its own (702.130b). Put the
 * printed line in the card's `text` as well.
 */
export const afflict = (n: number): TriggeredAbility => ({
  trigger: { on: "becomes-blocked", who: "self" },
  targets: [],
  effect: { kind: "lose-life", amount: n, who: "trigger-player" },
  resolve: null,
  text: `Afflict ${n}`,
});

/**
 * Crew N (rule 702.122a): "Tap any number of other untapped creatures you
 * control with total power N or greater: This permanent becomes an artifact
 * creature until end of turn." The creatures are chosen as the cost is paid
 * (`tapOthers.totalPower` — any of them, summoning sick or not, never the
 * Vehicle itself), and their powers are read then. Not sorcery speed. A
 * Vehicle that becomes a creature has its printed power and toughness (rule
 * 301.7b); crewing one that already is a creature changes nothing (the
 * rulings). Grant it with `grantsActivated` (Kotori, Pilot Prodigy's
 * "Vehicles you control have crew 2"). `text` defaults to the bare keyword.
 */
export const crew = (n: number, text = `Crew ${n}`): ActivatedAbility => ({
  cost: { mana: null, tap: false, tapOthers: { count: 0, totalPower: n, filter: { type: "creature" } } },
  targets: [],
  effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
  resolve: null,
  crew: true,
  text,
});

/** Crew N's printed line with its reminder text. */
export const crewText = (n: number): string =>
  `Crew ${n} (Tap any number of creatures you control with total power ${n} or more: This Vehicle becomes an artifact creature until end of turn.)`;

/**
 * Saddle N (rule 702.171a): "Tap any number of other untapped creatures you
 * control with total power N or greater: This permanent becomes saddled until
 * end of turn. Activate only as a sorcery." Crew's cost (`tapOthers
 * .totalPower` — summoning-sick creatures may pay it, never the Mount
 * itself), at sorcery speed, and each creature tapped for it saddles the
 * Mount (`saddle: true`, 702.171c). It may be activated while the Mount is
 * saddled already (the rulings). `text` defaults to the bare keyword;
 * `saddleText(n)` is the line with its reminder.
 */
export const saddle = (n: number, text = `Saddle ${n}`): ActivatedAbility => ({
  cost: { mana: null, tap: false, tapOthers: { count: 0, totalPower: n, filter: { type: "creature" } } },
  targets: [],
  effect: { kind: "become-saddled", target: "source" },
  resolve: null,
  sorcerySpeed: true,
  saddle: true,
  text,
});

/** Saddle N's printed line with its reminder text. */
export const saddleText = (n: number): string =>
  `Saddle ${n} (Tap any number of other creatures you control with total power ${n} or more: This Mount becomes saddled until end of turn. Saddle only as a sorcery.)`;

/** "Whenever this creature attacks while saddled" (rule 702.171b): an attack
 * trigger whose trigger condition — not an intervening "if" (603.4) — is
 * that it's saddled as it's declared an attacker (the rulings), so it
 * resolves even if it stops being saddled. Spread into a triggered ability. */
export const ATTACKS_WHILE_SADDLED = {
  trigger: { on: "attacks", who: "self" },
  whileCondition: { kind: "source", filter: { saddled: true } },
} as const satisfies Pick<TriggeredAbility, "trigger" | "whileCondition">;

/**
 * Ninjutsu [cost] (rule 702.49a): "[Cost], Reveal this card from your hand,
 * Return an unblocked attacking creature you control to its owner's hand:
 * Put this card onto the battlefield from your hand tapped and attacking."
 * An ability of the card in the hand (`zone: "hand"`, which it stays in —
 * revealed, 702.49b), at instant speed, so only once blockers are declared
 * (an attacker is unblocked from then, `unblocked`); the attacker is chosen
 * as the cost is paid, and the ninja attacks what it was attacking (702.49c
 * — the `ninjutsu` effect). Rule 400.7: a card that leaves the hand in
 * response isn't put anywhere. `commander` is commander ninjutsu (702.49d):
 * the same ability from the command zone too, as a second entry — spread it
 * into `activated`. `text` defaults to the keyword with its reminder.
 */
export const ninjutsu = (cost: string, text = ninjutsuText(cost)): ActivatedAbility => ({
  cost: {
    mana: cost,
    tap: false,
    returnToHand: { count: 1, filter: { type: "creature", unblocked: true } },
  },
  zone: "hand",
  staysInZone: true,
  ninjutsu: true,
  targets: [],
  effect: { kind: "ninjutsu" },
  resolve: null,
  text,
});

/** Ninjutsu [cost]'s printed line with its reminder text. */
export const ninjutsuText = (cost: string): string =>
  `Ninjutsu ${cost} (${cost}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)`;

/** Commander ninjutsu (rule 702.49d): ninjutsu from the hand or the command
 * zone — two entries, one per zone, the same ability. Spread into
 * `activated`. */
export const commanderNinjutsu = (cost: string, text = commanderNinjutsuText(cost)): readonly ActivatedAbility[] => {
  const fromHand = ninjutsu(cost, text);
  return [fromHand, { ...fromHand, zone: "command" }];
};

/** Commander ninjutsu [cost]'s printed line with its reminder text. */
export const commanderNinjutsuText = (cost: string): string =>
  `Commander ninjutsu ${cost} (${cost}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand or the command zone tapped and attacking.)`;

/**
 * Transmute (rule 702.53a): "[Cost], Discard this card: Search your library
 * for a card with the same mana value as the discarded card, reveal that
 * card, and put it into your hand. Then shuffle. Activate only as a
 * sorcery." An activated ability from the hand, which discards the card as
 * its cost (channel's `zone: "hand"` shape). `manaValue` is the card's own:
 * in the hand, nothing changes it. `text` is the printed line, reminder
 * included.
 */
export const transmute = (cost: string, manaValue: number, text: string): ActivatedAbility => ({
  cost: { mana: cost, tap: false },
  targets: [],
  effect: {
    kind: "search-library",
    filter: { manaValue: { op: "eq", n: manaValue } },
    destination: "hand",
    min: 0,
    max: 1,
    reveal: true,
  },
  resolve: null,
  zone: "hand",
  sorcerySpeed: true,
  text,
});

/**
 * Annihilator N (rule 702.86): "Whenever this creature attacks, defending
 * player sacrifices N permanents." The defending player is the one it
 * attacks, or the controller of the planeswalker it attacks. A triggered
 * ability, so a static can grant it (`grantsTriggered`); each instance
 * triggers on its own. Put the printed line in the card's `text` as well.
 */
export const annihilator = (n: number): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: { kind: "sacrifice", who: "trigger-player", filter: {}, count: n },
  resolve: null,
  text: `Annihilator ${n}`,
});

/**
 * Dethrone (rule 702.105a): "Whenever this creature attacks the player with
 * the most life or tied for most life, put a +1/+1 counter on this
 * creature." Every player in the game is compared, you included, and a
 * creature attacking a planeswalker isn't attacking a player (the attack
 * trigger's `defenderLife: "most"`). Not an intervening-if: the counter goes
 * on however life totals change before it resolves. A triggered ability, so
 * a static can grant it (Marchesa, the Black Rose's "other creatures you
 * control have dethrone" is a `grantsTriggered` of this) and each instance
 * triggers on its own (rule 702.105b). Put the printed line in the card's
 * `text` as well.
 */
export const dethrone = (): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self", defenderLife: "most" },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  resolve: null,
  text: "Dethrone",
});

/**
 * Myriad (rule 702.116a): "Whenever this creature attacks, for each opponent
 * other than defending player, you may create a token that's a copy of this
 * creature that's tapped and attacking that player or a planeswalker they
 * control. If one or more tokens are created this way, exile the tokens at
 * end of combat." The defending player is the trigger's `"trigger-player"`
 * (the one it attacks, or who controls the planeswalker it attacks), so the
 * opponents are `"each-other-opponent"`; the "you may" is asked once for each,
 * naming them. Each copy's own target is chosen as it enters where that
 * player has a planeswalker (rule 508.4). The copies were never declared, so
 * their own myriad doesn't trigger (508.3a). A triggered ability, so a static
 * can grant it (Legion Loyalty) and each instance triggers on its own
 * (702.116b). Put the printed line in the card's `text` as well.
 */
export const myriad = (): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: {
    kind: "for-each-player",
    who: "each-other-opponent",
    effect: {
      kind: "may",
      prompt: "Myriad: create a token copy attacking this player?",
      aboutThatPlayer: true,
      effect: {
        kind: "create-token-copy",
        of: "source",
        count: 1,
        tapped: true,
        attacking: { player: "that-player", orTheirPlaneswalker: true },
        exileAtEndOfCombat: true,
      },
    },
  },
  resolve: null,
  text: "Myriad",
});

/**
 * Mobilize N (rule 702.181a): "Whenever this creature attacks, create N 1/1
 * red Warrior creature tokens. Those tokens enter tapped and attacking.
 * Sacrifice them at the beginning of the next end step." Each token's target
 * is its controller's choice, not necessarily what this creature attacks
 * (rule 508.4), and they were never declared (508.3a). `n` may be a live
 * amount (Avenger of the Fallen's "mobilize X"). A triggered ability, so a
 * static can grant it. Put the printed line in the card's `text` as well.
 */
export const mobilize = (n: EffectAmount): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: {
    kind: "create-token",
    token: "Red Warrior Token",
    count: n,
    tapped: true,
    attacking: "choose",
    sacrificeAtEndStep: true,
  },
  resolve: null,
  text: `Mobilize ${typeof n === "number" ? n : "X"}`,
});

/**
 * Station (rule 702.184a): "Tap another untapped creature you control: Put a
 * number of charge counters on this permanent equal to the tapped creature's
 * power. Activate only as a sorcery." The power is read as the ability
 * resolves, as the creature last existed if it has left (the station
 * ruling); a negative one puts nothing on. Tapping for it isn't the
 * creature's own {T}, so a summoning-sick creature can. It makes its card a
 * station card (702.184b), whose printed power and toughness are its station
 * symbol's (`stationBand`). `text` is the printed line, reminder text and all.
 */
export const station = (text: string): ActivatedAbility => ({
  cost: { mana: null, tap: false, tapOthers: { count: 1, filter: { type: "creature" } } },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "charge", amount: { powerOf: "tapped" } },
  resolve: null,
  sorcerySpeed: true,
  station: true,
  text,
});

/**
 * Power-up (rule 702.193a): "Power-up — [Cost]: [Effect]" means "[Cost]:
 * [Effect]. If this permanent entered this turn, this ability's cost is
 * reduced by this permanent's mana cost. Activate this ability only once."
 * No timing restriction of its own. `mana` is the printed cost; the
 * reduction is worked out as it's activated (`Game.poweredUp`). `text` is
 * the printed line, reminder text and all.
 */
export const powerUp = (
  mana: string,
  effect: EffectSpec,
  text: string,
  targets: readonly TargetSpec[] = [],
): ActivatedAbility => ({
  cost: { mana, tap: false },
  targets,
  effect,
  resolve: null,
  powerUp: true,
  text,
});

/**
 * A station symbol (rule 721.2): a static ability giving its permanent what
 * the symbol's striation holds while it has `at` or more charge counters —
 * abilities (721.2a), and with a power/toughness box, being a creature with
 * that base power and toughness in addition to its other types (721.2b:
 * `addTypes: ["creature"]` and `setBasePt`). Counters from anywhere count,
 * proliferate's included, and losing them takes the abilities away.
 *
 * A striation runs to the next station symbol: in Oracle text every line
 * after an "N+ |" line belongs to that symbol, not just the first (Hearthhull's
 * "Whenever you sacrifice a land" is an 8+ ability). A static ability of the
 * striation that reaches other permanents ("Other artifacts you control have
 * …") passes its own `affects`.
 */
export const stationBand = (
  at: number,
  band: Omit<StaticAbility, "affects" | "condition">,
  affects: StaticAbility["affects"] = { scope: "self" },
): StaticAbility => ({
  ...band,
  affects,
  condition: { kind: "source", filter: { counters: { kind: "charge", compare: { op: "gte", n: at } } } },
});

/** Start your engines! (rule 702.179a) as printed, reminder text and all —
 * the card's `text` line beside its `"start-your-engines"` keyword. */
export const START_YOUR_ENGINES_TEXT =
  "Start your engines! (If you have no speed, it starts at 1. It increases once on each of your turns when an opponent loses life. Max speed is 4.)";

/** "As long as you have max speed" (rules 702.178a, 702.179e): speed 4. */
export const MAX_SPEED_CONDITION = { kind: "speed", atLeast: 4 } as const satisfies StaticCondition;

/**
 * Max speed (rule 702.178a): "Max speed — [Ability]" means "As long as your
 * speed is 4, this object has '[Ability]'" — a static ability on the card
 * itself, live while its controller has max speed (702.179e), holding what
 * the ability is: `grantsActivated`, `grantsTriggered`, `grantKeywords` and
 * `grantPt` ("This creature gets +1/+1 and has menace"), a `replacement`
 * (Far Fortune, End Boss), a `costModification` (Racers' Scoreboard). A
 * static ability of the line that reaches other permanents passes its own
 * `affects`. `text` is the printed line, "Max speed — " and all.
 *
 * An ability that works from a graveyard (702.178b — "Max speed — {3},
 * Exile this card from your graveyard: Draw a card") is no static here: the
 * card's `activated` entry with `zone: "graveyard"` and the
 * `MAX_SPEED_CONDITION` as its `condition`, "you" being its owner; "Max speed
 * — You may cast this card from your graveyard" is `castFromGraveyardIf`
 * with the same condition.
 */
export const maxSpeed = (
  band: Omit<StaticAbility, "affects" | "condition">,
  affects: StaticAbility["affects"] = { scope: "self" },
): StaticAbility => ({
  ...band,
  affects,
  condition: MAX_SPEED_CONDITION,
});

/**
 * Affinity for [something] (rule 702.41a): "This spell costs {1} less to
 * cast for each [something] you control" — the card's `selfCostReduction`.
 * `filter` is the something, and is counted among the caster's permanents
 * as the spell is cast: `affinity({ type: "artifact" })` is affinity for
 * artifacts, `affinity({ types: ["artifact", "creature"] })` for artifact
 * creatures. It only ever reduces generic mana (rule 601.2f). Put the
 * printed line in the card's `text` as well.
 */
export const affinity = (filter: CardFilter): NonNullable<CardDefinition["selfCostReduction"]> => ({
  // Unconditional: the always-true gate Blasphemous Act uses.
  condition: { kind: "controls", filter: {}, atLeast: 0 },
  reduceGeneric: { countOf: { ...filter, controlledBy: "you" } },
});

/**
 * "[Spells] you cast have affinity for [something]" — affinity granted to
 * other spells, as a `costModification` static on the permanent that grants
 * it: each spell its controller casts matching `spells` costs {1} less for
 * each permanent matching `filter` they control. Like every static on a
 * permanent it works only while that permanent is on the battlefield, and
 * two grants both apply, as two instances of affinity would (rule 702.41b).
 * A card whose own affinity is printed as well carries `affinity(filter)`
 * beside this.
 */
export const grantAffinity = (spells: CardFilter, filter: CardFilter, text: string): StaticAbility => ({
  affects: { scope: "self" },
  costModification: {
    applies: spells,
    caster: "you",
    reduceGeneric: { countOf: { ...filter, controlledBy: "you" } },
  },
  text,
});

/**
 * Firebending N: "Whenever this creature attacks, add N {R}. This mana lasts
 * until end of combat." A triggered ability, so a static can grant it
 * (`grantsTriggered`) and losing abilities removes it; `amount` may be an
 * amount ("firebending X, where X is this creature's power" is `{ powerOf:
 * "source" }`, read as it resolves). Put the printed line in the card's
 * `text` as well; this is the ability's own.
 */
export const firebending = (amount: EffectAmount, text?: string): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: { kind: "add-mana", mana: "R", amount, untilEndOfCombat: true },
  resolve: null,
  text: text ?? `Firebending ${typeof amount === "number" ? amount : "X"}`,
});

/**
 * Extort (rule 702.101a): "Whenever you cast a spell, you may pay {W/B}. If
 * you do, each opponent loses 1 life and you gain that much life." A
 * triggered ability, so each instance triggers separately. "That much" is
 * the life the opponents actually lost (`lifeLostThisWay`): an opponent who
 * can't lose life gives nothing (Crypt Ghast's ruling).
 */
export const extort = (): TriggeredAbility => ({
  trigger: { on: "cast-spell", who: "you" },
  targets: [],
  effect: {
    kind: "may",
    prompt: "Pay {W/B} to extort?",
    cost: "{W/B}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: 1, who: "each-opponent" },
        { kind: "gain-life", amount: { lifeLostThisWay: true, who: "each-opponent" } },
      ],
    },
  },
  resolve: null,
  text: "Extort",
});

/**
 * Investigate (rule 701.36a): "create a Clue token", `times` over —
 * "investigate twice" is `investigate(2)`. It's a keyword action with no
 * effect of its own beyond the token, so it's written as the `create-token`
 * it is rather than a new effect kind: every token multiplier, stack rule
 * and count-scaling check already reads that. The Clue is an ordinary token
 * with an activated ability, so it's never folded into a token stack.
 */
export const investigate = (times: EffectAmount = 1): EffectSpec => ({
  kind: "create-token",
  token: "Clue Token",
  count: times,
});

/**
 * Learn (rule 701.48a): "You may discard a card. If you do, draw a card. If
 * you didn't discard a card, you may reveal a Lesson card you own from
 * outside the game and put it into your hand." A deck here has no sideboard,
 * so no card a player owns is outside the game (rule 400.11a) and the Lesson
 * half never finds one: learn is the rummage alone (the user's call,
 * 2026-10-20). A Lesson is an ordinary sorcery in the deck. A madness card
 * discarded this way still counts as discarded, so the draw follows.
 */
export const learn = (): EffectSpec => ({
  kind: "may",
  prompt: "Learn: discard a card to draw a card?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "discard", target: "you", amount: 1 },
      { kind: "conditional", condition: { kind: "this-way", what: "discarded" }, then: { kind: "draw", amount: 1 } },
    ],
  },
});

/**
 * The enters trigger "Partner with [name]" carries alongside its deckbuilding
 * half (rule 702.124): "When this creature enters, target player may search
 * their library for a card named [name], reveal it, put it into their hand,
 * then shuffle." Pair it with `pairing: { kind: "partner-with", name }` —
 * the two are one printed keyword, so a card with one has both.
 */
export const partnerWithTrigger = (name: string): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  targets: ["player"],
  // "Target player **may** search": their choice (`each-player-may`, you
  // included), so declining neither searches nor shuffles.
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    prompt: `Search your library for a card named ${name}?`,
    effect: { kind: "search-library", filter: { name }, destination: "hand", min: 0, max: 1, reveal: true },
  },
  resolve: null,
  text:
    `When this creature enters, target player may search their library for a card named ${name}, ` +
    "reveal it, put it into their hand, then shuffle.",
});

/** The `{T}: Add {C}` ability every mana-producing basic land has. */
/**
 * "Equip {N}" (rule 702.6a): "{N}: Attach to target creature you control.
 * Equip only as a sorcery."
 */
export const equip = (cost: string): ActivatedAbility => ({
  cost: { mana: cost, tap: false },
  targets: ["creature-you-control"],
  effect: { kind: "attach", target: 0 },
  resolve: null,
  text: `Equip ${cost}`,
  sorcerySpeed: true,
});

/**
 * Exploit (rule 702.110a): "When this creature enters, you may sacrifice a
 * creature." Goes in `triggered`. The sacrifice is marked, so "when this
 * creature exploits a creature" (702.110b) is an `{ on: "exploits", who:
 * "self" }` trigger — one that fires even when it sacrificed itself.
 */
export const exploit = (): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  targets: [],
  effect: {
    kind: "may",
    prompt: "Exploit: sacrifice a creature?",
    effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1, exploit: true },
  },
  resolve: null,
  text: "Exploit",
});

/**
 * Training (rule 702.149a): "Whenever this creature and at least one other
 * creature with power greater than this creature's power attack, put a +1/+1
 * counter on this creature." Goes in `triggered` (or a `grantsTriggered` /
 * `grant-triggered` for "creatures you control have training" — each
 * instance triggers separately, 702.149b). Its counter is marked, so "whenever
 * this creature trains" (702.149c) is a `{ on: "trains", who: "self" }`
 * trigger.
 */
export const training = (): TriggeredAbility => ({
  trigger: { on: "attacks", who: "self", withGreaterPower: true },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1, training: true },
  resolve: null,
  text: "Training",
});

/**
 * Reconfigure (rule 702.151a): "[Cost]: Attach this permanent to another
 * target creature you control. Activate only as a sorcery" and "[Cost]:
 * Unattach this permanent. Activate only if this permanent is attached to a
 * creature and only as a sorcery." Spread into `activated`. Having it is what
 * lets an Equipment that's a creature equip (301.5c), and attaching one stops
 * it being a creature until it's unattached from that creature (702.151b —
 * the engine's `reconfiguredOnto`, so a reconfigured Equipment that loses its
 * abilities stays attached and not a creature).
 */
export const reconfigure = (cost: string): ActivatedAbility[] => [
  {
    cost: { mana: cost, tap: false },
    targets: [{ kind: "other", of: "creature-you-control" }],
    effect: { kind: "attach", target: 0 },
    resolve: null,
    text: `Reconfigure ${cost}`,
    sorcerySpeed: true,
    reconfigure: "attach",
  },
  {
    cost: { mana: cost, tap: false },
    targets: [],
    condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
    effect: { kind: "unattach", target: "source" },
    resolve: null,
    text: `Reconfigure ${cost}`,
    sorcerySpeed: true,
    reconfigure: "unattach",
  },
];

/**
 * Living weapon (rule 702.92a): "When this Equipment enters, create a 0/0
 * black Phyrexian Germ creature token, then attach this to it." The Germ is
 * attached before state-based actions look at a 0/0 (the rulings); with two
 * made (Doubling Season), the Equipment goes onto one and the other dies. An
 * Equipment that has left the battlefield since, or come back as a new
 * object, attaches to nothing.
 */
export const livingWeapon = (): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Phyrexian Germ Token", count: 1 },
      { kind: "attach", target: "created", attachment: "source" },
    ],
  },
  resolve: null,
  text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)",
});

const HIDEAWAY_COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/**
 * Hideaway N (rule 702.75a): "When this permanent enters, look at the top N
 * cards of your library. Exile one of them face down and put the rest on the
 * bottom of your library in a random order." The card is exiled face down
 * (rule 406.3) and linked to this object (607.2a — `GameObject.exiledWith`):
 * its controller may look at it, and so may anyone who controls the
 * permanent later; its other abilities reach it through
 * {@link playHideawayCard} (or `return-exiled-by-source { linked: "hand" }`).
 * The choice of card is the controller's, a `choose-from-zone` decision
 * (`look-and-choose` with `destination: "exile-face-down"`); one is always
 * exiled, unless the library is empty.
 *
 * `permanent` is the reminder text's word ("land", "enchantment",
 * "creature"). Since the 2022 rules change, hideaway no longer makes the
 * permanent enter tapped: the older cards carry a separate "This land enters
 * tapped." (702.75b) — put that on the card too.
 */
export const hideaway = (n: number, permanent: string): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: n,
    min: 1,
    max: 1,
    destination: "exile-face-down",
    leftover: "bottom-random",
  },
  resolve: null,
  text:
    `Hideaway ${n} (When this ${permanent} enters, look at the top ${HIDEAWAY_COUNT_WORDS[n] ?? n} cards of your ` +
    "library, exile one face down, then put the rest on the bottom in a random order.)",
});

/**
 * Hideaway's payoff: "you may play the exiled card without paying its mana
 * cost" — the card {@link hideaway} exiled with this object (rule 607.2a),
 * cast for free (an alternative cost, rule 118.9) or, a land, played on its
 * controller's own turn with a land play left (rules 305.2a, 305.3). Wrap it
 * in a `conditional` for the card's "if …" — checked as the ability
 * resolves.
 */
export const playHideawayCard = (): EffectSpec => ({
  kind: "cast-now",
  from: "exiled-with-source",
  play: true,
  free: true,
});

/**
 * Outlast (rule 702.107a): "[cost], {T}: Put a +1/+1 counter on this
 * permanent. Activate only as a sorcery." Put the printed "Outlast {cost}"
 * line in `text`.
 */
export const outlast = (cost: string): ActivatedAbility => ({
  cost: { mana: cost, tap: true },
  sorcerySpeed: true,
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  resolve: null,
  text: `Outlast ${cost}`,
});

/**
 * Unearth (rule 702.84a): "[cost]: Return this card from your graveyard to
 * the battlefield. It gains haste. Exile it at the beginning of the next end
 * step. If it would leave the battlefield, exile it instead of putting it
 * anywhere else. Activate only as a sorcery." The card's own ability in the
 * graveyard, whose cost doesn't move it (`staysInZone`): a second activation
 * in response finds it gone, and one exiled or returned in response is a new
 * object that nothing here reaches (rule 400.7). The haste lasts as long as
 * it stays; the "exile instead" replacement follows the permanent
 * (`exileIfItWouldLeave`, as Whip of Erebos); the end-step exile is a delayed
 * trigger. Put the printed "Unearth {cost}" line in `text`.
 */
export const unearth = (cost: string): ActivatedAbility => ({
  cost: { mana: cost, tap: false },
  zone: "graveyard",
  staysInZone: true,
  sorcerySpeed: true,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: "source", exileIfItWouldLeave: true },
      { kind: "grant-keyword", target: "source", keyword: "haste", duration: "permanent" },
      {
        kind: "delayed-trigger",
        at: "next-end-step",
        effect: { kind: "exile", target: "source" },
        text: "Exile the unearthed card.",
      },
    ],
  },
  resolve: null,
  text: `Unearth ${cost}`,
});

export const manaTapAbility = (mana: Color): ActivatedAbility => ({
  cost: { mana: null, tap: true },
  targets: [],
  effect: { kind: "add-mana", mana, amount: 1 },
  resolve: null,
  text: `{T}: Add {${mana}}.`,
});

/**
 * Offspring's trigger (rule 702.175a — Iridescent Vinelasher): "When this
 * permanent enters, if its offspring cost was paid, create a token that's a
 * copy of it, except it's 1/1." Pair it with `kicker: { cost, keyword:
 * "offspring" }`, the optional additional cost. The copy is made even if the
 * creature has left by then, as it last existed (the ruling), and isn't cast,
 * so it makes no offspring of its own.
 */
export const offspringTrigger = (): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  condition: { kind: "self-kicked" },
  targets: [],
  effect: { kind: "create-token-copy", of: "source", count: 1, basePt: [1, 1] },
  resolve: null,
  text: "When this creature enters, if its offspring cost was paid, create a 1/1 token copy of it.",
});

/**
 * A Case's "To solve — [condition]" (rule 719.3a): "At the beginning of your
 * end step, if [condition] and this Case is not solved, this Case becomes
 * solved." Both halves of the "if" are an intervening if, asked as it
 * triggers and again as it resolves (603.4). Its "Solved — [ability]" is an
 * ordinary ability gated on `{ kind: "solved" }` (rule 719.3c): a static's
 * `condition`, an activated ability's `condition`, a triggered ability's
 * `whileCondition` (it must be solved for it to trigger, not to resolve).
 * `text` is the card's "To solve — …" line, reminder included.
 */
export const caseToSolve = (condition: StaticCondition, text: string): TriggeredAbility => ({
  trigger: { on: "step-begins", step: "end", who: "you" },
  condition: { kind: "all", of: [condition, { kind: "not", of: { kind: "solved" } }] },
  targets: [],
  effect: { kind: "solve" },
  resolve: null,
  text,
});

/**
 * Squad's trigger (rule 702.157a — Gary Clone): "When this creature enters,
 * if its squad cost was paid, create a token that's a copy of it for each
 * time its squad cost was paid." Pair it with `kicker: { cost, multi: true,
 * keyword: "squad" }`, the additional cost paid any number of times. The
 * copies are made even if the creature has left by then, as it last existed;
 * they weren't cast, so they make no copies of their own.
 */
export const squadTrigger = (): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  condition: { kind: "self-kicked" },
  targets: [],
  effect: { kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true },
  resolve: null,
  text: "When this creature enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
});

/**
 * Craft (rule 702.167a): "Craft with [materials] [cost]" means "[Cost], Exile
 * this permanent, Exile [materials] from among permanents you control and/or
 * cards in your graveyard: Return this card to the battlefield transformed
 * under its owner's control. Activate only as a sorcery." `text` is the
 * printed keyword line ("Craft with artifact {2}{W}"). The materials stay
 * linked to the permanent it becomes, as cards exiled with it (702.167c).
 */
export const craft = (mana: string, materials: CraftMaterials, text: string): ActivatedAbility => ({
  cost: { mana, tap: false, exileSelf: true, craft: materials },
  sorcerySpeed: true,
  targets: [],
  effect: { kind: "craft-return" },
  resolve: null,
  text,
});

/**
 * Gift on a permanent (rule 702.174b): "When this permanent enters, if its
 * gift cost was paid, [the gift]" — the chosen opponent draws a card,
 * creates a Food, … (`GiftKind`). Pair it with `kicker: GIFT_KICKER`, the
 * optional additional cost. Given even if the permanent has left by the time
 * it resolves, to the opponent its spell promised it to; a token copy of the
 * permanent wasn't promised anything (the ruling).
 */
export const giftTrigger = (gift: GiftKind): TriggeredAbility => ({
  trigger: { on: "enters-battlefield", who: "self" },
  condition: { kind: "self-kicked" },
  targets: [],
  effect: { kind: "gift", gift },
  resolve: null,
  text: `When this permanent enters, if its gift cost was paid, ${GIFT_TEXT[gift]}.`,
});

/** "If you do, [they …]" — what each gift is, for its trigger's text. */
const GIFT_TEXT: Record<GiftKind, string> = {
  card: "the chosen opponent draws a card",
  food: "the chosen opponent creates a Food token",
  treasure: "the chosen opponent creates a Treasure token",
  "tapped-fish": "the chosen opponent creates a tapped 1/1 blue Fish creature token",
  octopus: "the chosen opponent creates an 8/8 blue Octopus creature token",
  "extra-turn": "the chosen opponent takes an extra turn after this one",
};

/** Gift's first ability (rule 702.174a), "as an additional cost to cast this
 * spell, you may choose an opponent": an optional additional cost that costs
 * no mana, under the keyword `gift` — see `CardDefinition.kicker.keyword`.
 * An instant or sorcery spreads `targets` / `effect` for "if the gift was
 * promised" into it; a permanent uses it as is, with `giftTrigger`. */
export const GIFT_KICKER = { cost: "", keyword: "gift" } as const;

/**
 * Ravenous (rule 702.156a — Jacked Rabbit): "This permanent enters with X
 * +1/+1 counters on it" and "When this permanent enters, if X is 5 or more,
 * draw a card." Both read the X its spell was cast with (rule 107.3m), even
 * where a replacement changed how many counters it got (the ruling); entering
 * any other way — a token copy included — X is 0, so no counters and no
 * draw. The draw is an intervening-if (rule 603.4), so it never triggers
 * below 5. Spread `static` into the card's `static` and `triggered` into its
 * `triggered`, and put the "Ravenous (…)" line in the card's `text`.
 */
export const ravenous = (): { readonly static: StaticAbility; readonly triggered: TriggeredAbility } => ({
  static: {
    affects: { scope: "self" },
    replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
    text: "This creature enters with X +1/+1 counters on it.",
  },
  triggered: {
    trigger: { on: "enters-battlefield", who: "self" },
    condition: { kind: "x", compare: { op: "gte", n: 5 } },
    targets: [],
    effect: { kind: "draw", amount: 1 },
    resolve: null,
    text: "If X is 5 or more, draw a card when it enters.",
  },
});

/**
 * Eternalize (rule 702.129a — Fanatic of Rhonas): "[Cost], Exile this card
 * from your graveyard: Create a token that's a copy of it, except it's a 4/4
 * black Zombie [its other creature types] with no mana cost. Eternalize only
 * as a sorcery." The copy is of the card (as printed, not as it last was on
 * the battlefield — the ruling), and the exceptions are its copiable values.
 * `text` is the ability as printed, reminder text included.
 */
export const eternalizeAbility = (cost: string, text: string): ActivatedAbility => ({
  cost: { mana: cost, tap: false },
  zone: "graveyard",
  sorcerySpeed: true,
  targets: [],
  effect: {
    kind: "create-token-copy",
    of: "source",
    count: 1,
    who: "you",
    asCard: true,
    exceptions: { basePt: [4, 4], setColors: ["B"], addSubtypes: ["Zombie"], noManaCost: true },
  },
  resolve: null,
  text,
});

/**
 * Embalm (rule 702.128a — Sacred Cat): "[Cost], Exile this card from your
 * graveyard: Create a token that's a copy of this card, except it's white, it
 * has no mana cost, and it's a Zombie in addition to its other types. Activate
 * only as a sorcery." Eternalize's twin, keeping the card's own size. `text`
 * is the ability as printed, reminder text included.
 */
export const embalmAbility = (cost: string, text: string): ActivatedAbility => ({
  cost: { mana: cost, tap: false },
  zone: "graveyard",
  sorcerySpeed: true,
  targets: [],
  effect: {
    kind: "create-token-copy",
    of: "source",
    count: 1,
    who: "you",
    asCard: true,
    exceptions: { setColors: ["W"], addSubtypes: ["Zombie"], noManaCost: true },
  },
  resolve: null,
  text,
});

/**
 * Evolve (rule 702.100a): "Whenever a creature you control enters, if that
 * creature's power is greater than this creature's power and/or that
 * creature's toughness is greater than this creature's toughness, put a +1/+1
 * counter on this creature." An intervening-if (rule 603.4), so the
 * comparison is made twice: as the creature enters (the trigger's filter —
 * counters it entered with count) and again as the ability resolves (the
 * `conditional`, the entering creature read as it last existed if it has
 * left — the Gyre Sage ruling). Power is compared with power and toughness
 * with toughness, never across. Each instance triggers on its own
 * (702.100d). Put the keyword line in `text`.
 */
export const evolve = (): TriggeredAbility => {
  const bigger: CardFilter = {
    type: "creature",
    anyOf: [
      { power: { op: "gt", n: { amount: { powerOf: "source" } } } },
      { toughness: { op: "gt", n: { amount: { toughnessOf: "source" } } } },
    ],
  };
  return {
    trigger: { on: "enters-battlefield", who: "you-control", filter: bigger },
    targets: [],
    effect: {
      kind: "conditional",
      condition: { kind: "trigger-object", filter: bigger },
      then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
    },
    resolve: null,
    text:
      "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)",
  };
};

/**
 * Increment (rule 702.191a): "Whenever you cast a spell, if this permanent is
 * a creature and the amount of mana spent to cast that spell is greater than
 * this creature's power or this creature's toughness, put a +1/+1 counter on
 * this creature." An intervening-if (the `increment` condition), asked as the
 * spell is cast and again as the ability resolves. Each instance triggers
 * separately (702.191b).
 */
export const increment = (): TriggeredAbility => ({
  trigger: { on: "cast-spell", who: "you" },
  condition: { kind: "increment" },
  targets: [],
  effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
  resolve: null,
  text:
    "Increment (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)",
});

/**
 * The Enduring cycle's (Duskmourn) "When [name] dies, if it was a creature,
 * return it to the battlefield under its owner's control. It's an
 * enchantment. (It's not a creature.)" "If it was a creature" is an
 * intervening-if read as it last existed on the battlefield, which is what
 * stops the loop: it comes back an enchantment, and dies next time as one. It
 * returns *as* an enchantment (`setTypes`), losing its creature types — a
 * "whenever a creature enters" never sees it, an enchantment's enters
 * trigger does. The card follows itself to the graveyard and no further: a
 * token copy has ceased to exist, and a card that has left the graveyard in
 * response stays where it went (rule 400.7).
 */
export const enduringReturn = (name: string): TriggeredAbility => ({
  trigger: { on: "dies", who: "self" },
  condition: { kind: "source", filter: { type: "creature" } },
  targets: [],
  effect: { kind: "put-onto-battlefield", target: "trigger-object", setTypes: ["enchantment"] },
  resolve: null,
  text: `When ${name} dies, if it was a creature, return it to the battlefield under its owner's control. It's an enchantment. (It's not a creature.)`,
});

/**
 * "{B}: Regenerate this creature." (rule 701.15a — Mortivore) — `mana` is the
 * cost as printed. `text` is the ability as the card prints it, reminder text
 * included where it has one.
 */
export const regenerateSelfAbility = (mana: string, text: string): ActivatedAbility => ({
  cost: { mana, tap: false },
  targets: [],
  effect: { kind: "regenerate", target: "source" },
  resolve: null,
  text,
});

/**
 * A `{T}: Add …` mana ability for a rock or utility land — `mana` may be a
 * concrete type or `"any-color"` (Arcane Signet, Command Tower, Treasure),
 * `amount` defaults to 1, and `sacrifice: "self"` makes it a Treasure-style
 * one-shot ("{T}, Sacrifice this: …").
 */
export const addManaAbility = (opts: {
  mana: ManaType | "any-color" | "commander-identity";
  amount?: number;
  sacrifice?: "self";
  text: string;
}): ActivatedAbility => ({
  cost: {
    mana: null,
    tap: true,
    ...(opts.sacrifice === undefined ? {} : { sacrifice: opts.sacrifice }),
  },
  targets: [],
  effect: { kind: "add-mana", mana: opts.mana, amount: opts.amount ?? 1 },
  resolve: null,
  text: opts.text,
});

/**
 * The unconditional "~ enters the battlefield tapped" self-replacement most
 * nonbasic lands carry (Grovewatch Hollow, the temples, the trilands).
 */
export const entersTappedStatic = (name: string): StaticAbility => ({
  affects: { scope: "self" },
  replacement: { event: "enters-battlefield", tapped: true },
  text: `${name} enters the battlefield tapped.`,
});

/** "a Mountain" / "an Island" — the indefinite article for a land-type word. */
const withArticle = (word: string): string =>
  `${/^[AEIOU]/.test(word) ? "an" : "a"} ${word}`;

const BASIC_LAND_MANA: Readonly<Record<string, Color>> = {
  Plains: "W",
  Island: "U",
  Swamp: "B",
  Mountain: "R",
  Forest: "G",
};

/**
 * The "~ enters the battlefield tapped unless you control [one of these basic
 * land types]" self-replacement of the check-land cycle (Rootbound Crag,
 * Sulfur Falls, Hinterland Harbor).
 */
export const checkLandStatic = (
  name: string,
  landTypes: readonly [string, string],
): StaticAbility => ({
  affects: { scope: "self" },
  replacement: {
    event: "enters-battlefield",
    tappedUnless: { kind: "controls", filter: { subtypes: landTypes }, atLeast: 1 },
  },
  text: `${name} enters the battlefield tapped unless you control ${withArticle(
    landTypes[0],
  )} or ${withArticle(landTypes[1])}.`,
});

/**
 * A "shock land" (Blood Crypt, Overgrown Tomb, Stomping Ground): "As ~ enters
 * the battlefield, you may pay 2 life. If you don't, it enters tapped." Typed
 * with its two basic land types, so it also taps for both colours and counts
 * for a check land. Raised as a `pay-life-for-untapped` decision.
 */
export const shockLand = (
  name: string,
  landTypes: readonly [string, string],
): CardDefinition => {
  const colors = landTypes.map((t) => BASIC_LAND_MANA[t]).filter((c): c is Color => c !== undefined);
  return defineCard({
    name,
    types: ["land"],
    subtypes: [...landTypes],
    text:
      `As ${name} enters the battlefield, you may pay 2 life. ` +
      `If you don't, ${name} enters the battlefield tapped.\n` +
      `({T}: Add ${landTypes.map((t) => `{${BASIC_LAND_MANA[t]}}`).join(" or ")}.)`,
    static: [
      {
        affects: { scope: "self" },
        replacement: { event: "enters-battlefield", mayPayLife: 2 },
        text: `As ${name} enters the battlefield, you may pay 2 life. If you don't, ${name} enters the battlefield tapped.`,
      },
    ],
    activated: colors.map((c) => manaTapAbility(c)),
  });
};

/**
 * A "reveal land" (Port Town, Game Trail, Foreboding Ruins, Fortified
 * Village): "As ~ enters, you may reveal a [type] or [type] card from your
 * hand. If you don't, it enters tapped."
 *
 * Unlike a check land, the condition reads your *hand* rather than the
 * battlefield — and unlike a shock land, it isn't typed with the two basic
 * land types, so it doesn't itself turn on a check land. Which card to
 * reveal, or none, is a `reveal-for-untapped` decision.
 */
export const revealLand = (
  name: string,
  landTypes: readonly [string, string],
): CardDefinition => {
  const colors = landTypes
    .map((t) => BASIC_LAND_MANA[t])
    .filter((c): c is Color => c !== undefined);
  return defineCard({
    name,
    types: ["land"],
    text:
      `As ${name} enters, you may reveal ${withArticle(landTypes[0])} or ` +
      `${withArticle(landTypes[1])} card from your hand. If you don't, ` +
      `${name} enters tapped.\n` +
      `{T}: Add ${colors.map((c) => `{${c}}`).join(" or ")}.`,
    static: [
      {
        affects: { scope: "self" },
        replacement: {
          event: "enters-battlefield",
          tappedUnlessRevealFromHand: [...landTypes],
        },
        text:
          `As ${name} enters, you may reveal ${withArticle(landTypes[0])} or ` +
          `${withArticle(landTypes[1])} card from your hand. If you don't, ${name} enters tapped.`,
      },
    ],
    activated: colors.map((c) => manaTapAbility(c)),
  });
};

/**
 * A "tap land" — enters tapped, taps for either of two colours (Shivan Oasis,
 * Timber Gorge). `gainLife` adds the "when this enters, you gain 1 life"
 * clause of the common-land life cycle (Kazandu Refuge, Rugged Highlands).
 *
 * Deliberately *not* typed with its two basic land types: these are plain
 * nonbasic lands, so they don't switch on a check land the way a shock or
 * dual land does.
 */
export const tapLand = (
  name: string,
  landTypes: readonly [string, string],
  gainLife = false,
): CardDefinition => {
  const colors = landTypes
    .map((t) => BASIC_LAND_MANA[t])
    .filter((c): c is Color => c !== undefined);
  return defineCard({
    name,
    types: ["land"],
    text:
      `${name} enters tapped.\n` +
      (gainLife ? `When ${name} enters, you gain 1 life.\n` : "") +
      `{T}: Add ${colors.map((c) => `{${c}}`).join(" or ")}.`,
    static: [entersTappedStatic(name)],
    triggered: gainLife
      ? [
          {
            trigger: { on: "enters-battlefield", who: "self" },
            targets: [],
            effect: { kind: "gain-life", amount: 1 },
            resolve: null,
            text: `When ${name} enters, you gain 1 life.`,
          },
        ]
      : [],
    activated: colors.map((c) => manaTapAbility(c)),
  });
};

/**
 * A "Signet" (Azorius Signet, Dimir Signet, Rakdos Signet, …): a `{2}` artifact
 * with "{1}, {T}: Add [two colours]".
 *
 * Net +1 mana and colour-fixing, which is why it has a mana cost of its own —
 * see `ManaOption.genericCost`, the machinery that lets the auto-payer fund it
 * from other sources.
 */
export const signet = (name: string, colors: readonly [Color, Color]): CardDefinition =>
  defineCard({
    name,
    manaCost: "{2}",
    types: ["artifact"],
    text: `{1}, {T}: Add {${colors[0]}}{${colors[1]}}.`,
    activated: [
      {
        cost: { mana: "{1}", tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: { all: colors }, amount: 1 },
        resolve: null,
        text: `{1}, {T}: Add {${colors[0]}}{${colors[1]}}.`,
      },
    ],
  });

/**
 * A "Battlebond land" (Morphic Pool, Sea of Clouds, Training Center, …): a
 * two-colour land that "enters tapped unless you have two or more opponents".
 *
 * Ten cards on one template, and the only reason they weren't authorable is
 * that nothing could ask how many opponents you had — hence the
 * `opponent-count` {@link StaticCondition}. In a Commander pod the condition
 * is usually true, which is the point of the cycle: these are untapped duals
 * in multiplayer and tapped ones in a duel.
 */
export const battlebondLand = (
  name: string,
  colors: readonly [Color, Color],
): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text:
      `${name} enters tapped unless you have two or more opponents.
` +
      `{T}: Add {${colors[0]}} or {${colors[1]}}.`,
    static: [
      {
        affects: { scope: "self" },
        replacement: {
          event: "enters-battlefield",
          tappedUnless: { kind: "opponent-count", atLeast: 2 },
        },
        text: `${name} enters tapped unless you have two or more opponents.`,
      },
    ],
    activated: colors.map((c) => manaTapAbility(c)),
  });

const NUM_WORD: Readonly<Record<number, string>> = { 2: "two", 3: "three", 4: "four" };

/**
 * "~ enters the battlefield tapped unless you control [N] or more [basic lands
 * / other lands]" — Cinder Glade ("two or more basic lands"), Rockfall Vale
 * ("two or more other lands", + a `painIfUntapped` on the card).
 */
/**
 * A "tri-land" (Arcane Sanctum, Nomad Outpost, Savage Lands, …): an untyped
 * land that enters tapped and taps for any one of three colours.
 *
 * Two cycles of five share this shape exactly. Untyped on purpose — unlike
 * {@link tapLand} these carry no basic land types, so nothing else keys off
 * them (a check land doesn't see one as a Swamp).
 */
/**
 * An Odyssey "filter land" (Darkwater Catacombs, Skycloud Expanse, …):
 * "{1}, {T}: Add [two colours]".
 *
 * The same economics as a {@link signet} — net +1 mana and colour-fixing, paid
 * for with generic — so it reaches the auto-payer the same way, as a
 * "converter" the planner funds from ordinary sources and orders last. Not to
 * be confused with the Shadowmoor filter lands (Flooded Grove), whose
 * activation cost is a *hybrid* pip.
 */
export const filterLand = (
  name: string,
  colors: readonly [Color, Color],
): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text: `{1}, {T}: Add {${colors[0]}}{${colors[1]}}.`,
    activated: [
      {
        cost: { mana: "{1}", tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: { all: colors }, amount: 1 },
        resolve: null,
        text: `{1}, {T}: Add {${colors[0]}}{${colors[1]}}.`,
      },
    ],
  });

/**
 * A "Karoo" / bounce land (Azorius Chancery, Gruul Turf, ...): enters tapped,
 * returns a land you control to your hand as it enters, and taps for two mana
 * of its two colours at once.
 *
 * Ten cards on one template. The bounce is a choice made as the trigger
 * resolves, not a target (`choose-permanents`): a shroud land can be
 * returned, and nothing can make the trigger fizzle. The land may return
 * itself, which is what the printed card does when it is your only one.
 */
export const karooLand = (
  name: string,
  colors: readonly [Color, Color],
): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text:
      `${name} enters tapped.
` +
      `When ${name} enters, return a land you control to its owner's hand.
` +
      `{T}: Add {${colors[0]}}{${colors[1]}}.`,
    static: [entersTappedStatic(name)],
    triggered: [
      {
        trigger: { on: "enters-battlefield", who: "self" },
        targets: [],
        effect: {
          kind: "choose-permanents",
          filter: { type: "land", controlledBy: "you" },
          min: 1,
          upTo: 1,
          then: { kind: "return-to-hand", target: 0 },
          prompt: "Return a land you control to its owner's hand",
        },
        resolve: null,
        text: `When ${name} enters, return a land you control to its owner's hand.`,
      },
    ],
    activated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: { all: colors }, amount: 1 },
        resolve: null,
        text: `{T}: Add {${colors[0]}}{${colors[1]}}.`,
      },
    ],
  });

/**
 * A "Triome" (Raugrin Triome, Jetmir's Garden, …): a *typed* tri-land that
 * enters tapped and has cycling {3}.
 *
 * Unlike {@link triLand} these carry all three basic land types, so they feed
 * everything that keys off a type — a check land sees one as a Swamp. The
 * colours are derived from the types for that reason, rather than passed in
 * and allowed to disagree with them.
 */
export const triomeLand = (
  name: string,
  landTypes: readonly [string, string, string],
): CardDefinition => {
  const colors = landTypes
    .map((t) => BASIC_LAND_MANA[t])
    .filter((c): c is Color => c !== undefined);
  return defineCard({
    name,
    types: ["land"],
    subtypes: [...landTypes],
    text: `${name} enters tapped.
Cycling {3}`,
    static: [entersTappedStatic(name)],
    cycling: { cost: "{3}" },
    activated: colors.map((c) => manaTapAbility(c)),
  });
};

export const triLand = (
  name: string,
  colors: readonly [Color, Color, Color],
): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text: `${name} enters tapped.
{T}: Add {${colors[0]}}, {${colors[1]}}, or {${colors[2]}}.`,
    static: [entersTappedStatic(name)],
    activated: colors.map((c) => manaTapAbility(c)),
  });

/**
 * A "fast land" (Blackcleave Cliffs, Seachrome Coast, Spirebluff Canal): "This
 * land enters tapped unless you control two or fewer other lands. {T}: Add
 * {X} or {Y}." The condition leaves the entering land out of the count, as a
 * static's condition does (`ConditionOptions.includeSelf`), so it's "not
 * three or more lands" — its first three land drops come in untapped.
 */
export const fastLand = (name: string, colors: readonly [Color, Color]): CardDefinition => {
  const entry = "This land enters tapped unless you control two or fewer other lands.";
  return defineCard({
    name,
    types: ["land"],
    text: `${entry}
{T}: Add {${colors[0]}} or {${colors[1]}}.`,
    static: [
      {
        affects: { scope: "self" },
        replacement: {
          event: "enters-battlefield",
          tappedUnless: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 3 } },
        },
        text: entry,
      },
    ],
    activated: colors.map((c) => manaTapAbility(c)),
  });
};

/**
 * A "Thriving" land (Thriving Isle, Thriving Heath): enters tapped, and as it
 * enters its controller chooses one of the four colours other than its own;
 * it taps for its own colour or the chosen one. The choice is asked before it
 * moves (rule 614.12 — `askEnterChoice`), like Heraldic Banner's.
 */
export const thrivingLand = (name: string, color: Color): CardDefinition => {
  const others = (["W", "U", "B", "R", "G"] as const).filter((c) => c !== color);
  return defineCard({
    name,
    types: ["land"],
    text:
      `This land enters tapped. As it enters, choose a color other than ${COLOR_WORD[color].toLowerCase()}.
` +
      `{T}: Add {${color}} or one mana of the chosen color.`,
    chooseOnEnter: others,
    static: [
      {
        affects: { scope: "self" },
        replacement: { event: "enters-battlefield", tapped: true },
        text: "This land enters tapped.",
      },
    ],
    activated: [
      manaTapAbility(color),
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: "chosen", amount: 1 },
        resolve: null,
        text: "{T}: Add one mana of the chosen color.",
      },
    ],
  });
};

export const enterTappedUnlessLands = (
  name: string,
  atLeast: number,
  what: "basic" | "any",
): StaticAbility => ({
  affects: { scope: "self" },
  replacement: {
    event: "enters-battlefield",
    tappedUnless: {
      kind: "controls",
      filter: what === "basic" ? { supertype: "basic", type: "land" } : { type: "land" },
      atLeast,
    },
  },
  text: `${name} enters the battlefield tapped unless you control ${
    NUM_WORD[atLeast] ?? atLeast
  } or more ${what === "basic" ? "basic lands" : "other lands"}.`,
});

/**
 * A "{T}, Pay 1 life, Sacrifice ~: Search your library for a [type-A] or
 * [type-B] card, put it onto the battlefield, then shuffle" fetch land
 * (Wooded Foothills, Bloodstained Mire, Verdant Catacombs).
 */
export const fetchLand = (
  name: string,
  landTypes: readonly [string, string],
): CardDefinition => {
  const text = `{T}, Pay 1 life, Sacrifice ${name}: Search your library for ${withArticle(
    landTypes[0],
  )} or ${withArticle(landTypes[1])} card, put it onto the battlefield, then shuffle.`;
  return defineCard({
    name,
    types: ["land"],
    text,
    activated: [
      {
        cost: { mana: null, tap: true, sacrifice: "self", payLife: 1 },
        targets: [],
        effect: {
          kind: "search-library",
          filter: { type: "land", subtypes: landTypes },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
        resolve: null,
        text,
      },
    ],
  });
};

/**
 * The Streets-of-New-Capenna tri-land fetch cycle (Cabaretti Courtyard,
 * Riveteers Overlook, …): "When this land enters, sacrifice it. When you do,
 * search your library for a basic [A], [B], or [C] card, put it onto the
 * battlefield tapped, then shuffle and you gain 1 life."
 *
 * Unlike {@link fetchLand} it is a *trigger*, not an activated ability — the
 * land never taps for mana itself and never sits on the battlefield, so it has
 * no mana abilities at all. The "when you do" reflexive trigger is the
 * `sacrifice-source` effect's `then`, which only runs if the sacrifice
 * actually happened.
 */
export const sacrificeFetchLand = (
  name: string,
  landTypes: readonly [string, string, string],
): CardDefinition => {
  const text =
    `When ${name} enters, sacrifice it. When you do, search your library for a basic ` +
    `${landTypes[0]}, ${landTypes[1]}, or ${landTypes[2]} card, put it onto the ` +
    `battlefield tapped, then shuffle and you gain 1 life.`;
  return defineCard({
    name,
    types: ["land"],
    text,
    triggered: [
      {
        trigger: { on: "enters-battlefield", who: "self" },
        targets: [],
        effect: {
          kind: "sacrifice-source",
          then: {
            kind: "sequence",
            effects: [
              {
                kind: "search-library",
                filter: { type: "land", supertype: "basic", subtypes: landTypes },
                destination: "battlefield",
                // "Search … for a basic land card" is mandatory on the printed
                // card, but a whiff has to be legal, and `min: 0` is how the
                // engine expresses "take one if there is one".
                min: 0,
                max: 1,
                enterTapped: true,
              },
              { kind: "gain-life", amount: 1 },
            ],
          },
        },
        resolve: null,
        text,
      },
    ],
  });
};

/**
 * The Alara "Landscape" cycle (Foreboding, Twisted, Shattered, Seething,
 * Perilous, Tranquil Landscape): "{T}: Add {C}. {T}, Sacrifice this land:
 * Search your library for a basic A, B, or C card, put it onto the
 * battlefield tapped, then shuffle. Cycling {X}{Y}{Z}." `landTypes` in
 * printed order; `cycling` the cost string.
 */
export const landscape = (
  name: string,
  landTypes: readonly [string, string, string],
  cycling: string,
): CardDefinition => {
  const fetchText =
    `{T}, Sacrifice this land: Search your library for a basic ${landTypes[0]}, ${landTypes[1]}, or ${landTypes[2]} card, ` +
    "put it onto the battlefield tapped, then shuffle.";
  return defineCard({
    name,
    types: ["land"],
    text: `{T}: Add {C}.
${fetchText}
Cycling ${cycling} (${cycling}, Discard this card: Draw a card.)`,
    activated: [
      addManaAbility({ mana: "C", text: "{T}: Add {C}." }),
      {
        cost: { mana: null, tap: true, sacrifice: "self" },
        targets: [],
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", subtypes: [...landTypes] },
          destination: "battlefield",
          enterTapped: true,
          min: 0,
          max: 1,
        },
        resolve: null,
        text: fetchText,
      },
    ],
    cycling: { cost: cycling },
  });
};

/**
 * A "pain land" (Karplusan Forest, Shivan Reef, Yavimaya Coast): "{T}: Add
 * {C}." plus "{T}: Add {A} or {B}. ~ deals 1 damage to you." — the coloured
 * tap hurts, the colourless one doesn't. The auto-payer reaches for the
 * painless option first (see `Game.chooseOption`).
 */
export const painLand = (
  name: string,
  colors: readonly [Color, Color],
): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text:
      "{T}: Add {C}.\n" +
      `{T}: Add {${colors[0]}} or {${colors[1]}}. ${name} deals 1 damage to you.`,
    activated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: "C", amount: 1 },
        resolve: null,
        text: "{T}: Add {C}.",
      },
      ...colors.map((c) => ({
        cost: { mana: null, tap: true },
        targets: [],
        effect: {
          kind: "add-mana" as const,
          mana: c,
          amount: 1,
          painToController: 1,
        },
        resolve: null,
        text: `{T}: Add {${c}}. ${name} deals 1 damage to you.`,
      })),
    ],
  });

/**
 * A "scry land" (the Theros temple cycle — Temple of Epiphany, Temple of
 * Silence): enters tapped, scries 1 on the way in, taps for either of two
 * colours.
 */
export const scryLand = (name: string, colors: readonly [Color, Color]): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text:
      `${name} enters the battlefield tapped.\n` +
      `When ${name} enters the battlefield, scry 1.\n` +
      `{T}: Add {${colors[0]}} or {${colors[1]}}.`,
    static: [entersTappedStatic(name)],
    triggered: [
      {
        trigger: { on: "enters-battlefield", who: "self" },
        targets: [],
        effect: { kind: "scry", amount: 1 },
        resolve: null,
        text: `When ${name} enters the battlefield, scry 1.`,
      },
    ],
    activated: colors.map((c) => manaTapAbility(c)),
  });

/**
 * A "slow land" (the Innistrad: Midnight Hunt / Crimson Vow cycle — Shipwreck
 * Marsh, Deserted Beach): "enters tapped unless you control two or more *other*
 * lands". Same shape as `Rockfall Vale` without its pain rider.
 */
export const slowLand = (name: string, colors: readonly [Color, Color]): CardDefinition =>
  defineCard({
    name,
    types: ["land"],
    text:
      `${name} enters the battlefield tapped unless you control two or more other lands.\n` +
      `{T}: Add {${colors[0]}} or {${colors[1]}}.`,
    static: [enterTappedUnlessLands(name, 2, "any")],
    activated: colors.map((c) => manaTapAbility(c)),
  });

/**
 * An original dual land (Underground Sea, Tundra): two basic land types and
 * nothing else — no printed rules text at all, since both mana abilities come
 * from the types.
 */
export const dualLand = (
  name: string,
  landTypes: readonly [string, string],
): CardDefinition => {
  const colors = landTypes
    .map((t) => BASIC_LAND_MANA[t])
    .filter((c): c is Color => c !== undefined);
  return defineCard({
    name,
    types: ["land"],
    subtypes: [...landTypes],
    text: `({T}: Add ${colors.map((c) => `{${c}}`).join(" or ")}.)`,
    activated: colors.map((c) => manaTapAbility(c)),
  });
};

/**
 * An artifact land (Seat of the Synod, Vault of Whispers) — a land that is also
 * an artifact, tapping for one fixed colour.
 */
export const artifactLand = (name: string, produces: Color): CardDefinition =>
  defineCard({
    name,
    types: ["artifact", "land"],
    text: `{T}: Add {${produces}}.`,
    activated: [manaTapAbility(produces)],
  });

/**
 * A "Medallion" (Jet Medallion, Ruby Medallion): a {2} artifact making your
 * spells of one colour cost {1} less.
 */
export const medallion = (name: string, color: Color): CardDefinition => {
  const text = `${colorWord(color)} spells you cast cost {1} less to cast.`;
  return defineCard({
    name,
    manaCost: "{2}",
    types: ["artifact"],
    text,
    static: [
      {
        affects: { scope: "self" },
        costModification: { applies: { colors: [color] }, reduceGeneric: 1 },
        text,
      },
    ],
  });
};

const COLOR_WORD: Readonly<Record<Color, string>> = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
};
const colorWord = (c: Color): string => COLOR_WORD[c];

/**
 * A "Talisman" (Talisman of Dominance, Talisman of Progress, …): a {2} artifact
 * with exactly a pain land's ability set — "{T}: Add {C}." plus "{T}: Add {A} or
 * {B}. ~ deals 1 damage to you." The auto-payer reaches for the painless option
 * first, same as `painLand`.
 */
export const talisman = (name: string, colors: readonly [Color, Color]): CardDefinition =>
  defineCard({
    name,
    manaCost: "{2}",
    types: ["artifact"],
    text:
      "{T}: Add {C}.\n" +
      `{T}: Add {${colors[0]}} or {${colors[1]}}. ${name} deals 1 damage to you.`,
    activated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: "C", amount: 1 },
        resolve: null,
        text: "{T}: Add {C}.",
      },
      ...colors.map((c) => ({
        cost: { mana: null, tap: true },
        targets: [],
        effect: {
          kind: "add-mana" as const,
          mana: c,
          amount: 1,
          painToController: 1,
        },
        resolve: null,
        text: `{T}: Add {${c}}. ${name} deals 1 damage to you.`,
      })),
    ],
  });

/**
 * The Throne of Eldraine land cycle that rewards entering untapped (Mystic
 * Sanctuary, Witch's Cottage, Dwarven Mine, Gingerbread Cabin, Idyllic
 * Grange): a basic land type and its mana, "This land enters tapped unless
 * you control three or more other [type]s", and "When this land enters
 * untapped, [effect]". How it entered is the trigger *event*, so "untapped"
 * is the trigger's filter, read as it enters — tapping it for mana in
 * response doesn't stop the ability, as an intervening-if rechecked on
 * resolution would. "Other" needs nothing: a land's own enters replacement
 * never counts the land.
 */
export const untappedEntryLand = (
  name: string,
  landType: "Plains" | "Island" | "Swamp" | "Mountain" | "Forest",
  trigger: { readonly text: string; readonly targets: readonly TargetSpec[]; readonly effect: EffectSpec },
): CardDefinition => {
  const produces = ({ Plains: "W", Island: "U", Swamp: "B", Mountain: "R", Forest: "G" } as const)[landType];
  const plural = ({ Plains: "Plains", Island: "Islands", Swamp: "Swamps", Mountain: "Mountains", Forest: "Forests" } as const)[
    landType
  ];
  const tappedText = `This land enters tapped unless you control three or more other ${plural}.`;
  return defineCard({
    name,
    types: ["land"],
    subtypes: [landType],
    text: `({T}: Add {${produces}}.)\n${tappedText}\n${trigger.text}`,
    activated: [manaTapAbility(produces)],
    static: [
      {
        affects: { scope: "self" },
        replacement: {
          event: "enters-battlefield",
          tappedUnless: { kind: "controls", filter: { subtype: landType }, atLeast: 3 },
        },
        text: tappedText,
      },
    ],
    triggered: [
      {
        trigger: { on: "enters-battlefield", who: "self", filter: { tapped: false } },
        targets: [...trigger.targets],
        effect: trigger.effect,
        resolve: null,
        text: trigger.text,
      },
    ],
  });
};

/**
 * The Urza's lands — Urza's Tower, Urza's Mine, Urza's Power Plant. "Land —
 * Urza's Tower" is two land types, Urza's and Tower (rule 205.3i), and "{T}:
 * Add {C}. If you control an Urza's Mine and an Urza's Power-Plant, add
 * {C}{C}{C} instead" checks land types, not names (the ruling) — the land
 * itself included, should it have the others' types too. One ability whose
 * amount is decided as it resolves (`ifCondition`), which is also how the
 * auto-payer sizes it: a mana ability can't be a `conditional`.
 */
export const urzaLand = (
  name: string,
  own: string,
  others: readonly [string, string],
  assembled: number,
): CardDefinition => {
  const urzas = (type: string): CardFilter => ({ type: "land", subtype: "Urza's", anyOf: [{ subtype: type }] });
  const colorless = "{C}".repeat(assembled);
  const text = `{T}: Add {C}. If you control an Urza's ${others[0]} and an Urza's ${others[1]}, add ${colorless} instead.`;
  return defineCard({
    name,
    types: ["land"],
    subtypes: ["Urza's", own],
    text,
    activated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: {
          kind: "add-mana",
          mana: "C",
          amount: {
            ifCondition: {
              kind: "all",
              of: [
                { kind: "controls", filter: urzas(others[0]), atLeast: 1 },
                { kind: "controls", filter: urzas(others[1]), atLeast: 1 },
              ],
            },
            then: assembled,
            else: 1,
          },
        },
        resolve: null,
        text,
      },
    ],
  });
};

export const basicLand = (
  name: string,
  subtype: string,
  produces: Color,
): CardDefinition =>
  defineCard({
    name,
    supertypes: ["basic"],
    types: ["land"],
    subtypes: [subtype],
    text: `({T}: Add {${produces}}.)`,
    activated: [manaTapAbility(produces)],
  });

/** A Room's reminder text, the last line of each door's (rule 709.5). */
export const ROOM_REMINDER =
  "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)";

/** "When you unlock this door" (rule 709.5h) — for the door `door` prints
 * it on: as that door is unlocked however it is, entering included. */
export const unlockThisDoor = (door: "left" | "right"): TriggerSpec => ({ on: "door-unlocked", who: "self", door });

/**
 * A Room (rule 709.5) as its whole card, from its two doors' definitions —
 * each door its own file, `split: true` and `faces: [name, left, right]`,
 * typed Enchantment — Room. The whole card is what it is everywhere but the
 * battlefield and the stack (709.4): both names, the combined mana cost and
 * colours, both doors' text; on the battlefield, the permanent with both
 * doors unlocked, so it has both doors' abilities, the left door's first.
 */
export function roomCard(name: string, left: CardDefinition, right: CardDefinition): CardDefinition {
  // The halves' costs written one after the other, as Scryfall does (rule
  // 709.4b: combined — the mana value is their sum either way).
  const manaCost = `${left.manaCost ?? ""}${right.manaCost ?? ""}`;
  const colors = [...new Set([...left.colors, ...right.colors])];
  return defineCard({
    name,
    manaCost,
    colors,
    types: ["enchantment"],
    subtypes: ["Room"],
    text: `${left.text}\n//\n${right.text}`,
    static: [...left.static, ...right.static],
    triggered: [...left.triggered, ...right.triggered],
    activated: [...left.activated, ...right.activated],
    faces: [name, left.name, right.name],
    split: true,
  });
}

/** A Class's reminder text, its first line (rule 716). */
export const CLASS_REMINDER = "(Gain the next level as a sorcery to add its ability.)";

/**
 * A Class level bar (rule 716.2a): "[Cost]: Level N" — "[Cost]: This
 * Class's level becomes N. Activate only if this Class is level N-1 and only
 * as a sorcery." The abilities it adds are `atLevel(level, …)`.
 */
export const classLevel = (level: number, cost: string): ActivatedAbility => ({
  cost: { mana: cost, tap: false },
  sorcerySpeed: true,
  condition: { kind: "class-level", exactly: level - 1 },
  targets: [],
  effect: { kind: "gain-class-level", level },
  resolve: null,
  text: `${cost}: Level ${level}`,
});

/** "As long as this Class is level N or greater, it has [abilities]" (rule
 * 716.2a): each ability gated on the level — a static's condition, a
 * triggered ability's intervening-if (equivalent, since a level never goes
 * down, so one that triggered at level N is at level N still as it
 * resolves) — joined to any condition it already has. */
export function atLevel<T extends StaticAbility | TriggeredAbility>(level: number, ability: T): T {
  const gate: StaticCondition = { kind: "class-level", atLeast: level };
  return {
    ...ability,
    condition: ability.condition === undefined ? gate : { kind: "all", of: [gate, ability.condition] },
  };
}

/** The reminder a preparation card prints after "This creature enters
 * prepared." (rule 722). */
export const PREPARED_REMINDER = "(While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)";

/**
 * "This creature enters prepared." (rule 722.3a) — the card's own entering
 * replacement: it gains the prepared designation as it enters, and its
 * controller makes a copy of its prepare spell (`CardDefinition.prepareSpell`)
 * in exile to cast. `text` is the line as printed, reminder and all.
 */
export const entersPrepared = (text = "This creature enters prepared."): StaticAbility => ({
  affects: { scope: "self" },
  replacement: { event: "enters-battlefield", prepared: true },
  text,
});

/** Storied's printed line, reminder and all (rule 702.195): the keyword
 * itself goes in `keywords` as `"storied"`. */
export const STORIED_TEXT =
  "Storied (If you control three or more artifacts, legendaries, and/or Sagas, you have an enduring story for the rest of the game.)";

/**
 * A Theros God's "As long as your devotion to [colour(s)] is less than N, ~
 * isn't a creature." (rules 700.5, 205.1a): a `"self"` static removing the
 * creature type — and with it the creature type God — while the devotion
 * (the God's own pips included) is under `lessThan`. `text` is the line as
 * printed, reminder and all.
 */
export const godDevotion = (colors: readonly Color[], lessThan: number, text: string): StaticAbility => ({
  affects: { scope: "self" },
  condition: { kind: "devotion", colors, atMost: lessThan - 1 },
  removeTypes: ["creature"],
  text,
});
